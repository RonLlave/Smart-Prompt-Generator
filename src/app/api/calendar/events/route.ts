import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { google } from 'googleapis'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's session with provider tokens
    const { data: { session } } = await supabase.auth.getSession()

    if (!session?.provider_token) {
      return NextResponse.json({ error: 'Calendar not authorized' }, { status: 403 })
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    )

    // Use the provider token from Supabase
    oauth2Client.setCredentials({
      access_token: session.provider_token,
      refresh_token: session.provider_refresh_token
    })

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

    // Get events from the next 30 days
    const timeMin = new Date()
    const timeMax = new Date()
    timeMax.setDate(timeMax.getDate() + 30)

    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      maxResults: 50,
      singleEvents: true,
      orderBy: 'startTime'
    })

    const events = response.data.items || []

    // Filter out all-day events and events without times
    const timedEvents = events.filter(event => 
      event.start?.dateTime && event.end?.dateTime
    )

    return NextResponse.json({ 
      events: timedEvents,
      total: timedEvents.length 
    })
  } catch (error) {
    console.error('Calendar events error:', error)
    
    if (error instanceof Error && error.message.includes('invalid_grant')) {
      // Token is invalid, user needs to re-authorize
      return NextResponse.json({ error: 'Authorization expired' }, { status: 403 })
    }

    return NextResponse.json({ error: 'Failed to fetch calendar events' }, { status: 500 })
  }
}