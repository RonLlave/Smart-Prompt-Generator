import type { NextAuthConfig } from "next-auth"
import Google from "next-auth/providers/google"
import { checkUserExists } from "./supabase-adapter"

export const authConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user?.email) {
        // Check if user exists in our Supabase users table
        try {
          const userExists = await checkUserExists(user.email)
          
          if (!userExists) {
            // Redirect to unauthorized page with error
            return `/auth/unauthorized?email=${encodeURIComponent(user.email)}`
          }
        } catch (error) {
          console.error('Error checking user exists:', error)
          // Allow signin to continue if check fails
        }
      }
      
      return true
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.email = user.email
        token.name = user.name
        token.picture = user.image
      }
      if (account) {
        token.accessToken = account.access_token
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.email = token.email as string
        session.user.name = token.name as string
        session.user.image = token.picture as string
      }
      return session
    },
  },
} satisfies NextAuthConfig