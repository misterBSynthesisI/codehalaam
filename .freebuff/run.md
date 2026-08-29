# CODEHALAAM — Run Doc

## How to Reproduce Artifacts

1. Install all dependencies:
   ```
   npm install
   cd client && npm install && cd ..
   cd server && npm install && cd ..
   ```
2. Start MongoDB (local instance or MongoDB Atlas)
3. Seed the database:
   ```
   cd server && npm run seed
   ```
4. Copy `.env` from main checkout if needed:
   ```
   cp server/.env server/.env.local
   ```

## How to Run the Dev Servers

### Client (Vite)
```bash
cd client && npx vite --port 5174
```

### Server (Express)
```bash
cd server && npm run dev
```

The client dev server is already running on **port 5174**.
