import { Router } from "express";
import * as controller from "./controller";
import { auth, isAdmin } from "../../middleware/auth";

const router = Router();

// Public: Lấy danh sách để hiển thị cho user chọn
router.get("/", controller.getAllRegions);

// Admin: Quản lý
router.post("/", auth, isAdmin, controller.createRegion);
router.patch("/:id", auth, isAdmin, controller.updateRegion);
router.delete("/:id", auth, isAdmin, controller.deleteRegion);

export default router;