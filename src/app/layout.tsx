import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { QueryProvider } from '@/components/providers/query-provider'
import { SupabaseAuthProvider } from '@/components/providers/supabase-auth-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Smart Prompt Generator',
  description: 'Visual prompt builder with AI-powered generation and audio recording',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <SupabaseAuthProvider>
          <QueryProvider>
            {children}
          </QueryProvider>
        </SupabaseAuthProvider>
      </body>
    </html>
  )
}