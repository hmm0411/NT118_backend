// src/modules/auth/controller.ts
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "../../config/env";
import { firebaseDB } from "../../config/firebase";
import { saveOTP, verifyOTP as checkOTP } from "../../utils/otp";

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: API quản lý đăng ký, đăng nhập, OTP
 *
 * components:
 *   schemas:
 *     RegisterDto:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - phone
 *       properties:
 *         name:
 *           type: string
 *           example: "Nguyen Hoang Loc"
 *         email:
 *           type: string
 *           example: "nt118@example.com"
 *         phone:
 *           type: string
 *           example: "0999999912"
 *         dob:
 *           type: string
 *           format: date
 *           example: "1990-01-01"
 *     SetPasswordDto:
 *       type: object
 *       required:
 *         - userId
 *         - password
 *       properties:
 *         userId:
 *           type: string
 *           example: "abc123xyz"
 *         password:
 *           type: string
 *           example: "12345678"
 *     SendOTPDto:
 *       type: object
 *       required:
 *         - phone
 *       properties:
 *         phone:
 *           type: string
 *           example: "0999999912"
 *     VerifyOTPDto:
 *       type: object
 *       required:
 *         - phone
 *         - code
 *       properties:
 *         phone:
 *           type: string
 *           example: "0999999912"
 *         code:
 *           type: string
 *           example: "123456"
 *     LoginDto:
 *       type: object
 *       required:
 *         - emailOrPhone
 *         - password
 *       properties:
 *         emailOrPhone:
 *           type: string
 *           example: "nt118@example.com"
 *         password:
 *           type: string
 *           example: "112233"
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Đăng ký user mới
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterDto'
 *     responses:
 *       200:
 *         description: User đăng ký thành công
 */
export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { name, email, phone, dob } = req.body;

    if (!name || !email || !phone) {
      res.status(400).json({ success: false, message: "Missing required fields" });
      return;
    }

    const usersRef = firebaseDB.collection("users");
    const [emailSnap, phoneSnap] = await Promise.all([
      usersRef.where("email", "==", email).get(),
      usersRef.where("phone", "==", phone).get(),
    ]);

    if (!emailSnap.empty || !phoneSnap.empty) {
      res.status(400).json({ success: false, message: "Email or phone already exists" });
      return;
    }

    const userRef = await usersRef.add({
      name,
      email,
      phone,
      dob: dob || null,
      verified: false,
      createdAt: new Date().toISOString(),
    });

    res.json({ success: true, userId: userRef.id, message: "User registered. Please set password." });
  } catch (error: any) {
    console.error("Register error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * @swagger
 * /api/auth/set-password:
 *   post:
 *     summary: Đặt mật khẩu cho user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SetPasswordDto'
 */
export async function setPassword(req: Request, res: Response): Promise<void> {
  try {
    const { userId, password } = req.body;

    if (!userId || !password) {
      res.status(400).json({ success: false, message: "Missing userId or password" });
      return;
    }

    const hash = await bcrypt.hash(password, 10);
    await firebaseDB.collection("users").doc(userId).update({
      passwordHash: hash,
      updatedAt: new Date().toISOString(),
    });

    res.json({ success: true, message: "Password set successfully" });
  } catch (error: any) {
    console.error("Set password error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * @swagger
 * /api/auth/send-otp:
 *   post:
 *     summary: Gửi OTP đến số điện thoại
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SendOTPDto'
 */
export async function sendOTP(req: Request, res: Response): Promise<void> {
  try {
    const { phone } = req.body;
    if (!phone) {
      res.status(400).json({ success: false, message: "Phone required" });
      return;
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await saveOTP(phone, code);

    console.log(`OTP for ${phone} = ${code}`);
    res.json({ success: true, message: "OTP sent successfully" });
  } catch (error: any) {
    console.error("Send OTP error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * @swagger
 * /api/auth/verify-otp:
 *   post:
 *     summary: Xác thực OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VerifyOTPDto'
 */
export async function verifyOTP(req: Request, res: Response): Promise<void> {
  try {
    const { phone, code } = req.body;
    if (!phone || !code) {
      res.status(400).json({ success: false, message: "Phone and code required" });
      return;
    }

    const isValid = await checkOTP(phone, code);
    if (!isValid) {
      res.status(400).json({ success: false, message: "Invalid or expired OTP" });
      return;
    }

    const usersRef = firebaseDB.collection("users");
    const snap = await usersRef.where("phone", "==", phone).limit(1).get();

    if (snap.empty) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    await snap.docs[0].ref.update({
      verified: true,
      verifiedAt: new Date().toISOString(),
    });

    res.json({ success: true, message: "Phone verified successfully" });
  } catch (error: any) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Đăng nhập
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginDto'
 */
export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { emailOrPhone, password } = req.body;
    if (!emailOrPhone || !password) {
      res.status(400).json({ success: false, message: "Missing credentials" });
      return;
    }

    const usersRef = firebaseDB.collection("users");
    let userSnap = await usersRef.where("email", "==", emailOrPhone).limit(1).get();

    if (userSnap.empty) {
      userSnap = await usersRef.where("phone", "==", emailOrPhone).limit(1).get();
    }

    if (userSnap.empty) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    const userDoc = userSnap.docs[0];
    const userData = userDoc.data();

    if (!userData.passwordHash) {
      res.status(400).json({ success: false, message: "Password not set" });
      return;
    }

    const isMatch = await bcrypt.compare(password, userData.passwordHash);
    if (!isMatch) {
      res.status(401).json({ success: false, message: "Incorrect password" });
      return;
    }

    const token = jwt.sign(
      {
        id: userDoc.id,
        email: userData.email,
        phone: userData.phone,
      },
      env.jwtSecret,
      { expiresIn: env.jwtExpires }
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: userDoc.id,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        verified: userData.verified,
      },
    });
  } catch (error: any) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}
