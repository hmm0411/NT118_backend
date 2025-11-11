/**
 * DTO dùng khi tạo mới một session (suất chiếu)
 */
export interface CreateSessionDto {
  cinemaAddress: string;
  cinemaId: string;
  cinemaName: string;
  date: string;
  movieId: string;
  regionID: string;
  regionName: string;
  showtimes: string[];
}
