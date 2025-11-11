export interface Session {
  id?: string;
  cinemaAddress: string;
  cinemaId: string;
  cinemaName: string;
  date: string; // ví dụ: "2025-11-12"
  movieId: string;
  regionID: string;
  regionName: string;
  showtimes: string[]; // ["14:00", "12:00"]
}
