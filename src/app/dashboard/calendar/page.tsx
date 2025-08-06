"use client"

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/components/providers/supabase-auth-provider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, Users, Video, ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface CalendarEvent {
  id: string
  summary: string
  description?: string
  start: {
    dateTime?: string
    date?: string
  }
  end: {
    dateTime?: string
    date?: string
  }
  attendees?: Array<{
    email: string
    displayName?: string
    responseStatus?: string
  }>
  htmlLink: string
  conferenceData?: {
    entryPoints?: Array<{
      entryPointType: string
      uri: string
    }>
  }
}

export default function CalendarPage() {
  const { user } = useAuth()
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAuthorized, setIsAuthorized] = useState(false)

  const checkCalendarAuth = useCallback(async () => {
    try {
      const response = await fetch('/api/calendar/auth-status')
      const data = await response.json()
      setIsAuthorized(data.isAuthorized)
      
      if (data.isAuthorized) {
        fetchCalendarEvents()
      } else {
        setLoading(false)
      }
    } catch (error) {
      console.error('Error checking calendar auth:', error)
      setError('Failed to check calendar authorization')
      setLoading(false)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (user) {
      checkCalendarAuth()
    }
  }, [user, checkCalendarAuth])

  const fetchCalendarEvents = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/calendar/events')
      
      if (!response.ok) {
        throw new Error('Failed to fetch calendar events')
      }

      const data = await response.json()
      setEvents(data.events || [])
    } catch (error) {
      console.error('Error fetching calendar events:', error)
      setError('Failed to fetch calendar events')
    } finally {
      setLoading(false)
    }
  }

  const handleAuthorizeCalendar = async () => {
    try {
      const response = await fetch('/api/calendar/auth-url')
      const data = await response.json()
      
      if (data.authUrl) {
        // Navigate to our re-auth page instead of external URL
        window.location.href = data.authUrl
      }
    } catch (error) {
      console.error('Error getting auth URL:', error)
      setError('Failed to authorize calendar access')
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const getEventDuration = (start: string, end: string) => {
    const startTime = new Date(start)
    const endTime = new Date(end)
    const diffMs = endTime.getTime() - startTime.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m`
    }
    return `${diffMinutes}m`
  }

  const getMeetingLink = (event: CalendarEvent) => {
    return event.conferenceData?.entryPoints?.find(
      entry => entry.entryPointType === 'video'
    )?.uri
  }

  const isUpcoming = (dateStr: string) => {
    return new Date(dateStr) > new Date()
  }

  const upcomingEvents = events.filter(event => 
    event.start.dateTime && isUpcoming(event.start.dateTime)
  )

  const pastEvents = events.filter(event => 
    event.start.dateTime && !isUpcoming(event.start.dateTime)
  )

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <Calendar className="mx-auto h-16 w-16 text-blue-400 mb-6" />
            <h1 className="text-3xl font-bold mb-4">Google Calendar Integration</h1>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              Connect your Google Calendar to view your scheduled meetings and stay organized. 
              We&apos;ll only access your calendar events and never modify them.
            </p>
            <Button 
              onClick={handleAuthorizeCalendar}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
            >
              <Calendar className="mr-2 h-5 w-5" />
              Connect Google Calendar
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
            <p className="text-gray-300 mt-4">Loading your calendar events...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="bg-red-900/20 border border-red-700 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-2 text-red-400">Error</h2>
              <p className="text-gray-300 mb-4">{error}</p>
              <Button 
                onClick={() => window.location.reload()}
                variant="outline"
                className="border-red-700 text-red-400 hover:bg-red-900/20"
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Calendar</h1>
            <p className="text-gray-300">Your Google Calendar meetings and events</p>
          </div>
          <Button 
            onClick={fetchCalendarEvents}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            Refresh Events
          </Button>
        </div>

        {events.length === 0 ? (
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="text-center py-12">
              <Calendar className="mx-auto h-16 w-16 text-gray-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-gray-300">No Events Found</h3>
              <p className="text-gray-500">
                No calendar events found for the next 30 days.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {upcomingEvents.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold mb-4 text-green-400">
                  Upcoming Events ({upcomingEvents.length})
                </h2>
                <div className="space-y-4">
                  {upcomingEvents.map((event) => (
                    <Card key={event.id} className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg mb-2 text-white">
                              {event.summary}
                            </CardTitle>
                            <div className="flex items-center space-x-4 text-sm text-gray-300">
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                {event.start.dateTime && formatDate(event.start.dateTime)}
                              </div>
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                {event.start.dateTime && event.end.dateTime && (
                                  <>
                                    {formatTime(event.start.dateTime)} - {formatTime(event.end.dateTime)}
                                    <span className="ml-2 text-xs text-gray-500">
                                      ({getEventDuration(event.start.dateTime, event.end.dateTime)})
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <Badge variant="secondary" className="bg-green-900/20 text-green-400 border-green-700">
                            Upcoming
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        {event.description && (
                          <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                            {event.description.replace(/<[^>]*>/g, '')}
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            {event.attendees && event.attendees.length > 0 && (
                              <div className="flex items-center text-sm text-gray-400">
                                <Users className="h-4 w-4 mr-1" />
                                {event.attendees.length} attendee{event.attendees.length !== 1 ? 's' : ''}
                              </div>
                            )}
                            {getMeetingLink(event) && (
                              <div className="flex items-center text-sm text-blue-400">
                                <Video className="h-4 w-4 mr-1" />
                                Video call
                              </div>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            {getMeetingLink(event) && (
                              <Button
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700"
                                onClick={() => window.open(getMeetingLink(event), '_blank')}
                              >
                                <Video className="h-4 w-4 mr-1" />
                                Join
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-gray-600 text-gray-300 hover:bg-gray-700"
                              onClick={() => window.open(event.htmlLink, '_blank')}
                            >
                              <ExternalLink className="h-4 w-4 mr-1" />
                              Open
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {pastEvents.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold mb-4 text-gray-400">
                  Recent Events ({pastEvents.slice(0, 5).length})
                </h2>
                <div className="space-y-4">
                  {pastEvents.slice(0, 5).map((event) => (
                    <Card key={event.id} className="bg-gray-800/50 border-gray-700 opacity-75">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg mb-2 text-gray-300">
                              {event.summary}
                            </CardTitle>
                            <div className="flex items-center space-x-4 text-sm text-gray-400">
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                {event.start.dateTime && formatDate(event.start.dateTime)}
                              </div>
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                {event.start.dateTime && event.end.dateTime && (
                                  <>
                                    {formatTime(event.start.dateTime)} - {formatTime(event.end.dateTime)}
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <Badge variant="outline" className="border-gray-600 text-gray-500">
                            Past
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            {event.attendees && event.attendees.length > 0 && (
                              <div className="flex items-center text-sm text-gray-500">
                                <Users className="h-4 w-4 mr-1" />
                                {event.attendees.length} attendee{event.attendees.length !== 1 ? 's' : ''}
                              </div>
                            )}
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-gray-500 hover:text-gray-400 hover:bg-gray-800"
                            onClick={() => window.open(event.htmlLink, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}