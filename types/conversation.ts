export interface ConversationSession {
  id: string
  user_id: string
  title: string
  summary?: string
  auto_summary?: string
  summary_generated_at?: string
  context: Record<string, any>
  metadata: Record<string, any>
  message_count: number
  is_archived: boolean
  created_at: string
  updated_at: string
}

export interface ConversationMessage {
  id: string
  session_id: string
  user_id: string
  role: "user" | "assistant"
  content: string
  metadata: Record<string, any>
  created_at: string
}

export interface ConversationContext {
  recentTopics: string[]
  userPreferences: Record<string, any>
  conversationSummary: string
  lastInteraction: string
  keyPoints: string[]
  actionItems: string[]
}

export interface MemoryStats {
  totalSessions: number
  totalMessages: number
  averageSessionLength: number
  mostDiscussedTopics: string[]
  recentActivity: string
  summarizedSessions: number
}

export interface ConversationSummary {
  mainTopics: string[]
  keyDecisions: string[]
  actionItems: string[]
  userPreferences: Record<string, any>
  businessContext: Record<string, any>
  nextSteps: string[]
}

export interface SearchResult {
  session_id: string
  session_title: string
  session_summary?: string
  session_auto_summary?: string
  session_created_at: string
  session_updated_at: string
  session_message_count: number
  message_id?: string
  message_content?: string
  message_role?: string
  message_created_at?: string
  search_rank: number
  match_type: "session" | "message"
}

export interface SearchFilters {
  dateRange?: {
    start: string
    end: string
  }
  messageRole?: "user" | "assistant" | "all"
  hasActionItems?: boolean
  hasSummary?: boolean
  minMessageCount?: number
}

export interface SearchStats {
  totalResults: number
  sessionMatches: number
  messageMatches: number
  searchTime: number
  topTopics: string[]
}
