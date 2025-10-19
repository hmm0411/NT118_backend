import { Request, Response, NextFunction } from "express";

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
    console.error(err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal server error",
    });
}
