import { Request, Response } from "express";
import * as movieService from "./service";

/**
 * @swagger
 * tags:
 *   name: Movies
 *   description: Quản lý phim
 *
 * components:
 *   schemas:
 *     Movie:
 *       type: object
 *       required:
 *         - id
 *         - title
 *         - createdAt
 *         - updatedAt
 *       properties:
 *         id:
 *           type: string
 *           description: Mã phim
 *         title:
 *           type: string
 *           description: Tên phim
 *         description:
 *           type: string
 *           description: Mô tả phim
 *         genres:
 *           type: array
 *           description: Thể loại phim, ví dụ "Crime, Drama"
 *           items:
 *             type: string
 *         duration:
 *           type: string
 *           description: Thời lượng phim (phút)
 *         director:
 *           type: string
 *         cast:
 *           type: array
 *           items:
 *             type: string
 *           description: Dàn diễn viên
 *         releaseDate:
 *           type: string
 *           description: Ngày hoặc năm phát hành, ví dụ "1957"
 *         posterUrl:
 *           type: string
 *           format: uri
 *         bannerImageUrl:
 *           type: string
 *           format: uri
 *         trailerUrl:
 *           type: string
 *           format: uri
 *         imdbRating:
 *           type: number
 *         language:
 *           type: string
 *         status:
 *           type: string
 *           enum: [now_showing, coming_soon, ended]
 *         isTopMovie:
 *           type: boolean
 *         ageRating:
 *           type: string
 *         createdAt:
 *           type: number
 *         updatedAt:
 *           type: number
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
  const data = await movieService.getMoviesWithStatus();
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
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               genres:
 *                 type: array
 *                 items:
 *                   type: string
 *               duration:
 *                 type: string
 *               director:
 *                 type: string
 *               cast:
 *                 type: array
 *                 items:
 *                   type: string
 *               releaseDate:
 *                 type: string
 *               posterUrl:
 *                 type: string
 *               bannerImageUrl:
 *                 type: string
 *               trailerUrl:
 *                 type: string
 *               imdbRating:
 *                 type: number
 *               language:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [now_showing, coming_soon, ended]
 *               isTopMovie:
 *                 type: boolean
 *               ageRating:
 *                 type: string
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
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               genres:
 *                 type: array
 *                 items:
 *                   type: string
 *               duration:
 *                 type: string
 *               director:
 *                 type: string
 *               cast:
 *                 type: array
 *                 items:
 *                   type: string
 *               releaseDate:
 *                 type: string
 *               posterUrl:
 *                 type: string
 *               bannerImageUrl:
 *                 type: string
 *               trailerUrl:
 *                 type: string
 *               imdbRating:
 *                 type: number
 *               language:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [now_showing, coming_soon, ended]
 *               isTopMovie:
 *                 type: boolean
 *               ageRating:
 *                 type: string
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
