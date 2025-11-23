import { firebaseDB } from '../../config/firebase';
import { Voucher, VoucherDocument, DiscountType } from './model';
import { CreateVoucherDto } from './dto';
import { Timestamp } from 'firebase-admin/firestore';
import { ApiError } from '../../utils/ApiError';

const VOUCHER_COLLECTION = 'vouchers';

export class VoucherService {
  private collection = firebaseDB.collection(VOUCHER_COLLECTION);

  /**
   * Tạo Voucher mới
   */
  async createVoucher(dto: CreateVoucherDto): Promise<Voucher> {
    // Check trùng code
    const snapshot = await this.collection.where('code', '==', dto.code.toUpperCase()).get();
    if (!snapshot.empty) {
      throw new ApiError(400, 'Mã Voucher đã tồn tại');
    }

    const newVoucher: VoucherDocument = {
      code: dto.code.toUpperCase(),
      description: dto.description,
      discountType: dto.discountType,
      discountValue: dto.discountValue,
      maxDiscount: dto.maxDiscount || 0,
      minOrderValue: dto.minOrderValue,
      usageLimit: dto.usageLimit,
      usedCount: 0,
      validFrom: Timestamp.fromDate(new Date(dto.validFrom)),
      validTo: Timestamp.fromDate(new Date(dto.validTo)),
      isActive: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    const ref = await this.collection.add(newVoucher);
    return { id: ref.id, ...newVoucher };
  }

  /**
   * Kiểm tra và Tính toán giảm giá
   * (Hàm này sẽ được dùng bởi cả Controller Voucher và Booking Service)
   */
  async applyVoucher(code: string, orderTotal: number) {
    const snapshot = await this.collection.where('code', '==', code.toUpperCase()).limit(1).get();
    
    if (snapshot.empty) throw new ApiError(404, 'Mã giảm giá không tồn tại');

    const voucher = snapshot.docs[0].data() as VoucherDocument;
    const now = Timestamp.now();

    // 1. Validate logic
    if (!voucher.isActive) throw new ApiError(400, 'Mã giảm giá đang bị khóa');
    if (now.toMillis() < voucher.validFrom.toMillis()) throw new ApiError(400, 'Mã giảm giá chưa bắt đầu');
    if (now.toMillis() > voucher.validTo.toMillis()) throw new ApiError(400, 'Mã giảm giá đã hết hạn');
    if (voucher.usedCount >= voucher.usageLimit) throw new ApiError(400, 'Mã giảm giá đã hết lượt sử dụng');
    if (orderTotal < voucher.minOrderValue) throw new ApiError(400, `Đơn hàng phải tối thiểu ${voucher.minOrderValue.toLocaleString()}đ`);

    // 2. Tính tiền giảm
    let discountAmount = 0;

    if (voucher.discountType === DiscountType.AMOUNT) {
      discountAmount = voucher.discountValue;
    } else {
      // Giảm theo %
      discountAmount = (orderTotal * voucher.discountValue) / 100;
      // Check Max Discount
      if (voucher.maxDiscount && voucher.maxDiscount > 0) {
        discountAmount = Math.min(discountAmount, voucher.maxDiscount);
      }
    }

    // Không giảm quá giá trị đơn hàng
    discountAmount = Math.min(discountAmount, orderTotal);

    return {
      isValid: true,
      code: voucher.code,
      discountAmount: Math.floor(discountAmount),
      finalPrice: orderTotal - Math.floor(discountAmount),
      voucherId: snapshot.docs[0].id
    };
  }

  /**
   * Lấy danh sách voucher khả dụng cho User
   */
  async getActiveVouchers(): Promise<Voucher[]> {
    const now = Timestamp.now();
    const snapshot = await this.collection
      .where('isActive', '==', true)
      .where('validTo', '>', now)
      .get();

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Voucher));
  }
}