import { Timestamp } from 'firebase-admin/firestore';

/**
 * Document lưu trong Firestore
 */
export interface ReviewDocument {
  userId: string;
  movieId: string;
  
  // Denormalize: Lưu luôn tên/avatar để hiển thị list review cho nhanh
  // Không cần join sang bảng User nữa
  userName: string;
  userAvatar: string;
  
  rating: number; // 1 -> 5
  comment: string;
  
  createdAt: Timestamp;
}

/**
 * Dữ liệu trả về API
 */
export interface Review extends ReviewDocument {
  id: string;
}