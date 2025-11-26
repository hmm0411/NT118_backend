import { firebaseDB } from '../../config/firebase';
import { ProcessPaymentDto } from './dto';
import { BookingStatus, BookingDocument } from '../booking/model';
import { SeatStatus } from '../showtime/model';
import { MembershipRank } from '../user/model';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';
import { ApiError } from '../../utils/ApiError';
import QRCode from 'qrcode';
import { ZaloPayService } from './zalopay.service';

const BOOKING_COLLECTION = 'bookings';
const SHOWTIME_COLLECTION = 'showtimes';
const USER_COLLECTION = 'users';
const VOUCHER_COLLECTION = 'vouchers';

export class PaymentService {
  private zalopayService = new ZaloPayService();
  private bookingCol = firebaseDB.collection(BOOKING_COLLECTION);
  private showtimeCol = firebaseDB.collection(SHOWTIME_COLLECTION);

  /**
   * Xử lý yêu cầu thanh toán từ Client
   */
  async processPayment(userId: string, dto: ProcessPaymentDto): Promise<any> {
    const bookingRef = this.bookingCol.doc(dto.bookingId);
    const bookingDoc = await bookingRef.get();

    if (!bookingDoc.exists) throw new ApiError(404, 'Booking không tồn tại');
    const bookingData = bookingDoc.data() as BookingDocument;

    // 1. Validate
    if (bookingData.userId !== userId) throw new ApiError(403, 'Booking này không phải của bạn');
    if (bookingData.status === BookingStatus.PAID) throw new ApiError(400, 'Booking này đã thanh toán rồi');
    if (bookingData.status === BookingStatus.CANCELLED) throw new ApiError(400, 'Booking này đã bị hủy');
    
    const now = Timestamp.now();
    if (bookingData.expiresAt.toMillis() < now.toMillis()) {
      throw new ApiError(400, 'Booking đã hết thời gian giữ ghế. Vui lòng đặt lại.');
    }

    // 2. XỬ LÝ THEO PHƯƠNG THỨC THANH TOÁN

    // === NHÁNH ZALOPAY ===
    if (dto.paymentMethod === 'zalopay') {
      console.log("🚀 [Payment] Processing ZaloPay for Booking:", dto.bookingId);
      
      // Gọi ZaloPay để lấy Link
      const zaloResponse = await this.zalopayService.createPaymentOrder(
        dto.bookingId,
        bookingData.totalPrice,
        userId
      );

      // Trả về Link thanh toán (KHÔNG chốt đơn ngay)
      return {
        paymentUrl: zaloResponse.orderUrl,
        appTransId: zaloResponse.appTransId,
        message: "Vui lòng thanh toán qua ZaloPay"
      };
    }

    // === NHÁNH SIMULATOR (GIẢ LẬP) ===
    if (dto.paymentMethod === 'simulator') {
      console.log("🚀 [Payment] Processing Simulator for Booking:", dto.bookingId);
      // Chốt đơn ngay lập tức
      return await this.finalizeBooking(dto.bookingId, userId, 'simulator');
    }

    throw new ApiError(400, 'Phương thức thanh toán không hỗ trợ');
  }

  /**
   * Xử lý Webhook từ ZaloPay
   */
  async handleZaloPayCallback(body: any) {
    const verify = this.zalopayService.verifyCallback(body);
    if (!verify.isValid) {
      return { return_code: -1, return_message: "Mac not matched" };
    }

    const data = verify.data; 
    const embedData = JSON.parse(data.embed_data);
    const bookingId = embedData.bookingId;
    const userId = embedData.userId;

    console.log(`💰 [Webhook] Received success callback for Booking ${bookingId}`);

    try {
      await this.finalizeBooking(bookingId, userId, 'zalopay');
      return { return_code: 1, return_message: "success" };
    } catch (error) {
      console.error("Finalize Error:", error);
      return { return_code: 0, return_message: "Internal Server Error" };
    }
  }

  /**
   * Logic chung: Chốt đơn, Update DB, Tạo QR
   */
  private async finalizeBooking(bookingId: string, userId: string, method: string) {
    return await firebaseDB.runTransaction(async (transaction) => {
      const bookingRef = this.bookingCol.doc(bookingId);
      const bookingDoc = await transaction.get(bookingRef);
      
      if (!bookingDoc.exists) throw new ApiError(404, 'Booking not found');
      const bookingData = bookingDoc.data() as BookingDocument;

      if (bookingData.status === BookingStatus.PAID) {
        return { message: "Booking đã được thanh toán trước đó" };
      }

      // === 1. LOGIC TÍCH ĐIỂM & THĂNG HẠNG (MỚI THÊM) ===
      const userRef = firebaseDB.collection(USER_COLLECTION).doc(userId);
      const userDoc = await transaction.get(userRef);
      
      if (userDoc.exists) {
        const userData = userDoc.data();
        
        // Tích điểm: 5% giá trị đơn hàng
        const pointsEarned = Math.floor(bookingData.totalPrice * 0.05);
        
        // Tính tổng chi tiêu mới
        const currentSpending = (userData?.totalSpending || 0) + bookingData.totalPrice;
        
        // Logic thăng hạng
        let newRank = userData?.rank || MembershipRank.STANDARD;
        if (currentSpending >= 10000000) newRank = MembershipRank.DIAMOND;
        else if (currentSpending >= 5000000) newRank = MembershipRank.GOLD;
        else if (currentSpending >= 1000000) newRank = MembershipRank.SILVER;

        transaction.update(userRef, {
          currentPoints: FieldValue.increment(pointsEarned),
          totalSpending: currentSpending,
          rank: newRank,
          updatedAt: Timestamp.now()
        });
      }

      // === 2. LOGIC TRỪ LƯỢT DÙNG VOUCHER (MỚI THÊM) ===
      if (bookingData.voucherCode) {
        // Tìm Voucher Document ID dựa trên Code
        const voucherQuery = await firebaseDB.collection(VOUCHER_COLLECTION)
          .where('code', '==', bookingData.voucherCode)
          .limit(1)
          .get();

        if (!voucherQuery.empty) {
          const voucherRef = voucherQuery.docs[0].ref;
          transaction.update(voucherRef, {
            usedCount: FieldValue.increment(1)
          });
        }
      }

      // Tạo QR
      const qrContent = JSON.stringify({
        bid: bookingId,
        uid: userId,
        seats: bookingData.seats,
        time: bookingData.showtimeDate.toMillis()
      });
      const qrCodeBase64 = await QRCode.toDataURL(qrContent);
      const now = Timestamp.now();

      // Update Booking
      transaction.update(bookingRef, {
        status: BookingStatus.PAID,
        paymentMethod: method,
        paymentAt: now,
        qrCode: qrCodeBase64,
        updatedAt: now
      });

      // Update Showtime (Seats -> SOLD)
      const showtimeRef = this.showtimeCol.doc(bookingData.showtimeId);
      const seatUpdates: any = {};
      bookingData.seats.forEach(seatCode => {
        seatUpdates[`seatMap.${seatCode}.status`] = SeatStatus.SOLD;
      });

      transaction.update(showtimeRef, seatUpdates);

      return {
        success: true,
        message: "Thanh toán thành công",
        bookingId: bookingId,
        qrCode: qrCodeBase64
      };
    });
  }
}