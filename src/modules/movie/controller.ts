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
 * /api/movies:
 *   get:
 *     summary: Lấy danh sách phim
 *     tags: [Movies]
 *     responses:
 *       200:
 *         description: Danh sách phim
 */
export async function getMovies(req: Request, res: Response) {
  const data = await movieService.getMovies();
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
