import { Timestamp } from 'firebase-admin/firestore';

/**
 * Định nghĩa cấu trúc dữ liệu thô của Region
 * được lưu trong collection 'regions' trên Firestore.
 */
export interface RegionDocument {
  name: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Định nghĩa đối tượng Region
 * mà chúng ta trả về qua API (đã chuyển Timestamp thành Date).
 * (Nội dung này trước đây nằm trong types.ts)
 */
export interface Region {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}