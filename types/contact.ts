export interface ContactSubmission {
  id: string
  tracking_id: string
  first_name: string
  last_name: string
  email: string
  company: string
  phone?: string
  subject: string
  message: string
  status: "new" | "contacted" | "qualified" | "converted" | "closed"
  priority: "low" | "medium" | "high" | "urgent"
  assigned_to?: string
  follow_up_date?: string
  customer_email_sent: boolean
  customer_email_id?: string
  internal_email_sent: boolean
  internal_email_id?: string
  notes?: string
  tags?: string[]
  created_at: string
  updated_at: string
}

export interface ContactFormData {
  firstName: string
  lastName: string
  email: string
  company: string
  phone?: string
  subject: string
  message: string
}

export interface ContactFormErrors {
  firstName?: string
  lastName?: string
  email?: string
  company?: string
  phone?: string
  subject?: string
  message?: string
}

export interface ContactSubmissionStats {
  total_submissions: number
  new_leads: number
  high_priority: number
  overdue_followups: number
  conversion_rate: number
}
