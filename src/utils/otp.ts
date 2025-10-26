import { redis } from "../config/redis";

export async function saveOTP(phone: string, code: string) {
    await redis.setEx(`otp:${phone}`, 300, code); // TTL 5 phút
}

export async function verifyOTP(phone: string, code: string) {
    const saved = await redis.get(`otp:${phone}`);
    return saved === code;
}
