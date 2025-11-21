import { Request, Response, NextFunction } from 'express';
import { RegionService } from './service';
import { CreateRegionDto, UpdateRegionDto } from './dto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ApiError } from '../../utils/ApiError';

const regionService = new RegionService();

export const getAllRegions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const regions = await regionService.getAllRegions();
    res.status(200).json({
      success: true,
      message: 'Lấy danh sách khu vực thành công',
      data: regions,
    });
  } catch (error) {
    next(error);
  }
};

export const createRegion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dto = plainToInstance(CreateRegionDto, req.body);
    const errors = await validate(dto);
    
    if (errors.length > 0) {
      throw new ApiError(400, 'Dữ liệu không hợp lệ', errors);
    }

    const newRegion = await regionService.createRegion(dto);
    res.status(201).json({
      success: true,
      message: 'Tạo khu vực thành công',
      data: newRegion,
    });
  } catch (error) {
    next(error);
  }
};

export const updateRegion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const regionId = req.params.id;
    const dto = plainToInstance(UpdateRegionDto, req.body);
    const errors = await validate(dto, { skipMissingProperties: true });

    if (errors.length > 0) {
      throw new ApiError(400, 'Dữ liệu không hợp lệ', errors);
    }
    
    if (Object.keys(dto).length === 0) {
        throw new ApiError(400, 'Cần ít nhất một trường để cập nhật');
    }

    const updatedRegion = await regionService.updateRegion(regionId, dto);
    res.status(200).json({
      success: true,
      message: 'Cập nhật khu vực thành công',
      data: updatedRegion,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteRegion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const regionId = req.params.id;
    await regionService.deleteRegion(regionId);
    res.status(200).json({
      success: true,
      message: 'Xóa khu vực thành công',
    });
  } catch (error) {
    next(error);
  }
};