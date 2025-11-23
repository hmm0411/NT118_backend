import { Router } from 'express';
import * as controller from './controller';
import { auth, isAdmin } from '../../middleware/auth';

const router = Router();

// Public: User check mã
router.get('/', controller.getActiveVouchers);
router.post('/apply', controller.applyVoucher);

// Admin: Tạo mã
router.post('/', auth, isAdmin, controller.createVoucher);

export default router;