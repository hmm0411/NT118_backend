// src/modules/booking/controller.ts

import { Request, Response, NextFunction } from 'express';
import * as bookingService from './service';
import { CreateBookingDto } from './dto';

/**
 * @swagger
 * tags:
 *   - name: Bookings
 *     description: API quản lý đặt vé
 *
 * components:
 *   schemas:
 *     CreateBookingDto:
 *       type: object
 *       required:
 *         - sessionId
 *         - showtime
 *         - seats
 *         - totalPrice
 *       properties:
 *         sessionId:
 *           type: string
 *         showtime:
 *           type: string
 *           description: Suất chiếu (ví dụ "09:00")
 *         seats:
 *           type: array
 *           items:
 *             type: string
 *           example: ["A1", "A2"]
 *         totalPrice:
 *           type: number
 *           example: 150000
 *
 *     Booking:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         userId:
 *           type: string
 *         sessionId:
 *           type: string
 *         showtime:
 *           type: string
 *         seats:
 *           type: array
 *           items:
 *             type: string
 *         totalPrice:
 *           type: number
 *         status:
 *           type: string
 *           enum: [pending, paid, cancelled]
 *           example: "pending"
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: "Ghế A1 đã được người khác đặt."
 *
 *
 * /api/booking:
 *   post:
 *     summary: Tạo một booking mới
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateBookingDto'
 *     responses:
 *       201:
 *         description: Tạo booking thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Booking'
 *       400:
 *         description: Lỗi nghiệp vụ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Yêu cầu xác thực
 *
 *   get:
 *     summary: Lấy lịch sử đặt vé của người dùng
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách booking của người dùng hiện tại
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Booking'
 *       401:
 *         description: Yêu cầu xác thực
 *
 *
 * /api/booking/{bookingId}:
 *   get:
 *     summary: Lấy chi tiết 1 booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: bookingId
 *         in: path
 *         required: true
 *         description: ID của booking
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chi tiết booking
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Booking'
 *       401:
 *         description: Yêu cầu xác thực
 *       403:
 *         description: Không có quyền truy cập booking này
 *       404:
 *         description: Không tìm thấy booking
 */

export const handleCreateBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body: CreateBookingDto = req.body;
    const userId = (req as any).user.uid;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'User không hợp lệ.' });
    }

    const newBooking = await bookingService.createBooking(userId, body);

    res.status(201).json({
      success: true,
      message: 'Tạo booking thành công',
      data: newBooking,
    });
  } catch (error) {
    next(error);
  }
};

export const handleGetMyBookings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.uid;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'User không hợp lệ.' });
    }

    const bookings = await bookingService.getMyBookings(userId);

    res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

export const handleGetBookingById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.uid;
    const { bookingId } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'User không hợp lệ.' });
    }

    const booking = await bookingService.getBookingById(bookingId, userId);

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};
