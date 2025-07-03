"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"
import {
  TrendingUp,
  Activity,
  Users,
  Search,
  Brain,
  Target,
  Zap,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react"
import type { SearchAnalytics } from "@/types/search-suggestions"

interface SearchAnalyticsDashboardProps {
  analytics: SearchAnalytics
  className?: string
}

// Mock time series data for charts
const mockTimeSeriesData = [
  { date: "2024-01-01", searches: 45, suggestions: 123, used: 67, confidence: 0.78 },
  { date: "2024-01-02", searches: 52, suggestions: 145, used: 89, confidence: 0.82 },
  { date: "2024-01-03", searches: 38, suggestions: 98, used: 54, confidence: 0.75 },
  { date: "2024-01-04", searches: 67, suggestions: 189, used: 112, confidence: 0.84 },
  { date: "2024-01-05", searches: 71, suggestions: 201, used: 134, confidence: 0.86 },
  { date: "2024-01-06", searches: 59, suggestions: 167, used: 98, confidence: 0.79 },
  { date: "2024-01-07", searches: 63, suggestions: 178, used: 121, confidence: 0.81 },
]

const mockQueryCategories = [
  {
    category: "Invoice Management",
    count: 423,
    avgConfidence: 0.85,
    topQueries: ["invoice payment", "overdue bills", "payment status"],
  },
  {
    category: "Client Management",
    count: 356,
    avgConfidence: 0.78,
    topQueries: ["client info", "contact details", "client history"],
  },
  {
    category: "Expense Tracking",
    count: 289,
    avgConfidence: 0.82,
    topQueries: ["expense report", "receipt scan", "business costs"],
  },
  {
    category: "Reports & Analytics",
    count: 179,
    avgConfidence: 0.76,
    topQueries: ["financial report", "revenue analytics", "metrics"],
  },
]

export function SearchAnalyticsDashboard({ analytics, className }: SearchAnalyticsDashboardProps) {
  const [selectedTimeRange, setSelectedTimeRange] = useState("7d")
  const [isLoading, setIsLoading] = useState(false)

  const usageRate = (analytics.suggestionsUsed / analytics.suggestionsGenerated) * 100
  const avgSuggestionsPerSearch = analytics.suggestionsGenerated / analytics.totalSearches

  const getUsageRateColor = (rate: number) => {
    if (rate >= 50) return "text-green-600"
    if (rate >= 30) return "text-yellow-600"
    return "text-red-600"
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-green-600"
    if (confidence >= 0.6) return "text-yellow-600"
    return "text-red-600"
  }

  const chartColors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Searches</p>
                <p className="text-2xl font-bold text-blue-600">{analytics.totalSearches.toLocaleString()}</p>
              </div>
              <Search className="w-8 h-8 text-blue-600 opacity-75" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600">+12.5%</span>
              <span className="text-gray-500 ml-1">vs last week</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Usage Rate</p>
                <p className={`text-2xl font-bold ${getUsageRateColor(usageRate)}`}>{usageRate.toFixed(1)}%</p>
              </div>
              <Target className="w-8 h-8 text-purple-600 opacity-75" />
            </div>
            <div className="mt-2">
              <Progress value={usageRate} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Confidence</p>
                <p className={`text-2xl font-bold ${getConfidenceColor(analytics.averageConfidence)}`}>
                  {Math.round(analytics.averageConfidence * 100)}%
                </p>
              </div>
              <Brain className="w-8 h-8 text-green-600 opacity-75" />
            </div>
            <div className="mt-2">
              <Progress value={analytics.averageConfidence * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Suggestions/Search</p>
                <p className="text-2xl font-bold text-yellow-600">{avgSuggestionsPerSearch.toFixed(1)}</p>
              </div>
              <Zap className="w-8 h-8 text-yellow-600 opacity-75" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600">Optimal range</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Usage Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Usage Trends
            </CardTitle>
            <CardDescription>Search activity and suggestion usage over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockTimeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => new Date(value).toLocaleDateString([], { month: "short", day: "numeric" })}
                />
                <YAxis />
                <Tooltip labelFormatter={(value) => new Date(value).toLocaleDateString()} />
                <Line type="monotone" dataKey="searches" stroke="#3b82f6" strokeWidth={2} name="Searches" />
                <Line type="monotone" dataKey="used" stroke="#10b981" strokeWidth={2} name="Suggestions Used" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Suggestion Types Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Suggestion Performance
            </CardTitle>
            <CardDescription>Success rate by suggestion type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.topSuggestionTypes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} />
                <Tooltip formatter={(value: number) => [`${(value * 100).toFixed(1)}%`, "Success Rate"]} />
                <Bar dataKey="successRate" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Query Categories */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Query Categories
            </CardTitle>
            <CardDescription>Most searched categories and their performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockQueryCategories.map((category, index) => (
                <div key={category.category} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium">{category.category}</h3>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{category.count} searches</Badge>
                      <Badge
                        className={`${
                          category.avgConfidence >= 0.8
                            ? "bg-green-100 text-green-800"
                            : category.avgConfidence >= 0.6
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {Math.round(category.avgConfidence * 100)}% confidence
                      </Badge>
                    </div>
                  </div>
                  <div className="mb-3">
                    <Progress value={(category.count / 500) * 100} className="h-2" />
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {category.topQueries.map((query) => (
                      <Badge key={query} variant="secondary" className="text-xs">
                        {query}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Insights
            </CardTitle>
            <CardDescription>Key performance insights and recommendations</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-4">
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-green-900">High Performance</span>
                  </div>
                  <p className="text-sm text-green-700">
                    Spelling corrections show 89% success rate - users find these most valuable.
                  </p>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-blue-900">AI Effectiveness</span>
                  </div>
                  <p className="text-sm text-blue-700">
                    Semantic expansions help users discover 23% more relevant results on average.
                  </p>
                </div>

                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    <span className="font-medium text-yellow-900">Opportunity</span>
                  </div>
                  <p className="text-sm text-yellow-700">
                    Related topic suggestions have 58% success rate - consider improving relevance algorithms.
                  </p>
                </div>

                <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-purple-600" />
                    <span className="font-medium text-purple-900">Growth Trend</span>
                  </div>
                  <p className="text-sm text-purple-700">
                    Search volume increased 12.5% this week, with suggestion usage growing 18%.
                  </p>
                </div>

                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle className="w-4 h-4 text-red-600" />
                    <span className="font-medium text-red-900">Action Needed</span>
                  </div>
                  <p className="text-sm text-red-700">
                    Filter suggestions show declining usage - review filter relevance and presentation.
                  </p>
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Query Improvements Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Top Query Improvements
          </CardTitle>
          <CardDescription>Most effective AI query improvements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.queryImprovements.map((improvement, index) => (
              <div key={index} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <span className="text-xs text-gray-500 uppercase tracking-wide">Original Query</span>
                    <code className="block text-sm bg-red-50 border border-red-200 px-3 py-2 rounded mt-1">
                      {improvement.original}
                    </code>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 uppercase tracking-wide">AI Improved</span>
                    <code className="block text-sm bg-green-50 border border-green-200 px-3 py-2 rounded mt-1">
                      {improvement.improved}
                    </code>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">Effectiveness:</span>
                  <Progress value={improvement.effectiveness * 100} className="flex-1 h-2" />
                  <Badge
                    className={`${
                      improvement.effectiveness >= 0.8
                        ? "bg-green-100 text-green-800"
                        : improvement.effectiveness >= 0.6
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {Math.round(improvement.effectiveness * 100)}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
