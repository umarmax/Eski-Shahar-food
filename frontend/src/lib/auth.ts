import { WebApp } from './telegram'
import { isSupabaseConfigured, supabase } from './supabase'
import type { UserProfile } from '../types'

interface TelegramAuthResponse {
  access_token?: string
  refresh_token?: string
  user?: UserProfile
}

function buildProfileFromWebApp(): UserProfile | null {
  try {
    console.log('[Auth] Building profile from WebApp...')
    console.log('[Auth] WebApp.initDataUnsafe:', WebApp.initDataUnsafe)
    
    const tgUser = WebApp.initDataUnsafe?.user
    console.log('[Auth] tgUser:', tgUser)
    
    if (!tgUser?.id) {
      console.log('[Auth] No tgUser.id found')
      return null
    }

    const profile = {
      id: `tg-${tgUser.id}`,
      telegram_id: tgUser.id,
      first_name: tgUser.first_name ?? '',
      last_name: tgUser.last_name ?? null,
      username: tgUser.username ?? null,
      photo_url: tgUser.photo_url ?? null,
    }
    console.log('[Auth] Built profile:', profile)
    return profile
  } catch (e) {
    console.error('[Auth] Error building profile from WebApp:', e)
    return null
  }
}

function buildGuestProfile(): UserProfile {
  console.log('[Auth] Building guest profile')
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
  console.log('[Auth] authenticateWithTelegram called')
  
  // First try to get user from WebApp directly (most reliable)
  const webAppProfile = buildProfileFromWebApp()
  console.log('[Auth] webAppProfile:', webAppProfile)

  // Get initData
  const initData = (() => {
    try { 
      const data = WebApp.initData
      console.log('[Auth] WebApp.initData:', data ? `${data.substring(0, 50)}...` : 'empty')
      return data
    } catch (e) { 
      console.error('[Auth] Error getting initData:', e)
      return '' 
    }
  })()

  if (!initData) {
    console.log('[Auth] No initData, returning webAppProfile or guest')
    return webAppProfile ?? buildGuestProfile()
  }

  if (!isSupabaseConfigured) {
    console.log('[Auth] Supabase not configured, returning webAppProfile or guest')
    return webAppProfile ?? buildGuestProfile()
  }

  // Try to authenticate via Edge Function
  try {
    console.log('[Auth] Calling telegram-auth Edge Function...')
    const { data, error } = await supabase.functions.invoke<TelegramAuthResponse>(
      'telegram-auth',
      { body: { initData } },
    )

    console.log('[Auth] Edge Function response:', { data, error })

    if (error || !data?.user) {
      console.warn('[Auth] Edge Function failed, using WebApp data:', error?.message)
      return webAppProfile ?? buildGuestProfile()
    }

    console.log('[Auth] Successfully authenticated via Edge Function:', data.user)
    return data.user
  } catch (e) {
    console.warn('[Auth] Auth exception, using WebApp data:', e)
    return webAppProfile ?? buildGuestProfile()
  }
}

export async function signOut() {
  await supabase.auth.signOut()
}
