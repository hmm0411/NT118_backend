import { Request, Response } from "express"; // Dùng Request thường
import { AuthService } from "./service";
import { AuthRequest } from "../../middleware/auth"; // Import để ép kiểu bên trong

const authService = new AuthService();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: API Xác thực & Đồng bộ User
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Đăng nhập & Đồng bộ User (Sync)
 *     description: App Android gửi Firebase Token lên, Backend verify và tạo user nếu chưa có.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Đăng nhập thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Login successful"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     name:
 *                       type: string
 *                     isNewUser:
 *                       type: boolean
 *       401:
 *         description: Token không hợp lệ hoặc hết hạn
 */
export async function loginAndSync(req: Request, res: Response) {
  try {
    // Ép kiểu bên trong hàm
    const userToken = (req as AuthRequest).user;

    if (!userToken) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await authService.syncUser(userToken);

    res.json({
      success: true,
      message: user.isNewUser ? "User registered successfully" : "Login successful",
      data: user
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}