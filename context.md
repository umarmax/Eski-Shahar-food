# Session Context: Choyxona Telegram Mini App

> **Last Updated:** July 2, 2026  
> **Admin Telegram ID:** 943196988  
> **GitHub:** https://github.com/umarmax/Eski-Shahar-food (Public)  
> **Supabase Project:** icjrhufmtqedmihjogco

---

## 🏗️ Current Architecture

### Tech Stack (Migrated from Next.js/Express)
| Layer | Technology |
|-------|------------|
| Frontend | React 19 + Vite 8 + TypeScript |
| State Management | Zustand |
| Styling | Tailwind CSS + Framer Motion |
| Backend | Supabase (PostgreSQL + Edge Functions) |
| Telegram SDK | @twa-dev/sdk |
| Deployment | Vercel (frontend) + Supabase (backend) |

### Why We Migrated
- **From:** Next.js 15 + Express 5 + Prisma + Railway
- **To:** Vite + Supabase
- **Reason:** Simpler architecture, faster builds, serverless Edge Functions, built-in auth

---

## 📁 Project Structure

```
eski-shahar/
├── frontend/                    # Main application
│   ├── src/
│   │   ├── components/          # React components
│   │   │   ├── Layout.tsx       # Bottom navigation
│   │   │   ├── ProductCard.tsx  # Food item cards
│   │   │   ├── CategoryList.tsx # Food categories
│   │   │   ├── HeroSection.tsx  # Café hero banner
│   │   │   ├── USPBanners.tsx   # Unique selling points
│   │   │   ├── PageHeader.tsx   # Page headers
│   │   │   ├── ErrorBoundary.tsx
│   │   │   └── TelegramMainButtonSync.tsx
│   │   ├── pages/               # Page components
│   │   │   ├── HomePage.tsx     # Landing page
│   │   │   ├── MenuPage.tsx     # Food catalog
│   │   │   ├── ProductPage.tsx  # Food item detail
│   │   │   ├── CartPage.tsx     # Shopping cart
│   │   │   ├── OrderFormPage.tsx # Checkout form
│   │   │   ├── ProfilePage.tsx  # User profile
│   │   │   ├── SettingsPage.tsx # Language/theme settings
│   │   │   └── AboutPage.tsx    # Café info
│   │   ├── store/               # Zustand stores
│   │   │   ├── settingsStore.ts # Language, theme, currency
│   │   │   ├── authStore.ts     # Auth state
│   │   │   ├── cartStore.ts     # Cart management
│   │   │   └── appStore.ts      # Products/menu state
│   │   ├── lib/                 # Utilities
│   │   │   ├── telegram.ts      # Telegram SDK wrapper
│   │   │   ├── supabase.ts      # Supabase client
│   │   │   ├── auth.ts          # Telegram auth helpers
│   │   │   └── i18n.ts          # Translations (UZ/RU/EN)
│   │   ├── data/                # Mock/fallback data
│   │   │   ├── mockProducts.ts  # Fallback menu
│   │   │   └── categories.ts    # Food categories
│   │   ├── types/
│   │   │   └── index.ts         # TypeScript types
│   │   ├── App.tsx              # Router + AnimatePresence
│   │   ├── main.tsx             # Entry point
│   │   └── index.css            # Choyxona theme
│   ├── supabase/
│   │   ├── migrations/
│   │   │   └── 001_initial_schema.sql  # Database schema
│   │   ├── seed.sql             # Sample menu data
│   │   └── functions/           # Edge Functions
│   │       ├── telegram-auth/   # HMAC validation
│   │       ├── telegram-bot/    # Bot webhook + notifications
│   │       └── create-order/    # Secure order creation
│   ├── package.json
│   ├── vite.config.ts
│   ├── vercel.json
│   └── .env.example
├── context.md                   # This file
├── implementation_plan.md       # Detailed progress tracking
└── README.md
```

---

## 🔑 Environment Variables

