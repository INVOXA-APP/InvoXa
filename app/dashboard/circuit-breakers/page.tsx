"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/hooks/use-toast"
import {
  testCircuitBreaker,
  resetCircuitBreaker,
  updateCircuitBreakerConfig,
  getCircuitBreakerMetrics,
  simulateErrorLoad,
} from "./actions"

interface CircuitBreakerConfig {
  id: string
  name: string
  errorType: string
  state: "CLOSED" | "OPEN" | "HALF_OPEN"
  failureThreshold: number
  recoveryTimeout: number
  successThreshold: number
  enabled: boolean
  adaptive: boolean
  isolationLevel: "low" | "medium" | "high" | "critical"
  priority: number
}

interface CircuitBreakerMetrics {
  id: string
  totalRequests: number
  failedRequests: number
  successfulRequests: number
  failureRate: number
  avgResponseTime: number
  lastFailureTime: number
  recoveryAttempts: number
  cascadesPrevented: number
  isolationEvents: number
  adaptiveAdjustments: number
  stateHistory: { state: string; timestamp: number; reason: string }[]
}

interface ErrorTypePattern {
  type: string
  frequency: number
  severity: "low" | "medium" | "high" | "critical"
  correlations: string[]
  peakHours: number[]
  recoveryTime: number
  cascadeRisk: number
}

