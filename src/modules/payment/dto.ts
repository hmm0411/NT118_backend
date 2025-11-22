import { IsNotEmpty, IsString, IsIn } from 'class-validator';

export class ProcessPaymentDto {
  @IsString()
  @IsNotEmpty()
  bookingId!: string;

  @IsString()
  @IsIn(['momo', 'zalopay', 'card', 'simulator'], { message: 'Phương thức thanh toán không hợp lệ' })
  paymentMethod!: string;
}