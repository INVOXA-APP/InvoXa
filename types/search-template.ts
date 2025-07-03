export interface SearchTemplate {
  id: string
  name: string
  description: string | null
  category: string
  query: string
  filters: Record<string, any>
  tags: string[]
  icon: string | null
  color: string | null
  is_system: boolean
  is_public: boolean
  created_by: string | null
  usage_count: number
  last_used_at: string | null
  created_at: string
  updated_at: string
}

export interface SearchFilters {
  dateRange?: {
    from: string
    to: string
  }
  messageRole?: "user" | "assistant" | "all"
  hasActionItems?: boolean
  hasSummary?: boolean
  minMessageCount?: number
  sessionIds?: string[]
  categories?: string[]
}

export interface SearchTemplateCategory {
  name: string
  description: string
  icon: string
  color: string
  count: number
}

export interface SearchTemplateFilters {
  category?: string
  tags?: string[]
  is_system?: boolean
  is_public?: boolean
  created_by?: string
  search?: string
}

export interface CreateSearchTemplateData {
  name: string
  description?: string
  category: string
  query: string
  filters?: Record<string, any>
  tags?: string[]
  icon?: string
  color?: string
  is_public?: boolean
}

export interface UpdateSearchTemplateData extends Partial<CreateSearchTemplateData> {
  id: string
}

export interface SearchTemplateStats {
  totalTemplates: number
  systemTemplates: number
  userTemplates: number
  categoryCounts: Record<string, number>
  mostUsedTemplates: SearchTemplate[]
  recentlyUsedTemplates: SearchTemplate[]
  popularTags: { tag: string; count: number }[]
}

export interface SearchTemplateUsage {
  template_id: string
  used_at: string
  user_id: string
  results_count: number
}

export const TEMPLATE_CATEGORIES = [
  {
    name: "Invoices",
    description: "Invoice management and billing conversations",
    icon: "FileText",
    color: "blue",
  },
  {
    name: "Clients",
    description: "Client relationship and communication templates",
    icon: "Users",
    color: "green",
  },
  {
    name: "Expenses",
    description: "Business expense and cost management",
    icon: "CreditCard",
    color: "purple",
  },
  {
    name: "Reports",
    description: "Financial reports and business analytics",
    icon: "BarChart3",
    color: "orange",
  },
  {
    name: "Tasks",
    description: "Task management and project tracking",
    icon: "CheckSquare",
    color: "red",
  },
  {
    name: "Meetings",
    description: "Meeting notes and communication records",
    icon: "Calendar",
    color: "indigo",
  },
  {
    name: "Compliance",
    description: "Legal and regulatory compliance matters",
    icon: "Shield",
    color: "yellow",
  },
  {
    name: "Technology",
    description: "Software, systems, and technical discussions",
    icon: "Monitor",
    color: "cyan",
  },
  {
    name: "Business",
    description: "Business development and strategic planning",
    icon: "TrendingUp",
    color: "pink",
  },
] as const

export type TemplateCategoryName = (typeof TEMPLATE_CATEGORIES)[number]["name"]
