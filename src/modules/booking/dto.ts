// src/modules/booking/dto.ts
export interface CreateBookingDTO {
  showtimeId: string;
  seats: string[]; // e.g. ["A1","A2"]
  paymentMethod: 'momo' | 'credit_card' | 'cash' | string;
  // optional metadata:
  metadata?: Record<string, any>;
}

export interface ConfirmPaymentDTO {
  bookingId: string;
  paymentStatus: 'success' | 'failed';
  transactionId?: string;
}
