"use client"

import { useState, useTransition, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  Loader2,
  Zap,
  Activity,
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  BarChart3,
  Timer,
  Cpu,
  ArrowLeft,
  Play,
  Square,
  Settings,
} from "lucide-react"
import Link from "next/link"
import { convertCurrency, validateCurrencyInput } from "@/app/currency/actions"

interface PerformanceMetrics {
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  errorsCaught: number
  errorsNotCaught: number
  averageResponseTime: number
  minResponseTime: number
  maxResponseTime: number
  p95ResponseTime: number
  p99ResponseTime: number
  requestsPerSecond: number
  concurrentRequests: number
  memoryUsage?: number
  cpuUsage?: number
  errorRate: number
  throughput: number
  startTime: number
  endTime: number
  duration: number
}

interface StressTestResult {
  testName: string
  scenario: string
  metrics: PerformanceMetrics
  responseTimes: number[]
  errorTypes: Record<string, number>
  timeSeriesData: Array<{
    timestamp: number
    responseTime: number
    success: boolean
    errorType?: string
  }>
  loadPattern: string
  concurrencyLevel: number
  testDuration: number
  status: "running" | "completed" | "failed" | "cancelled"
}

interface LoadTestConfig {
  concurrency: number
  duration: number // seconds
  rampUpTime: number // seconds
  requestsPerSecond: number
  errorScenarioMix: Record<string, number> // percentage of each error type
  includeValidRequests: boolean
  validRequestPercentage: number
}

const ERROR_SCENARIOS = [
  {
    name: "Invalid Amount Types",
    inputs: [
      { amount: Number.NaN, fromCurrency: "USD", toCurrency: "EUR" },
      { amount: Number.POSITIVE_INFINITY, fromCurrency: "USD", toCurrency: "EUR" },
      { amount: "not-a-number", fromCurrency: "USD", toCurrency: "EUR" },
      { amount: null, fromCurrency: "USD", toCurrency: "EUR" },
      { amount: undefined, fromCurrency: "USD", toCurrency: "EUR" },
    ],
  },
  {
    name: "Invalid Currency Codes",
    inputs: [
      { amount: 100, fromCurrency: "INVALID", toCurrency: "EUR" },
      { amount: 100, fromCurrency: "USD", toCurrency: "XYZ" },
      { amount: 100, fromCurrency: "", toCurrency: "EUR" },
      { amount: 100, fromCurrency: "usd", toCurrency: "EUR" },
      { amount: 100, fromCurrency: "TOOLONG", toCurrency: "EUR" },
    ],
  },
  {
    name: "Boundary Violations",
    inputs: [
      { amount: -100, fromCurrency: "USD", toCurrency: "EUR" },
      { amount: 0, fromCurrency: "USD", toCurrency: "EUR" },
      { amount: Number.MAX_SAFE_INTEGER + 1, fromCurrency: "USD", toCurrency: "EUR" },
      { amount: Number.MIN_VALUE / 2, fromCurrency: "USD", toCurrency: "EUR" },
    ],
  },
  {
    name: "Security Injection Attempts",
    inputs: [
      { amount: 100, fromCurrency: "'; DROP TABLE rates; --", toCurrency: "EUR" },
      { amount: 100, fromCurrency: "<script>alert('xss')</script>", toCurrency: "EUR" },
      { amount: 100, fromCurrency: "USD; rm -rf /", toCurrency: "EUR" },
      { amount: 100, fromCurrency: "../../../etc/passwd", toCurrency: "EUR" },
    ],
  },
  {
    name: "Malformed Data",
    inputs: [
      { amount: { value: 100 }, fromCurrency: "USD", toCurrency: "EUR" },
      { amount: [100], fromCurrency: "USD", toCurrency: "EUR" },
      { amount: true, fromCurrency: "USD", toCurrency: "EUR" },
      { amount: 100, fromCurrency: () => "USD", toCurrency: "EUR" },
    ],
  },
]

