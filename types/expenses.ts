export interface Expense {
  id: string
  user_id: string
  amount: number
  category: string
  description: string | null
  date: string // ISO date string, e.g., "YYYY-MM-DD"
  created_at: string
  updated_at: string
}
