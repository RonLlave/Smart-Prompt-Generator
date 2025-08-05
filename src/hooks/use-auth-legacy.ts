// Legacy NextAuth hook - keeping for reference
"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"

export function useAuthLegacy() {
  const { data: session, status } = useSession()
  const [userWithId, setUserWithId] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchUserWithId() {
      if (session?.user?.email) {
        try {
          console.log('Fetching user for email:', session.user.email)
          
          // Use API route to fetch user with service role permissions
          const response = await fetch('/api/user/lookup', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: session.user.email }),
          })

          console.log('User lookup response status:', response.status)

          if (response.ok) {
            const userData = await response.json()
            console.log('User data received:', userData)
            
            setUserWithId({
              id: userData.id, // This is the UUID from database
              email: userData.email,
              name: userData.name || session.user.name,
              image: userData.image || session.user.image
            })
          } else {
            const errorText = await response.text()
            console.error('User lookup failed:', response.status, errorText)
            setUserWithId(null)
          }
        } catch (error) {
          console.error('Error fetching user:', error)
          setUserWithId(null)
        }
      } else {
        console.log('No session email available')
        setUserWithId(null)
      }
      setIsLoading(false)
    }

    if (status !== 'loading') {
      fetchUserWithId()
    }
  }, [session?.user?.email, status])
  
  return {
    user: userWithId,
    isLoading: status === 'loading' || isLoading,
    isAuthenticated: !!userWithId
  }
}