"use server"

import { createClient } from "@/lib/supabase/server"
import type {
  SearchTemplate,
  SearchTemplateCategory,
  SearchTemplateFilters,
  CreateSearchTemplateData,
  UpdateSearchTemplateData,
} from "@/types/search-template"

export async function getSearchTemplates(filters?: SearchTemplateFilters): Promise<SearchTemplate[]> {
  const supabase = createClient()

  let query = supabase.from("search_templates").select("*").order("usage_count", { ascending: false })

  if (filters?.category) {
    query = query.eq("category", filters.category)
  }

  if (filters?.is_system !== undefined) {
    query = query.eq("is_system", filters.is_system)
  }

  if (filters?.is_public !== undefined) {
    query = query.eq("is_public", filters.is_public)
  }

  if (filters?.created_by) {
    query = query.eq("created_by", filters.created_by)
  }

  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
  }

  if (filters?.tags && filters.tags.length > 0) {
    query = query.overlaps("tags", filters.tags)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching search templates:", error)
    throw new Error("Failed to fetch search templates")
  }

  return data || []
}

export async function getSearchTemplateCategories(): Promise<SearchTemplateCategory[]> {
  const supabase = createClient()

  const { data, error } = await supabase.from("search_templates").select("category").group("category")

  if (error) {
    console.error("Error fetching categories:", error)
    throw new Error("Failed to fetch categories")
  }

  // Get category counts
  const categories = await Promise.all(
    [
      "Invoice Management",
      "Client Management",
      "Expense Management",
      "Financial Reports",
      "Task Management",
      "Meetings",
      "Compliance",
      "Technology",
      "Business Development",
    ].map(async (category) => {
      const { count } = await supabase
        .from("search_templates")
        .select("*", { count: "exact", head: true })
        .eq("category", category)

      return {
        name: category,
        description: getCategoryDescription(category),
        icon: getCategoryIcon(category),
        color: getCategoryColor(category),
        count: count || 0,
      }
    }),
  )

  return categories
}

export async function getPopularSearchTemplates(limit = 10): Promise<SearchTemplate[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("search_templates")
    .select("*")
    .order("usage_count", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("Error fetching popular templates:", error)
    throw new Error("Failed to fetch popular templates")
  }

  return data || []
}

export async function getSearchTemplateById(id: string): Promise<SearchTemplate | null> {
  const supabase = createClient()

  const { data, error } = await supabase.from("search_templates").select("*").eq("id", id).single()

  if (error) {
    console.error("Error fetching search template:", error)
    return null
  }

  return data
}

export async function createSearchTemplate(templateData: CreateSearchTemplateData): Promise<SearchTemplate | null> {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new Error("User not authenticated")
  }

  const { data, error } = await supabase
    .from("search_templates")
    .insert({
      ...templateData,
      created_by: user.id,
      filters: templateData.filters || {},
      tags: templateData.tags || [],
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating search template:", error)
    throw new Error("Failed to create search template")
  }

  return data
}

export async function updateSearchTemplate(templateData: UpdateSearchTemplateData): Promise<SearchTemplate | null> {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new Error("User not authenticated")
  }

  const { id, ...updateData } = templateData

  const { data, error } = await supabase
    .from("search_templates")
    .update(updateData)
    .eq("id", id)
    .eq("created_by", user.id) // Ensure user can only update their own templates
    .select()
    .single()

  if (error) {
    console.error("Error updating search template:", error)
    throw new Error("Failed to update search template")
  }

  return data
}

export async function deleteSearchTemplate(id: string): Promise<boolean> {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new Error("User not authenticated")
  }

  const { error } = await supabase.from("search_templates").delete().eq("id", id).eq("created_by", user.id) // Ensure user can only delete their own templates

  if (error) {
    console.error("Error deleting search template:", error)
    throw new Error("Failed to delete search template")
  }

  return true
}

export async function incrementTemplateUsage(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from("search_templates")
    .update({
      usage_count: supabase.raw("usage_count + 1"),
      last_used_at: new Date().toISOString(),
    })
    .eq("id", id)

  if (error) {
    console.error("Error incrementing template usage:", error)
  }
}

export async function duplicateSearchTemplate(id: string, newName?: string): Promise<SearchTemplate | null> {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new Error("User not authenticated")
  }

  // Get the original template
  const original = await getSearchTemplateById(id)
  if (!original) {
    throw new Error("Template not found")
  }

  // Create duplicate
  const duplicateData: CreateSearchTemplateData = {
    name: newName || `${original.name} (Copy)`,
    description: original.description || undefined,
    category: original.category,
    query: original.query,
    filters: original.filters,
    tags: original.tags,
    icon: original.icon || undefined,
    color: original.color || undefined,
    is_public: false, // Duplicates are always private initially
  }

  return await createSearchTemplate(duplicateData)
}

// Helper functions
function getCategoryDescription(category: string): string {
  const descriptions: Record<string, string> = {
    "Invoice Management": "Templates for invoice-related conversations",
    "Client Management": "Templates for client relationship discussions",
    "Expense Management": "Templates for expense and cost tracking",
    "Financial Reports": "Templates for financial analysis and reporting",
    "Task Management": "Templates for task and project discussions",
    Meetings: "Templates for meeting-related conversations",
    Compliance: "Templates for compliance and legal matters",
    Technology: "Templates for technical and IT discussions",
    "Business Development": "Templates for growth and development topics",
  }
  return descriptions[category] || "Business conversation templates"
}

function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    "Invoice Management": "FileText",
    "Client Management": "Users",
    "Expense Management": "Receipt",
    "Financial Reports": "BarChart",
    "Task Management": "CheckSquare",
    Meetings: "Video",
    Compliance: "Shield",
    Technology: "Monitor",
    "Business Development": "TrendingUp",
  }
  return icons[category] || "Folder"
}

function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    "Invoice Management": "blue",
    "Client Management": "green",
    "Expense Management": "orange",
    "Financial Reports": "purple",
    "Task Management": "red",
    Meetings: "indigo",
    Compliance: "yellow",
    Technology: "gray",
    "Business Development": "pink",
  }
  return colors[category] || "gray"
}
