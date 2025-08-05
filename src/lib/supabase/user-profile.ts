import { createClient } from '@/lib/supabase/client'

export interface UserProfile {
  id: string
  email: string
  name?: string
  created_at: string
  updated_at: string
  // Add any additional profile fields from your users table
}

export interface UserStats {
  totalAudioRecordings: number
  totalProjects: number
  memberSince: string
}

export class UserProfileService {
  private supabase = createClient()

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      console.log('Fetching user profile for ID:', userId)
      
      // First try to get from users table if you have one
      const { data: userProfile, error: profileError } = await this.supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (profileError) {
        console.log('No users table record found, using auth data only:', profileError)
        
        // If no users table or record, get from auth.users
        const { data: authUser, error: authError } = await this.supabase.auth.getUser()
        
        if (authError || !authUser.user) {
          console.error('Error fetching auth user:', authError)
          return null
        }

        // Create basic profile from auth data
        return {
          id: authUser.user.id,
          email: authUser.user.email || '',
          name: authUser.user.user_metadata?.name,
          created_at: authUser.user.created_at,
          updated_at: authUser.user.updated_at || authUser.user.created_at
        }
      }

      return userProfile
    } catch (error) {
      console.error('Error fetching user profile:', error)
      return null
    }
  }

  async getUserStats(userId: string): Promise<UserStats> {
    try {
      console.log('Fetching user stats for ID:', userId)
      
      // Get audio recordings count
      const { count: audioCount } = await this.supabase
        .from('audio_transcript')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)

      // Get projects count (if you have a projects table)
      const { count: projectsCount } = await this.supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .single()

      // Get user creation date
      const { data: authUser } = await this.supabase.auth.getUser()
      const memberSince = authUser.user?.created_at 
        ? new Date(authUser.user.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
        : 'Unknown'

      return {
        totalAudioRecordings: audioCount || 0,
        totalProjects: projectsCount || 0,
        memberSince
      }
    } catch (error) {
      console.error('Error fetching user stats:', error)
      return {
        totalAudioRecordings: 0,
        totalProjects: 0,
        memberSince: 'Unknown'
      }
    }
  }

  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    try {
      console.log('Updating user profile for ID:', userId, 'with updates:', updates)
      
      // Try to update users table first
      const { data, error } = await this.supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        console.error('Error updating user profile:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error updating user profile:', error)
      return null
    }
  }
}

export const userProfileService = new UserProfileService()