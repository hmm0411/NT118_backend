// src/modules/booking/service.ts
import { firebaseDB } from '../../config/firebase';
import { CreateBookingDTO, ConfirmPaymentDTO } from './dto';
import { v4 as uuidv4 } from 'uuid';
import { SeatNode, Booking, Showtime } from './types';
import * as qrcode from '../../utils/qrcode';

const BOOKINGS_REF = 'bookings';
const SHOWTIMES_REF = 'showtimes';
const RESERVATION_TTL_MS = 5 * 60 * 1000; // 5 phút để thanh toán

/**
 * Tạo booking: dùng Firestore transaction để đảm bảo ghế chưa bị người khác đặt
 */
export async function createBooking(userId: string, data: CreateBookingDTO) {
  if (!data.showtimeId) throw new Error('showtimeId is required');
  if (!Array.isArray(data.seats) || data.seats.length === 0)
    throw new Error('seats required');

  const bookingId = uuidv4();
  const now = Date.now();
  const reservedUntil = now + RESERVATION_TTL_MS;

  const showtimeRef = firebaseDB.collection(SHOWTIMES_REF).doc(data.showtimeId);
  const bookingRef = firebaseDB.collection(BOOKINGS_REF).doc(bookingId);

  await firebaseDB.runTransaction(async (tx) => {
    const showSnap = await tx.get(showtimeRef);
    if (!showSnap.exists) throw new Error('Showtime not found');
    const showtime = showSnap.data() as Showtime;
    const seats = showtime.seats || {};

    // Kiểm tra tất cả ghế yêu cầu
    for (const seatId of data.seats) {
      const seat: SeatNode = seats[seatId];
      if (!seat) throw new Error(`Seat ${seatId} not found`);
      if (seat.state === 'booked') throw new Error(`Seat ${seatId} already booked`);
      if (seat.state === 'reserved') {
        const reservedUntilExisting = seat.reservedUntil ?? 0;
        if (reservedUntilExisting > now && seat.reservedBy !== bookingId) {
          throw new Error(`Seat ${seatId} is reserved`);
        }
      }
    }

    // Gán reserved cho các ghế
    for (const seatId of data.seats) {
      seats[seatId] = {
        state: 'reserved',
        reservedBy: bookingId,
        reservedUntil,
      };
    }

    tx.update(showtimeRef, { seats });

    // Tạo booking
    const pricePerSeat = showtime.pricePerSeat ?? 90000;
    const totalPrice = pricePerSeat * data.seats.length;

    const bookingData: Booking = {
      id: bookingId,
      userId,
      showtimeId: data.showtimeId,
      seats: data.seats,
      totalPrice,
      status: 'pending_payment',
      paymentMethod: data.paymentMethod,
      transactionId: null,
      createdAt: now,
      reservedUntil,
      qrCode: null,
    };

    tx.set(bookingRef, bookingData);
  });

  const paymentHint = {
    bookingId,
    amount: 90000 * data.seats.length,
    currency: 'VND',
  };

  const bookingSnap = await bookingRef.get();
  return { booking: bookingSnap.data(), paymentHint };
}

/**
 * Giải phóng ghế nếu thất bại hoặc hủy
 */
async function releaseSeatsOnFailure(showtimeId: string, seats: string[], bookingId: string) {
  const showtimeRef = firebaseDB.collection(SHOWTIMES_REF).doc(showtimeId);
  await firebaseDB.runTransaction(async (tx) => {
    const snap = await tx.get(showtimeRef);
    if (!snap.exists) return;
    const data = snap.data() as Showtime;
    const allSeats = data.seats || {};

    for (const seatId of seats) {
      const seat = allSeats[seatId];
      if (seat && seat.state === 'reserved' && seat.reservedBy === bookingId) {
        allSeats[seatId] = { state: 'available' };
      }
    }
    tx.update(showtimeRef, { seats: allSeats });
  });
}

/**
 * Xác nhận thanh toán
 */
