import { Router } from "express";
import { register, login } from "./controller";

const router = Router();

router.post("/register", async (req, res, next) => {
    try {
        const result = await register(req.body);
        res.json({ success: true, ...result });
    } catch (err: any) {
        res.status(err.status || 500).json({ success: false, message: err.message });
    }
});

router.post("/login", async (req, res, next) => {
    try {
        const result = await login(req.body);
        res.json({ success: true, ...result });
    } catch (err: any) {
        res.status(err.status || 500).json({ success: false, message: err.message });
    }
});

export default router;
