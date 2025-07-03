"use server"

import { createClient } from "@/lib/supabase/server"
import type {
  TeamSearchPattern,
  TeamSearchTemplate,
  TeamCollaborationStats,
  TeamSearchAnalytics,
  SharePatternRequest,
  CreateTemplateRequest,
  TeamSearchFilters,
  TeamRecommendation,
  TeamSearchLeaderboard,
} from "@/types/team-search"

export async function getOrganizationId(): Promise<string | null> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user?.user_metadata?.organization_id) {
    return null
  }

  return user.user_metadata.organization_id
}

export async function shareSearchPattern(request: SharePatternRequest): Promise<TeamSearchPattern | null> {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("User not authenticated")
    }

    const { data, error } = await supabase
      .from("team_search_patterns")
      .insert({
        user_id: user.id,
        organization_id: user.user_metadata?.organization_id,
        pattern_name: request.pattern_name,
        search_query: request.search_query,
        description: request.description,
        category: request.category,
        tags: request.tags,
        is_public: request.is_public,
        is_approved: !request.is_public, // Auto-approve private patterns
      })
      .select()
      .single()

    if (error) {
      console.error("Error sharing search pattern:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error in shareSearchPattern:", error)
    return null
  }
}

export async function createSearchTemplate(request: CreateTemplateRequest): Promise<TeamSearchTemplate | null> {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("User not authenticated")
    }

    const { data, error } = await supabase
      .from("team_search_templates")
      .insert({
        user_id: user.id,
        organization_id: user.user_metadata?.organization_id,
        template_name: request.template_name,
        template_query: request.template_query,
        description: request.description,
        category: request.category,
        variables: request.variables || {},
        usage_instructions: request.usage_instructions,
        is_public: request.is_public,
        approval_status: request.is_public ? "pending" : "approved",
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating search template:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error in createSearchTemplate:", error)
    return null
  }
}

export async function getTeamSearchPatterns(filters: TeamSearchFilters = {}): Promise<TeamSearchPattern[]> {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("User not authenticated")
    }

    let query = supabase.from("team_search_patterns").select("*").or(`user_id.eq.${user.id},is_public.eq.true`)

    // Apply filters
    if (filters.category) {
      query = query.eq("category", filters.category)
    }

    if (filters.success_rate_min) {
      query = query.gte("success_rate", filters.success_rate_min)
    }

    if (filters.is_approved !== undefined) {
      query = query.eq("is_approved", filters.is_approved)
    }

    if (filters.creator_id) {
      query = query.eq("user_id", filters.creator_id)
    }

    if (filters.date_range) {
      query = query.gte("created_at", filters.date_range.start).lte("created_at", filters.date_range.end)
    }

    // Apply sorting
    const sortBy = filters.sort_by || "updated_at"
    const sortOrder = filters.sort_order || "desc"
    query = query.order(sortBy, { ascending: sortOrder === "asc" })

    const { data, error } = await query

    if (error) {
      console.error("Error fetching team search patterns:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error in getTeamSearchPatterns:", error)
    return []
  }
}

export async function getTeamSearchTemplates(filters: TeamSearchFilters = {}): Promise<TeamSearchTemplate[]> {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("User not authenticated")
    }

    let query = supabase.from("team_search_templates").select("*").or(`user_id.eq.${user.id},is_public.eq.true`)

    // Apply filters
    if (filters.category) {
      query = query.eq("category", filters.category)
    }

    if (filters.is_approved !== undefined) {
      query = query.eq("is_approved", filters.is_approved)
    }

    if (filters.creator_id) {
      query = query.eq("user_id", filters.creator_id)
    }

    if (filters.date_range) {
      query = query.gte("created_at", filters.date_range.start).lte("created_at", filters.date_range.end)
    }

    // Apply sorting
    const sortBy = filters.sort_by || "updated_at"
    const sortOrder = filters.sort_order || "desc"
    query = query.order(sortBy, { ascending: sortOrder === "asc" })

    const { data, error } = await query

    if (error) {
      console.error("Error fetching team search templates:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error in getTeamSearchTemplates:", error)
    return []
  }
}

