import { Router } from "express";
import { getBookingsByUser } from "./controller";

const router = Router();

// GET /api/users/:userId/bookings
router.get("/:userId/bookings", getBookingsByUser);

export default router;
