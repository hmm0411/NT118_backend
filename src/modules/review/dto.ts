import { IsString, IsNotEmpty, IsNumber, Min, Max, IsOptional, MaxLength } from 'class-validator';

export class CreateReviewDto {
  @IsString()
  @IsNotEmpty({ message: 'Movie ID không được để trống' })
  movieId!: string;

  @IsNumber()
  @Min(1, { message: 'Đánh giá thấp nhất là 1 sao' })
  @Max(5, { message: 'Đánh giá cao nhất là 5 sao' })
  rating!: number;

  @IsString()
  @IsOptional()
  @MaxLength(500, { message: 'Bình luận tối đa 500 ký tự' })
  comment?: string;
}