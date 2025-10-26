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

4. (Tùy) Khởi chạy MySQL & Redis bằng Docker Compose (xem phần Docker Compose) hoặc dùng DB/Redis ngoài.

5. Chạy server ở chế độ phát triển:

```powershell
npm run dev
```

6. Kiểm tra API (ví dụ đăng ký/đăng nhập) — xem phần API ví dụ.

---

## Chạy với Docker Compose (gợi ý)
Nếu bạn không có MySQL/Redis sẵn, có thể sử dụng Docker Compose để khởi tạo nhanh:

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

`/src` — mã nguồn TypeScript
- `app.ts` — cấu hình Express (middleware, routes)
- `server.ts` — entry point khởi tạo server và lắng nghe port
- `config/`
  - `env.ts` — đọc biến môi trường và xuất config dùng khắp app
  - `db.ts` — cấu hình kết nối MySQL (mysql2/promise pool)
  - `redis.ts` — (nếu có) cấu hình Redis client
- `middleware/` — middleware chung (ví dụ error handler)
- `modules/` — các tính năng theo module
  - `auth/` — đăng ký, đăng nhập (controller, service, routes, dto)
  - `movie/`, `booking/`, `payment/`, `ticket/` — các module khác (nếu có)
- `utils/` — helper như jwt wrapper

`/dist` — mã JS biên dịch (sau build)

`package.json` — scripts và dependencies
`tsconfig.json` — cấu hình TypeScript

---