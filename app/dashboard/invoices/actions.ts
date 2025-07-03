import { createClient } from "@/lib/supabase/server"

export interface Invoice {
  id: string
  invoice_number: string
  client_name: string
  amount: number
  status: "paid" | "pending" | "overdue" | "draft"
  due_date: string
  created_at: string
  currency: string
  client_currency?: string
  exchange_rate?: number
}

export interface InvoiceStats {
  totalInvoices: number
  totalAmount: number
  paidAmount: number
  pendingAmount: number
  paidCount: number
  pendingCount: number
  currencyBreakdown: Record<string, { amount: number; count: number }>
}

export async function getInvoices() {
  try {
    const supabase = createClient()
    const { data: invoices, error } = await supabase
      .from("invoices")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10)

    if (error) {
      console.error("Error fetching invoices:", error)
      return { data: [], error: error.message }
    }

    return { data: invoices || [], error: null }
  } catch (error) {
    console.error("Error in getInvoices:", error)
    return { data: [], error: "Failed to fetch invoices" }
  }
}

export async function getInvoiceStats() {
  try {
    const supabase = createClient()
    const { data: invoices, error } = await supabase.from("invoices").select("*")

    if (error) {
      console.error("Error fetching invoice stats:", error)
      return { data: null, error: error.message }
    }

    const stats: InvoiceStats = {
      totalInvoices: invoices?.length || 0,
      totalAmount: 0,
      paidAmount: 0,
      pendingAmount: 0,
      paidCount: 0,
      pendingCount: 0,
      currencyBreakdown: {},
    }

    invoices?.forEach((invoice) => {
      stats.totalAmount += invoice.amount

      if (invoice.status === "paid") {
        stats.paidAmount += invoice.amount
        stats.paidCount++
      } else if (invoice.status === "pending") {
        stats.pendingAmount += invoice.amount
        stats.pendingCount++
      }

      // Currency breakdown
      if (!stats.currencyBreakdown[invoice.currency]) {
        stats.currencyBreakdown[invoice.currency] = { amount: 0, count: 0 }
      }
      stats.currencyBreakdown[invoice.currency].amount += invoice.amount
      stats.currencyBreakdown[invoice.currency].count++
    })

    return { data: stats, error: null }
  } catch (error) {
    console.error("Error in getInvoiceStats:", error)
    return { data: null, error: "Failed to fetch invoice stats" }
  }
}

export async function createInvoice(invoiceData: Partial<Invoice>) {
  try {
    const supabase = createClient()
    const { data: invoice, error } = await supabase.from("invoices").insert([invoiceData]).select().single()

    if (error) {
      console.error("Error creating invoice:", error)
      return { data: null, error: error.message }
    }

    return { data: invoice, error: null }
  } catch (error) {
    console.error("Error in createInvoice:", error)
    return { data: null, error: "Failed to create invoice" }
  }
}
