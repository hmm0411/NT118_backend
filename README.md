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

# Hướng Dẫn Triển Khai Cine Backend Lên Azure 

## Tổng quan kiến trúc

```

[VS Code / Local PC]
↓ docker build + push
[Azure Container Registry (ACR)]
↓ pull image
[Azure App Service Container]
↓
[https://cine-backend-app.azurewebsites.net](https://cine-backend-app.azurewebsites.net)

````

---

## Chuẩn bị môi trường

### Yêu cầu:
- **Docker Desktop**  
  👉 [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)

- **Azure CLI**  
  👉 [https://learn.microsoft.com/en-us/cli/azure/install-azure-cli](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli)

- Quyền truy cập Azure Resource Group: **NT118**
- Quyền pull/push image đến **ACR:** `cineappregistry.azurecr.io`
- App Service: **cine-backend-app**

---

##  Đăng nhập Azure & Container Registry

```bash
# Login Azure (mở trình duyệt xác thực)
az login

# Login ACR (Azure Container Registry)
az acr login --name cineappregistry
````

> Nếu thành công: sẽ hiện `Login Succeeded`

---

## Build & Push image mới

Từ thư mục project `cine-backend`, chạy:

```bash
# Build image
docker build -t cineappregistry.azurecr.io/cine-backend:latest .

# Push image lên ACR
docker push cineappregistry.azurecr.io/cine-backend:latest
```

> Nếu lần đầu build hơi lâu vì Docker tải base image (`node:18-alpine`)

---

## Cấu hình App Service (nếu cần)

###  Biến môi trường cần thiết

Trong Azure Portal → **cine-backend-app → Configuration → Application settings → New Application Setting**

| Tên biến                   | Giá trị mẫu                                                        |
| -------------------------- | ------------------------------------------------------------------ |
| `PORT`                     | `8080`                                                             |
| `JWT_SECRET`               | `supersecret`                                                      |
| `FIREBASE_CREDENTIAL_PATH` | `./src/config/nt118-8452f-firebase-adminsdk-fbsvc-8342f8803e.json` |

>  Không dùng `FIREBASE_PRIVATE_KEY` trực tiếp vì Azure sẽ lỗi ký tự xuống dòng.
>  Sử dụng file JSON thay thế (đã copy sẵn vào container qua `Dockerfile`).

---

## Cấu hình Dockerfile 

```dockerfile
# Stage 1: Build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Runtime
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/package*.json ./
RUN npm install --omit=dev
COPY --from=builder /app/dist ./dist
COPY src/config/nt118-8452f-firebase-adminsdk-fbsvc-8342f8803e.json ./src/config/
ENV PORT=8080
EXPOSE 8080
CMD ["node", "dist/server.js"]
```

---

## Deploy & Restart WebApp

Sau khi push image xong, Azure App Service sẽ tự nhận image mới.
Nếu muốn restart thủ công:

```bash
az webapp restart --name cine-backend-app --resource-group NT118
```

---

## Kiểm tra trạng thái container

```bash
az webapp log tail --name cine-backend-app --resource-group NT118
```

Nếu log hiện:

```
{"message": "Ciné API running"}
```

→ Backend đã khởi chạy thành công!

---

## Kiểm tra API trên trình duyệt

Truy cập:
 [https://cine-backend-app.azurewebsites.net](https://cine-backend-app.azurewebsites.net)

Kết quả:

```json
{ "message": "Ciné API running" }
```

---

##  Hướng dẫn cho teammate (pull hoặc deploy)

### Pull image từ ACR để chạy local:

```bash
az login
az acr login --name cineappregistry
docker pull cineappregistry.azurecr.io/cine-backend:latest
docker run -d -p 8080:8080 cineappregistry.azurecr.io/cine-backend:latest
```

### Cập nhật phiên bản mới:

```bash
# Build & push version mới
docker build -t cineappregistry.azurecr.io/cine-backend:v2 .
docker push cineappregistry.azurecr.io/cine-backend:v2
```

→ Vào Azure Portal → App Service → Configuration
→ Đổi `Image tag` thành `v2` → Save → Restart app.

---

## Debug các lỗi thường gặp

| Lỗi                                     | Nguyên nhân                              | Cách khắc phục                                                 |
| --------------------------------------- | ---------------------------------------- | -------------------------------------------------------------- |
| `Failed to parse private key`           | Private key Firebase bị sai format       | Dùng file JSON credential                                      |
| `Container didn't respond on port 8080` | App dùng port khác (5000)                | Đặt `PORT=8080` trong `.env` và `EXPOSE 8080` trong Dockerfile |
| `manifest not found`                    | Azure chưa thấy image `latest` trong ACR | Push lại image `latest` đúng tên                               |
| `unauthorized: authentication required` | Chưa login ACR hoặc chưa bật Admin user  | Chạy `az acr login` và bật admin access trong Azure Portal     |

---

## Kết quả cuối cùng

Backend hoạt động trên:
 [https://cine-backend-app.azurewebsites.net](https://cine-backend-app.azurewebsites.net)**

Trả về:

```json
{ "message": "Ciné API running" }
```

Mọi lần update code chỉ cần:

1. `docker build`
2. `docker push`
3. `az webapp restart`

---
