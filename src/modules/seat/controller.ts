import { Request, Response, NextFunction } from 'express';
import * as seatService from './service';
import { UpdateSeatStatusDto } from './dto';

/**
 * @swagger
 * tags:
 *   - name: Seats
 *     description: API quản lý ghế ngồi cho từng suất chiếu (showtime)
 */

/**
 * @swagger
 * /api/seats/{sessionId}/{showtime}:
 *   get:
 *     summary: Lấy danh sách ghế cho một suất chiếu (showtime) cụ thể
 *     tags: [Seats]
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: showtime
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Danh sách ghế
 *       404:
 *         description: Không tìm thấy
 */
export const handleGetSeats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sessionId, showtime } = req.params;
    const seats = await seatService.getSeatsBySession(sessionId, showtime);
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
 * /api/seats/{sessionId}/{showtime}/book:
 *   patch:
 *     summary: Cập nhật trạng thái nhiều ghế
 *     tags: [Seats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: showtime
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
 *         description: Thành công
 *       400:
 *         description: Ghế đã được đặt
 *       404:
 *         description: Không tồn tại
 */
export const handleUpdateSeatStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sessionId, showtime } = req.params;
    const body: UpdateSeatStatusDto = req.body;

    const updatedSeats = await seatService.updateSeatStatus(
      sessionId,
      showtime,
      body.seats,
      body.isBooked
    );

    res.status(200).json({
      success: true,
      message: 'Cập nhật trạng thái ghế thành công',
      data: updatedSeats,
    });
  } catch (error) {
    next(error);
  }
};