export async function useTeamSearchTemplate(templateId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "User not authenticated" }
    }

    const organizationId = await getOrganizationId()
    if (!organizationId) {
      return { success: false, error: "Organization not found" }
    }

    // Increment usage count
    const { error: updateError } = await supabase
      .from("team_search_templates")
      .update({ usage_count: supabase.raw("usage_count + 1") })
      .eq("id", templateId)

    if (updateError) {
      console.error("Error updating template usage:", updateError)
      return { success: false, error: "Failed to update template usage" }
    }

    // Record collaboration
    await supabase.from("team_search_collaborations").insert({
      organization_id: organizationId,
      user_id: user.id,
      collaboration_type: "template_use",
      target_type: "template",
      target_id: templateId,
    })

    return { success: true }
  } catch (error) {
    console.error("Error in useTeamSearchTemplate:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function getTeamSearchLeaderboard(): Promise<TeamSearchLeaderboard[]> {
  try {
    const supabase = createClient()
    const organizationId = await getOrganizationId()

    if (!organizationId) {
      return []
    }

    const { data, error } = await supabase
      .from("team_search_leaderboard")
      .select("*")
      .eq("organization_id", organizationId)
      .order("collaboration_score", { ascending: false })
      .limit(20)

    if (error) {
      console.error("Error fetching team search leaderboard:", error)
      return []
    }

    return (data || []).map((row) => ({
      id: row.id,
      organizationId: row.organization_id,
      userId: row.user_id,
      userName: row.user_name,
      userRole: row.user_role,
      userDepartment: row.user_department,
      templatesCreated: row.templates_created,
      patternsShared: row.patterns_shared,
      insightsContributed: row.insights_contributed,
      totalUsageOfContributions: row.total_usage_of_contributions,
      collaborationScore: row.collaboration_score,
      lastContribution: row.last_contribution,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }))
  } catch (error) {
    console.error("Error in getTeamSearchLeaderboard:", error)
    return []
  }
}

export async function getTeamSearchRecommendations(): Promise<TeamSearchRecommendation[]> {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return []
    }

    const organizationId = await getOrganizationId()
    if (!organizationId) {
      return []
    }

    const { data, error } = await supabase.rpc("get_team_search_recommendations", {
      target_org_id: organizationId,
      target_user_id: user.id,
    })

    if (error) {
      console.error("Error fetching team search recommendations:", error)
      return []
    }

    return (data || []).map((row: any) => ({
      recommendationType: row.recommendation_type,
      title: row.title,
      description: row.description,
      suggestedQuery: row.suggested_query,
      suggestedFilters: row.suggested_filters || {},
      confidence: row.confidence,
      sourceUser: row.source_user,
      usageCount: row.usage_count,
      successRate: row.success_rate,
    }))
  } catch (error) {
    console.error("Error in getTeamSearchRecommendations:", error)
    return []
  }
}

