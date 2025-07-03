"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SavedSearchManager } from "@/components/saved-search-manager"
import { SearchTemplateBrowser } from "@/components/search-template-browser"
import { VoiceSearchInput } from "@/components/voice-search-input"
import { AISearchSuggestions } from "@/components/ai-search-suggestions"
import {
  Search,
  CalendarIcon,
  Filter,
  Clock,
  MessageSquare,
  User,
  Bot,
  Sparkles,
  TrendingUp,
  Bookmark,
  LayoutTemplateIcon as Template,
  Mic,
  Target,
  ArrowRight,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { searchConversations } from "@/app/dashboard/ai-assistant/actions"
import type { SearchResult, SearchFilters, SearchStats } from "@/types/conversation"
import { format } from "date-fns"

interface ConversationSearchProps {
  onResultSelect: (sessionId: string, messageId?: string) => void
}

export function ConversationSearch({ onResultSelect }: ConversationSearchProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [stats, setStats] = useState<SearchStats | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [filters, setFilters] = useState<SearchFilters>({})
  const [activeTab, setActiveTab] = useState("search")
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [dateRange, setDateRange] = useState<{ start?: Date; end?: Date }>({})
  const [voiceQuery, setVoiceQuery] = useState("")

  const searchTimeoutRef = useRef<NodeJS.Timeout>()
  const { toast } = useToast()

  useEffect(() => {
    if (voiceQuery) {
      setQuery(voiceQuery)
      handleSearch(voiceQuery)
    }
  }, [voiceQuery])

  useEffect(() => {
    // Debounced search
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (query.trim()) {
      searchTimeoutRef.current = setTimeout(() => {
        handleSearch()
      }, 300)
    } else {
      setResults([])
      setStats(null)
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [query, filters])

  const handleSearch = async (searchQuery?: string) => {
    const searchTerm = searchQuery || query.trim()
    if (!searchTerm) return

    setIsSearching(true)
    try {
      const searchFilters: SearchFilters = {
        ...filters,
        dateRange:
          dateRange.start && dateRange.end
            ? {
                start: dateRange.start.toISOString(),
                end: dateRange.end.toISOString(),
              }
            : undefined,
      }

      const { results: searchResults, stats: searchStats } = await searchConversations(searchTerm, searchFilters)
      setResults(searchResults)
      setStats(searchStats)

      if (searchResults.length === 0) {
        toast({
          title: "No Results Found",
          description: `No conversations found for "${searchTerm}"`,
        })
      }
    } catch (error) {
      console.error("Search error:", error)
      toast({
        title: "Search Error",
        description: "Failed to search conversations. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSearching(false)
    }
  }

  const handleResultClick = (result: SearchResult) => {
    onResultSelect(result.session_id, result.message_id)
  }

  const handleTemplateSelect = (template: any) => {
    setQuery(template.query_template)
    setActiveTab("search")
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const highlightText = (text: string, searchQuery: string) => {
    if (!searchQuery.trim()) return text

    const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi")
    const parts = text.split(regex)

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      ),
    )
  }

  return (
    <div className="flex flex-col h-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-4 mb-4">
          <TabsTrigger value="search" className="text-xs">
            <Search className="w-3 h-3 mr-1" />
            Search
          </TabsTrigger>
          <TabsTrigger value="saved" className="text-xs">
            <Bookmark className="w-3 h-3 mr-1" />
            Saved
          </TabsTrigger>
          <TabsTrigger value="templates" className="text-xs">
            <Template className="w-3 h-3 mr-1" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="voice" className="text-xs">
            <Mic className="w-3 h-3 mr-1" />
            Voice
          </TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="flex-1 flex flex-col space-y-4">
          {/* Search Input */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search conversations, messages, topics..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch()
                  }
                }}
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                </div>
              )}
            </div>

            {/* AI Suggestions */}
            <AISearchSuggestions
              currentQuery={query}
              onSuggestionSelect={(suggestion) => {
                setQuery(suggestion)
                handleSearch(suggestion)
              }}
            />

            {/* Quick Filters */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="text-xs"
              >
                <Filter className="w-3 h-3 mr-1" />
                Filters
              </Button>

              <Badge
                variant={filters.messageRole === "user" ? "default" : "secondary"}
                className="text-xs cursor-pointer"
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    messageRole: prev.messageRole === "user" ? "all" : "user",
                  }))
                }
              >
                <User className="w-2 h-2 mr-1" />
                My Messages
              </Badge>

              <Badge
                variant={filters.messageRole === "assistant" ? "default" : "secondary"}
                className="text-xs cursor-pointer"
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    messageRole: prev.messageRole === "assistant" ? "all" : "assistant",
                  }))
                }
              >
                <Bot className="w-2 h-2 mr-1" />
                AI Responses
              </Badge>

              <Badge
                variant={filters.hasSummary ? "default" : "secondary"}
                className="text-xs cursor-pointer"
                onClick={() => setFilters((prev) => ({ ...prev, hasSummary: !prev.hasSummary }))}
              >
                <Sparkles className="w-2 h-2 mr-1" />
                Summarized
              </Badge>
            </div>

            {/* Advanced Filters */}
            {showAdvancedFilters && (
              <div className="p-3 border rounded-lg bg-gray-50 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">Message Role</label>
                    <Select
                      value={filters.messageRole || "all"}
                      onValueChange={(value) =>
                        setFilters((prev) => ({
                          ...prev,
                          messageRole: value as "all" | "user" | "assistant",
                        }))
                      }
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Messages</SelectItem>
                        <SelectItem value="user">My Messages</SelectItem>
                        <SelectItem value="assistant">AI Responses</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">Min Messages</label>
                    <Select
                      value={filters.minMessageCount?.toString() || "0"}
                      onValueChange={(value) =>
                        setFilters((prev) => ({
                          ...prev,
                          minMessageCount: Number.parseInt(value) || undefined,
                        }))
                      }
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Any Length</SelectItem>
                        <SelectItem value="5">5+ Messages</SelectItem>
                        <SelectItem value="10">10+ Messages</SelectItem>
                        <SelectItem value="20">20+ Messages</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Date Range</label>
                  <div className="flex gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="text-xs flex-1 bg-transparent">
                          <CalendarIcon className="w-3 h-3 mr-1" />
                          {dateRange.start ? format(dateRange.start, "MMM dd") : "Start Date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={dateRange.start}
                          onSelect={(date) => setDateRange((prev) => ({ ...prev, start: date }))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>

                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="text-xs flex-1 bg-transparent">
                          <CalendarIcon className="w-3 h-3 mr-1" />
                          {dateRange.end ? format(dateRange.end, "MMM dd") : "End Date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={dateRange.end}
                          onSelect={(date) => setDateRange((prev) => ({ ...prev, end: date }))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Search Stats */}
          {stats && (
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1 text-blue-700">
                  <Target className="w-3 h-3" />
                  {stats.totalResults} results
                </span>
                <span className="flex items-center gap-1 text-blue-600">
                  <MessageSquare className="w-3 h-3" />
                  {stats.sessionMatches} conversations
                </span>
                <span className="flex items-center gap-1 text-blue-600">
                  <Clock className="w-3 h-3" />
                  {stats.searchTime}ms
                </span>
              </div>
              {stats.topTopics.length > 0 && (
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-green-600" />
                  <div className="flex gap-1">
                    {stats.topTopics.slice(0, 2).map((topic) => (
                      <Badge key={topic} variant="secondary" className="text-xs">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Search Results */}
          <ScrollArea className="flex-1">
            <div className="space-y-3">
              {results.map((result) => (
                <div
                  key={`${result.session_id}-${result.message_id || "session"}`}
                  onClick={() => handleResultClick(result)}
                  className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={result.match_type === "session" ? "default" : "secondary"} className="text-xs">
                        {result.match_type === "session" ? (
                          <>
                            <MessageSquare className="w-2 h-2 mr-1" />
                            Session
                          </>
                        ) : (
                          <>
                            {result.message_role === "user" ? (
                              <User className="w-2 h-2 mr-1" />
                            ) : (
                              <Bot className="w-2 h-2 mr-1" />
                            )}
                            Message
                          </>
                        )}
                      </Badge>
                      <h4 className="font-medium text-sm text-gray-900">{result.session_title}</h4>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      {formatDate(result.session_created_at)}
                    </div>
                  </div>

                  {result.match_type === "message" && result.message_content && (
                    <div className="mb-2">
                      <p className="text-sm text-gray-700 line-clamp-3">
                        {highlightText(result.message_content, query)}
                      </p>
                    </div>
                  )}

                  {(result.session_summary || result.session_auto_summary) && (
                    <div className="mb-2">
                      <p className="text-xs text-gray-600 line-clamp-2">
                        <Sparkles className="w-3 h-3 inline mr-1" />
                        {result.session_summary || result.session_auto_summary}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {result.session_message_count} messages
                      </span>
                      {result.match_type === "message" && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTime(result.message_created_at!)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      <span>Rank: {result.search_rank.toFixed(1)}</span>
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </div>
                  </div>
                </div>
              ))}

              {results.length === 0 && query && !isSearching && (
                <div className="text-center py-8">
                  <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 mb-2">No results found</p>
                  <p className="text-xs text-gray-400">Try different keywords or adjust your filters</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="saved" className="flex-1">
          <SavedSearchManager
            onSearchSelect={(search) => {
              setQuery(search.query)
              setActiveTab("search")
              handleSearch(search.query)
            }}
          />
        </TabsContent>

        <TabsContent value="templates" className="flex-1">
          <SearchTemplateBrowser onTemplateSelect={handleTemplateSelect} />
        </TabsContent>

        <TabsContent value="voice" className="flex-1">
          <VoiceSearchInput onVoiceQuery={setVoiceQuery} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
