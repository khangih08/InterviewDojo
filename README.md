# InterviewDojo 🥋

AI-powered mock interview platform that helps candidates practice and improve their interviewing skills through realistic, timed sessions with instant AI feedback.

## ✨ Features

- **AI-Powered Feedback** — Get instant, detailed analysis on every answer using Groq & Google Gemini
- **Mock Interview Sessions** — Timed, realistic interview environment with audio recording
- **Question Bank** — Searchable & filterable questions by category, difficulty, and tags
- **Progress Dashboard** — Visual stats, session history, streaks, and skill tracking
- **Multiple Tracks** — Frontend, Backend, Data Science, PM, and General SWE paths
- **Auth System** — Email/password + Google OAuth with JWT refresh tokens
- **Theme Support** — Light, dark, and system preference modes
- **Subscription Plans** — Simulated Free / Pro / Teams upgrade flow
- **Responsive Design** — Premium glassmorphism UI with sidebar navigation + mobile nav

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | Next.js 16, React 19, TailwindCSS v4, shadcn/ui, Recharts, Lucide Icons |
| **Backend** | NestJS 11, TypeORM, PostgreSQL 16, Passport JWT |
| **AI** | Groq SDK, Google Generative AI (Gemini), OpenAI SDK |
| **Testing** | Vitest + React Testing Library (frontend), Jest (backend), Playwright (E2E) |
| **CI/CD** | GitHub Actions → Vercel (frontend) + Render (backend) |
| **Infra** | Docker Compose (dev + prod profiles), Nodemailer (email) |

## 📁 Project Structure

```
InterviewDojo/
├── frontend/                 # Next.js application
│   ├── app/                  # App Router pages
│   │   ├── (auth)/           # Login, Register, Forgot Password, Google Onboarding
│   │   ├── (main)/           # Dashboard, Questions, Interview, Result, Settings, Profile
│   │   ├── page.tsx          # Landing page
│   │   └── globals.css       # Design system tokens & animations
│   ├── components/
│   │   ├── landing/          # Landing page sections (Hero, Features, Pricing, FAQ...)
│   │   ├── layout/           # Sidebar, AppShell, MobileNav
│   │   ├── dashboard/        # Dashboard cards & widgets
│   │   ├── settings/         # Theme, Subscription, Sessions management
│   │   ├── interview/        # Recording & interview UI
│   │   └── ui/               # shadcn/ui primitives
│   ├── contexts/             # Auth & Subscription providers
│   ├── lib/                  # API clients, utilities, landing data
│   └── tests/                # Unit & E2E tests
├── backend/                  # NestJS application
│   └── src/
│       ├── auth/             # Authentication, JWT, sessions, Google OAuth
│       ├── questions/        # Question bank CRUD
│       ├── categories/       # Question categories
│       ├── interviews/       # Interview sessions & AI analysis
│       ├── user/             # User management
│       └── entities/         # TypeORM entities
├── docs/                     # Internal documentation
├── docker-compose.yml        # Dev & prod Docker profiles
└── .github/workflows/        # CI/CD pipelines
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** v22+
- **Docker** & Docker Compose
- **Git**

### 1. Clone & Setup Database

```bash
git clone https://github.com/khangih08/InterviewDojo.git
cd InterviewDojo
docker compose up -d
```

> **Database credentials (local):**
> Host: `localhost` · Port: `5432` · User: `postgres` · Password: `postgres` · Database: `interview_dojo`

### 2. Backend

```bash
cd backend
cp .env.example .env        # Edit with your API keys
npm install
npm run start:dev
```

<details>
<summary><strong>Backend environment variables</strong></summary>

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=interview_dojo

JWT_SECRET=change-me
JWT_REFRESH_SECRET=change-me-too
GOOGLE_CLIENT_ID=your-google-client-id
GROQ_API_KEY=your-groq-api-key
Gemini_API_KEY=your-gemini-api-key

SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USERNAME=your-smtp-user
SMTP_PASSWORD=your-smtp-password
SMTP_SECURE=false
SMTP_FROM="Interview Dojo <no-reply@example.com>"

PORT=3001
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

</details>

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Create `frontend/.env.local`:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

### 4. Open the App

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Swagger docs**: http://localhost:3001/api/docs

## 🐳 Docker (Full Stack)

```bash
# Development (with hot-reload)
docker compose --profile dev up -d

# Production
docker compose --profile prod up -d
```

## 🧪 Testing

```bash
# Frontend unit tests (Vitest)
cd frontend && npm test

# Frontend with coverage
cd frontend && npm run test:coverage

# Frontend E2E (Playwright)
cd frontend && npm run test:e2e

# Backend unit tests (Jest)
cd backend && npm test

# Backend with coverage
cd backend && npm run test:ci
```

## 🔄 CI/CD

Automated via GitHub Actions on push/PR to `main` and `develop`:

1. **Build** — Frontend (`next build`) + Backend (`nest build`)
2. **Test** — Unit tests for both frontend & backend
3. **Deploy** — Frontend to **Vercel** + Backend to **Render** (on merge to main)

Workflows: [`ci.yml`](.github/workflows/ci.yml) · [`vercel-deploy.yml`](.github/workflows/vercel-deploy.yml) · [`render-deploy.yml`](.github/workflows/render-deploy.yml)

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [Getting Started](docs/getting-started.md) | Detailed setup instructions |
| [Contributing](docs/CONTRIBUTING.md) | Branch conventions, PR guidelines |
| [Tests](docs/TESTS.md) | Test suites and how to run them |
| [CI Guide](docs/CI.md) | CI pipeline architecture |
| [Demo Guide](docs/demo.md) | How to run a demo |
| [Roadmap](docs/roadmap.md) | Development roadmap and priorities |

## 📄 License

This project is unlicensed and private.
