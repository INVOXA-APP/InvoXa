export interface TeamSearchPattern {
  id: string
  user_id: string
  organization_id?: string
  pattern_name: string
  search_query: string
  description?: string
  category?: string
  tags?: string[]
  success_rate: number
  usage_count: number
  is_public: boolean
  is_approved: boolean
  created_at: string
  updated_at: string
  last_used_at?: string
  creator_name?: string
  creator_email?: string
}

export interface TeamSearchTemplate {
  id: string
  user_id: string
  organization_id?: string
  template_name: string
  template_query: string
  description?: string
  category?: string
  variables: Record<string, any>
  usage_instructions?: string
  success_metrics: Record<string, any>
  is_public: boolean
  is_approved: boolean
  approval_status: "pending" | "approved" | "rejected"
  approved_by?: string
  approved_at?: string
  created_at: string
  updated_at: string
  creator_name?: string
  creator_email?: string
  usage_count?: number
}

export interface TeamSearchInsight {
  id: string
  user_id: string
  organization_id?: string
  insight_type: string
  insight_title: string
  insight_description?: string
  related_queries: string[]
  success_data: Record<string, any>
  verification_count: number
  is_verified: boolean
  created_at: string
  updated_at: string
  creator_name?: string
  creator_email?: string
}

export interface TeamSearchUsage {
  id: string
  user_id: string
  organization_id?: string
  pattern_id?: string
  template_id?: string
  search_query: string
  success_rating: number
  time_saved_minutes?: number
  feedback?: string
  created_at: string
}

export interface TeamSearchVote {
  id: string
  user_id: string
  pattern_id?: string
  template_id?: string
  insight_id?: string
  vote_type: "upvote" | "downvote" | "helpful" | "not_helpful"
  created_at: string
}

export interface TeamCollaborationStats {
  id: string
  user_id: string
  organization_id?: string
  patterns_shared: number
  templates_created: number
  insights_contributed: number
  total_usage_by_others: number
  collaboration_score: number
  last_activity_at: string
  created_at: string
  updated_at: string
  user_name?: string
  user_email?: string
}

export interface TeamSearchAnalytics {
  totalPatterns: number
  totalTemplates: number
  totalInsights: number
  averageSuccessRate: number
  topCategories: Array<{
    category: string
    count: number
    success_rate: number
  }>
  topContributors: Array<{
    user_id: string
    user_name: string
    contribution_count: number
    collaboration_score: number
  }>
  recentActivity: Array<{
    type: "pattern" | "template" | "insight"
    title: string
    creator: string
    created_at: string
  }>
  usageStats: {
    daily_usage: number
    weekly_usage: number
    monthly_usage: number
    average_time_saved: number
  }
}

export interface SharePatternRequest {
  pattern_name: string
  search_query: string
  description?: string
  category?: string
  tags?: string[]
  is_public: boolean
}

export interface CreateTemplateRequest {
  template_name: string
  template_query: string
  description?: string
  category?: string
  variables?: Record<string, any>
  usage_instructions?: string
  is_public: boolean
}

export interface TeamSearchFilters {
  category?: string
  tags?: string[]
  success_rate_min?: number
  is_approved?: boolean
  creator_id?: string
  date_range?: {
    start: string
    end: string
  }
  sort_by?: "created_at" | "success_rate" | "usage_count" | "updated_at"
  sort_order?: "asc" | "desc"
}

export interface TeamRecommendation {
  type: "pattern" | "template" | "insight"
  id: string
  title: string
  description: string
  success_rate?: number
  usage_count?: number
  creator_name: string
  reason: string
  confidence_score: number
}
