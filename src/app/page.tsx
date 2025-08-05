import { auth } from "@/lib/auth"
import Link from "next/link"

export default async function Home() {
  const session = await auth()

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-900">
      <h1 className="text-4xl font-bold text-white">Smart Prompt Generator</h1>
      <p className="mt-4 text-lg text-gray-400">
        Visual prompt builder with AI-powered generation
      </p>
      
      {session?.user ? (
        <div className="mt-8 text-center">
          <p className="mb-4 text-white">Welcome back, {session.user.name || session.user.email}!</p>
          <div className="flex gap-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90"
            >
              Go to Dashboard
            </Link>
            <form
              action={async () => {
                "use server"
                const { signOut } = await import("@/lib/auth")
                await signOut()
              }}
            >
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-md bg-secondary px-6 py-2 text-sm font-semibold text-secondary-foreground shadow hover:bg-secondary/90"
              >
                Sign Out
              </button>
            </form>
          </div>
        </div>
      ) : (
        <Link
          href="/auth/signin"
          className="mt-8 inline-flex items-center justify-center rounded-md bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          Get Started
        </Link>
      )}
    </main>
  )
}