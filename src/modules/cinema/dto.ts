import { IsString, IsNotEmpty, MaxLength, IsOptional } from 'class-validator';

/**
 * @swagger
 * components:
 * schemas:
 * CreateCinemaDto:
 * type: object
 * required:
 * - name
 * - address
 * - regionId
 * properties:
 * name:
 * type: string
 * example: "CGV Vincom"
 * address:
 * type: string
 * example: "123 Nguyễn Trãi, Quận 1"
 * regionId:
 * type: string
 * example: "clx123abc456"
 */
export class CreateCinemaDto {
  @IsString()
  @IsNotEmpty({ message: 'Tên rạp không được để trống' })
  @MaxLength(100)
  name!: string; // Thêm '!' để fix lỗi ts(2564)

  @IsString()
  @IsNotEmpty({ message: 'Địa chỉ không được để trống' })
  @MaxLength(200)
  address!: string; // Thêm '!'

  @IsString()
  @IsNotEmpty({ message: 'ID Khu vực không được để trống' })
  regionId!: string; // Thêm '!'
}

/**
 * @swagger
 * components:
 * schemas:
 * UpdateCinemaDto:
 * type: object
 * properties:
 * name:
 * type: string
 * example: "CGV Vincom Center"
 * address:
 * type: string
 * example: "123 Nguyễn Trãi, Quận 1"
 * regionId:
 * type: string
 * example: "clx123abc456"
 */
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