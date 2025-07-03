"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  Users,
  Search,
  LayoutTemplateIcon as Template,
  Lightbulb,
  TrendingUp,
  Award,
  Share2,
  ThumbsUp,
  ThumbsDown,
  Clock,
  Target,
  Star,
  Plus,
  Eye,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { SharePatternDialog } from "@/components/share-pattern-dialog"
import { CreateTemplateDialog } from "@/components/create-template-dialog"
import {
  getTeamSearchPatterns,
  getTeamSearchTemplates,
  getTeamCollaborationStats,
  getTeamSearchAnalytics,
  getTeamRecommendations,
  voteOnPattern,
  voteOnTemplate,
  recordSearchUsage,
} from "./actions"
import type {
  TeamSearchPattern,
  TeamSearchTemplate,
  TeamCollaborationStats,
  TeamSearchAnalytics,
  TeamRecommendation,
} from "@/types/team-search"

export default function TeamSearchPage() {
  const [patterns, setPatterns] = useState<TeamSearchPattern[]>([])
  const [templates, setTemplates] = useState<TeamSearchTemplate[]>([])
  const [collaborationStats, setCollaborationStats] = useState<TeamCollaborationStats[]>([])
  const [analytics, setAnalytics] = useState<TeamSearchAnalytics | null>(null)
  const [recommendations, setRecommendations] = useState<TeamRecommendation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("updated_at")
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [showTemplateDialog, setShowTemplateDialog] = useState(false)
  const [activeTab, setActiveTab] = useState("patterns")

  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const [patternsData, templatesData, statsData, analyticsData, recommendationsData] = await Promise.all([
        getTeamSearchPatterns(),
        getTeamSearchTemplates(),
        getTeamCollaborationStats(),
        getTeamSearchAnalytics(),
        getTeamRecommendations(),
      ])

      setPatterns(patternsData)
      setTemplates(templatesData)
      setCollaborationStats(statsData)
      setAnalytics(analyticsData)
      setRecommendations(recommendationsData)
    } catch (error) {
      console.error("Error loading team search data:", error)
      toast({
        title: "Error",
        description: "Failed to load team search data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleVotePattern = async (patternId: string, voteType: "upvote" | "downvote" | "helpful" | "not_helpful") => {
    const success = await voteOnPattern(patternId, voteType)
    if (success) {
      toast({
        title: "Vote Recorded",
        description: "Thank you for your feedback!",
      })
    } else {
      toast({
        title: "Error",
        description: "Failed to record vote",
        variant: "destructive",
      })
    }
  }

  const handleVoteTemplate = async (
    templateId: string,
    voteType: "upvote" | "downvote" | "helpful" | "not_helpful",
  ) => {
    const success = await voteOnTemplate(templateId, voteType)
    if (success) {
      toast({
        title: "Vote Recorded",
        description: "Thank you for your feedback!",
      })
    } else {
      toast({
        title: "Error",
        description: "Failed to record vote",
        variant: "destructive",
      })
    }
  }

  const handleUsePattern = async (pattern: TeamSearchPattern) => {
    const success = await recordSearchUsage(pattern.id, undefined, pattern.search_query, 4, 5)
    if (success) {
      toast({
        title: "Pattern Used",
        description: `Applied search pattern: ${pattern.pattern_name}`,
      })
      // In a real app, this would trigger the actual search
    }
  }

  const handleUseTemplate = async (template: TeamSearchTemplate) => {
    const success = await recordSearchUsage(undefined, template.id, template.template_query, 4, 3)
    if (success) {
      toast({
        title: "Template Used",
        description: `Applied search template: ${template.template_name}`,
      })
      // In a real app, this would open the template editor
    }
  }

  const filteredPatterns = patterns.filter((pattern) => {
    const matchesSearch =
      pattern.pattern_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pattern.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || pattern.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.template_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || template.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const categories = ["all", "invoices", "clients", "expenses", "reports", "analytics", "general"]

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Team Search Collaboration</h1>
          <p className="text-gray-600 mt-1">Share search patterns and learn from your team's expertise</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
            <DialogTrigger asChild>
              <Button>
                <Share2 className="w-4 h-4 mr-2" />
                Share Pattern
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Share Search Pattern</DialogTitle>
              </DialogHeader>
              <SharePatternDialog onClose={() => setShowShareDialog(false)} onSuccess={loadData} />
            </DialogContent>
          </Dialog>

          <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Create Template
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Search Template</DialogTitle>
              </DialogHeader>
              <CreateTemplateDialog onClose={() => setShowTemplateDialog(false)} onSuccess={loadData} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Analytics Overview */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Shared Patterns</CardTitle>
              <Search className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalPatterns}</div>
              <p className="text-xs text-muted-foreground">
                {analytics.averageSuccessRate.toFixed(1)}% avg success rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Templates</CardTitle>
              <Template className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalTemplates}</div>
              <p className="text-xs text-muted-foreground">Ready-to-use search templates</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Insights</CardTitle>
              <Lightbulb className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalInsights}</div>
              <p className="text-xs text-muted-foreground">Collaborative discoveries</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Time Saved</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.usageStats.average_time_saved}min</div>
              <p className="text-xs text-muted-foreground">Average per search</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Recommended for You
            </CardTitle>
            <CardDescription>Based on your search history and team patterns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendations.slice(0, 4).map((rec) => (
                <div key={rec.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant={rec.type === "pattern" ? "default" : "secondary"}>{rec.type}</Badge>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Target className="w-3 h-3" />
                      {rec.confidence_score}%
                    </div>
                  </div>
                  <h4 className="font-medium">{rec.title}</h4>
                  <p className="text-sm text-gray-600">{rec.description}</p>
                  <p className="text-xs text-blue-600">{rec.reason}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">by {rec.creator_name}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (rec.type === "pattern") {
                          const pattern = patterns.find((p) => p.id === rec.id)
                          if (pattern) handleUsePattern(pattern)
                        } else {
                          const template = templates.find((t) => t.id === rec.id)
                          if (template) handleUseTemplate(template)
                        }
                      }}
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      Try It
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search patterns and templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="updated_at">Recently Updated</SelectItem>
                <SelectItem value="created_at">Recently Created</SelectItem>
                <SelectItem value="success_rate">Success Rate</SelectItem>
                <SelectItem value="usage_count">Most Used</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="patterns">Patterns ({filteredPatterns.length})</TabsTrigger>
          <TabsTrigger value="templates">Templates ({filteredTemplates.length})</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="patterns" className="space-y-4">
          {filteredPatterns.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <Search className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">No patterns found</h3>
                <p className="text-gray-600 mb-4">
                  {searchQuery ? "Try different search terms" : "Be the first to share a search pattern!"}
                </p>
                <Button onClick={() => setShowShareDialog(true)}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Your First Pattern
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPatterns.map((pattern) => (
                <Card key={pattern.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{pattern.pattern_name}</CardTitle>
                        <CardDescription className="mt-1">
                          {pattern.description || "No description provided"}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {pattern.category && <Badge variant="outline">{pattern.category}</Badge>}
                        {pattern.is_public && <Badge variant="secondary">Public</Badge>}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <code className="text-sm">{pattern.search_query}</code>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-4 h-4 text-green-600" />
                          <span>{pattern.success_rate}% success</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-blue-600" />
                          <span>{pattern.usage_count} uses</span>
                        </div>
                      </div>
                      <span className="text-gray-500">{new Date(pattern.updated_at).toLocaleDateString()}</span>
                    </div>

                    {pattern.tags && pattern.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {pattern.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost" onClick={() => handleVotePattern(pattern.id, "helpful")}>
                          <ThumbsUp className="w-3 h-3 mr-1" />
                          Helpful
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleVotePattern(pattern.id, "not_helpful")}>
                          <ThumbsDown className="w-3 h-3 mr-1" />
                          Not Helpful
                        </Button>
                      </div>
                      <Button size="sm" onClick={() => handleUsePattern(pattern)}>
                        <Search className="w-3 h-3 mr-1" />
                        Use Pattern
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          {filteredTemplates.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <Template className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">No templates found</h3>
                <p className="text-gray-600 mb-4">
                  {searchQuery ? "Try different search terms" : "Create the first search template for your team!"}
                </p>
                <Button onClick={() => setShowTemplateDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Template
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTemplates.map((template) => (
                <Card key={template.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{template.template_name}</CardTitle>
                        <CardDescription className="mt-1">
                          {template.description || "No description provided"}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {template.category && <Badge variant="outline">{template.category}</Badge>}
                        <Badge
                          variant={
                            template.approval_status === "approved"
                              ? "default"
                              : template.approval_status === "rejected"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {template.approval_status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <code className="text-sm">{template.template_query}</code>
                    </div>

                    {template.usage_instructions && (
                      <div className="text-sm text-gray-600">
                        <strong>Usage:</strong> {template.usage_instructions}
                      </div>
                    )}

                    {Object.keys(template.variables).length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Variables:</h4>
                        <div className="flex flex-wrap gap-1">
                          {Object.keys(template.variables).map((variable) => (
                            <Badge key={variable} variant="outline" className="text-xs">
                              {variable}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>by {template.creator_name || "Team Member"}</span>
                      <span>{new Date(template.updated_at).toLocaleDateString()}</span>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost" onClick={() => handleVoteTemplate(template.id, "helpful")}>
                          <ThumbsUp className="w-3 h-3 mr-1" />
                          Helpful
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleVoteTemplate(template.id, "not_helpful")}
                        >
                          <ThumbsDown className="w-3 h-3 mr-1" />
                          Not Helpful
                        </Button>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleUseTemplate(template)}
                        disabled={template.approval_status !== "approved"}
                      >
                        <Template className="w-3 h-3 mr-1" />
                        Use Template
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-500" />
                Team Collaboration Leaderboard
              </CardTitle>
              <CardDescription>Top contributors to team search knowledge</CardDescription>
            </CardHeader>
            <CardContent>
              {collaborationStats.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium mb-2">No collaboration data yet</h3>
                  <p className="text-gray-600">Start sharing patterns and templates to see the leaderboard!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {collaborationStats.slice(0, 10).map((stat, index) => (
                    <div key={stat.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-medium">{stat.user_name || "Team Member"}</h4>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>{stat.patterns_shared} patterns</span>
                            <span>{stat.templates_created} templates</span>
                            <span>{stat.insights_contributed} insights</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-600">{stat.collaboration_score.toFixed(1)}</div>
                        <div className="text-xs text-gray-500">score</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          {analytics && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Top Categories</CardTitle>
                    <CardDescription>Most popular search categories</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analytics.topCategories.map((category) => (
                        <div key={category.category} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium capitalize">{category.category}</span>
                            <span className="text-sm text-gray-600">
                              {category.count} items ({category.success_rate.toFixed(1)}% success)
                            </span>
                          </div>
                          <Progress value={(category.count / analytics.totalPatterns) * 100} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Usage Statistics</CardTitle>
                    <CardDescription>Team search activity</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span>Daily Usage</span>
                        <span className="font-bold">{analytics.usageStats.daily_usage}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Weekly Usage</span>
                        <span className="font-bold">{analytics.usageStats.weekly_usage}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Monthly Usage</span>
                        <span className="font-bold">{analytics.usageStats.monthly_usage}</span>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <span>Avg. Time Saved</span>
                        <span className="font-bold text-green-600">{analytics.usageStats.average_time_saved} min</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest team contributions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-center gap-4 p-3 border rounded-lg">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100">
                          {activity.type === "pattern" ? (
                            <Search className="w-4 h-4 text-blue-600" />
                          ) : activity.type === "template" ? (
                            <Template className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Lightbulb className="w-4 h-4 text-blue-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{activity.title}</h4>
                          <p className="text-sm text-gray-600">
                            {activity.type} created by {activity.creator}
                          </p>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(activity.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
