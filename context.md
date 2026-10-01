# Session Context: Eski Shahar Food Telegram Mini App

> **Last Updated:** September 26, 2026  
> **Admin Telegram ID:** stored only in Supabase secret `TELEGRAM_ADMIN_CHAT_ID` (older notes listed both 943196988 and 6314294625 — verify which is live)  
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

### Session 7 (October 2, 2026)
- Home redesigned (Manticha-style): hero photo with dome logo + slogan, language/theme chips on the photo, menu sections with 2-column cards (photo, price, weight, "+" -> stepper), scroll-to-top
- Bottom nav: Home, Cart, About, Profile; About shows full brand logo, reviews, Instagram/Facebook (set VITE_INSTAGRAM_URL / VITE_FACEBOOK_URL)
- Retro paper background without ornaments; caramel accents in both themes
- Pickup option at checkout (orders.order_type); dish weight (products.weight_grams); reviews (table + `reviews` function, admins can hide from the bot) — migration 006
- Placeholder photo for dishes without their own image

### Session 6 (September 26, 2026)
- Business info: Tashkent, Shayxontohur district, Chorsu market · +998 90 799 29 29 (`frontend/src/config/business.ts`)
- Removed the word "choyxona" from the UI/bot and removed "free delivery" claims
- Bot username → **@eskishaharfood_bot**
- **Admin panel** `/admin` (admin-products Edge Function + migration 005): dish CRUD, photo upload, stop-list toggle
- Admins `8627067211`, `6237960948` receive every order + location pin (the old TELEGRAM_ADMIN_CHAT_ID is no longer used)

### Recent Changes (September 26, 2026) — Session 5
- **Security lock-down** (migration 004): no anon access to `orders`/`profiles`; lookups via `my-orders` edge function
- **Webhook secret** enforced in `telegram-bot`; admin-only order buttons; `/notify-order` endpoint removed
- **create-order** trusts only HMAC-verified `initData` for Telegram identity; sends notifications directly
- **Delivery location at checkout**: Telegram LocationManager button + bot `request_location` fallback; admin gets map links + native pin
- **Order success screen** with order number + copy
- **Old-paper UI**: animated girih pattern background, parallax, tap "ink bloom", parchment palette
- Fixed: MainButton handler leak, Telegram BackButton wiring, profile upserts, double HTML escaping, hardcoded RU language

### Earlier Changes (July 2, 2026)
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
VITE_TELEGRAM_BOT_USERNAME=eskishaharfood_bot
```

### Supabase Edge Function Secrets
```
TELEGRAM_BOT_TOKEN=<from @BotFather> ✅ SET
TELEGRAM_ADMIN_CHAT_ID=<admin chat id>
TELEGRAM_WEBHOOK_SECRET=<random string, same as setWebhook secret_token> ⚠️ REQUIRED
MINI_APP_URL=https://eski-shahar-food.vercel.app (NEEDS VERIFICATION)
```

---

## 🗄️ Database Schema

### Tables
- **products** - Menu items (name in 3 langs, price, category, image)
- **orders** - Customer orders (items, total, status, phone, telegram_user_id)
- **profiles** - User profiles (phone, telegram_id, name)

### RLS Policies (migration 004)
- **Products:** Public read
- **Orders:** No anon access — only Edge Functions (service role)
- **Profiles:** No anon access — only Edge Functions (service role)

### Orders location columns
`delivery_lat`, `delivery_lng`, `location_accuracy`, `location_source` ('app' | 'bot'), `location_requested_at`, `lang`

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

### Order Lookup
- Inside Telegram: orders load automatically (signed initData → `my-orders`)
- Outside Telegram: **order number + phone** both required

---

## 🚀 Deployment Commands

```bash
# Deploy Edge Functions
cd frontend
supabase functions deploy telegram-auth
supabase functions deploy telegram-bot --no-verify-jwt
supabase functions deploy create-order
supabase functions deploy my-orders

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

### High Priority (Immediate — deploy Session 5)
- [ ] `supabase db push` (migrations 004 + 005)
- [ ] `supabase secrets set TELEGRAM_WEBHOOK_SECRET=...` and re-run `setWebhook` with `secret_token`
- [ ] Deploy all 5 functions (`telegram-bot` with `--no-verify-jwt`, new `my-orders`, new `admin-products`)
- [ ] Both admins press /start in @eskishaharfood_bot; set Vercel env `VITE_TELEGRAM_BOT_USERNAME=eskishaharfood_bot`
- [ ] Verify MINI_APP_URL in Supabase secrets
- [ ] Test in real Telegram: in-app location, chat-location fallback, address-only order, UZ/RU messages

### Medium Priority
- [ ] Admin status flow: preparing → on the way → delivered (each notifies customer)
- [ ] Delivery zone / fee from coordinates
- [ ] Loading skeletons on Product page

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
