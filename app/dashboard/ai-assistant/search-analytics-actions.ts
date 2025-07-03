"use server"

import { createClient } from "@/lib/supabase/server"
import { SearchPatternAnalyzer } from "@/lib/search-pattern-analyzer"
import type { UserSearchBehavior, SearchRecommendation, SearchAnalytics } from "@/types/search-analytics"

export async function trackSearchEvent(
  query: string,
  filters: any,
  resultsCount: number,
  sessionDuration = 0,
): Promise<void> {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    await supabase.from("search_events").insert({
      user_id: user.id,
      query,
      filters,
      results_count: resultsCount,
      session_duration: sessionDuration,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error tracking search event:", error)
  }
}

export async function trackSearchInteraction(
  searchEventId: string,
  interactionType: "click" | "dismiss" | "save" | "export",
  targetId?: string,
): Promise<void> {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    await supabase.from("search_interactions").insert({
      user_id: user.id,
      search_event_id: searchEventId,
      interaction_type: interactionType,
      target_id: targetId,
      timestamp: new Date().toISOString(),
    })

    // Update the search event to mark it as having interactions
    if (interactionType === "click") {
      await supabase.from("search_events").update({ clicked_result: true }).eq("id", searchEventId)
    }
  } catch (error) {
    console.error("Error tracking search interaction:", error)
  }
}

export async function getUserSearchBehavior(): Promise<UserSearchBehavior | null> {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return null

    // Get search history from the last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

    const { data: searchHistory, error } = await supabase
      .from("search_events")
      .select(`
        query,
        filters,
        timestamp,
        results_count,
        clicked_result,
        session_duration
      `)
      .eq("user_id", user.id)
      .gte("timestamp", thirtyDaysAgo)
      .order("timestamp", { ascending: false })

    if (error) {
      console.error("Error fetching search history:", error)
      return null
    }

    if (!searchHistory || searchHistory.length === 0) {
      return {
        totalSearches: 0,
        averageSearchesPerDay: 0,
        peakActivityHour: 9,
        peakActivityDay: 1,
        topQueryPatterns: [],
        topCategories: [],
        successRate: 0,
        averageSessionDuration: 0,
        filterUsageFrequency: {},
        searchTrends: [],
        lastAnalyzed: new Date().toISOString(),
      }
    }

    return SearchPatternAnalyzer.analyzeSearchBehavior(searchHistory)
  } catch (error) {
    console.error("Error analyzing user search behavior:", error)
    return null
  }
}

export async function getPersonalizedRecommendations(): Promise<SearchRecommendation[]> {
  try {
    const behavior = await getUserSearchBehavior()
    if (!behavior) return []

    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return []

    // Get raw search history for more detailed analysis
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

    const { data: searchHistory } = await supabase
      .from("search_events")
      .select(`
        query,
        filters,
        timestamp,
        results_count,
        clicked_result
      `)
      .eq("user_id", user.id)
      .gte("timestamp", thirtyDaysAgo)
      .order("timestamp", { ascending: false })

    if (!searchHistory) return []

    return SearchPatternAnalyzer.generateRecommendations(behavior, searchHistory)
  } catch (error) {
    console.error("Error generating personalized recommendations:", error)
    return []
  }
}

export async function getSearchAnalytics(): Promise<SearchAnalytics | null> {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return null

    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    // Get search statistics
    const { data: allTimeStats } = await supabase
      .from("search_events")
      .select("id, timestamp, results_count, clicked_result, session_duration")
      .eq("user_id", user.id)

    const { data: thirtyDayStats } = await supabase
      .from("search_events")
      .select("id, timestamp, results_count, clicked_result, session_duration")
      .eq("user_id", user.id)
      .gte("timestamp", thirtyDaysAgo.toISOString())

    const { data: sevenDayStats } = await supabase
      .from("search_events")
      .select("id, timestamp, results_count, clicked_result, session_duration")
      .eq("user_id", user.id)
      .gte("sevenDaysAgo", sevenDaysAgo.toISOString())

    // Calculate metrics
    const totalSearches = allTimeStats?.length || 0
    const searchesLast30Days = thirtyDayStats?.length || 0
    const searchesLast7Days = sevenDayStats?.length || 0

    const successfulSearches = thirtyDayStats?.filter((s) => s.clicked_result && s.results_count > 0).length || 0
    const successRate = searchesLast30Days > 0 ? successfulSearches / searchesLast30Days : 0

    const totalSessionTime = thirtyDayStats?.reduce((sum, s) => sum + (s.session_duration || 0), 0) || 0
    const averageSessionDuration = searchesLast30Days > 0 ? totalSessionTime / searchesLast30Days : 0

    // Get behavior analysis
    const behavior = await getUserSearchBehavior()

    return {
      totalSearches,
      searchesLast30Days,
      searchesLast7Days,
      successRate,
      averageSessionDuration,
      topCategories: behavior?.topCategories || [],
      searchTrends: behavior?.searchTrends || [],
      peakActivityHour: behavior?.peakActivityHour || 9,
      peakActivityDay: behavior?.peakActivityDay || 1,
      generatedAt: now.toISOString(),
    }
  } catch (error) {
    console.error("Error getting search analytics:", error)
    return null
  }
}

export async function dismissRecommendation(recommendationType: string, recommendationId: string): Promise<void> {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    await supabase.from("dismissed_recommendations").insert({
      user_id: user.id,
      recommendation_type: recommendationType,
      recommendation_id: recommendationId,
      dismissed_at: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error dismissing recommendation:", error)
  }
}

export async function saveRecommendationAsTemplate(title: string, query: string, filters: any): Promise<void> {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    await supabase.from("search_templates").insert({
      user_id: user.id,
      title,
      query,
      filters,
      is_public: false,
      created_at: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error saving recommendation as template:", error)
  }
}
