import { createBrowserClient } from "@supabase/ssr"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  console.warn("Missing NEXT_PUBLIC_SUPABASE_URL environment variable")
}

if (!supabaseAnonKey) {
  console.warn("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable")
}

// Mock users for development - including developer accounts
const mockUsers = [
  {
    id: "1",
    email: "developer@invoxa.com",
    password: "dev123",
    role: "developer",
    name: "Developer User",
  },
  {
    id: "2",
    email: "admin@invoxa.com",
    password: "admin123",
    role: "admin",
    name: "Admin User",
  },
  {
    id: "3",
    email: "vatui_bogdan@yahoo.es",
    password: "password123",
    role: "user",
    name: "Vatui Bogdan",
  },
  {
    id: "4",
    email: "demo@invoxa.com",
    password: "demo123",
    role: "demo",
    name: "Demo User",
  },
]

// Mock query builder for client
function createClientQueryBuilder(tableName: string, mockData: any[]) {
  const filters: Array<{ field: string; operator: string; value: any }> = []
  let orderBy: { field: string; ascending: boolean } | null = null
  let limitCount: number | null = null

  const builder = {
    select: (columns = "*") => builder,
    eq: (field: string, value: any) => {
      filters.push({ field, operator: "eq", value })
      return builder
    },
    gte: (field: string, value: any) => {
      filters.push({ field, operator: "gte", value })
      return builder
    },
    lte: (field: string, value: any) => {
      filters.push({ field, operator: "lte", value })
      return builder
    },
    ilike: (field: string, value: any) => {
      filters.push({ field, operator: "ilike", value })
      return builder
    },
    or: (conditions: string) => {
      const orFilters = conditions
        .split(",")
        .map((condition) => {
          const parts = condition.split(".")
          if (parts.length >= 3) {
            return {
              field: parts[0],
              operator: parts[1],
              value: parts.slice(2).join("."),
            }
          }
          return null
        })
        .filter(Boolean)

      filters.push(...orFilters)
      return builder
    },
    order: (field: string, options?: { ascending?: boolean }) => {
      orderBy = { field, ascending: options?.ascending ?? true }
      return builder
    },
    limit: (count: number) => {
      limitCount = count
      return builder
    },
    insert: (data: any[]) => ({
      select: () => ({
        single: () =>
          Promise.resolve({
            data: { ...data[0], id: Math.random().toString(36).substr(2, 9) },
            error: null,
          }),
      }),
    }),
    update: (data: any) => ({
      eq: (field: string, value: any) => Promise.resolve({ data: null, error: null }),
    }),
    delete: () => ({
      eq: (field: string, value: any) => Promise.resolve({ error: null }),
    }),
  }

  // Add then method to make it thenable
  builder.then = (resolve: any, reject: any) => {
    try {
      let filteredData = [...mockData]

      // Apply filters
      filters.forEach((filter) => {
        filteredData = filteredData.filter((item) => {
          const fieldValue = item[filter.field]

          switch (filter.operator) {
            case "eq":
              return fieldValue === filter.value
            case "gte":
              return new Date(fieldValue) >= new Date(filter.value)
            case "lte":
              return new Date(fieldValue) <= new Date(filter.value)
            case "ilike":
              const searchValue = filter.value.replace(/%/g, "")
              return fieldValue?.toLowerCase().includes(searchValue.toLowerCase())
            default:
              return true
          }
        })
      })

      // Apply ordering
      if (orderBy) {
        filteredData.sort((a, b) => {
          const aVal = a[orderBy!.field]
          const bVal = b[orderBy!.field]

          if (aVal < bVal) return orderBy!.ascending ? -1 : 1
          if (aVal > bVal) return orderBy!.ascending ? 1 : -1
          return 0
        })
      }

      // Apply limit
      if (limitCount) {
        filteredData = filteredData.slice(0, limitCount)
      }

      resolve({ data: filteredData, error: null })
    } catch (error) {
      reject({ data: null, error: error.message })
    }
  }

  return builder
}

let supabaseClient: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  if (supabaseClient) {
    return supabaseClient
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Check if we have valid Supabase configuration
  if (!url || !key || url.includes("demo") || key.includes("demo")) {
    console.warn("Supabase not configured, using mock client for development")

    // Return a mock client for development
    return {
      auth: {
        signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
          console.log("Mock signInWithPassword called")
          return { data: null, error: { message: "Using mock authentication" } }
        },
        signUp: async ({ email, password, options }: any) => {
          console.log("Mock signUp called")
          return { data: null, error: { message: "Using mock authentication" } }
        },
        signOut: async () => {
          console.log("Mock signOut called")
          return { error: null }
        },
        getUser: async () => {
          console.log("Mock getUser called")
          return { data: { user: null } }
        },
        signInWithOAuth: async ({ provider, options }: any) => {
          console.log("Mock OAuth called")
          return { data: null, error: { message: "Using mock authentication" } }
        },
        resetPasswordForEmail: async (email: string, options?: any) => {
          console.log("Mock resetPasswordForEmail called")
          return { error: null }
        },
        updateUser: async (attributes: any) => {
          console.log("Mock updateUser called")
          return { data: null, error: null }
        },
      },
      from: (table: string) => {
        if (table === "users") {
          return createClientQueryBuilder(table, mockUsers)
        }
        return {
          select: () => ({
            eq: () => ({ data: [], error: null }),
            order: () => ({ data: [], error: null }),
          }),
          insert: () => ({ data: null, error: null }),
          update: () => ({ data: null, error: null }),
          delete: () => ({ data: null, error: null }),
        }
      },
    } as any
  }

  supabaseClient = createBrowserClient(url!, key!)

  return supabaseClient
}
