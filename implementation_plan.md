# Production-Grade Architecture & Security Refactor

This document outlines a massive refactoring plan to elevate the project to production-ready standards suitable for deployment at top-tier companies.

## User Review Required
> [!IMPORTANT]
> **Full Backend Migration**: I propose completely eliminating the separate Express `backend/` folder and migrating all business logic into Next.js App Router API endpoints (`frontend/app/api/...`). This is the industry standard for Vercel, resolves CORS issues natively, drastically improves Developer Experience (single build, single server), and eliminates cold-boot issues associated with Serverless Express apps on Vercel. 
> 
> **Are you okay with consolidating the project into a single Next.js monolith?**

## Open Questions
> [!WARNING]
> 1. **Authentication Token Storage**: I plan to implement JWT-based authentication. The JWT will be derived from a cryptographically verified Telegram `initData` payload. Do you prefer the JWT stored as an `HttpOnly` cookie or sent in the `Authorization` header? (I recommend `HttpOnly` cookie for security against XSS).
> 2. **Telegram Native UI**: Should I update the checkout and back buttons to use Telegram's native `MainButton` and `BackButton` instead of rendering HTML buttons at the bottom of the screen? This provides a much better native mobile UX.

## Proposed Changes

### 1. Architecture: Next.js Monolith
- Move `prisma/` folder and configuration into the root (or `frontend/`).
- Create `app/api/...` route handlers to replace all Express routes in `backend/src/index.ts`.
- Delete the `backend/` folder completely.
- Update `package.json` to have a single build and dev process.

### 2. Security: Authentication & Authorization
- **HMAC Validation**: Update `/api/auth/telegram` to receive the raw Telegram `initData` string. The backend will parse it, validate the cryptographic signature using the Bot Token (`TELEGRAM_BOT_TOKEN`), and reject forged requests.
- **JWT Issuance**: Issue a JWT upon successful login.
- **Admin Verification**: Replace the insecure `x-telegram-id` header check. The admin middleware will decode the JWT, verify the signature, and ensure the authenticated user's ID matches `ADMIN_TELEGRAM_ID`.
- **Zod Validation**: Apply strict Zod validation to all incoming POST/PUT/PATCH bodies to prevent NoSQL/SQL injection and unexpected payloads.

### 3. Database & Logic
- **Transactions**: Wrap order creation and user profile updates in a `prisma.$transaction` to guarantee atomicity and prevent race conditions.
- **Indexes**: Add necessary indexes to `categoryId`, `userId`, and `createdAt` in Prisma schema to optimize queries as the table grows.

### 4. Telegram UX
- Integrate `@twa-dev/sdk` more deeply.
- Hide HTML "Back" buttons and instead use `WebApp.BackButton.show()`.
- Use `WebApp.MainButton` for the "Confirm Order" action instead of an HTML button.

## Verification Plan

### Automated Tests
- Type checking (`tsc --noEmit`) and Next.js build validation.
- Linting.

### Manual Verification
- Test end-to-end order flow in the Telegram App to ensure `initData` validation passes.
- Attempt to spoof admin credentials to ensure the security hole is closed.
- Verify native Telegram buttons trigger the correct React states.
