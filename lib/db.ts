import { Pool } from "pg"
import { createClient } from "@supabase/supabase-js"

// This is a basic example. In a real application, you'd want to use a more robust ORM or query builder.
// Ensure your DATABASE_URL environment variable is set.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

// For Supabase, the client is initialized here.
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl!, supabaseKey!)

export async function query(text: string, params?: any[]) {
  const client = await pool.connect()
  try {
    const res = await client.query(text, params)
    return res
  } finally {
    client.release()
  }
}

export { supabase }
