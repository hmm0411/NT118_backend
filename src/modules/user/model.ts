import { Timestamp } from 'firebase-admin/firestore';

// --- PHẦN 1: USER MODEL ---

/**
 * Định nghĩa cấu trúc dữ liệu của một User
 * được lưu trong collection 'users' trên Firestore.
 */
export interface UserDocument {
  email: string;
  displayName?: string;
  photoURL?: string;
  phoneNumber?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  // roles?: ('user' | 'admin')[]; // Ví dụ nếu bạn cần phân quyền
}

/**
 * Định nghĩa đối tượng User đầy đủ
 * mà chúng ta trả về qua API (bao gồm cả ID).
 */
export interface User extends UserDocument {
  id: string; // ID của document (cũng là Auth UID)
}


// --- PHẦN 2: CÁC TYPES PHỤ TRỢ (Đã gộp từ types.ts) ---

/**
 * Định nghĩa hình dạng dữ liệu của một vé
 * trong lịch sử đặt vé của người dùng.
 * (Nội dung này trước đây nằm trong types.ts)
 */
export interface BookingHistoryItem {
  id: string;
  userId: string;
  showtimeId: string;
  movieTitle: string; // Dữ liệu denormalized để load nhanh
  posterUrl: string; // Dữ liệu denormalized
  cinemaName: string; // Dữ liệu denormalized
  totalPrice: number;
  seats: string[];
  createdAt: Timestamp;
}