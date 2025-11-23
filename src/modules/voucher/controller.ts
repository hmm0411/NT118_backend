import { Request, Response, NextFunction } from 'express';
import { VoucherService } from './service';
import { CreateVoucherDto, ApplyVoucherDto } from './dto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ApiError } from '../../utils/ApiError';

const voucherService = new VoucherService();

/**
 * @swagger
 * tags:
 *   name: Vouchers
 *   description: Quản lý Mã giảm giá
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateVoucherDto:
 *       type: object
 *       required:
 *         - code
 *         - description
 *         - discountType
 *         - discountValue
 *         - minOrderValue
 *         - usageLimit
 *         - validFrom
 *         - validTo
 *       properties:
 *         code:
 *           type: string
 *           example: "TEST50"
 *         description:
 *           type: string
 *           example: "Giảm 50% tối đa 50k"
 *         discountType:
 *           type: string
 *           enum:
 *             - percent
 *             - amount
 *           example: "percent"
 *         discountValue:
 *           type: number
 *           example: 50
 *         maxDiscount:
 *           type: number
 *           example: 50000
 *         minOrderValue:
 *           type: number
 *           example: 100000
 *         usageLimit:
 *           type: number
 *           example: 100
 *         validFrom:
 *           type: string
 *           format: date-time
 *         validTo:
 *           type: string
 *           format: date-time
 *     ApplyVoucherDto:
 *       type: object
 *       required:
 *         - code
 *         - orderTotal
 *       properties:
 *         code:
 *           type: string
 *           example: "TEST50"
 *         orderTotal:
 *           type: number
 *           example: 200000
 */

/**
 * @swagger
 * /api/vouchers:
 *   get:
 *     summary: Lấy danh sách voucher còn hạn
 *     tags: [Vouchers]
 *     responses:
 *       200:
 *         description: Thành công
 */
export const getActiveVouchers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const vouchers = await voucherService.getActiveVouchers();
    res.status(200).json({ success: true, data: vouchers });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/vouchers:
 *   post:
 *     summary: Tạo voucher mới (Admin)
 *     tags: [Vouchers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateVoucherDto'
 *     responses:
 *       201:
 *         description: Created
 */
export const createVoucher = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dto = plainToInstance(CreateVoucherDto, req.body);
    const errors = await validate(dto);
    if (errors.length > 0) throw new ApiError(400, 'Dữ liệu lỗi', errors);

    const voucher = await voucherService.createVoucher(dto);
    res.status(201).json({ success: true, data: voucher });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/vouchers/apply:
 *   post:
 *     summary: Check thử mã giảm giá (Trước khi đặt vé)
 *     tags: [Vouchers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ApplyVoucherDto'
 *     responses:
 *       200:
 *         description: Trả về số tiền được giảm
 */
export const applyVoucher = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dto = plainToInstance(ApplyVoucherDto, req.body);
    const result = await voucherService.applyVoucher(dto.code, dto.orderTotal);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};