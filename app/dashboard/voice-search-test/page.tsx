"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  Mic,
  Brain,
  Target,
  Clock,
  TrendingUp,
  Zap,
  CheckCircle,
  XCircle,
  Play,
  Pause,
  RotateCcw,
  Download,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { VoiceSearchEngine, type VoiceSearchResult } from "@/lib/voice-search-engine"
import { VoiceSearchInput } from "@/components/voice-search-input"

interface TestResult {
  id: string
  query: string
  result: VoiceSearchResult
  timestamp: string
  testType: "manual" | "automated"
}

const TEST_QUERIES = [
  {
    category: "Invoice Management",
    queries: [
      "Show me all invoices from last month",
      "Find overdue payments from clients",
      "Get invoice status for John Smith",
      "Search for unpaid bills this quarter",
      "Display recent invoice activity",
    ],
  },
  {
    category: "Client Management",
    queries: [
      "Find client contact information for ABC Company",
      "Show me all communications with Sarah Johnson",
      "Get client project history",
      "Search for new client onboarding notes",
      "Display client payment history",
    ],
  },
  {
    category: "Expense Tracking",
    queries: [
      "Show me expense reports from this week",
      "Find all business travel costs",
      "Get receipt scanning results",
      "Search for office supply expenses",
      "Display monthly budget analysis",
    ],
  },
  {
    category: "Reports & Analytics",
    queries: [
      "Generate financial performance report",
      "Show me revenue analytics dashboard",
      "Find profit margin calculations",
      "Get quarterly business metrics",
      "Display year over year comparison",
    ],
  },
]

