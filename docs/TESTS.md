# 🧪 Hướng Dẫn Kiểm Thử Nâng Cao (Testing Guide)

Dự án **InterviewDojo** áp dụng một chiến lược kiểm thử nghiêm ngặt ở cả hai đầu Frontend và Backend nhằm đảm bảo hệ thống vận hành trơn tru, không phát sinh lỗi hồi quy (regression bugs) và đạt chuẩn chất lượng cao trước khi phát hành.

Tài liệu này hướng dẫn chi tiết cách chạy, viết và cấu trúc các bộ kiểm thử trong dự án.

---

## 🌐 1. Kiểm Thử Frontend (Next.js 16)

Hệ thống kiểm thử của frontend được chia làm hai phần chính: **Unit/Component Testing** và **End-to-End (E2E) Testing**.

### A. Unit & Component Testing (Vitest + MSW)
Dự án sử dụng **Vitest** (một test runner siêu tốc tối ưu cho Vite/Next.js) kết hợp với **React Testing Library** để kiểm thử các Component, Hooks và Context độc lập.

Để tránh việc gọi trực tiếp đến API thực tế trong lúc kiểm thử, chúng tôi sử dụng **MSW (Mock Service Worker)** để đánh chặn (intercept) các yêu cầu mạng và trả về dữ liệu giả lập (mock data) từ thư mục `frontend/tests/mocks`.

#### Các lệnh chạy kiểm thử:
```bash
cd frontend

# Chạy toàn bộ Unit test một lần
npm run test

# Chạy Unit test ở chế độ Watch (tự động chạy lại khi phát hiện thay đổi file)
npm run test:watch

# Chạy kiểm thử và xuất báo cáo độ bao phủ mã nguồn (Coverage Report)
npm run test:coverage
```

*Báo cáo Coverage sẽ được lưu trong thư mục `frontend/coverage/index.html`. Bạn có thể mở tệp này bằng trình duyệt để xem chi tiết những dòng code nào đã được bao phủ.*

---

### B. End-to-End (E2E) Testing (Playwright)
Chúng tôi sử dụng **Playwright** để thực hiện kiểm thử toàn bộ luồng trải nghiệm của người dùng (end-to-end user flows) từ giao diện người dùng đến database thực tế.

#### Các lệnh chạy E2E test:
```bash
cd frontend

# Chạy tất cả E2E tests ở chế độ dòng lệnh (headless)
npm run test:e2e

# Khởi chạy giao diện trực quan của Playwright (Playwright UI Mode) để dễ dàng debug
npm run test:e2e:ui
```
*Lưu ý: Để chạy được E2E tests, bạn cần đảm bảo cả Backend NestJS và Database PostgreSQL đang hoạt động bình thường.*

---

## 🚀 2. Kiểm Thử Backend (NestJS 11)

Phần Backend sử dụng **Jest** làm khung kiểm thử tiêu chuẩn, kết hợp với thư viện `@nestjs/testing` để tạo các module kiểm thử cô lập.

### A. Unit Testing
Kiểm thử các Controller và Service độc lập bằng cách mock hoàn toàn các Repository (TypeORM) và AI Services (Gemini, Groq).

```bash
cd backend

# Chạy toàn bộ Unit test
npm run test

# Chạy ở chế độ Watch
npm run test:watch

# Chạy test và đo lường độ bao phủ (Coverage)
npm run test:cov
```

---

### B. Integration & E2E Testing (Supertest)
Kiểm thử tích hợp backend sẽ khởi chạy toàn bộ ứng dụng NestJS ở chế độ testing và thực hiện các yêu cầu HTTP ảo bằng **`supertest`** để kiểm tra các API endpoints, middleware phân quyền, và kết nối database thực tế.

Cấu hình test E2E nằm trong tệp `backend/test/jest-e2e.json` và các file kịch bản nằm trong thư mục `backend/test/`.

```bash
cd backend

# Chạy các bài test tích hợp E2E
npm run test:e2e
```

---

## 📊 3. Ngưỡng Độ Bao Phủ Mã Nguồn (Coverage Thresholds)

Để duy trì chất lượng mã nguồn ổn định, dự án được cấu hình ngưỡng chất lượng kiểm thử tối thiểu (Quality Gate) tại `backend/package.json`. Nếu chạy test coverage mà kết quả thấp hơn các chỉ số sau, pipeline CI/CD sẽ báo lỗi đỏ (Failed):

| Chỉ số (Metrics) | Ngưỡng Tối Thiểu (Backend) | Ngưỡng Tối Thiểu (Frontend) |
|---|---|---|
| **Statements** (Số câu lệnh) | **72%** | Tự do theo dõi |
| **Branches** (Số nhánh điều kiện) | **58%** | Tự do theo dõi |
| **Lines** (Số dòng code) | **72%** | Tự do theo dõi |
| **Functions** (Số hàm/phương thức) | **67%** | Tự do theo dõi |

---

## 🔄 4. Thứ Tự Ưu Tiên Chạy Kiểm Thử Trên CI (GitHub Actions)

Để tối ưu hóa thời gian chạy và chi phí tài nguyên trên GitHub Actions, các bài kiểm thử được sắp xếp theo thứ tự ưu tiên từ nhanh nhất đến chậm nhất:

1. **Static Analysis & Typechecks** (Chạy ESLint và `tsc` để kiểm tra lỗi cú pháp, kiểu dữ liệu).
2. **Unit Tests (Frontend & Backend)** (Vitest và Jest Unit run).
3. **Build Bundlers** (`next build` và `nest build` để đảm bảo code biên dịch thành công).
4. **E2E Tests (Playwright & Jest E2E)** (Chạy sau cùng ở một job riêng biệt, hoặc chạy định kỳ ban đêm nếu tốn nhiều thời gian).
