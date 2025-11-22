import { Request, Response, NextFunction } from 'express';
import { RegionService } from './service';
import { CreateRegionDto, UpdateRegionDto } from './dto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ApiError } from '../../utils/ApiError';

const regionService = new RegionService();

/**
 * @swagger
 * tags:
 *   name: Regions
 *   description: Quản lý Tỉnh/Thành phố
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Region:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "region_hcm_123"
 *         name:
 *           type: string
 *           example: "Hồ Chí Minh"
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     CreateRegionDto:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Tên khu vực
 *           example: "Đà Nẵng"
 *     UpdateRegionDto:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Tên khu vực cần sửa
 *           example: "Thành phố Đà Nẵng"
 */

/**
 * @swagger
 * /api/regions:
 *   get:
 *     summary: Lấy danh sách tất cả khu vực
 *     tags: [Regions]
 *     security: []
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
 *                 message:
 *                   type: string
 *                   example: "Lấy danh sách khu vực thành công"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Region'
 */
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

/**
 * @swagger
 * /api/regions:
 *   post:
 *     summary: Tạo khu vực mới (Admin)
 *     tags: [Regions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateRegionDto'
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
 *                   $ref: '#/components/schemas/Region'
 *       400:
 *         description: Tên khu vực đã tồn tại hoặc dữ liệu lỗi
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Không phải Admin)
 */
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

/**
 * @swagger
 * /api/regions/{id}:
 *   patch:
 *     summary: Cập nhật khu vực (Admin)
 *     tags: [Regions]
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
 *             $ref: '#/components/schemas/UpdateRegionDto'
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Region'
 *       404:
 *         description: Không tìm thấy khu vực
 */
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

/**
 * @swagger
 * /api/regions/{id}:
 *   delete:
 *     summary: Xóa khu vực (Admin)
 *     tags: [Regions]
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
 *                   example: "Xóa khu vực thành công"
 *       400:
 *         description: Không thể xóa vì khu vực đang có Rạp
 */
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