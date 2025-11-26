import { Request, Response, NextFunction } from 'express';
import { BookingService } from './service';
import { CreateBookingDto } from './dto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { AuthRequest } from '../../middleware/auth'; 
import { ApiError } from '../../utils/ApiError';

const bookingService = new BookingService();

/**
 * @swagger
 * tags:
 *   name: Bookings
 *   description: Quản lý Đặt vé & Giữ ghế
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Booking:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "booking_123_xyz"
 *         userId:
 *           type: string
 *           description: ID người đặt
 *         showtimeId:
 *           type: string
 *           description: ID suất chiếu
 *         movieTitle:
 *           type: string
 *           example: "Mai"
 *         cinemaName:
 *           type: string
 *           example: "CGV Vincom"
 *         roomName:
 *           type: string
 *           example: "Room 01"
 *         showtimeDate:
 *           type: string
 *           format: date-time
 *         seats:
 *           type: array
 *           items:
 *             type: string
 *           example: ["A1", "A2"]
 *         totalPrice:
 *           type: number
 *           example: 180000
 *         status:
 *           type: string
 *           enum: [pending, paid, cancelled, failed]
 *           description: "pending: Đang giữ ghế | paid: Đã thanh toán | cancelled: Hủy/Hết hạn"
 *           example: "pending"
 *         expiresAt:
 *           type: string
 *           format: date-time
 *           description: "Thời gian vé hết hạn giữ chỗ (nếu chưa thanh toán)"
 *         createdAt:
 *           type: string
 *           format: date-time
 *     CreateBookingDto:
 *       type: object
 *       required:
 *         - showtimeId
 *         - seats
 *       properties:
 *         showtimeId:
 *           type: string
 *           description: ID của suất chiếu muốn đặt
 *           example: "showtime_abc_789"
 *         seats:
 *           type: array
 *           description: Danh sách mã ghế muốn giữ
 *           items:
 *             type: string
 *           example: ["A5", "A6"]
 *         voucher:
 *           type: string
 *           description: Mã voucher giảm giá
 *           example: "UUDAI50"
 */

/**
 * @swagger
 * /api/booking:
 *   post:
 *     summary: Tạo Booking (Giữ ghế)
 *     description: "API này dùng transaction để giữ ghế trong 10 phút. Trạng thái ban đầu là 'pending'."
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
 *         description: Giữ ghế thành công
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
 *                   example: "Giữ ghế thành công..."
 *                 data:
 *                   $ref: '#/components/schemas/Booking'
 *       400:
 *         description: Ghế đã có người đặt hoặc dữ liệu không hợp lệ
 *       404:
 *         description: Suất chiếu không tồn tại
 */
export const createBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Ép kiểu lấy user
    const userId = (req as AuthRequest).user!.uid;

    const dto = plainToInstance(CreateBookingDto, req.body);
    const errors = await validate(dto);
    if (errors.length > 0) throw new ApiError(400, 'Dữ liệu không hợp lệ', errors);

    const booking = await bookingService.createBooking(userId, dto);

    res.status(201).json({
      success: true,
      message: 'Giữ ghế thành công, vui lòng thanh toán trong 10 phút',
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
 *     summary: Lấy lịch sử đặt vé của tôi
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách booking (Mới nhất lên đầu)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Booking'
 */
export const getMyBookings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as AuthRequest).user!.uid;
    const bookings = await bookingService.getMyBookings(userId);
    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/booking/{id}:
 *   get:
 *     summary: Lấy chi tiết một booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
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
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Booking'
 *       403:
 *         description: Không có quyền xem booking này
 *       404:
 *         description: Không tìm thấy booking
 */
export const getBookingById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as AuthRequest).user!.uid;
    const { id } = req.params;
    const booking = await bookingService.getBookingById(id, userId);
    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};