export default function CircuitBreakersPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedBreaker, setSelectedBreaker] = useState<string>("")
  const [testResults, setTestResults] = useState<any[]>([])
  const [simulationRunning, setSimulationRunning] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(5000)

  const [circuitBreakers, setCircuitBreakers] = useState<CircuitBreakerConfig[]>([
    {
      id: "db-connection",
      name: "Database Connection Breaker",
      errorType: "Database connection failed",
      state: "CLOSED",
      failureThreshold: 3,
      recoveryTimeout: 10000,
      successThreshold: 2,
      enabled: true,
      adaptive: true,
      isolationLevel: "critical",
      priority: 1,
    },
    {
      id: "auth-session",
      name: "Authentication Session Breaker",
      errorType: "Authentication expired",
      state: "CLOSED",
      failureThreshold: 5,
      recoveryTimeout: 15000,
      successThreshold: 3,
      enabled: true,
      adaptive: true,
      isolationLevel: "high",
      priority: 2,
    },
    {
      id: "network-timeout",
      name: "Network Timeout Breaker",
      errorType: "Network timeout",
      state: "CLOSED",
      failureThreshold: 4,
      recoveryTimeout: 8000,
      successThreshold: 2,
      enabled: true,
      adaptive: false,
      isolationLevel: "medium",
      priority: 3,
    },
    {
      id: "server-overload",
      name: "Server Overload Breaker",
      errorType: "Server overloaded",
      state: "CLOSED",
      failureThreshold: 2,
      recoveryTimeout: 20000,
      successThreshold: 4,
      enabled: true,
      adaptive: true,
      isolationLevel: "critical",
      priority: 1,
    },
    {
      id: "validation-error",
      name: "Validation Error Breaker",
      errorType: "Validation error",
      state: "CLOSED",
      failureThreshold: 6,
      recoveryTimeout: 5000,
      successThreshold: 2,
      enabled: true,
      adaptive: false,
      isolationLevel: "low",
      priority: 4,
    },
    {
      id: "storage-quota",
      name: "Storage Quota Breaker",
      errorType: "Storage quota exceeded",
      state: "CLOSED",
      failureThreshold: 3,
      recoveryTimeout: 30000,
      successThreshold: 3,
      enabled: true,
      adaptive: true,
      isolationLevel: "high",
      priority: 2,
    },
    {
      id: "rate-limit",
      name: "Rate Limit Breaker",
      errorType: "Rate limit exceeded",
      state: "CLOSED",
      failureThreshold: 8,
      recoveryTimeout: 12000,
      successThreshold: 4,
      enabled: true,
      adaptive: true,
      isolationLevel: "medium",
      priority: 3,
    },
    {
      id: "ssl-certificate",
      name: "SSL Certificate Breaker",
      errorType: "SSL certificate error",
      state: "CLOSED",
      failureThreshold: 1,
      recoveryTimeout: 60000,
      successThreshold: 5,
      enabled: true,
      adaptive: false,
      isolationLevel: "critical",
      priority: 1,
    },
  ])

  const [metrics, setMetrics] = useState<CircuitBreakerMetrics[]>([
    {
      id: "db-connection",
      totalRequests: 1247,
      failedRequests: 89,
      successfulRequests: 1158,
      failureRate: 7.1,
      avgResponseTime: 2.3,
      lastFailureTime: Date.now() - 300000,
      recoveryAttempts: 12,
      cascadesPrevented: 8,
      isolationEvents: 15,
      adaptiveAdjustments: 6,
      stateHistory: [
        { state: "OPEN", timestamp: Date.now() - 600000, reason: "Failure threshold exceeded (3 failures)" },
        { state: "HALF_OPEN", timestamp: Date.now() - 590000, reason: "Recovery timeout elapsed" },
        { state: "CLOSED", timestamp: Date.now() - 580000, reason: "Success threshold met (2 successes)" },
        { state: "OPEN", timestamp: Date.now() - 400000, reason: "Adaptive threshold lowered due to correlation" },
        { state: "CLOSED", timestamp: Date.now() - 300000, reason: "Manual reset by administrator" },
      ],
    },
    {
      id: "auth-session",
      totalRequests: 892,
      failedRequests: 67,
      successfulRequests: 825,
      failureRate: 7.5,
      avgResponseTime: 1.8,
      lastFailureTime: Date.now() - 180000,
      recoveryAttempts: 8,
      cascadesPrevented: 5,
      isolationEvents: 11,
      adaptiveAdjustments: 4,
      stateHistory: [
        { state: "OPEN", timestamp: Date.now() - 480000, reason: "Failure threshold exceeded (5 failures)" },
        { state: "HALF_OPEN", timestamp: Date.now() - 465000, reason: "Recovery timeout elapsed" },
        { state: "CLOSED", timestamp: Date.now() - 450000, reason: "Success threshold met (3 successes)" },
        { state: "OPEN", timestamp: Date.now() - 200000, reason: "Correlation cascade detected" },
        { state: "CLOSED", timestamp: Date.now() - 180000, reason: "Isolation successful, system recovered" },
      ],
    },
    {
      id: "network-timeout",
      totalRequests: 2156,
      failedRequests: 234,
      successfulRequests: 1922,
      failureRate: 10.9,
      avgResponseTime: 3.1,
      lastFailureTime: Date.now() - 120000,
      recoveryAttempts: 18,
      cascadesPrevented: 12,
      isolationEvents: 22,
      adaptiveAdjustments: 0,
      stateHistory: [
        { state: "OPEN", timestamp: Date.now() - 360000, reason: "Failure threshold exceeded (4 failures)" },
        { state: "HALF_OPEN", timestamp: Date.now() - 352000, reason: "Recovery timeout elapsed" },
        { state: "OPEN", timestamp: Date.now() - 350000, reason: "Recovery failed immediately" },
        { state: "HALF_OPEN", timestamp: Date.now() - 342000, reason: "Second recovery attempt" },
        { state: "CLOSED", timestamp: Date.now() - 340000, reason: "Success threshold met (2 successes)" },
      ],
    },
    {
      id: "server-overload",
      totalRequests: 567,
      failedRequests: 123,
      successfulRequests: 444,
      failureRate: 21.7,
      avgResponseTime: 4.8,
      lastFailureTime: Date.now() - 60000,
      recoveryAttempts: 15,
      cascadesPrevented: 18,
      isolationEvents: 25,
      adaptiveAdjustments: 9,
      stateHistory: [
        { state: "OPEN", timestamp: Date.now() - 240000, reason: "Failure threshold exceeded (2 failures)" },
        { state: "HALF_OPEN", timestamp: Date.now() - 220000, reason: "Recovery timeout elapsed" },
        { state: "OPEN", timestamp: Date.now() - 218000, reason: "Recovery failed, load still high" },
        { state: "HALF_OPEN", timestamp: Date.now() - 198000, reason: "Extended recovery timeout" },
        { state: "CLOSED", timestamp: Date.now() - 180000, reason: "Success threshold met (4 successes)" },
      ],
    },
    {
      id: "validation-error",
      totalRequests: 1834,
      failedRequests: 45,
      successfulRequests: 1789,
      failureRate: 2.5,
      avgResponseTime: 0.8,
      lastFailureTime: Date.now() - 900000,
      recoveryAttempts: 3,
      cascadesPrevented: 2,
      isolationEvents: 4,
      adaptiveAdjustments: 0,
      stateHistory: [
        { state: "OPEN", timestamp: Date.now() - 1200000, reason: "Failure threshold exceeded (6 failures)" },
        { state: "HALF_OPEN", timestamp: Date.now() - 1195000, reason: "Recovery timeout elapsed" },
        { state: "CLOSED", timestamp: Date.now() - 1190000, reason: "Success threshold met (2 successes)" },
      ],
    },
    {
      id: "storage-quota",
      totalRequests: 345,
      failedRequests: 28,
      successfulRequests: 317,
      failureRate: 8.1,
      avgResponseTime: 2.1,
      lastFailureTime: Date.now() - 420000,
      recoveryAttempts: 6,
      cascadesPrevented: 4,
      isolationEvents: 7,
      adaptiveAdjustments: 3,
      stateHistory: [
        { state: "OPEN", timestamp: Date.now() - 720000, reason: "Failure threshold exceeded (3 failures)" },
        { state: "HALF_OPEN", timestamp: Date.now() - 690000, reason: "Recovery timeout elapsed" },
        { state: "CLOSED", timestamp: Date.now() - 680000, reason: "Success threshold met (3 successes)" },
        { state: "OPEN", timestamp: Date.now() - 450000, reason: "Storage cleanup required" },
        { state: "CLOSED", timestamp: Date.now() - 420000, reason: "Automated cleanup completed" },
      ],
    },
    {
      id: "rate-limit",
      totalRequests: 2890,
      failedRequests: 156,
      successfulRequests: 2734,
      failureRate: 5.4,
      avgResponseTime: 1.2,
      lastFailureTime: Date.now() - 240000,
      recoveryAttempts: 9,
      cascadesPrevented: 6,
      isolationEvents: 12,
      adaptiveAdjustments: 5,
      stateHistory: [
        { state: "OPEN", timestamp: Date.now() - 480000, reason: "Failure threshold exceeded (8 failures)" },
        { state: "HALF_OPEN", timestamp: Date.now() - 468000, reason: "Recovery timeout elapsed" },
        { state: "CLOSED", timestamp: Date.now() - 460000, reason: "Success threshold met (4 successes)" },
        { state: "OPEN", timestamp: Date.now() - 260000, reason: "Rate limit burst detected" },
        { state: "CLOSED", timestamp: Date.now() - 240000, reason: "Rate limit normalized" },
      ],
    },
    {
      id: "ssl-certificate",
      totalRequests: 123,
      failedRequests: 8,
      successfulRequests: 115,
      failureRate: 6.5,
      avgResponseTime: 5.2,
      avgResponseTime: 5.2,
      lastFailureTime: Date.now() - 1800000,
      recoveryAttempts: 2,
      cascadesPrevented: 3,
      isolationEvents: 5,
      adaptiveAdjustments: 0,
      stateHistory: [
        { state: "OPEN", timestamp: Date.now() - 2400000, reason: "SSL certificate expired" },
        { state: "HALF_OPEN", timestamp: Date.now() - 2340000, reason: "Recovery timeout elapsed" },
        { state: "OPEN", timestamp: Date.now() - 2338000, reason: "Certificate still invalid" },
        { state: "HALF_OPEN", timestamp: Date.now() - 1860000, reason: "Extended recovery timeout" },
        { state: "CLOSED", timestamp: Date.now() - 1800000, reason: "Certificate renewed successfully" },
      ],
    },
  ])

  const [errorPatterns] = useState<ErrorTypePattern[]>([
    {
      type: "Database connection failed",
      frequency: 89,
      severity: "critical",
      correlations: ["Server overloaded", "Network timeout"],
      peakHours: [9, 10, 11, 14, 15],
      recoveryTime: 12.3,
      cascadeRisk: 0.87,
    },
    {
      type: "Authentication expired",
      frequency: 67,
      severity: "high",
      correlations: ["Session timeout", "Rate limit exceeded"],
      peakHours: [9, 13, 17],
      recoveryTime: 8.7,
      cascadeRisk: 0.64,
    },
    {
      type: "Network timeout",
      frequency: 234,
      severity: "high",
      correlations: ["Request timeout", "Server overloaded"],
      peakHours: [18, 19, 20],
      recoveryTime: 15.2,
      cascadeRisk: 0.72,
    },
    {
      type: "Server overloaded",
      frequency: 123,
      severity: "critical",
      correlations: ["Database connection failed", "Memory allocation failed"],
      peakHours: [10, 11, 15, 16],
      recoveryTime: 25.8,
      cascadeRisk: 0.91,
    },
    {
      type: "Validation error",
      frequency: 45,
      severity: "low",
      correlations: ["Configuration conflict"],
      peakHours: [12, 13, 14],
      recoveryTime: 3.2,
      cascadeRisk: 0.23,
    },
    {
      type: "Storage quota exceeded",
      frequency: 28,
      severity: "medium",
      correlations: ["Disk space insufficient"],
      peakHours: [16, 17, 18],
      recoveryTime: 45.6,
      cascadeRisk: 0.45,
    },
    {
      type: "Rate limit exceeded",
      frequency: 156,
      severity: "medium",
      correlations: ["API quota exceeded", "Authentication expired"],
      peakHours: [11, 12, 13, 14],
      recoveryTime: 6.8,
      cascadeRisk: 0.38,
    },
    {
      type: "SSL certificate error",
      frequency: 8,
      severity: "critical",
      correlations: ["Security validation failed"],
      peakHours: [0, 1, 2, 3, 4, 5],
      recoveryTime: 120.5,
      cascadeRisk: 0.95,
    },
  ])

  const [systemOverview, setSystemOverview] = useState({
    totalBreakers: 8,
    activeBreakers: 8,
    openBreakers: 0,
    halfOpenBreakers: 0,
    closedBreakers: 8,
    totalCascadesPrevented: 73,
    totalIsolationEvents: 101,
    totalAdaptiveAdjustments: 27,
    systemHealthScore: 87.3,
    avgRecoveryTime: 18.4,
    criticalBreakers: 3,
    adaptiveBreakers: 6,
  })

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        refreshMetrics()
      }, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [autoRefresh, refreshInterval])

  const refreshMetrics = async () => {
    try {
      const newMetrics = await getCircuitBreakerMetrics()
      // In a real app, this would update with fresh data
      console.log("Refreshing circuit breaker metrics...")
    } catch (error) {
      console.error("Failed to refresh metrics:", error)
    }
  }

  const handleTestBreaker = async (breakerId: string) => {
    setIsLoading(true)
    try {
      const result = await testCircuitBreaker(breakerId)
      setTestResults((prev) => [...prev, { ...result, timestamp: new Date() }])

      toast({
        title: "🧪 Circuit Breaker Test",
        description: `Test completed for ${circuitBreakers.find((b) => b.id === breakerId)?.name}`,
        className: "bg-white border-blue-200 text-blue-800 shadow-lg",
      })
    } catch (error) {
      toast({
        title: "❌ Test Failed",
        description: "Circuit breaker test failed",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetBreaker = async (breakerId: string) => {
    setIsLoading(true)
    try {
      await resetCircuitBreaker(breakerId)

      // Update local state
      setCircuitBreakers((prev) =>
        prev.map((breaker) => (breaker.id === breakerId ? { ...breaker, state: "CLOSED" } : breaker)),
      )

      toast({
        title: "🔄 Circuit Breaker Reset",
        description: `${circuitBreakers.find((b) => b.id === breakerId)?.name} has been reset to CLOSED state`,
        className: "bg-white border-green-200 text-green-800 shadow-lg",
      })
    } catch (error) {
      toast({
        title: "❌ Reset Failed",
        description: "Failed to reset circuit breaker",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateConfig = async (breakerId: string, config: Partial<CircuitBreakerConfig>) => {
    setIsLoading(true)
    try {
      await updateCircuitBreakerConfig(breakerId, config)

      // Update local state
      setCircuitBreakers((prev) =>
        prev.map((breaker) => (breaker.id === breakerId ? { ...breaker, ...config } : breaker)),
      )

      toast({
        title: "⚙️ Configuration Updated",
        description: `${circuitBreakers.find((b) => b.id === breakerId)?.name} configuration has been updated`,
        className: "bg-white border-blue-200 text-blue-800 shadow-lg",
      })
    } catch (error) {
      toast({
        title: "❌ Update Failed",
        description: "Failed to update circuit breaker configuration",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSimulateLoad = async () => {
    setSimulationRunning(true)
    try {
      const results = await simulateErrorLoad()
      setTestResults((prev) => [...prev, { ...results, timestamp: new Date(), type: "load-simulation" }])

      toast({
        title: "🚀 Load Simulation Complete",
        description: "Error load simulation has been completed successfully",
        className: "bg-white border-purple-200 text-purple-800 shadow-lg",
      })
    } catch (error) {
      toast({
        title: "❌ Simulation Failed",
        description: "Load simulation failed",
        variant: "destructive",
      })
    } finally {
      setSimulationRunning(false)
    }
  }

  const getStateColor = (state: string) => {
    switch (state) {
      case "CLOSED":
        return "bg-green-100 text-green-800 border-green-200"
      case "OPEN":
        return "bg-red-100 text-red-800 border-red-200"
      case "HALF_OPEN":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getIsolationColor = (level: string) => {
    switch (level) {
      case "critical":
        return "bg-red-500"
      case "high":
        return "bg-orange-500"
      case "medium":
        return "bg-yellow-500"
      case "low":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "text-red-600 bg-red-50"
      case "high":
        return "text-orange-600 bg-orange-50"
      case "medium":
        return "text-yellow-600 bg-yellow-50"
      case "low":
        return "text-green-600 bg-green-50"
      default:
        return "text-gray-600 bg-gray-50"
    }
  }

  return (
    <div className="space-y-6 bg-white min-h-screen p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black">Advanced Circuit Breakers</h1>
          <p className="text-gray-600 mt-1">Error-type specific isolation and recovery management system</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="auto-refresh" className="text-sm">
              Auto Refresh
            </Label>
            <Switch
              id="auto-refresh"
              checked={autoRefresh}
              onCheckedChange={setAutoRefresh}
              className="data-[state=checked]:bg-blue-500"
            />
          </div>
          <Button
            onClick={handleSimulateLoad}
            disabled={simulationRunning}
            className="bg-purple-500 hover:bg-purple-600 text-white disabled:bg-purple-300"
          >
            {simulationRunning ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Simulating...
              </div>
            ) : (
              <div className="flex items-center gap-2">🚀 Simulate Load</div>
            )}
          </Button>
        </div>
      </div>

      {/* System Overview */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-black text-xl flex items-center gap-2">🎛️ System Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg border border-blue-200 shadow-sm">
              <div className="text-2xl font-bold text-blue-600">{systemOverview.totalBreakers}</div>
              <div className="text-sm text-blue-800">Total Breakers</div>
              <div className="text-xs text-blue-600 mt-1">
                {systemOverview.adaptiveBreakers} adaptive, {systemOverview.criticalBreakers} critical
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-green-200 shadow-sm">
              <div className="text-2xl font-bold text-green-600">{systemOverview.closedBreakers}</div>
              <div className="text-sm text-green-800">Closed (Healthy)</div>
              <div className="text-xs text-green-600 mt-1">
                {systemOverview.openBreakers} open, {systemOverview.halfOpenBreakers} half-open
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-purple-200 shadow-sm">
              <div className="text-2xl font-bold text-purple-600">{systemOverview.totalCascadesPrevented}</div>
              <div className="text-sm text-purple-800">Cascades Prevented</div>
              <div className="text-xs text-purple-600 mt-1">{systemOverview.totalIsolationEvents} isolation events</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-orange-200 shadow-sm">
              <div className="text-2xl font-bold text-orange-600">{systemOverview.systemHealthScore}%</div>
              <div className="text-sm text-orange-800">Health Score</div>
              <div className="text-xs text-orange-600 mt-1">{systemOverview.avgRecoveryTime}s avg recovery</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>System Health</span>
                <span className="font-medium">{systemOverview.systemHealthScore}%</span>
              </div>
              <Progress value={systemOverview.systemHealthScore} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Active Breakers</span>
                <span className="font-medium">
                  {systemOverview.activeBreakers}/{systemOverview.totalBreakers}
                </span>
              </div>
              <Progress value={(systemOverview.activeBreakers / systemOverview.totalBreakers) * 100} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Adaptive Adjustments</span>
                <span className="font-medium">{systemOverview.totalAdaptiveAdjustments}</span>
              </div>
              <Progress value={75} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="breakers" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="breakers">Circuit Breakers</TabsTrigger>
          <TabsTrigger value="metrics">Metrics & Analytics</TabsTrigger>
          <TabsTrigger value="patterns">Error Patterns</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="testing">Testing & Simulation</TabsTrigger>
        </TabsList>

        {/* Circuit Breakers Tab */}
        <TabsContent value="breakers" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {circuitBreakers.map((breaker) => {
              const metric = metrics.find((m) => m.id === breaker.id)
              return (
                <Card key={breaker.id} className="border-gray-200">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-lg">{breaker.name}</CardTitle>
                        <Badge className={getStateColor(breaker.state)}>{breaker.state}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getIsolationColor(breaker.isolationLevel)}`}></div>
                        <span className="text-xs text-gray-600 capitalize">{breaker.isolationLevel}</span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      Error Type: <span className="font-medium">{breaker.errorType}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {metric && (
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-gray-600">Total Requests</div>
                          <div className="font-semibold">{metric.totalRequests.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Failure Rate</div>
                          <div className="font-semibold text-red-600">{metric.failureRate}%</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Cascades Prevented</div>
                          <div className="font-semibold text-purple-600">{metric.cascadesPrevented}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Avg Response</div>
                          <div className="font-semibold">{metric.avgResponseTime}s</div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Failure Threshold</span>
                        <span>{breaker.failureThreshold} failures</span>
                      </div>
                      <Progress
                        value={((metric?.failedRequests || 0) / breaker.failureThreshold) * 100}
                        className="h-1"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={breaker.enabled}
                          onCheckedChange={(enabled) => handleUpdateConfig(breaker.id, { enabled })}
                          className="data-[state=checked]:bg-green-500"
                        />
                        <span className="text-sm">Enabled</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {breaker.adaptive && (
                          <Badge variant="outline" className="text-xs">
                            🧠 Adaptive
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          P{breaker.priority}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleTestBreaker(breaker.id)}
                        disabled={isLoading}
                        className="flex-1"
                      >
                        🧪 Test
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleResetBreaker(breaker.id)}
                        disabled={isLoading || breaker.state === "CLOSED"}
                        className="flex-1"
                      >
                        🔄 Reset
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* Metrics & Analytics Tab */}
        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-black text-lg">📊 Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics.slice(0, 4).map((metric) => {
                    const breaker = circuitBreakers.find((b) => b.id === metric.id)
                    return (
                      <div key={metric.id} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">{breaker?.name}</span>
                          <Badge className={getStateColor(breaker?.state || "CLOSED")}>{breaker?.state}</Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div>
                            <div className="text-gray-600">Requests</div>
                            <div className="font-semibold">{metric.totalRequests}</div>
                          </div>
                          <div>
                            <div className="text-gray-600">Failures</div>
                            <div className="font-semibold text-red-600">{metric.failedRequests}</div>
                          </div>
                          <div>
                            <div className="text-gray-600">Rate</div>
                            <div className="font-semibold">{metric.failureRate}%</div>
                          </div>
                        </div>
                        <div className="mt-2">
                          <Progress value={100 - metric.failureRate} className="h-1" />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-black text-lg">🛡️ Protection Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics.slice(0, 4).map((metric) => {
                    const breaker = circuitBreakers.find((b) => b.id === metric.id)
                    return (
                      <div key={metric.id} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">{breaker?.name}</span>
                          <div className="flex items-center gap-1">
                            <div
                              className={`w-2 h-2 rounded-full ${getIsolationColor(breaker?.isolationLevel || "low")}`}
                            ></div>
                            <span className="text-xs capitalize">{breaker?.isolationLevel}</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div>
                            <div className="text-gray-600">Cascades</div>
                            <div className="font-semibold text-purple-600">{metric.cascadesPrevented}</div>
                          </div>
                          <div>
                            <div className="text-gray-600">Isolations</div>
                            <div className="font-semibold text-blue-600">{metric.isolationEvents}</div>
                          </div>
                          <div>
                            <div className="text-gray-600">Recoveries</div>
                            <div className="font-semibold text-green-600">{metric.recoveryAttempts}</div>
                          </div>
                        </div>
                        {breaker?.adaptive && (
                          <div className="mt-2 text-xs text-orange-600">
                            🧠 {metric.adaptiveAdjustments} adaptive adjustments
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* State History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-black text-lg">📈 Recent State Changes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {metrics.slice(0, 3).map((metric) => {
                  const breaker = circuitBreakers.find((b) => b.id === metric.id)
                  return (
                    <div key={metric.id} className="border rounded-lg p-3">
                      <div className="font-medium text-sm mb-2">{breaker?.name}</div>
                      <div className="space-y-2">
                        {metric.stateHistory.slice(-3).map((history, index) => (
                          <div key={index} className="flex items-center gap-3 text-xs">
                            <Badge className={getStateColor(history.state)} variant="outline">
                              {history.state}
                            </Badge>
                            <span className="flex-1">{history.reason}</span>
                            <span className="text-gray-500">{new Date(history.timestamp).toLocaleTimeString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Error Patterns Tab */}
        <TabsContent value="patterns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-black text-lg">🔍 Error Type Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {errorPatterns.map((pattern, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold">{pattern.type}</h3>
                        <Badge className={getSeverityColor(pattern.severity)}>{pattern.severity.toUpperCase()}</Badge>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Frequency</div>
                        <div className="text-lg font-bold text-red-600">{pattern.frequency}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div>
                        <div className="text-sm text-gray-600">Cascade Risk</div>
                        <div className="flex items-center gap-2">
                          <Progress value={pattern.cascadeRisk * 100} className="h-2 flex-1" />
                          <span className="text-sm font-medium">{(pattern.cascadeRisk * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Recovery Time</div>
                        <div className="font-semibold">{pattern.recoveryTime}s avg</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Peak Hours</div>
                        <div className="text-sm">{pattern.peakHours.join(":00, ")}:00</div>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-3 rounded">
                      <div className="text-sm font-medium text-gray-700 mb-1">Correlations:</div>
                      <div className="flex flex-wrap gap-2">
                        {pattern.correlations.map((correlation, corrIndex) => (
                          <Badge key={corrIndex} variant="outline" className="text-xs">
                            {correlation}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configuration Tab */}
        <TabsContent value="configuration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-black text-lg">⚙️ Circuit Breaker Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="breaker-select">Select Circuit Breaker</Label>
                    <Select value={selectedBreaker} onValueChange={setSelectedBreaker}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a circuit breaker to configure" />
                      </SelectTrigger>
                      <SelectContent>
                        {circuitBreakers.map((breaker) => (
                          <SelectItem key={breaker.id} value={breaker.id}>
                            {breaker.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="refresh-interval">Refresh Interval (ms)</Label>
                    <Select
                      value={refreshInterval.toString()}
                      onValueChange={(value) => setRefreshInterval(Number.parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1000">1 second</SelectItem>
                        <SelectItem value="5000">5 seconds</SelectItem>
                        <SelectItem value="10000">10 seconds</SelectItem>
                        <SelectItem value="30000">30 seconds</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {selectedBreaker && (
                  <div className="border rounded-lg p-4">
                    {(() => {
                      const breaker = circuitBreakers.find((b) => b.id === selectedBreaker)
                      if (!breaker) return null

                      return (
                        <div className="space-y-4">
                          <h3 className="font-semibold text-lg">{breaker.name} Configuration</h3>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Failure Threshold: {breaker.failureThreshold}</Label>
                              <Slider
                                value={[breaker.failureThreshold]}
                                onValueChange={([value]) => handleUpdateConfig(breaker.id, { failureThreshold: value })}
                                max={10}
                                min={1}
                                step={1}
                                className="w-full"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Recovery Timeout: {breaker.recoveryTimeout / 1000}s</Label>
                              <Slider
                                value={[breaker.recoveryTimeout / 1000]}
                                onValueChange={([value]) =>
                                  handleUpdateConfig(breaker.id, { recoveryTimeout: value * 1000 })
                                }
                                max={120}
                                min={5}
                                step={5}
                                className="w-full"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Success Threshold: {breaker.successThreshold}</Label>
                              <Slider
                                value={[breaker.successThreshold]}
                                onValueChange={([value]) => handleUpdateConfig(breaker.id, { successThreshold: value })}
                                max={10}
                                min={1}
                                step={1}
                                className="w-full"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Priority: {breaker.priority}</Label>
                              <Slider
                                value={[breaker.priority]}
                                onValueChange={([value]) => handleUpdateConfig(breaker.id, { priority: value })}
                                max={5}
                                min={1}
                                step={1}
                                className="w-full"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <Label>Isolation Level</Label>
                              <Select
                                value={breaker.isolationLevel}
                                onValueChange={(value: "low" | "medium" | "high" | "critical") =>
                                  handleUpdateConfig(breaker.id, { isolationLevel: value })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="low">Low</SelectItem>
                                  <SelectItem value="medium">Medium</SelectItem>
                                  <SelectItem value="high">High</SelectItem>
                                  <SelectItem value="critical">Critical</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Switch
                                id="adaptive"
                                checked={breaker.adaptive}
                                onCheckedChange={(adaptive) => handleUpdateConfig(breaker.id, { adaptive })}
                              />
                              <Label htmlFor="adaptive">Adaptive Mode</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Switch
                                id="enabled"
                                checked={breaker.enabled}
                                onCheckedChange={(enabled) => handleUpdateConfig(breaker.id, { enabled })}
                              />
                              <Label htmlFor="enabled">Enabled</Label>
                            </div>
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Testing & Simulation Tab */}
        <TabsContent value="testing" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-black text-lg">🧪 Testing Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {circuitBreakers.slice(0, 4).map((breaker) => (
                    <Button
                      key={breaker.id}
                      variant="outline"
                      size="sm"
                      onClick={() => handleTestBreaker(breaker.id)}
                      disabled={isLoading}
                      className="text-xs"
                    >
                      Test {breaker.name.split(" ")[0]}
                    </Button>
                  ))}
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={handleSimulateLoad}
                    disabled={simulationRunning}
                    className="w-full bg-purple-500 hover:bg-purple-600"
                  >
                    {simulationRunning ? "Running Simulation..." : "🚀 Run Full Load Simulation"}
                  </Button>

                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" disabled={isLoading}>
                      🔄 Reset All
                    </Button>
                    <Button variant="outline" size="sm" disabled={isLoading}>
                      📊 Export Results
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-black text-lg">📋 Test Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {testResults.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      No test results yet. Run some tests to see results here.
                    </div>
                  ) : (
                    testResults
                      .slice(-10)
                      .reverse()
                      .map((result, index) => (
                        <div key={index} className="border rounded p-3 text-sm">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium">
                              {result.type === "load-simulation" ? "Load Simulation" : `Test: ${result.breakerId}`}
                            </span>
                            <Badge
                              className={result.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                            >
                              {result.success ? "✅ Pass" : "❌ Fail"}
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-600">
                            {result.timestamp.toLocaleTimeString()} - {result.message || result.description}
                          </div>
                          {result.metrics && (
                            <div className="mt-2 text-xs text-gray-500">
                              Duration: {result.metrics.duration}ms | Errors: {result.metrics.errorsTriggered} |
                              Recoveries: {result.metrics.recoveries}
                            </div>
                          )}
                        </div>
                      ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Simulation Status */}
          {simulationRunning && (
            <Alert>
              <AlertTitle className="text-purple-800">🚀 Load Simulation in Progress</AlertTitle>
              <AlertDescription className="text-purple-700">
                Running comprehensive error load simulation across all circuit breakers. This will test failure
                thresholds, recovery mechanisms, and cascade prevention.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
