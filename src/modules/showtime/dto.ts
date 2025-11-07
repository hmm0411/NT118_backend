import { IsString, IsDateString, IsNumber } from "class-validator";

export class CreateShowtimeDto {
  @IsString()
  movieId!: string;

  @IsString()
  cinemaId!: string;

  @IsDateString()
  startTime!: string; // client gửi ISO string

  @IsDateString()
  endTime!: string;

  @IsNumber()
  price!: number;
}

export class UpdateShowtimeDto {
  @IsDateString()
  startTime?: string;

  @IsDateString()
  endTime?: string;

  @IsNumber()
  price?: number;
}
