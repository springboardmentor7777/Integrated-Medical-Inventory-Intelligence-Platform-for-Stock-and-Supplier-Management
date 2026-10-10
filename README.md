# Inventory frontend

React + Vite + Recharts. Tests: Vitest + React Testing Library.

## Run
    npm install
    cp .env.example .env     # set VITE_API_URL
    npm run dev
    npm test

## API contract (edit src/api.js to match your backend)
- GET /inventory -> [{ id, name, category, quantity }]
- GET /analytics/stock-movement -> [{ date, in, out, level }]

## Deploy to Vercel
1. Push this folder to GitHub and import it in Vercel (framework: Vite).
2. Add env var `VITE_API_URL` = your production API URL (e.g. https://api.example.com/api).
3. Deploy. `vercel.json` handles SPA routing.
4. On your backend, allow the Vercel domain in CORS.

## Verify production connectivity
- Open the deployed site, then DevTools > Network: `/inventory` and `/analytics/stock-movement` should return 200.
- Cards, 3 charts and the inventory table should show real data.
- If you see a CORS error, add the Vercel origin to the backend's allowed origins.
- If requests go to localhost, `VITE_API_URL` wasn't set before the build; set it and redeploy.
