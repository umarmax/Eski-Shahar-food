import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { signToken, validateTelegramInitData } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null)
    const initData = typeof body?.initData === 'string' ? body.initData : ''
    const language = typeof body?.language === 'string' ? body.language : 'uz'

    if (!initData) {
      return NextResponse.json({ error: 'initData required' }, { status: 400 })
    }

    const isDevBypassEnabled = process.env.NODE_ENV === 'development' && process.env.TELEGRAM_DEV_BYPASS === 'true'
    const botToken = process.env.TELEGRAM_BOT_TOKEN

    let tgUser: { id: string; username?: string; first_name?: string; last_name?: string } | null = null

    if (isDevBypassEnabled && initData === 'dev-user-init-data') {
      tgUser = {
        id: 'dev-user-1',
        username: 'devuser',
        first_name: 'Mehmon',
        last_name: 'Test',
      }
    } else {
      if (!botToken) {
        console.error('Missing TELEGRAM_BOT_TOKEN')
        return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
      }

      if (!validateTelegramInitData(initData, botToken)) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }

      const urlParams = new URLSearchParams(initData)
      const userJson = urlParams.get('user')
      if (!userJson) {
        return NextResponse.json({ error: 'Invalid initData' }, { status: 400 })
      }

      try {
        const parsedUser = JSON.parse(userJson) as {
          id?: unknown
          username?: string
          first_name?: string
          last_name?: string
        }

        if (typeof parsedUser.id !== 'string' && typeof parsedUser.id !== 'number') {
          return NextResponse.json({ error: 'Invalid initData' }, { status: 400 })
        }

        tgUser = {
          id: String(parsedUser.id),
          username: parsedUser.username,
          first_name: parsedUser.first_name,
          last_name: parsedUser.last_name,
        }
      } catch {
        return NextResponse.json({ error: 'Invalid initData' }, { status: 400 })
      }
    }

    if (!tgUser) {
      return NextResponse.json({ error: 'Invalid initData' }, { status: 400 })
    }

    const telegramId = String(tgUser.id)
    const user = await prisma.user.upsert({
      where: { telegramId },
      create: {
        telegramId,
        username: tgUser.username,
        firstName: tgUser.first_name,
        lastName: tgUser.last_name,
        language: language === 'uz' || language === 'ru' || language === 'en' ? language : 'uz',
      },
      update: {
        username: tgUser.username,
        firstName: tgUser.first_name,
        lastName: tgUser.last_name,
        language: language === 'uz' || language === 'ru' || language === 'en' ? language : undefined,
      },
    })

    const token = await signToken({ telegramId })
    const response = NextResponse.json(user)

    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
    })

    return response
  } catch (error) {
    console.error('Auth Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
