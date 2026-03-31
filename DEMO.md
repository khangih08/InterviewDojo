# Demo Guide

1. Start Docker:
```bash
docker compose up -d
```

2. Start backend:
```bash
cd backend
npm run start:dev
```

3. Start frontend:
```bash
cd frontend
npm run dev
```

## Demo flow

1. Open `http://localhost:3000/register`
2. Create a new account
3. Sign in with that account
4. Show the dashboard
5. Open the question bank
6. Open an interview session
7. Show Swagger at `http://localhost:3001/api/docs` if you want to explain the backend

## Fast troubleshooting

- Register/login shows network error:
  Backend is not reachable on `http://localhost:3001`
- Database error:
  Check `docker compose ps`
- Blank or stale frontend behavior:
  Restart the frontend after `.env` changes
