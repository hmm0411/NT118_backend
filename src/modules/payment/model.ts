// src/modules/payment/model.ts

// 1. Dữ liệu gửi sang MoMo để tạo thanh toán
export interface MomoPaymentRequest {
  partnerCode: string;
  accessKey: string;
  requestId: string;
  amount: string; // MoMo yêu cầu amount là string khi ký, nên để string cho an toàn
  orderId: string;
  orderInfo: string;
  redirectUrl: string;
  ipnUrl: string;
  extraData: string;
  requestType: string; // thường là 'captureWallet'
  signature: string;
  lang?: 'vi' | 'en';
}

// 2. Dữ liệu MoMo trả về sau khi gọi API tạo thanh toán
export interface MomoPaymentResponse {
  partnerCode: string;
  requestId: string;
  orderId: string;
  amount: number;
  responseTime: number;
  message: string;
  resultCode: number; // 0 là thành công (về mặt request), khác 0 là lỗi
  payUrl: string;     // Link webview
  deeplink?: string;  // Link mở app MoMo (Quan trọng cho Mobile App)
  qrCodeUrl?: string; // Link ảnh QR
}

// 3. Dữ liệu MoMo gửi về (IPN) khi người dùng thanh toán xong (Dùng cho sau này)
export interface MomoIpnRequest {
  partnerCode: string;
  orderId: string;
  requestId: string;
  amount: number;
  orderInfo: string;
  orderType: string;
  transId: number;
  resultCode: number; // Quan trọng: 0 = Thành công, khách đã trả tiền
  message: string;
  payType: string;
  responseTime: number;
  extraData: string;
  signature: string;
}