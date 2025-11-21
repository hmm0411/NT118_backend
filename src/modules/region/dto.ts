import { IsString, IsNotEmpty, MaxLength, IsOptional } from 'class-validator';

export class CreateRegionDto {
  @IsString({ message: 'Tên khu vực phải là chuỗi' })
  @IsNotEmpty({ message: 'Tên khu vực không được để trống' })
  @MaxLength(100)
  name!: string;
}

export class UpdateRegionDto {
  @IsString({ message: 'Tên khu vực phải là chuỗi' })
  @IsNotEmpty({ message: 'Tên khu vực không được để trống' })
  @MaxLength(100)
  @IsOptional()
  name?: string;
}