import { Router } from 'express';
import { handleGetSeats, handleUpdateSeatStatus } from './controller';
import { auth } from '../../middleware/auth';

const router = Router();

router.get('/:showtimeId', handleGetSeats);
router.patch('/:showtimeId/book', auth, handleUpdateSeatStatus);

export default router;
