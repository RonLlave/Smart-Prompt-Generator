import Link from "next/link"

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams
  const error = params.error

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 text-center">
        <div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight">
            Authentication Error
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {error === "Configuration"
              ? "There is a problem with the server configuration."
              : error === "AccessDenied"
              ? "You do not have permission to sign in."
              : error === "Verification"
              ? "The verification link has expired or has already been used."
              : "An error occurred during authentication."}
          </p>
        </div>
        <Link
          href="/auth/signin"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          Try again
        </Link>
      </div>
    </div>
  )
}