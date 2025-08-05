import Link from "next/link"
import { AlertTriangle, Mail, ArrowLeft } from "lucide-react"

interface UnauthorizedPageProps {
  searchParams: Promise<{ email?: string }>
}

export default async function UnauthorizedPage({ searchParams }: UnauthorizedPageProps) {
  const { email } = await searchParams

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-gray-400">Your account is not authorized to access this application.</p>
        </div>

        {email && (
          <div className="mb-6 p-4 bg-gray-700 rounded-lg border border-gray-600">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Mail className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-300">Email used:</span>
            </div>
            <p className="text-white font-medium">{email}</p>
          </div>
        )}

        <div className="space-y-4 text-sm text-gray-400">
          <p>
            This application is restricted to authorized users only. If you believe you should have access, please contact your administrator.
          </p>
          
          <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
            <h3 className="text-white font-medium mb-2">Need Access?</h3>
            <ul className="text-left space-y-2 text-xs">
              <li>• Contact your system administrator</li>
              <li>• Ensure your email is added to the authorized users list</li>
              <li>• Try signing in with a different Google account</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <Link
            href="/auth/signin"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Try Different Account
          </Link>
          
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}