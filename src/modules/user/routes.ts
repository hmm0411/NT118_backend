import { Router } from "express";
import { getUser, updateUser, getBookings, getAllUsers } from "./controller";
import { auth, isAdmin } from "../../middleware/auth";

const router = Router();

// bảo vệ bằng JWT
router.get("/:id", auth, getUser);
router.put("/:id", auth, updateUser);
router.get("/:id/bookings", auth, getBookings);
// Admin-only: get all users
router.get('/', auth, isAdmin, getAllUsers);

export default router;
