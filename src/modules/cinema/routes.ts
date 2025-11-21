import { Router } from 'express';
import * as controller from './controller';
import { auth, isAdmin } from "../../middleware/auth";

const router = Router();

// === Public Routes ===
// Bất kỳ ai cũng có thể xem danh sách rạp
router.get('/', controller.getAllCinemas);

// === Admin Routes ===
// Chỉ admin mới được quyền C-U-D
router.post('/', auth, isAdmin, controller.createCinema);
router.patch('/:id', auth, isAdmin, controller.updateCinema);
router.delete('/:id', auth, isAdmin, controller.deleteCinema);

export default router;