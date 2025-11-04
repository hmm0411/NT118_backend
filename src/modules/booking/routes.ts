import { Router } from "express";
import * as controller from "./controller";
import { auth } from "../../middleware/auth";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Booking
 *   description: API quản lý đặt vé phim
 */

/**
 * @swagger
 * /api/booking/showtimes:
 *   get:
 *     summary: Lấy danh sách suất chiếu hiện có
 *     tags: [Booking]
 *     responses:
 *       200:
 *         description: Danh sách suất chiếu được trả về
 */
router.get("/showtimes", controller.getShowtimes);

/**
 * @swagger
 * /api/booking/showtimes/{id}:
 *   get:
 *     summary: Lấy chi tiết một suất chiếu
 *     tags: [Booking]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của suất chiếu
 *     responses:
 *       200:
 *         description: Thông tin chi tiết của suất chiếu
 */
router.get("/showtimes/:id", controller.getShowtimeDetail);

/**
 * @swagger
 * /api/booking:
 *   post:
 *     summary: Tạo mới một booking (đặt vé)
 *     tags: [Booking]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               showtimeId:
 *                 type: string
 *                 example: "abc123"
 *               seats:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["A1", "A2"]
 *               paymentMethod:
 *                 type: string
 *                 example: "momo"
 *     responses:
 *       200:
 *         description: Booking được tạo thành công
 *       401:
 *         description: Chưa đăng nhập
 */
router.post("/", auth, controller.createBooking);

/**
 * @swagger
 * /api/booking/confirm:
 *   post:
 *     summary: Xác nhận thanh toán booking
 *     tags: [Booking]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bookingId:
 *                 type: string
 *                 example: "b12345"
 *               paymentId:
 *                 type: string
 *                 example: "p6789"
 *               status:
 *                 type: string
 *                 enum: [success, failed]
 *     responses:
 *       200:
 *         description: Thanh toán được xác nhận
 */
router.post("/confirm", controller.confirmPayment);

/**
 * @swagger
 * /api/booking/my:
 *   get:
 *     summary: Lấy danh sách vé đã đặt của người dùng hiện tại
 *     tags: [Booking]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách vé đã đặt của user
 *       401:
 *         description: Chưa đăng nhập
 */
router.get("/my", auth, controller.getMyBookings);

/**
 * @swagger
 * /api/booking/{id}:
 *   delete:
 *     summary: Hủy một booking
 *     tags: [Booking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của booking cần hủy
 *     responses:
 *       200:
 *         description: Hủy vé thành công
 *       401:
 *         description: Chưa đăng nhập
 */
router.delete("/:id", auth, controller.cancelBooking);

export default router;
