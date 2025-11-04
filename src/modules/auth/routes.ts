import { Router } from "express";
import {
    register,
    login,
    setPassword,
    sendOTP,
    verifyOTP,
} from "./controller";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { env } from "../../config/env";
import { firebaseDB } from "../../config/firebase";
import admin from "firebase-admin";

const router = Router();
const client = new OAuth2Client(env.googleClientId || process.env.GOOGLE_CLIENT_ID);

/**
 * ==========================
 * 🔹 GOOGLE LOGIN (ANDROID)
 * ==========================
 */
router.post("/google-mobile", async (req, res) => {
    try {
        const { idToken } = req.body;
        if (!idToken) {
            return res.status(400).json({ success: false, message: "Missing idToken" });
        }

        // Verify Google ID token
        const ticket = await client.verifyIdToken({
            idToken,
            audience: env.googleClientId || process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
            return res.status(401).json({ success: false, message: "Invalid token" });
        }

        const email = payload.email;
        const name = payload.name || "Unknown User";

        // Kiểm tra user đã tồn tại trong Firestore chưa
        const q = await firebaseDB.collection("users").where("email", "==", email).get();

        let user: any;
        if (!q.empty) {
            const doc = q.docs[0];
            user = { id: doc.id, ...doc.data() };
        } else {
            const docRef = await firebaseDB.collection("users").add({
                email,
                name,
                provider: "google",
                provider_id: payload.sub,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            user = { id: docRef.id, email, name };
        }

        // Tạo JWT cho client
        const token = jwt.sign(
            { id: user.id, email: user.email },
            env.jwtSecret,
            { expiresIn: "1d" }
        );

        res.json({ success: true, token, user });
    } catch (err: any) {
        console.error("Google login error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

//Local Auth
router.post("/register", register);
router.post("/set-password", setPassword);
router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);
router.post("/login", login);

// Verify with Firebase ID Token
router.post("/verify-firebase-token", async (req, res) => {
    try {
        const { idToken } = req.body;
        if (!idToken) {
            return res.status(400).json({ success: false, message: "Missing idToken" });
        }

        // Xác minh token với Firebase
        const decoded = await admin.auth().verifyIdToken(idToken);
        const { uid, email, name } = decoded;

        // Kiểm tra hoặc tạo user trong Firestore
        const usersRef = firebaseDB.collection("users");
        const q = await usersRef.where("email", "==", email).limit(1).get();

        let user: any;
        if (!q.empty) {
            const doc = q.docs[0];
            user = { id: doc.id, ...doc.data() };
        } else {
            const docRef = await usersRef.add({
                email,
                name: name || "Android User",
                firebase_uid: uid,
                provider: "firebase",
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            user = { id: docRef.id, email };
        }

        // Tạo JWT backend (tùy chọn, dùng cho các API khác)
        const token = jwt.sign(
            { id: user.id, email: user.email },
            env.jwtSecret,
            { expiresIn: "1d" }
        );

        res.json({
            success: true,
            message: "Firebase token verified",
            user,
            backendToken: token,
        });
    } catch (error: any) {
        console.error("verify-firebase-token error:", error);
        res.status(401).json({ success: false, message: "Invalid Firebase token" });
    }
});

export default router;