export async function getTeamSearchAnalytics(): Promise<TeamSearchAnalytics> {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("User not authenticated")
    }

    const orgId = user.user_metadata?.organization_id || "default"

    // Get basic counts
    const [patternsResult, templatesResult, insightsResult] = await Promise.all([
      supabase.from("team_search_patterns").select("id, success_rate, category").eq("organization_id", orgId),
      supabase.from("team_search_templates").select("id, category").eq("organization_id", orgId),
      supabase.from("team_search_insights").select("id").eq("organization_id", orgId),
    ])

    const patterns = patternsResult.data || []
    const templates = templatesResult.data || []
    const insights = insightsResult.data || []

    // Calculate average success rate
    const averageSuccessRate =
      patterns.length > 0 ? patterns.reduce((sum, p) => sum + (p.success_rate || 0), 0) / patterns.length : 0

    // Get top categories
    const categoryStats = new Map<string, { count: number; success_rates: number[] }>()

    patterns.forEach((pattern) => {
      if (pattern.category) {
        const existing = categoryStats.get(pattern.category) || { count: 0, success_rates: [] }
        existing.count++
        existing.success_rates.push(pattern.success_rate || 0)
        categoryStats.set(pattern.category, existing)
      }
    })

    templates.forEach((template) => {
      if (template.category) {
        const existing = categoryStats.get(template.category) || { count: 0, success_rates: [] }
        existing.count++
        categoryStats.set(template.category, existing)
      }
    })

    const topCategories = Array.from(categoryStats.entries())
      .map(([category, stats]) => ({
        category,
        count: stats.count,
        success_rate:
          stats.success_rates.length > 0
            ? stats.success_rates.reduce((sum, rate) => sum + rate, 0) / stats.success_rates.length
            : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Mock other data for now
    const topContributors = [
      { user_id: "user-1", user_name: "Alice Johnson", contribution_count: 15, collaboration_score: 95.5 },
      { user_id: "user-2", user_name: "Bob Smith", contribution_count: 12, collaboration_score: 87.2 },
      { user_id: "user-3", user_name: "Carol Davis", contribution_count: 8, collaboration_score: 78.9 },
    ]

    const recentActivity = [
      {
        type: "pattern" as const,
        title: "Invoice Status Queries",
        creator: "Alice Johnson",
        created_at: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        type: "template" as const,
        title: "Client Payment Follow-up",
        creator: "Bob Smith",
        created_at: new Date(Date.now() - 7200000).toISOString(),
      },
      {
        type: "insight" as const,
        title: "Best Time for Expense Searches",
        creator: "Carol Davis",
        created_at: new Date(Date.now() - 10800000).toISOString(),
      },
    ]

    const usageStats = {
      daily_usage: 45,
      weekly_usage: 280,
      monthly_usage: 1150,
      average_time_saved: 8.5,
    }

    return {
      totalPatterns: patterns.length,
      totalTemplates: templates.length,
      totalInsights: insights.length,
      averageSuccessRate: Math.round(averageSuccessRate * 100) / 100,
      topCategories,
      topContributors,
      recentActivity,
      usageStats,
    }
  } catch (error) {
    console.error("Error in getTeamSearchAnalytics:", error)
    return {
      totalPatterns: 0,
      totalTemplates: 0,
      totalInsights: 0,
      averageSuccessRate: 0,
      topCategories: [],
      topContributors: [],
      recentActivity: [],
      usageStats: {
        daily_usage: 0,
        weekly_usage: 0,
        monthly_usage: 0,
        average_time_saved: 0,
      },
    }
  }
}

export async function voteOnTeamInsight(
  insightId: string,
  voteType: "upvote" | "downvote",
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "User not authenticated" }
    }

    const organizationId = await getOrganizationId()
    if (!organizationId) {
      return { success: false, error: "Organization not found" }
    }

    // Update vote count
    const updateField = voteType === "upvote" ? "upvotes" : "downvotes"
    const { error: updateError } = await supabase
      .from("team_search_insights")
      .update({ [updateField]: supabase.raw(`${updateField} + 1`) })
      .eq("id", insightId)

    if (updateError) {
      console.error("Error updating insight vote:", updateError)
      return { success: false, error: "Failed to update vote" }
    }

    // Record collaboration
    await supabase.from("team_search_collaborations").insert({
      organization_id: organizationId,
      user_id: user.id,
      collaboration_type: "insight_vote",
      target_type: "insight",
      target_id: insightId,
      action_data: { vote_type: voteType },
    })

    return { success: true }
  } catch (error) {
    console.error("Error in voteOnTeamInsight:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function searchTeamPatterns(
  query: string,
  category?: string,
  tags?: string[],
): Promise<TeamSearchPattern[]> {
  try {
    const supabase = createClient()
    const organizationId = await getOrganizationId()

    if (!organizationId) {
      return []
    }

    let queryBuilder = supabase
      .from("team_search_patterns")
      .select("*")
      .eq("organization_id", organizationId)
      .eq("is_public", true)

    if (query) {
      queryBuilder = queryBuilder.or(
        `pattern_title.ilike.%${query}%,pattern_description.ilike.%${query}%,search_query.ilike.%${query}%`,
      )
    }

    if (category) {
      queryBuilder = queryBuilder.eq("category", category)
    }

    if (tags && tags.length > 0) {
      queryBuilder = queryBuilder.overlaps("tags", tags)
    }

    const { data, error } = await queryBuilder
      .order("success_rate", { ascending: false })
      .order("usage_count", { ascending: false })
      .limit(20)

    if (error) {
      console.error("Error searching team patterns:", error)
      return []
    }

    return (data || []).map((row) => ({
      id: row.id,
      organizationId: row.organization_id,
      userId: row.user_id,
      patternType: row.pattern_type,
      patternTitle: row.pattern_title,
      patternDescription: row.pattern_description,
      searchQuery: row.search_query,
      searchFilters: row.search_filters || {},
      successMetrics: row.success_metrics || {},
      category: row.category,
      tags: row.tags || [],
      isPublic: row.is_public,
      isFeatured: row.is_featured,
      usageCount: row.usage_count,
      successRate: row.success_rate,
      averageResults: row.average_results,
      createdByName: row.created_by_name,
      createdByRole: row.created_by_role,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }))
  } catch (error) {
    console.error("Error in searchTeamPatterns:", error)
    return []
  }
}

export async function recordSearchUsage(
  patternId?: string,
  templateId?: string,
  searchQuery?: string,
  successRating?: number,
  timeSavedMinutes?: number,
  feedback?: string,
): Promise<boolean> {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("User not authenticated")
    }

    const { error } = await supabase.from("team_search_usage").insert({
      user_id: user.id,
      organization_id: user.user_metadata?.organization_id,
      pattern_id: patternId,
      template_id: templateId,
      search_query: searchQuery || "",
      success_rating: successRating || 3,
      time_saved_minutes: timeSavedMinutes,
      feedback,
    })

    if (error) {
      console.error("Error recording search usage:", error)
      return false
    }

    // Update usage count and success rate for patterns/templates
    if (patternId) {
      await updatePatternStats(patternId, successRating || 3)
    }

    if (templateId) {
      await updateTemplateStats(templateId, successRating || 3)
    }

    return true
  } catch (error) {
    console.error("Error in recordSearchUsage:", error)
    return false
  }
}

