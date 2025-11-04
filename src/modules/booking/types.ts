// src/modules/booking/types.ts
export type SeatState = 'available' | 'reserved' | 'booked';

export interface SeatNode {
  state: SeatState;
  reservedBy?: string;     // bookingId that reserved it
  reservedUntil?: number;  // timestamp ms
  bookedBy?: string;       // bookingId that booked it
}

export interface Showtime {
  id: string;
  movieId: string;
  movieTitle?: string;
  cinemaId?: string;
  startAt: number; // timestamp ms
  pricePerSeat: number;
  seats: Record<string, SeatNode>;
}

export interface Booking {
  id: string;
  userId: string;
  showtimeId: string;
  seats: string[];
  totalPrice: number;
  status: 'pending_payment' | 'confirmed' | 'cancelled' | 'failed';
  paymentMethod: string;
  transactionId?: string | null;
  createdAt: number;
  reservedUntil?: number;
  qrCode?: string | null;
}
