import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has provider tokens (from Supabase OAuth)
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.provider_token) {
      return NextResponse.json({ isAuthorized: false })
    }

    // Check if the user signed in with Google and has calendar scope
    // We'll assume they have calendar access if they have a provider_token
    // The scope check will happen when we actually try to access the calendar
    return NextResponse.json({ isAuthorized: true })
  } catch (error) {
    console.error('Calendar auth status error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}