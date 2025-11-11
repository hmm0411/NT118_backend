import { Timestamp } from "firebase-admin/firestore";

// types.ts
export interface Booking {
  id: string;
  userId: string;
  sessionId: string;
  showtime: string;
  seats: string[];
  totalPrice: number;
  status: 'pending' | 'paid' | 'cancelled';
  createdAt: Timestamp;
}
