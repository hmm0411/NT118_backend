export interface Seat {
  id: string;
  showtimeId: string;
  seatNumber: string;
  status: "available" | "booked";
  createdAt: Date;
  updatedAt: Date;
}
