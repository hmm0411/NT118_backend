import { firebaseDB } from "../config/firebase";
import admin from "firebase-admin";

export async function saveOTP(phone: string, code: string) {
    const otpRef = firebaseDB.collection('otps').doc(phone);

    // Save OTP with expiration time (5 minutes from now)
    await otpRef.set({
        code,
        phone,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        expiresAt: admin.firestore.Timestamp.fromMillis(Date.now() + 5 * 60 * 1000) // 5 minutes
    });
}

export async function verifyOTP(phone: string, code: string) {
    const otpRef = firebaseDB.collection('otps').doc(phone);
    const otpDoc = await otpRef.get();

    if (!otpDoc.exists) {
        return false;
    }

    const otpData = otpDoc.data()!;
    const now = admin.firestore.Timestamp.now();

    // Check if OTP has expired
    if (now.toMillis() > otpData.expiresAt.toMillis()) {
        // Delete expired OTP
        await otpRef.delete();
        return false;
    }

    // Delete OTP after verification (one-time use)
    await otpRef.delete();

    return otpData.code === code;
}