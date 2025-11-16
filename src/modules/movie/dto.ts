import {
  IsString, IsOptional, IsArray, IsUrl, IsNumber, IsEnum, IsBoolean,
  Min, Max, MaxLength, IsDateString,
} from 'class-validator';

// Mảng các trạng thái hợp lệ
const validStatuses = ['now_showing', 'coming_soon', 'ended'];

export class CreateMovieDto {
  @IsString()
  @MaxLength(200)
  title!: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  genres?: string[];

  @IsString() // Giữ nguyên là string (ví dụ: "120 phút") theo cấu trúc cũ
  @IsOptional()
  duration?: string;

  @IsString()
  @IsOptional()
  director?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  cast?: string[];

  @IsDateString() // Dùng IsDateString để chấp nhận "1957" hoặc "2023-10-20"
  @IsOptional()
  releaseDate?: string;

  @IsUrl()
  @IsOptional()
  posterUrl?: string;

  @IsUrl()
  @IsOptional()
  bannerImageUrl?: string;

  @IsUrl()
  @IsOptional()
  trailerUrl?: string;

  @IsNumber()
  @Min(0)
  @Max(10)
  @IsOptional()
  imdbRating?: number;

  @IsString()
  @IsOptional()
  language?: string;

  @IsEnum(validStatuses, {
    message: `Status must be one of: ${validStatuses.join(', ')}`,
  })
  @IsOptional()
  status?: 'now_showing' | 'coming_soon' | 'ended';

  @IsBoolean()
  @IsOptional()
  isTopMovie?: boolean;

  @IsString()
  @IsOptional()
  ageRating?: string;
}

/**
 * DTO cho Update. Tất cả các trường đều là Optional.
 * Chúng ta không cần extends PartialType, chỉ cần
 * dùng lại CreateMovieDto và controller sẽ tự hiểu (vì ta skip missing properties)
 */
export class UpdateMovieDto extends CreateMovieDto {
  // Kế thừa tất cả các trường, nhưng controller sẽ validate
  // chúng như là optional.
}