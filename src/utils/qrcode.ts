import QRCode from "qrcode";

export async function createQR(text: string) {
    return await QRCode.toDataURL(text);
}
