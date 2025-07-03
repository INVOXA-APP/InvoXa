"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { analyzeTemporalPatterns } from "./actions"

interface TemporalCorrelation {
  errorA: string
  errorB: string
  timeWindow: string
  correlation: number
  frequency: number
  trend: "increasing" | "decreasing" | "stable" | "volatile"
  peakHours: number[]
  seasonality: "daily" | "weekly" | "monthly" | "none"
  riskLevel: "low" | "medium" | "high" | "critical"
}

interface TimeWindowAnalysis {
  window: string
  totalErrors: number
  uniqueCorrelations: number
  avgCorrelation: number
  strongCorrelations: number
  criticalPeriods: string[]
  recoveryEffectiveness: number
}

interface SeasonalPattern {
  period: "hourly" | "daily" | "weekly" | "monthly"
  pattern: {
    label: string
    errorRate: number
    correlationStrength: number
    recoverySuccess: number
    riskScore: number
  }[]
}

interface PredictiveInsight {
  timeframe: string
  prediction: string
  confidence: number
  riskLevel: "low" | "medium" | "high" | "critical"
  recommendedActions: string[]
  basedOn: string[]
}

export default function TemporalAnalysisPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedTimeWindow, setSelectedTimeWindow] = useState("24h")
  const [analysisTimestamp, setAnalysisTimestamp] = useState<Date | null>(null)

  const [temporalCorrelations] = useState<TemporalCorrelation[]>([
    {
      errorA: "Database connection failed",
      errorB: "Server overloaded",
      timeWindow: "Peak Hours (9-11 AM)",
      correlation: 0.94,
      frequency: 23,
      trend: "increasing",
      peakHours: [9, 10, 11, 14, 15],
      seasonality: "daily",
      riskLevel: "critical",
    },
    {
      errorA: "Authentication expired",
      errorB: "Session timeout",
      timeWindow: "Business Hours (9 AM - 5 PM)",
      correlation: 0.82,
      frequency: 18,
      trend: "stable",
      peakHours: [9, 13, 17],
      seasonality: "daily",
      riskLevel: "high",
    },
    {
      errorA: "Network timeout",
      errorB: "Request timeout",
      timeWindow: "Evening Peak (6-8 PM)",
      correlation: 0.76,
      frequency: 15,
      trend: "volatile",
      peakHours: [18, 19, 20],
      seasonality: "daily",
      riskLevel: "high",
    },
    {
      errorA: "Storage quota exceeded",
      errorB: "Disk space insufficient",
      timeWindow: "End of Month",
      correlation: 0.68,
      frequency: 8,
      trend: "increasing",
      peakHours: [28, 29, 30, 31],
      seasonality: "monthly",
      riskLevel: "medium",
    },
    {
      errorA: "Validation error",
      errorB: "Configuration conflict",
      timeWindow: "Monday Mornings",
      correlation: 0.61,
      frequency: 12,
      trend: "decreasing",
      peakHours: [8, 9, 10],
      seasonality: "weekly",
      riskLevel: "medium",
    },
    {
      errorA: "Rate limit exceeded",
      errorB: "API quota exceeded",
      timeWindow: "Lunch Hours (12-2 PM)",
      correlation: 0.58,
      frequency: 10,
      trend: "stable",
      peakHours: [12, 13, 14],
      seasonality: "daily",
      riskLevel: "medium",
    },
  ])

  const [timeWindowAnalysis] = useState<TimeWindowAnalysis[]>([
    {
      window: "Last 1 Hour",
      totalErrors: 12,
      uniqueCorrelations: 3,
      avgCorrelation: 0.67,
      strongCorrelations: 2,
      criticalPeriods: ["14:30-14:45"],
      recoveryEffectiveness: 78.5,
    },
    {
      window: "Last 6 Hours",
      totalErrors: 45,
      uniqueCorrelations: 8,
      avgCorrelation: 0.72,
      strongCorrelations: 5,
      criticalPeriods: ["09:00-11:00", "14:00-15:30"],
      recoveryEffectiveness: 73.2,
    },
    {
      window: "Last 24 Hours",
      totalErrors: 127,
      uniqueCorrelations: 15,
      avgCorrelation: 0.69,
      strongCorrelations: 9,
      criticalPeriods: ["09:00-11:00", "14:00-16:00", "18:00-20:00"],
      recoveryEffectiveness: 71.8,
    },
    {
      window: "Last 7 Days",
      totalErrors: 634,
      uniqueCorrelations: 28,
      avgCorrelation: 0.64,
      strongCorrelations: 18,
      criticalPeriods: ["Monday 9-11 AM", "Wednesday 2-4 PM", "Friday 6-8 PM"],
      recoveryEffectiveness: 69.4,
    },
    {
      window: "Last 30 Days",
      totalErrors: 2847,
      uniqueCorrelations: 42,
      avgCorrelation: 0.58,
      strongCorrelations: 25,
      criticalPeriods: ["Week 1", "Week 3", "Month End"],
      recoveryEffectiveness: 65.7,
    },
  ])

  const [seasonalPatterns] = useState<SeasonalPattern[]>([
    {
      period: "hourly",
      pattern: [
        { label: "00:00-06:00", errorRate: 12.3, correlationStrength: 0.45, recoverySuccess: 85.2, riskScore: 2.1 },
        { label: "06:00-09:00", errorRate: 34.7, correlationStrength: 0.68, recoverySuccess: 72.8, riskScore: 4.8 },
        { label: "09:00-12:00", errorRate: 67.2, correlationStrength: 0.89, recoverySuccess: 58.3, riskScore: 8.9 },
        { label: "12:00-15:00", errorRate: 78.9, correlationStrength: 0.82, recoverySuccess: 61.7, riskScore: 9.2 },
        { label: "15:00-18:00", errorRate: 71.4, correlationStrength: 0.76, recoverySuccess: 64.1, riskScore: 8.1 },
        { label: "18:00-21:00", errorRate: 45.6, correlationStrength: 0.71, recoverySuccess: 69.5, riskScore: 6.3 },
        { label: "21:00-24:00", errorRate: 23.8, correlationStrength: 0.52, recoverySuccess: 78.9, riskScore: 3.7 },
      ],
    },
    {
      period: "daily",
      pattern: [
        { label: "Monday", errorRate: 82.4, correlationStrength: 0.87, recoverySuccess: 56.2, riskScore: 9.1 },
        { label: "Tuesday", errorRate: 74.6, correlationStrength: 0.79, recoverySuccess: 63.8, riskScore: 7.8 },
        { label: "Wednesday", errorRate: 79.3, correlationStrength: 0.83, recoverySuccess: 59.4, riskScore: 8.5 },
        { label: "Thursday", errorRate: 71.8, correlationStrength: 0.76, recoverySuccess: 66.1, riskScore: 7.2 },
        { label: "Friday", errorRate: 85.7, correlationStrength: 0.91, recoverySuccess: 52.9, riskScore: 9.8 },
        { label: "Saturday", errorRate: 34.2, correlationStrength: 0.48, recoverySuccess: 81.3, riskScore: 3.9 },
        { label: "Sunday", errorRate: 28.9, correlationStrength: 0.42, recoverySuccess: 84.7, riskScore: 3.2 },
      ],
    },
    {
      period: "weekly",
      pattern: [
        { label: "Week 1", errorRate: 68.4, correlationStrength: 0.74, recoverySuccess: 67.2, riskScore: 7.1 },
        { label: "Week 2", errorRate: 72.9, correlationStrength: 0.78, recoverySuccess: 64.8, riskScore: 7.6 },
        { label: "Week 3", errorRate: 79.6, correlationStrength: 0.84, recoverySuccess: 58.9, riskScore: 8.4 },
        { label: "Week 4", errorRate: 87.3, correlationStrength: 0.92, recoverySuccess: 51.7, riskScore: 9.7 },
      ],
    },
    {
      period: "monthly",
      pattern: [
        { label: "January", errorRate: 71.2, correlationStrength: 0.76, recoverySuccess: 65.8, riskScore: 7.3 },
        { label: "February", errorRate: 68.9, correlationStrength: 0.73, recoverySuccess: 68.1, riskScore: 6.9 },
        { label: "March", errorRate: 74.5, correlationStrength: 0.79, recoverySuccess: 63.2, riskScore: 7.8 },
        { label: "April", errorRate: 69.7, correlationStrength: 0.74, recoverySuccess: 66.9, riskScore: 7.1 },
        { label: "May", errorRate: 72.3, correlationStrength: 0.77, recoverySuccess: 64.7, riskScore: 7.5 },
        { label: "June", errorRate: 76.8, correlationStrength: 0.82, recoverySuccess: 61.4, riskScore: 8.2 },
      ],
    },
  ])

  const [predictiveInsights] = useState<PredictiveInsight[]>([
    {
      timeframe: "Next 2 Hours (15:00-17:00)",
      prediction: "High probability of database-server correlation spike during afternoon peak",
      confidence: 87.3,
      riskLevel: "critical",
      recommendedActions: [
        "Pre-emptively scale database connections",
        "Activate enhanced circuit breaker thresholds",
        "Prepare fallback systems",
      ],
      basedOn: ["Historical 9-11 AM pattern", "Current system load", "Weekly trend analysis"],
    },
    {
      timeframe: "Tonight (18:00-20:00)",
      prediction: "Network timeout correlations expected to increase by 40%",
      confidence: 73.8,
      riskLevel: "high",
      recommendedActions: [
        "Implement aggressive retry policies",
        "Monitor network latency closely",
        "Prepare load balancing adjustments",
      ],
      basedOn: ["Evening peak patterns", "Network performance trends", "User activity forecasts"],
    },
    {
      timeframe: "Tomorrow Morning (09:00-11:00)",
      prediction: "Monday morning authentication cascade likely (85% probability)",
      confidence: 91.2,
      riskLevel: "critical",
      recommendedActions: [
        "Pre-refresh authentication tokens",
        "Scale session management systems",
        "Deploy proactive health checks",
      ],
      basedOn: ["Weekly Monday patterns", "Authentication failure trends", "Session timeout correlations"],
    },
    {
      timeframe: "End of Month (Days 28-31)",
      prediction: "Storage-related error correlations will intensify",
      confidence: 68.4,
      riskLevel: "medium",
      recommendedActions: [
        "Execute automated cleanup procedures",
        "Monitor storage usage closely",
        "Prepare additional storage capacity",
      ],
      basedOn: ["Monthly storage patterns", "Historical end-of-month data", "Growth trend analysis"],
    },
  ])

  const runTemporalAnalysis = async () => {
    setIsLoading(true)
    try {
      await analyzeTemporalPatterns(selectedTimeWindow)
      setAnalysisTimestamp(new Date())
      toast({
        title: "✅ Analysis Complete",
        description: `Temporal pattern analysis completed for ${selectedTimeWindow} window`,
        className: "bg-white border-green-200 text-green-800 shadow-lg",
      })
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to complete temporal analysis",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "increasing":
        return "text-red-600 bg-red-50"
      case "decreasing":
        return "text-green-600 bg-green-50"
      case "stable":
        return "text-blue-600 bg-blue-50"
      case "volatile":
        return "text-orange-600 bg-orange-50"
      default:
        return "text-gray-600 bg-gray-50"
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "critical":
        return "text-red-600 bg-red-50 border-red-200"
      case "high":
        return "text-orange-600 bg-orange-50 border-orange-200"
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200"
      case "low":
        return "text-green-600 bg-green-50 border-green-200"
      default:
        return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  const getSeasonalityIcon = (seasonality: string) => {
    switch (seasonality) {
      case "daily":
        return "🌅"
      case "weekly":
        return "📅"
      case "monthly":
        return "🗓️"
      default:
        return "⏰"
    }
  }

  return (
    <div className="space-y-6 bg-white min-h-screen p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black">Temporal Pattern Analysis</h1>
          <p className="text-gray-600 mt-1">
            Study how error correlations evolve across different time periods and seasonal patterns
          </p>
          {analysisTimestamp && (
            <p className="text-sm text-gray-500 mt-1">Last analyzed: {analysisTimestamp.toLocaleString()}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedTimeWindow} onValueChange={setSelectedTimeWindow}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">1 Hour</SelectItem>
              <SelectItem value="6h">6 Hours</SelectItem>
              <SelectItem value="24h">24 Hours</SelectItem>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={runTemporalAnalysis}
            disabled={isLoading}
            className="bg-blue-500 hover:bg-blue-600 text-white disabled:bg-blue-300 disabled:cursor-not-allowed px-6 py-2 font-medium"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Analyzing...
              </div>
            ) : (
              <div className="flex items-center gap-2">📊 Run Analysis</div>
            )}
          </Button>
        </div>
      </div>

      {/* Time Window Overview */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-black text-xl flex items-center gap-2">⏰ Time Window Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {timeWindowAnalysis.map((window, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                  selectedTimeWindow === window.window.toLowerCase().replace(/\s+/g, "").replace("last", "")
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 bg-white hover:border-blue-300"
                }`}
              >
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">{window.totalErrors}</div>
                  <div className="text-xs text-gray-600 mb-2">{window.window}</div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span>Correlations:</span>
                      <span className="font-medium">{window.uniqueCorrelations}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg Strength:</span>
                      <span className="font-medium">{(window.avgCorrelation * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Recovery:</span>
                      <span className="font-medium">{window.recoveryEffectiveness.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="correlations" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="correlations">Temporal Correlations</TabsTrigger>
          <TabsTrigger value="seasonal">Seasonal Patterns</TabsTrigger>
          <TabsTrigger value="predictions">Predictive Insights</TabsTrigger>
          <TabsTrigger value="trends">Trend Analysis</TabsTrigger>
        </TabsList>

        {/* Temporal Correlations Tab */}
        <TabsContent value="correlations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-black text-xl flex items-center gap-2">
                🔗 Time-Based Error Correlations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {temporalCorrelations.map((correlation, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="bg-gray-100 px-2 py-1 rounded font-mono text-sm">#{index + 1}</span>
                        <Badge className={getRiskColor(correlation.riskLevel)}>
                          {correlation.riskLevel.toUpperCase()} RISK
                        </Badge>
                        <Badge className={getTrendColor(correlation.trend)}>{correlation.trend.toUpperCase()}</Badge>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Correlation</div>
                        <div className="text-lg font-bold text-red-600">
                          {(correlation.correlation * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="flex items-center gap-2 text-sm mb-2">
                        <span className="bg-blue-100 px-3 py-1 rounded font-medium text-blue-800">
                          {correlation.errorA}
                        </span>
                        <span className="text-gray-400">→</span>
                        <span className="bg-red-100 px-3 py-1 rounded font-medium text-red-800">
                          {correlation.errorB}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-600">
                        <span className="flex items-center gap-1">
                          ⏰ <strong>{correlation.timeWindow}</strong>
                        </span>
                        <span className="flex items-center gap-1">
                          {getSeasonalityIcon(correlation.seasonality)} <strong>{correlation.seasonality}</strong>
                        </span>
                        <span className="flex items-center gap-1">
                          📊 <strong>{correlation.frequency} occurrences</strong>
                        </span>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-3 rounded">
                      <div className="text-sm font-medium text-gray-700 mb-1">Peak Hours:</div>
                      <div className="flex flex-wrap gap-1">
                        {correlation.peakHours.map((hour, hourIndex) => (
                          <span key={hourIndex} className="bg-blue-100 px-2 py-1 rounded text-xs text-blue-800">
                            {correlation.seasonality === "monthly" ? `Day ${hour}` : `${hour}:00`}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Seasonal Patterns Tab */}
        <TabsContent value="seasonal" className="space-y-4">
          {seasonalPatterns.map((seasonal, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-black text-lg flex items-center gap-2">
                  {getSeasonalityIcon(seasonal.period)}{" "}
                  {seasonal.period.charAt(0).toUpperCase() + seasonal.period.slice(1)} Patterns
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {seasonal.pattern.map((period, periodIndex) => (
                    <div key={periodIndex} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-800">{period.label}</span>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-1 rounded text-xs font-bold ${
                              period.riskScore >= 8
                                ? "bg-red-100 text-red-800"
                                : period.riskScore >= 6
                                  ? "bg-orange-100 text-orange-800"
                                  : period.riskScore >= 4
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-green-100 text-green-800"
                            }`}
                          >
                            Risk: {period.riskScore.toFixed(1)}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <div className="text-gray-600">Error Rate</div>
                          <div className="font-semibold text-red-600">{period.errorRate.toFixed(1)}%</div>
                          <Progress value={period.errorRate} className="h-1 mt-1" />
                        </div>
                        <div>
                          <div className="text-gray-600">Correlation Strength</div>
                          <div className="font-semibold text-orange-600">
                            {(period.correlationStrength * 100).toFixed(1)}%
                          </div>
                          <Progress value={period.correlationStrength * 100} className="h-1 mt-1" />
                        </div>
                        <div>
                          <div className="text-gray-600">Recovery Success</div>
                          <div className="font-semibold text-green-600">{period.recoverySuccess.toFixed(1)}%</div>
                          <Progress value={period.recoverySuccess} className="h-1 mt-1" />
                        </div>
                        <div>
                          <div className="text-gray-600">Risk Score</div>
                          <div className="font-semibold text-purple-600">{period.riskScore.toFixed(1)}/10</div>
                          <Progress value={period.riskScore * 10} className="h-1 mt-1" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Predictive Insights Tab */}
        <TabsContent value="predictions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-black text-xl flex items-center gap-2">🔮 Predictive Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {predictiveInsights.map((insight, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="bg-purple-100 px-2 py-1 rounded font-mono text-sm text-purple-800">
                          {insight.timeframe}
                        </span>
                        <Badge className={getRiskColor(insight.riskLevel)}>
                          {insight.riskLevel.toUpperCase()} RISK
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Confidence</div>
                        <div className="text-lg font-bold text-blue-600">{insight.confidence.toFixed(1)}%</div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="text-sm font-medium text-gray-700 mb-1">Prediction:</div>
                      <div className="text-gray-800 bg-gray-50 p-3 rounded">{insight.prediction}</div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm font-medium text-green-700 mb-2">Recommended Actions:</div>
                        <ul className="space-y-1">
                          {insight.recommendedActions.map((action, actionIndex) => (
                            <li key={actionIndex} className="flex items-start gap-2 text-sm text-green-600">
                              <span className="text-green-500 mt-1">•</span>
                              <span>{action}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-blue-700 mb-2">Based On:</div>
                        <ul className="space-y-1">
                          {insight.basedOn.map((basis, basisIndex) => (
                            <li key={basisIndex} className="flex items-start gap-2 text-sm text-blue-600">
                              <span className="text-blue-500 mt-1">•</span>
                              <span>{basis}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trend Analysis Tab */}
        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-black text-lg">📈 Correlation Trend Evolution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-red-50 border border-red-200 rounded p-3">
                    <div className="text-sm font-medium text-red-800 mb-1">Increasing Trends (⚠️ High Risk)</div>
                    <div className="space-y-1 text-sm text-red-700">
                      <div>• Database-Server correlation: +23% over 7 days</div>
                      <div>• Storage-Disk correlation: +18% monthly trend</div>
                      <div>• Peak hour intensity: +15% week-over-week</div>
                    </div>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded p-3">
                    <div className="text-sm font-medium text-green-800 mb-1">Decreasing Trends (✅ Improving)</div>
                    <div className="space-y-1 text-sm text-green-700">
                      <div>• Validation-Config correlation: -12% over 14 days</div>
                      <div>• Monday morning spikes: -8% monthly improvement</div>
                      <div>• Weekend error rates: -25% sustained reduction</div>
                    </div>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded p-3">
                    <div className="text-sm font-medium text-blue-800 mb-1">Stable Patterns (📊 Predictable)</div>
                    <div className="space-y-1 text-sm text-blue-700">
                      <div>• Auth-Session correlation: Consistent 76-82%</div>
                      <div>• Business hours pattern: Stable daily cycle</div>
                      <div>• Recovery effectiveness: Steady 70-75%</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-black text-lg">🎯 Critical Time Windows</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="border-l-4 border-red-500 pl-3">
                    <div className="font-medium text-red-800">Monday 9-11 AM</div>
                    <div className="text-sm text-red-600">Highest correlation intensity (94%)</div>
                    <div className="text-xs text-gray-600">Database-Server cascade peak</div>
                  </div>
                  <div className="border-l-4 border-orange-500 pl-3">
                    <div className="font-medium text-orange-800">Friday 6-8 PM</div>
                    <div className="text-sm text-orange-600">Network timeout surge (76%)</div>
                    <div className="text-xs text-gray-600">End-of-week load spike</div>
                  </div>
                  <div className="border-l-4 border-yellow-500 pl-3">
                    <div className="font-medium text-yellow-800">Month End (Days 28-31)</div>
                    <div className="text-sm text-yellow-600">Storage correlation rise (68%)</div>
                    <div className="text-xs text-gray-600">Monthly data processing peak</div>
                  </div>
                  <div className="border-l-4 border-blue-500 pl-3">
                    <div className="font-medium text-blue-800">Lunch Hours 12-2 PM</div>
                    <div className="text-sm text-blue-600">Rate limit correlations (58%)</div>
                    <div className="text-xs text-gray-600">Peak usage period</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-black text-lg">🔄 Recovery Pattern Effectiveness Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 border border-green-200 rounded p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">85.2%</div>
                    <div className="text-sm text-green-800">Night Hours (00-06)</div>
                    <div className="text-xs text-gray-600">Best recovery performance</div>
                  </div>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">58.3%</div>
                    <div className="text-sm text-yellow-800">Peak Hours (09-12)</div>
                    <div className="text-xs text-gray-600">Lowest recovery success</div>
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">69.4%</div>
                    <div className="text-sm text-blue-800">Weekly Average</div>
                    <div className="text-xs text-gray-600">Overall effectiveness</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Key Insights Alert */}
      <Alert className="border-orange-200 bg-orange-50">
        <AlertTitle className="text-orange-800">🔍 Key Temporal Insights</AlertTitle>
        <AlertDescription className="text-orange-700">
          <div className="space-y-2 mt-2">
            <div>
              <strong>Critical Finding:</strong> Database-Server correlations intensify by 94% during Monday morning
              peaks (9-11 AM), requiring immediate attention.
            </div>
            <div>
              <strong>Positive Trend:</strong> Weekend error rates have decreased by 25% over the past month, indicating
              successful load balancing improvements.
            </div>
            <div>
              <strong>Predictive Alert:</strong> Next 2 hours show 87.3% probability of correlation spike - proactive
              measures recommended.
            </div>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  )
}
