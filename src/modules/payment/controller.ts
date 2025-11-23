import { Request, Response, NextFunction } from 'express'; // 1. Dùng Request thường
import { PaymentService } from './service';
import { ProcessPaymentDto } from './dto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { AuthRequest } from '../../middleware/auth'; // Import để ép kiểu
import { ApiError } from '../../utils/ApiError';

const paymentService = new PaymentService();

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Thanh toán & Xuất vé QR
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ProcessPaymentDto:
 *       type: object
 *       required:
 *         - bookingId
 *         - paymentMethod
 *       properties:
 *         bookingId:
 *           type: string
 *           description: ID của booking đang ở trạng thái pending
 *           example: "booking_123_xyz"
 *         paymentMethod:
 *           type: string
 *           enum: [momo, zalopay, card, simulator]
 *           description: Phương thức thanh toán (hiện tại dùng 'simulator' để test)
 *           example: "simulator"
 *     PaymentResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Thanh toán thành công! Vé của bạn đã sẵn sàng."
 *         bookingId:
 *           type: string
 *           example: "booking_123_xyz"
 *         status:
 *           type: string
 *           example: "paid"
 *         qrCode:
 *           type: string
 *           description: Chuỗi Base64 của hình ảnh QR Code. Frontend có thể hiển thị trực tiếp bằng <img src="...">
 *           example: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg=="
 */

/**
 * @swagger
 * /api/payment:
 *   post:
 *     summary: Xác nhận thanh toán & Xuất vé
 *     description: "API này chuyển trạng thái vé từ PENDING -> PAID và trả về mã QR. Ghế trong rạp sẽ chuyển thành SOLD (màu đỏ)."
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProcessPaymentDto'
 *     responses:
 *       200:
 *         description: Thanh toán thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/PaymentResponse'
 *       400:
 *         description: Lỗi nghiệp vụ (Vé đã thanh toán rồi, vé hết hạn, hoặc sai phương thức)
 *       403:
 *         description: Vé này không phải của bạn
 *       404:
 *         description: Không tìm thấy Booking ID
 */
export const processPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 3. Ép kiểu 'as AuthRequest' để lấy user
    const userId = (req as AuthRequest).user!.uid;
    const dto = plainToInstance(ProcessPaymentDto, req.body);
    const errors = await validate(dto);
    if (errors.length > 0) throw new ApiError(400, 'Dữ liệu không hợp lệ', errors);

    const result = await paymentService.processPayment(userId, dto);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const handleZaloPayWebhook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await paymentService.handleZaloPayCallback(req.body);
    // Phải trả về đúng format ZaloPay yêu cầu
    res.json(result);
  } catch (error) {
    console.error(error);
    // Vẫn trả về 200 hoặc json lỗi để ZaloPay không gọi lại spam
    res.json({ return_code: 0, return_message: "Callback Error" });
  }
};