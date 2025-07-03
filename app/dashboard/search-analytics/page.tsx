"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import {
  Brain,
  Search,
  TrendingUp,
  Target,
  Lightbulb,
  SpellCheck,
  Filter,
  Clock,
  Users,
  Activity,
  Zap,
  CheckCircle,
  AlertCircle,
} from "lucide-react"
import { AISearchSuggestionEngine } from "@/lib/ai-search-suggestions"
import type { SearchSuggestion, QueryAnalysis, SearchAnalytics } from "@/types/search-suggestions"

// Mock analytics data
const mockAnalytics: SearchAnalytics = {
  totalSearches: 1247,
  suggestionsGenerated: 3891,
  suggestionsUsed: 1556,
  averageConfidence: 0.78,
  topSuggestionTypes: [
    { type: "correction", count: 456, successRate: 0.89 },
    { type: "expansion", count: 389, successRate: 0.72 },
    { type: "filter", count: 334, successRate: 0.65 },
    { type: "related", count: 267, successRate: 0.58 },
    { type: "combination", count: 123, successRate: 0.71 },
  ],
  queryImprovements: [
    { original: "invioce payment", improved: "invoice payment status", effectiveness: 0.92 },
    { original: "clinet info", improved: "client contact information", effectiveness: 0.88 },
    { original: "expence report", improved: "expense report monthly", effectiveness: 0.85 },
    { original: "meeting notes", improved: "meeting notes action items", effectiveness: 0.79 },
  ],
}

// Test queries for demonstration
const testQueries = [
  {
    category: "Invoice Management",
    queries: ["invioce payment", "overdue bills", "client payment status", "create new invoice", "payment reminders"],
  },
  {
    category: "Client Management",
    queries: [
      "clinet contact info",
      "customer details",
      "new client onboarding",
      "client communication history",
      "client project status",
    ],
  },
  {
    category: "Expense Tracking",
    queries: ["expence report", "business costs", "monthly expenses", "receipt scanning", "expense categories"],
  },
  {
    category: "Reports & Analytics",
    queries: ["financial report", "revenue analytics", "profit margins", "business metrics", "performance dashboard"],
  },
  {
    category: "General Business",
    queries: ["meeting notes", "project deadlines", "task management", "team collaboration", "business planning"],
  },
]

