import { Request, Response, NextFunction } from 'express'; // 1. Dùng Request thường
import { PaymentService } from './service';
import { ProcessPaymentDto } from './dto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { AuthRequest } from '../../middleware/auth'; // Import để ép kiểu
import { ApiError } from '../../utils/ApiError';

const paymentService = new PaymentService();

// 2. Sửa tham số đầu vào thành 'req: Request'
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