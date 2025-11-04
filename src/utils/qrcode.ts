// src/utils/qrcode.ts
import QRCode from "qrcode";

/**
 * Sinh QR code dưới dạng Base64 DataURL (PNG)
 * @param text nội dung cần mã hóa
 * @returns chuỗi base64 (data:image/png;base64,...)
 */
export async function generate(text: string): Promise<string> {
  try {
    const dataUrl = await QRCode.toDataURL(text, {
      errorCorrectionLevel: "H",
      width: 300,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });
    return dataUrl;
  } catch (error) {
    console.error("QR code generation failed:", error);
    throw new Error("Failed to generate QR code");
  }
}
