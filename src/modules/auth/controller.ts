import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "../../config/db";
import { env } from "../../config/env";
import { saveOTP, verifyOTP as checkOTP } from "../../utils/otp";

// Step 1: đăng ký thông tin cơ bản
export async function register(req: Request, res: Response): Promise<void> {
    const { name, email, phone, dob } = req.body;

    const [check] = await db.query("SELECT id FROM users WHERE email=? OR phone=?", [email, phone]);
    if ((check as any[]).length > 0) {
        res.status(400).json({ success: false, message: "Email or phone already exists" });
        return;
    }

    const [result] = await db.query(
        "INSERT INTO users (name, email, phone, dob, verified) VALUES (?, ?, ?, ?, ?)",
        [name, email, phone, dob, false]
    );

    const userId = (result as any).insertId;
    res.json({ success: true, userId });
}

// Step 2: đặt mật khẩu
export async function setPassword(req: Request, res: Response): Promise<void> {
    const { userId, password } = req.body;

    const hash = await bcrypt.hash(password, 10);
    await db.query("UPDATE users SET password_hash=? WHERE id=?", [hash, userId]);

    res.json({ success: true, message: "Password set" });
}

// Step 3: gửi OTP
export async function sendOTP(req: Request, res: Response): Promise<void> {
    const { phone } = req.body;
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    await saveOTP(phone, code);
    console.log("OTP for", phone, "is", code);

    res.json({ success: true, message: "OTP sent" });
}

// Step 4: verify OTP
export async function verifyOTP(req: Request, res: Response): Promise<void> {
    const { phone, code } = req.body;
    const ok = await checkOTP(phone, code);

    if (!ok) {
        res.status(400).json({ success: false, message: "Invalid OTP" });
        return;
    }

    await db.query("UPDATE users SET verified=? WHERE phone=?", [true, phone]);
    res.json({ success: true, message: "Phone verified" });
}

// Login
export async function login(req: Request, res: Response): Promise<void> {
    const { emailOrPhone, password } = req.body;

    const [rows] = await db.query("SELECT * FROM users WHERE email=? OR phone=?", [emailOrPhone, emailOrPhone]);
    const user = (rows as any[])[0];
    if (!user) {
        res.status(400).json({ success: false, message: "User not found" });
        return;
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
        res.status(401).json({ success: false, message: "Wrong password" });
        return;
    }

    const token = jwt.sign({ id: user.id, email: user.email }, env.jwtSecret, { expiresIn: env.jwtExpires });
    res.json({ success: true, token, user });
}
