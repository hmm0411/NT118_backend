import { Request, Response, NextFunction } from 'express';
import * as paymentService from './service';
import { CreatePaymentDto } from './dto';
import * as qr from '../../utils/qrcode';
import { firebaseAuth } from '../../config/firebase';

/**
 * @swagger
 * tags:
 *   - name: Payment
 *     description: API mô phỏng thanh toán đặt vé
 *
 * components:
 *   schemas:
 *     CreatePaymentDto:
 *       type: object
 *       required:
 *         - bookingId
 *       properties:
 *         bookingId: 
 *           type: string
 *           example: "aBc123xyz"
 */

/**
 * @swagger
 * /api/payment:
 *   post:
 *     summary: Giả lập thanh toán cho đơn đặt vé
 *     tags: [Payment]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePaymentDto'
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
 *                 message:
 *                   type: string
 *                   example: Thanh toán thành công
 *                 data:
 *                   type: object
 *                   properties:
 *                     bookingId:
 *                       type: string
 *                       example: aBc123xyz
 *                     status:
 *                       type: string
 *                       example: paid
 */
export const handleMakePayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body: CreatePaymentDto = req.body;
    const result = await paymentService.makePayment(body.bookingId);
    const qrPayload = {
      bookingId: body.bookingId,
      status: 'paid',
      timestamp: new Date().toISOString(),
      user: (req.user as any).email || 'guest@example.com',
    };

    const qrCode = await qr.generate(JSON.stringify(qrPayload));

    res.status(200).json({
      success: true,
      message: 'Thanh toán thành công',
      data: {
        result,
        qrCode,
      },
    });
  } catch (error) {
    next(error);
  }
};