async function updatePatternStats(patternId: string, successRating: number): Promise<void> {
  try {
    const supabase = createClient()

    // Get current stats
    const { data: pattern } = await supabase
      .from("team_search_patterns")
      .select("usage_count, success_rate")
      .eq("id", patternId)
      .single()

    if (pattern) {
      const newUsageCount = (pattern.usage_count || 0) + 1
      const currentSuccessRate = pattern.success_rate || 0
      const newSuccessRate = (currentSuccessRate * (newUsageCount - 1) + successRating * 20) / newUsageCount

      await supabase
        .from("team_search_patterns")
        .update({
          usage_count: newUsageCount,
          success_rate: Math.round(newSuccessRate * 100) / 100,
          last_used_at: new Date().toISOString(),
        })
        .eq("id", patternId)
    }
  } catch (error) {
    console.error("Error updating pattern stats:", error)
  }
}

async function updateTemplateStats(templateId: string, successRating: number): Promise<void> {
  try {
    const supabase = createClient()

    // Get current usage count from usage table
    const { data: usageData } = await supabase.from("team_search_usage").select("id").eq("template_id", templateId)

    const usageCount = usageData?.length || 0

    // Update template with usage count
    await supabase
      .from("team_search_templates")
      .update({
        updated_at: new Date().toISOString(),
      })
      .eq("id", templateId)
  } catch (error) {
    console.error("Error updating template stats:", error)
  }
}

export async function voteOnPattern(
  patternId: string,
  voteType: "upvote" | "downvote" | "helpful" | "not_helpful",
): Promise<boolean> {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("User not authenticated")
    }

    const { error } = await supabase.from("team_search_votes").upsert({
      user_id: user.id,
      pattern_id: patternId,
      vote_type: voteType,
    })

    if (error) {
      console.error("Error voting on pattern:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error in voteOnPattern:", error)
    return false
  }
}

