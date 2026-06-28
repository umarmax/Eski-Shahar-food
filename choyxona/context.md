# Session Context: Choyxona Telegram Mini App

## Admin Telegram ID: 6314294625

## What has been implemented so far:

### Session 1: Core Setup
1. Next.js 15 frontend + Express 5 backend scaffolded.
2. Zustand cart, Prisma ORM with PostgreSQL schema (Product, Order, User, etc).
3. `telegraf` bot installed: `/start` command shows a Web App button.
4. `notifyOperatorAndUser` in `bot.ts`: sends operator a full order message + coordinates pin; sends user a confirmation.
5. Env files created for both frontend and backend.

### Session 2: 4 Major Features (COMPLETED)

#### 1. Protected Admin Panel
- **Backend**: `isAdmin` middleware checks `x-telegram-id` header against `ADMIN_TELEGRAM_ID` env var.
- All `/api/admin/*` routes protected.
- **Frontend**: `BottomNav.tsx` conditionally renders Admin tab only if `webApp.initDataUnsafe.user.id === NEXT_PUBLIC_ADMIN_TELEGRAM_ID`.
- `api.ts` uses `getAdminHeaders()` helper to send `x-telegram-id` header with all admin requests.

#### 2. Menu Management (CRUD)
- **Backend**: `POST/PUT/PATCH/DELETE /api/admin/products` endpoints added.
- **Frontend**: Admin page has "Menu CRUD" tab listing all products with Edit / Delete buttons.
- `app/admin/menu/[id]/page.tsx` — full form to create or edit a product (name in 3 langs, price, image URL, category, flags).

#### 3. About Café Page
- `app/about/page.tsx` — static page with address, Yandex Maps link, working hours (10:00-23:00), clickable phone numbers, Telegram & Instagram links.
- "About" tab (Info icon) added to `BottomNav.tsx`.

#### 4. Checkout: Phone + Location
- Checkout page now has **both** a Telegram `requestContact()` button AND a manual `<input type="tel">` fallback.
- `requestLocation()` still uses Telegram LocationManager.
- The "Confirm Order" button is disabled until phone is filled.
- Full JSON (`items`, `phone`, `latitude`, `longitude`, `promoCode`, `comment`) sent to `POST /api/orders`.
- Bot then sends operator the details + a Telegram location pin.

## Current State of .env Variables:

### backend/.env
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/choyxona?schema=public
PORT=3001
FRONTEND_URL=http://localhost:3000
TELEGRAM_BOT_TOKEN=<SET THIS FROM BOTFATHER>
OPERATOR_CHAT_ID=<SET THIS - your operator group chat ID>
ADMIN_TELEGRAM_ID=6314294625
```

### frontend/.env
```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_ADMIN_TELEGRAM_ID=6314294625
```

## GitHub
- Repo: https://github.com/umarmax/eski-shahar
- Latest commit: `feat: Admin panel with CRUD, About page, protected routes, checkout improvements`

## Next Steps: DEPLOYMENT ON RAILWAY

### To deploy:
1. Go to https://railway.app → New Project → "Deploy from GitHub Repo" → select `umarmax/eski-shahar`
2. Add a **PostgreSQL** plugin in Railway dashboard.
3. Create a new Railway service for the backend (`choyxona/backend`):
   - Set Root Directory: `choyxona/backend`
   - Build Command: `npm install && npx prisma generate && npm run build`
   - Start Command: `node dist/index.js`
   - Environment Variables (from the list above, using Railway's DATABASE_URL).
4. Get the Railway backend URL (e.g. `https://choyxona-api.up.railway.app`).
5. Deploy **frontend** to Vercel:
   - Connect GitHub repo → set Root Directory to `choyxona/frontend`
   - Environment Variables: `NEXT_PUBLIC_API_URL=<railway backend URL>`, `NEXT_PUBLIC_ADMIN_TELEGRAM_ID=6314294625`
6. Update backend `FRONTEND_URL` to the Vercel URL.
7. Run `npm run db:push` and `npm run db:seed` on Railway via CLI or shell.
8. Set the Bot Menu Button URL in @BotFather to the Vercel URL.
