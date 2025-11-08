import { Router } from 'express';
import { handleMakePayment } from './controller';
import { auth } from '../../middleware/auth';

const router = Router();

// Thanh toán cần user đăng nhập
router.post('/', auth, handleMakePayment);

export default router;
