import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import type { SearchSuggestion, QueryAnalysis, SearchContext } from "@/types/search-suggestions"

export class AISearchSuggestionEngine {
  private static readonly BUSINESS_KEYWORDS = [
    "invoice",
    "client",
    "payment",
    "expense",
    "report",
    "meeting",
    "project",
    "task",
    "budget",
    "contract",
    "proposal",
    "billing",
    "revenue",
    "cost",
    "deadline",
    "milestone",
    "deliverable",
    "stakeholder",
    "vendor",
    "supplier",
  ]

  private static readonly COMMON_TYPOS = {
    invioce: "invoice",
    clinet: "client",
    payement: "payment",
    expence: "expense",
    recieve: "receive",
    seperate: "separate",
    occured: "occurred",
    managment: "management",
    buisness: "business",
    finacial: "financial",
  }

  static async analyzeQuery(query: string, searchContext?: SearchContext): Promise<QueryAnalysis> {
    const startTime = Date.now()

    try {
      // Basic analysis
      const words = query
        .toLowerCase()
        .split(/\s+/)
        .filter((w) => w.length > 0)
      const hasBusinessTerms = words.some((word) =>
        this.BUSINESS_KEYWORDS.some((keyword) => word.includes(keyword) || keyword.includes(word)),
      )

      // Spell check
      const correctedWords = words.map((word) => this.COMMON_TYPOS[word] || word)
      const hasCorrections = correctedWords.some((word, index) => word !== words[index])
      const correctedQuery = hasCorrections ? correctedWords.join(" ") : null

      // AI-powered analysis
      const aiAnalysis = await this.getAIAnalysis(query, searchContext)

      const analysis: QueryAnalysis = {
        originalQuery: query,
        correctedQuery,
        queryType: this.determineQueryType(query),
        confidence: this.calculateConfidence(query, hasBusinessTerms),
        suggestedFilters: this.suggestFilters(query),
        semanticExpansions: aiAnalysis.expansions,
        relatedTopics: aiAnalysis.relatedTopics,
        processingTime: Date.now() - startTime,
      }

      return analysis
    } catch (error) {
      console.error("Error analyzing query:", error)
      return {
        originalQuery: query,
        correctedQuery: null,
        queryType: "general",
        confidence: 0.5,
        suggestedFilters: [],
        semanticExpansions: [],
        relatedTopics: [],
        processingTime: Date.now() - startTime,
      }
    }
  }

  static async generateSearchSuggestions(query: string, searchContext?: SearchContext): Promise<SearchSuggestion[]> {
    const analysis = await this.analyzeQuery(query, searchContext)
    const suggestions: SearchSuggestion[] = []

    // Spell correction suggestion
    if (analysis.correctedQuery && analysis.correctedQuery !== query) {
      suggestions.push({
        type: "correction",
        title: "Did you mean?",
        query: analysis.correctedQuery,
        description: `Corrected spelling: "${analysis.correctedQuery}"`,
        confidence: 0.9,
        icon: "spell-check",
      })
    }

    // Semantic expansions
    analysis.semanticExpansions.forEach((expansion, index) => {
      suggestions.push({
        type: "expansion",
        title: "Try this instead",
        query: expansion,
        description: `Expanded search: "${expansion}"`,
        confidence: 0.8 - index * 0.1,
        icon: "lightbulb",
      })
    })

    // Filter suggestions
    analysis.suggestedFilters.forEach((filter) => {
      suggestions.push({
        type: "filter",
        title: `Filter by ${filter.name}`,
        query: query,
        description: filter.description,
        confidence: 0.7,
        icon: "filter",
        filters: { [filter.key]: filter.value },
      })
    })

    // Related topic suggestions
    analysis.relatedTopics.forEach((topic, index) => {
      suggestions.push({
        type: "related",
        title: `Search for ${topic}`,
        query: topic,
        description: `Find conversations about ${topic}`,
        confidence: 0.6 - index * 0.05,
        icon: "search",
      })
    })

    // Context-based suggestions
    if (searchContext?.recentSearches) {
      const contextSuggestions = this.generateContextualSuggestions(query, searchContext)
      suggestions.push(...contextSuggestions)
    }

    // Sort by confidence and limit results
    return suggestions.sort((a, b) => b.confidence - a.confidence).slice(0, 8)
  }

  private static async getAIAnalysis(
    query: string,
    context?: SearchContext,
  ): Promise<{
    expansions: string[]
    relatedTopics: string[]
  }> {
    try {
      const contextInfo = context
        ? `
Recent searches: ${context.recentSearches?.join(", ") || "none"}
Popular topics: ${context.popularTopics?.join(", ") || "none"}
User preferences: ${context.userPreferences ? JSON.stringify(context.userPreferences) : "none"}
      `
        : ""

      const prompt = `Analyze this business search query and provide suggestions:

Query: "${query}"
Context: ${contextInfo}

Please provide:
1. 3-5 semantic expansions (alternative ways to search for the same concept)
2. 3-5 related business topics that might be relevant

Focus on business, invoicing, client management, expenses, and project management contexts.

Respond in JSON format:
{
  "expansions": ["expansion1", "expansion2", ...],
  "relatedTopics": ["topic1", "topic2", ...]
}`

      const { text } = await generateText({
        model: openai("gpt-4o"),
        prompt,
        maxTokens: 300,
        temperature: 0.7,
      })

      const parsed = JSON.parse(text)
      return {
        expansions: parsed.expansions || [],
        relatedTopics: parsed.relatedTopics || [],
      }
    } catch (error) {
      console.error("Error getting AI analysis:", error)
      return {
        expansions: [],
        relatedTopics: [],
      }
    }
  }

