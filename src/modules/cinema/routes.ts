import { Router } from 'express';
import * as controller from './controller';
import { auth, isAdmin } from "../../middleware/auth";

const router = Router();

// Public: Lấy danh sách (Có thể kèm ?regionId=...)
router.get('/', controller.getAllCinemas);

// Admin
router.post('/', auth, isAdmin, controller.createCinema);
router.patch('/:id', auth, isAdmin, controller.updateCinema);
router.delete('/:id', auth, isAdmin, controller.deleteCinema);

export default router;