import { Timestamp } from 'firebase-admin/firestore';

// Enum trạng thái ghế
export enum SeatStatus {
  AVAILABLE = 'available', // Trống
  HELD = 'held',           // Đang giữ (chờ thanh toán)
  SOLD = 'sold',           // Đã bán
  LOCKED = 'locked'        // Khóa (hư hỏng/không bán)
}

// Loại ghế
export enum SeatType {
  STANDARD = 'standard',
  VIP = 'vip',
  COUPLE = 'couple'
}

// Cấu trúc một chiếc ghế
export interface Seat {
  code: string;       // VD: A1, B2
  row: string;        // A
  col: number;        // 1
  type: SeatType;
  price: number;
  status: SeatStatus;
  userId?: string;    // ID người đang giữ/mua
}

// Document lưu trong Firestore
export interface ShowtimeDocument {
  movieId: string;
  movieTitle: string; // Lưu tên phim để đỡ query
  
  cinemaId: string;
  cinemaName: string; // Lưu tên rạp
  
  regionId: string;   // Quan trọng: Để filter theo tỉnh
  
  roomName: string;   // VD: Phòng 01
  
  startTime: Timestamp;
  endTime: Timestamp;
  
  // --- KEY POINT: Dùng Map thay vì Array ---
  // Key là mã ghế (A1), Value là data ghế
  seatMap: Record<string, Seat>;
  
  totalSeats: number;
  availableSeats: number;
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Object trả về qua API
export interface Showtime {
  id: string;
  movieId: string;
  movieTitle: string;
  cinemaId: string;
  cinemaName: string;
  regionId: string;
  roomName: string;
  startTime: Date;
  endTime: Date;
  seatMap: Record<string, Seat>;
  totalSeats: number;
  availableSeats: number;
}