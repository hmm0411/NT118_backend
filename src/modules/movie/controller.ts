import { Request, Response } from "express";
import * as movieService from "./service";

/**
 * @swagger
 * tags:
 *   name: Movies
 *   description: Quản lý phim
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Movie:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - release
 *       properties:
 *         movie_id:
 *           type: string
 *           description: Mã phim
 *         title:
 *           type: string
 *           description: Tên phim
 *         description:
 *           type: string
 *           description: Mô tả phim
 *         imdb:
 *           type: number
 *           format: float
 *           description: Điểm IMDB
 *         certificate:
 *           type: string
 *           description: Giấy phép / Cấm đoán
 *         runtime:
 *           type: string
 *           description: Thời lượng phim
 *         release:
 *           type: string
 *           description: Năm phát hành
 *         genre:
 *           type: string
 *           description: Thể loại phim
 *         writer:
 *           type: string
 *           description: Tác giả kịch bản
 *         director:
 *           type: string
 *           description: Đạo diễn
 *         cast:
 *           type: array
 *           items:
 *             type: string
 *           description: Dàn diễn viên
 *         poster:
 *           type: string
 *           format: uri
 *           description: URL ảnh poster phim
 *         trailerUrl:
 *           type: string
 *           format: uri
 *           description: URL nhúng trailer từ YouTube
 *         status:
 *           type: string
 *           enum: [now_showing, coming_soon]
 *           description: Trạng thái phim
 *       example:
 *         movie_id: "1"
 *         title: "12 Angry Men"
 *         description: "The defense and the prosecution have rested..."
 *         imdb: 9.0
 *         certificate: "NR"
 *         runtime: "1h 36m"
 *         release: "1957"
 *         genre: "Crime, Drama"
 *         writer: "Reginald Rose"
 *         director: "Sidney Lumet"
 *         cast: ["Martin Balsam", "John Fiedler", "Lee J. Cobb"]
 *         poster: "https://example.com/poster.jpg"
 *         trailerUrl: "https://www.youtube.com/embed/example"
 *         status: now_showing
 */

/**
 * @swagger
 * /api/movies:
 *   get:
 *     summary: Lấy danh sách phim
 *     tags: [Movies]
 *     responses:
 *       200:
 *         description: Danh sách phim
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Movie'
 */
export async function getMovies(req: Request, res: Response) {
  const data = await movieService.getMoviesWithStatus(); // gọi service mới
  res.json(data);
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
  const movie = await movieService.getMovieById(req.params.id);
  if (!movie) return res.status(404).json({ message: "Movie not found" });
  res.json(movie);
}

/**
 * @swagger
 * /api/movies:
 *   post:
 *     summary: Thêm phim mới
 *     tags: [Movies]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Movie'
 *     responses:
 *       201:
 *         description: Tạo thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Movie'
 */
export async function createMovie(req: Request, res: Response) {
  const movie = await movieService.createMovie(req.body);
  res.status(201).json(movie);
}

/**
 * @swagger
 * /api/movies/{id}:
 *   put:
 *     summary: Cập nhật phim
 *     tags: [Movies]
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
 *             $ref: '#/components/schemas/Movie'
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Movie'
 *       404:
 *         description: Không tìm thấy phim
 */
export async function updateMovie(req: Request, res: Response) {
  const updated = await movieService.updateMovie(req.params.id, req.body);
  if (!updated) return res.status(404).json({ message: "Movie not found" });
  res.json(updated);
}

/**
 * @swagger
 * /api/movies/{id}:
 *   delete:
 *     summary: Xóa phim
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Xóa thành công
 *       404:
 *         description: Không tìm thấy phim
 */
export async function deleteMovie(req: Request, res: Response) {
  const result = await movieService.removeMovie(req.params.id);
  if (!result)
    return res.status(404).json({ success: false, message: "Movie not found" });

  res.json({ success: true, ...result });
}
