import { Router } from 'express';
import { handleGetSeats, handleUpdateSeatStatus } from './controller';

const router = Router();

router.get('/:showtimeId', handleGetSeats);
router.patch('/:showtimeId/book', handleUpdateSeatStatus);

export default router;
