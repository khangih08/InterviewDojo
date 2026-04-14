# InterviewDojo - AI Mock Interview Platform

AI mock interview platform for interview practice.

## Docker database setup

1. Start PostgreSQL with Docker:
```bash
docker compose up -d
```

2. Backend config:
Use `backend/.env.example` as the reference. The Docker database uses:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=interview_dojo
PORT=3001
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

3. Frontend config:
Use `frontend/.env.example` as the reference:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

4. Start backend:
```bash
cd backend
npm run start:dev
```

5. Start frontend:
```bash
cd frontend
npm run dev
```

## Database tool connection

Use these values in DataGrip or pgAdmin:

- Host: `localhost`
- Port: `5432`
- User: `postgres`
- Password: `postgres`
- Database: `interview_dojo`

## Extra docs

- Team setup: [TEAM_SETUP.md](./TEAM_SETUP.md)
- Demo flow: [DEMO.md](./DEMO.md)
