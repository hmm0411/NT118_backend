import { IsString, IsNotEmpty, MaxLength, IsOptional } from 'class-validator';

export class CreateCinemaDto {
  @IsString()
  @IsNotEmpty({ message: 'Tên rạp không được để trống' })
  @MaxLength(100)
  name!: string;

  @IsString()
  @IsNotEmpty({ message: 'Địa chỉ không được để trống' })
  @MaxLength(200)
  address!: string;

  @IsString()
  @IsNotEmpty({ message: 'ID Khu vực không được để trống' })
  regionId!: string;
}

export class UpdateCinemaDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @IsOptional()
  name?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  @IsOptional()
  address?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  regionId?: string;
}