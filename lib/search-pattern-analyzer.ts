import type { SearchFilters } from "@/types/conversation"
import type { UserSearchBehavior, SearchRecommendation } from "@/types/search-analytics"

export class SearchPatternAnalyzer {
  private static readonly PATTERN_THRESHOLD = 3 // Minimum occurrences to identify a pattern
  private static readonly RECOMMENDATION_CONFIDENCE_THRESHOLD = 0.6
  private static readonly TIME_WINDOW_HOURS = 24 * 7 // 7 days for pattern analysis

  static analyzeSearchBehavior(
    searchHistory: Array<{
      query: string
      filters: SearchFilters
      timestamp: string
      results_count: number
      clicked_result: boolean
      session_duration: number
    }>,
  ): UserSearchBehavior {
    const now = new Date()
    const timeWindowStart = new Date(now.getTime() - this.TIME_WINDOW_HOURS * 60 * 60 * 1000)

    // Filter recent searches
    const recentSearches = searchHistory.filter((search) => new Date(search.timestamp) >= timeWindowStart)

    // Analyze search frequency patterns
    const hourlyActivity = this.analyzeHourlyActivity(recentSearches)
    const dailyActivity = this.analyzeDailyActivity(recentSearches)

    // Analyze query patterns
    const queryPatterns = this.extractQueryPatterns(recentSearches)
    const topCategories = this.identifyTopCategories(recentSearches)

    // Analyze search success
    const successRate = this.calculateSuccessRate(recentSearches)
    const averageSessionDuration = this.calculateAverageSessionDuration(recentSearches)

    // Analyze filter usage
    const filterUsage = this.analyzeFilterUsage(recentSearches)

    return {
      totalSearches: recentSearches.length,
      averageSearchesPerDay: recentSearches.length / 7,
      peakActivityHour: this.findPeakHour(hourlyActivity),
      peakActivityDay: this.findPeakDay(dailyActivity),
      topQueryPatterns: queryPatterns.slice(0, 5),
      topCategories: topCategories.slice(0, 5),
      successRate,
      averageSessionDuration,
      filterUsageFrequency: filterUsage,
      searchTrends: this.calculateSearchTrends(recentSearches),
      lastAnalyzed: now.toISOString(),
    }
  }

