import { Timestamp } from 'firebase-admin/firestore';

export enum BookingStatus {
  PENDING = 'pending',     // Đang giữ ghế, chờ thanh toán
  PAID = 'paid',           // Đã thanh toán thành công
  CANCELLED = 'cancelled', // Hết hạn giữ ghế hoặc user hủy
  FAILED = 'failed'        // Lỗi thanh toán
}

/**
 * Định nghĩa cấu trúc dữ liệu thô lưu trong Firestore
 */
export interface BookingDocument {
  userId: string;
  showtimeId: string;
  
  // Denormalization: Lưu snapshot thông tin để hiển thị nhanh
  movieTitle: string;
  cinemaName: string;
  roomName: string;
  showtimeDate: Timestamp; // Giờ chiếu

  seats: string[];      // ['A1', 'A2']
  seatPrice: number;    // Giá vé đơn vị
  totalPrice: number;   // Tổng tiền

  status: BookingStatus;
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
  expiresAt: Timestamp; // Thời gian hết hạn giữ ghế (để Cronjob quét)
}

/**
 * Định nghĩa đối tượng trả về Client (Timestamp -> Date)
 */
export interface Booking {
  id: string;
  userId: string;
  showtimeId: string;
  movieTitle: string;
  cinemaName: string;
  roomName: string;
  showtimeDate: Date;
  seats: string[];
  seatPrice: number;
  totalPrice: number;
  status: BookingStatus;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
}