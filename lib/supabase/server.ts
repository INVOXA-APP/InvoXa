import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Mock data for development
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

const mockInvoices = [
  {
    id: "1",
    invoice_number: "INV-2024-001",
    client_name: "Acme Corp",
    amount: 2500.0,
    status: "paid",
    due_date: "2024-07-15",
    created_at: "2024-06-15T10:00:00Z",
    currency: "USD",
  },
  {
    id: "2",
    invoice_number: "INV-2024-002",
    client_name: "TechStart Inc",
    amount: 1800.0,
    status: "pending",
    due_date: "2024-07-20",
    created_at: "2024-06-20T14:30:00Z",
    currency: "USD",
  },
  {
    id: "3",
    invoice_number: "INV-2024-003",
    client_name: "Global Solutions",
    amount: 3200.0,
    status: "overdue",
    due_date: "2024-06-30",
    created_at: "2024-06-10T09:15:00Z",
    currency: "EUR",
  },
]

const mockExpenses = [
  {
    id: "1",
    description: "Office Supplies",
    amount: 245.0,
    category: "Office",
    date: "2024-06-25",
    created_at: "2024-06-25T16:00:00Z",
  },
  {
    id: "2",
    description: "Software License",
    amount: 99.0,
    category: "Software",
    date: "2024-06-20",
    created_at: "2024-06-20T11:30:00Z",
  },
  {
    id: "3",
    description: "Travel Expenses",
    amount: 450.0,
    category: "Travel",
    date: "2024-06-18",
    created_at: "2024-06-18T08:45:00Z",
  },
]

const mockClients = [
  {
    id: "1",
    name: "John Smith",
    email: "john@acmecorp.com",
    phone: "+1-555-0123",
    company: "Acme Corp",
    address: "123 Business St, City, State 12345",
    status: "active",
    total_invoices: 5,
    total_amount: 12500.0,
    last_invoice_date: "2024-06-15",
    created_at: "2024-01-15T10:00:00Z",
  },
  {
    id: "2",
    name: "Sarah Johnson",
    email: "sarah@techstart.com",
    phone: "+1-555-0456",
    company: "TechStart Inc",
    address: "456 Innovation Ave, Tech City, TC 67890",
    status: "active",
    total_invoices: 3,
    total_amount: 8500.0,
    last_invoice_date: "2024-06-20",
    created_at: "2024-02-10T14:30:00Z",
  },
]

const mockConversationSessions = [
  {
    id: "1",
    title: "Invoice Management Discussion",
    summary: "Discussed invoice creation, tracking, and payment management strategies",
    created_at: "2024-06-20T10:00:00Z",
    updated_at: "2024-06-20T11:30:00Z",
    message_count: 8,
  },
  {
    id: "2",
    title: "Expense Tracking Setup",
    summary: "Configured expense categories and automated tracking workflows",
    created_at: "2024-06-18T14:00:00Z",
    updated_at: "2024-06-18T15:45:00Z",
    message_count: 12,
  },
  {
    id: "3",
    title: "Client Analytics Review",
    summary: "Analyzed client performance metrics and revenue trends",
    created_at: "2024-06-15T09:00:00Z",
    updated_at: "2024-06-15T10:20:00Z",
    message_count: 6,
  },
]

const mockConversationMessages = [
  {
    id: "1",
    session_id: "1",
    user_id: "1",
    role: "user",
    content: "How can I create a new invoice?",
    metadata: {},
    created_at: "2024-06-20T10:00:00Z",
  },
  {
    id: "2",
    session_id: "1",
    user_id: "1",
    role: "assistant",
    content:
      "I can help you create a new invoice! You can navigate to the Invoices section and click 'Create New Invoice'. I'll guide you through the process of adding client information, line items, and setting payment terms.",
    metadata: {},
    created_at: "2024-06-20T10:01:00Z",
  },
  {
    id: "3",
    session_id: "1",
    user_id: "1",
    role: "user",
    content: "What information do I need to include?",
    metadata: {},
    created_at: "2024-06-20T10:02:00Z",
  },
  {
    id: "4",
    session_id: "1",
    user_id: "1",
    role: "assistant",
    content:
      "For a complete invoice, you'll need: client details (name, email, address), invoice number, due date, itemized services or products with descriptions and amounts, tax information if applicable, and your payment terms. The system can auto-generate invoice numbers and calculate totals for you.",
    metadata: {},
    created_at: "2024-06-20T10:03:00Z",
  },
]

// Mock query builder
function createQueryBuilder(tableName: string, mockData: any[]) {
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
      // Parse OR conditions like "name.ilike.%query%,email.ilike.%query%"
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
    raw: (sql: string) => sql,
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

export function createClient() {
  const cookieStore = cookies()

  // Check if we have valid Supabase configuration
  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes("demo") || supabaseAnonKey.includes("demo")) {
    console.warn("Supabase not configured, using mock client for development")

    // Return a mock client for development
    return {
      auth: {
        signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
          console.log("Mock signInWithPassword called with:", email)
          const user = mockUsers.find((u) => u.email === email && u.password === password)
          if (user) {
            // Simulate successful login
            return {
              data: {
                user: {
                  id: user.id,
                  email: user.email,
                  user_metadata: {
                    name: user.name,
                    role: user.role,
                  },
                },
              },
              error: null,
            }
          }

          return {
            data: { user: null },
            error: { message: "Invalid email or password" },
          }
        },
        signUp: async ({ email, password, options }: any) => {
          console.log("Mock signUp called")
          return {
            data: {
              user: {
                id: Math.random().toString(36).substr(2, 9),
                email,
                user_metadata: options?.data || {},
              },
            },
            error: null,
          }
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
          return { data: { url: "/dashboard" }, error: null }
        },
        resetPasswordForEmail: async (email: string, options?: any) => {
          console.log("Mock resetPasswordForEmail called")
          return { error: null }
        },
        updateUser: async (attributes: any) => {
          console.log("Mock updateUser called")
          return { data: { user: null }, error: null }
        },
      },
      from: (table: string) => {
        switch (table) {
          case "users":
            return createQueryBuilder(table, mockUsers)
          case "invoices":
            return createQueryBuilder(table, mockInvoices)
          case "expenses":
            return createQueryBuilder(table, mockExpenses)
          case "clients":
            return createQueryBuilder(table, mockClients)
          case "conversation_sessions":
            return createQueryBuilder(table, mockConversationSessions)
          case "conversation_messages":
            return createQueryBuilder(table, mockConversationMessages)
          default:
            return {
              select: (columns = "*") => ({
                eq: (field: string, value: any) => Promise.resolve({ data: [], error: null }),
                gte: (field: string, value: any) => Promise.resolve({ data: [], error: null }),
                lte: (field: string, value: any) => Promise.resolve({ data: [], error: null }),
                ilike: (field: string, value: any) => Promise.resolve({ data: [], error: null }),
                or: (conditions: string) => Promise.resolve({ data: [], error: null }),
                order: (field: string, options?: { ascending?: boolean }) => Promise.resolve({ data: [], error: null }),
                limit: (count: number) => Promise.resolve({ data: [], error: null }),
              }),
              insert: (data: any) => Promise.resolve({ data: null, error: null }),
              update: (data: any) => ({
                eq: (field: string, value: any) => Promise.resolve({ data: null, error: null }),
              }),
              delete: () => ({
                eq: (field: string, value: any) => Promise.resolve({ error: null }),
              }),
            }
        }
      },
    } as any
  }

  return createServerClient(supabaseUrl!, supabaseAnonKey!, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  })
}
