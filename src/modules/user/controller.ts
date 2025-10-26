import { Request, Response } from "express";
import { db } from "../../config/db";

export async function getBookingsByUser(req: Request, res: Response) {
    const { userId } = req.params;

    try {
        const [rows] = await db.query(
            "SELECT * FROM bookings WHERE user_id = ? ORDER BY created_at DESC",
            [userId]
        );
        res.json({ success: true, bookings: rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}