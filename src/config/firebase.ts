import admin from "firebase-admin";
import { env } from "./env";

if (!admin.apps.length) {
    // Xử lý private key, vì trong .env nó là một chuỗi
    // Code của bạn đã xử lý đúng phần này
    let privateKey = env.firebasePrivateKey || "";
    if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
        privateKey = privateKey.slice(1, -1);
    }
    privateKey = privateKey.replace(/\\n/g, "\n");

    // Khởi tạo credential chỉ từ biến môi trường
    const credential = {
        projectId: env.firebaseProjectId,
        clientEmail: env.firebaseClientEmail,
        privateKey,
    };

    // Kiểm tra xem các biến môi trường cần thiết có tồn tại không
    if (!credential.projectId || !credential.clientEmail || !credential.privateKey) {
        console.error("Firebase credentials (projectId, clientEmail, privateKey) không được tìm thấy trong biến môi trường.");
        console.error("Hãy chắc chắn file .env của bạn đã được cấu hình đúng.");
    } else {
        admin.initializeApp({
            credential: admin.credential.cert(credential),
            storageBucket: env.firebaseStorageBucket,
            databaseURL: env.firebaseProjectId ? `https://${env.firebaseProjectId}.firebaseio.com` : undefined,
        });
    }
}

export const firebaseAuth = admin.auth();
export const firebaseDB = admin.firestore();
export const firebaseStorage = admin.storage();
export const firebaseBucket = admin.storage().bucket();
export default admin;