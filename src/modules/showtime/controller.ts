import { Request, Response, NextFunction } from 'express';
import { ShowtimeService } from './service';
import { CreateShowtimeDto } from './dto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ApiError } from '../../utils/ApiError';

const showtimeService = new ShowtimeService();

export const getShowtimes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { movieId, regionId, date } = req.query;

    if (!movieId || !regionId) {
      throw new ApiError(400, 'Cần movieId và regionId');
    }

    const data = await showtimeService.getShowtimes(
      movieId as string, 
      regionId as string, 
      date as string
    );
    
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getShowtimeById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const showtime = await showtimeService.getShowtimeById(id);
    
    if (!showtime) throw new ApiError(404, 'Không tìm thấy suất chiếu');

    res.status(200).json({ success: true, data: showtime });
  } catch (error) {
    next(error);
  }
};

export const createShowtime = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dto = plainToInstance(CreateShowtimeDto, req.body);
    const errors = await validate(dto);
    if (errors.length > 0) throw new ApiError(400, 'Dữ liệu lỗi', errors);

    const newShowtime = await showtimeService.createShowtime(dto);
    res.status(201).json({ success: true, message: 'Tạo suất chiếu thành công', data: newShowtime });
  } catch (error) {
    next(error);
  }
};