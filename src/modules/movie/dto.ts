export interface CreateMovieDTO {
  title: string;
  description?: string;
  genres?: string[];              // Ví dụ: "Crime, Drama"
  duration?: string;            // Phút
  director?: string;
  cast?: string[];
  releaseDate?: string;         // Ví dụ: "1957"
  posterUrl?: string;
  bannerImageUrl?: string;
  trailerUrl?: string;
  imdbRating?: number;
  language?: string;            // Ví dụ: "Vietnam"
  status?: 'now_showing' | 'coming_soon' | 'ended';
  isTopMovie?: boolean;         // Phim hot
  ageRating?: string;           // Ví dụ: "13+", "18+", "PG-13"
}
