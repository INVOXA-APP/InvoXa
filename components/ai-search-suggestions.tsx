"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import {
  Lightbulb,
  SpellCheck,
  Filter,
  Search,
  Link,
  TrendingUp,
  Sparkles,
  Wand2,
  Brain,
  Clock,
  Target,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { AISearchSuggestionEngine } from "@/lib/ai-search-suggestions"
import type { SearchSuggestion, QueryAnalysis, SearchContext } from "@/types/search-suggestions"

interface AISearchSuggestionsProps {
  query: string
  onSuggestionSelect: (suggestion: SearchSuggestion) => void
  onQueryImprove: (improvedQuery: string) => void
  searchContext?: SearchContext
  isVisible: boolean
}

export function AISearchSuggestions({
  query,
  onSuggestionSelect,
  onQueryImprove,
  searchContext,
  isVisible,
}: AISearchSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [analysis, setAnalysis] = useState<QueryAnalysis | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [improvedQuery, setImprovedQuery] = useState<string | null>(null)
  const [isImproving, setIsImproving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (query.trim() && isVisible) {
      generateSuggestions()
    } else {
      setSuggestions([])
      setAnalysis(null)
      setImprovedQuery(null)
    }
  }, [query, isVisible, searchContext])

  const generateSuggestions = async () => {
    if (!query.trim()) return

    setIsLoading(true)
    try {
      const [suggestionsResult, analysisResult] = await Promise.all([
        AISearchSuggestionEngine.generateSearchSuggestions(query, searchContext),
        AISearchSuggestionEngine.analyzeQuery(query, searchContext),
      ])

      setSuggestions(suggestionsResult)
      setAnalysis(analysisResult)
    } catch (error) {
      console.error("Error generating suggestions:", error)
      toast({
        title: "Suggestion Error",
        description: "Failed to generate search suggestions",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    AISearchSuggestionEngine.trackSuggestionUsage(suggestion, true)
    onSuggestionSelect(suggestion)

    toast({
      title: "Suggestion Applied",
      description: `Applied: ${suggestion.title}`,
      duration: 2000,
    })
  }

  const handleImproveQuery = async () => {
    if (!query.trim()) return

    setIsImproving(true)
    try {
      const improved = await AISearchSuggestionEngine.improveQuery(query)
      setImprovedQuery(improved)

      if (improved !== query) {
        toast({
          title: "Query Improved",
          description: "AI has suggested an improved version of your search",
          duration: 3000,
        })
      }
    } catch (error) {
      console.error("Error improving query:", error)
      toast({
        title: "Improvement Error",
        description: "Failed to improve query",
        variant: "destructive",
      })
    } finally {
      setIsImproving(false)
    }
  }

  const getIconForSuggestion = (suggestion: SearchSuggestion) => {
    const iconMap = {
      "spell-check": SpellCheck,
      lightbulb: Lightbulb,
      filter: Filter,
      search: Search,
      link: Link,
      "trending-up": TrendingUp,
    }

    const IconComponent = iconMap[suggestion.icon as keyof typeof iconMap] || Sparkles
    return <IconComponent className="w-4 h-4" />
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-green-600 bg-green-50"
    if (confidence >= 0.6) return "text-yellow-600 bg-yellow-50"
    return "text-gray-600 bg-gray-50"
  }

  const getSuggestionTypeLabel = (type: string) => {
    const labels = {
      correction: "Spelling",
      expansion: "Alternative",
      filter: "Filter",
      related: "Related",
      combination: "Combined",
      popular: "Popular",
    }
    return labels[type as keyof typeof labels] || type
  }

  if (!isVisible || (!query.trim() && suggestions.length === 0)) {
    return null
  }

  return (
    <Card className="mt-4 border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-blue-600" />
            <h3 className="font-medium text-blue-900">AI Search Assistant</h3>
            {analysis && (
              <Badge variant="outline" className="text-xs">
                <Target className="w-3 h-3 mr-1" />
                {Math.round(analysis.confidence * 100)}% confidence
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {analysis && (
              <Badge variant="secondary" className="text-xs">
                <Clock className="w-3 h-3 mr-1" />
                {analysis.processingTime}ms
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleImproveQuery}
              disabled={isImproving || !query.trim()}
              className="text-xs bg-transparent"
            >
              <Wand2 className="w-3 h-3 mr-1" />
              {isImproving ? "Improving..." : "Improve Query"}
            </Button>
          </div>
        </div>

        {/* Query Analysis */}
        {analysis && (
          <div className="mb-4 p-3 bg-white rounded-lg border">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div>
                <span className="text-gray-500">Type:</span>
                <Badge variant="outline" className="ml-1 text-xs">
                  {analysis.queryType}
                </Badge>
              </div>
              <div>
                <span className="text-gray-500">Confidence:</span>
                <Badge className={`ml-1 text-xs ${getConfidenceColor(analysis.confidence)}`}>
                  {Math.round(analysis.confidence * 100)}%
                </Badge>
              </div>
              {analysis.correctedQuery && (
                <div className="col-span-2">
                  <span className="text-gray-500">Correction:</span>
                  <code className="ml-1 text-xs bg-yellow-100 px-1 rounded">{analysis.correctedQuery}</code>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Improved Query */}
        {improvedQuery && improvedQuery !== query && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Wand2 className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-900">Improved Query</span>
                </div>
                <code className="text-sm bg-white px-2 py-1 rounded border">{improvedQuery}</code>
              </div>
              <Button size="sm" onClick={() => onQueryImprove(improvedQuery)} className="ml-2">
                Use This
              </Button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-sm text-gray-600">Generating suggestions...</span>
          </div>
        )}

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-gray-700">Smart Suggestions ({suggestions.length})</span>
            </div>

            <ScrollArea className="max-h-64">
              <div className="space-y-2">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-white rounded-lg border hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer group"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <div className="mt-0.5 text-gray-400 group-hover:text-blue-500 transition-colors">
                        {getIconForSuggestion(suggestion)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-gray-900">{suggestion.title}</span>
                          <Badge variant="outline" className="text-xs">
                            {getSuggestionTypeLabel(suggestion.type)}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 mb-1">{suggestion.description}</p>
                        {suggestion.query !== query && (
                          <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">{suggestion.query}</code>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`text-xs ${getConfidenceColor(suggestion.confidence)}`}>
                        {Math.round(suggestion.confidence * 100)}%
                      </Badge>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <Search className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* No Suggestions */}
        {!isLoading && suggestions.length === 0 && query.trim() && (
          <div className="text-center py-4 text-gray-500">
            <Lightbulb className="w-6 h-6 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No suggestions available for this query</p>
            <p className="text-xs mt-1">Try a different search term or use the improve query feature</p>
          </div>
        )}

        {/* Tips */}
        {!query.trim() && (
          <div className="text-center py-4">
            <Brain className="w-8 h-8 mx-auto mb-2 text-blue-400" />
            <p className="text-sm text-gray-600 mb-2">AI-Powered Search Assistant</p>
            <div className="text-xs text-gray-500 space-y-1">
              <p>• Get spelling corrections and query improvements</p>
              <p>• Discover related topics and semantic expansions</p>
              <p>• Smart filter suggestions based on your query</p>
              <p>• Contextual recommendations from your search history</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