### Frontend (.env)
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_TELEGRAM_BOT_USERNAME=eskishahar_bot
```

### Supabase Edge Function Secrets
```
TELEGRAM_BOT_TOKEN=<from @BotFather>
TELEGRAM_ADMIN_CHAT_ID=6314294625
MINI_APP_URL=https://your-app.vercel.app
```

---

## 🗄️ Database Schema (Supabase PostgreSQL)

### Tables
- **products** - Menu items (name in 3 langs, price, category, image, flags)
- **orders** - Customer orders (items, total, status, phone, location)
- **profiles** - User profiles (linked to Telegram ID)
- **categories** - Food categories

### Row Level Security (RLS)
- Products: Public read, admin write
- Orders: User can read own orders, admin can read all
- Profiles: User can read/update own profile

---

## ⚡ Supabase Edge Functions

### 1. telegram-auth
- **Purpose:** Validate Telegram initData using HMAC-SHA256
- **Endpoint:** `POST /functions/v1/telegram-auth`
- **Returns:** User data if valid, 401 if invalid

### 2. telegram-bot
- **Purpose:** Handle Telegram bot webhook + send admin notifications
- **Endpoint:** `POST /functions/v1/telegram-bot`
- **Features:**
  - `/start` command with Web App button
  - Order notifications to admin (chat ID: 6314294625)
  - Location pin for delivery orders

### 3. create-order
- **Purpose:** Securely create orders with validation
- **Endpoint:** `POST /functions/v1/create-order`
- **Validates:** Auth, items, phone, calculates total

---

## 🎨 Theme Colors (Choyxona)

| Color | Hex | Usage |
|-------|-----|-------|
| Primary Brown | `#8B5E3C` | Buttons, links |
| Gold Accent | `#C79A5D` | Highlights, accents |
| Cream Background | `#F8F3EB` | Light mode background |
| Dark Background | `#1c1c1e` | Dark mode background |

---

## 🌐 Multilanguage Support

| Language | Code | Status |
|----------|------|--------|
| O'zbek | `uz` | ✅ Full |
| Русский | `ru` | ✅ Full |
| English | `en` | ✅ Full |

---

## 🚀 Deployment Guide

### Step 1: Supabase Setup
1. Create project at [supabase.com](https://supabase.com)
2. Go to SQL Editor → Run `001_initial_schema.sql`
3. Run `seed.sql` to populate menu
4. Copy URL and anon key

### Step 2: Deploy Edge Functions
```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref your-project-ref

# Deploy functions
supabase functions deploy telegram-auth
supabase functions deploy telegram-bot
supabase functions deploy create-order

# Set secrets
supabase secrets set TELEGRAM_BOT_TOKEN=your-token
supabase secrets set TELEGRAM_ADMIN_CHAT_ID=6314294625
supabase secrets set MINI_APP_URL=https://your-app.vercel.app
```

### Step 3: Telegram Bot Setup
1. Create bot via @BotFather (or use existing)
2. Set webhook: `https://your-project.supabase.co/functions/v1/telegram-bot`
3. Set Menu Button URL to your Vercel app URL

### Step 4: Deploy to Vercel
1. Push to GitHub
2. Import in Vercel → Set root directory to `frontend`
3. Add environment variables
4. Deploy

---

## 📊 Implementation Status

| Phase | Status |
|-------|--------|
| Project Setup | ✅ 100% |
| Core Infrastructure | ✅ 100% |
| State Management | ✅ 100% |
| Components | ✅ 100% |
| Pages | ✅ 100% |
| App Entry & Router | ✅ 100% |
| Types & Data | ✅ 100% |
| Supabase Backend | ✅ 100% |
| Configuration | ✅ 100% |

**Overall: 100% Complete** 🎉

---

## 🔮 Future Enhancements

### Medium Priority
- [ ] Loading skeletons for better UX
- [ ] Pull-to-refresh functionality
- [ ] Order history page
- [ ] Favorites functionality
- [ ] Search functionality

### Low Priority
- [ ] Push notifications
- [ ] Loyalty points system
- [ ] Promo codes
- [ ] Table reservation feature

---

## 📝 Session History

### Session 1 (Legacy - Next.js)
- Initial Next.js 15 + Express 5 setup
- Prisma ORM with PostgreSQL
- Telegraf bot integration

### Session 2 (Legacy - Features)
- Admin panel with CRUD
- About page
- Checkout improvements

### Session 3 (Current - Migration)
- Migrated to Vite + Supabase
- Implemented all pages and components
- Created Edge Functions
- Full multilanguage support
- Ready for deployment
