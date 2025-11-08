import { Request, Response, NextFunction } from 'express';
import * as bookingService from './service';
import { CreateBookingDto } from './dto';

/**
 * @swagger
 * tags:
 *   - name: Booking
 *     description: API quản lý đặt vé xem phim
 *
 * components:
 *   schemas:
 *     Booking:
 *       type: object
 *       required:
 *         - id
 *         - userId
 *         - showtimeId
 *         - seats
 *         - totalPrice
 *         - status
 *         - createdAt
 *       properties:
 *         id:
 *           type: string
 *         userId:
 *           type: string
 *         showtimeId:
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
 *         createdAt:
 *           type: string
 *           format: date-time
 *       example:
 *         id: "bk123xyz"
 *         userId: "uid_123"
 *         showtimeId: "st456abc"
 *         seats: ["A1", "A2"]
 *         totalPrice: 180000
 *         status: "pending"
 *         createdAt: "2025-11-07T08:30:00Z"
 *
 *     CreateBookingDto:
 *       type: object
 *       required:
 *         - showtimeId
 *         - seats
 *         - totalPrice
 *       properties:
 *         showtimeId:
 *           type: string
 *           example: "st456abc"
 *         seats:
 *           type: array
 *           items:
 *             type: string
 *           example: ["A1", "A2"]
 *         totalPrice:
 *           type: number
 *           example: 180000
 */

/**
 * @swagger
 * /api/booking:
 *   post:
 *     summary: Tạo đơn đặt vé mới
 *     description: Người dùng gửi thông tin đặt vé (suất chiếu, ghế, giá tiền). Mặc định trạng thái là `pending`.
 *     tags: [Booking]
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
 *         description: Tạo đơn đặt vé thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Tạo đơn đặt vé thành công
 *                 data:
 *                   $ref: '#/components/schemas/Booking'
 *       401:
 *         description: Thiếu token hoặc không hợp lệ
 */
export const handleCreateBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.uid; // lấy từ middleware auth firebase
    const body: CreateBookingDto = req.body;

    const booking = await bookingService.createBooking({
      userId,
      showtimeId: body.showtimeId,
      seats: body.seats,
      totalPrice: body.totalPrice,
      status: 'pending',
      createdAt: new Date(),
    });

    res.status(201).json({
      success: true,
      message: 'Tạo đơn đặt vé thành công',
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/booking:
 *   get:
 *     summary: Lấy danh sách vé đã đặt của người dùng
 *     description: Trả về danh sách các đơn đặt vé thuộc về người dùng hiện tại.
 *     tags: [Booking]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Lấy danh sách vé của người dùng thành công
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Booking'
 *       401:
 *         description: Thiếu token hoặc không hợp lệ
 */
export const handleGetUserBookings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.uid;
    const bookings = await bookingService.getBookingsByUser(userId);
    res.status(200).json({
      success: true,
      message: 'Lấy danh sách vé của người dùng thành công',
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};
