// README.md
# GA Equipment API (Node.js + Express + MongoDB)

## Quick Start (Local)
1. `npm i`
2. Duplicate `.env.example` → `.env` and fill values
3. Run MongoDB (local or Atlas). Set `MONGODB_URI`
4. Seed sample data: `npm run seed`
5. Start API: `npm run dev`
6. Health check: `GET http://localhost:8080/health`

### Test Auth (sample users from seed)
- admin/admin123 (role: admin)
- inspector/inspect123 (role: inspector, code: INS001)
- user/user123 (role: user)

## Deploy on Render
- New Web Service → Repo root → Build & Start: `npm install && npm run start`
- Env vars: `MONGODB_URI`, `JWT_SECRET`, `NODE_ENV=production`, `COOKIE_SECURE=true`, `CORS_ORIGIN=https://<your-frontend-domain>`
- Add a one-off job to seed: `npm run seed`

## Endpoints (Summary)
- `POST /auth/login` → httpOnly cookie `access_token`
- `POST /auth/logout`
- `GET /auth/me`
- `GET /auth/inspectors/verify?code=INS001`
- `GET /equipment` (query, paging)
- `GET /equipment/:code`
- `POST /equipment` (admin)
- `PUT /equipment/:code` (admin)
- `DELETE /equipment/:code` (admin)
- `GET /equipment/:code/inspections`
- `POST /equipment/:code/inspections`
- `GET /requests`
- `POST /requests`
- `PUT /requests/:id/status` (admin)
- `GET /settings`
- `PUT /settings` (admin)
- `GET /export/equipment` (CSV)
- `GET /export/requests` (CSV)

## Frontend Wiring (no big rewrites)
- Host the backend on Render, note the base URL
- In each HTML page, before your custom scripts, define:
```html
<script>window.API_BASE_URL = 'https://your-service.onrender.com';</script>
<script type="module" src="/public/api-client.js"></script>
```
- Replace local mocks with `api.*` functions. **Important:** always pass `credentials: 'include'` (handled by the client) and handle 401 by redirecting to `login.html`.# GA-Equipments
