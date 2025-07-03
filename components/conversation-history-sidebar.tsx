"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ConversationSearch } from "@/components/conversation-search"
import { Plus, Search, MessageSquare, Clock, Sparkles, Filter, Calendar, Hash } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getConversationSessions } from "@/app/dashboard/ai-assistant/actions"
import type { ConversationSession } from "@/types/conversation"

interface ConversationHistorySidebarProps {
  currentSessionId?: string
  onSessionSelect: (sessionId: string, messageId?: string) => void
  onNewSession: () => void
}

export function ConversationHistorySidebar({
  currentSessionId,
  onSessionSelect,
  onNewSession,
}: ConversationHistorySidebarProps) {
  const [sessions, setSessions] = useState<ConversationSession[]>([])
  const [filteredSessions, setFilteredSessions] = useState<ConversationSession[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [showSearch, setShowSearch] = useState(false)
  const [filterBy, setFilterBy] = useState<"all" | "summarized" | "recent">("all")
  const [groupBy, setGroupBy] = useState<"date" | "topic" | "none">("date")
  const { toast } = useToast()

  useEffect(() => {
    loadSessions()
  }, [])

  useEffect(() => {
    filterAndGroupSessions()
  }, [sessions, searchQuery, filterBy, groupBy])

  const loadSessions = async () => {
    try {
      setIsLoading(true)
      const sessionData = await getConversationSessions()
      setSessions(sessionData)
    } catch (error) {
      console.error("Error loading sessions:", error)
      toast({
        title: "Error",
        description: "Failed to load conversation history",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filterAndGroupSessions = () => {
    let filtered = sessions

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (session) =>
          session.title.toLowerCase().includes(query) ||
          session.summary?.toLowerCase().includes(query) ||
          session.auto_summary?.toLowerCase().includes(query),
      )
    }

    // Apply type filter
    switch (filterBy) {
      case "summarized":
        filtered = filtered.filter((session) => session.summary || session.auto_summary)
        break
      case "recent":
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
        filtered = filtered.filter((session) => new Date(session.updated_at) > oneDayAgo)
        break
    }

    setFilteredSessions(filtered)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return "Today"
    if (diffDays === 2) return "Yesterday"
    if (diffDays <= 7) return `${diffDays - 1} days ago`
    return date.toLocaleDateString()
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const groupSessionsByDate = (sessions: ConversationSession[]) => {
    const groups: { [key: string]: ConversationSession[] } = {}

    sessions.forEach((session) => {
      const dateKey = formatDate(session.updated_at)
      if (!groups[dateKey]) {
        groups[dateKey] = []
      }
      groups[dateKey].push(session)
    })

    return groups
  }

  const handleSearchResult = (sessionId: string, messageId?: string) => {
    onSessionSelect(sessionId, messageId)
    setShowSearch(false)
  }

  const renderSessionItem = (session: ConversationSession) => (
    <div
      key={session.id}
      onClick={() => onSessionSelect(session.id)}
      className={`p-3 rounded-lg cursor-pointer transition-all duration-200 border ${
        currentSessionId === session.id
          ? "bg-blue-50 border-blue-200 shadow-sm"
          : "hover:bg-gray-50 border-transparent hover:border-gray-200"
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="font-medium text-sm text-gray-900 line-clamp-2 flex-1">{session.title}</h4>
        <div className="flex items-center gap-1 flex-shrink-0">
          {(session.summary || session.auto_summary) && <Sparkles className="w-3 h-3 text-green-500" />}
          <Badge variant="secondary" className="text-xs">
            {session.message_count}
          </Badge>
        </div>
      </div>

      {(session.summary || session.auto_summary) && (
        <p className="text-xs text-gray-600 line-clamp-2 mb-2">{session.summary || session.auto_summary}</p>
      )}

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {formatTime(session.updated_at)}
        </span>
        <span className="flex items-center gap-1">
          <MessageSquare className="w-3 h-3" />
          {session.message_count} msgs
        </span>
      </div>
    </div>
  )

  if (showSearch) {
    return (
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900">Search Conversations</h2>
            <Button variant="ghost" size="sm" onClick={() => setShowSearch(false)} className="text-gray-500">
              Back
            </Button>
          </div>
        </div>
        <ConversationSearch onResultSelect={handleSearchResult} />
      </div>
    )
  }

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900">Conversations</h2>
          <Button onClick={onNewSession} size="sm" className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Search Input */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 text-sm"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowSearch(true)} className="flex-1 text-xs">
            <Search className="w-3 h-3 mr-1" />
            Advanced
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilterBy(filterBy === "all" ? "summarized" : "all")}
            className="text-xs"
          >
            <Filter className="w-3 h-3" />
          </Button>
        </div>

        {/* Filter Badges */}
        <div className="flex gap-1 mt-2">
          <Badge
            variant={filterBy === "all" ? "default" : "secondary"}
            className="text-xs cursor-pointer"
            onClick={() => setFilterBy("all")}
          >
            All
          </Badge>
          <Badge
            variant={filterBy === "summarized" ? "default" : "secondary"}
            className="text-xs cursor-pointer"
            onClick={() => setFilterBy("summarized")}
          >
            <Sparkles className="w-2 h-2 mr-1" />
            Summarized
          </Badge>
          <Badge
            variant={filterBy === "recent" ? "default" : "secondary"}
            className="text-xs cursor-pointer"
            onClick={() => setFilterBy("recent")}
          >
            <Clock className="w-2 h-2 mr-1" />
            Recent
          </Badge>
        </div>
      </div>

      {/* Sessions List */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500 mb-2">
                {searchQuery ? "No conversations found" : "No conversations yet"}
              </p>
              {!searchQuery && (
                <Button onClick={onNewSession} variant="outline" size="sm" className="text-xs bg-transparent">
                  Start your first conversation
                </Button>
              )}
            </div>
          ) : groupBy === "date" ? (
            <div className="space-y-4">
              {Object.entries(groupSessionsByDate(filteredSessions)).map(([dateGroup, groupSessions]) => (
                <div key={dateGroup}>
                  <div className="flex items-center gap-2 mb-2 sticky top-0 bg-white py-1">
                    <Calendar className="w-3 h-3 text-gray-400" />
                    <h3 className="text-xs font-medium text-gray-600 uppercase tracking-wide">{dateGroup}</h3>
                    <div className="flex-1 h-px bg-gray-200"></div>
                  </div>
                  <div className="space-y-2">{groupSessions.map(renderSessionItem)}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">{filteredSessions.map(renderSessionItem)}</div>
          )}
        </div>
      </ScrollArea>

      {/* Footer Stats */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Hash className="w-3 h-3" />
            {filteredSessions.length} conversations
          </span>
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            {filteredSessions.filter((s) => s.summary || s.auto_summary).length} summarized
          </span>
        </div>
      </div>
    </div>
  )
}