  static generateRecommendations(
    behavior: UserSearchBehavior,
    searchHistory: Array<{
      query: string
      filters: SearchFilters
      timestamp: string
      results_count: number
      clicked_result: boolean
    }>,
  ): SearchRecommendation[] {
    const recommendations: SearchRecommendation[] = []

    // Query-based recommendations
    const queryRecommendations = this.generateQueryRecommendations(behavior)
    recommendations.push(...queryRecommendations)

    // Filter-based recommendations
    const filterRecommendations = this.generateFilterRecommendations(behavior)
    recommendations.push(...filterRecommendations)

    // Template recommendations
    const templateRecommendations = this.generateTemplateRecommendations(behavior)
    recommendations.push(...templateRecommendations)

    // Habit improvement recommendations
    const habitRecommendations = this.generateHabitRecommendations(behavior)
    recommendations.push(...habitRecommendations)

    // Sort by confidence and return top recommendations
    return recommendations
      .filter((rec) => rec.confidence >= this.RECOMMENDATION_CONFIDENCE_THRESHOLD)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 10)
  }

  private static analyzeHourlyActivity(searches: Array<{ timestamp: string }>): Record<number, number> {
    const hourlyCount: Record<number, number> = {}

    for (let i = 0; i < 24; i++) {
      hourlyCount[i] = 0
    }

    searches.forEach((search) => {
      const hour = new Date(search.timestamp).getHours()
      hourlyCount[hour]++
    })

    return hourlyCount
  }

  private static analyzeDailyActivity(searches: Array<{ timestamp: string }>): Record<number, number> {
    const dailyCount: Record<number, number> = {}

    for (let i = 0; i < 7; i++) {
      dailyCount[i] = 0
    }

    searches.forEach((search) => {
      const day = new Date(search.timestamp).getDay()
      dailyCount[day]++
    })

    return dailyCount
  }

  private static extractQueryPatterns(
    searches: Array<{ query: string }>,
  ): Array<{ pattern: string; frequency: number; examples: string[] }> {
    const patterns: Record<string, { count: number; examples: Set<string> }> = {}

    searches.forEach((search) => {
      const query = search.query.toLowerCase().trim()
      if (query.length < 3) return

      // Extract patterns based on common words and structures
      const words = query.split(/\s+/)

      // Single word patterns
      words.forEach((word) => {
        if (word.length > 3) {
          const pattern = `*${word}*`
          if (!patterns[pattern]) {
            patterns[pattern] = { count: 0, examples: new Set() }
          }
          patterns[pattern].count++
          patterns[pattern].examples.add(query)
        }
      })

      // Two-word patterns
      for (let i = 0; i < words.length - 1; i++) {
        const pattern = `${words[i]} ${words[i + 1]}`
        if (pattern.length > 6) {
          if (!patterns[pattern]) {
            patterns[pattern] = { count: 0, examples: new Set() }
          }
          patterns[pattern].count++
          patterns[pattern].examples.add(query)
        }
      }
    })

    return Object.entries(patterns)
      .filter(([, data]) => data.count >= this.PATTERN_THRESHOLD)
      .map(([pattern, data]) => ({
        pattern,
        frequency: data.count,
        examples: Array.from(data.examples).slice(0, 3),
      }))
      .sort((a, b) => b.frequency - a.frequency)
  }

  private static identifyTopCategories(
    searches: Array<{ query: string }>,
  ): Array<{ category: string; frequency: number; confidence: number }> {
    const categories = {
      invoice: ["invoice", "bill", "billing", "payment", "charge", "due"],
      expense: ["expense", "cost", "spending", "receipt", "purchase", "buy"],
      client: ["client", "customer", "contact", "customer service", "account"],
      report: ["report", "analytics", "summary", "data", "statistics", "chart"],
      task: ["task", "todo", "action", "reminder", "schedule", "deadline"],
      meeting: ["meeting", "appointment", "call", "conference", "discussion"],
      project: ["project", "work", "assignment", "deliverable", "milestone"],
      contract: ["contract", "agreement", "terms", "legal", "document"],
    }

    const categoryScores: Record<string, number> = {}
    Object.keys(categories).forEach((cat) => {
      categoryScores[cat] = 0
    })

    searches.forEach((search) => {
      const query = search.query.toLowerCase()
      Object.entries(categories).forEach(([category, keywords]) => {
        keywords.forEach((keyword) => {
          if (query.includes(keyword)) {
            categoryScores[category]++
          }
        })
      })
    })

    const totalSearches = searches.length
    return Object.entries(categoryScores)
      .filter(([, score]) => score > 0)
      .map(([category, frequency]) => ({
        category: category.charAt(0).toUpperCase() + category.slice(1),
        frequency,
        confidence: Math.min(frequency / totalSearches, 1),
      }))
      .sort((a, b) => b.frequency - a.frequency)
  }

  private static calculateSuccessRate(searches: Array<{ clicked_result: boolean; results_count: number }>): number {
    if (searches.length === 0) return 0

    const successfulSearches = searches.filter((search) => search.clicked_result && search.results_count > 0).length

    return successfulSearches / searches.length
  }

  private static calculateAverageSessionDuration(searches: Array<{ session_duration: number }>): number {
    if (searches.length === 0) return 0

    const totalDuration = searches.reduce((sum, search) => sum + search.session_duration, 0)
    return totalDuration / searches.length
  }

  private static analyzeFilterUsage(searches: Array<{ filters: SearchFilters }>): Record<string, number> {
    const filterUsage: Record<string, number> = {
      dateRange: 0,
      messageRole: 0,
      minMessageCount: 0,
      hasSummary: 0,
    }

    searches.forEach((search) => {
      if (search.filters.dateRange) filterUsage.dateRange++
      if (search.filters.messageRole && search.filters.messageRole !== "all") filterUsage.messageRole++
      if (search.filters.minMessageCount) filterUsage.minMessageCount++
      if (search.filters.hasSummary) filterUsage.hasSummary++
    })

    return filterUsage
  }

  private static calculateSearchTrends(searches: Array<{ timestamp: string }>): Array<{ date: string; count: number }> {
    const dailyCounts: Record<string, number> = {}

    searches.forEach((search) => {
      const date = new Date(search.timestamp).toISOString().split("T")[0]
      dailyCounts[date] = (dailyCounts[date] || 0) + 1
    })

    return Object.entries(dailyCounts)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }

  private static findPeakHour(hourlyActivity: Record<number, number>): number {
    return Object.entries(hourlyActivity).sort(([, a], [, b]) => b - a)[0]?.[0]
      ? Number.parseInt(Object.entries(hourlyActivity).sort(([, a], [, b]) => b - a)[0][0])
      : 9
  }

  private static findPeakDay(dailyActivity: Record<number, number>): number {
    return Object.entries(dailyActivity).sort(([, a], [, b]) => b - a)[0]?.[0]
      ? Number.parseInt(Object.entries(dailyActivity).sort(([, a], [, b]) => b - a)[0][0])
      : 1
  }

  private static generateQueryRecommendations(behavior: UserSearchBehavior): SearchRecommendation[] {
    const recommendations: SearchRecommendation[] = []

    // Recommend exploring underused categories
    const allCategories = ["Invoice", "Expense", "Client", "Report", "Task", "Meeting", "Project"]
    const usedCategories = behavior.topCategories.map((cat) => cat.category)
    const unusedCategories = allCategories.filter((cat) => !usedCategories.includes(cat))

    unusedCategories.forEach((category) => {
      recommendations.push({
        type: "query",
        title: `Explore ${category} searches`,
        description: `You haven't searched for ${category.toLowerCase()} topics much. Try searching for "${category.toLowerCase()} management" or "recent ${category.toLowerCase()}s"`,
        suggestedQuery: `${category.toLowerCase()} management`,
        confidence: 0.7,
        potentialResults: Math.floor(Math.random() * 20) + 5,
        category: "discovery",
      })
    })

    // Recommend variations of successful patterns
    behavior.topQueryPatterns.forEach((pattern) => {
      if (pattern.frequency >= 3) {
        recommendations.push({
          type: "query",
          title: `Try variations of "${pattern.pattern}"`,
          description: `You've searched for "${pattern.pattern}" ${pattern.frequency} times. Try related searches for better insights.`,
          suggestedQuery: `${pattern.pattern} analysis`,
          confidence: 0.8,
          potentialResults: Math.floor(Math.random() * 15) + 8,
          category: "optimization",
        })
      }
    })

    return recommendations
  }

  private static generateFilterRecommendations(behavior: UserSearchBehavior): SearchRecommendation[] {
    const recommendations: SearchRecommendation[] = []

    // Recommend underused filters
    const totalSearches = behavior.totalSearches
    const filterUsage = behavior.filterUsageFrequency

    if (filterUsage.dateRange / totalSearches < 0.3) {
      recommendations.push({
        type: "filter",
        title: "Use date range filters",
        description:
          "You rarely use date filters. Try filtering by 'Last 7 days' or 'This month' to find recent conversations.",
        suggestedQuery: "",
        suggestedFilters: {
          dateRange: {
            start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            end: new Date().toISOString(),
          },
        },
        confidence: 0.75,
        potentialResults: Math.floor(totalSearches * 0.4),
        category: "efficiency",
      })
    }

    if (filterUsage.hasSummary / totalSearches < 0.2) {
      recommendations.push({
        type: "filter",
        title: "Search summarized conversations",
        description: "Try filtering for conversations with summaries to quickly find key discussions.",
        suggestedQuery: "",
        suggestedFilters: { hasSummary: true },
        confidence: 0.8,
        potentialResults: Math.floor(totalSearches * 0.3),
        category: "efficiency",
      })
    }

    return recommendations
  }

  private static generateTemplateRecommendations(behavior: UserSearchBehavior): SearchRecommendation[] {
    const recommendations: SearchRecommendation[] = []

    // Recommend creating templates for frequent patterns
    behavior.topQueryPatterns.forEach((pattern) => {
      if (pattern.frequency >= 5) {
        recommendations.push({
          type: "template",
          title: `Save "${pattern.pattern}" as a template`,
          description: `You've searched for "${pattern.pattern}" ${pattern.frequency} times. Save it as a template for quick access.`,
          suggestedQuery: pattern.pattern,
          confidence: 0.9,
          potentialResults: pattern.frequency,
          category: "productivity",
        })
      }
    })

    return recommendations
  }

  private static generateHabitRecommendations(behavior: UserSearchBehavior): SearchRecommendation[] {
    const recommendations: SearchRecommendation[] = []

    // Recommend optimal search times
    const peakHour = behavior.peakActivityHour
    const currentHour = new Date().getHours()

    if (Math.abs(currentHour - peakHour) > 3) {
      recommendations.push({
        type: "habit",
        title: "Search at your peak time",
        description: `You're most active at ${peakHour}:00. Consider doing important searches during your peak hours for better focus.`,
        suggestedQuery: "",
        confidence: 0.65,
        potentialResults: 0,
        category: "productivity",
      })
    }

    // Recommend improving success rate
    if (behavior.successRate < 0.7) {
      recommendations.push({
        type: "habit",
        title: "Improve search success rate",
        description: `Your search success rate is ${Math.round(behavior.successRate * 100)}%. Try using more specific keywords or filters.`,
        suggestedQuery: "",
        confidence: 0.8,
        potentialResults: 0,
        category: "optimization",
      })
    }

    // Recommend reducing session duration
    if (behavior.averageSessionDuration > 180) {
      // 3 minutes
      recommendations.push({
        type: "habit",
        title: "Speed up your searches",
        description: `Your average search takes ${Math.round(behavior.averageSessionDuration / 60)} minutes. Try using voice search or saved templates.`,
        suggestedQuery: "",
        confidence: 0.7,
        potentialResults: 0,
        category: "efficiency",
      })
    }

    return recommendations
  }
}
