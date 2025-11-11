// src/modules/booking/service.ts

import { firebaseDB } from '../../config/firebase';
import { CreateBookingDto } from './dto';
import { Booking } from './types'; // 🔹 Dùng type đã cập nhật
import { Seat } from '../seat/types';
import { Timestamp } from 'firebase-admin/firestore';

const bookingCollection = firebaseDB.collection("bookings");
const seatCollection = firebaseDB.collection("seats");

/**
 * 🔹 HÀM 1: TẠO BOOKING MỚI (DÙNG TRANSACTION)
 */
export const createBooking = async (
  userId: string,
  dto: CreateBookingDto
): Promise<Booking> => {
  
  const seatRef = seatCollection.doc(dto.sessionId);
  const bookingRef = bookingCollection.doc(); // Tạo ID mới

  // Chạy toàn bộ logic trong một TRANSACTION
  return firebaseDB.runTransaction(async (transaction) => {
    // 1. Đọc document seats
    const seatDoc = await transaction.get(seatRef);

    if (!seatDoc.exists) {
      throw new Error('Session (suất chiếu) không tồn tại.');
    }

    const data = seatDoc.data();
    const showtimeField = `${dto.showtime}.seats`;

    if (!data || !data[dto.showtime] || !data[dto.showtime].seats) {
      throw new Error('Showtime (giờ chiếu) không tồn tại.');
    }

    const currentSeats: Seat[] = data[dto.showtime].seats;

    // 2. Kiểm tra xung đột (seat availability)
    const alreadyBooked = currentSeats
      .filter(s => dto.seats.includes(s.seatId) && s.isBooked === true)
      .map(s => s.seatId);

    if (alreadyBooked.length > 0) {
      throw new Error(`Ghế ${alreadyBooked.join(', ')} đã được người khác đặt.`);
    }

    // 3. Cập nhật document seats (đặt isBooked: true)
    const updatedSeats = currentSeats.map((s: Seat) =>
      dto.seats.includes(s.seatId) ? { ...s, isBooked: true } : s
    );

    transaction.update(seatRef, {
      [showtimeField]: updatedSeats
    });

    // 4. Tạo document booking mới (dựa trên type của bạn)
    const newBooking: Booking = {
      id: bookingRef.id, // 🔹 Gán ID từ ref
      userId: userId,
      sessionId: dto.sessionId,
      showtime: dto.showtime, // 🔹 Thêm showtime
      seats: dto.seats,
      totalPrice: dto.totalPrice,
      createdAt: Timestamp.now(), // 🔹 Dùng Timestamp
      status: 'pending', // 🔹 Trạng thái mặc định là 'pending'
    };

    // 5. Ghi vào collection 'bookings'
    transaction.set(bookingRef, newBooking);

    // 6. Trả về booking mới
    return newBooking;
  });
};

/**
 * 🔹 HÀM 2: LẤY TẤT CẢ BOOKING CỦA USER
 */
export const getMyBookings = async (userId: string): Promise<Booking[]> => {
  const snapshot = await bookingCollection
    .where('userId', '==', userId)
    .orderBy('createdAt', 'desc') // 🔹 Sắp xếp mới nhất lên đầu
    .get();

  if (snapshot.empty) {
    return [];
  }

  return snapshot.docs.map(doc => doc.data() as Booking);
};

/**
 * 🔹 HÀM 3: LẤY CHI TIẾT 1 BOOKING BẰNG ID
 */
export const getBookingById = async (bookingId: string, userId: string): Promise<Booking> => {
  const doc = await bookingCollection.doc(bookingId).get();

  if (!doc.exists) {
    // 🔹 Sẽ bị bắt bởi error handler (404)
    throw new Error('Không tìm thấy booking này.'); 
  }

  const booking = doc.data() as Booking;

  // 🔹 QUAN TRỌNG: Kiểm tra xem user này có phải chủ của booking không
  if (booking.userId !== userId) {
    // 🔹 Sẽ bị bắt bởi error handler (403)
    throw new Error('Bạn không có quyền xem booking này.'); 
  }

  return booking;
};