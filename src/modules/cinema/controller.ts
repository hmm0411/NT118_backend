import { Request, Response, NextFunction } from 'express';
import { CinemaService } from './service';
import { CreateCinemaDto, UpdateCinemaDto } from './dto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ApiError } from '../../utils/ApiError';

const cinemaService = new CinemaService();

export const getAllCinemas = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Lấy query param ?regionId=...
    const regionId = req.query.regionId as string | undefined;

    const cinemas = await cinemaService.getAllCinemas(regionId);
    
    res.status(200).json({ 
        success: true, 
        message: 'Lấy danh sách rạp thành công', 
        data: cinemas 
    });
  } catch (error) {
    next(error);
  }
};

export const createCinema = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dto = plainToInstance(CreateCinemaDto, req.body);
    const errors = await validate(dto);
    
    if (errors.length > 0) {
      throw new ApiError(400, 'Dữ liệu không hợp lệ', errors);
    }

    const newCinema = await cinemaService.createCinema(dto);
    res.status(201).json({ success: true, message: 'Tạo rạp thành công', data: newCinema });
  } catch (error) {
    next(error);
  }
};

export const updateCinema = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    const dto = plainToInstance(UpdateCinemaDto, req.body);
    const errors = await validate(dto, { skipMissingProperties: true });

    if (errors.length > 0) {
      throw new ApiError(400, 'Dữ liệu không hợp lệ', errors);
    }

    if (Object.keys(dto).length === 0) {
        throw new ApiError(400, 'Cần ít nhất một trường để cập nhật');
    }

    const updatedCinema = await cinemaService.updateCinema(id, dto);
    res.status(200).json({ success: true, message: 'Cập nhật rạp thành công', data: updatedCinema });
  } catch (error) {
    next(error);
  }
};

export const deleteCinema = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    await cinemaService.deleteCinema(id);
    res.status(200).json({ success: true, message: 'Xóa rạp thành công' });
  } catch (error) {
    next(error);
  }
};