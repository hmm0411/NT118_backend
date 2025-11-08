// src/middleware/auth.ts
import { Request, Response, NextFunction } from "express";
import { firebaseAuth } from "../config/firebase";

/**
 * Middleware bắt buộc có token (Firebase ID Token)
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

    // Lưu user info (uid, email, role...) vào request
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
 * Middleware không bắt buộc token
 * Dùng cho các route public như /movies, /showtimes
 */
export const optionalAuth = async (req: Request & { user?: any }, _res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const decodedToken = await firebaseAuth.verifyIdToken(token);
      req.user = decodedToken;
    }

    next();
  } catch (error) {
    console.warn("optionalAuth: invalid or missing token, continuing as guest");
    next();
  }
};

/**
 * Middleware kiểm tra quyền admin
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
