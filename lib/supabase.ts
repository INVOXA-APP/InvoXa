import { createClient as createServerClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  const cookieStore = cookies()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || supabaseUrl.trim() === "") {
    throw new Error("Supabase client initialization error: NEXT_PUBLIC_SUPABASE_URL is not set or is empty.")
  }
  if (!supabaseAnonKey || supabaseAnonKey.trim() === "") {
    throw new Error("Supabase client initialization error: NEXT_PUBLIC_SUPABASE_ANON_KEY is not set or is empty.")
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: any) {
        try {
          cookieStore.set({ name, value, ...options })
        } catch (error) {
          // The `cookies().set()` method can only be called in a Server Action or Route Handler
          // console.warn('Could not set cookie:', error);
        }
      },
      remove(name: string, options: any) {
        try {
          cookieStore.set({ name, value: "", ...options })
        } catch (error) {
          // The `cookies().set()` method can only be called in a Server Action or Route Handler
          // console.warn('Could not remove cookie:', error);
        }
      },
    },
  })
}

export function createClientComponentClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || supabaseUrl.trim() === "") {
    throw new Error("Supabase client initialization error: NEXT_PUBLIC_SUPABASE_URL is not set or is empty.")
  }
  if (!supabaseAnonKey || supabaseAnonKey.trim() === "") {
    throw new Error("Supabase client initialization error: NEXT_PUBLIC_SUPABASE_ANON_KEY is not set or is empty.")
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
