export interface SearchSuggestion {
  type: "correction" | "expansion" | "filter" | "related" | "combination" | "popular"
  title: string
  query: string
  description: string
  confidence: number
  icon: string
  filters?: Record<string, any>
}

export interface QueryAnalysis {
  originalQuery: string
  correctedQuery: string | null
  queryType: "invoice" | "client" | "expense" | "report" | "general"
  confidence: number
  suggestedFilters: Array<{
    name: string
    key: string
    value: any
    description: string
  }>
  semanticExpansions: string[]
  relatedTopics: string[]
  processingTime: number
}

export interface SearchContext {
  recentSearches?: string[]
  popularTopics?: string[]
  userPreferences?: {
    searchHistory?: string[]
    commonQueries?: string[]
    preferredFilters?: Record<string, any>
  }
}

export interface VoiceSearchState {
  isListening: boolean
  transcript: string
  isProcessing: boolean
  error: string | null
  optimizedQuery: string | null
  confidence: number
  businessTerms: string[]
  suggestedFilters: Record<string, any>
}
