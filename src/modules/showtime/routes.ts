import { Router } from 'express';
import * as controller from './controller';
import { auth, isAdmin } from "../../middleware/auth";

const router = Router();

// Public: Lấy danh sách suất chiếu (để user chọn vé)
// URL: /api/showtimes?movieId=...&regionId=...
router.get('/', controller.getShowtimes);

// Public: Lấy chi tiết suất chiếu (để hiển thị sơ đồ ghế)
router.get('/:id', controller.getShowtimeById);

// Admin: Tạo suất chiếu
router.post('/', auth, isAdmin, controller.createShowtime);

export default router;