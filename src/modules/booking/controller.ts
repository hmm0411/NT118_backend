import { Request, Response, NextFunction } from 'express';
import { BookingService } from './service';
import { CreateBookingDto } from './dto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { AuthRequest } from '../../middleware/auth'; 
import { ApiError } from '../../utils/ApiError';

const bookingService = new BookingService();

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

export const getMyBookings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as AuthRequest).user!.uid;
    const bookings = await bookingService.getMyBookings(userId);
    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    next(error);
  }
};

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