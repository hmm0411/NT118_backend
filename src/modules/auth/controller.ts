import { Request, Response } from "express"; // Dùng Request thường
import { AuthService } from "./service";
import { AuthRequest } from "../../middleware/auth"; // Import để ép kiểu bên trong

const authService = new AuthService();

// Dùng req: Request ở đây
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