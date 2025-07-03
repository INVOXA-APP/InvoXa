import { createClient } from "@/lib/supabase/server"

export interface ConversationSession {
  id: string
  title: string
  summary?: string
  auto_summary?: string
  created_at: string
  updated_at: string
  message_count: number
  summary_generated_at?: string
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
  conversationSummary: string
  keyPoints: string[]
  actionItems: string[]
  recentTopics: string[]
}

export async function getConversationSessions() {
  try {
    const supabase = createClient()
    const { data: sessions, error } = await supabase
      .from("conversation_sessions")
      .select("*")
      .order("updated_at", { ascending: false })

    if (error) {
      console.error("Error fetching conversation sessions:", error)
      return { sessions: [], error: error.message }
    }

    return { sessions: sessions || [], error: null }
  } catch (error) {
    console.error("Error in getConversationSessions:", error)
    return { sessions: [], error: "Failed to fetch conversation sessions" }
  }
}

export async function getConversationContext(sessionId: string) {
  try {
    const supabase = createClient()
    const { data: messages, error } = await supabase
      .from("conversation_messages")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Error fetching conversation context:", error)
      return { messages: [], error: error.message }
    }

    return { messages: messages || [], error: null }
  } catch (error) {
    console.error("Error in getConversationContext:", error)
    return { messages: [], error: "Failed to fetch conversation context" }
  }
}

export async function createConversationSession(title: string) {
  try {
    const supabase = createClient()
    const { data: session, error } = await supabase
      .from("conversation_sessions")
      .insert([
        {
          title,
          message_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Error creating conversation session:", error)
      return { session: null, error: error.message }
    }

    return { session, error: null }
  } catch (error) {
    console.error("Error in createConversationSession:", error)
    return { session: null, error: "Failed to create conversation session" }
  }
}

export async function addMessageToConversation(sessionId: string, role: "user" | "assistant", content: string) {
  try {
    const supabase = createClient()
    const { data: message, error } = await supabase
      .from("conversation_messages")
      .insert([
        {
          session_id: sessionId,
          user_id: "1", // Mock user ID
          role,
          content,
          metadata: {},
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Error adding message to conversation:", error)
      return { message: null, error: error.message }
    }

    // Update session message count
    await supabase
      .from("conversation_sessions")
      .update({
        message_count: supabase.raw("message_count + 1"),
        updated_at: new Date().toISOString(),
      })
      .eq("id", sessionId)

    return { message, error: null }
  } catch (error) {
    console.error("Error in addMessageToConversation:", error)
    return { message: null, error: "Failed to add message to conversation" }
  }
}

export async function searchConversations(query: string) {
  try {
    const supabase = createClient()
    const { data: sessions, error } = await supabase
      .from("conversation_sessions")
      .select("*")
      .or(`title.ilike.%${query}%,summary.ilike.%${query}%`)
      .order("updated_at", { ascending: false })

    if (error) {
      console.error("Error searching conversations:", error)
      return { sessions: [], error: error.message }
    }

    return { sessions: sessions || [], error: null }
  } catch (error) {
    console.error("Error in searchConversations:", error)
    return { sessions: [], error: "Failed to search conversations" }
  }
}

export async function deleteConversationSession(sessionId: string) {
  try {
    const supabase = createClient()

    // Delete messages first
    await supabase.from("conversation_messages").delete().eq("session_id", sessionId)

    // Delete session
    const { error } = await supabase.from("conversation_sessions").delete().eq("id", sessionId)

    if (error) {
      console.error("Error deleting conversation session:", error)
      return { success: false, error: error.message }
    }

    return { success: true, error: null }
  } catch (error) {
    console.error("Error in deleteConversationSession:", error)
    return { success: false, error: "Failed to delete conversation session" }
  }
}

export async function generateAIResponse(message: string, context?: ConversationContext, sessionId?: string) {
  // Mock AI response generation
  const responses = [
    `I understand you're asking about "${message}". Based on your INVOXA data, I can help you analyze your invoices, track expenses, and manage client relationships more effectively.`,
    `Great question about "${message}"! Let me help you with that. I have access to your business data and can provide insights on revenue trends, expense patterns, and client analytics.`,
    `Regarding "${message}", I can assist you with invoice management, expense tracking, and business analytics. Would you like me to show you specific data or help you with a particular task?`,
    `Thanks for asking about "${message}". As your AI assistant, I can help you optimize your business processes, analyze financial data, and provide actionable insights for better decision-making.`,
  ]

  return responses[Math.floor(Math.random() * responses.length)]
}
