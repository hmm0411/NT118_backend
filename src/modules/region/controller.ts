// src/modules/region/controller.ts

import { Request, Response, NextFunction } from 'express';
import * as regionService from './service';
import { CreateRegionDto, UpdateRegionDto } from './dto';

/**
 * @swagger
 * tags:
 *   - name: Regions
 *     description: API quản lý khu vực
 *
 * components:
 *   schemas:
 *     Region:
 *       type: object
 *       required:
 *         - id
 *         - name
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       example:
 *         id: "clx123abc456"
 *         name: "Hồ Chí Minh"
 *         createdAt: "2025-11-04T08:30:00Z"
 *         updatedAt: "2025-11-04T10:00:00Z"
 *
 *     CreateRegionDto:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           example: "Đà Nẵng"
 *
 *     UpdateRegionDto:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "Đà Nẵng - Quảng Nam"
 */

/**
 * @swagger
 * /api/regions:
 *   get:
 *     summary: Lấy danh sách tất cả khu vực
 *     tags: [Regions]
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
 *                   example: Lấy danh sách khu vực thành công
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Region'
 */
export const handleGetAllRegions = async (req: Request, res: Response, next: NextFunction) => {
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateRegionDto'
 *     responses:
 *       201:
 *         description: Tạo khu vực thành công
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
 *                   example: Tạo khu vực thành công
 *                 data:
 *                   $ref: '#/components/schemas/Region'
 */
export const handleCreateRegion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const createData: CreateRegionDto = req.body;
    const newRegion = await regionService.createRegion(createData);
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
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID khu vực cần cập nhật
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
 *                 message:
 *                   type: string
 *                   example: Cập nhật khu vực thành công
 *                 data:
 *                   $ref: '#/components/schemas/Region'
 */
export const handleUpdateRegion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const regionId = req.params.id;
    const updateData: UpdateRegionDto = req.body;
    const updatedRegion = await regionService.updateRegion(regionId, updateData);
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
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID khu vực cần xóa
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
 *                   example: Xóa khu vực thành công
 */
export const handleDeleteRegion = async (req: Request, res: Response, next: NextFunction) => {
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
