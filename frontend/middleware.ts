import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getAdminTelegramId, verifyToken } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/admin') || request.nextUrl.pathname.startsWith('/api/admin')) {
    const token = request.cookies.get('auth_token')?.value

    if (!token) {
      if (request.nextUrl.pathname.startsWith('/api')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      return NextResponse.redirect(new URL('/', request.url))
    }

    const payload = await verifyToken(token)
    if (!payload) {
      if (request.nextUrl.pathname.startsWith('/api')) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
      }
      return NextResponse.redirect(new URL('/', request.url))
    }

    const adminId = getAdminTelegramId()
    if (!adminId || payload.telegramId !== adminId) {
      if (request.nextUrl.pathname.startsWith('/api')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
