import { Request, Response } from "express";
import { UserService } from "./service";
import { UpdateUserDto } from "./dto";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";

// Khởi tạo service một lần
const userService = new UserService();

/**
 * GET /users/:id
 * Lấy thông tin người dùng
 */
export async function getUser(req: Request, res: Response) {
  try {
    const { id } = req.params;
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
 * PUT /users/:id
 * Cập nhật thông tin người dùng
 */
export async function updateUser(req: Request, res: Response) {
  try {
    const { id } = req.params;

    // 1. Chuyển req.body thành class DTO
    const dto = plainToInstance(UpdateUserDto, req.body);

    // 2. Validate DTO
    const errors = await validate(dto);
    if (errors.length > 0) {
      // Trả về lỗi validate
      return res.status(400).json({ success: false, errors });
    }
    
    // 3. Gọi service với DTO đã được validate
    await userService.updateUser(id, dto);

    res.json({ success: true, message: "User updated successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * GET /users/:id/bookings
 * Lấy danh sách lịch sử đặt vé
 */
export async function getBookings(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const bookings = await userService.getUserBookings(id);
    res.json({ success: true, bookings: bookings });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}