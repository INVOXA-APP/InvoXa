import type { Conversation } from "@/types/conversation"

export interface ConversationSummary {
  id: string
  conversationId: string
  summary: string
  keyPoints: string[]
  topics: string[]
  sentiment: "positive" | "negative" | "neutral"
  wordCount: number
  createdAt: Date
  updatedAt: Date
}

export interface SummaryOptions {
  maxLength?: number
  includeKeyPoints?: boolean
  includeTopics?: boolean
  includeSentiment?: boolean
}

export class ConversationSummarizer {
  private static instance: ConversationSummarizer

  private constructor() {}

  public static getInstance(): ConversationSummarizer {
    if (!ConversationSummarizer.instance) {
      ConversationSummarizer.instance = new ConversationSummarizer()
    }
    return ConversationSummarizer.instance
  }

  public async summarizeConversation(
    conversation: Conversation,
    options: SummaryOptions = {},
  ): Promise<ConversationSummary> {
    const { maxLength = 200, includeKeyPoints = true, includeTopics = true, includeSentiment = true } = options

    try {
      // Extract text content from conversation messages
      const textContent = conversation.messages.map((msg) => msg.content).join(" ")

      // Generate summary using simple text processing
      const summary = this.generateSummary(textContent, maxLength)

      // Extract key points
      const keyPoints = includeKeyPoints ? this.extractKeyPoints(textContent) : []

      // Extract topics
      const topics = includeTopics ? this.extractTopics(textContent) : []

      // Analyze sentiment
      const sentiment = includeSentiment ? this.analyzeSentiment(textContent) : "neutral"

      return {
        id: `summary_${conversation.id}_${Date.now()}`,
        conversationId: conversation.id,
        summary,
        keyPoints,
        topics,
        sentiment,
        wordCount: textContent.split(/\s+/).length,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    } catch (error) {
      console.error("Error summarizing conversation:", error)
      throw new Error("Failed to summarize conversation")
    }
  }

  private generateSummary(text: string, maxLength: number): string {
    // Simple extractive summarization
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0)

    if (sentences.length === 0) {
      return "No content to summarize"
    }

    // Score sentences based on word frequency and position
    const wordFreq = this.calculateWordFrequency(text)
    const scoredSentences = sentences.map((sentence, index) => {
      const words = sentence.toLowerCase().split(/\s+/)
      const score = words.reduce((sum, word) => sum + (wordFreq[word] || 0), 0) / words.length
      const positionScore = 1 - (index / sentences.length) * 0.3 // Earlier sentences get slight boost

      return {
        sentence: sentence.trim(),
        score: score + positionScore,
        length: sentence.length,
      }
    })

    // Sort by score and select top sentences within length limit
    scoredSentences.sort((a, b) => b.score - a.score)

    let summary = ""
    let currentLength = 0

    for (const item of scoredSentences) {
      if (currentLength + item.length <= maxLength) {
        summary += (summary ? ". " : "") + item.sentence
        currentLength += item.length + 2
      }
    }

    return summary || sentences[0]?.trim() || "No summary available"
  }

  private extractKeyPoints(text: string): string[] {
    // Simple keyword extraction based on frequency and importance
    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length > 3)

    const stopWords = new Set([
      "this",
      "that",
      "with",
      "have",
      "will",
      "from",
      "they",
      "know",
      "want",
      "been",
      "good",
      "much",
      "some",
      "time",
      "very",
      "when",
      "come",
      "here",
      "just",
      "like",
      "long",
      "make",
      "many",
      "over",
      "such",
      "take",
      "than",
      "them",
      "well",
      "were",
      "what",
    ])

    const wordFreq = words
      .filter((word) => !stopWords.has(word))
      .reduce((freq: Record<string, number>, word) => {
        freq[word] = (freq[word] || 0) + 1
        return freq
      }, {})

    // Get top keywords
    const keyWords = Object.entries(wordFreq)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([word]) => word)

    return keyWords.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
  }

  private extractTopics(text: string): string[] {
    // Simple topic extraction based on common patterns
    const topics: string[] = []
    const lowerText = text.toLowerCase()

    // Business topics
    if (lowerText.includes("invoice") || lowerText.includes("payment") || lowerText.includes("billing")) {
      topics.push("Billing & Payments")
    }
    if (lowerText.includes("client") || lowerText.includes("customer") || lowerText.includes("service")) {
      topics.push("Customer Service")
    }
    if (lowerText.includes("report") || lowerText.includes("analytics") || lowerText.includes("data")) {
      topics.push("Reports & Analytics")
    }
    if (lowerText.includes("expense") || lowerText.includes("cost") || lowerText.includes("budget")) {
      topics.push("Expenses & Budget")
    }
    if (lowerText.includes("user") || lowerText.includes("account") || lowerText.includes("profile")) {
      topics.push("User Management")
    }

    return topics.length > 0 ? topics : ["General Discussion"]
  }

  private analyzeSentiment(text: string): "positive" | "negative" | "neutral" {
    const positiveWords = [
      "good",
      "great",
      "excellent",
      "amazing",
      "wonderful",
      "fantastic",
      "perfect",
      "love",
      "like",
      "happy",
      "pleased",
      "satisfied",
      "success",
    ]

    const negativeWords = [
      "bad",
      "terrible",
      "awful",
      "horrible",
      "hate",
      "dislike",
      "angry",
      "frustrated",
      "disappointed",
      "problem",
      "issue",
      "error",
      "fail",
    ]

    const words = text.toLowerCase().split(/\s+/)
    let positiveCount = 0
    let negativeCount = 0

    words.forEach((word) => {
      if (positiveWords.includes(word)) positiveCount++
      if (negativeWords.includes(word)) negativeCount++
    })

    if (positiveCount > negativeCount) return "positive"
    if (negativeCount > positiveCount) return "negative"
    return "neutral"
  }

  private calculateWordFrequency(text: string): Record<string, number> {
    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length > 2)

    return words.reduce((freq: Record<string, number>, word) => {
      freq[word] = (freq[word] || 0) + 1
      return freq
    }, {})
  }

  public async batchSummarize(
    conversations: Conversation[],
    options: SummaryOptions = {},
  ): Promise<ConversationSummary[]> {
    const summaries: ConversationSummary[] = []

    for (const conversation of conversations) {
      try {
        const summary = await this.summarizeConversation(conversation, options)
        summaries.push(summary)
      } catch (error) {
        console.error(`Failed to summarize conversation ${conversation.id}:`, error)
      }
    }

    return summaries
  }

  public exportSummary(summary: ConversationSummary, format: "json" | "text" = "json"): string {
    if (format === "text") {
      return `
Conversation Summary
===================
ID: ${summary.conversationId}
Created: ${summary.createdAt.toLocaleDateString()}
Sentiment: ${summary.sentiment}
Word Count: ${summary.wordCount}

Summary:
${summary.summary}

Key Points:
${summary.keyPoints.map((point) => `• ${point}`).join("\n")}

Topics:
${summary.topics.map((topic) => `• ${topic}`).join("\n")}
      `.trim()
    }

    return JSON.stringify(summary, null, 2)
  }
}

export const conversationSummarizer = ConversationSummarizer.getInstance()
