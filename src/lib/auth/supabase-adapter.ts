import { SupabaseAdapter } from '@auth/supabase-adapter'
import { createClient as createServerClient } from '@supabase/supabase-js'

export function createSupabaseAdapter() {
  // Return Supabase adapter with direct configuration
  return SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  })
}

// Helper function to check if user exists in Supabase auth
export async function checkUserExists(email: string): Promise<boolean> {
  try {
    // Use service role key for user validation
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )
    
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (error) {
      console.error('Error checking user:', error)
      return false
    }

    return !!data
  } catch (error) {
    console.error('Error in checkUserExists:', error)
    return false
  }
}