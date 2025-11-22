# 🎬 Ciné Booking Backend API

Đây là Backend Server cho ứng dụng đặt vé xem phim (Android App), được xây dựng dựa trên **Node.js**, **TypeScript** và hệ sinh thái **Firebase** (Firestore, Auth).

## 📋 Mục lục
- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
- [Yêu cầu hệ thống](#-yêu-cầu-hệ-thống)
- [Cài đặt & Cấu hình](#-cài-đặt--cấu-hình)
- [Chạy dự án](#-chạy-dự-án)
- [Tài liệu API (Swagger)](#-tài-liệu-api-swagger)
- [Hướng dẫn Test API (Quan trọng)](#-hướng-dẫn-test-api-quan-trọng)
- [Luồng nghiệp vụ chính](#-luồng-nghiệp-vụ-chính)
- [Cấu trúc thư mục](#-cấu-trúc-thư-mục)

---

## 🛠 Công nghệ sử dụng
- **Core:** Node.js, Express, TypeScript.
- **Database:** Google Firestore (NoSQL).
- **Authentication:** Firebase Authentication (Verify ID Token).
- **Validation:** class-validator, class-transformer.
- **Documentation:** Swagger (OpenAPI 3.0).
- **Others:** node-cron (Tác vụ tự động), qrcode (Tạo vé).

---

## 💻 Yêu cầu hệ thống
1. **Node.js**: Phiên bản v16 trở lên.
2. **Tài khoản Firebase**:
   - Đã tạo Project trên Firebase Console.
   - Đã bật **Authentication** (Email/Password).
   - Đã tạo **Firestore Database**.
   - Đã tải file **Service Account Key** (JSON) từ *Project Settings -> Service Accounts*.

---

## ⚙️ Cài đặt & Cấu hình

### 1. Clone dự án
```bash
git clone https://github.com/hmm0411/NT118_backend.git
cd cine-backend
```
### 2. Cài đặt thư viện
```bash
npm install
```
### 3. Cấu hình biến môi trường
```bash
# --- Server Config ---
PORT=5000
NODE_ENV=development

# --- Firebase Admin SDK Config ---
# Lấy các thông tin này trong file JSON Service Account tải từ Firebase Console
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com
FIREBASE_STORAGE_BUCKET=your-project.appspot.com

# QUAN TRỌNG: Private Key phải để trong dấu ngoặc kép.
# Nếu copy từ file JSON, hãy thay các dấu xuống dòng thực tế bằng \n
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggOjAgEAAoIBAQD...\n-----END PRIVATE KEY-----\n"

# --- Google Client ID (Optional) ---
# Dùng để verify token từ Android App nếu cần thiết
GOOGLE_CLIENT_ID=your-android-client-id
```
### 4. Chạy dự án
#### Môi trường Development
```bash
npm run dev
```
#### Môi trường Production
```bash
npm run build
npm start
```

## 📖 Tài liệu Swagger
```bash
http://localhost:5000/api-docs
```