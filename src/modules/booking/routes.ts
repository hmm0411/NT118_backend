// routes.ts
import { Router } from 'express';
import { handleCreateBooking, handleGetUserBookings } from './controller';
import { auth } from '../../middleware/auth';

const router = Router();

router.post('/', auth, handleCreateBooking);
router.get('/', auth, handleGetUserBookings);

export default router;