export async function confirmPayment(data: ConfirmPaymentDTO) {
  const bookingRef = firebaseDB.collection(BOOKINGS_REF).doc(data.bookingId);
  const bookingSnap = await bookingRef.get();
  if (!bookingSnap.exists) throw new Error('Booking not found');
  const booking = bookingSnap.data() as Booking;

  if (booking.status === 'confirmed') return booking;

  if (data.paymentStatus !== 'success') {
    await bookingRef.update({
      status: 'failed',
      transactionId: data.transactionId ?? null,
    });
    await releaseSeatsOnFailure(booking.showtimeId, booking.seats, booking.id);
    return { ...booking, status: 'failed' };
  }

  // Thanh toán thành công → mark booked
  const showtimeRef = firebaseDB.collection(SHOWTIMES_REF).doc(booking.showtimeId);

  await firebaseDB.runTransaction(async (tx) => {
    const showSnap = await tx.get(showtimeRef);
    if (!showSnap.exists) throw new Error('Showtime not found');
    const showtime = showSnap.data() as Showtime;
    const seats = showtime.seats || {};

    for (const seatId of booking.seats) {
      const seat = seats[seatId];
      if (!seat) throw new Error(`Seat ${seatId} missing`);
      if (seat.state === 'booked') throw new Error(`Seat ${seatId} already booked`);
      if (seat.state === 'reserved') {
        const now = Date.now();
        if (seat.reservedBy !== booking.id && (seat.reservedUntil ?? 0) > now)
          throw new Error(`Seat ${seatId} reserved by another`);
      }
    }

    // Mark booked
    for (const seatId of booking.seats) {
      seats[seatId] = {
        state: 'booked',
        bookedBy: booking.id,
      };
    }

    tx.update(showtimeRef, { seats });
    const qr = await qrcode.generate(`BOOKING:${booking.id}`);
    tx.update(bookingRef, {
      status: 'confirmed',
      transactionId: data.transactionId ?? null,
      qrCode: qr,
      reservedUntil: null,
    });
  });

  const updated = await bookingRef.get();
  return updated.data();
}

/**
 * Lấy danh sách showtimes
 */
export async function getShowtimes(filter?: {
  movieId?: string;
  dateFrom?: number;
  dateTo?: number;
}) {
  let query = firebaseDB.collection(SHOWTIMES_REF) as FirebaseFirestore.Query;
  if (filter?.movieId) query = query.where('movieId', '==', filter.movieId);
  if (filter?.dateFrom) query = query.where('startAt', '>=', filter.dateFrom);
  if (filter?.dateTo) query = query.where('startAt', '<=', filter.dateTo);

  const snap = await query.get();
  return snap.docs.map((d) => d.data() as Showtime);
}

/**
 * Lấy chi tiết showtime (bao gồm ghế)
 */
export async function getShowtimeDetail(showtimeId: string) {
  const snap = await firebaseDB.collection(SHOWTIMES_REF).doc(showtimeId).get();
  if (!snap.exists) throw new Error('Showtime not found');
  return snap.data() as Showtime;
}

/**
 * Lấy tất cả booking của user
 */
export async function getUserBookings(userId: string) {
  const snap = await firebaseDB
    .collection(BOOKINGS_REF)
    .where('userId', '==', userId)
    .get();
  return snap.docs.map((d) => d.data() as Booking);
}

/**
 * Hủy booking
 */
export async function cancelBooking(userId: string, bookingId: string) {
  const bookingRef = firebaseDB.collection(BOOKINGS_REF).doc(bookingId);
  const snap = await bookingRef.get();
  if (!snap.exists) throw new Error('Booking not found');

  const booking = snap.data() as Booking;
  if (booking.userId !== userId) throw new Error('Permission denied');
  if (booking.status === 'confirmed') throw new Error('Cannot cancel a confirmed booking');

  await bookingRef.update({ status: 'cancelled', cancelledAt: Date.now() });
  await releaseSeatsOnFailure(booking.showtimeId, booking.seats, bookingId);

  const updated = await bookingRef.get();
  return updated.data();
}
