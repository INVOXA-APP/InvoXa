export interface User {
  id: string
  name: string
  email: string
  role: "admin" | "employee" | "client"
  created_at: string
}
