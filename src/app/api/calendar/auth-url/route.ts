import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Instead of creating a separate OAuth flow, we'll use Supabase's re-authentication
    // with calendar scopes. We need to sign out and sign back in with calendar permissions.
    const authUrl = `/dashboard/calendar/re-auth`

    return NextResponse.json({ authUrl })
  } catch (error) {
    console.error('Calendar auth URL error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}