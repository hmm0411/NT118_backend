// src/modules/seat/service.ts

import { firebaseDB } from '../../config/firebase';
import { Seat } from './types';

const seatCollection = firebaseDB.collection("seats");

/**
 * Lấy danh sách ghế cho một showtime cụ thể của session.
 * Nếu session hoặc showtime chưa tồn tại, tự động tạo mới.
 */
export const getSeatsBySession = async (sessionId: string, showtime: string): Promise<Seat[]> => {
  const seatRef = seatCollection.doc(sessionId);
  const seatDoc = await seatRef.get();

  const defaultSeats: Seat[] = generateDefaultSeats();

  // 🔹 Dùng cú pháp "dot notation" để truy cập trường lồng
  const showtimeField = `${showtime}.seats`;

  if (!seatDoc.exists) {
    // 🔹 Nếu document session chưa có, tạo mới với showtime đầu tiên
    await seatRef.set({
      [showtime]: { seats: defaultSeats }
    });
    return defaultSeats;
  }

  const data = seatDoc.data();

  // 🔹 Nếu session đã có, nhưng showtime này chưa có
  if (!data || !data[showtime] || !data[showtime].seats) {
    // 🔹 Cập nhật document, thêm mảng ghế cho showtime mới
    await seatRef.update({
      [showtimeField]: defaultSeats
    });
    return defaultSeats;
  }

  // 🔹 Trả về mảng ghế của showtime đã có
  return data[showtime].seats;
};

/**
 * Cập nhật trạng thái ghế (đặt/huỷ) cho showtime cụ thể, sử dụng Transaction.
 */
export const updateSeatStatus = async (
  sessionId: string,
  showtime: string,
  seatsToUpdate: string[],
  status: boolean
): Promise<Seat[]> => {
  const seatRef = seatCollection.doc(sessionId);
  
  // 🔹 Dùng "dot notation" để update trường lồng một cách an toàn
  const showtimeField = `${showtime}.seats`; 

  return firebaseDB.runTransaction(async (transaction) => {
    const seatDoc = await transaction.get(seatRef);

    if (!seatDoc.exists) {
      throw new Error('Session (suất chiếu) không tồn tại.');
    }

    const data = seatDoc.data();
    
    // 🔹 Kiểm tra xem showtime này có mảng ghế không
    if (!data || !data[showtime] || !data[showtime].seats) {
      // Lỗi này không nên xảy ra nếu client đã gọi getSeatsBySession trước
      throw new Error('Showtime (giờ chiếu) không tồn tại cho session này.');
    }

    const currentSeats: Seat[] = data[showtime].seats;

    // 🔹 Bước 1: Kiểm tra xung đột (chỉ khi đặt vé)
    if (status === true) {
      const alreadyBooked = currentSeats
        .filter(s => seatsToUpdate.includes(s.seatId) && s.isBooked === true)
        .map(s => s.seatId);

      if (alreadyBooked.length > 0) {
        throw new Error(`Ghế ${alreadyBooked.join(', ')} đã được người khác đặt.`);
      }
    }

    // 🔹 Bước 2: Tạo mảng ghế mới
    const updatedSeats = currentSeats.map((s: Seat) =>
      seatsToUpdate.includes(s.seatId) ? { ...s, isBooked: status } : s
    );

    // 🔹 Bước 3: Cập nhật trường lồng bên trong transaction
    transaction.update(seatRef, {
      [showtimeField]: updatedSeats
    });

    // 🔹 Bước 4: Trả về danh sách ghế đã cập nhật
    return updatedSeats;
  });
};

/**
 * Tìm các ghế đã được đặt trong danh sách ghế yêu cầu cho một showtime.
 */
// 🔹 Thêm showtime vào hàm này
export async function findUnavailableSeats(sessionId: string, showtime: string, seats: string[]): Promise<string[]> {
  const seatDoc = await seatCollection.doc(sessionId).get();
  
  if (!seatDoc.exists) return [];

  const data = seatDoc.data();
  
  // 🔹 Kiểm tra sự tồn tại của showtime
  if (!data || !data[showtime] || !data[showtime].seats) {
    return [];
  }

  const bookedSeats = (data[showtime].seats || [])
    .filter((s: Seat) => s.isBooked)
    .map((s: Seat) => s.seatId);

  return seats.filter(s => bookedSeats.includes(s));
}

/**
 * Hàm helper tạo danh sách ghế mặc định
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