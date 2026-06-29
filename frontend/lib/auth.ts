import { SignJWT, jwtVerify } from 'jose'
import crypto from 'crypto'
import type { NextRequest } from 'next/server'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-for-development-only'
)

export async function signToken(payload: { telegramId: string }): Promise<string> {
  const alg = 'HS256'
  return new SignJWT(payload)
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(JWT_SECRET)
}

export async function verifyToken(token: string): Promise<{ telegramId: string } | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as { telegramId: string }
  } catch {
    return null
  }
}

export function getAdminTelegramId(): string | undefined {
  return process.env.ADMIN_TELEGRAM_ID || process.env.NEXT_PUBLIC_ADMIN_TELEGRAM_ID
}

export function getAuthTokenFromRequest(request: Request | NextRequest): string | null {
  if ('cookies' in request && typeof (request as NextRequest).cookies?.get === 'function') {
    return (request as NextRequest).cookies.get('auth_token')?.value ?? null
  }

  const cookieHeader = request.headers.get('cookie')
  if (!cookieHeader) return null

  const match = cookieHeader.match(/(?:^|;\s*)auth_token=([^;]+)/)
  return match ? decodeURIComponent(match[1]) : null
}

export async function getAuthenticatedUser(request: Request | NextRequest): Promise<{ telegramId: string } | null> {
  const token = getAuthTokenFromRequest(request)
  if (!token) return null
  return verifyToken(token)
}

/**
 * Validates Telegram initData cryptographic signature
 * Algorithm based on official Telegram documentation
 */
export function validateTelegramInitData(initData: string, botToken: string): boolean {
  if (!initData) return false

  try {
    const urlParams = new URLSearchParams(initData)
    const hash = urlParams.get('hash')
    if (!hash) return false

    urlParams.delete('hash')

    const keys = Array.from(urlParams.keys()).sort()
    const dataCheckString = keys.map((key) => `${key}=${urlParams.get(key)}`).join('\n')

    const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest()
    const signature = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex')

    return signature === hash
  } catch {
    return false
  }
}
