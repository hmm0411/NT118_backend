// routes.ts
import { Router } from 'express';
import { handleCreateBooking, handleGetMyBookings, handleGetBookingById } from './controller';
import { auth } from '../../middleware/auth';

const router = Router();

router.post('/', auth, handleCreateBooking);
router.get('/', auth, handleGetMyBookings);
router.get('/:bookingId', auth, handleGetBookingById);

export default router;
