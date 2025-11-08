import { Request, Response, NextFunction } from 'express';
import * as seatService from './service';
import { UpdateSeatStatusDto } from './dto';

/**
 * @swagger
 * tags:
 *   - name: Seats
 *     description: API quản lý ghế ngồi cho từng suất chiếu
 */

/**
 * @swagger
 * tags:
 *   - name: Seats
 *     description: API quản lý ghế ngồi cho từng suất chiếu
 *
 * components:
 *   schemas:
 *     Seat:
 *       type: object
 *       properties:
 *         seatId:
 *           type: string
 *           example: A1
 *         isBooked:
 *           type: boolean
 *           example: false
 *
 *     UpdateSeatStatusDto:
 *       type: object
 *       required:
 *         - seats
 *         - status
 *       properties:
 *         seats:
 *           type: array
 *           items:
 *             type: string
 *           example: ["A1", "A2"]
 *         status:
 *           type: boolean
 *           example: true
 */

/**
 * @swagger
 * /api/seats/{showtimeId}:
 *   get:
 *     summary: Lấy danh sách ghế cho suất chiếu
 *     tags: [Seats]
 *     parameters:
 *       - name: showtimeId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Danh sách ghế
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
 *                   example: Lấy danh sách ghế thành công
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       seatId:
 *                         type: string
 *                         example: A1
 *                       isBooked:
 *                         type: boolean
 *                         example: false
 */
export const handleGetSeats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { showtimeId } = req.params;
    const seats = await seatService.getSeatsByShowtime(showtimeId);
    res.status(200).json({
      success: true,
      message: 'Lấy danh sách ghế thành công',
      data: seats,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/seats/{showtimeId}/book:
 *   patch:
 *     summary: Cập nhật trạng thái ghế (đặt hoặc huỷ)
 *     tags: [Seats]
 *     parameters:
 *       - name: showtimeId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateSeatStatusDto'
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
export const handleUpdateSeatStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { showtimeId } = req.params;
    const body: UpdateSeatStatusDto = req.body;

    const updatedSeats = await seatService.updateSeatStatus(showtimeId, body.seats, body.status);

    res.status(200).json({
      success: true,
      message: 'Cập nhật trạng thái ghế thành công',
      data: updatedSeats,
    });
  } catch (error) {
    next(error);
  }
};