export default function VoiceSearchTestPage() {
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isRunningBatch, setIsRunningBatch] = useState(false)
  const [batchProgress, setBatchProgress] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [currentTestQuery, setCurrentTestQuery] = useState<string>("")
  const [isVoiceSupported, setIsVoiceSupported] = useState(false)

  const { toast } = useToast()

  useEffect(() => {
    setIsVoiceSupported(VoiceSearchEngine.isVoiceSearchSupported())
  }, [])

  const handleVoiceResult = (result: VoiceSearchResult) => {
    const testResult: TestResult = {
      id: `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      query: currentTestQuery || "Manual voice input",
      result,
      timestamp: new Date().toISOString(),
      testType: "manual",
    }

    setTestResults((prev) => [testResult, ...prev])

    toast({
      title: "Voice Test Complete",
      description: `Processed with ${Math.round(result.confidence * 100)}% confidence`,
      duration: 3000,
    })
  }

  const runBatchTest = async () => {
    setIsRunningBatch(true)
    setBatchProgress(0)

    const allQueries = TEST_QUERIES.flatMap((category) => category.queries)
    const totalQueries = allQueries.length

    for (let i = 0; i < allQueries.length; i++) {
      const query = allQueries[i]

      try {
        const result = await VoiceSearchEngine.optimizeVoiceQuery(query)

        const testResult: TestResult = {
          id: `batch_${Date.now()}_${i}`,
          query,
          result,
          timestamp: new Date().toISOString(),
          testType: "automated",
        }

        setTestResults((prev) => [testResult, ...prev])
        setBatchProgress(((i + 1) / totalQueries) * 100)

        // Small delay to prevent overwhelming the system
        await new Promise((resolve) => setTimeout(resolve, 100))
      } catch (error) {
        console.error(`Error testing query "${query}":`, error)
      }
    }

    setIsRunningBatch(false)
    toast({
      title: "Batch Test Complete",
      description: `Tested ${totalQueries} voice queries`,
      duration: 3000,
    })
  }

  const clearResults = () => {
    setTestResults([])
    setBatchProgress(0)
    toast({
      title: "Results Cleared",
      description: "All test results have been cleared",
      duration: 2000,
    })
  }

  const exportResults = () => {
    const data = {
      testResults,
      summary: getTestSummary(),
      exportDate: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `voice-search-test-results-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Results Exported",
      description: "Test results have been downloaded",
    })
  }

  const getTestSummary = () => {
    if (testResults.length === 0) return null

    const totalTests = testResults.length
    const averageConfidence = testResults.reduce((sum, result) => sum + result.result.confidence, 0) / totalTests
    const averageProcessingTime =
      testResults.reduce((sum, result) => sum + result.result.processingTime, 0) / totalTests
    const businessTermsDetected = testResults.reduce(
      (sum, result) => sum + result.result.businessTermsDetected.length,
      0,
    )
    const queriesWithFilters = testResults.filter(
      (result) => Object.keys(result.result.suggestedFilters).length > 0,
    ).length

    return {
      totalTests,
      averageConfidence,
      averageProcessingTime,
      businessTermsDetected,
      queriesWithFilters,
      successRate: testResults.filter((result) => result.result.confidence > 0.6).length / totalTests,
    }
  }

  const filteredResults = testResults.filter((result) => {
    if (selectedCategory === "all") return true
    return TEST_QUERIES.some(
      (category) => category.category === selectedCategory && category.queries.includes(result.query),
    )
  })

  const summary = getTestSummary()

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-green-600 bg-green-50 border-green-200"
    if (confidence >= 0.6) return "text-yellow-600 bg-yellow-50 border-yellow-200"
    return "text-red-600 bg-red-50 border-red-200"
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Voice Search Testing</h1>
          <p className="text-gray-600 mt-2">Test and analyze voice search optimization performance</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={clearResults} disabled={testResults.length === 0}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Clear
          </Button>
          <Button variant="outline" onClick={exportResults} disabled={testResults.length === 0}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={runBatchTest} disabled={isRunningBatch || !isVoiceSupported}>
            {isRunningBatch ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
            {isRunningBatch ? "Running..." : "Run Batch Test"}
          </Button>
        </div>
      </div>

      {/* Voice Support Check */}
      {!isVoiceSupported && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-700">
              <XCircle className="w-5 h-5" />
              <span className="font-medium">Voice Search Not Supported</span>
            </div>
            <p className="text-sm text-red-600 mt-1">
              Your browser doesn't support voice recognition. Testing will be limited to text-based optimization.
            </p>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="live-test" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="live-test">Live Testing</TabsTrigger>
          <TabsTrigger value="batch-test">Batch Testing</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="live-test" className="space-y-6">
          {/* Live Voice Testing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="w-5 h-5" />
                Live Voice Testing
              </CardTitle>
              <CardDescription>Test voice input and optimization in real-time</CardDescription>
            </CardHeader>
            <CardContent>
              <VoiceSearchInput
                onVoiceResult={handleVoiceResult}
                onTranscriptChange={(transcript) => setCurrentTestQuery(transcript)}
                disabled={!isVoiceSupported}
              />
            </CardContent>
          </Card>

          {/* Manual Query Testing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Manual Query Testing
              </CardTitle>
              <CardDescription>Test specific queries without voice input</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {TEST_QUERIES.map((category) => (
                  <div key={category.category} className="space-y-2">
                    <h4 className="font-medium text-gray-700">{category.category}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {category.queries.map((query) => (
                        <Button
                          key={query}
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            try {
                              const result = await VoiceSearchEngine.optimizeVoiceQuery(query)
                              const testResult: TestResult = {
                                id: `manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                                query,
                                result,
                                timestamp: new Date().toISOString(),
                                testType: "manual",
                              }
                              setTestResults((prev) => [testResult, ...prev])
                              toast({
                                title: "Query Tested",
                                description: `${Math.round(result.confidence * 100)}% confidence`,
                                duration: 2000,
                              })
                            } catch (error) {
                              toast({
                                title: "Test Failed",
                                description: "Failed to process query",
                                variant: "destructive",
                              })
                            }
                          }}
                          className="justify-start text-left h-auto py-2 px-3"
                        >
                          <div className="text-xs">{query}</div>
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="batch-test" className="space-y-6">
          {/* Batch Testing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Automated Batch Testing
              </CardTitle>
              <CardDescription>Test all predefined queries automatically</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isRunningBatch && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Testing progress...</span>
                      <span>{Math.round(batchProgress)}%</span>
                    </div>
                    <Progress value={batchProgress} className="h-2" />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {TEST_QUERIES.map((category) => (
                    <div key={category.category} className="p-4 border rounded-lg">
                      <h4 className="font-medium text-gray-700 mb-2">{category.category}</h4>
                      <p className="text-sm text-gray-600 mb-3">{category.queries.length} test queries</p>
                      <div className="space-y-1">
                        {category.queries.slice(0, 3).map((query) => (
                          <div key={query} className="text-xs text-gray-500 truncate">
                            • {query}
                          </div>
                        ))}
                        {category.queries.length > 3 && (
                          <div className="text-xs text-gray-400">+{category.queries.length - 3} more...</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-center">
                  <Button onClick={runBatchTest} disabled={isRunningBatch} size="lg">
                    {isRunningBatch ? (
                      <>
                        <Pause className="w-4 h-4 mr-2" />
                        Running Batch Test...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Start Batch Test
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          {/* Test Results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Test Results
              </CardTitle>
              <CardDescription>
                {testResults.length} tests completed
                {selectedCategory !== "all" && ` • Filtered by ${selectedCategory}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Filter */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Filter by category:</span>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={selectedCategory === "all" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory("all")}
                    >
                      All
                    </Button>
                    {TEST_QUERIES.map((category) => (
                      <Button
                        key={category.category}
                        variant={selectedCategory === category.category ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedCategory(category.category)}
                      >
                        {category.category}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Results List */}
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {filteredResults.map((testResult) => (
                      <div key={testResult.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className="text-xs">
                                {testResult.testType}
                              </Badge>
                              <Badge className={`text-xs ${getConfidenceColor(testResult.result.confidence)}`}>
                                {Math.round(testResult.result.confidence * 100)}% confidence
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {new Date(testResult.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                            <div className="space-y-2">
                              <div>
                                <span className="text-xs text-gray-500">Original:</span>
                                <code className="block text-sm bg-gray-100 px-2 py-1 rounded mt-1">
                                  {testResult.result.originalTranscript}
                                </code>
                              </div>
                              {testResult.result.optimizedQuery !== testResult.result.originalTranscript && (
                                <div>
                                  <span className="text-xs text-gray-500">Optimized:</span>
                                  <code className="block text-sm bg-green-100 px-2 py-1 rounded mt-1">
                                    {testResult.result.optimizedQuery}
                                  </code>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                          <div>
                            <span className="text-gray-500">Processing Time:</span>
                            <div className="font-medium">{testResult.result.processingTime}ms</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Business Terms:</span>
                            <div className="font-medium">{testResult.result.businessTermsDetected.length}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Suggested Filters:</span>
                            <div className="font-medium">{Object.keys(testResult.result.suggestedFilters).length}</div>
                          </div>
                        </div>

                        {testResult.result.businessTermsDetected.length > 0 && (
                          <div className="mt-3">
                            <span className="text-xs text-gray-500">Detected Terms:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {testResult.result.businessTermsDetected.map((term) => (
                                <Badge key={term} variant="secondary" className="text-xs">
                                  {term}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    {filteredResults.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-medium mb-2">No Test Results</h3>
                        <p>Run some tests to see results here</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Analytics Summary */}
          {summary && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Tests</p>
                      <p className="text-2xl font-bold text-blue-600">{summary.totalTests}</p>
                    </div>
                    <Target className="w-8 h-8 text-blue-600 opacity-75" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Avg Confidence</p>
                      <p className="text-2xl font-bold text-green-600">
                        {Math.round(summary.averageConfidence * 100)}%
                      </p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-600 opacity-75" />
                  </div>
                  <div className="mt-2">
                    <Progress value={summary.averageConfidence * 100} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Avg Processing</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {Math.round(summary.averageProcessingTime)}ms
                      </p>
                    </div>
                    <Clock className="w-8 h-8 text-purple-600 opacity-75" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Success Rate</p>
                      <p className="text-2xl font-bold text-orange-600">{Math.round(summary.successRate * 100)}%</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-orange-600 opacity-75" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Business Terms</p>
                      <p className="text-2xl font-bold text-indigo-600">{summary.businessTermsDetected}</p>
                    </div>
                    <Brain className="w-8 h-8 text-indigo-600 opacity-75" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">With Filters</p>
                      <p className="text-2xl font-bold text-pink-600">{summary.queriesWithFilters}</p>
                    </div>
                    <Zap className="w-8 h-8 text-pink-600 opacity-75" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Detailed Analytics */}
          {summary && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Performance Analysis
                </CardTitle>
                <CardDescription>Detailed breakdown of voice search optimization performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Confidence Distribution */}
                  <div>
                    <h4 className="font-medium text-gray-700 mb-3">Confidence Score Distribution</h4>
                    <div className="space-y-2">
                      {[
                        { label: "High (80-100%)", min: 0.8, color: "bg-green-500" },
                        { label: "Medium (60-79%)", min: 0.6, color: "bg-yellow-500" },
                        { label: "Low (0-59%)", min: 0, color: "bg-red-500" },
                      ].map((range) => {
                        const count = testResults.filter(
                          (result) =>
                            result.result.confidence >= range.min &&
                            (range.min === 0.8 ? true : result.result.confidence < range.min + 0.2),
                        ).length
                        const percentage = testResults.length > 0 ? (count / testResults.length) * 100 : 0

                        return (
                          <div key={range.label} className="flex items-center gap-3">
                            <div className="w-24 text-sm text-gray-600">{range.label}</div>
                            <div className="flex-1 bg-gray-200 rounded-full h-4 relative">
                              <div
                                className={`${range.color} h-4 rounded-full transition-all duration-300`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <div className="w-16 text-sm text-gray-600 text-right">
                              {count} ({Math.round(percentage)}%)
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <Separator />

                  {/* Performance Insights */}
                  <div>
                    <h4 className="font-medium text-gray-700 mb-3">Performance Insights</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="w-5 h-5 text-blue-600" />
                          <span className="font-medium text-blue-900">Optimization Quality</span>
                        </div>
                        <p className="text-sm text-blue-700">
                          {Math.round(summary.averageConfidence * 100)}% average confidence indicates{" "}
                          {summary.averageConfidence > 0.8
                            ? "excellent"
                            : summary.averageConfidence > 0.6
                              ? "good"
                              : "needs improvement"}{" "}
                          optimization performance.
                        </p>
                      </div>

                      <div className="p-4 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-5 h-5 text-green-600" />
                          <span className="font-medium text-green-900">Processing Speed</span>
                        </div>
                        <p className="text-sm text-green-700">
                          Average processing time of {Math.round(summary.averageProcessingTime)}ms is{" "}
                          {summary.averageProcessingTime < 500 ? "excellent" : "acceptable"} for real-time voice search.
                        </p>
                      </div>

                      <div className="p-4 bg-purple-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Brain className="w-5 h-5 text-purple-600" />
                          <span className="font-medium text-purple-900">Business Context</span>
                        </div>
                        <p className="text-sm text-purple-700">
                          Detected {summary.businessTermsDetected} business terms across all tests, showing strong
                          domain understanding.
                        </p>
                      </div>

                      <div className="p-4 bg-orange-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Zap className="w-5 h-5 text-orange-600" />
                          <span className="font-medium text-orange-900">Smart Filtering</span>
                        </div>
                        <p className="text-sm text-orange-700">
                          {summary.queriesWithFilters} queries generated smart filters, enhancing search precision.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {!summary && (
            <Card>
              <CardContent className="p-8 text-center">
                <Target className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Analytics Available</h3>
                <p className="text-gray-600">Run some tests to see performance analytics</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
