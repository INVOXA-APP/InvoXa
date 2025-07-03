import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export interface VoiceSearchResult {
  originalTranscript: string
  optimizedQuery: string
  confidence: number
  businessTermsDetected: string[]
  suggestedFilters: Record<string, any>
  processingTime: number
}

export interface VoiceRecognitionConfig {
  language: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
}

export class VoiceSearchEngine {
  private recognition: SpeechRecognition | null = null
  private isListening = false
  private onResult: ((result: string, isFinal: boolean) => void) | null = null
  private onError: ((error: string) => void) | null = null
  private onStart: (() => void) | null = null
  private onEnd: (() => void) | null = null

  private static readonly BUSINESS_VOICE_PATTERNS = {
    // Common mispronunciations and variations
    invoice: ["invoice", "invoices", "in voice", "envoys", "invoicing"],
    client: ["client", "clients", "client's", "climb", "klein"],
    payment: ["payment", "payments", "pay mint", "pavement"],
    expense: ["expense", "expenses", "ex pence", "expanse"],
    report: ["report", "reports", "re port", "rapport"],
    meeting: ["meeting", "meetings", "meat ing", "meting"],
    project: ["project", "projects", "pro ject", "protect"],
    deadline: ["deadline", "dead line", "date line", "deadlines"],
    budget: ["budget", "budgets", "but get", "budgeting"],
    revenue: ["revenue", "revenues", "rev new", "revenu"],
  }

  private static readonly VOICE_COMMANDS = {
    "search for": "SEARCH_COMMAND",
    find: "SEARCH_COMMAND",
    "show me": "SEARCH_COMMAND",
    "look for": "SEARCH_COMMAND",
    get: "SEARCH_COMMAND",
    "filter by": "FILTER_COMMAND",
    "from last": "DATE_FILTER",
    "in the past": "DATE_FILTER",
    recent: "DATE_FILTER",
    today: "DATE_FILTER",
    yesterday: "DATE_FILTER",
    "this week": "DATE_FILTER",
    "this month": "DATE_FILTER",
  }

  constructor() {
    this.initializeSpeechRecognition()
  }

