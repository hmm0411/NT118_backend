import { Timestamp } from 'firebase-admin/firestore';

/**
 * Định nghĩa cấu trúc dữ liệu của một Movie
 * được lưu trong collection 'movies' trên Firestore.
 * (Nội dung này trước đây nằm trong types.ts)
 */
export interface MovieDocument {
  title: string;
  description?: string;
  genres?: string[]; // Ví dụ: "Crime, Drama"
  duration?: string; // Phút
  director?: string;
  cast?: string[];
  releaseDate?: string; // Ví dụ: "1957" hoặc "2023-10-20"
  posterUrl?: string;
  bannerImageUrl?: string;
  trailerUrl?: string;
  imdbRating?: number;
  language?: string; // Ví dụ: "VietNam"
  status?: 'now_showing' | 'coming_soon' | 'ended'; // Trạng thái chiếu phim
  isTopMovie?: boolean; // Phim hot / top movie
  ageRating?: string;   // Giới hạn độ tuổi, ví dụ: "13+", "18+", "PG-13"
  createdAt: Timestamp; // Đổi sang Timestamp
  updatedAt: Timestamp; // Đổi sang Timestamp
}

/**
 * Định nghĩa đối tượng Movie đầy đủ
 * mà chúng ta trả về qua API (bao gồm cả ID).
 */
export interface Movie extends MovieDocument {
  id: string; // ID của document
}