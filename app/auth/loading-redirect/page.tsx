"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClientComponentClient } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

export default function LoadingRedirectPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const handleAuthSession = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession()

      if (error) {
        console.error("Error getting session:", error)
        toast({
          title: "Authentication Error",
          description: error.message,
          variant: "destructive",
        })
        router.push("/login")
        return
      }

      if (session) {
        // Session exists, user is authenticated. Redirect to dashboard or 'next' param.
        const next = searchParams.get("next") || "/dashboard"
        router.push(next)
      } else {
        // No session, likely an issue with the callback or user not authenticated.
        // This might happen if the callback URL was visited directly or if there was an auth error.
        toast({
          title: "Authentication Failed",
          description: "Could not complete authentication. Please try again.",
          variant: "destructive",
        })
        router.push("/login")
      }
    }

    handleAuthSession()
  }, [router, searchParams, supabase, toast])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-950">
      <div className="flex flex-col items-center space-y-4">
        <svg
          className="h-12 w-12 animate-spin text-primary"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2v4m0 14v-4m9-5h-4M3 12H7m14 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-lg text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  )
}
