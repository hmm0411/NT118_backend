import { IsArray, IsNotEmpty, IsString, ArrayMinSize, IsOptional } from 'class-validator';

export class CreateBookingDto {
  @IsString()
  @IsNotEmpty({ message: 'Showtime ID không được để trống' })
  showtimeId!: string;

  @IsArray()
  @ArrayMinSize(1, { message: 'Phải chọn ít nhất 1 ghế' })
  @IsString({ each: true })
  seats!: string[]; // ["A1", "A2"]

  @IsString()
  @IsOptional()
  voucherCode?: string;
}