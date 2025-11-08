import { Request, Response, NextFunction } from "express";
import { firebaseAuth } from "../config/firebase";

/**
 * Middleware bắt buộc có token (dành cho các route private — user đã đăng nhập)
 */
export const auth = async (req: Request & { user?: any }, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const token = authHeader.split(" ")[1];
    const decodedToken = await firebaseAuth.verifyIdToken(token);

    // Gắn user info vào request (để controller biết ai đang gọi)
    req.user = decodedToken;

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }
};

/**
 * Middleware tùy chọn: cho phép không có token
 * (dành cho các route public như /movies, /showtimes,...)
 */
export const optionalAuth = async (req: Request & { user?: any }, _res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const decodedToken = await firebaseAuth.verifyIdToken(token);
      req.user = decodedToken;
    }

    next(); // vẫn cho qua nếu không có token
  } catch (error) {
    console.warn("optionalAuth: invalid or missing token, continuing as guest");
    next(); // không chặn request
  }
};

/**
 * Middleware kiểm tra quyền admin
 * Giả sử bạn lưu role trong customClaims khi tạo user Firebase
 */
export const isAdmin = (req: Request & { user?: any }, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Forbidden - Admin only" });
  }

  next();
};
