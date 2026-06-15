# InterviewDojo 🥋

> **Nền tảng luyện phỏng vấn thử tích hợp AI** giúp các ứng viên rèn luyện và bứt phá kỹ năng phỏng vấn thông qua các phiên tương tác thực tế có tính giờ, tích hợp mã nguồn sandbox và nhận phản hồi chi tiết từ AI ngay lập tức.
> 
> *An AI-powered mock interview platform that helps candidates practice and improve their interviewing skills through realistic, timed sessions with instant AI feedback, integrated coding sandbox, and real-time webcam expression tracking.*

🚀 **Trải nghiệm ngay (Live Demo / Production):** [https://interview-dojo-smoky.vercel.app/](https://interview-dojo-smoky.vercel.app/)

---

## ✨ Các Tính Năng Nổi Bật / Core Features

- **🎯 Phân Tích & Chấm Điểm Từ AI (AI Feedback)** — Nhận phân tích chuyên sâu về nội dung câu trả lời, từ vựng và thái độ sử dụng **Groq SDK & Google Gemini (Generative AI)**.
- **🗣️ Phiên Phỏng Vấn Thử Thực Tế (Mock Interviews)** — Môi trường giả lập phỏng vấn thực tế, hỗ trợ ghi âm trực tiếp và tương tác hội thoại.
- **📚 Ngân Hàng Câu Hỏi Tích Hợp RAG (Pinecone & LangChain)** — Hệ thống câu hỏi phân loại theo vai trò, độ khó. Sử dụng cơ chế RAG (Retrieval-Augmented Generation) thông qua **Pinecone Vector Database** và **LangChain** để cá nhân hóa việc lấy câu hỏi phù hợp nhất với hồ sơ ứng viên.
- **💻 Coding Sandbox Trực Tuyến** — Cho phép ứng viên giải các bài tập coding trực tiếp trong lúc phỏng vấn bằng **Monaco Editor** ở frontend, chạy code an toàn ở backend bằng môi trường sandbox cô lập của **`vm2`**.
- **📷 Webcam Expression Tracking (MediaPipe)** — Phân tích nét mặt và cử chỉ của ứng viên thời gian thực sử dụng **Google MediaPipe Tasks Vision** ở frontend và **`face-api.js`** ở backend để giúp ứng viên rèn luyện sự tự tin, bình tĩnh.
- **📈 Biểu Đồ Tiến Độ (Streaks & Analytics)** — Theo dõi tần suất luyện tập, lịch sử phỏng vấn, và gợi ý chủ đề cần học tiếp theo dựa trên AI.
- **🔐 Bảo Mật & Xác Thực Cực Hạn** — Hệ thống JWT Auth (Access Token + Refresh Token) kết hợp Google OAuth 2.0.

---

## 🛠️ Công Nghệ Sử Dụng / Tech Stack

| Thành Phần | Công Nghệ Thực Tế / Technologies |
|---|---|
| **Frontend** | **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS v4**, shadcn/ui, Recharts, Lucide Icons, Monaco Editor |
| **Backend** | **NestJS 11**, TypeORM, PostgreSQL 16, Passport JWT, Redis (`ioredis`), `vm2` (Sandbox), `face-api.js` |
| **AI & RAG** | **Google Generative AI (Gemini)**, **Groq SDK**, OpenAI SDK, **LangChain Suite** (Core, Community, Pinecone, TextSplitters), Pinecone Vector DB |
| **Kiểm Thử** | **Vitest** + React Testing Library + MSW (Frontend Unit), **Jest** + `@nestjs/testing` (Backend Unit), **Playwright** (E2E Testing) |
| **CI/CD & DevOps** | GitHub Actions, Docker & Docker Compose (dev + prod profiles) |

---

## 📁 Cấu Trúc Dự Án / Project Structure

```
InterviewDojo/
├── frontend/                 # 🌐 Next.js Application (Next.js 16 + React 19)
│   ├── app/                  # App Router Pages
│   │   ├── (auth)/           # Xác thực (Đăng nhập, Đăng ký, Quên mật khẩu...)
│   │   ├── (main)/           # Dashboard, Questions, Result, Settings, Profile
│   │   ├── admin/            # Quản trị hệ thống Frontend
│   │   ├── interview/        # Giao diện phỏng vấn trực tiếp & Webcam Tracking
│   │   └── globals.css       # Tailwind CSS v4 design tokens & animations
│   ├── components/           # shadcn/ui primitives & Custom UI
│   ├── hooks/                # Custom React Hooks (useInterviewSession, useSandboxEditor...)
│   ├── contexts/             # Auth & Subscription providers
│   ├── lib/                  # API Clients, utilities
│   ├── tests/                # Unit/Component tests (Vitest + MSW)
│   └── e2e/                  # End-to-End tests (Playwright)
├── backend/                  # 🚀 NestJS Application (NestJS 11)
│   ├── src/
│   │   ├── auth/             # Authentication, JWT, Google OAuth
│   │   ├── questions/        # Ngân hàng câu hỏi
│   │   ├── interviews/       # Giao diện phỏng vấn, lưu kết quả & AI đánh giá
│   │   ├── rag/              # Module RAG sử dụng Pinecone & LangChain
│   │   ├── ai/               # Gateway kết nối API Gemini, Groq, OpenAI
│   │   ├── user/             # Quản lý thông tin và hồ sơ ứng viên
│   │   ├── admin/            # Quản lý Admin Backend
│   │   └── entities/         # TypeORM PostgreSQL entities
│   ├── test/                 # E2E Tests (Jest)
│   └── Dockerfile            # Dockerfile Backend
├── docs/                     # 📚 Bộ tài liệu hướng dẫn (Đã dịch sang Tiếng Việt)
├── docker-compose.yml        # Docker compose chứa database PostgreSQL, pgAdmin...
└── .github/workflows/        # Quy trình CI/CD tự động
```

---

## 🚀 Hướng Dẫn Cài Đặt Nhanh / Quick Start

### Yêu Cầu Hệ Thống / Prerequisites
- **Node.js** v22+
- **Docker** & Docker Compose
- **Git**

### Bước 1: Khởi Chạy Database (Docker)
```bash
git clone https://github.com/khangih08/InterviewDojo.git
cd InterviewDojo
docker compose up -d
```
> **Thông tin kết nối CSDL mặc định:**
> Host: `localhost` · Port: `5432` · User: `postgres` · Password: `postgres` · Database: `interview_dojo`

### Bước 2: Thiết Lập & Chạy Backend (NestJS 11)
```bash
cd backend
cp .env.example .env        # Cấu hình các API keys cần thiết (Pinecone, Gemini, Groq...)
npm install
npm run start:dev
```

### Bước 3: Thiết Lập & Chạy Frontend (Next.js 16)
```bash
cd ../frontend
cp .env.local.example .env.local
npm install
npm run dev
```
> **Cấu hình `frontend/.env.local` bắt buộc:**
> ```env
> NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
> ```

### Bước 4: Trải Nghiệm Ứng Dụng
- **Frontend App**: `http://localhost:3000`
- **Backend Swagger (API Docs)**: `http://localhost:3001/api/docs`

---

## 🧪 Hệ Thống Kiểm Thử / Testing

Dự án được cấu hình hệ thống kiểm thử cực kỳ nghiêm ngặt ở cả hai đầu:

```bash
# [Frontend] Chạy unit test (Vitest)
cd frontend && npm run test

# [Frontend] Chạy test coverage
cd frontend && npm run test:coverage

# [Frontend] Chạy E2E test (Playwright)
cd frontend && npm run test:e2e

# [Backend] Chạy unit test (Jest)
cd backend && npm run test

# [Backend] Chạy test coverage
cd backend && npm run test:cov
```

---

## 📚 Hệ Thống Tài Liệu Chi Tiết / Documentation

Bộ tài liệu của dự án đã được bản địa hóa sang **Tiếng Việt** và nâng cấp chuyên sâu để hỗ trợ nhà phát triển dễ dàng tích hợp và phát triển tiếp:

| Tài liệu | Mô tả chi tiết |
|---|---|
| 🏁 **[Hướng dẫn Cài đặt](docs/getting-started.md)** | Hướng dẫn chi tiết setup Docker, Pinecone, cấu hình API Keys và Redis. |
| 📐 **[Kiến trúc Hệ thống](docs/architecture.vi.md)** | Giải thích luồng hoạt động của AI Engine, RAG, Coding Sandbox và MediaPipe Vision. |
| 🧪 **[Tài liệu Kiểm thử](docs/TESTS.md)** | Hướng dẫn kiểm thử nâng cao với Vitest, MSW Mock API, Jest và Playwright. |
| 🔄 **[Kiến trúc CI/CD](docs/CI.md)** | Mô tả luồng tự động hóa tích hợp liên tục (GitHub Actions) và phân phối lên Vercel/Render. |
| 🎭 **[Kịch bản Demo](docs/demo.md)** | Quy trình trình diễn hoàn chỉnh các tính năng chính của hệ thống. |
| 🗺️ **[Lộ trình Phát triển](docs/roadmap.vi.md)** | Roadmap phát triển sản phẩm của InterviewDojo từ MVP đến Enterprise. |
| 🤝 **[Quy tắc Đóng góp](docs/CONTRIBUTING.md)** | Các quy tắc về đặt tên nhánh (branching), commit messages và pull requests. |

---

## 📄 Bản Quyền / License

Dự án này là mã nguồn nội bộ và bảo mật (Private & Unlicensed).
