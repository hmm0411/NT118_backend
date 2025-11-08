// src/middleware/validateBody.ts
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { Request, Response, NextFunction } from "express";

export function validateBody(dtoClass: any) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const dtoInstance = plainToInstance(dtoClass, req.body);
    const errors = await validate(dtoInstance);

    if (errors.length > 0) {
      const message = errors.map(e => Object.values(e.constraints || {})).flat();
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: message,
      });
    }

    next();
  };
}
