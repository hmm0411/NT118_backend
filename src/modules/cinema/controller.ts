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
 *   name: Cinemas
 *   description: Quản lý Rạp chiếu phim
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Cinema:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "cinema_cgv_vincom"
 *         name:
 *           type: string
 *           example: "CGV Vincom Đồng Khởi"
 *         address:
 *           type: string
 *           example: "72 Lê Thánh Tôn, Quận 1"
 *         regionId:
 *           type: string
 *           example: "region_hcm_123"
 *         createdAt:
 *           type: string
 *           format: date-time
 *     CreateCinemaDto:
 *       type: object
 *       required:
 *         - name
 *         - address
 *         - regionId
 *       properties:
 *         name:
 *           type: string
 *           example: "Lotte Cinema Gò Vấp"
 *         address:
 *           type: string
 *           example: "242 Nguyễn Văn Lượng, Gò Vấp"
 *         regionId:
 *           type: string
 *           description: ID của khu vực (Region)
 *           example: "region_hcm_123"
 *     UpdateCinemaDto:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         address:
 *           type: string
 *         regionId:
 *           type: string
 */

/**
 * @swagger
 * /api/cinemas:
 *   get:
 *     summary: Lấy danh sách rạp (Hỗ trợ lọc theo Tỉnh)
 *     description: API này thường được dùng sau khi user chọn Tỉnh để hiển thị các rạp tương ứng.
 *     tags: [Cinemas]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: regionId
 *         schema:
 *           type: string
 *         description: (Optional) ID của Tỉnh/Thành phố để lọc rạp
 *         example: "region_hcm_123"
 *     responses:
 *       200:
 *         description: Thành công
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
 *                     $ref: '#/components/schemas/Cinema'
 */
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

/**
 * @swagger
 * /api/cinemas:
 *   post:
 *     summary: Tạo rạp mới (Admin)
 *     tags: [Cinemas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCinemaDto'
 *     responses:
 *       201:
 *         description: Tạo thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Cinema'
 *       400:
 *         description: Region ID không tồn tại
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
 *   patch:
 *     summary: Cập nhật thông tin rạp (Admin)
 *     tags: [Cinemas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCinemaDto'
 *     responses:
 *       200:
 *         description: Cập nhật thành công
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
 *   delete:
 *     summary: Xóa rạp (Admin)
 *     tags: [Cinemas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Xóa thành công
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