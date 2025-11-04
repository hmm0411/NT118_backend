// src/modules/movie/dto.ts
export interface CreateMovieDTO {
  title: string;
  description: string;
  genre: string[];
  duration: number; // phút
  releaseDate: string;
  posterUrl?: string;
  trailerUrl?: string;
}
