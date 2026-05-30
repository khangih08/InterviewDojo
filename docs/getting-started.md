# Getting Started / Team Setup

## Prerequisites

- Docker Desktop
- Node.js (recommended v18+) and npm or pnpm

## Start local environment

1. Start the database and supporting services:

```bash
docker compose up -d
```

2. Start backend (NestJS):

```bash
cd backend
npm install
npm run start:dev
```

3. Start frontend (Next.js):

```bash
cd frontend
npm install
npm run dev
```

## Local URLs

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3001`
- Swagger (backend API docs): `http://localhost:3001/api/docs`

## Database connection (default local)

- Host: `localhost`
- Port: `5432`
- User: `postgres`
- Password: `postgres`
- Database: `interview_dojo`

## Env notes

Ensure frontend environment points to the backend, for example in `frontend/.env`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

## Troubleshooting quick checks

- Backend unreachable: verify `docker compose ps` and backend logs.
- Database errors: confirm DB container is healthy and accessible.
- Frontend stale behavior after env changes: restart dev server.

---

If you'd like, I can also add a short script or `Makefile`/`package.json` `scripts` to centralize these commands.
