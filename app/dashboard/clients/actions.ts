import { createClient } from "@/lib/supabase/server"

export interface Client {
  id: string
  name: string
  email: string
  phone?: string
  company?: string
  address?: string
  status: "active" | "inactive" | "pending"
  total_invoices: number
  total_amount: number
  last_invoice_date?: string
  created_at: string
}

export async function getClients() {
  try {
    const supabase = createClient()
    const { data: clients, error } = await supabase
      .from("clients")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching clients:", error)
      return { data: [], error: error.message }
    }

    return { data: clients || [], error: null }
  } catch (error) {
    console.error("Error in getClients:", error)
    return { data: [], error: "Failed to fetch clients" }
  }
}

export async function searchClients(query: string) {
  try {
    const supabase = createClient()
    const { data: clients, error } = await supabase
      .from("clients")
      .select("*")
      .or(`name.ilike.%${query}%,email.ilike.%${query}%,company.ilike.%${query}%`)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error searching clients:", error)
      return { data: [], error: error.message }
    }

    return { data: clients || [], error: null }
  } catch (error) {
    console.error("Error in searchClients:", error)
    return { data: [], error: "Failed to search clients" }
  }
}

export async function addClient(clientData: Partial<Client>) {
  try {
    const supabase = createClient()
    const { data: client, error } = await supabase.from("clients").insert([clientData]).select().single()

    if (error) {
      console.error("Error creating client:", error)
      return { data: null, error: error.message }
    }

    return { data: client, error: null }
  } catch (error) {
    console.error("Error in addClient:", error)
    return { data: null, error: "Failed to create client" }
  }
}
