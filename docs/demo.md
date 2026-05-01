# Demo Guide

## Starting the demo

1. Start Docker services:

```bash
docker compose up -d
```

2. Start backend:

```bash
cd backend
npm install
npm run start:dev
```

3. Start frontend:

```bash
cd frontend
npm install
npm run dev
```

## Demo flow

1. Open `http://localhost:3000/register`
2. Create a new account
3. Sign in with that account
4. Show the dashboard
5. Open the question bank
6. Open an interview session
7. Optionally show Swagger at `http://localhost:3001/api/docs` to explain backend endpoints

## Fast troubleshooting

- Register/login shows network error: backend is not reachable on `http://localhost:3001`
- Database error: check `docker compose ps` and DB container logs
- Blank or stale frontend behavior: restart the frontend dev server after `.env` changes