export default function SearchAnalyticsPage() {
  const [selectedQuery, setSelectedQuery] = useState<string>("")
  const [queryAnalysis, setQueryAnalysis] = useState<QueryAnalysis | null>(null)
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [testResults, setTestResults] = useState<
    Array<{
      query: string
      analysis: QueryAnalysis
      suggestions: SearchSuggestion[]
    }>
  >([])

  const analyzeQuery = async (query: string) => {
    setSelectedQuery(query)
    setIsAnalyzing(true)

    try {
      const [analysis, suggestionResults] = await Promise.all([
        AISearchSuggestionEngine.analyzeQuery(query),
        AISearchSuggestionEngine.generateSearchSuggestions(query),
      ])

      setQueryAnalysis(analysis)
      setSuggestions(suggestionResults)
    } catch (error) {
      console.error("Error analyzing query:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const runBatchTest = async () => {
    const results = []

    for (const category of testQueries) {
      for (const query of category.queries) {
        try {
          const [analysis, suggestionResults] = await Promise.all([
            AISearchSuggestionEngine.analyzeQuery(query),
            AISearchSuggestionEngine.generateSearchSuggestions(query),
          ])

          results.push({
            query,
            analysis,
            suggestions: suggestionResults,
          })
        } catch (error) {
          console.error(`Error testing query "${query}":`, error)
        }
      }
    }

    setTestResults(results)
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-green-600"
    if (confidence >= 0.6) return "text-yellow-600"
    return "text-red-600"
  }

  const getSuggestionTypeIcon = (type: string) => {
    const icons = {
      correction: SpellCheck,
      expansion: Lightbulb,
      filter: Filter,
      related: Search,
      combination: Target,
      popular: TrendingUp,
    }
    const IconComponent = icons[type as keyof typeof icons] || Search
    return <IconComponent className="w-4 h-4" />
  }

  const chartColors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Search Analytics</h1>
          <p className="text-gray-600 mt-2">Test and analyze AI-powered search suggestions</p>
        </div>
        <Button onClick={runBatchTest} className="bg-blue-600 hover:bg-blue-700">
          <Brain className="w-4 h-4 mr-2" />
          Run Batch Test
        </Button>
      </div>

      <Tabs defaultValue="testing" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="testing">Live Testing</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="testing" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Test Query Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Test Queries
                </CardTitle>
                <CardDescription>Select a query to test AI suggestions and analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {testQueries.map((category) => (
                      <div key={category.category} className="space-y-2">
                        <h3 className="font-medium text-sm text-gray-700 border-b pb-1">{category.category}</h3>
                        <div className="space-y-1">
                          {category.queries.map((query) => (
                            <Button
                              key={query}
                              variant={selectedQuery === query ? "default" : "ghost"}
                              size="sm"
                              onClick={() => analyzeQuery(query)}
                              className="w-full justify-start text-left h-auto py-2"
                              disabled={isAnalyzing}
                            >
                              <div className="flex items-center gap-2">
                                <Search className="w-3 h-3" />
                                <span className="font-mono text-xs">{query}</span>
                              </div>
                            </Button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Analysis Results */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  Analysis Results
                  {isAnalyzing && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>}
                </CardTitle>
                <CardDescription>AI analysis and suggestions for the selected query</CardDescription>
              </CardHeader>
              <CardContent>
                {selectedQuery ? (
                  <div className="space-y-4">
                    {/* Query Info */}
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Search className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium">Query:</span>
                      </div>
                      <code className="text-sm bg-white px-2 py-1 rounded border">{selectedQuery}</code>
                    </div>

                    {/* Analysis */}
                    {queryAnalysis && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <Target className="w-4 h-4 text-blue-600" />
                              <span className="text-sm font-medium">Type</span>
                            </div>
                            <Badge variant="outline">{queryAnalysis.queryType}</Badge>
                          </div>
                          <div className="p-3 bg-green-50 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <Activity className="w-4 h-4 text-green-600" />
                              <span className="text-sm font-medium">Confidence</span>
                            </div>
                            <span className={`font-bold ${getConfidenceColor(queryAnalysis.confidence)}`}>
                              {Math.round(queryAnalysis.confidence * 100)}%
                            </span>
                          </div>
                        </div>

                        {queryAnalysis.correctedQuery && (
                          <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                            <div className="flex items-center gap-2 mb-2">
                              <SpellCheck className="w-4 h-4 text-yellow-600" />
                              <span className="text-sm font-medium">Spelling Correction</span>
                            </div>
                            <code className="text-sm bg-white px-2 py-1 rounded border">
                              {queryAnalysis.correctedQuery}
                            </code>
                          </div>
                        )}

                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-4 h-4 text-gray-600" />
                            <span className="text-sm font-medium">Processing Time</span>
                          </div>
                          <span className="text-sm text-gray-600">{queryAnalysis.processingTime}ms</span>
                        </div>
                      </div>
                    )}

                    {/* Suggestions */}
                    {suggestions.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-medium text-sm flex items-center gap-2">
                          <Lightbulb className="w-4 h-4 text-yellow-500" />
                          AI Suggestions ({suggestions.length})
                        </h4>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {suggestions.map((suggestion, index) => (
                            <div key={index} className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  {getSuggestionTypeIcon(suggestion.type)}
                                  <span className="text-sm font-medium">{suggestion.title}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {suggestion.type}
                                  </Badge>
                                </div>
                                <Badge
                                  className={`text-xs ${
                                    suggestion.confidence >= 0.8
                                      ? "bg-green-100 text-green-800"
                                      : suggestion.confidence >= 0.6
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {Math.round(suggestion.confidence * 100)}%
                                </Badge>
                              </div>
                              <p className="text-xs text-gray-600 mb-2">{suggestion.description}</p>
                              {suggestion.query !== selectedQuery && (
                                <code className="text-xs bg-gray-100 px-2 py-1 rounded">{suggestion.query}</code>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Brain className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>Select a query to see AI analysis and suggestions</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Batch Test Results */}
          {testResults.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Batch Test Results
                </CardTitle>
                <CardDescription>
                  Results from testing all queries ({testResults.length} queries analyzed)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Search className="w-5 h-5 text-blue-600" />
                      <span className="font-medium">Queries Tested</span>
                    </div>
                    <span className="text-2xl font-bold text-blue-600">{testResults.length}</span>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-medium">Avg Confidence</span>
                    </div>
                    <span className="text-2xl font-bold text-green-600">
                      {Math.round(
                        (testResults.reduce((sum, result) => sum + result.analysis.confidence, 0) /
                          testResults.length) *
                          100,
                      )}
                      %
                    </span>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="w-5 h-5 text-purple-600" />
                      <span className="font-medium">Total Suggestions</span>
                    </div>
                    <span className="text-2xl font-bold text-purple-600">
                      {testResults.reduce((sum, result) => sum + result.suggestions.length, 0)}
                    </span>
                  </div>
                </div>

                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {testResults.map((result, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <code className="text-sm bg-gray-100 px-2 py-1 rounded">{result.query}</code>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{result.analysis.queryType}</Badge>
                            <Badge
                              className={`${
                                result.analysis.confidence >= 0.8
                                  ? "bg-green-100 text-green-800"
                                  : result.analysis.confidence >= 0.6
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                              }`}
                            >
                              {Math.round(result.analysis.confidence * 100)}%
                            </Badge>
                          </div>
                        </div>

                        {result.analysis.correctedQuery && (
                          <div className="mb-2">
                            <span className="text-xs text-gray-500">Correction: </span>
                            <code className="text-xs bg-yellow-100 px-1 rounded">{result.analysis.correctedQuery}</code>
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span>{result.suggestions.length} suggestions</span>
                          <span>•</span>
                          <span>{result.analysis.processingTime}ms</span>
                          {result.analysis.semanticExpansions.length > 0 && (
                            <>
                              <span>•</span>
                              <span>{result.analysis.semanticExpansions.length} expansions</span>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Search className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">Total Searches</span>
                </div>
                <span className="text-3xl font-bold text-blue-600">{mockAnalytics.totalSearches.toLocaleString()}</span>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-5 h-5 text-yellow-600" />
                  <span className="font-medium">Suggestions Generated</span>
                </div>
                <span className="text-3xl font-bold text-yellow-600">
                  {mockAnalytics.suggestionsGenerated.toLocaleString()}
                </span>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium">Suggestions Used</span>
                </div>
                <span className="text-3xl font-bold text-green-600">
                  {mockAnalytics.suggestionsUsed.toLocaleString()}
                </span>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-purple-600" />
                  <span className="font-medium">Avg Confidence</span>
                </div>
                <span className="text-3xl font-bold text-purple-600">
                  {Math.round(mockAnalytics.averageConfidence * 100)}%
                </span>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Suggestion Types Performance</CardTitle>
                <CardDescription>Success rate by suggestion type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={mockAnalytics.topSuggestionTypes}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="successRate" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Suggestion Distribution</CardTitle>
                <CardDescription>Distribution of suggestion types</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={mockAnalytics.topSuggestionTypes}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                      label={({ type, count }) => `${type}: ${count}`}
                    >
                      {mockAnalytics.topSuggestionTypes.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Query Improvements</CardTitle>
              <CardDescription>AI-improved queries and their effectiveness</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockAnalytics.queryImprovements.map((improvement, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-gray-500">Original:</span>
                        <code className="block text-sm bg-red-50 px-2 py-1 rounded mt-1">{improvement.original}</code>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Improved:</span>
                        <code className="block text-sm bg-green-50 px-2 py-1 rounded mt-1">{improvement.improved}</code>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-sm text-gray-500">Effectiveness:</span>
                      <Progress value={improvement.effectiveness * 100} className="flex-1" />
                      <span className="text-sm font-medium">{Math.round(improvement.effectiveness * 100)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Key Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-green-900">High Success Rate</span>
                  </div>
                  <p className="text-sm text-green-700">
                    Spelling corrections have the highest success rate at 89%, indicating users find these suggestions
                    most valuable.
                  </p>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-blue-900">Semantic Expansion</span>
                  </div>
                  <p className="text-sm text-blue-700">
                    AI-powered semantic expansions help users discover related terms they might not have considered,
                    improving search coverage.
                  </p>
                </div>

                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-yellow-600" />
                    <span className="font-medium text-yellow-900">Improvement Opportunity</span>
                  </div>
                  <p className="text-sm text-yellow-700">
                    Related topic suggestions have lower adoption rates. Consider improving relevance algorithms or
                    presentation.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Usage Patterns
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Invoice-related queries</span>
                      <span>34%</span>
                    </div>
                    <Progress value={34} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Client management</span>
                      <span>28%</span>
                    </div>
                    <Progress value={28} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Expense tracking</span>
                      <span>22%</span>
                    </div>
                    <Progress value={22} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Reports & analytics</span>
                      <span>16%</span>
                    </div>
                    <Progress value={16} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
