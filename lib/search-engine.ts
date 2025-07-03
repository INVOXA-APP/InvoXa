import type { SearchResult } from "@/types/conversation"

export interface ParsedQuery {
  terms: string[]
  phrases: string[]
  fieldQueries: Record<string, string>
  operators: string[]
}

export class ConversationSearchEngine {
  private static readonly SEARCH_OPERATORS = {
    AND: "AND",
    OR: "OR",
    NOT: "NOT",
  }

  static parseSearchQuery(query: string): ParsedQuery {
    const terms: string[] = []
    const phrases: string[] = []
    const fieldQueries: Record<string, string> = {}
    const operators: string[] = []

    // Extract quoted phrases
    const phraseRegex = /"([^"]+)"/g
    let match
    while ((match = phraseRegex.exec(query)) !== null) {
      phrases.push(match[1])
      query = query.replace(match[0], "")
    }

    // Extract field queries (field:value)
    const fieldRegex = /(\w+):(\S+)/g
    while ((match = fieldRegex.exec(query)) !== null) {
      fieldQueries[match[1]] = match[2]
      query = query.replace(match[0], "")
    }

    // Extract operators
    const operatorRegex = /\b(AND|OR|NOT)\b/gi
    while ((match = operatorRegex.exec(query)) !== null) {
      operators.push(match[1].toUpperCase())
      query = query.replace(match[0], "")
    }

    // Extract remaining terms
    const remainingTerms = query
      .split(/\s+/)
      .filter((term) => term.trim().length > 0)
      .map((term) => term.toLowerCase())

    terms.push(...remainingTerms)

    return { terms, phrases, fieldQueries, operators }
  }

  static buildSearchQuery(parsed: ParsedQuery): string {
    const queryParts: string[] = []

    // Add terms
    if (parsed.terms.length > 0) {
      queryParts.push(parsed.terms.join(" & "))
    }

    // Add phrases
    if (parsed.phrases.length > 0) {
      queryParts.push(...parsed.phrases.map((phrase) => `"${phrase}"`))
    }

    return queryParts.join(" & ")
  }

  static highlightSearchTerms(text: string, searchQuery: string): string {
    if (!searchQuery.trim()) return text

    const parsedQuery = this.parseSearchQuery(searchQuery)
    const allTerms = [...parsedQuery.terms, ...parsedQuery.phrases]

    let highlightedText = text
    allTerms.forEach((term) => {
      const regex = new RegExp(`(${this.escapeRegex(term)})`, "gi")
      highlightedText = highlightedText.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>')
    })

    return highlightedText
  }

  static extractSearchSnippet(text: string, searchQuery: string, maxLength = 150): string {
    if (!searchQuery.trim()) return text.substring(0, maxLength) + (text.length > maxLength ? "..." : "")

    const parsedQuery = this.parseSearchQuery(searchQuery)
    const allTerms = [...parsedQuery.terms, ...parsedQuery.phrases]

    // Find the first occurrence of any search term
    let firstMatchIndex = -1
    let matchedTerm = ""

    allTerms.forEach((term) => {
      const index = text.toLowerCase().indexOf(term.toLowerCase())
      if (index !== -1 && (firstMatchIndex === -1 || index < firstMatchIndex)) {
        firstMatchIndex = index
        matchedTerm = term
      }
    })

    if (firstMatchIndex === -1) {
      return text.substring(0, maxLength) + (text.length > maxLength ? "..." : "")
    }

    // Extract snippet around the match
    const snippetStart = Math.max(0, firstMatchIndex - 50)
    const snippetEnd = Math.min(text.length, firstMatchIndex + matchedTerm.length + 100)
    let snippet = text.substring(snippetStart, snippetEnd)

    // Add ellipsis if needed
    if (snippetStart > 0) snippet = "..." + snippet
    if (snippetEnd < text.length) snippet = snippet + "..."

    return snippet
  }

  static categorizeResults(results: SearchResult[]): {
    byType: Record<string, SearchResult[]>
    bySession: Record<string, SearchResult[]>
    byDate: Record<string, SearchResult[]>
  } {
    const byType: Record<string, SearchResult[]> = {
      session: [],
      message: [],
    }

    const bySession: Record<string, SearchResult[]> = {}
    const byDate: Record<string, SearchResult[]> = {}

    results.forEach((result) => {
      // By type
      byType[result.match_type].push(result)

      // By session
      if (!bySession[result.session_id]) {
        bySession[result.session_id] = []
      }
      bySession[result.session_id].push(result)

      // By date
      const date = new Date(result.session_created_at).toDateString()
      if (!byDate[date]) {
        byDate[date] = []
      }
      byDate[date].push(result)
    })

    return { byType, bySession, byDate }
  }

  static generateSearchStats(results: any[], searchTime: number) {
    const sessionMatches = results.filter((r) => r.match_type === "session").length
    const messageMatches = results.filter((r) => r.match_type === "message").length

    // Extract topics from results
    const topicCounts: Record<string, number> = {}
    results.forEach((result) => {
      const content = (
        result.session_title +
        " " +
        (result.message_content || "") +
        " " +
        (result.session_summary || "")
      ).toLowerCase()

      // Simple topic extraction
      if (content.includes("invoice")) topicCounts["Invoices"] = (topicCounts["Invoices"] || 0) + 1
      if (content.includes("expense")) topicCounts["Expenses"] = (topicCounts["Expenses"] || 0) + 1
      if (content.includes("client")) topicCounts["Clients"] = (topicCounts["Clients"] || 0) + 1
      if (content.includes("report")) topicCounts["Reports"] = (topicCounts["Reports"] || 0) + 1
      if (content.includes("payment")) topicCounts["Payments"] = (topicCounts["Payments"] || 0) + 1
    })

    const topTopics = Object.entries(topicCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([topic]) => topic)

    return {
      totalResults: results.length,
      sessionMatches,
      messageMatches,
      searchTime,
      topTopics,
    }
  }

  private static escapeRegex(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  }
}
