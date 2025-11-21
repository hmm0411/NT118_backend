import { Request, Response, NextFunction } from "express";
import { firebaseAuth } from "../config/firebase";
import { DecodedIdToken } from "firebase-admin/auth";

/**
 * Interface này vẫn giữ để dùng cho Controller ép kiểu
 */
export interface AuthRequest extends Request {
  user?: DecodedIdToken;
}

/**
 * FIX LỖI: Thay đổi tham số đầu vào thành 'req: Request' 
 * để khớp với chuẩn của Express Router.
 */
export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No token provided or invalid format (Bearer <token>)",
      });
    }

    const token = authHeader.split(" ")[1];
    const decodedToken = await firebaseAuth.verifyIdToken(token);

    // Ép kiểu req thành AuthRequest để gán user
    (req as AuthRequest).user = decodedToken;
    
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Invalid or expired token",
    });
  }
};

/**
 * Middleware Optional Auth
 */
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const decodedToken = await firebaseAuth.verifyIdToken(token);
      
      // Ép kiểu để gán
      (req as AuthRequest).user = decodedToken;
    }
    
    next();
  } catch (error) {
    next();
  }
};

/**
 * Middleware Admin
 */
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  // Ép kiểu để lấy user
  const user = (req as AuthRequest).user;

  if (!user) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  // Kiểm tra claims (dùng any để bypass check typescript cho custom claims)
  const userClaims = user as any; 

  if (userClaims.role !== "admin" && userClaims.admin !== true) {
    return res.status(403).json({ success: false, message: "Forbidden - Admin access required" });
  }

  next();
};