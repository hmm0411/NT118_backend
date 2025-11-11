import { Request, Response, NextFunction } from "express";
import * as showtimeService from "./service";
import { CreateShowtimeDto, UpdateShowtimeDto } from "./dto";

/**
 * @swagger
 * tags:
 *   - name: Showtimes
 *     description: API quản lý suất chiếu
 *
 * components:
 *   schemas:
 *     Showtime:
 *       type: object
 *       required:
 *         - id
 *         - movieId
 *         - cinemaId
 *         - startTime
 *         - endTime
 *       properties:
 *         id:
 *           type: string
 *         movieId:
 *           type: string
 *         cinemaId:
 *           type: string
 *         startTime:
 *           type: string
 *           format: date-time
 *         endTime:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       example:
 *         id: "stx123abc456"
 *         movieId: "movie001"
 *         cinemaId: "cinema001"
 *         startTime: "2025-11-07T18:30:00Z"
 *         endTime: "2025-11-07T20:30:00Z"
 *         createdAt: "2025-11-07T08:30:00Z"
 *         updatedAt: "2025-11-07T09:00:00Z"
 *
 *     CreateShowtimeDto:
 *       type: object
 *       required:
 *         - movieId
 *         - cinemaId
 *         - startTime
 *         - endTime
 *       properties:
 *         movieId:
 *           type: string
 *           example: "movie001"
 *         cinemaId:
 *           type: string
 *           example: "cinema001"
 *         startTime:
 *           type: string
 *           format: date-time
 *           example: "2025-11-07T18:30:00Z"
 *         endTime:
 *           type: string
 *           format: date-time
 *           example: "2025-11-07T20:30:00Z"
 *
 *     UpdateShowtimeDto:
 *       type: object
 *       properties:
 *         startTime:
 *           type: string
 *           format: date-time
 *         endTime:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/showtimes:
 *   get:
 *     summary: Lấy danh sách suất chiếu (lọc theo movieId)
 *     tags: [Showtimes]
 *     parameters:
 *       - in: query
 *         name: movieId
 *         schema:
 *           type: string
 *         description: ID phim cần lấy suất chiếu
 *       - in: query
 *         name: cinemaId
 *         schema:
 *           type: string
 *         description: ID rạp cần lấy suất chiếu
 *     responses:
 *       200:
 *         description: Lấy danh sách suất chiếu thành công
 */
export const handleGetAllShowtimes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { movieId, cinemaId } = req.query;

    let showtimes;
    if (movieId && cinemaId) {
      // Lấy suất chiếu cho 1 phim ở 1 rạp
      showtimes = await showtimeService.getByMovieAndCinema(
        movieId as string,
        cinemaId as string
      );
    } else if (movieId) {
      showtimes = await showtimeService.getByMovie(movieId as string);
    } else if (cinemaId) {
      showtimes = await showtimeService.getByCinema(cinemaId as string);
    } else {
      showtimes = await showtimeService.getAll();
    }

    res.status(200).json({
      success: true,
      message: "Lấy danh sách suất chiếu thành công",
      data: showtimes,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/showtimes:
 *   post:
 *     summary: Tạo suất chiếu mới (Admin)
 *     tags: [Showtimes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateShowtimeDto'
 *     responses:
 *       201:
 *         description: Tạo suất chiếu thành công
 */
export const handleCreateShowtime = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const createData: CreateShowtimeDto = req.body;
    const newShowtime = await showtimeService.create(createData);
    res.status(201).json({
      success: true,
      message: "Tạo suất chiếu thành công",
      data: newShowtime,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/showtimes/{id}:
 *   patch:
 *     summary: Cập nhật suất chiếu (Admin)
 *     tags: [Showtimes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID suất chiếu cần cập nhật
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateShowtimeDto'
 *     responses:
 *       200:
 *         description: Cập nhật suất chiếu thành công
 */
export const handleUpdateShowtime = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const showtimeId = req.params.id;
    const updateData: UpdateShowtimeDto = req.body;
    const updatedShowtime = await showtimeService.update(showtimeId, updateData);
    res.status(200).json({
      success: true,
      message: "Cập nhật suất chiếu thành công",
      data: updatedShowtime,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/showtimes/{id}:
 *   delete:
 *     summary: Xóa suất chiếu (Admin)
 *     tags: [Showtimes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID suất chiếu cần xóa
 *     responses:
 *       200:
 *         description: Xóa suất chiếu thành công
 */
export const handleDeleteShowtime = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const showtimeId = req.params.id;
    await showtimeService.remove(showtimeId);
    res.status(200).json({
      success: true,
      message: "Xóa suất chiếu thành công",
    });
  } catch (error) {
    next(error);
  }
};
