export interface SavedSearch {
  id: string
  user_id: string
  name: string
  description?: string
  query: string
  filters: SearchFilters
  category?: string
  is_favorite: boolean
  usage_count: number
  last_used_at?: string
  created_at: string
  updated_at: string
}

export interface SearchFilters {
  dateRange?: {
    from: string
    to: string
  }
  roles?: ("user" | "assistant")[]
  hasContext?: boolean
  sessionIds?: string[]
  categories?: string[]
  minConfidence?: number
}

export interface SavedSearchStats {
  total: number
  favorites: number
  categories: Record<string, number>
  mostUsed: SavedSearch[]
  recentlyUsed: SavedSearch[]
}

export interface CreateSavedSearchData {
  name: string
  description?: string
  query: string
  filters: SearchFilters
  category?: string
  is_favorite?: boolean
}

export interface UpdateSavedSearchData {
  name?: string
  description?: string
  query?: string
  filters?: SearchFilters
  category?: string
  is_favorite?: boolean
}
