"use client"

import React from 'react'
import { useAuth } from '@/components/providers/supabase-auth-provider'
import { Button } from '@/components/ui/button'
import { Calendar, RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function CalendarReAuthPage() {
  const { signInWithGoogle, signOut } = useAuth()
  const router = useRouter()

  const handleReAuth = async () => {
    try {
      // Sign out current session
      await signOut()
      // Sign in again with calendar permissions (scopes are configured in the hook)
      await signInWithGoogle()
    } catch (error) {
      console.error('Re-authentication failed:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <Calendar className="mx-auto h-16 w-16 text-blue-400 mb-6" />
          <h1 className="text-3xl font-bold mb-4">Calendar Permissions Required</h1>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            To access your Google Calendar, we need to request additional permissions. 
            This will redirect you to Google to grant calendar access.
          </p>
          
          <div className="bg-gray-800 rounded-lg p-6 mb-8 max-w-md mx-auto">
            <h3 className="text-lg font-semibold mb-4">What we&apos;ll access:</h3>
            <ul className="text-left text-gray-300 space-y-2">
              <li className="flex items-center">
                <Calendar className="h-4 w-4 text-green-400 mr-2" />
                View your calendar events
              </li>
              <li className="flex items-center">
                <Calendar className="h-4 w-4 text-green-400 mr-2" />
                Read meeting details and times
              </li>
            </ul>
          </div>

          <p className="text-gray-400 text-sm mb-6">
            We will never modify, delete, or create calendar events. This is read-only access.
          </p>

          <div className="space-y-4">
            <Button 
              onClick={handleReAuth}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
            >
              <RefreshCw className="mr-2 h-5 w-5" />
              Grant Calendar Access
            </Button>
            
            <div>
              <Button 
                variant="ghost"
                onClick={() => router.push('/dashboard/calendar')}
                className="text-gray-400 hover:text-white"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}