# 🔄 Hướng Dẫn Về Tích Hợp & Phân Phối Liên Tục (CI/CD Guidance)

Dự án **InterviewDojo** tích hợp quy trình tự động hóa hoàn toàn việc kiểm tra chất lượng mã nguồn và triển khai thông qua **GitHub Actions**. Pipeline được kích hoạt tự động mỗi khi có sự kiện **Push** hoặc **Pull Request** gửi tới các nhánh chính như `main` và `develop`.

Tài liệu này giải thích cấu trúc pipeline CI/CD và cách hoạt động của nó trong thực tế.

---

## 🏗️ 1. Cấu Trúc Pipeline CI (Tích Hợp Liên Tục)

Pipeline CI được chia thành các **Jobs** chạy song song hoặc tuần tự để tối ưu thời gian phản hồi:

### Job 1: Cài Đặt & Kiểm Tra Tĩnh (Lint & Typecheck)
- **Mục tiêu**: Đảm bảo toàn bộ mã nguồn tuân thủ quy chuẩn viết code (Coding Conventions) và không có lỗi kiểu dữ liệu (TypeScript type errors).
- **Các bước thực thi**:
  - Khởi tạo môi trường Node.js.
  - Cài đặt thư viện bằng lệnh `npm ci` (để cài đặt chính xác các phiên bản được ghi nhận trong `package-lock.json`).
  - Chạy linter:
    - Frontend: `cd frontend && npm run lint`
    - Backend: `cd backend && npm run lint`
  - Chạy trình biên dịch TypeScript kiểm tra kiểu:
    - Frontend: `cd frontend && npx tsc --noEmit`
    - Backend: `cd backend && npx tsc --noEmit`

---

### Job 2: Kiểm Thử Độc Lập (Unit Testing)
- **Mục tiêu**: Đảm bảo tất cả các hàm logic và component hoạt động đúng như thiết kế, không bị lỗi khi sửa đổi code khác.
- **Các bước thực thi**:
  - Chạy bộ kiểm thử đơn vị frontend: `cd frontend && npm run test` (sử dụng **Vitest** cực nhanh).
  - Chạy bộ kiểm thử đơn vị backend: `cd backend && npm run test:ci` (sử dụng **Jest** với cấu hình CI).
  - Yêu cầu vượt qua ngưỡng độ bao phủ (Coverage Threshold) được cấu hình (ví dụ: Backend > 72%).

---

### Job 3: Xác Minh Khả Năng Biên Dịch (Build Verification)
- **Mục tiêu**: Đảm bảo dự án có thể build thành công sang dạng Production mà không phát sinh bất kỳ lỗi đóng gói nào.
- **Các bước thực thi**:
  - Biên dịch Frontend: `cd frontend && npm run build` (Next.js compilation).
  - Biên dịch Backend: `cd backend && npm run build` (NestJS compilation).

---

## 🚀 2. Quy Trình Phân Phối CD (Triển Khai Tự Động)

Khi một Pull Request được phê duyệt và được **Merge (gộp)** thành công vào nhánh `main`, quy trình CD sẽ được kích hoạt để tự động triển khai mã nguồn mới lên môi trường Production thực tế:

### A. Triển Khai Frontend (Next.js) -> Vercel (Thông qua Repo Fork)
- **Dịch vụ lưu trữ**: **Vercel** (tối ưu hóa hoàn hảo cho các ứng dụng Next.js SSR/Static).
- **Luồng triển khai**:
  - Khi có code mới được gộp vào các nhánh chính (`main`/`develop`), workflow [mirror-to-fork.yml](file:///d:/git_clone_repo/InterviewDojo/.github/workflows/mirror-to-fork.yml) sẽ tự động mirror (đồng bộ) các thay đổi này sang repo fork cá nhân của bạn.
  - Dự án Vercel cá nhân liên kết trực tiếp với repo fork đó sẽ tự động kích hoạt tiến trình biên dịch (build) và triển khai (deploy) mượt mà lên môi trường tương ứng (`production` hoặc `preview`).

### B. Triển Khai Backend (NestJS) -> Render
- **Dịch vụ lưu trữ**: **Render** (chạy dưới dạng Web Service chạy Node.js hoặc Docker Container kết nối với database PostgreSQL).
- **Luồng triển khai**:
  - Kích hoạt qua [render-deploy.yml](file:///d:/git_clone_repo/InterviewDojo/.github/workflows/render-deploy.yml) thông qua việc gửi tín hiệu Deploy Trigger URL tới Render API.
  - Render tự động tải phiên bản code mới nhất, cài đặt, chạy build và chuyển đổi lưu lượng truy cập (Traffic) một cách mượt mà không gây gián đoạn hệ thống (Zero-downtime deployment).

---

## ⚡ 3. Các Tối Ưu Hóa Kỹ Thuật Trên CI/CD

Để tăng tốc độ chạy của pipeline từ 10 phút xuống còn dưới 3 phút, dự án áp dụng các kỹ thuật:

1. **Sử dụng `npm ci`**: Lệnh này nhanh hơn `npm install` từ 2 đến 3 lần vì nó bỏ qua việc giải quyết các xung đột phiên bản và cài đặt trực tiếp từ lockfile.
2. **Cơ Chế Caching (GitHub Cache)**:
   - Sử dụng `actions/setup-node@v4` với tùy chọn `cache: 'npm'` để lưu lại thư mục cache của npm toàn cục giữa các lần chạy.
   - Cache thư mục `.next/cache` của Next.js để tăng tốc độ build frontend lên tới 70% nhờ cơ chế Incremental Builds.
3. **Chạy Song Song (Parallelism)**: Chạy song song các job Lint, Test Frontend, và Test Backend giúp tối ưu hóa băng thông của GitHub runner.
