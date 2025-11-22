import { IsString, IsNotEmpty, IsDateString, IsNumber, Min } from 'class-validator';

export class CreateShowtimeDto {
  @IsString()
  @IsNotEmpty()
  movieId!: string;

  @IsString()
  @IsNotEmpty()
  cinemaId!: string;

  @IsString()
  @IsNotEmpty()
  roomName!: string;

  @IsDateString()
  @IsNotEmpty()
  startTime!: string; // ISO Date String

  @IsNumber()
  @Min(0)
  price!: number; // Giá vé cơ bản
}