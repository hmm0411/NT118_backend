import { firebaseDB } from "../../config/firebase";
import { DecodedIdToken } from "firebase-admin/auth";
import { Timestamp } from "firebase-admin/firestore";

const usersCollection = firebaseDB.collection("users");

export class AuthService {
  /**
   * Sync user từ Firebase Auth Token vào Firestore
   */
  async syncUser(decodedToken: DecodedIdToken) {
    const { uid, email, name, picture, phone_number } = decodedToken;
    
    // 1. Thử lấy user từ Firestore dựa trên UID
    const userRef = usersCollection.doc(uid);
    const doc = await userRef.get();
    const now = Timestamp.now();

    // 2. Nếu user chưa tồn tại -> Tạo mới
    if (!doc.exists) {
      const newUser = {
        email: email || "",
        name: name || "New User",
        avatar: picture || "",
        phone: phone_number || "",
        role: 'user',
        createdAt: now,
        updatedAt: now,
      };

      await userRef.set(newUser);
      
      return { id: uid, ...newUser, isNewUser: true };
    }

    // 3. Nếu user đã tồn tại -> Trả về thông tin cũ
    return { id: doc.id, ...doc.data(), isNewUser: false };
  }
}