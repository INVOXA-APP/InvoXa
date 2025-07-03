"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Bot,
  Send,
  Plus,
  Search,
  MessageSquare,
  Clock,
  User,
  Sparkles,
  History,
  Filter,
  MoreVertical,
  Trash2,
} from "lucide-react"
import {
  getConversationSessions,
  getConversationContext,
  createConversationSession,
  addMessageToConversation,
  searchConversations,
  deleteConversationSession,
} from "./actions"
import { formatDistanceToNow } from "date-fns"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface ConversationSession {
  id: string
  title: string
  summary?: string
  created_at: string
  updated_at: string
  message_count: number
}

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  created_at: string
}

export default function AIAssistantPage() {
  const [sessions, setSessions] = useState<ConversationSession[]>([])
  const [currentSession, setCurrentSession] = useState<ConversationSession | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    loadSessions()
  }, [])

  const loadSessions = async () => {
    const { sessions: fetchedSessions, error } = await getConversationSessions()
    if (!error) {
      setSessions(fetchedSessions)
      if (fetchedSessions.length > 0 && !currentSession) {
        setCurrentSession(fetchedSessions[0])
        loadConversationContext(fetchedSessions[0].id)
      }
    }
  }

  const loadConversationContext = async (sessionId: string) => {
    const { messages: fetchedMessages, error } = await getConversationContext(sessionId)
    if (!error) {
      setMessages(fetchedMessages)
    }
  }

  const handleNewConversation = async () => {
    const title = `New Conversation ${new Date().toLocaleString()}`
    const { session, error } = await createConversationSession(title)
    if (!error && session) {
      setSessions((prev) => [session, ...prev])
      setCurrentSession(session)
      setMessages([])
    }
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !currentSession || isLoading) return

    const userMessage = inputMessage.trim()
    setInputMessage("")
    setIsLoading(true)

    // Add user message
    const { message: userMsg, error: userError } = await addMessageToConversation(
      currentSession.id,
      "user",
      userMessage,
    )

    if (!userError && userMsg) {
      setMessages((prev) => [...prev, userMsg])

      // Simulate AI response
      setTimeout(async () => {
        const aiResponse = generateAIResponse(userMessage)
        const { message: aiMsg, error: aiError } = await addMessageToConversation(
          currentSession.id,
          "assistant",
          aiResponse,
        )

        if (!aiError && aiMsg) {
          setMessages((prev) => [...prev, aiMsg])
        }
        setIsLoading(false)
      }, 1000)
    } else {
      setIsLoading(false)
    }
  }

  const generateAIResponse = (userMessage: string): string => {
    const responses = [
      "I understand you're asking about " +
        userMessage.toLowerCase() +
        ". Let me help you with that. Based on your invoice management needs, I can assist with creating, tracking, and analyzing your financial data.",
      "That's a great question about " +
        userMessage.toLowerCase() +
        ". In the context of invoice management, I recommend checking your dashboard for the latest insights and reports.",
      "I can help you with " +
        userMessage.toLowerCase() +
        ". For invoice-related tasks, you might want to explore the Invoices section where you can create new invoices, track payments, and manage client information.",
      "Regarding " +
        userMessage.toLowerCase() +
        ", I suggest looking at your expense tracking and client management features. These tools can provide valuable insights for your business operations.",
    ]

    return responses[Math.floor(Math.random() * responses.length)]
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadSessions()
      return
    }

    setIsSearching(true)
    const { sessions: searchResults, error } = await searchConversations(searchQuery)
    if (!error) {
      setSessions(searchResults)
    }
    setIsSearching(false)
  }

  const handleDeleteSession = async (sessionId: string) => {
    const { success } = await deleteConversationSession(sessionId)
    if (success) {
      setSessions((prev) => prev.filter((s) => s.id !== sessionId))
      if (currentSession?.id === sessionId) {
        setCurrentSession(null)
        setMessages([])
      }
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6">
      {/* Sidebar - Conversation History */}
      <div className="w-80 flex flex-col">
        <Card className="flex-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <History className="h-5 w-5" />
                Conversations
              </CardTitle>
              <Button onClick={handleNewConversation} size="sm" className="h-8 w-8 p-0">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-8"
                />
              </div>
              <Button onClick={handleSearch} size="sm" disabled={isSearching}>
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-16rem)]">
              <div className="space-y-2 p-4">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className={`group relative p-3 rounded-lg border cursor-pointer transition-colors hover:bg-accent ${
                      currentSession?.id === session.id ? "bg-accent border-primary" : ""
                    }`}
                    onClick={() => {
                      setCurrentSession(session)
                      loadConversationContext(session.id)
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{session.title}</h4>
                        {session.summary && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{session.summary}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary" className="text-xs">
                            <MessageSquare className="h-3 w-3 mr-1" />
                            {session.message_count}
                          </Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(session.updated_at), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteSession(session.id)
                            }}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
                {sessions.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm">No conversations yet</p>
                    <p className="text-xs">Start a new conversation to get help</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <Card className="flex-1 flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">AI Assistant</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {currentSession ? currentSession.title : "Select a conversation or start a new one"}
                </p>
              </div>
              <div className="ml-auto">
                <Badge variant="secondary" className="gap-1">
                  <Sparkles className="h-3 w-3" />
                  Smart
                </Badge>
              </div>
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="flex-1 flex flex-col p-0">
            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.length === 0 && currentSession && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm">Start a conversation</p>
                    <p className="text-xs">Ask me anything about your invoices, clients, or business insights</p>
                  </div>
                )}
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {message.role === "assistant" && (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`max-w-[70%] rounded-lg px-3 py-2 ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    {message.role === "user" && (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-3 justify-start">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-muted rounded-lg px-3 py-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-current rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-current rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="border-t p-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Ask me anything about your invoices, clients, or business..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={!currentSession || isLoading}
                  className="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || !currentSession || isLoading}
                  size="sm"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              {!currentSession && (
                <p className="text-xs text-muted-foreground mt-2">
                  Start a new conversation to begin chatting with the AI assistant
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
