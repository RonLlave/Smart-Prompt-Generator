"use client"

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/providers/supabase-auth-provider'
import { userProfileService, type UserProfile, type UserStats } from '@/lib/supabase/user-profile'

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadProfile() {
      if (!user) return

      try {
        setLoading(true)
        const [profileData, statsData] = await Promise.all([
          userProfileService.getUserProfile(user.id),
          userProfileService.getUserStats(user.id)
        ])
        
        setProfile(profileData)
        setStats(statsData)
      } catch (error) {
        console.error('Error loading profile:', error)
      } finally {
        setLoading(false)
      }
    }

    if (!authLoading && user) {
      loadProfile()
    }
  }, [user, authLoading])

  // Get user's avatar URL or generate initials
  const getAvatarUrl = () => {
    return user?.user_metadata?.avatar_url || user?.user_metadata?.picture
  }

  // Generate initials for avatar
  const getInitials = () => {
    const name = profile?.name || user?.user_metadata?.name || user?.email || 'User'
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
          <p className="text-white mt-4">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-white">Profile not found</h1>
          <p className="text-gray-400">Unable to load your profile information.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Your Profile</h1>
          <p className="text-gray-400 mt-2">Manage your account information and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 border border-gray-700 rounded-lg shadow p-6">
              <div className="text-center">
                <div className="mx-auto mb-4">
                  {getAvatarUrl() ? (
                    <img
                      className="h-24 w-24 rounded-full mx-auto"
                      src={getAvatarUrl()}
                      alt={profile.name || 'User'}
                    />
                  ) : (
                    <div className="h-24 w-24 rounded-full bg-gray-600 flex items-center justify-center mx-auto">
                      <span className="text-2xl font-medium text-white">
                        {getInitials()}
                      </span>
                    </div>
                  )}
                </div>
                <h2 className="text-xl font-semibold text-white mb-1">
                  {profile.name || user.user_metadata?.name || 'User'}
                </h2>
                <p className="text-gray-400 mb-4">{profile.email}</p>
                <div className="text-sm text-gray-500">
                  Member since {stats?.memberSince}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Account Information */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-700">
                <h3 className="text-lg font-medium text-white">Account Information</h3>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Full Name
                    </label>
                    <div className="text-white bg-gray-700 rounded-md px-3 py-2">
                      {profile.name || user.user_metadata?.name || 'Not provided'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Email Address
                    </label>
                    <div className="text-white bg-gray-700 rounded-md px-3 py-2">
                      {profile.email}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      User ID
                    </label>
                    <div className="text-gray-400 bg-gray-700 rounded-md px-3 py-2 font-mono text-sm">
                      {profile.id}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Account Created
                    </label>
                    <div className="text-white bg-gray-700 rounded-md px-3 py-2">
                      {new Date(profile.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-700">
                <h3 className="text-lg font-medium text-white">Usage Statistics</h3>
              </div>
              <div className="px-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-400 mb-2">
                      {stats?.totalAudioRecordings || 0}
                    </div>
                    <div className="text-gray-300">Audio Recordings</div>
                    <div className="text-sm text-gray-500 mt-1">Total recorded sessions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400 mb-2">
                      {stats?.totalProjects || 0}
                    </div>
                    <div className="text-gray-300">Projects</div>
                    <div className="text-sm text-gray-500 mt-1">Created projects</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Google Account Info */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-700">
                <h3 className="text-lg font-medium text-white">Google Account</h3>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <svg className="h-8 w-8 text-red-500" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  </div>
                  <div>
                    <div className="text-white font-medium">Connected to Google</div>
                    <div className="text-gray-400 text-sm">
                      Signed in via Google OAuth
                    </div>
                  </div>
                </div>
                <div className="bg-gray-700 rounded-md p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Provider:</span>
                      <span className="text-white ml-2">Google</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Last Sign In:</span>
                      <span className="text-white ml-2">
                        {user.last_sign_in_at 
                          ? new Date(user.last_sign_in_at).toLocaleDateString()
                          : 'Unknown'
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}