import { firebaseDB } from '../../config/firebase';
import { ProcessPaymentDto } from './dto';
import { BookingStatus, BookingDocument } from '../booking/model';
import { SeatStatus } from '../showtime/model';
import { MembershipRank } from '../user/model';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';
import { ApiError } from '../../utils/ApiError';
import { MomoPaymentRequest, MomoPaymentResponse } from './model';
import QRCode from 'qrcode';
import axios from 'axios'; // Cần cài: npm install axios
import * as crypto from 'crypto';

const BOOKING_COLLECTION = 'bookings';
const SHOWTIME_COLLECTION = 'showtimes';
const USER_COLLECTION = 'users';
const VOUCHER_COLLECTION = 'vouchers';

export class PaymentService {
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

    // === Momo ===
    if (dto.paymentMethod === 'momo') {
      return await this.createMomoPaymentUrl(bookingData, dto.bookingId);
    }


    // === NHÁNH SIMULATOR (GIẢ LẬP) ===
    if (dto.paymentMethod === 'simulator') {
      console.log("🚀 [Payment] Processing Simulator for Booking:", dto.bookingId);
      // Chốt đơn ngay lập tức
      return await this.finalizeBooking(dto.bookingId, userId, 'simulator');
    }

    throw new ApiError(400, 'Phương thức thanh toán không hỗ trợ');
  }

  private async createMomoPaymentUrl(bookingData: BookingDocument, bookingId: string) {
    try {
      // Cấu hình Key (Nên đưa vào .env)
      const partnerCode = "MOMO";
      const accessKey = "F8BBA842ECF85";
      const secretKey = "K951B6PE1waDMi640xX08PD3vg6EkVlz";
      
      const requestId = partnerCode + new Date().getTime();
      const orderId = requestId; // Hoặc dùng bookingId + time để unique
      const orderInfo = `Pay for booking ${bookingId}`;
      const redirectUrl = "https://momo.vn/return"; // URL Client nhận kết quả
      const ipnUrl = "https://callback.url/notify"; // URL Server nhận kết quả ngầm (cần public IP hoặc ngrok)
      
      // Lấy giá tiền từ Booking (ép kiểu về string)
      const amount = bookingData.totalPrice.toString();
      const requestType = "captureWallet";
      const extraData = ""; // pass empty value if your merchant does not have stores

      // Tạo Signature (HMAC SHA256)
      // Quan trọng: Phải sắp xếp params theo alphabet
      const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;

      console.log("--------------------RAW SIGNATURE----------------");
      console.log(rawSignature);

      const signature = crypto
        .createHmac('sha256', secretKey)
        .update(rawSignature)
        .digest('hex');

      console.log("--------------------SIGNATURE----------------");
      console.log(signature);

      // Body gửi sang MoMo
      const requestBody = {
        partnerCode: partnerCode,
        accessKey: accessKey,
        requestId: requestId,
        amount: amount,
        orderId: orderId,
        orderInfo: orderInfo,
        redirectUrl: redirectUrl,
        ipnUrl: ipnUrl,
        extraData: extraData,
        requestType: requestType,
        signature: signature,
        lang: 'en'
      };

      // Gọi API MoMo
      const response = await axios.post<MomoPaymentResponse>(
        'https://test-payment.momo.vn/v2/gateway/api/create',
        requestBody,
        {
          headers: { 'Content-Type': 'application/json' }
        }
      );

      if (response.data.resultCode !== 0) {
         throw new Error(response.data.message);
      }

      // Service CHỈ trả về data, không động vào res
      return {
        paymentMethod: 'momo',
        deeplink: response.data.deeplink, 
        payUrl: response.data.payUrl,
        message: "Vui lòng mở App MoMo để thanh toán"
      };

    } catch (error: any) {
      console.error("Momo Error:", error?.response?.data || error.message);
      throw new ApiError(500, 'Lỗi khởi tạo thanh toán MoMo');
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