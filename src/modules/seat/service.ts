import { firebaseDB } from '../../config/firebase';
import { Seat } from './types';

const seatCollection = firebaseDB.collection("seats");

export const getSeatsByShowtime = async (showtimeId: string): Promise<Seat[]> => {
  const seatDoc = await firebaseDB.collection('seats').doc(showtimeId).get();

  if (!seatDoc.exists) {
    const defaultSeats: Seat[] = generateDefaultSeats();
    await firebaseDB.collection('seats').doc(showtimeId).set({ seats: defaultSeats });
    return defaultSeats;
  }

  const data = seatDoc.data();
  return data?.seats || [];
};

export async function findUnavailableSeats(showtimeId: string, seats: string[]): Promise<string[]> {
  const seatDoc = await seatCollection.doc(showtimeId).get();
  if (!seatDoc.exists) return [];

  const data = seatDoc.data();
  const bookedSeats = (data?.seats || [])
    .filter((s: Seat) => s.isBooked)
    .map((s: Seat) => s.seatId);

  return seats.filter(s => bookedSeats.includes(s));
}

export const updateSeatStatus = async (showtimeId: string, seats: string[], status: boolean) => {
  const seatRef = firebaseDB.collection('seats').doc(showtimeId);
  const seatDoc = await seatRef.get();

  if (!seatDoc.exists) throw new Error('Showtime không tồn tại trong seats');

  const current = seatDoc.data()?.seats || [];
  const updated = current.map((s: Seat) =>
    seats.includes(s.seatId) ? { ...s, isBooked: status } : s
  );

  await seatRef.update({ seats: updated });
  return updated;
};

const generateDefaultSeats = (): Seat[] => {
  const rows = 'ABCDEFGHIJ';
  const seats: Seat[] = [];
  for (const r of rows) {
    for (let n = 1; n <= 10; n++) {
      seats.push({ seatId: `${r}${n}`, isBooked: false });
    }
  }
  return seats;
};
