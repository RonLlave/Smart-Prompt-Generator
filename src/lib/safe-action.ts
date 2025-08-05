import { createSafeActionClient } from "next-safe-action"
import { auth } from "@/lib/auth"

export const action = createSafeActionClient()
  .use(async ({ next }) => {
    const session = await auth()
    
    if (!session?.user?.id) {
      throw new Error("Unauthorized")
    }

    return next({ ctx: { userId: session.user.id } })
  })