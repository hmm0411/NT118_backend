# Ciné API (cine-backend)

Chuyển sang dùng Firebase (Firestore + Firebase Auth) thay vì MySQL/Redis.

## Yêu cầu
- Node.js >= 18
- npm

## Tổng quan nhanh
1. Cài dependency

```powershell
npm install
```

2. Tạo file `.env` theo phần Biến môi trường bên dưới.

3. Chạy server ở chế độ phát triển

```powershell
npm run dev
```

4. Test kết nối Firebase (endpoint):

```powershell
curl http://localhost:5000/api/test/firebase-test
```

## Scripts (package.json)

- `npm run dev` — phát triển với `ts-node-dev` (hot reload)
- `npm run build` — biên dịch TypeScript sang `dist/`
# Ciné API (cine-backend)

Phiên bản hiện tại sử dụng Firebase (Firestore + Firebase Auth). README này hướng dẫn chi tiết cách chạy local, chạy trong Docker, cấu hình Firebase và cách debug.

---

## Chạy trong Docker

Dockerfile có sẵn multi-stage build (build TypeScript -> runtime). Dưới đây là các cách build/run. (hiện tại có kết nối được nhưng chưa có fix)

1) Build image và chạy container

```powershell
# Build image
docker build -t cine-backend:latest .

# Run with mounted service account (recommended)
docker run -d --name cine-backend \\
   -p 5000:5000 \\
   -v ${PWD}:/app \\
   -v ${PWD}/service-account.json:/run/secrets/firebase-key.json:ro \\
   -e FIREBASE_CREDENTIAL_PATH=/run/secrets/firebase-key.json \\
   -e PORT=5000 \\
   cine-backend:latest
```

Thay `${PWD}/service-account.json` bằng đường dẫn đến file key của bạn.

2) Docker Compose (ví dụ)

Tạo `docker-compose.yml` (hoặc dùng file bên dưới) để chạy container và mount key:

```yaml
version: '3.8'
services:
   app:
      build: .
      image: cine-backend:latest
      ports:
         - '5000:5000'
      environment:
         - PORT=5000
         - FIREBASE_CREDENTIAL_PATH=/run/secrets/firebase-key.json
      volumes:
         - './service-account.json:/run/secrets/firebase-key.json:ro'

# Lưu ý: không lưu file JSON vào VCS; mount file từ host hoặc sử dụng secrets manager
```

Khởi chạy:

```powershell
docker compose up -d --build
```

3) Lưu ý bảo mật

- Không commit `service-account.json` vào Git. Sử dụng Docker secrets, environment variables trong CI/CD hoặc secret manager cho production.

---

## API & hướng dẫn sử dụng

Base URL (local): `http://localhost:5000`

Endpoints chính (tóm tắt):

- Auth
   - `POST /api/auth/register` — đăng ký (body JSON: name, email, phone, dob)
   - `POST /api/auth/set-password` — đặt mật khẩu (userId, password)
   - `POST /api/auth/send-otp` — gửi OTP (phone)
   - `POST /api/auth/verify-otp` — verify OTP (phone, code)
   - `POST /api/auth/login` — login (emailOrPhone, password)

- User
   - `GET /api/users/:userId/bookings` — lấy lịch sử booking của user

- Booking
   - `GET /api/booking/shows/:id/seats` — lấy ghế cho show
   - `POST /api/booking/lock` — giữ ghế (body: showId, seats)

- Test
   - `GET /api/test/firebase-test` — test kết nối Firebase (ghi/đọc doc, gọi listUsers)

Ví dụ curl đăng ký (simple):

```bash
curl -X POST http://localhost:5000/api/auth/register \\
   -H "Content-Type: application/json" \\
   -d '{"name":"Nguyen","email":"ng@example.com","phone":"0123456789","dob":"1990-01-01"}'
```

---

## Troubleshooting 

- Lỗi `5 NOT_FOUND` khi gọi Firestore:
   - Kiểm tra `FIREBASE_CREDENTIAL_PATH` trỏ đúng file JSON và `project_id` trong file khớp `FIREBASE_PROJECT_ID` (nếu set).
   - Kiểm tra Firestore đã được bật trong Firebase Console (Native mode).

- Lỗi liên quan private key:
   - Nếu dùng `FIREBASE_PRIVATE_KEY` trong `.env`, đảm bảo các `\\n` được giữ nguyên. Hoặc dùng `FIREBASE_CREDENTIAL_PATH` thay cho private key.

- Logs: server in ra logs khi khởi động và khi gọi endpoint `/api/test/firebase-test`. Dùng logs để debug quyền và project id.

---

## Phát triển & test

- Chạy unit tests: (hiện chưa có tests trong repo)
- Build production: `npm run build` rồi `npm start` (hoặc Docker image).

---