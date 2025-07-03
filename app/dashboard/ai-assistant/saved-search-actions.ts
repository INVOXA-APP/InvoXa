"use server"

import { createClient } from "@/lib/supabase/server"
import type { SavedSearch, CreateSavedSearchData, UpdateSavedSearchData, SavedSearchStats } from "@/types/saved-search"

export async function getSavedSearches(): Promise<SavedSearch[]> {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new Error("User not authenticated")
  }

  const { data, error } = await supabase
    .from("saved_searches")
    .select("*")
    .eq("user_id", user.id)
    .order("last_used_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching saved searches:", error)
    throw new Error("Failed to fetch saved searches")
  }

  return data || []
}

export async function getFavoriteSavedSearches(): Promise<SavedSearch[]> {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new Error("User not authenticated")
  }

  const { data, error } = await supabase
    .from("saved_searches")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_favorite", true)
    .order("usage_count", { ascending: false })
    .order("name")

  if (error) {
    console.error("Error fetching favorite saved searches:", error)
    throw new Error("Failed to fetch favorite saved searches")
  }

  return data || []
}

export async function createSavedSearch(data: CreateSavedSearchData): Promise<SavedSearch> {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new Error("User not authenticated")
  }

  // Auto-categorize based on query content
  const category = data.category || categorizeQuery(data.query)

  const { data: savedSearch, error } = await supabase
    .from("saved_searches")
    .insert({
      user_id: user.id,
      name: data.name,
      description: data.description,
      query: data.query,
      filters: data.filters,
      category,
      is_favorite: data.is_favorite || false,
      usage_count: 0,
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating saved search:", error)
    throw new Error("Failed to create saved search")
  }

  return savedSearch
}

export async function updateSavedSearch(id: string, data: UpdateSavedSearchData): Promise<SavedSearch> {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new Error("User not authenticated")
  }

  const updateData: any = { ...data }

  // Auto-categorize if query is updated
  if (data.query && !data.category) {
    updateData.category = categorizeQuery(data.query)
  }

  const { data: savedSearch, error } = await supabase
    .from("saved_searches")
    .update(updateData)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single()

  if (error) {
    console.error("Error updating saved search:", error)
    throw new Error("Failed to update saved search")
  }

  return savedSearch
}

export async function deleteSavedSearch(id: string): Promise<void> {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new Error("User not authenticated")
  }

  const { error } = await supabase.from("saved_searches").delete().eq("id", id).eq("user_id", user.id)

  if (error) {
    console.error("Error deleting saved search:", error)
    throw new Error("Failed to delete saved search")
  }
}

export async function incrementSearchUsage(id: string): Promise<void> {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new Error("User not authenticated")
  }

  const { error } = await supabase
    .from("saved_searches")
    .update({
      usage_count: supabase.raw("usage_count + 1"),
      last_used_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) {
    console.error("Error incrementing search usage:", error)
    throw new Error("Failed to update search usage")
  }
}

export async function getSavedSearchStats(): Promise<SavedSearchStats> {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new Error("User not authenticated")
  }

  const { data: searches, error } = await supabase.from("saved_searches").select("*").eq("user_id", user.id)

  if (error) {
    console.error("Error fetching saved search stats:", error)
    throw new Error("Failed to fetch saved search stats")
  }

  const total = searches?.length || 0
  const favorites = searches?.filter((s) => s.is_favorite).length || 0

  const categories: Record<string, number> = {}
  searches?.forEach((search) => {
    if (search.category) {
      categories[search.category] = (categories[search.category] || 0) + 1
    }
  })

  const mostUsed =
    searches
      ?.filter((s) => s.usage_count > 0)
      .sort((a, b) => b.usage_count - a.usage_count)
      .slice(0, 5) || []

  const recentlyUsed =
    searches
      ?.filter((s) => s.last_used_at)
      .sort((a, b) => new Date(b.last_used_at!).getTime() - new Date(a.last_used_at!).getTime())
      .slice(0, 5) || []

  return {
    total,
    favorites,
    categories,
    mostUsed,
    recentlyUsed,
  }
}

export async function duplicateSavedSearch(id: string, newName: string): Promise<SavedSearch> {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new Error("User not authenticated")
  }

  // Get the original search
  const { data: originalSearch, error: fetchError } = await supabase
    .from("saved_searches")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (fetchError || !originalSearch) {
    throw new Error("Original search not found")
  }

  // Create duplicate
  const { data: duplicatedSearch, error: createError } = await supabase
    .from("saved_searches")
    .insert({
      user_id: user.id,
      name: newName,
      description: originalSearch.description
        ? `Copy of: ${originalSearch.description}`
        : `Copy of ${originalSearch.name}`,
      query: originalSearch.query,
      filters: originalSearch.filters,
      category: originalSearch.category,
      is_favorite: false,
      usage_count: 0,
    })
    .select()
    .single()

  if (createError) {
    console.error("Error duplicating saved search:", createError)
    throw new Error("Failed to duplicate saved search")
  }

  return duplicatedSearch
}

function categorizeQuery(query: string): string {
  const lowerQuery = query.toLowerCase()

  if (lowerQuery.includes("invoice") || lowerQuery.includes("billing") || lowerQuery.includes("payment")) {
    return "Invoices"
  }
  if (lowerQuery.includes("expense") || lowerQuery.includes("cost") || lowerQuery.includes("receipt")) {
    return "Expenses"
  }
  if (lowerQuery.includes("client") || lowerQuery.includes("customer") || lowerQuery.includes("contact")) {
    return "Clients"
  }
  if (lowerQuery.includes("report") || lowerQuery.includes("analytics") || lowerQuery.includes("summary")) {
    return "Reports"
  }
  if (lowerQuery.includes("task") || lowerQuery.includes("todo") || lowerQuery.includes("action")) {
    return "Tasks"
  }
  if (lowerQuery.includes("meeting") || lowerQuery.includes("call") || lowerQuery.includes("discussion")) {
    return "Meetings"
  }

  return "General"
}
