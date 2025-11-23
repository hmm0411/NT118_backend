import { Timestamp } from 'firebase-admin/firestore';

// --- PHẦN 1: USER MODEL ---

export enum MembershipRank {
  STANDARD = 'Standard', // Mới
  SILVER = 'Silver',     // > 1.000.000 chi tiêu
  GOLD = 'Gold',         // > 5.000.000 chi tiêu
  DIAMOND = 'Diamond'    // > 10.000.000 chi tiêu
}

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
  
  // Sửa thành 'role' (số ít) để khớp với Middleware isAdmin
  role?: 'user' | 'admin'; 
  
  // --- MEMBER LOYALTY ---
  currentPoints: number;      // Điểm hiện tại
  totalSpending: number;      // Tổng tiền đã chi tiêu
  rank: MembershipRank;       // Hạng hiện tại
}

/**
 * Định nghĩa đối tượng User đầy đủ
 * mà chúng ta trả về qua API (bao gồm cả ID).
 */
export interface User extends UserDocument {
  id: string; // ID của document (cũng là Auth UID)
}

// --- PHẦN 2: CÁC TYPES PHỤ TRỢ ---

export interface BookingHistoryItem {
  id: string;
  userId: string;
  showtimeId: string;
  movieTitle: string; 
  posterUrl: string; 
  cinemaName: string; 
  totalPrice: number;
  seats: string[];
  createdAt: Timestamp;
}