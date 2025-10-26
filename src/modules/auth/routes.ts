import { Router } from "express";
import { register, login, setPassword, sendOTP, verifyOTP } from "./controller";
import jwt from "jsonwebtoken";
import { db } from "../../config/db";
import { OAuth2Client } from "google-auth-library";
import { env } from "../../config/env";

const router = Router();
const client = new OAuth2Client(process.env.googleClientId);

// ================== GOOGLE LOGIN (ANDROID CLIENT) ==================
router.post("/google-mobile", async (req, res) => {
    try {
        const { idToken } = req.body;
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.googleClientId,
        });

        const payload = ticket.getPayload();
        if (!payload) return res.status(401).json({ success: false, message: "Invalid token" });

        const email = payload.email;
        const name = payload.name;

        const [rows]: any = await db.query("SELECT * FROM users WHERE email = ?", [email]);

        let user: any;
        if (rows.length > 0) {
            user = rows[0];
        } else {
            const [result]: any = await db.query(
                "INSERT INTO users (email, name, provider, provider_id) VALUES (?, ?, ?, ?)",
                [email, name, "google", payload.sub]
            );
            user = { id: result.insertId, email, name };
        }

        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET!, {
            expiresIn: "1d",
        });

        res.json({ success: true, token, user });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// ================== LOCAL AUTH ==================
router.post("/register", (req, res) => { register(req, res); });
router.post("/set-password", (req, res) => { setPassword(req, res); });
router.post("/send-otp", (req, res) => { sendOTP(req, res); });
router.post("/verify-otp", (req, res) => { verifyOTP(req, res); });
router.post("/login", (req, res) => { login(req, res); });

// ================== GOOGLE OAUTH (WEB) ==================
// router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// router.get(
//     "/google/callback",
//     passport.authenticate("google", { session: false }),
//     (req: any, res) => {
//         const token = jwt.sign({ id: req.user.id, email: req.user.email }, process.env.JWT_SECRET!, {
//             expiresIn: "1d",
//         });
//         res.json({ token, user: req.user });
//     }
// );

// // ================== FACEBOOK OAUTH (WEB) ==================
// router.get("/facebook", passport.authenticate("facebook", { scope: ["email"] }));

// router.get(
//     "/facebook/callback",
//     passport.authenticate("facebook", { session: false }),
//     (req: any, res) => {
//         const token = jwt.sign({ id: req.user.id, email: req.user.email }, process.env.JWT_SECRET!, {
//             expiresIn: "1d",
//         });
//         res.json({ token, user: req.user });
//     }
// );

export default router;