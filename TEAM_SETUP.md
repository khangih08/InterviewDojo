# Team Setup

## Prerequisites

- Docker Desktop
- Node.js and npm

## First run

1. Start the database:
```bash
docker compose up -d
```

2. Start the backend:
```bash
cd backend
npm run start:dev
```

3. Start the frontend:
```bash
cd frontend
npm run dev
```

## Expected local URLs

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3001`
- Swagger: `http://localhost:3001/api/docs`

## Database connection

- Host: `localhost`
- Port: `5432`
- User: `postgres`
- Password: `postgres`
- Database: `interview_dojo`

## If auth requests fail

- Check Docker: `docker compose ps`
- Check backend: `http://localhost:3001/api/docs`
- Make sure `frontend/.env` contains:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```
