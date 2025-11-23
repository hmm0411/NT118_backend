import { Timestamp } from 'firebase-admin/firestore';

export enum DiscountType {
  PERCENT = 'percent', // Giảm theo % (VD: 10%)
  AMOUNT = 'amount'    // Giảm tiền mặt (VD: 50.000đ)
}

export interface VoucherDocument {
  code: string;           // Mã code (Unique). VD: "TET2025"
  description: string;    // Mô tả. VD: "Giảm 10% cho đơn từ 200k"
  
  discountType: DiscountType;
  discountValue: number;  // 10 (nếu là %) hoặc 50000 (nếu là amount)
  maxDiscount?: number;   // Giảm tối đa bao nhiêu (chỉ áp dụng cho %)
  minOrderValue: number;  // Đơn tối thiểu để áp dụng
  
  usageLimit: number;     // Tổng số lượt được dùng
  usedCount: number;      // Số lượt đã dùng
  
  validFrom: Timestamp;   // Ngày bắt đầu
  validTo: Timestamp;     // Ngày kết thúc
  
  isActive: boolean;      // Admin có thể tắt mở thủ công
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Voucher extends VoucherDocument {
  id: string;
}