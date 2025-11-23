import axios from 'axios';
import CryptoJS from 'crypto-js';
import moment from 'moment';
import { env } from '../../config/env';

export class ZaloPayService {
  private config = {
    app_id: "2554",
    key1: "sdngKKJmqEMzvh5QQcdD2A9XBSKq60//",
    key2: "trMrHtvjo6myautxDUiAcYsVtaeQ8nhf",
    endpoint: "https://sandbox.zalopay.com.vn/v001/tpe/createorder"
  };

  // Lấy URL server từ biến môi trường
  private callbackUrl = `${'http://135.171.171.14'}/api/payment/webhook/zalopay`;

  async createPaymentOrder(bookingId: string, amount: number, userId: string) {
    const embed_data = {
      redirecturl: "cinebooking://payment-result", // Deep link về app Android
      bookingId: bookingId,
      userId: userId
    };

    const items: any[] = [];
    const transID = Math.floor(Math.random() * 1000000);
    const app_trans_id = `${moment().format('YYMMDD')}_${transID}`;

    const order: any = {
      app_id: this.config.app_id,
      app_trans_id: app_trans_id, 
      app_user: userId,
      app_time: Date.now(), // miliseconds
      item: JSON.stringify(items),
      embed_data: JSON.stringify(embed_data),
      amount: amount,
      description: `Booking #${bookingId}`,
      bank_code: "",
      callback_url: this.callbackUrl
    };

    // Tạo chữ ký MAC
    const data = `${this.config.app_id}|${order.app_trans_id}|${order.app_user}|${order.amount}|${order.app_time}|${order.embed_data}|${order.item}`;
    order.mac = CryptoJS.HmacSHA256(data, this.config.key1).toString();

    try {
      console.log("🔵 [ZaloPay] Sending Request to:", this.config.endpoint);
      console.log("📦 [ZaloPay] Data:", order);

      // Gửi dạng Form URL Encoded chuẩn chỉnh
      const params = new URLSearchParams();
      for (const key in order) {
        params.append(key, order[key].toString());
      }

      const result = await axios.post(this.config.endpoint, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      console.log("🟢 [ZaloPay] Response:", result.data);
      
      if (result.data.return_code === 1) {
        return {
            orderUrl: result.data.order_url,
            appTransId: app_trans_id,
            zpTransToken: result.data.zp_trans_token
        };
      } else {
        throw new Error(`ZaloPay Error: ${result.data.return_message} (${result.data.sub_return_message || ''})`);
      }
    } catch (error: any) {
      console.error("🔴 [ZaloPay Exception]:", error.response?.data || error.message);
      throw error; // Ném lỗi ra để Controller bắt
    }
  }

  verifyCallback(data: any) {
    const { mac, data: dataStr } = data;
    const reqMac = CryptoJS.HmacSHA256(dataStr, this.config.key2).toString();

    if (reqMac !== mac) {
      console.log("⚠️ [Webhook] Invalid MAC");
      return { isValid: false };
    }

    return {
      isValid: true,
      data: JSON.parse(dataStr)
    };
  }
}