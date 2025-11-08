// src/middleware/checkBookingFlow.ts
import { Request, Response, NextFunction } from "express";
import * as showtimeService from "../modules/showtime/service";
import * as seatService from "../modules/seat/service";

export async function checkBookingFlow(req: Request, res: Response, next: NextFunction) {
  try {
    const { showtimeId, seats } = req.body;

    const showtime = await showtimeService.getById(showtimeId);
    if (!showtime) {
      return res.status(400).json({ success: false, message: "Suất chiếu không tồn tại" });
    }

    const unavailableSeats = await seatService.findUnavailableSeats(showtimeId, seats);
    if (unavailableSeats.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Các ghế ${unavailableSeats.join(", ")} đã được đặt.`,
      });
    }

    next();
  } catch (error) {
    console.error("checkBookingFlow error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}
