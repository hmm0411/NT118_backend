import { firebaseDB } from '../../config/firebase';
import { ProcessPaymentDto } from './dto';
import { BookingStatus, BookingDocument } from '../booking/model';
import { SeatStatus } from '../showtime/model';
import { Timestamp } from 'firebase-admin/firestore';
import { ApiError } from '../../utils/ApiError';
import QRCode from 'qrcode';

const BOOKING_COLLECTION = 'bookings';
const SHOWTIME_COLLECTION = 'showtimes';

export class PaymentService {
  private bookingCol = firebaseDB.collection(BOOKING_COLLECTION);
  private showtimeCol = firebaseDB.collection(SHOWTIME_COLLECTION);

  async processPayment(userId: string, dto: ProcessPaymentDto): Promise<any> {
    const bookingRef = this.bookingCol.doc(dto.bookingId);

    // Dùng Transaction để đảm bảo: Tiền trừ thì Vé phải có
    return await firebaseDB.runTransaction(async (transaction) => {
      // 1. Lấy thông tin Booking
      const bookingDoc = await transaction.get(bookingRef);
      if (!bookingDoc.exists) {
        throw new ApiError(404, 'Booking không tồn tại');
      }
      
      const bookingData = bookingDoc.data() as BookingDocument;

      // 2. Validate quyền sở hữu
      if (bookingData.userId !== userId) {
        throw new ApiError(403, 'Booking này không phải của bạn');
      }

      // 3. Validate trạng thái
      if (bookingData.status === BookingStatus.PAID) {
        throw new ApiError(400, 'Booking này đã thanh toán rồi');
      }
      if (bookingData.status === BookingStatus.CANCELLED) {
        throw new ApiError(400, 'Booking này đã bị hủy do hết hạn');
      }

      // 4. Validate thời gian (Cronjob chưa chạy thì mình chặn ở đây)
      const now = Timestamp.now();
      if (bookingData.expiresAt.toMillis() < now.toMillis()) {
        throw new ApiError(400, 'Booking đã hết thời gian giữ ghế. Vui lòng đặt lại.');
      }

      // 5. Tạo nội dung QR Code (Dùng để nhân viên rạp quét)
      // Lưu ý: Nên lưu ít thông tin thôi để QR đỡ phức tạp
      const qrContent = JSON.stringify({
        bid: dto.bookingId,
        uid: userId,
        seats: bookingData.seats
      });
      
      // Tạo ảnh Base64
      const qrCodeBase64 = await QRCode.toDataURL(qrContent);

      // 6. Update BOOKING (Pending -> Paid)
      transaction.update(bookingRef, {
        status: BookingStatus.PAID,
        paymentMethod: dto.paymentMethod,
        paymentAt: now, // Lưu Timestamp trực tiếp như bạn muốn
        qrCode: qrCodeBase64,
        updatedAt: now
      });

      // 7. Update SHOWTIME (Held -> Sold)
      // Bước này quan trọng để ghế chuyển sang màu đỏ (đã bán) vĩnh viễn
      const showtimeRef = this.showtimeCol.doc(bookingData.showtimeId);
      const seatUpdates: any = {};
      
      bookingData.seats.forEach(seatCode => {
        seatUpdates[`seatMap.${seatCode}.status`] = SeatStatus.SOLD;
      });

      transaction.update(showtimeRef, seatUpdates);

      return {
        success: true,
        message: "Thanh toán thành công",
        bookingId: dto.bookingId,
        qrCode: qrCodeBase64
      };
    });
  }
}