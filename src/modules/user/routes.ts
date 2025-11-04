import { Router } from "express";
import { getUser, updateUser, getBookings } from "./controller";
import { auth } from "../../middleware/auth";

const router = Router();

// bảo vệ bằng JWT
router.get("/:id", auth, getUser);
router.put("/:id", auth, updateUser);
router.get("/:id/bookings", auth, getBookings);

export default router;
