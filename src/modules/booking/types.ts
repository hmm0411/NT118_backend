// types.ts
export interface Booking {
  id?: string;
  userId: string;
  showtimeId: string;
  seats: string[];
  totalPrice: number;
  status: 'pending' | 'paid' | 'cancelled';
  createdAt: Date;
}
