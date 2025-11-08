// dto.ts
import { IsString, IsArray, IsNumber, ArrayNotEmpty } from 'class-validator';

export class CreateBookingDto {
  @IsString()
  showtimeId!: string;

  @IsArray()
  @ArrayNotEmpty()
  seats!: string[];

  @IsNumber()
  totalPrice!: number;
}
