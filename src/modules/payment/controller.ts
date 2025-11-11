  import { Request, Response, NextFunction } from 'express';
  import * as paymentService from './service';
  import { CreatePaymentDto } from './dto';
  import * as qr from '../../utils/qrcode';
  import { firebaseAuth, firebaseDB } from '../../config/firebase';

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
      const paymentRef = firebaseDB.collection('payments').doc(body.bookingId);
      await paymentRef.set(
        {
          bookingId: body.bookingId,
          status: 'paid',
          qrCode,
          user: qrPayload.user,
          paidAt: new Date(),
        },
        { merge: true } 
      );

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

  /**
 * @swagger
 * /api/payment/tickets:
 *   get:
 *     summary: Lấy vé điện tử của người dùng (chỉ booking đã thanh toán)
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách vé điện tử
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
 *                     type: object
 *                     properties:
 *                       bookingId:
 *                         type: string
 *                       qrCode:
 *                         type: string
 *                       paidAt:
 *                         type: string
 *                         format: date-time
 */
export const handleGetMyTickets = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userEmail = (req.user as any)?.email;
    if (!userEmail) {
      return res.status(401).json({ success: false, message: 'User không hợp lệ.' });
    }

    const snapshot = await firebaseDB
      .collection('payments')
      .where('user', '==', userEmail)
      .where('status', '==', 'paid')
      .get();

    const tickets = snapshot.docs.map(doc => doc.data());

    res.status(200).json({
      success: true,
      data: tickets,
    });
  } catch (error) {
    next(error);
  }
};
