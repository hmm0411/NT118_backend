import { firebaseDB } from '../../config/firebase';
import { CreateBookingDto } from './dto';
import { Booking, BookingDocument, BookingStatus } from './model'; // Import từ model
import { SeatStatus, ShowtimeDocument } from '../showtime/model'; 
import { Timestamp } from 'firebase-admin/firestore';
import { ApiError } from '../../utils/ApiError';

const BOOKING_COLLECTION = 'bookings';
const SHOWTIME_COLLECTION = 'showtimes';

export class BookingService {
  private bookingCol = firebaseDB.collection(BOOKING_COLLECTION);
  private showtimeCol = firebaseDB.collection(SHOWTIME_COLLECTION);

  /**
   * Helper chuyển đổi Document sang Model chuẩn
   */
  private toBooking(doc: FirebaseFirestore.DocumentSnapshot): Booking {
    const data = doc.data() as BookingDocument;
    return {
      id: doc.id,
      ...data,
      showtimeDate: (data.showtimeDate as Timestamp).toDate(),
      createdAt: (data.createdAt as Timestamp).toDate(),
      updatedAt: (data.updatedAt as Timestamp).toDate(),
      expiresAt: (data.expiresAt as Timestamp).toDate(),
    };
  }

  /**
   * Tạo Booking & Giữ ghế (Transaction)
   */
  async createBooking(userId: string, dto: CreateBookingDto): Promise<Booking> {
    const showtimeRef = this.showtimeCol.doc(dto.showtimeId);
    const bookingRef = this.bookingCol.doc(); // Tạo ID trước

    const now = Timestamp.now();
    // Giữ ghế trong 10 phút
    const expiresAt = Timestamp.fromMillis(now.toMillis() + 10 * 1000); 

    return await firebaseDB.runTransaction(async (transaction) => {
      // 1. Đọc document Showtime
      const showtimeDoc = await transaction.get(showtimeRef);
      if (!showtimeDoc.exists) {
        throw new ApiError(404, 'Suất chiếu không tồn tại');
      }

      const showtimeData = showtimeDoc.data() as ShowtimeDocument;
      const seatMap = showtimeData.seatMap;
      
      // 2. Validate & Update trạng thái ghế trong RAM
      let calculatedTotalPrice = 0;
      const seatUpdates: any = {}; // Object để update từng field cụ thể

      for (const seatCode of dto.seats) {
        const seat = seatMap[seatCode];

        if (!seat) {
          throw new ApiError(400, `Ghế ${seatCode} không tồn tại`);
        }

        if (seat.status !== SeatStatus.AVAILABLE) {
          throw new ApiError(400, `Ghế ${seatCode} đã được đặt`);
        }

        calculatedTotalPrice += seat.price;

        // Chuẩn bị lệnh update nested field
        seatUpdates[`seatMap.${seatCode}.status`] = SeatStatus.HELD;
        seatUpdates[`seatMap.${seatCode}.userId`] = userId;
      }

      // 3. Thực hiện Update Firestore (Showtime)
      transaction.update(showtimeRef, seatUpdates);

      // 4. Tạo Booking Document
      const newBooking: BookingDocument = {
        userId,
        showtimeId: dto.showtimeId,
        movieTitle: showtimeData.movieTitle,
        cinemaName: showtimeData.cinemaName,
        roomName: showtimeData.roomName,
        showtimeDate: showtimeData.startTime,
        seats: dto.seats,
        seatPrice: calculatedTotalPrice / dto.seats.length, // Giá trung bình
        totalPrice: calculatedTotalPrice,
        status: BookingStatus.PENDING,
        createdAt: now,
        updatedAt: now,
        expiresAt: expiresAt
      };

      transaction.set(bookingRef, newBooking);

      // Trả về dữ liệu đã format
      return {
        id: bookingRef.id,
        ...newBooking,
        showtimeDate: newBooking.showtimeDate.toDate(),
        createdAt: newBooking.createdAt.toDate(),
        updatedAt: newBooking.updatedAt.toDate(),
        expiresAt: newBooking.expiresAt.toDate(),
      };
    });
  }

  /**
   * Lấy danh sách booking của User
   */
  async getMyBookings(userId: string): Promise<Booking[]> {
    const snapshot = await this.bookingCol
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map(this.toBooking);
  }

  /**
   * Lấy chi tiết booking
   */
  async getBookingById(bookingId: string, userId: string): Promise<Booking> {
    const doc = await this.bookingCol.doc(bookingId).get();
    if (!doc.exists) throw new ApiError(404, 'Booking không tìm thấy');

    const booking = this.toBooking(doc);

    if (booking.userId !== userId) {
      throw new ApiError(403, 'Bạn không có quyền xem booking này');
    }

    return booking;
  }
}