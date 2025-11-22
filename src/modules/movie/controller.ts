import { Request, Response } from "express";
import { MovieService } from "./service";
import { CreateMovieDto, UpdateMovieDto } from "./dto";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";

// Khởi tạo service
const movieService = new MovieService();

/**
 * @swagger
 * tags:
 *   name: Movies
 *   description: Quản lý Phim
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Movie:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "movie_mai_2024"
 *         title:
 *           type: string
 *           example: "Mai"
 *         description:
 *           type: string
 *           example: "Phim tình cảm tâm lý do Trấn Thành đạo diễn."
 *         genres:
 *           type: array
 *           items:
 *             type: string
 *           example: ["Romance", "Drama"]
 *         duration:
 *           type: string
 *           description: Thời lượng (phút)
 *           example: "131"
 *         director:
 *           type: string
 *           example: "Trấn Thành"
 *         releaseDate:
 *           type: string
 *           format: date
 *           example: "2024-02-10"
 *         posterUrl:
 *           type: string
 *           example: "https://example.com/poster_mai.jpg"
 *         trailerUrl:
 *           type: string
 *           example: "https://youtube.com/watch?v=..."
 *         status:
 *           type: string
 *           enum: [now_showing, coming_soon, ended]
 *           example: "now_showing"
 *         computedStatus:
 *           type: string
 *           description: Trạng thái tính toán tự động (dựa trên ngày phát hành)
 *           example: "now_showing"
 *     CreateMovieDto:
 *       type: object
 *       required:
 *         - title
 *       properties:
 *         title:
 *           type: string
 *           example: "Đào, Phở và Piano"
 *         description:
 *           type: string
 *         genres:
 *           type: array
 *           items:
 *             type: string
 *           example: ["History", "War"]
 *         duration:
 *           type: string
 *           example: "100"
 *         director:
 *           type: string
 *           example: "Phi Tiến Sơn"
 *         releaseDate:
 *           type: string
 *           example: "2024-02-10"
 *         posterUrl:
 *           type: string
 *         trailerUrl:
 *           type: string
 *         status:
 *           type: string
 *           enum: [now_showing, coming_soon, ended]
 *     UpdateMovieDto:
 *       type: object
 *       description: Các trường giống CreateMovieDto nhưng đều là optional
 */

/**
 * @swagger
 * /api/movies:
 *   get:
 *     summary: Lấy danh sách phim (Home Screen)
 *     tags: [Movies]
 *     security: []
 *     responses:
 *       200:
 *         description: Trả về danh sách phim kèm trạng thái computedStatus
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Movie'
 */
export async function getMovies(req: Request, res: Response) {
  try {
    const data = await movieService.getMoviesWithStatus();
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * @swagger
 * /api/movies/{id}:
 *   get:
 *     summary: Lấy chi tiết phim
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chi tiết phim
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Movie'
 *       404:
 *         description: Không tìm thấy phim
 */
export async function getMovieById(req: Request, res: Response) {
  try {
    const movie = await movieService.getMovieById(req.params.id);
    if (!movie) return res.status(404).json({ message: "Movie not found" });
    res.json(movie);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * @swagger
 * /api/movies:
 *   post:
 *     summary: Thêm phim mới (Admin)
 *     tags: [Movies]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateMovieDto'
 *     responses:
 *       201:
 *         description: Tạo thành công
 */
export async function createMovie(req: Request, res: Response) {
  try {
    // 1. Chuyển req.body thành DTO
    const dto = plainToInstance(CreateMovieDto, req.body);
    
    // 2. Validate DTO
    const errors = await validate(dto);
    if (errors.length > 0) {
      return res.status(400).json({ success: false, errors });
    }

    // 3. Gọi service với DTO đã validate
    const movie = await movieService.createMovie(dto);
    res.status(201).json(movie);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * @swagger
 * /api/movies/{id}:
 *   put:
 *     summary: Cập nhật phim (Admin)
 *     tags: [Movies]
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
 *             $ref: '#/components/schemas/UpdateMovieDto'
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
export async function updateMovie(req: Request, res: Response) {
  try {
    // 1. Chuyển req.body thành DTO
    const dto = plainToInstance(UpdateMovieDto, req.body);

    // 2. Validate DTO (cho phép thiếu trường)
    const errors = await validate(dto, { skipMissingProperties: true });
    if (errors.length > 0) {
      return res.status(400).json({ success: false, errors });
    }

    // 3. Gọi service
    const updated = await movieService.updateMovie(req.params.id, dto);
    if (!updated) return res.status(404).json({ message: "Movie not found" });
    
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * @swagger
 * /api/movies/{id}:
 *   delete:
 *     summary: Xóa phim (Admin)
 *     tags: [Movies]
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
export async function deleteMovie(req: Request, res: Response) {
  try {
    const result = await movieService.removeMovie(req.params.id);
    if (!result)
      return res.status(404).json({ success: false, message: "Movie not found" });

    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}