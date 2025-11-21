import { Request, Response, NextFunction } from 'express';
import { CinemaService } from './service';
import { CreateCinemaDto, UpdateCinemaDto } from './dto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ApiError } from '../../utils/ApiError';

const cinemaService = new CinemaService();

/**
 * @swagger
 * tags:
 * - name: Cinemas
 * description: API quản lý rạp phim
 *
 * components:
 * schemas:
 * Cinema:
 * type: object
 * required: [id, name, regionId]
 * properties:
 * id: { type: string }
 * name: { type: string }
 * address: { type: string }
 * regionId: { type: string }
 * createdAt: { type: string, format: date-time }
 * updatedAt: { type: string, format: date-time }
 */

/**
 * @swagger
 * /api/cinemas:
 * get:
 * summary: Lấy danh sách tất cả rạp
 * tags: [Cinemas]
 * responses:
 * 200:
 * description: Thành công
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * success: { type: boolean, example: true }
 * message: { type: string, example: Lấy danh sách rạp thành công }
 * data:
 * type: array
 * items:
 * $ref: '#/components/schemas/Cinema'
 */
export const getAllCinemas = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cinemas = await cinemaService.getAllCinemas();
    res.status(200).json({ success: true, message: 'Lấy danh sách rạp thành công', data: cinemas });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/cinemas:
 * post:
 * summary: Tạo rạp mới (Admin)
 * tags: [Cinemas]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/CreateCinemaDto'
 * responses:
 * 201:
 * description: Tạo rạp thành công
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * success: { type: boolean, example: true }
 * message: { type: string, example: Tạo rạp thành công }
 * data:
 * $ref: '#/components/schemas/Cinema'
 * 400:
 * description: Dữ liệu không hợp lệ hoặc Region không tồn tại
 */
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

/**
 * @swagger
 * /api/cinemas/{id}:
 * patch:
 * summary: Cập nhật rạp (Admin)
 * tags: [Cinemas]
 * parameters:
 * - { in: path, name: id, required: true, schema: { type: string } }
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/UpdateCinemaDto'
 * responses:
 * 200:
 * description: Cập nhật rạp thành công
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * success: { type: boolean, example: true }
 * message: { type: string, example: Cập nhật rạp thành công }
 * data:
 * $ref: '#/components/schemas/Cinema'
 * 400:
 * description: Dữ liệu không hợp lệ
 * 404:
 * description: Không tìm thấy rạp
 */
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

/**
 * @swagger
 * /api/cinemas/{id}:
 * delete:
 * summary: Xóa rạp (Admin)
 * tags: [Cinemas]
 * parameters:
 * - { in: path, name: id, required: true, schema: { type: string } }
 * responses:
 * 200:
 * description: Xóa rạp thành công
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * success: { type: boolean, example: true }
 * message: { type: string, example: Xóa rạp thành công }
 * 400:
 * description: Không thể xóa rạp đang có suất chiếu
 * 404:
 * description: Không tìm thấy rạp
 */
export const deleteCinema = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    await cinemaService.deleteCinema(id);
    res.status(200).json({ success: true, message: 'Xóa rạp thành công' });
  } catch (error) {
    next(error);
  }
};