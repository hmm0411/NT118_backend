import { Router } from 'express';
import * as controller from './controller';
import { auth } from '../../middleware/auth';

const router = Router();

// Public: Ai cũng được xem review
router.get('/:movieId', controller.getReviewsByMovie);

// Auth: Phải đăng nhập mới được viết review
router.post('/', auth, controller.createReview);

export default router;