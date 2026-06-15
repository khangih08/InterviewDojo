# 🏁 Hướng Dẫn Cài Đặt & Khởi Chạy Hệ Thống

Tài liệu này cung cấp hướng dẫn chi tiết từng bước để thiết lập môi trường phát triển cục bộ (Local Development Environment) cho dự án **InterviewDojo** (cả Frontend và Backend).

---

## 🛠️ Yêu Cầu Hệ Thống / Prerequisites

Trước khi bắt đầu, hãy đảm bảo máy tính của bạn đã cài đặt các công cụ sau:
- **Node.js** v22.0.0 hoặc mới hơn (khuyên dùng bản LTS mới nhất).
- **Docker Desktop** & Docker Compose.
- **Git** để quản lý mã nguồn.
- Một trình chỉnh sửa mã nguồn (khuyên dùng **VS Code** hoặc **Cursor**).

---

## 🚀 Các Bước Thiết Lập

### 1. Khởi Chạy Cơ Sở Dữ Liệu (PostgreSQL)
Dự án sử dụng Docker Compose để đóng gói cơ sở dữ liệu PostgreSQL cùng các dịch vụ phụ trợ.

Khởi chạy container database bằng lệnh:
```bash
docker compose up -d
```

> **Thông số kết nối cơ sở dữ liệu mặc định (Local):**
> - **Host**: `localhost`
> - **Port**: `5432`
> - **Username**: `postgres`
> - **Password**: `postgres`
> - **Database Name**: `interview_dojo`
> 
> *Bạn có thể quản lý database trực quan thông qua công cụ pgAdmin đi kèm tại `http://localhost:5050` (nếu có cấu hình trong docker-compose).*

---

### 2. Thiết Lập & Khởi Chạy Backend (NestJS 11)

Chuyển vào thư mục `backend`, cài đặt thư viện và cấu hình biến môi trường:

```bash
cd backend
npm install
```

#### Cấu hình Biến Môi Trường (`backend/.env`)
Hãy tạo file `.env` bằng cách sao chép file ví dụ:
```bash
cp .env.example .env
```

Mở tệp `.env` vừa tạo và điền đầy đủ các thông tin cấu hình thực tế:
```env
# Cấu hình Database PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=interview_dojo

# Bảo mật & Xác thực JWT
JWT_SECRET=thay-doi-chuoi-nay-cho-bao-mat
JWT_REFRESH_SECRET=thay-doi-chuoi-nay-nua
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com

# Cấu hình AI Gateway & LLMs
GROQ_API_KEY=gsk_your_groq_api_key                # Dùng cho các tác vụ LLM siêu tốc
Gemini_API_KEY=AIzaSy_your_gemini_api_key          # Dùng cho phân tích câu trả lời chuyên sâu
OPENAI_API_KEY=sk-proj-your_openai_api_key        # Tùy chọn nếu cần OpenAI

# Cấu hình RAG (Pinecone Vector DB)
PINECONE_API_KEY=pcsk_your_pinecone_api_key        # API Key tài khoản Pinecone
PINECONE_INDEX=interview-questions                 # Tên Index trên Pinecone dùng để lưu trữ câu hỏi vector

# Cấu hình gửi Mail (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-specific-password
SMTP_SECURE=false
SMTP_FROM="Interview Dojo <no-reply@interviewdojo.com>"

# Khác
PORT=3001
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Cấu hình Cổng Thanh Toán VNPay
VNP_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html   # URL cổng test VNPay Sandbox
VNP_TMNCODE=your-vnpay-tmncode                              # Mã định danh website (Merchant ID)
VNP_HASHSECRET=your-vnpay-hashsecret                        # Chuỗi bảo mật checksum SHA512
VNP_RETURNURL=http://localhost:3000/payment/callback        # URL redirect ở frontend nhận kết quả
VNP_IP_ADDR=127.0.0.1                                       # Địa chỉ IP của client (tùy chọn)
```,StartLine:84,TargetContent:
```

#### Khởi chạy Backend ở chế độ Development:
```bash
npm run start:dev
```
Sau khi chạy thành công, Backend sẽ hoạt động tại `http://localhost:3001`. Bạn có thể truy cập tài liệu API tự động qua **Swagger UI** tại:
👉 `http://localhost:3001/api/docs`

---

### 3. Thiết Lập & Khởi Chạy Frontend (Next.js 16)

Chuyển vào thư mục `frontend`, cài đặt thư viện và cấu hình biến môi trường:

```bash
cd ../frontend
npm install
```

#### Cấu hình Biến Môi Trường (`frontend/.env.local`)
Tạo file `.env.local` tại thư mục `frontend`:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```
> [!IMPORTANT]
> Hãy chắc chắn rằng biến môi trường ở frontend là `NEXT_PUBLIC_API_BASE_URL` (không phải `NEXT_PUBLIC_API_URL`) để tương thích 100% với các API Client hiện tại trong mã nguồn Next.js.

#### Khởi chạy Frontend:
```bash
npm run dev
```
Sau khi chạy thành công, Frontend sẽ hoạt động tại:
👉 `http://localhost:3000`

---

## 🐳 Khởi Chạy Bằng Docker (Full Stack)

Nếu muốn khởi chạy toàn bộ hệ thống bằng Docker mà không cần cài đặt Node.js cục bộ, bạn có thể sử dụng Docker Profiles có sẵn:

```bash
# Khởi chạy chế độ phát triển (hỗ trợ hot-reload cho mã nguồn)
docker compose --profile dev up -d

# Khởi chạy chế độ Production đóng gói tối ưu
docker compose --profile prod up -d
```

---

## 🛠️ Hướng Dẫn Sửa Lỗi Nhanh / Troubleshooting

- **Lỗi kết nối API trên Frontend**:
  - *Dấu hiệu*: Nút Đăng nhập/Đăng ký xoay vòng vô hạn hoặc báo "Network Error".
  - *Giải quyết*: Kiểm tra xem Backend NestJS đã khởi chạy thành công chưa (`http://localhost:3001`). Đảm bảo file `frontend/.env.local` đã định nghĩa đúng `NEXT_PUBLIC_API_BASE_URL=http://localhost:3001` và hãy khởi động lại dev server của frontend.
  
- **Lỗi Cơ sở dữ liệu (Database Connection Refused)**:
  - *Giải quyết*: Chạy lệnh `docker compose ps` để xem container database PostgreSQL có đang ở trạng thái `Up` (healthy) hay không. Nếu không, hãy chạy `docker compose logs` để kiểm tra log chi tiết.
  
- **Lỗi không lấy được câu hỏi gợi ý (RAG/AI Failure)**:
  - *Giải quyết*: Hãy kiểm tra xem `Gemini_API_KEY`, `GROQ_API_KEY` và các cấu hình `PINECONE_*` trong file `backend/.env` đã chính xác và hoạt động được chưa. Có thể chạy các script seed dữ liệu để chuẩn bị database:
    ```bash
    cd backend
    npm run seed       # Seed các danh mục và câu hỏi cơ bản vào PostgreSQL
    npm run seed:ai    # Seed các dữ liệu vector mẫu cho RAG (nếu có cấu hình)
    ```
