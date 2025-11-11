// src/modules/booking/dto.ts

export class CreateBookingDto {
  sessionId!: string;
  showtime!: string;
  seats!: string[]; // Ví dụ: ["A1", "A2"]
  totalPrice!: number; // Server nên xác thực lại giá này
}