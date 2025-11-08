import { firebaseDB } from '../../config/firebase';
import { Seat } from './types';

/**
 * Lấy danh sách ghế của một suất chiếu
 */
export const getSeatsByShowtime = async (showtimeId: string): Promise<Seat[]> => {
  const seatDoc = await firebaseDB.collection('seats').doc(showtimeId).get();

  if (!seatDoc.exists) {
    // nếu chưa có layout, khởi tạo mặc định
    const defaultSeats: Seat[] = generateDefaultSeats();
    await firebaseDB.collection('seats').doc(showtimeId).set({ seats: defaultSeats });
    return defaultSeats;
  }

  const data = seatDoc.data();
  return data?.seats || [];
};

/**
 * Cập nhật trạng thái ghế (đặt hoặc huỷ)
 */
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

/**
 * Tạo sơ đồ ghế mặc định (10 hàng x 10 ghế = 100 ghế)
 */
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
