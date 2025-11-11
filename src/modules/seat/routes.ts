import { Router } from 'express';
import { handleGetSeats, handleUpdateSeatStatus } from './controller';
import { auth } from '../../middleware/auth';

const router = Router();

router.get('/:sessionId/:showtime', handleGetSeats);
router.patch('/:sessionId/:showtime/book', handleUpdateSeatStatus);

export default router;
