export interface Movie {
  id: string;
  title: string;
  description?: string;
  genres?: string[]; // Ví dụ: "Crime, Drama"
  duration?: string; // Phút
  director?: string;
  cast?: string[];
  releaseDate?: string; // Ví dụ: "1957"
  posterUrl?: string;
  bannerImageUrl?: string;
  trailerUrl?: string;
  imdbRating?: number;
  language?: string; // Ví dụ: "VietNam"
  status?: 'now_showing' | 'coming_soon' | 'ended'; // Trạng thái chiếu phim
  isTopMovie?: boolean; // Phim hot / top movie
  ageRating?: string;   // Giới hạn độ tuổi, ví dụ: "13+", "18+", "PG-13"
  createdAt: number;
  updatedAt: number;
}
