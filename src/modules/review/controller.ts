import { Request, Response, NextFunction } from 'express';
import { ReviewService } from './service';
import { CreateReviewDto } from './dto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { AuthRequest } from '../../middleware/auth';
import { ApiError } from '../../utils/ApiError';

const reviewService = new ReviewService();

/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: Đánh giá và bình luận phim
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateReviewDto:
 *       type: object
 *       required:
 *         - movieId
 *         - rating
 *       properties:
 *         movieId:
 *           type: string
 *           example: "movie_mai_123"
 *         rating:
 *           type: number
 *           description: Số sao từ 1 đến 5
 *           example: 5
 *         comment:
 *           type: string
 *           example: "Phim quá hay, xúc động!"
 *     Review:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         userName:
 *           type: string
 *         userAvatar:
 *           type: string
 *         rating:
 *           type: number
 *         comment:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/reviews:
 *   post:
 *     summary: Gửi đánh giá phim
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateReviewDto'
 *     responses:
 *       201:
 *         description: Đánh giá thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Review'
 *       400:
 *         description: Đã đánh giá rồi hoặc dữ liệu lỗi
 */
export const createReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as AuthRequest).user!.uid;
    const dto = plainToInstance(CreateReviewDto, req.body);
    
    const errors = await validate(dto);
    if (errors.length > 0) throw new ApiError(400, 'Dữ liệu không hợp lệ', errors);

    const review = await reviewService.createReview(userId, dto);
    res.status(201).json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/reviews/{movieId}:
 *   get:
 *     summary: Xem danh sách đánh giá của một phim
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: movieId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Danh sách review
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Review'
 */
export const getReviewsByMovie = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { movieId } = req.params;
    const reviews = await reviewService.getReviewsByMovie(movieId);
    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    next(error);
  }
};