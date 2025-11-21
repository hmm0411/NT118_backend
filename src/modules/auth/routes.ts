import { Router } from "express";
import { loginAndSync } from "./controller";
import { auth } from "../../middleware/auth";

const router = Router();

// Client gửi Header: { Authorization: "Bearer <Firebase_ID_Token>" }
router.post("/login", auth, loginAndSync);

export default router;