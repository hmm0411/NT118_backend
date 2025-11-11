import { Router } from 'express';
import { handleMakePayment, handleGetMyTickets } from './controller';
import { auth } from '../../middleware/auth';

const router = Router();

// Thanh toán cần user đăng nhập
router.post('/', auth, handleMakePayment);
router.get("/tickets", auth, handleGetMyTickets);

export default router;
