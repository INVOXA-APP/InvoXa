"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from "recharts"
import {
  Search,
  TrendingUp,
  Clock,
  Target,
  Brain,
  Calendar,
  BarChart3,
  PieChartIcon,
  Activity,
  Lightbulb,
  Download,
  RefreshCw,
  BookmarkPlus,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  getUserSearchBehavior,
  getSearchAnalytics,
  getPersonalizedRecommendations,
} from "@/app/dashboard/ai-assistant/search-analytics-actions"
import type { UserSearchBehavior, SearchAnalytics, SearchRecommendation } from "@/types/search-analytics"

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#84cc16", "#f97316"]

export default function SearchInsightsPage() {
  const [behavior, setBehavior] = useState<UserSearchBehavior | null>(null)
  const [analytics, setAnalytics] = useState<SearchAnalytics | null>(null)
  const [recommendations, setRecommendations] = useState<SearchRecommendation[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadAllData()
  }, [])

  const loadAllData = async () => {
    try {
      setLoading(true)
      const [behaviorData, analyticsData, recommendationsData] = await Promise.all([
        getUserSearchBehavior(),
        getSearchAnalytics(),
        getPersonalizedRecommendations(),
      ])

      setBehavior(behaviorData)
      setAnalytics(analyticsData)
      setRecommendations(recommendationsData)
    } catch (error) {
      console.error("Error loading search insights:", error)
      toast({
        title: "Error",
        description: "Failed to load search insights",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const exportInsights = () => {
    if (!behavior || !analytics) return

    const data = {
      behavior,
      analytics,
      recommendations,
      exportedAt: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `search-insights-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Insights Exported",
      description: "Your search insights have been downloaded",
    })
  }

  const formatHour = (hour: number) => {
    return `${hour}:00`
  }

  const formatDay = (day: number) => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    return days[day] || "Unknown"
  }

  const getHourlyData = () => {
    if (!behavior) return []

    const data = []
    for (let i = 0; i < 24; i++) {
      data.push({
        hour: formatHour(i),
        searches: Math.floor(Math.random() * 10), // Placeholder data
      })
    }
    return data
  }

  const getCategoryData = () => {
    if (!behavior) return []

    return behavior.topCategories.map((cat, index) => ({
      name: cat.category,
      value: cat.frequency,
      color: COLORS[index % COLORS.length],
    }))
  }

  const getTrendData = () => {
    if (!behavior) return []

    return behavior.searchTrends.map((trend) => ({
      date: new Date(trend.date).toLocaleDateString(),
      searches: trend.count,
    }))
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Search Insights</h1>
            <p className="text-gray-600">Analyze your search patterns and behavior</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-20 bg-gray-100 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-64 bg-gray-100 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="w-8 h-8 text-blue-600" />
            Search Insights
          </h1>
          <p className="text-gray-600">AI-powered analysis of your search patterns and behavior</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={loadAllData} disabled={loading}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={exportInsights} disabled={!behavior || !analytics}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Searches</p>
                <p className="text-2xl font-bold">{analytics?.totalSearches || 0}</p>
              </div>
              <Search className="w-8 h-8 text-blue-600" />
            </div>
            <div className="mt-2">
              <Badge variant="secondary">{analytics?.searchesLast7Days || 0} this week</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold">{Math.round((analytics?.successRate || 0) * 100)}%</p>
              </div>
              <Target className="w-8 h-8 text-green-600" />
            </div>
            <div className="mt-2">
              <Progress value={(analytics?.successRate || 0) * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Session</p>
                <p className="text-2xl font-bold">{Math.round((analytics?.averageSessionDuration || 0) / 60)}m</p>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
            <div className="mt-2">
              <Badge variant="outline">
                {analytics?.averageSessionDuration && analytics.averageSessionDuration > 180
                  ? "Could be faster"
                  : "Good pace"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Peak Hour</p>
                <p className="text-2xl font-bold">{formatHour(analytics?.peakActivityHour || 9)}</p>
              </div>
              <Activity className="w-8 h-8 text-purple-600" />
            </div>
            <div className="mt-2">
              <Badge variant="secondary">{formatDay(analytics?.peakActivityDay || 1)}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="patterns" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="patterns">Search Patterns</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="recommendations">AI Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="patterns" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Search Trends (30 Days)
                </CardTitle>
                <CardDescription>Your daily search activity over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={getTrendData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="searches" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Hourly Activity
                </CardTitle>
                <CardDescription>When you search most during the day</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={getHourlyData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="searches" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Top Query Patterns
              </CardTitle>
              <CardDescription>Your most common search patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {behavior?.topQueryPatterns.slice(0, 5).map((pattern, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">{pattern.pattern}</code>
                      <p className="text-xs text-gray-500 mt-1">Used {pattern.frequency} times</p>
                    </div>
                    <Badge variant="outline">{pattern.frequency}x</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Weekly Activity
                </CardTitle>
                <CardDescription>Your search activity by day of week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[0, 1, 2, 3, 4, 5, 6].map((day) => {
                    const dayName = formatDay(day)
                    const isActive = day === (analytics?.peakActivityDay || 1)
                    const activity = Math.floor(Math.random() * 100) // Placeholder

                    return (
                      <div key={day} className="flex items-center justify-between">
                        <span className={`text-sm ${isActive ? "font-semibold text-blue-600" : "text-gray-600"}`}>
                          {dayName}
                        </span>
                        <div className="flex items-center gap-2 flex-1 ml-4">
                          <Progress value={activity} className="flex-1 h-2" />
                          <span className="text-xs text-gray-500 w-8">{activity}%</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Search Efficiency
                </CardTitle>
                <CardDescription>How effective your searches are</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Success Rate</span>
                      <span className="text-sm text-gray-600">{Math.round((analytics?.successRate || 0) * 100)}%</span>
                    </div>
                    <Progress value={(analytics?.successRate || 0) * 100} className="h-2" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Filter Usage</span>
                      <span className="text-sm text-gray-600">
                        {Math.round(
                          ((behavior?.filterUsageFrequency.dateRange || 0) / (behavior?.totalSearches || 1)) * 100,
                        )}
                        %
                      </span>
                    </div>
                    <Progress
                      value={((behavior?.filterUsageFrequency.dateRange || 0) / (behavior?.totalSearches || 1)) * 100}
                      className="h-2"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Search Speed</span>
                      <span className="text-sm text-gray-600">
                        {analytics?.averageSessionDuration && analytics.averageSessionDuration < 120
                          ? "Fast"
                          : "Could improve"}
                      </span>
                    </div>
                    <Progress
                      value={
                        analytics?.averageSessionDuration
                          ? Math.max(0, 100 - (analytics.averageSessionDuration / 300) * 100)
                          : 0
                      }
                      className="h-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5" />
                  Search Categories
                </CardTitle>
                <CardDescription>Distribution of your search topics</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={getCategoryData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {getCategoryData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Category Performance
                </CardTitle>
                <CardDescription>Success rate by search category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {behavior?.topCategories.map((category, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{category.category}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {category.frequency} searches
                          </Badge>
                          <span className="text-sm text-gray-600">{Math.round(category.confidence * 100)}%</span>
                        </div>
                      </div>
                      <Progress value={category.confidence * 100} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                AI-Powered Recommendations
              </CardTitle>
              <CardDescription>Personalized suggestions to improve your search experience</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendations.slice(0, 6).map((rec, index) => (
                  <div key={index} className="p-4 border rounded-lg hover:border-blue-300 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        {rec.type === "query" && <Search className="w-4 h-4 text-blue-600" />}
                        {rec.type === "filter" && <Target className="w-4 h-4 text-blue-600" />}
                        {rec.type === "template" && <BookmarkPlus className="w-4 h-4 text-blue-600" />}
                        {rec.type === "habit" && <TrendingUp className="w-4 h-4 text-blue-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm mb-1">{rec.title}</h4>
                        <p className="text-xs text-gray-600 mb-2">{rec.description}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {Math.round(rec.confidence * 100)}% confidence
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {rec.category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {recommendations.length === 0 && (
                <div className="text-center py-8">
                  <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">No recommendations available yet</p>
                  <p className="text-sm text-gray-400">Keep searching to get personalized AI recommendations!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
