import { Router } from "express";
import { register, login, setPassword, sendOTP, verifyOTP } from "./controller";

const router = Router();

// router.post("/register", async (req, res, next) => {
//     try {
//         const result = await register(req.body);
//         res.json({ success: true, ...result });
//     } catch (err: any) {
//         res.status(err.status || 500).json({ success: false, message: err.message });
//     }
// });

// router.post("/login", async (req, res, next) => {
//     try {
//         const result = await login(req.body);
//         res.json({ success: true, ...result });
//     } catch (err: any) {
//         res.status(err.status || 500).json({ success: false, message: err.message });
//     }
// });
//Step 1: đăng ký route cho đăng ký người dùng
router.post("/register", (req, res) => { register(req, res); });

// Step 2: đặt mật khẩu
router.post("/set-password", (req, res) => { setPassword(req, res); });

// Step 3: gửi OTP
router.post("/send-otp", (req, res) => { sendOTP(req, res); });

// Step 4: verify OTP
router.post("/verify-otp", (req, res) => { verifyOTP(req, res); });

// Login
router.post("/login", (req, res) => { login(req, res); });

export default router;
