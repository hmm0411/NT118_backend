export interface Movie {
  id: string;
  title: string;
  description?: string;
  genre?: string;
  duration?: number; // phút
  director?: string;
  cast?: string[];
  releaseDate?: number; // timestamp
  posterUrl?: string;
  trailerUrl?: string;
  createdAt: number;
  updatedAt: number;
}
