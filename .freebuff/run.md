# CODEHALAAM — Run Instructions

## Servers

### Backend (Express + MongoDB)
- **Port:** 5000
- **Health:** `http://localhost:5000/api/health`
- **DB:** `mongodb://localhost:27017/codehalaam`
- **Start:** `cd server && node index.js`

### Frontend (Vite + React)
- **Port:** 5174
- **URL:** `http://localhost:5174`
- **Start:** `cd client && npx vite --port 5174`

## Demo Credentials
- **Email:** neo@codehalaam.dev
- **Password:** password123

## Seed Database
```bash
cd server && node seed.js
```
