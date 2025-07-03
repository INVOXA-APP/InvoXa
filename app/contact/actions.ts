"use server"

import { z } from "zod"
import { Resend } from "resend"
import { createClient } from "@/lib/supabase/server"
import { getCustomerConfirmationEmail, getInternalNotificationEmail } from "@/lib/email-templates"
import type { ContactSubmission } from "@/types/contact"

const resend = new Resend(process.env.RESEND_API_KEY)

const contactFormSchema = z.object({
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must be less than 50 characters"),
  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must be less than 50 characters"),
  email: z.string().email("Please enter a valid email address"),
  company: z
    .string()
    .min(2, "Company name must be at least 2 characters")
    .max(100, "Company name must be less than 100 characters"),
  phone: z
    .string()
    .optional()
    .refine((phone) => {
      if (!phone) return true
      const phoneRegex = /^[+]?[1-9][\d]{0,15}$/
      return phoneRegex.test(phone.replace(/[\s\-$$$$]/g, ""))
    }, "Please enter a valid phone number"),
  subject: z.string().min(1, "Please select a subject"),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(1000, "Message must be less than 1000 characters"),
})

function generateTrackingId(): string {
  const timestamp = Date.now().toString(36)
  const randomStr = Math.random().toString(36).substring(2, 8)
  return `INV-${timestamp}-${randomStr}`.toUpperCase()
}

function getLeadPriority(subject: string): "low" | "medium" | "high" | "urgent" {
  switch (subject) {
    case "Request Demo":
    case "Enterprise Inquiry":
      return "urgent"
    case "Sales Question":
    case "Pricing Information":
      return "high"
    case "Technical Support":
    case "Partnership Opportunity":
      return "medium"
    default:
      return "low"
  }
}

function getAssignedTeamMember(subject: string): string {
  switch (subject) {
    case "Request Demo":
    case "Sales Question":
    case "Pricing Information":
    case "Enterprise Inquiry":
      return "sales@invoxa.com"
    case "Technical Support":
      return "support@invoxa.com"
    case "Partnership Opportunity":
      return "partnerships@invoxa.com"
    default:
      return "info@invoxa.com"
  }
}

function getFollowUpDate(priority: string): Date {
  const now = new Date()
  switch (priority) {
    case "urgent":
      return new Date(now.getTime() + 2 * 60 * 60 * 1000) // 2 hours
    case "high":
      return new Date(now.getTime() + 24 * 60 * 60 * 1000) // 1 day
    case "medium":
      return new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000) // 3 days
    default:
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // 1 week
  }
}

export async function submitContactForm(formData: FormData) {
  try {
    // Validate form data
    const validatedData = contactFormSchema.parse({
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      email: formData.get("email"),
      company: formData.get("company"),
      phone: formData.get("phone") || undefined,
      subject: formData.get("subject"),
      message: formData.get("message"),
    })

    // Generate tracking ID and determine lead details
    const trackingId = generateTrackingId()
    const priority = getLeadPriority(validatedData.subject)
    const assignedTo = getAssignedTeamMember(validatedData.subject)
    const followUpDate = getFollowUpDate(priority)

    // Store in Supabase database
    const supabase = createClient()

    const submissionData: Partial<ContactSubmission> = {
      tracking_id: trackingId,
      first_name: validatedData.firstName,
      last_name: validatedData.lastName,
      email: validatedData.email,
      company: validatedData.company,
      phone: validatedData.phone,
      subject: validatedData.subject,
      message: validatedData.message,
      status: "new",
      priority,
      assigned_to: assignedTo,
      follow_up_date: followUpDate.toISOString(),
      customer_email_sent: false,
      internal_email_sent: false,
      tags: [priority, validatedData.subject.toLowerCase().replace(/\s+/g, "-")],
    }

    const { data: submission, error: dbError } = await supabase
      .from("contact_submissions")
      .insert(submissionData)
      .select()
      .single()

    if (dbError) {
      console.error("Database error:", dbError)
      throw new Error("Failed to store contact submission")
    }

    // Send customer confirmation email
    let customerEmailId: string | undefined
    try {
      const customerEmailResult = await resend.emails.send({
        from: "INVOXA <noreply@invoxa.com>",
        to: [validatedData.email],
        subject: `Thank you for contacting INVOXA - ${trackingId}`,
        html: getCustomerConfirmationEmail({
          firstName: validatedData.firstName,
          trackingId,
          subject: validatedData.subject,
          message: validatedData.message,
        }),
      })

      if (customerEmailResult.data?.id) {
        customerEmailId = customerEmailResult.data.id
      }
    } catch (emailError) {
      console.error("Customer email error:", emailError)
    }

    // Send internal notification email
    let internalEmailId: string | undefined
    try {
      const internalEmailResult = await resend.emails.send({
        from: "INVOXA Leads <leads@invoxa.com>",
        to: [assignedTo],
        cc: ["leads@invoxa.com"],
        subject: `🚨 New ${priority.toUpperCase()} Priority Lead - ${trackingId}`,
        html: getInternalNotificationEmail({
          trackingId,
          firstName: validatedData.firstName,
          lastName: validatedData.lastName,
          email: validatedData.email,
          company: validatedData.company,
          phone: validatedData.phone,
          subject: validatedData.subject,
          message: validatedData.message,
          priority,
          assignedTo,
          followUpDate: followUpDate.toLocaleDateString(),
        }),
      })

      if (internalEmailResult.data?.id) {
        internalEmailId = internalEmailResult.data.id
      }
    } catch (emailError) {
      console.error("Internal email error:", emailError)
    }

    // Update submission with email IDs
    await supabase
      .from("contact_submissions")
      .update({
        customer_email_sent: !!customerEmailId,
        customer_email_id: customerEmailId,
        internal_email_sent: !!internalEmailId,
        internal_email_id: internalEmailId,
      })
      .eq("id", submission.id)

    return {
      success: true,
      message: "Thank you for your message! We'll get back to you within 24 hours.",
      trackingId,
    }
  } catch (error) {
    console.error("Contact form submission error:", error)

    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: "Please check your form data and try again.",
        errors: error.flatten().fieldErrors,
      }
    }

    return {
      success: false,
      message: "Something went wrong. Please try again later.",
    }
  }
}

export async function getContactSubmissions() {
  const supabase = createClient()

  const { data: submissions, error } = await supabase
    .from("contact_submissions")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching contact submissions:", error)
    return { submissions: [], error: error.message }
  }

  return { submissions: submissions as ContactSubmission[], error: null }
}

export async function getContactSubmissionStats() {
  const supabase = createClient()

  // Get total submissions
  const { count: totalSubmissions } = await supabase
    .from("contact_submissions")
    .select("*", { count: "exact", head: true })

  // Get new leads (created in last 7 days)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const { count: newLeads } = await supabase
    .from("contact_submissions")
    .select("*", { count: "exact", head: true })
    .gte("created_at", sevenDaysAgo)

  // Get high priority submissions
  const { count: highPriority } = await supabase
    .from("contact_submissions")
    .select("*", { count: "exact", head: true })
    .in("priority", ["high", "urgent"])
    .eq("status", "new")

  // Get overdue follow-ups
  const now = new Date().toISOString()
  const { count: overdueFollowups } = await supabase
    .from("contact_submissions")
    .select("*", { count: "exact", head: true })
    .lt("follow_up_date", now)
    .neq("status", "closed")

  return {
    total_submissions: totalSubmissions || 0,
    new_leads: newLeads || 0,
    high_priority: highPriority || 0,
    overdue_followups: overdueFollowups || 0,
    conversion_rate: 0, // This would be calculated based on actual conversions
  }
}
