import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { google } from 'googleapis'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state') // This is the user ID
    const error = searchParams.get('error')

    if (error) {
      return NextResponse.redirect(new URL('/dashboard/calendar?error=access_denied', request.url))
    }

    if (!code || !state) {
      return NextResponse.redirect(new URL('/dashboard/calendar?error=invalid_request', request.url))
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    )

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code)
    
    if (!tokens.access_token) {
      return NextResponse.redirect(new URL('/dashboard/calendar?error=token_error', request.url))
    }

    // Save tokens to database
    const supabase = await createClient()
    
    const tokenData = {
      user_id: state,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: new Date(tokens.expiry_date || 0).toISOString(),
      scope: 'https://www.googleapis.com/auth/calendar.readonly'
    }

    const { error: insertError } = await supabase
      .from('user_calendar_tokens')
      .upsert(tokenData, { onConflict: 'user_id' })

    if (insertError) {
      console.error('Failed to save calendar tokens:', insertError)
      return NextResponse.redirect(new URL('/dashboard/calendar?error=save_failed', request.url))
    }

    return NextResponse.redirect(new URL('/dashboard/calendar?success=true', request.url))
  } catch (error) {
    console.error('Calendar callback error:', error)
    return NextResponse.redirect(new URL('/dashboard/calendar?error=internal_error', request.url))
  }
}