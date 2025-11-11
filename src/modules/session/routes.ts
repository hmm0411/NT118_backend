import { Router } from 'express';
import * as sessionController from './controller';

const router = Router();

/**
 * @swagger
 * /api/sessions:
 *   get:
 *     summary: Lấy danh sách tất cả các session
 *     tags: [Session]
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get('/', sessionController.getAllSessions);

/**
 * @swagger
 * /api/sessions/movie/{movieId}:
 *   get:
 *     summary: Lấy danh sách session theo movieId
 *     tags: [Session]
 */
router.get('/movie/:movieId', sessionController.getSessionsByMovie);

/**
 * @swagger
 * /api/sessions/{id}:
 *   get:
 *     summary: Lấy thông tin chi tiết session
 *     tags: [Session]
 */
router.get('/:id', sessionController.getSessionById);

/**
 * @swagger
 * /api/sessions:
 *   post:
 *     summary: Tạo session mới
 *     tags: [Session]
 */
router.post('/', sessionController.createSession);

export default router;
