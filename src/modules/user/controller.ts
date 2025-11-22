import { Request, Response } from "express";
import { UserService } from "./service";
import { UpdateUserDto } from "./dto";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { AuthRequest } from "../../middleware/auth"; // Import để ép kiểu

const userService = new UserService();

/**
 * Hàm kiểm tra quyền sở hữu (Helper)
 * Chỉ cho phép nếu là chính chủ hoặc là Admin
 */
function isOwnerOrAdmin(req: Request, targetId: string): boolean {
  const user = (req as AuthRequest).user;
  if (!user) return false;
  // Cho phép nếu id trùng nhau HOẶC user có claim admin
  // (Ép kiểu any để check field role/admin tùy setup của bạn)
  return user.uid === targetId || (user as any).role === 'admin';
}

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Quản lý thông tin người dùng
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     UpdateUserDto:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "Nguyen Van A"
 *         phone:
 *           type: string
 *           example: "+84909123456"
 *         birthday:
 *           type: string
 *           example: "08/11/2005"
 *         gender:
 *           type: string
 *           example: "Male/Female"
 *         photoURL:
 *           type: string
 *           example: "https://example.com/avatar.jpg"
 */

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Lấy thông tin chi tiết user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User UID
 *     responses:
 *       200:
 *         description: Thành công
 *       403:
 *         description: Không có quyền xem user này
 *       404:
 *         description: User không tồn tại
 */
export async function getUser(req: Request, res: Response) {
  try {
    const { id } = req.params;

    // BẢO MẬT: Kiểm tra quyền
    if (!isOwnerOrAdmin(req, id)) {
      return res.status(403).json({ success: false, message: "Forbidden: Not your account" });
    }

    const user = await userService.getUserById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Cập nhật thông tin user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserDto'
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
export async function updateUser(req: Request, res: Response) {
  try {
    const { id } = req.params;

    // BẢO MẬT
    if (!isOwnerOrAdmin(req, id)) {
      return res.status(403).json({ success: false, message: "Forbidden: You can only update your own profile" });
    }

    const dto = plainToInstance(UpdateUserDto, req.body);
    const errors = await validate(dto);
    if (errors.length > 0) {
      return res.status(400).json({ success: false, errors });
    }
    
    await userService.updateUser(id, dto);
    res.json({ success: true, message: "User updated successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * @swagger
 * /api/users/{id}/bookings:
 *   get:
 *     summary: Lấy lịch sử đặt vé của user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Danh sách vé đã đặt
 */
export async function getBookings(req: Request, res: Response) {
  try {
    const { id } = req.params;

    // BẢO MẬT
    if (!isOwnerOrAdmin(req, id)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const bookings = await userService.getUserBookings(id);
    res.json({ success: true, bookings: bookings });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}