  private static determineQueryType(query: string): "invoice" | "client" | "expense" | "report" | "general" {
    const lowerQuery = query.toLowerCase()

    if (lowerQuery.includes("invoice") || lowerQuery.includes("bill")) return "invoice"
    if (lowerQuery.includes("client") || lowerQuery.includes("customer")) return "client"
    if (lowerQuery.includes("expense") || lowerQuery.includes("cost")) return "expense"
    if (lowerQuery.includes("report") || lowerQuery.includes("analytics")) return "report"

    return "general"
  }

  private static calculateConfidence(query: string, hasBusinessTerms: boolean): number {
    let confidence = 0.5

    // Boost confidence for business terms
    if (hasBusinessTerms) confidence += 0.3

    // Boost confidence for longer queries
    if (query.length > 10) confidence += 0.1
    if (query.length > 20) confidence += 0.1

    // Reduce confidence for very short queries
    if (query.length < 3) confidence -= 0.3

    return Math.min(1, Math.max(0, confidence))
  }

  private static suggestFilters(query: string): Array<{
    name: string
    key: string
    value: any
    description: string
  }> {
    const filters = []
    const lowerQuery = query.toLowerCase()

    if (lowerQuery.includes("recent") || lowerQuery.includes("today") || lowerQuery.includes("yesterday")) {
      filters.push({
        name: "Recent",
        key: "dateRange",
        value: {
          start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          end: new Date().toISOString(),
        },
        description: "Show results from the last 7 days",
      })
    }

    if (lowerQuery.includes("my") || lowerQuery.includes("i said") || lowerQuery.includes("i asked")) {
      filters.push({
        name: "My Messages",
        key: "messageRole",
        value: "user",
        description: "Show only your messages",
      })
    }

    if (lowerQuery.includes("aria") || lowerQuery.includes("assistant") || lowerQuery.includes("ai")) {
      filters.push({
        name: "AI Responses",
        key: "messageRole",
        value: "assistant",
        description: "Show only ARIA's responses",
      })
    }

    if (lowerQuery.includes("summary") || lowerQuery.includes("summarized")) {
      filters.push({
        name: "Summarized",
        key: "hasSummary",
        value: true,
        description: "Show only conversations with summaries",
      })
    }

    return filters
  }

  private static generateContextualSuggestions(query: string, context: SearchContext): SearchSuggestion[] {
    const suggestions: SearchSuggestion[] = []

    // Suggest combining with recent searches
    if (context.recentSearches && context.recentSearches.length > 0) {
      const recentSearch = context.recentSearches[0]
      if (recentSearch !== query && !query.includes(recentSearch)) {
        suggestions.push({
          type: "combination",
          title: "Combine with recent search",
          query: `${query} ${recentSearch}`,
          description: `Search for both "${query}" and "${recentSearch}"`,
          confidence: 0.6,
          icon: "link",
        })
      }
    }

    // Suggest popular topics
    if (context.popularTopics) {
      context.popularTopics.forEach((topic) => {
        if (!query.toLowerCase().includes(topic.toLowerCase())) {
          suggestions.push({
            type: "popular",
            title: `Popular: ${topic}`,
            query: topic,
            description: `This is a frequently searched topic`,
            confidence: 0.5,
            icon: "trending-up",
          })
        }
      })
    }

    return suggestions.slice(0, 2) // Limit contextual suggestions
  }

  static async improveQuery(originalQuery: string, userIntent?: string): Promise<string> {
    try {
      const prompt = `Improve this business search query to be more effective:

Original query: "${originalQuery}"
User intent: ${userIntent || "not specified"}

Rules:
1. Keep the core meaning intact
2. Add relevant business terms if missing
3. Fix obvious typos
4. Make it more specific if too vague
5. Suggest better keywords for business context

Return only the improved query, nothing else.`

      const { text } = await generateText({
        model: openai("gpt-4o"),
        prompt,
        maxTokens: 100,
        temperature: 0.3,
      })

      return text.trim().replace(/['"]/g, "")
    } catch (error) {
      console.error("Error improving query:", error)
      return originalQuery
    }
  }

  static trackSuggestionUsage(suggestion: SearchSuggestion, wasUsed: boolean): void {
    // Track suggestion effectiveness for future improvements
    const usage = {
      suggestion,
      wasUsed,
      timestamp: new Date().toISOString(),
    }

    // Store in localStorage for now (could be sent to analytics service)
    const existingUsage = JSON.parse(localStorage.getItem("search-suggestion-usage") || "[]")
    existingUsage.push(usage)

    // Keep only last 100 entries
    if (existingUsage.length > 100) {
      existingUsage.splice(0, existingUsage.length - 100)
    }

    localStorage.setItem("search-suggestion-usage", JSON.stringify(existingUsage))
  }
}