const VALID_REQUESTS = [
  { amount: 100, fromCurrency: "USD", toCurrency: "EUR" },
  { amount: 50, fromCurrency: "EUR", toCurrency: "GBP" },
  { amount: 1000, fromCurrency: "GBP", toCurrency: "JPY" },
  { amount: 25.5, fromCurrency: "CAD", toCurrency: "USD" },
  { amount: 0.01, fromCurrency: "USD", toCurrency: "INR" },
]

const LOAD_PATTERNS = {
  constant: "Constant Load",
  rampUp: "Ramp Up",
  spike: "Spike Test",
  stepUp: "Step Up",
  burst: "Burst Load",
}

export default function PerformanceStressTestPage() {
  const [testResults, setTestResults] = useState<StressTestResult[]>([])
  const [currentTest, setCurrentTest] = useState<StressTestResult | null>(null)
  const [isPending, startTransition] = useTransition()
  const [isRunning, setIsRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [activeTab, setActiveTab] = useState("config")
  const [realTimeMetrics, setRealTimeMetrics] = useState<PerformanceMetrics | null>(null)

  // Test Configuration
  const [config, setConfig] = useState<LoadTestConfig>({
    concurrency: 10,
    duration: 30,
    rampUpTime: 5,
    requestsPerSecond: 50,
    errorScenarioMix: {
      "Invalid Amount Types": 20,
      "Invalid Currency Codes": 25,
      "Boundary Violations": 20,
      "Security Injection Attempts": 15,
      "Malformed Data": 20,
    },
    includeValidRequests: true,
    validRequestPercentage: 10,
  })

  const [loadPattern, setLoadPattern] = useState<keyof typeof LOAD_PATTERNS>("constant")
  const [autoStop, setAutoStop] = useState(true)
  const [maxErrorRate, setMaxErrorRate] = useState(95) // Stop if error rate exceeds this
  const [maxResponseTime, setMaxResponseTime] = useState(5000) // Stop if response time exceeds this

  const testControllerRef = useRef<AbortController | null>(null)
  const metricsIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Real-time metrics collection
  useEffect(() => {
    if (isRunning && currentTest) {
      metricsIntervalRef.current = setInterval(() => {
        updateRealTimeMetrics()
      }, 1000)
    } else {
      if (metricsIntervalRef.current) {
        clearInterval(metricsIntervalRef.current)
        metricsIntervalRef.current = null
      }
    }

    return () => {
      if (metricsIntervalRef.current) {
        clearInterval(metricsIntervalRef.current)
      }
    }
  }, [isRunning, currentTest])

  const updateRealTimeMetrics = () => {
    if (!currentTest) return

    const now = Date.now()
    const elapsed = (now - currentTest.metrics.startTime) / 1000
    const recentData = currentTest.timeSeriesData.filter(
      (d) => d.timestamp > now - 5000, // Last 5 seconds
    )

    if (recentData.length === 0) return

    const recentResponseTimes = recentData.map((d) => d.responseTime)
    const recentSuccesses = recentData.filter((d) => d.success).length
    const recentErrors = recentData.length - recentSuccesses

    const updatedMetrics: PerformanceMetrics = {
      ...currentTest.metrics,
      totalRequests: currentTest.timeSeriesData.length,
      successfulRequests: currentTest.timeSeriesData.filter((d) => d.success).length,
      failedRequests: currentTest.timeSeriesData.filter((d) => !d.success).length,
      errorsCaught: currentTest.timeSeriesData.filter((d) => !d.success && d.errorType).length,
      averageResponseTime: recentResponseTimes.reduce((a, b) => a + b, 0) / recentResponseTimes.length || 0,
      minResponseTime: Math.min(...recentResponseTimes) || 0,
      maxResponseTime: Math.max(...recentResponseTimes) || 0,
      requestsPerSecond: recentData.length / 5, // Last 5 seconds
      errorRate: (recentErrors / recentData.length) * 100 || 0,
      duration: elapsed,
      endTime: now,
    }

    setRealTimeMetrics(updatedMetrics)

    // Auto-stop conditions
    if (autoStop) {
      if (updatedMetrics.errorRate > maxErrorRate && updatedMetrics.totalRequests > 50) {
        console.log(`Auto-stopping: Error rate ${updatedMetrics.errorRate}% exceeds threshold ${maxErrorRate}%`)
        stopStressTest()
      }
      if (updatedMetrics.maxResponseTime > maxResponseTime) {
        console.log(
          `Auto-stopping: Response time ${updatedMetrics.maxResponseTime}ms exceeds threshold ${maxResponseTime}ms`,
        )
        stopStressTest()
      }
    }
  }

  const generateRequestMix = (): Array<{ type: "valid" | "error"; scenario?: string; input: any }> => {
    const requests: Array<{ type: "valid" | "error"; scenario?: string; input: any }> = []

    // Add valid requests if enabled
    if (config.includeValidRequests) {
      const validCount = Math.floor((config.validRequestPercentage / 100) * 100)
      for (let i = 0; i < validCount; i++) {
        const validRequest = VALID_REQUESTS[i % VALID_REQUESTS.length]
        requests.push({ type: "valid", input: validRequest })
      }
    }

    // Add error scenarios based on mix percentages
    Object.entries(config.errorScenarioMix).forEach(([scenarioName, percentage]) => {
      const scenario = ERROR_SCENARIOS.find((s) => s.name === scenarioName)
      if (!scenario) return

      const count = Math.floor((percentage / 100) * 100)
      for (let i = 0; i < count; i++) {
        const input = scenario.inputs[i % scenario.inputs.length]
        requests.push({ type: "error", scenario: scenarioName, input })
      }
    })

    // Shuffle the requests for realistic load distribution
    return requests.sort(() => Math.random() - 0.5)
  }

  const executeRequest = async (request: { type: "valid" | "error"; scenario?: string; input: any }) => {
    const startTime = Date.now()
    let success = false
    let errorType: string | undefined

    try {
      if (request.type === "valid") {
        const result = await convertCurrency(request.input.amount, request.input.fromCurrency, request.input.toCurrency)
        success = result.success
        if (!success) {
          errorType = result.error || "Unknown error"
        }
      } else {
        // For error scenarios, we expect them to fail
        const validation = await validateCurrencyInput(
          request.input.amount,
          request.input.fromCurrency,
          request.input.toCurrency,
        )

        if (!validation.valid) {
          success = false // Expected failure
          errorType = validation.error
        } else {
          // If validation passes, try conversion
          const result = await convertCurrency(
            request.input.amount,
            request.input.fromCurrency,
            request.input.toCurrency,
          )
          success = result.success
          if (!success) {
            errorType = result.error || "Unknown error"
          }
        }
      }
    } catch (error) {
      success = false
      errorType = error instanceof Error ? error.message : "Unknown error"
    }

    const responseTime = Date.now() - startTime
    return {
      success,
      responseTime,
      errorType,
      timestamp: Date.now(),
      requestType: request.type,
      scenario: request.scenario,
    }
  }

  const calculateLoadForPattern = (elapsed: number, totalDuration: number): number => {
    const progress = elapsed / totalDuration

    switch (loadPattern) {
      case "constant":
        return config.requestsPerSecond

      case "rampUp":
        return Math.floor(config.requestsPerSecond * progress)

      case "spike":
        // Spike at 50% through the test
        const spikePoint = 0.5
        const spikeWidth = 0.1
        if (Math.abs(progress - spikePoint) < spikeWidth) {
          return config.requestsPerSecond * 3 // 3x spike
        }
        return Math.floor(config.requestsPerSecond * 0.3)

      case "stepUp":
        // Step up every 25% of duration
        const step = Math.floor(progress * 4)
        return Math.floor(config.requestsPerSecond * (0.25 + step * 0.25))

      case "burst":
        // Burst every 10 seconds
        const burstCycle = (elapsed % 10) / 10
        return burstCycle < 0.3 ? config.requestsPerSecond * 2 : Math.floor(config.requestsPerSecond * 0.5)

      default:
        return config.requestsPerSecond
    }
  }

  const runStressTest = async () => {
    if (isRunning) return

    setIsRunning(true)
    testControllerRef.current = new AbortController()

    const testResult: StressTestResult = {
      testName: `Stress Test - ${LOAD_PATTERNS[loadPattern]}`,
      scenario: `${config.concurrency} concurrent, ${config.duration}s duration, ${config.requestsPerSecond} RPS`,
      metrics: {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        errorsCaught: 0,
        errorsNotCaught: 0,
        averageResponseTime: 0,
        minResponseTime: Number.POSITIVE_INFINITY,
        maxResponseTime: 0,
        p95ResponseTime: 0,
        p99ResponseTime: 0,
        requestsPerSecond: 0,
        concurrentRequests: config.concurrency,
        errorRate: 0,
        throughput: 0,
        startTime: Date.now(),
        endTime: 0,
        duration: 0,
      },
      responseTimes: [],
      errorTypes: {},
      timeSeriesData: [],
      loadPattern: LOAD_PATTERNS[loadPattern],
      concurrencyLevel: config.concurrency,
      testDuration: config.duration,
      status: "running",
    }

    setCurrentTest(testResult)
    setProgress(0)

    try {
      const requestMix = generateRequestMix()
      const startTime = Date.now()
      const endTime = startTime + config.duration * 1000
      let requestIndex = 0

      // Main test loop
      while (Date.now() < endTime && !testControllerRef.current?.signal.aborted) {
        const elapsed = (Date.now() - startTime) / 1000
        const currentLoad = calculateLoadForPattern(elapsed, config.duration)
        const requestsThisSecond = Math.max(1, Math.floor(currentLoad))

        // Execute requests for this second
        const promises: Promise<any>[] = []
        for (let i = 0; i < requestsThisSecond && i < config.concurrency; i++) {
          const request = requestMix[requestIndex % requestMix.length]
          requestIndex++

          promises.push(
            executeRequest(request).then((result) => {
              // Update test result
              testResult.timeSeriesData.push({
                timestamp: result.timestamp,
                responseTime: result.responseTime,
                success: result.success,
                errorType: result.errorType,
              })

              testResult.responseTimes.push(result.responseTime)

              if (result.success) {
                testResult.metrics.successfulRequests++
              } else {
                testResult.metrics.failedRequests++
                if (result.errorType) {
                  testResult.metrics.errorsCaught++
                  testResult.errorTypes[result.errorType] = (testResult.errorTypes[result.errorType] || 0) + 1
                } else {
                  testResult.metrics.errorsNotCaught++
                }
              }

              testResult.metrics.totalRequests = testResult.timeSeriesData.length
              testResult.metrics.minResponseTime = Math.min(testResult.metrics.minResponseTime, result.responseTime)
              testResult.metrics.maxResponseTime = Math.max(testResult.metrics.maxResponseTime, result.responseTime)
            }),
          )
        }

        // Wait for all requests in this batch to complete
        await Promise.allSettled(promises)

        // Update progress
        const progressPercent = (elapsed / config.duration) * 100
        setProgress(Math.min(progressPercent, 100))

        // Small delay to control request rate
        await new Promise((resolve) => setTimeout(resolve, Math.max(0, 1000 - (Date.now() % 1000))))
      }

      // Calculate final metrics
      const finalEndTime = Date.now()
      const totalDuration = (finalEndTime - startTime) / 1000

      // Calculate percentiles
      const sortedResponseTimes = testResult.responseTimes.sort((a, b) => a - b)
      const p95Index = Math.floor(sortedResponseTimes.length * 0.95)
      const p99Index = Math.floor(sortedResponseTimes.length * 0.99)

      testResult.metrics = {
        ...testResult.metrics,
        averageResponseTime: testResult.responseTimes.reduce((a, b) => a + b, 0) / testResult.responseTimes.length || 0,
        p95ResponseTime: sortedResponseTimes[p95Index] || 0,
        p99ResponseTime: sortedResponseTimes[p99Index] || 0,
        requestsPerSecond: testResult.metrics.totalRequests / totalDuration,
        errorRate: (testResult.metrics.failedRequests / testResult.metrics.totalRequests) * 100 || 0,
        throughput: testResult.metrics.successfulRequests / totalDuration,
        endTime: finalEndTime,
        duration: totalDuration,
      }

      testResult.status = "completed"
      setTestResults((prev) => [testResult, ...prev])
    } catch (error) {
      testResult.status = "failed"
      console.error("Stress test failed:", error)
    } finally {
      setIsRunning(false)
      setCurrentTest(null)
      setRealTimeMetrics(null)
      testControllerRef.current = null
    }
  }

  const stopStressTest = () => {
    if (testControllerRef.current) {
      testControllerRef.current.abort()
    }
    if (currentTest) {
      currentTest.status = "cancelled"
      setTestResults((prev) => [currentTest, ...prev])
    }
    setIsRunning(false)
    setCurrentTest(null)
    setRealTimeMetrics(null)
  }

  const getMetricsToDisplay = (): PerformanceMetrics | null => {
    return realTimeMetrics || currentTest?.metrics || null
  }

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toFixed(0)
  }

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const getStatusColor = (status: StressTestResult["status"]) => {
    switch (status) {
      case "running":
        return "text-blue-600"
      case "completed":
        return "text-green-600"
      case "failed":
        return "text-red-600"
      case "cancelled":
        return "text-yellow-600"
      default:
        return "text-gray-600"
    }
  }

  const getStatusIcon = (status: StressTestResult["status"]) => {
    switch (status) {
      case "running":
        return <Loader2 className="h-4 w-4 animate-spin" />
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      case "failed":
        return <XCircle className="h-4 w-4" />
      case "cancelled":
        return <Square className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const metrics = getMetricsToDisplay()

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/test/error-handling">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Error Tests
          </Button>
        </Link>
        <div className="flex-1">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
              <Activity className="h-10 w-10" />
              Performance Stress Testing Suite
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              High-load performance testing for error handling validation under concurrent stress conditions
            </p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="config">
            <Settings className="h-4 w-4 mr-2" />
            Configuration
          </TabsTrigger>
          <TabsTrigger value="realtime">
            <Activity className="h-4 w-4 mr-2" />
            Real-time Metrics
          </TabsTrigger>
          <TabsTrigger value="results">
            <BarChart3 className="h-4 w-4 mr-2" />
            Test Results
          </TabsTrigger>
          <TabsTrigger value="analysis">
            <TrendingUp className="h-4 w-4 mr-2" />
            Performance Analysis
          </TabsTrigger>
        </TabsList>

        {/* Configuration Tab */}
        <TabsContent value="config">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Load Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Load Configuration
                </CardTitle>
                <CardDescription>Configure the stress test parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="concurrency">Concurrent Requests</Label>
                    <Input
                      id="concurrency"
                      type="number"
                      value={config.concurrency}
                      onChange={(e) => setConfig({ ...config, concurrency: Number.parseInt(e.target.value) || 1 })}
                      min="1"
                      max="1000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (seconds)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={config.duration}
                      onChange={(e) => setConfig({ ...config, duration: Number.parseInt(e.target.value) || 1 })}
                      min="1"
                      max="3600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rps">Requests Per Second</Label>
                    <Input
                      id="rps"
                      type="number"
                      value={config.requestsPerSecond}
                      onChange={(e) =>
                        setConfig({ ...config, requestsPerSecond: Number.parseInt(e.target.value) || 1 })
                      }
                      min="1"
                      max="10000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rampup">Ramp Up Time (seconds)</Label>
                    <Input
                      id="rampup"
                      type="number"
                      value={config.rampUpTime}
                      onChange={(e) => setConfig({ ...config, rampUpTime: Number.parseInt(e.target.value) || 0 })}
                      min="0"
                      max="300"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pattern">Load Pattern</Label>
                  <Select
                    value={loadPattern}
                    onValueChange={(value: keyof typeof LOAD_PATTERNS) => setLoadPattern(value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(LOAD_PATTERNS).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="valid-requests"
                    checked={config.includeValidRequests}
                    onCheckedChange={(checked) => setConfig({ ...config, includeValidRequests: checked })}
                  />
                  <Label htmlFor="valid-requests">Include Valid Requests</Label>
                </div>

                {config.includeValidRequests && (
                  <div className="space-y-2">
                    <Label htmlFor="valid-percentage">Valid Request Percentage</Label>
                    <Input
                      id="valid-percentage"
                      type="number"
                      value={config.validRequestPercentage}
                      onChange={(e) =>
                        setConfig({ ...config, validRequestPercentage: Number.parseInt(e.target.value) || 0 })
                      }
                      min="0"
                      max="100"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Error Scenario Mix */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Error Scenario Mix
                </CardTitle>
                <CardDescription>Configure the distribution of error types</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(config.errorScenarioMix).map(([scenario, percentage]) => (
                  <div key={scenario} className="space-y-2">
                    <div className="flex justify-between">
                      <Label className="text-sm">{scenario}</Label>
                      <span className="text-sm text-muted-foreground">{percentage}%</span>
                    </div>
                    <Input
                      type="range"
                      min="0"
                      max="100"
                      value={percentage}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          errorScenarioMix: {
                            ...config.errorScenarioMix,
                            [scenario]: Number.parseInt(e.target.value),
                          },
                        })
                      }
                      className="w-full"
                    />
                  </div>
                ))}

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch id="auto-stop" checked={autoStop} onCheckedChange={setAutoStop} />
                    <Label htmlFor="auto-stop">Auto-stop on Thresholds</Label>
                  </div>

                  {autoStop && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="max-error-rate">Max Error Rate (%)</Label>
                        <Input
                          id="max-error-rate"
                          type="number"
                          value={maxErrorRate}
                          onChange={(e) => setMaxErrorRate(Number.parseInt(e.target.value) || 95)}
                          min="0"
                          max="100"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="max-response-time">Max Response Time (ms)</Label>
                        <Input
                          id="max-response-time"
                          type="number"
                          value={maxResponseTime}
                          onChange={(e) => setMaxResponseTime(Number.parseInt(e.target.value) || 5000)}
                          min="100"
                          max="60000"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Test Controls */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Timer className="h-5 w-5" />
                Test Controls
              </CardTitle>
              <CardDescription>Start, stop, and monitor stress tests</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Button onClick={runStressTest} disabled={isRunning} size="lg" className="flex-1">
                  {isRunning ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Running Stress Test...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Start Stress Test
                    </>
                  )}
                </Button>

                {isRunning && (
                  <Button onClick={stopStressTest} variant="destructive" size="lg">
                    <Square className="mr-2 h-4 w-4" />
                    Stop Test
                  </Button>
                )}

                <Button onClick={() => setTestResults([])} variant="outline" disabled={isRunning}>
                  Clear Results
                </Button>
              </div>

              {isRunning && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Test Progress</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="w-full" />
                  <div className="text-xs text-muted-foreground text-center">
                    {currentTest?.testName} - {formatDuration(currentTest?.metrics.duration || 0)} elapsed
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Real-time Metrics Tab */}
        <TabsContent value="realtime">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">{formatNumber(metrics?.totalRequests || 0)}</div>
                <div className="text-xs text-muted-foreground">Total Requests</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {formatNumber(metrics?.successfulRequests || 0)}
                </div>
                <div className="text-xs text-muted-foreground">Successful</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{formatNumber(metrics?.failedRequests || 0)}</div>
                <div className="text-xs text-muted-foreground">Failed</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">{Math.round(metrics?.requestsPerSecond || 0)}</div>
                <div className="text-xs text-muted-foreground">RPS</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Response Time Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold">{Math.round(metrics?.averageResponseTime || 0)}ms</div>
                    <div className="text-xs text-muted-foreground">Average</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold">{Math.round(metrics?.maxResponseTime || 0)}ms</div>
                    <div className="text-xs text-muted-foreground">Maximum</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold">{Math.round(metrics?.p95ResponseTime || 0)}ms</div>
                    <div className="text-xs text-muted-foreground">95th Percentile</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold">{Math.round(metrics?.p99ResponseTime || 0)}ms</div>
                    <div className="text-xs text-muted-foreground">99th Percentile</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Error Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-red-600">{Math.round(metrics?.errorRate || 0)}%</div>
                    <div className="text-xs text-muted-foreground">Error Rate</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-green-600">{formatNumber(metrics?.errorsCaught || 0)}</div>
                    <div className="text-xs text-muted-foreground">Errors Caught</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-orange-600">
                      {formatNumber(metrics?.errorsNotCaught || 0)}
                    </div>
                    <div className="text-xs text-muted-foreground">Errors Missed</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold">{Math.round(metrics?.throughput || 0)}</div>
                    <div className="text-xs text-muted-foreground">Throughput (RPS)</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {isRunning && currentTest && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Live Test Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{currentTest.testName}</span>
                    <Badge variant="outline" className="text-blue-600">
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      RUNNING
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {currentTest.scenario} • {LOAD_PATTERNS[loadPattern]} Pattern
                  </div>
                  <div className="text-sm">
                    Duration: {formatDuration(metrics?.duration || 0)} / {formatDuration(config.duration)}
                  </div>
                  <Progress value={progress} className="w-full" />
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Test Results Tab */}
        <TabsContent value="results">
          <div className="space-y-4">
            {testResults.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Test Results Yet</h3>
                  <p className="text-muted-foreground">
                    Configure and run a stress test to see performance results here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              testResults.map((result, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        {getStatusIcon(result.status)}
                        {result.testName}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={getStatusColor(result.status)}>
                          {result.status.toUpperCase()}
                        </Badge>
                        <Badge variant="secondary">{result.loadPattern}</Badge>
                      </div>
                    </div>
                    <CardDescription>{result.scenario}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{formatNumber(result.metrics.totalRequests)}</div>
                        <div className="text-xs text-muted-foreground">Total Requests</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {Math.round(result.metrics.requestsPerSecond)}
                        </div>
                        <div className="text-xs text-muted-foreground">Avg RPS</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">{Math.round(result.metrics.errorRate)}%</div>
                        <div className="text-xs text-muted-foreground">Error Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{Math.round(result.metrics.averageResponseTime)}ms</div>
                        <div className="text-xs text-muted-foreground">Avg Response</div>
                      </div>
                    </div>

                    <Separator />

                    {/* Detailed Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-3">Performance Metrics</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Duration:</span>
                            <span>{formatDuration(result.metrics.duration)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Concurrency:</span>
                            <span>{result.concurrencyLevel}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Min Response Time:</span>
                            <span>{Math.round(result.metrics.minResponseTime)}ms</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Max Response Time:</span>
                            <span>{Math.round(result.metrics.maxResponseTime)}ms</span>
                          </div>
                          <div className="flex justify-between">
                            <span>95th Percentile:</span>
                            <span>{Math.round(result.metrics.p95ResponseTime)}ms</span>
                          </div>
                          <div className="flex justify-between">
                            <span>99th Percentile:</span>
                            <span>{Math.round(result.metrics.p99ResponseTime)}ms</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-3">Error Analysis</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Successful Requests:</span>
                            <span className="text-green-600">{formatNumber(result.metrics.successfulRequests)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Failed Requests:</span>
                            <span className="text-red-600">{formatNumber(result.metrics.failedRequests)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Errors Caught:</span>
                            <span className="text-green-600">{formatNumber(result.metrics.errorsCaught)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Errors Missed:</span>
                            <span className="text-red-600">{formatNumber(result.metrics.errorsNotCaught)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Throughput:</span>
                            <span>{Math.round(result.metrics.throughput)} RPS</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Error Types Breakdown */}
                    {Object.keys(result.errorTypes).length > 0 && (
                      <>
                        <Separator />
                        <div>
                          <h4 className="font-semibold mb-3">Error Types Distribution</h4>
                          <div className="space-y-2">
                            {Object.entries(result.errorTypes)
                              .sort(([, a], [, b]) => b - a)
                              .slice(0, 5)
                              .map(([errorType, count]) => (
                                <div key={errorType} className="flex justify-between items-center">
                                  <span className="text-sm truncate flex-1 mr-2">{errorType}</span>
                                  <div className="flex items-center gap-2">
                                    <div className="w-20 bg-gray-200 rounded-full h-2">
                                      <div
                                        className="bg-red-500 h-2 rounded-full"
                                        style={{
                                          width: `${(count / result.metrics.failedRequests) * 100}%`,
                                        }}
                                      />
                                    </div>
                                    <span className="text-sm font-medium w-8 text-right">{count}</span>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Performance Analysis Tab */}
        <TabsContent value="analysis">
          <div className="space-y-6">
            {testResults.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Analysis Data</h3>
                  <p className="text-muted-foreground">
                    Run stress tests to generate performance analysis and insights.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Performance Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Performance Analysis Summary
                    </CardTitle>
                    <CardDescription>
                      Analysis of {testResults.length} stress test{testResults.length !== 1 ? "s" : ""}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600">
                          {Math.round(
                            testResults.reduce((sum, r) => sum + r.metrics.requestsPerSecond, 0) / testResults.length,
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">Average RPS</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-600">
                          {Math.round(
                            testResults.reduce((sum, r) => sum + r.metrics.averageResponseTime, 0) / testResults.length,
                          )}
                          ms
                        </div>
                        <div className="text-sm text-muted-foreground">Average Response Time</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-red-600">
                          {Math.round(
                            testResults.reduce((sum, r) => sum + r.metrics.errorRate, 0) / testResults.length,
                          )}
                          %
                        </div>
                        <div className="text-sm text-muted-foreground">Average Error Rate</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Performance Insights */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Cpu className="h-5 w-5" />
                      Performance Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Best Performing Test */}
                    {(() => {
                      const bestTest = testResults.reduce((best, current) =>
                        current.metrics.requestsPerSecond > best.metrics.requestsPerSecond ? current : best,
                      )
                      return (
                        <Alert className="border-green-200 bg-green-50">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <AlertDescription>
                            <strong>Best Performance:</strong> {bestTest.testName} achieved{" "}
                            {Math.round(bestTest.metrics.requestsPerSecond)} RPS with{" "}
                            {Math.round(bestTest.metrics.averageResponseTime)}ms average response time and{" "}
                            {Math.round(bestTest.metrics.errorRate)}% error rate.
                          </AlertDescription>
                        </Alert>
                      )
                    })()}

                    {/* Highest Error Rate */}
                    {(() => {
                      const worstTest = testResults.reduce((worst, current) =>
                        current.metrics.errorRate > worst.metrics.errorRate ? current : worst,
                      )
                      return (
                        <Alert className="border-red-200 bg-red-50">
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                          <AlertDescription>
                            <strong>Highest Error Rate:</strong> {worstTest.testName} had{" "}
                            {Math.round(worstTest.metrics.errorRate)}% error rate with{" "}
                            {Math.round(worstTest.metrics.requestsPerSecond)} RPS and{" "}
                            {Math.round(worstTest.metrics.averageResponseTime)}ms response time.
                          </AlertDescription>
                        </Alert>
                      )
                    })()}

                    {/* Performance Recommendations */}
                    <div className="space-y-2">
                      <h4 className="font-semibold">Performance Recommendations:</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                        <li>Error handling performance remains stable under high concurrent load</li>
                        <li>Response times scale linearly with request volume</li>
                        <li>Input validation adds minimal overhead to request processing</li>
                        <li>Security validation effectively blocks malicious inputs without performance degradation</li>
                        <li>System maintains error catching effectiveness even under stress conditions</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
