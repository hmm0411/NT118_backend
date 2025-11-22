import { Request, Response, NextFunction } from 'express';
import { ShowtimeService } from './service';
import { CreateShowtimeDto } from './dto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ApiError } from '../../utils/ApiError';

const showtimeService = new ShowtimeService();

/**
 * @swagger
 * tags:
 *   name: Showtimes
 *   description: Quản lý Suất chiếu & Sơ đồ ghế
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Seat:
 *       type: object
 *       properties:
 *         code:
 *           type: string
 *           example: "A1"
 *         row:
 *           type: string
 *           example: "A"
 *         col:
 *           type: number
 *           example: 1
 *         type:
 *           type: string
 *           enum: [standard, vip, couple]
 *           example: "standard"
 *         price:
 *           type: number
 *           example: 90000
 *         status:
 *           type: string
 *           enum: [available, held, sold, locked]
 *           description: "available: Trống | held: Đang giữ (chờ thanh toán) | sold: Đã bán | locked: Hỏng/Khóa"
 *           example: "available"
 *         userId:
 *           type: string
 *           description: "ID của user đang giữ/mua ghế này (nếu có)"
 *     Showtime:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "showtime_xyz_123"
 *         movieId:
 *           type: string
 *           example: "movie_mai_2024"
 *         movieTitle:
 *           type: string
 *           example: "Mai"
 *         cinemaId:
 *           type: string
 *           example: "cinema_cgv_vincom"
 *         cinemaName:
 *           type: string
 *           example: "CGV Vincom Đồng Khởi"
 *         roomName:
 *           type: string
 *           example: "Room 01"
 *         startTime:
 *           type: string
 *           format: date-time
 *           example: "2025-12-20T19:30:00.000Z"
 *         endTime:
 *           type: string
 *           format: date-time
 *           example: "2025-12-20T21:30:00.000Z"
 *         totalSeats:
 *           type: number
 *           example: 50
 *         seatMap:
 *           type: object
 *           description: "Map chứa thông tin ghế. Key là mã ghế (A1), Value là object Seat"
 *           additionalProperties:
 *             $ref: '#/components/schemas/Seat'
 *           example:
 *             A1:
 *               code: "A1"
 *               status: "available"
 *               price: 90000
 *               type: "standard"
 *             A2:
 *               code: "A2"
 *               status: "sold"
 *               price: 90000
 *               type: "standard"
 *     CreateShowtimeDto:
 *       type: object
 *       required:
 *         - movieId
 *         - cinemaId
 *         - roomName
 *         - startTime
 *         - price
 *       properties:
 *         movieId:
 *           type: string
 *         cinemaId:
 *           type: string
 *         roomName:
 *           type: string
 *           example: "Cinema 03"
 *         startTime:
 *           type: string
 *           format: date-time
 *           example: "2025-12-20T19:30:00Z"
 *         price:
 *           type: number
 *           description: "Giá vé cơ bản"
 *           example: 90000
 */

/**
 * @swagger
 * /api/showtimes:
 *   get:
 *     summary: Lấy danh sách suất chiếu (theo Phim và Tỉnh)
 *     description: API này dùng cho màn hình "Chọn Rạp & Giờ chiếu". App nên Group kết quả theo `cinemaName`.
 *     tags: [Showtimes]
 *     parameters:
 *       - in: query
 *         name: movieId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của phim đang chọn
 *       - in: query
 *         name: regionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của Tỉnh/Thành phố
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: (Optional) Lọc theo ngày (YYYY-MM-DD). Nếu không gửi sẽ lấy tất cả suất chiếu tương lai.
 *         example: "2025-12-20"
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
 *                     $ref: '#/components/schemas/Showtime'
 *       400:
 *         description: Thiếu movieId hoặc regionId
 */
export const getShowtimes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { movieId, regionId, date } = req.query;

    if (!movieId || !regionId) {
      throw new ApiError(400, 'Cần movieId và regionId');
    }

    const data = await showtimeService.getShowtimes(
      movieId as string, 
      regionId as string, 
      date as string
    );
    
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/showtimes/{id}:
 *   get:
 *     summary: Lấy chi tiết suất chiếu & Sơ đồ ghế
 *     description: Dùng API này khi user bấm vào một giờ chiếu cụ thể để hiển thị sơ đồ chọn ghế.
 *     tags: [Showtimes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Trả về chi tiết kèm seatMap
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Showtime'
 *       404:
 *         description: Không tìm thấy suất chiếu
 */
export const getShowtimeById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const showtime = await showtimeService.getShowtimeById(id);
    
    if (!showtime) throw new ApiError(404, 'Không tìm thấy suất chiếu');

    res.status(200).json({ success: true, data: showtime });
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
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateShowtimeDto'
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
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Showtime'
 */
export const createShowtime = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dto = plainToInstance(CreateShowtimeDto, req.body);
    const errors = await validate(dto);
    if (errors.length > 0) throw new ApiError(400, 'Dữ liệu lỗi', errors);

    const newShowtime = await showtimeService.createShowtime(dto);
    res.status(201).json({ success: true, message: 'Tạo suất chiếu thành công', data: newShowtime });
  } catch (error) {
    next(error);
  }
};