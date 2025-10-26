# Ciné API (cine-backend)
---
## Yêu cầu
- Node.js >= 18
- npm
- Docker & Docker Compose (nếu muốn chạy MySQL/Redis bằng Docker)

## Nhanh (Quickstart)
Các bước ngắn để chạy app local:

1. Clone repo

```powershell
git clone <repo-url>
cd cine-backend
```

2. Cài dependencies

```powershell
npm install
```

3. Tạo file `.env` ở gốc repo (xem phần Biến môi trường bên dưới).

4. (Tùy) Khởi chạy MySQL & Redis bằng Docker Compose (xem phần Docker Compose)
```powershell
docker compose up -d
```

5. Chạy server ở chế độ phát triển:

```powershell
npm run dev
```

6. Kiểm tra API (ví dụ đăng ký/đăng nhập)
POST http://localhost:5000/api/auth/register
POST http://localhost:5000/api/auth/login

---

## Chạy với Docker Compose
Nếu không có MySQL/Redis sẵn, có thể sử dụng Docker Compose để khởi tạo nhanh:

```yaml
version: '3.8'
services:
  db:
    image: mysql:8
    environment:
      MYSQL_ROOT_PASSWORD: secret
      MYSQL_DATABASE: cine_db
    ports:
      - '3306:3306'
    volumes:
      - db_data:/var/lib/mysql

  redis:
    image: redis:7
    ports:
      - '6379:6379'

volumes:
  db_data:
```

Lưu snippet trên thành `docker-compose.yml` rồi chạy:

```powershell
docker compose up -d
```

---

## Scripts (package.json)
- `npm run dev` — phát triển với `ts-node-dev` (hot reload, transpile-only)
- `npm run build` — biên dịch TypeScript sang `dist/`
- `npm start` — chạy bản build (`node dist/server.js`)

Ví dụ build + start production:

```powershell
npm run build
npm start
```

---

## Cấu trúc thư mục (giải thích)

src/
 ├── app.ts              # cấu hình Express (middleware, routes)
 ├── server.ts           # entry point khởi động server
 ├── config/             # cấu hình kết nối
 │    ├── env.ts         # load biến môi trường
 │    ├── db.ts          # MySQL pool
 │    └── redis.ts       # Redis client
 ├── middleware/
 │    └── error.ts       # error handler chung
 ├── modules/            # các module chính
 │    ├── auth/          # Đăng ký/Đăng nhập, OTP
 │    │    ├── controller.ts
 │    │    ├── routes.ts
 │    │    ├── service.ts
 │    │    └── dto.ts
 │    ├── booking/       # Quản lý ghế, lock seat
 │    │    ├── controller.ts
 │    │    └── routes.ts
 │    ├── movie/         # (stub)
 │    ├── payment/       # (stub)
 │    ├── ticket/        # (stub)
 │    └── user/          # Lấy lịch sử booking
 │         ├── controller.ts
 │         └── routes.ts
 ├── utils/              # helper
 │    ├── jwt.ts
 │    ├── otp.ts
 │    └── qrcode.ts
---

## API hiện tại
1. Auth
POST /api/auth/register — Đăng ký user
POST /api/auth/set-password — Đặt mật khẩu
POST /api/auth/send-otp — Gửi OTP
POST /api/auth/verify-otp — Xác thực OTP
POST /api/auth/login — Đăng nhập
2. User
GET /api/users/:userId/bookings — Lịch sử đặt vé
3. Booking
GET /api/booking/shows/:id/seats — Lấy ghế
POST /api/booking/lock — Giữ chỗ
