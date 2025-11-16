import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { env } from '../config/env';

/**
 * Middleware xử lý lỗi tập trung.
 * Bất cứ khi nào controller gọi `next(error)`, nó sẽ đi về đây.
 */
export const errorMiddleware = (err: Error, req: Request, res: Response, next: NextFunction) => {
  // Mặc định lỗi 500
  let statusCode = 500;
  let message = 'Lỗi máy chủ nội bộ';
  let errors: any = undefined;

  // Nếu là lỗi ApiError (lỗi chủ động từ service)
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors; // Lấy cả các lỗi validation (nếu có)
  }

  // Chỉ log lỗi 500 (lỗi ngoài ý muốn)
  if (statusCode === 500) {
    console.error(err);
  }

  // Gửi response lỗi về cho client
  res.status(statusCode).json({
    success: false,
    message,
    errors: errors, // Gửi chi tiết lỗi (ví dụ: lỗi validation)
    // Chỉ gửi stack trace khi ở môi trường development
    stack: env.nodeEnv === 'development' ? err.stack : undefined,
  });
};