"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Lightbulb,
  Search,
  Filter,
  BookmarkPlus,
  TrendingUp,
  Clock,
  Target,
  Zap,
  X,
  Sparkles,
  Brain,
  BarChart3,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  getPersonalizedRecommendations,
  dismissRecommendation,
  saveRecommendationAsTemplate,
} from "@/app/dashboard/ai-assistant/search-analytics-actions"
import type { SearchRecommendation } from "@/types/search-analytics"

interface PersonalizedSearchRecommendationsProps {
  onApplyRecommendation?: (recommendation: SearchRecommendation) => void
  className?: string
}

export function PersonalizedSearchRecommendations({
  onApplyRecommendation,
  className = "",
}: PersonalizedSearchRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<SearchRecommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set())
  const { toast } = useToast()

  useEffect(() => {
    loadRecommendations()
  }, [])

  const loadRecommendations = async () => {
    try {
      setLoading(true)
      const recs = await getPersonalizedRecommendations()
      setRecommendations(recs)
    } catch (error) {
      console.error("Error loading recommendations:", error)
      toast({
        title: "Error",
        description: "Failed to load personalized recommendations",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDismiss = async (recommendation: SearchRecommendation) => {
    try {
      const recommendationId = `${recommendation.type}-${recommendation.title.replace(/\s+/g, "-").toLowerCase()}`
      await dismissRecommendation(recommendation.type, recommendationId)
      setDismissedIds((prev) => new Set(prev).add(recommendationId))

      toast({
        title: "Recommendation Dismissed",
        description: "This recommendation won't be shown again",
      })
    } catch (error) {
      console.error("Error dismissing recommendation:", error)
      toast({
        title: "Error",
        description: "Failed to dismiss recommendation",
        variant: "destructive",
      })
    }
  }

  const handleSaveAsTemplate = async (recommendation: SearchRecommendation) => {
    if (!recommendation.suggestedQuery) return

    try {
      await saveRecommendationAsTemplate(
        recommendation.title,
        recommendation.suggestedQuery,
        recommendation.suggestedFilters || {},
      )

      toast({
        title: "Template Saved",
        description: "Recommendation saved as a search template",
      })
    } catch (error) {
      console.error("Error saving template:", error)
      toast({
        title: "Error",
        description: "Failed to save as template",
        variant: "destructive",
      })
    }
  }

  const handleApply = (recommendation: SearchRecommendation) => {
    onApplyRecommendation?.(recommendation)
    toast({
      title: "Recommendation Applied",
      description: "Search updated with recommended parameters",
    })
  }

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case "query":
        return <Search className="w-4 h-4" />
      case "filter":
        return <Filter className="w-4 h-4" />
      case "template":
        return <BookmarkPlus className="w-4 h-4" />
      case "habit":
        return <TrendingUp className="w-4 h-4" />
      default:
        return <Lightbulb className="w-4 h-4" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "discovery":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "optimization":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "efficiency":
        return "bg-green-100 text-green-800 border-green-200"
      case "productivity":
        return "bg-orange-100 text-orange-800 border-orange-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-green-600"
    if (confidence >= 0.6) return "text-yellow-600"
    return "text-red-600"
  }

  const visibleRecommendations = recommendations.filter((rec) => {
    const id = `${rec.type}-${rec.title.replace(/\s+/g, "-").toLowerCase()}`
    return !dismissedIds.has(id)
  })

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Personalized Recommendations
          </CardTitle>
          <CardDescription>Loading AI-powered search suggestions...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (visibleRecommendations.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Personalized Recommendations
          </CardTitle>
          <CardDescription>AI-powered suggestions based on your search patterns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No recommendations available yet</p>
            <p className="text-sm text-gray-400">Keep searching to get personalized AI recommendations!</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5" />
          Personalized Recommendations
          <Badge variant="secondary" className="ml-auto">
            {visibleRecommendations.length} suggestions
          </Badge>
        </CardTitle>
        <CardDescription>AI-powered suggestions based on your search patterns and behavior</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {visibleRecommendations.map((recommendation, index) => {
              const recommendationId = `${recommendation.type}-${recommendation.title.replace(/\s+/g, "-").toLowerCase()}`

              return (
                <div
                  key={recommendationId}
                  className="group relative border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm transition-all duration-200"
                >
                  {/* Dismiss Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDismiss(recommendation)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                  >
                    <X className="w-3 h-3" />
                  </Button>

                  {/* Header */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      {getRecommendationIcon(recommendation.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900 truncate">{recommendation.title}</h4>
                        <Badge variant="outline" className={`text-xs ${getCategoryColor(recommendation.category)}`}>
                          {recommendation.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">{recommendation.description}</p>
                    </div>
                  </div>

                  {/* Suggested Query/Filters */}
                  {recommendation.suggestedQuery && (
                    <div className="mb-3 p-2 bg-gray-50 rounded border">
                      <div className="flex items-center gap-2 mb-1">
                        <Search className="w-3 h-3 text-gray-500" />
                        <span className="text-xs font-medium text-gray-700">Suggested Query:</span>
                      </div>
                      <code className="text-sm text-blue-600 font-mono">{recommendation.suggestedQuery}</code>
                    </div>
                  )}

                  {/* Metrics */}
                  <div className="flex items-center gap-4 mb-3 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Target className="w-3 h-3" />
                      <span className={getConfidenceColor(recommendation.confidence)}>
                        {Math.round(recommendation.confidence * 100)}% confidence
                      </span>
                    </div>
                    {recommendation.potentialResults > 0 && (
                      <div className="flex items-center gap-1">
                        <BarChart3 className="w-3 h-3" />
                        <span>~{recommendation.potentialResults} results</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleApply(recommendation)}
                      className="flex items-center gap-1"
                      disabled={!recommendation.suggestedQuery && !recommendation.suggestedFilters}
                    >
                      <Zap className="w-3 h-3" />
                      Apply
                    </Button>

                    {recommendation.suggestedQuery && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSaveAsTemplate(recommendation)}
                        className="flex items-center gap-1"
                      >
                        <BookmarkPlus className="w-3 h-3" />
                        Save Template
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>

        {/* Footer */}
        <Separator className="my-4" />
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>Updated based on your recent activity</span>
          </div>
          <Button variant="ghost" size="sm" onClick={loadRecommendations} className="text-xs h-6">
            Refresh
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
