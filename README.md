# Eski Shahar Food — Telegram Mini App

Food-ordering Telegram Mini App for Eski Shahar (Tashkent, Shayxontohur district, Chorsu market · +998 90 799 29 29). Bot: @eskishaharfood_bot. Old-paper look with an animated Uzbek girih pattern, UZ/RU/EN UI, orders delivered to the admin through a Telegram bot.

## Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite 8, TypeScript, Tailwind CSS v4, Framer Motion, Zustand |
| Telegram | Native `window.Telegram.WebApp` (MainButton, BackButton, haptics, LocationManager) |
| Backend | Supabase — Postgres + Edge Functions (Deno) |
| Hosting | Vercel (frontend), Supabase (backend) |

## Project structure

```
frontend/
├── src/
│   ├── components/   # Layout, AppBackground, LocationPicker, ProductCard, ...
│   ├── pages/        # Home, Menu, Product, Cart, OrderForm, Profile, Settings, About
│   ├── store/        # Zustand: cart, settings, auth, app (products)
│   ├── lib/          # telegram.ts, supabase.ts, auth.ts, i18n.ts
│   └── index.css     # paper palette + background layers
└── supabase/
    ├── migrations/   # 001…004 (004 = RLS lock-down + location columns)
    └── functions/
        ├── _shared/        # initData validation, Telegram API, order messages
        ├── admin-products/ # menu management for admins (CRUD + photo upload URLs)
        ├── create-order/   # validates + prices order server-side, notifies admin/customer
        ├── my-orders/      # returns caller's orders (signed initData, or order ID + phone)
        ├── telegram-auth/  # validates initData, upserts profile
        └── telegram-bot/   # webhook: /start, shared locations, admin confirm/cancel
```

## Local development

```bash
cd frontend
cp .env.example .env   # VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_TELEGRAM_BOT_USERNAME
npm install
npm run dev
```

Without Supabase env vars the app runs on mock menu data and mock orders. Outside Telegram the location button falls back to browser geolocation.

## Supabase deployment

```bash
cd frontend
supabase db push

supabase secrets set TELEGRAM_BOT_TOKEN=... ADMIN_TELEGRAM_IDS=8627067211,6237960948 \
  TELEGRAM_WEBHOOK_SECRET=<random-string> MINI_APP_URL=https://<your-app>.vercel.app

supabase functions deploy admin-products
supabase functions deploy create-order
supabase functions deploy my-orders
supabase functions deploy telegram-auth
supabase functions deploy telegram-bot --no-verify-jwt   # Telegram calls it without a JWT
```

Register the webhook (uses the bot token stored in Supabase; authorised with the webhook secret):

```bash
curl -X POST -H "Authorization: Bearer <TELEGRAM_WEBHOOK_SECRET>"   https://<project>.supabase.co/functions/v1/telegram-bot/setup-webhook
```

## Admin panel

Admins (Telegram IDs `8627067211`, `6237960948`; override with the `ADMIN_TELEGRAM_IDS` secret and `VITE_ADMIN_TELEGRAM_IDS`) open it from **Profile → ⚙️ Admin panel**, from the bot's `/start` button, or at `/admin`:

- add / edit / delete dishes — names and descriptions in UZ/RU/EN, price, category, cook time, calories, vegetarian/spicy flags;
- upload or replace photos (compressed in the browser, stored in the public `product-images` bucket);
- hide a dish from the menu with one toggle (stop-list).

Every admin receives each new order in the bot chat with map links and a native location pin, plus ✅/❌ buttons. Admins must press **/start** in the bot once, otherwise Telegram does not let the bot message them.

## Order flow

1. Customer adds dishes to the cart and opens checkout.
2. Delivery location — one of:
   - **📍 Send my location** — Telegram's native LocationManager (Bot API 8.0+), browser geolocation as fallback;
   - **"I'll send it in the chat"** — after the order the bot shows Telegram's native `request_location` keyboard button; the shared pin is attached to the order;
   - or a typed address. At least one is required.
3. `create-order` verifies the Telegram `initData`, recalculates prices from the DB and saves the order.
4. Admin receives the order with Google/Yandex map links and a native map pin, plus ✅/❌ buttons.
5. Customer gets a confirmation in the chat and a message whenever the admin confirms or cancels.

## Security model

- `orders` and `profiles` have **no** anon access; all reads/writes go through Edge Functions with the service role.
- Telegram identity comes only from HMAC-verified `initData`.
- Bot webhook requires `X-Telegram-Bot-Api-Secret-Token`; order buttons only work for the admin chat.
- Outside Telegram, an order can be looked up only with **order number + phone**.

## Design

Parchment palette (`#F3E7CF` light / `#1F1811` dark), Cormorant Garamond headings + Inter body, walnut `#8B5E3C` buttons, gold `#C79A5D` ornaments. The background (`components/AppBackground.tsx`) layers paper grain, tea stains, a drifting girih pattern with scroll parallax and a golden "ink bloom" on tap; all motion is disabled under `prefers-reduced-motion`.
