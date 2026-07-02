# 🍵 Eski Shahar Choyxona - Telegram Mini App

A premium Uzbek café Telegram Mini App built with React, Vite, TypeScript, and Supabase.

![Telegram Mini App](https://img.shields.io/badge/Telegram-Mini%20App-blue?logo=telegram)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase)

## ✨ Features

- 🍽 **Full Menu Catalog** - Browse traditional Uzbek dishes with categories
- 🛒 **Shopping Cart** - Add items, adjust quantities, view totals
- 📱 **Telegram Native UI** - Uses Telegram's MainButton, BackButton, and theme
- 🌐 **Multilingual** - Supports Uzbek, Russian, and English
- 🌙 **Dark/Light Mode** - Auto-syncs with Telegram theme or manual selection
- 📦 **Order System** - Complete checkout flow with admin notifications
- 🔐 **Secure Auth** - Telegram initData HMAC validation

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or pnpm
- Supabase account
- Telegram Bot (from @BotFather)

### 1. Clone and Install

```bash
cd frontend
npm install
```

### 2. Environment Setup

Create a `.env` file in the `frontend` directory:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_TELEGRAM_BOT_USERNAME=eskishahar_bot
```

### 3. Supabase Setup

1. Create a new Supabase project
2. Run the migration in Supabase SQL Editor:
   ```bash
   # Copy contents of supabase/migrations/001_initial_schema.sql
   ```
3. Seed the database with sample data:
   ```bash
   # Copy contents of supabase/seed.sql
   ```
4. Deploy Edge Functions:
   ```bash
   supabase functions deploy telegram-auth
   supabase functions deploy telegram-bot
   supabase functions deploy create-order
   ```
5. Set Edge Function secrets in Supabase Dashboard:
   ```
   TELEGRAM_BOT_TOKEN=your-bot-token
   TELEGRAM_ADMIN_CHAT_ID=your-chat-id
   MINI_APP_URL=https://your-app.vercel.app
   ```

### 4. Run Development Server

```bash
npm run dev
```

Open http://localhost:5173 in your browser.

### 5. Test in Telegram

1. Create a bot with @BotFather
2. Set the Mini App URL: `/setmenubutton` → Web App URL
3. Open the bot and tap the menu button

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── Layout.tsx
│   │   ├── ProductCard.tsx
│   │   ├── CategoryList.tsx
│   │   └── ...
│   ├── pages/            # Route pages
│   │   ├── HomePage.tsx
│   │   ├── MenuPage.tsx
│   │   ├── ProductPage.tsx
│   │   ├── CartPage.tsx
│   │   ├── OrderFormPage.tsx
│   │   └── ...
│   ├── store/            # Zustand state management
│   │   ├── cartStore.ts
│   │   ├── settingsStore.ts
│   │   └── authStore.ts
│   ├── lib/              # Utilities
│   │   ├── telegram.ts   # Telegram SDK wrapper
│   │   ├── supabase.ts   # Supabase client
│   │   ├── i18n.ts       # Translations
│   │   └── auth.ts       # Auth helpers
│   ├── data/             # Mock data
│   └── types/            # TypeScript types
├── supabase/
│   ├── migrations/       # Database schema
│   ├── seed.sql          # Sample data
│   └── functions/        # Edge Functions
│       ├── telegram-auth/
│       ├── telegram-bot/
│       └── create-order/
└── ...
```

## 🔧 Configuration

### Telegram Bot Setup

1. Create bot with @BotFather: `/newbot`
2. Get bot token
3. Set Mini App URL: `/setmenubutton`
4. Register webhook for order notifications:
   ```bash
   curl -X POST "https://api.telegram.org/bot<TOKEN>/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{"url": "https://<project>.supabase.co/functions/v1/telegram-bot"}'
   ```

### Supabase Edge Functions Secrets

Set these in Supabase Dashboard → Settings → Edge Functions → Secrets:

| Secret | Description |
|--------|-------------|
| `TELEGRAM_BOT_TOKEN` | Bot token from @BotFather |
| `TELEGRAM_ADMIN_CHAT_ID` | Your Telegram user ID for order notifications |
| `MINI_APP_URL` | Deployed app URL (e.g., https://choyxona.vercel.app) |

## 🚢 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Set environment variables
4. Deploy

The `vercel.json` is already configured for SPA routing.

### Manual Build

```bash
npm run build
# Output in dist/ folder
```

## 🎨 Customization

### Theme Colors

Edit `src/App.tsx` ThemeManager or `src/index.css`:

| Color | Hex | Usage |
|-------|-----|-------|
| Primary Brown | `#8B5E3C` | Buttons, links |
| Gold Accent | `#C79A5D` | Highlights |
| Cream | `#F8F3EB` | Light background |
| Dark | `#1c1c1e` | Dark background |

### Translations

Edit `src/lib/i18n.ts` to add/modify translations.

### Menu Items

Edit `src/data/mockProducts.ts` or update Supabase `products` table.

## 📱 Telegram Mini App Features Used

- `WebApp.MainButton` - Checkout button
- `WebApp.BackButton` - Navigation
- `WebApp.colorScheme` - Theme detection
- `WebApp.initData` - User authentication
- `WebApp.HapticFeedback` - Tactile feedback

## 🔐 Security

- HMAC-SHA256 validation of Telegram initData
- Server-side price calculation (prevents manipulation)
- Rate limiting on orders
- Input sanitization
- RLS policies on Supabase tables

## 📄 License

MIT License - feel free to use for your own café/restaurant!

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open Pull Request

---

Made with ❤️ for Uzbek cuisine lovers
