import { Router } from "express";
import * as controller from "./controller";
import { auth, optionalAuth, isAdmin } from "../../middleware/auth";

const router = Router();

// === Public Routes ===
// Bất kỳ ai cũng có thể xem danh sách khu vực
router.get("/", controller.getAllRegions);

// === Admin Routes ===
// Chỉ admin mới được quyền C-U-D
router.post("/", auth, isAdmin, controller.createRegion);
router.patch("/:id", auth, isAdmin, controller.updateRegion);
router.delete("/:id", auth, isAdmin, controller.deleteRegion);

export default router;