export async function voteOnTemplate(
  templateId: string,
  voteType: "upvote" | "downvote" | "helpful" | "not_helpful",
): Promise<boolean> {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("User not authenticated")
    }

    const { error } = await supabase.from("team_search_votes").upsert({
      user_id: user.id,
      template_id: templateId,
      vote_type: voteType,
    })

    if (error) {
      console.error("Error voting on template:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error in voteOnTemplate:", error)
    return false
  }
}

export async function getTeamCollaborationStats(): Promise<TeamCollaborationStats[]> {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("User not authenticated")
    }

    const { data, error } = await supabase
      .from("team_search_collaboration_stats")
      .select("*")
      .eq("organization_id", user.user_metadata?.organization_id || "default")
      .order("collaboration_score", { ascending: false })

    if (error) {
      console.error("Error fetching collaboration stats:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error in getTeamCollaborationStats:", error)
    return []
  }
}

export async function getTeamRecommendations(): Promise<TeamRecommendation[]> {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("User not authenticated")
    }

    // Get user's search history to make personalized recommendations
    const { data: userUsage } = await supabase
      .from("team_search_usage")
      .select("search_query, success_rating")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20)

    // Get top-performing patterns and templates
    const [patternsResult, templatesResult] = await Promise.all([
      supabase
        .from("team_search_patterns")
        .select("*")
        .eq("is_public", true)
        .eq("is_approved", true)
        .gte("success_rate", 80)
        .order("success_rate", { ascending: false })
        .limit(10),
      supabase
        .from("team_search_templates")
        .select("*")
        .eq("is_public", true)
        .eq("is_approved", true)
        .order("updated_at", { ascending: false })
        .limit(10),
    ])

    const patterns = patternsResult.data || []
    const templates = templatesResult.data || []

    const recommendations: TeamRecommendation[] = []

    // Add pattern recommendations
    patterns.forEach((pattern) => {
      recommendations.push({
        type: "pattern",
        id: pattern.id,
        title: pattern.pattern_name,
        description: pattern.description || "No description available",
        success_rate: pattern.success_rate,
        usage_count: pattern.usage_count,
        creator_name: "Team Member", // Would be populated from user data
        reason: `This pattern has a ${pattern.success_rate}% success rate and has been used ${pattern.usage_count} times`,
        confidence_score: Math.min(95, pattern.success_rate + pattern.usage_count * 2),
      })
    })

    // Add template recommendations
    templates.forEach((template) => {
      recommendations.push({
        type: "template",
        id: template.id,
        title: template.template_name,
        description: template.description || "No description available",
        creator_name: "Team Member", // Would be populated from user data
        reason: "This template is popular among your team members",
        confidence_score: 75,
      })
    })

    // Sort by confidence score
    recommendations.sort((a, b) => b.confidence_score - a.confidence_score)

    return recommendations.slice(0, 8)
  } catch (error) {
    console.error("Error in getTeamRecommendations:", error)
    return []
  }
}

export async function approveTemplate(templateId: string): Promise<boolean> {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("User not authenticated")
    }

    const { error } = await supabase
      .from("team_search_templates")
      .update({
        is_approved: true,
        approval_status: "approved",
        approved_by: user.id,
        approved_at: new Date().toISOString(),
      })
      .eq("id", templateId)

    if (error) {
      console.error("Error approving template:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error in approveTemplate:", error)
    return false
  }
}

export async function rejectTemplate(templateId: string): Promise<boolean> {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("User not authenticated")
    }

    const { error } = await supabase
      .from("team_search_templates")
      .update({
        is_approved: false,
        approval_status: "rejected",
        approved_by: user.id,
        approved_at: new Date().toISOString(),
      })
      .eq("id", templateId)

    if (error) {
      console.error("Error rejecting template:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error in rejectTemplate:", error)
    return false
  }
}
