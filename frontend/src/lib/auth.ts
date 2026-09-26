import { WebApp } from './telegram'
import { isSupabaseConfigured, supabase } from './supabase'
import type { UserProfile } from '../types'

interface TelegramAuthResponse {
  user?: UserProfile
}

function buildProfileFromWebApp(): UserProfile | null {
  try {
    const tgUser = WebApp.initDataUnsafe?.user
    if (!tgUser?.id) return null

    return {
      id: `tg-${tgUser.id}`,
      telegram_id: tgUser.id,
      first_name: tgUser.first_name ?? '',
      last_name: tgUser.last_name ?? null,
      username: tgUser.username ?? null,
      photo_url: tgUser.photo_url ?? null,
    }
  } catch {
    return null
  }
}

function buildGuestProfile(): UserProfile {
  return {
    id: 'dev-user',
    telegram_id: 0,
    first_name: '',
    last_name: null,
    username: null,
    photo_url: null,
  }
}

export async function authenticateWithTelegram(): Promise<UserProfile | null> {
  const webAppProfile = buildProfileFromWebApp()

  const initData = (() => {
    try { return WebApp.initData } catch { return '' }
  })()

  if (!initData || !isSupabaseConfigured) {
    return webAppProfile ?? buildGuestProfile()
  }

  try {
    const { data, error } = await supabase.functions.invoke<TelegramAuthResponse>(
      'telegram-auth',
      { body: { initData } },
    )

    if (error || !data?.user) {
      console.warn('[Auth] telegram-auth failed, using WebApp data')
      return webAppProfile ?? buildGuestProfile()
    }

    return data.user
  } catch {
    return webAppProfile ?? buildGuestProfile()
  }
}

export async function signOut() {
  await supabase.auth.signOut()
}
