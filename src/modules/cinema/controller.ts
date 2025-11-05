import { Request, Response, NextFunction } from 'express';
import * as cinemaService from './service';
import { CreateCinemaDto, UpdateCinemaDto } from './dto';

/**
 * @swagger
 * tags:
 *   - name: Cinemas
 *     description: API quản lý rạp phim
 *
 * components:
 *   schemas:
 *     Cinema:
 *       type: object
 *       required:
 *         - id
 *         - name
 *         - regionId
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         address:
 *           type: string
 *         regionId:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
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
 *           example: "CGV Vincom"
 *         address:
 *           type: string
 *           example: "123 Nguyễn Trãi, Quận 1"
 *         regionId:
 *           type: string
 *           example: "clx123abc456"
 *     UpdateCinemaDto:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "CGV Vincom Center"
 *         address:
 *           type: string
 *           example: "123 Nguyễn Trãi, Quận 1"
 *         regionId:
 *           type: string
 *           example: "clx123abc456"
 */

/**
 * @swagger
 * /api/cinemas:
 *   get:
 *     summary: Lấy danh sách tất cả rạp
 *     tags: [Cinemas]
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
 *                   example: Lấy danh sách rạp thành công
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Cinema'
 */
export const handleGetAllCinemas = async (req: Request, res: Response, next: NextFunction) => {
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
 *   post:
 *     summary: Tạo rạp mới (Admin)
 *     tags: [Cinemas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCinemaDto'
 *     responses:
 *       201:
 *         description: Tạo rạp thành công
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
 *                   example: Tạo rạp thành công
 *                 data:
 *                   $ref: '#/components/schemas/Cinema'
 */
export const handleCreateCinema = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const createData: CreateCinemaDto = req.body;
    const newCinema = await cinemaService.createCinema(createData);
    res.status(201).json({ success: true, message: 'Tạo rạp thành công', data: newCinema });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/cinemas/{id}:
 *   patch:
 *     summary: Cập nhật rạp (Admin)
 *     tags: [Cinemas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID rạp cần cập nhật
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCinemaDto'
 *     responses:
 *       200:
 *         description: Cập nhật rạp thành công
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
 *                   example: Cập nhật rạp thành công
 *                 data:
 *                   $ref: '#/components/schemas/Cinema'
 */
export const handleUpdateCinema = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    const updateData: UpdateCinemaDto = req.body;
    const updatedCinema = await cinemaService.updateCinema(id, updateData);
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
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID rạp cần xóa
 *     responses:
 *       200:
 *         description: Xóa rạp thành công
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
 *                   example: Xóa rạp thành công
 */
export const handleDeleteCinema = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    await cinemaService.deleteCinema(id);
    res.status(200).json({ success: true, message: 'Xóa rạp thành công' });
  } catch (error) {
    next(error);
  }
};