  private initializeSpeechRecognition(): boolean {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      console.warn("Speech recognition not supported")
      return false
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    this.recognition = new SpeechRecognition()

    const config: VoiceRecognitionConfig = {
      language: "en-US",
      continuous: false,
      interimResults: true,
      maxAlternatives: 3,
    }

    this.recognition.lang = config.language
    this.recognition.continuous = config.continuous
    this.recognition.interimResults = config.interimResults
    this.recognition.maxAlternatives = config.maxAlternatives

    this.recognition.onstart = () => {
      this.isListening = true
      this.onStart?.()
    }

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = ""
      let finalTranscript = ""

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript
        } else {
          interimTranscript += transcript
        }
      }

      if (finalTranscript) {
        this.onResult?.(finalTranscript, true)
      } else if (interimTranscript) {
        this.onResult?.(interimTranscript, false)
      }
    }

    this.recognition.onerror = (event) => {
      this.isListening = false
      this.onError?.(event.error || "Unknown speech recognition error")
    }

    this.recognition.onend = () => {
      this.isListening = false
      this.onEnd?.()
    }

    return true
  }

  public startListening(
    onResult: (result: string, isFinal: boolean) => void,
    onError: (error: string) => void,
    onStart?: () => void,
    onEnd?: () => void,
  ): boolean {
    if (!this.recognition) {
      onError("Speech recognition not available")
      return false
    }

    if (this.isListening) {
      this.stopListening()
    }

    this.onResult = onResult
    this.onError = onError
    this.onStart = onStart
    this.onEnd = onEnd

    try {
      this.recognition.start()
      return true
    } catch (error) {
      onError("Failed to start speech recognition")
      return false
    }
  }

  public stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop()
    }
  }

  public isCurrentlyListening(): boolean {
    return this.isListening
  }

  public static async optimizeVoiceQuery(transcript: string): Promise<VoiceSearchResult> {
    const startTime = Date.now()

    try {
      // Clean and normalize the transcript
      const cleanedTranscript = this.cleanTranscript(transcript)

      // Detect business terms
      const businessTerms = this.detectBusinessTerms(cleanedTranscript)

      // Generate AI-optimized query
      const optimizedQuery = await this.generateOptimizedQuery(cleanedTranscript, businessTerms)

      // Suggest filters based on voice input
      const suggestedFilters = this.extractFiltersFromVoice(cleanedTranscript)

      // Calculate confidence based on various factors
      const confidence = this.calculateVoiceConfidence(cleanedTranscript, businessTerms, optimizedQuery)

      return {
        originalTranscript: transcript,
        optimizedQuery,
        confidence,
        businessTermsDetected: businessTerms,
        suggestedFilters,
        processingTime: Date.now() - startTime,
      }
    } catch (error) {
      console.error("Error optimizing voice query:", error)
      return {
        originalTranscript: transcript,
        optimizedQuery: transcript, // Fallback to original
        confidence: 0.3,
        businessTermsDetected: [],
        suggestedFilters: {},
        processingTime: Date.now() - startTime,
      }
    }
  }

  private static cleanTranscript(transcript: string): string {
    return (
      transcript
        .toLowerCase()
        .trim()
        // Remove filler words
        .replace(/\b(um|uh|er|ah|like|you know)\b/g, "")
        // Fix common speech-to-text errors
        .replace(/\bshow me\b/g, "show")
        .replace(/\bfind me\b/g, "find")
        .replace(/\bget me\b/g, "get")
        // Normalize spacing
        .replace(/\s+/g, " ")
        .trim()
    )
  }

  private static detectBusinessTerms(transcript: string): string[] {
    const detectedTerms: string[] = []
    const words = transcript.toLowerCase().split(/\s+/)

    for (const [term, variations] of Object.entries(this.BUSINESS_VOICE_PATTERNS)) {
      for (const variation of variations) {
        if (transcript.includes(variation.toLowerCase())) {
          detectedTerms.push(term)
          break
        }
      }
    }

    return [...new Set(detectedTerms)] // Remove duplicates
  }

  private static async generateOptimizedQuery(transcript: string, businessTerms: string[]): Promise<string> {
    try {
      const prompt = `Convert this voice search transcript into an optimized business search query:

Voice input: "${transcript}"
Detected business terms: ${businessTerms.join(", ") || "none"}

Rules:
1. Fix speech-to-text errors and mispronunciations
2. Use proper business terminology
3. Make the query more specific and searchable
4. Remove filler words and commands like "show me", "find"
5. Focus on the actual search intent
6. Keep it concise but comprehensive

Examples:
- "show me all the invoices from last month" → "invoices last month"
- "find client information for john smith" → "client John Smith contact information"
- "get me expense reports from this week" → "expense reports this week"

Return only the optimized query, nothing else.`

      const { text } = await generateText({
        model: openai("gpt-4o"),
        prompt,
        maxTokens: 100,
        temperature: 0.3,
      })

      return text.trim().replace(/['"]/g, "")
    } catch (error) {
      console.error("Error generating optimized query:", error)
      // Fallback: basic cleanup
      return transcript
        .replace(/\b(show me|find me|get me|search for|look for)\b/gi, "")
        .replace(/\s+/g, " ")
        .trim()
    }
  }

  private static extractFiltersFromVoice(transcript: string): Record<string, any> {
    const filters: Record<string, any> = {}
    const lowerTranscript = transcript.toLowerCase()

    // Date filters
    if (lowerTranscript.includes("today")) {
      const today = new Date()
      filters.dateRange = {
        start: new Date(today.setHours(0, 0, 0, 0)).toISOString(),
        end: new Date(today.setHours(23, 59, 59, 999)).toISOString(),
      }
    } else if (lowerTranscript.includes("yesterday")) {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      filters.dateRange = {
        start: new Date(yesterday.setHours(0, 0, 0, 0)).toISOString(),
        end: new Date(yesterday.setHours(23, 59, 59, 999)).toISOString(),
      }
    } else if (lowerTranscript.includes("this week") || lowerTranscript.includes("past week")) {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      filters.dateRange = {
        start: weekAgo.toISOString(),
        end: new Date().toISOString(),
      }
    } else if (lowerTranscript.includes("this month") || lowerTranscript.includes("past month")) {
      const monthAgo = new Date()
      monthAgo.setMonth(monthAgo.getMonth() - 1)
      filters.dateRange = {
        start: monthAgo.toISOString(),
        end: new Date().toISOString(),
      }
    }

    // Message type filters
    if (lowerTranscript.includes("my messages") || lowerTranscript.includes("what i said")) {
      filters.messageRole = "user"
    } else if (lowerTranscript.includes("ai responses") || lowerTranscript.includes("aria said")) {
      filters.messageRole = "assistant"
    }

    // Content filters
    if (lowerTranscript.includes("with summary") || lowerTranscript.includes("summarized")) {
      filters.hasSummary = true
    }

    if (lowerTranscript.includes("action items") || lowerTranscript.includes("tasks")) {
      filters.hasActionItems = true
    }

    return filters
  }

  private static calculateVoiceConfidence(transcript: string, businessTerms: string[], optimizedQuery: string): number {
    let confidence = 0.5 // Base confidence

    // Boost for business terms detected
    confidence += businessTerms.length * 0.1

    // Boost for clear speech patterns
    if (transcript.length > 10 && transcript.length < 100) {
      confidence += 0.2
    }

    // Boost if optimization made significant improvements
    if (optimizedQuery.length < transcript.length * 0.8) {
      confidence += 0.1
    }

    // Reduce for very short or very long transcripts
    if (transcript.length < 5) {
      confidence -= 0.3
    } else if (transcript.length > 150) {
      confidence -= 0.2
    }

    // Boost for recognized voice commands
    for (const command of Object.keys(this.VOICE_COMMANDS)) {
      if (transcript.toLowerCase().includes(command)) {
        confidence += 0.1
        break
      }
    }

    return Math.min(1, Math.max(0, confidence))
  }

  public static getSupportedLanguages(): string[] {
    return [
      "en-US", // English (US)
      "en-GB", // English (UK)
      "en-AU", // English (Australia)
      "en-CA", // English (Canada)
      "es-ES", // Spanish (Spain)
      "es-MX", // Spanish (Mexico)
      "fr-FR", // French (France)
      "de-DE", // German (Germany)
      "it-IT", // Italian (Italy)
      "pt-BR", // Portuguese (Brazil)
      "ja-JP", // Japanese (Japan)
      "ko-KR", // Korean (South Korea)
      "zh-CN", // Chinese (Simplified)
      "zh-TW", // Chinese (Traditional)
    ]
  }

  public static isVoiceSearchSupported(): boolean {
    return "webkitSpeechRecognition" in window || "SpeechRecognition" in window
  }
}

// Type definitions for Speech Recognition API
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition
    webkitSpeechRecognition: new () => SpeechRecognition
  }
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognitionResultList {
  length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  length: number
  item(index: number): SpeechRecognitionAlternative
  [index: number]: SpeechRecognitionAlternative
  isFinal: boolean
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  maxAlternatives: number
  start(): void
  stop(): void
  abort(): void
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null
  onend: ((this: SpeechRecognition, ev: Event) => any) | null
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null
  onerror: ((this: SpeechRecognition, ev: any) => any) | null
}
