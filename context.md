# Session Context: Choyxona Telegram Mini App

> **Last Updated:** July 2, 2026 (16:25)  
> **Admin Telegram ID:** 943196988  
> **GitHub:** https://github.com/umarmax/Eski-Shahar-food (Public)  
> **Supabase Project:** icjrhufmtqedmihjogco  
> **Vercel:** Auto-deploys from GitHub pushes

---

## 🏗️ Current Architecture

### Tech Stack
| Layer | Technology |
|-------|------------|
| Frontend | React 19 + Vite 8 + TypeScript |
| State Management | Zustand |
| Styling | Tailwind CSS + Framer Motion |
| Backend | Supabase (PostgreSQL + Edge Functions) |
| Telegram SDK | Native `window.Telegram.WebApp` (NOT @twa-dev/sdk) |
| Deployment | Vercel (frontend) + Supabase (backend) |

### Recent Changes (July 2, 2026)
- **Fixed Telegram WebApp SDK** - Switched from `@twa-dev/sdk` to native `window.Telegram.WebApp`
- **Added Order ID Lookup** - Profile page now supports searching by order number
- **Customer Order Confirmation** - Bot sends order summary to customer after order
- **Fixed RLS Policies** - Orders now publicly readable for phone-based lookup
- **Rate Limiting** - Added to phone lookup (10 req/min)

---

## 📁 Project Structure

```
eski-shahar/
├── frontend/                    # Main application
│   ├── src/
│   │   ├── components/          # React components
│   │   ├── pages/               # Page components
│   │   ├── store/               # Zustand stores
│   │   ├── lib/
│   │   │   ├── telegram.ts      # Native Telegram WebApp wrapper
│   │   │   ├── supabase.ts      # Supabase client + queries
│   │   │   ├── auth.ts          # Telegram auth helpers
│   │   │   └── i18n.ts          # Translations (UZ/RU/EN)
│   │   ├── types/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── supabase/
│   │   ├── migrations/
│   │   │   ├── 001_initial_schema.sql
│   │   │   ├── 002_phone_profiles.sql
│   │   │   └── 003_orders_public_read.sql
│   │   ├── seed.sql
│   │   └── functions/
│   │       ├── telegram-auth/   # HMAC validation
│   │       ├── telegram-bot/    # Bot webhook + notifications
│   │       └── create-order/    # Secure order creation
│   ├── package.json
│   ├── vite.config.ts
│   └── vercel.json
├── context.md                   # This file
├── implementation_plan.md
├── SKILLS_PIPELINE.md           # 102 skills for autonomous work
└── README.md
```

---

## 🔑 Environment Variables

### Frontend (.env)
```env
VITE_SUPABASE_URL=https://icjrhufmtqedmihjogco.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_-3Q-Qn2C33twoV_MZJSWMA_LyqE1Lho
VITE_TELEGRAM_BOT_USERNAME=eskishahar_bot
```

### Supabase Edge Function Secrets
```
TELEGRAM_BOT_TOKEN=<from @BotFather> ✅ SET
TELEGRAM_ADMIN_CHAT_ID=6314294625
MINI_APP_URL=https://eski-shahar-food.vercel.app (NEEDS VERIFICATION)
```

---

## 🗄️ Database Schema

### Tables
- **products** - Menu items (name in 3 langs, price, category, image)
- **orders** - Customer orders (items, total, status, phone, telegram_user_id)
- **profiles** - User profiles (phone, telegram_id, name)

### RLS Policies (Updated)
- **Products:** Public read
- **Orders:** Public read (for phone/order ID lookup), public insert
- **Profiles:** Public read/write (for guest checkout)

---

## ⚡ Edge Functions (All Deployed)

| Function | Version | Status | Purpose |
|----------|---------|--------|---------|
| telegram-auth | v3 | ✅ ACTIVE | Validate Telegram initData |
| telegram-bot | v4 | ✅ ACTIVE | Bot webhook + customer notifications |
| create-order | v7 | ✅ ACTIVE | Secure order creation |

### telegram-bot Features:
- `/start` command with multilingual greeting (UZ/RU/EN)
- Admin notification on new order
- **NEW:** Customer order confirmation message
- Order status update via inline buttons

---

## 🐛 Known Issues

### Telegram Auth Not Working
**Symptom:** `WebApp.initDataUnsafe` is `undefined` inside Telegram  
**Root Cause:** The `@twa-dev/sdk` package conflicts with native Telegram script  
**Fix Applied:** Switched to native `window.Telegram.WebApp`  
**Status:** Needs testing in Telegram Mini App

### Workaround for Order Lookup
Users can find orders by:
1. **Phone number** - Enter the phone used during checkout
2. **Order ID** - Enter the 8-character order number (e.g., `5b8d0204`)

---

## 📊 Current Orders in Database

| Order ID | Phone | Name | Total | Status |
|----------|-------|------|-------|--------|
| 5b8d0204 | +998999144444 | Sh | 45,000 | pending |
| aeaa09c4 | +998999144445 | hhh | 45,000 | pending |

---

## 🚀 Deployment Commands

```bash
# Deploy Edge Functions
cd frontend
supabase functions deploy telegram-auth
supabase functions deploy telegram-bot
supabase functions deploy create-order

# Push migrations
supabase db push

# Push to GitHub (auto-deploys to Vercel)
git add -A && git commit -m "message" && git push origin main
```

---

## 📝 Session History

### Session 4 (July 2, 2026) - Current
- Fixed Telegram WebApp SDK (native implementation)
- Added order ID lookup feature
- Added customer order confirmation via Telegram
- Fixed RLS policies for public order access
- Added rate limiting to phone lookup
- Comprehensive debugging and logging

### Session 3 - Migration
- Migrated to Vite + Supabase
- Implemented all pages and components
- Created Edge Functions
- Full multilanguage support

---

## � TODO: Next Steps

### High Priority (Immediate)
- [ ] Test Telegram auth in real Mini App environment
- [ ] Verify MINI_APP_URL is set correctly in Supabase secrets
- [ ] Set up Telegram bot webhook if not done
- [ ] Test order flow end-to-end

### Medium Priority (This Week)
- [ ] Add loading skeletons for better UX
- [ ] Implement order status notifications to customer
- [ ] Add "Copy Order ID" button after checkout
- [ ] Remove debug console.log statements

### Low Priority (Future)
- [ ] Push notifications via Telegram
- [ ] Loyalty points system
- [ ] Promo codes
- [ ] Table reservation feature
- [ ] Admin dashboard for order management

---

## 🎯 SKILLS_PIPELINE Reference

For this project, use these skill chains:

**Web Development:**
```
site-architecture → seo-audit → page-cro → schema-markup → CodeBurn
```

**Code Review:**
```
caveman-review → CodeBurn
```

**Strategic Decisions:**
```
ceo-advisor → founder-coach → scenario-war-room → decision-logger
```

Always end tasks with **C-Level Advisory Opinion** (CTO, CFO, CPO perspectives).
