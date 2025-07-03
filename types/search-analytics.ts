export interface SearchPattern {
  pattern: string
  frequency: number
  examples: string[]
  confidence: number
  lastSeen: string
}

export interface UserSearchBehavior {
  totalSearches: number
  averageSearchesPerDay: number
  peakActivityHour: number
  peakActivityDay: number
  topQueryPatterns: Array<{
    pattern: string
    frequency: number
    examples: string[]
  }>
  topCategories: Array<{
    category: string
    frequency: number
    confidence: number
  }>
  successRate: number
  averageSessionDuration: number
  filterUsageFrequency: Record<string, number>
  searchTrends: Array<{
    date: string
    count: number
  }>
  lastAnalyzed: string
}

export interface SearchRecommendation {
  type: "query" | "filter" | "template" | "habit"
  title: string
  description: string
  suggestedQuery?: string
  suggestedFilters?: Record<string, any>
  confidence: number
  potentialResults: number
  category: "discovery" | "optimization" | "efficiency" | "productivity"
}

export interface SearchAnalytics {
  totalSearches: number
  searchesLast30Days: number
  searchesLast7Days: number
  successRate: number
  averageSessionDuration: number
  topCategories: Array<{
    category: string
    frequency: number
    confidence: number
  }>
  searchTrends: Array<{
    date: string
    count: number
  }>
  peakActivityHour: number
  peakActivityDay: number
  generatedAt: string
}

export interface SearchInsight {
  type: "pattern" | "efficiency" | "discovery" | "habit"
  title: string
  description: string
  value: number | string
  confidence: number
  actionable: boolean
  recommendation?: string
}

export interface SearchEvent {
  id: string
  userId: string
  query: string
  filters: Record<string, any>
  resultsCount: number
  clickedResult: boolean
  sessionDuration: number
  timestamp: string
}

export interface SearchInteraction {
  id: string
  userId: string
  searchEventId: string
  interactionType: "click" | "dismiss" | "save" | "export"
  targetId?: string
  timestamp: string
}
