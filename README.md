# Choyxona — Premium Uzbek Café Telegram Mini App

A luxury food delivery Telegram Mini App inspired by Old Tashkent, Bukhara, and Samarkand — blending Apple-level minimalism with authentic Uzbek hospitality.

## Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15, TypeScript, Tailwind CSS v4, Framer Motion |
| Telegram | `@twa-dev/sdk` — contact, location, haptics, theme |
| Backend | Node.js, Express 5, Prisma ORM |
| Database | PostgreSQL |
| Images | Unsplash (dev) / Cloudinary (production) |

## Quick Start

### Prerequisites

- Node.js 20+
- A Supabase project with a Postgres database

### Supabase setup

1. Create a Supabase project at https://supabase.com
2. Open Project Settings → Database
3. Copy the connection string for the Postgres database
4. Replace the placeholder password in the URL below and set it as `DATABASE_URL` in your environment

Example:

```env
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.icjrhufmtqedmihjogco.supabase.co:5432/postgres?sslmode=require
```

If you want to use Prisma migrations, run:

```bash
cd frontend
npx prisma db push
```

### Setup

```bash
cd choyxona

# Install dependencies
npm install

# Configure backend database
cp backend/.env.example backend/.env
# Edit DATABASE_URL in backend/.env

# Push schema & seed menu
npm run db:push
npm run db:seed

# Configure frontend
cp frontend/.env.example frontend/.env

# Run both servers
npm run dev
```

- Frontend: http://localhost:3000
- API: http://localhost:3001

### Telegram Bot Setup

1. Create a bot via [@BotFather](https://t.me/BotFather)
2. Set menu button URL to your deployed frontend
3. Add `TELEGRAM_BOT_TOKEN` to `backend/.env` for order notifications (optional)

## Deploy to Vercel

You do not need to create separate frontend and backend projects.

1. Push this repository to GitHub
2. Create one new Vercel project
3. Import the repository
4. Set the project root to the repository root, or use the frontend folder as the app directory if Vercel asks for it
5. Add these environment variables in Vercel:
   - `DATABASE_URL`
   - `NEXT_PUBLIC_ADMIN_TELEGRAM_ID`
   - `TELEGRAM_BOT_TOKEN` (optional)
   - `OPERATOR_CHAT_ID` (optional)
6. Deploy

The Next.js app in the frontend folder will be served from this single project, and Supabase will provide the database backend.

## Features

- **Home** — Cinematic hero, category carousel, chef picks, popular dishes
- **Menu** — 9 categories with filters (vegetarian, spicy, price, cook time)
- **Product** — Gallery, nutrition, ingredients, reviews, sticky add-to-cart
- **Search** — Instant search by name, ingredients, category
- **Cart** — Floating cart, promo codes (`SILKROAD10`), prep time estimate
- **Checkout** — Telegram contact + live location via WebApp API
- **Profile** — Order history, favorites, language (UZ/RU/EN)
- **Admin** — Orders management, analytics, popular dishes

## Design System

| Token | Value |
|-------|-------|
| Walnut (primary) | `#8B5E3C` |
| Golden sand | `#C79A5D` |
| Emerald accent | `#2E6F57` |
| Background | `#F8F3EB` |
| Typography | Cormorant Garamond + DM Sans |
| Radius | 18–24px |

## Order Flow

1. Customer adds items to cart
2. Checkout — confirms order
3. Telegram requests phone + location
4. Order sent to admin panel
5. Operator calls customer, confirms payment
6. Kitchen prepares → courier delivers

## Project Structure

```
choyxona/
├── frontend/          # Next.js Telegram Mini App
│   ├── app/           # Pages (App Router)
│   ├── components/    # UI, layout, providers
│   └── lib/           # API, store, i18n, types
└── backend/           # Express API
    ├── prisma/        # Schema + seed
    └── src/           # Routes
```

## Promo Code

Use `SILKROAD10` for 10% off during checkout.
