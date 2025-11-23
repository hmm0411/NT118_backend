import { IsString, IsNotEmpty, IsEnum, IsNumber, Min, IsOptional, IsDateString, MaxLength } from 'class-validator';
import { DiscountType } from './model';

export class CreateVoucherDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  code!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsEnum(DiscountType)
  discountType!: DiscountType;

  @IsNumber()
  @Min(1)
  discountValue!: number;

  @IsNumber()
  @IsOptional()
  maxDiscount?: number;

  @IsNumber()
  @Min(0)
  minOrderValue!: number;

  @IsNumber()
  @Min(1)
  usageLimit!: number;

  @IsDateString()
  validFrom!: string; // ISO Date String

  @IsDateString()
  validTo!: string;
}

export class ApplyVoucherDto {
  @IsString()
  @IsNotEmpty()
  code!: string;

  @IsNumber()
  @Min(0)
  orderTotal!: number; // Tổng tiền đơn hàng hiện tại (để check điều kiện)
}