import { IsString, IsNotEmpty, MaxLength, IsOptional } from 'class-validator';

/**
 * @swagger
 * components:
 * schemas:
 * CreateRegionDto:
 * type: object
 * required:
 * - name
 * properties:
 * name:
 * type: string
 * description: Tên khu vực mới
 * example: "Đà Nẵng"
 */
export class CreateRegionDto {
  @IsString({ message: 'Tên khu vực phải là chuỗi' })
  @IsNotEmpty({ message: 'Tên khu vực không được để trống' })
  @MaxLength(100)
  name!: string; // Thêm '!' để fix lỗi ts(2564)
}

/**
 * @swagger
 * components:
 * schemas:
 * UpdateRegionDto:
 * type: object
 * properties:
 * name:
 * type: string
 * description: Tên khu vực cập nhật
 * example: "Đà Nẵng - Quảng Nam"
 */
export class UpdateRegionDto {
  @IsString({ message: 'Tên khu vực phải là chuỗi' })
  @IsNotEmpty({ message: 'Tên khu vực không được để trống' })
  @MaxLength(100)
  @IsOptional()
  name?: string;
}