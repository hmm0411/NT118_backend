import { Timestamp } from 'firebase-admin/firestore';

/**
 * Định nghĩa cấu trúc dữ liệu thô của Cinema
 * được lưu trong collection 'cinemas' trên Firestore.
 */
export interface CinemaDocument {
  name: string;
  address: string;
  regionId: string; // Mối quan hệ với Region
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Định nghĩa đối tượng Cinema
 * mà chúng ta trả về qua API (đã chuyển Timestamp thành Date).
 * (Nội dung này trước đây nằm trong types.ts và tên là ICinema)
 */
export interface Cinema {
  id: string;
  name: string;
  address: string;
  regionId: string;
  createdAt: Date;
  updatedAt: Date;
}