import NextAuth from "next-auth"
import { authConfig } from "./auth.config"

export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  // Use JWT sessions instead of database adapter for now
  session: { strategy: "jwt" },
  debug: process.env.NODE_ENV === "development",
})