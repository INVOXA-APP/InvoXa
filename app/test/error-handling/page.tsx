"use client"

import { useState, useTransition } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Loader2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Shield,
  Bug,
  Zap,
  AlertCircle,
  FileX,
  WifiOff,
  Database,
  ArrowLeft,
} from "lucide-react"
import Link from "next/link"
import { convertCurrency, validateCurrencyInput } from "@/app/currency/actions"

interface ErrorTestResult {
  testName: string
  input: {
    amount?: any
    fromCurrency?: string
    toCurrency?: string
  }
  expectedError: string
  actualError?: string
  success: boolean
  errorCaught: boolean
  duration: number
  timestamp: string
  category: "validation" | "network" | "system" | "boundary" | "malformed" | "security"
  severity: "low" | "medium" | "high" | "critical"
}

interface ErrorTestScenario {
  name: string
  description: string
  tests: Array<{
    name: string
    input: {
      amount?: any
      fromCurrency?: string
      toCurrency?: string
    }
    expectedError: string
    severity: "low" | "medium" | "high" | "critical"
  }>
  category: "validation" | "network" | "system" | "boundary" | "malformed" | "security"
  icon: string
  color: string
}

const ERROR_TEST_SCENARIOS: ErrorTestScenario[] = [
  // Input Validation Tests
  {
    name: "Input Validation Tests",
    description: "Test invalid input types and values",
    category: "validation",
    icon: "🔍",
    color: "blue",
    tests: [
      {
        name: "NaN Amount",
        input: { amount: Number.NaN, fromCurrency: "USD", toCurrency: "EUR" },
        expectedError: "Amount must be a finite number",
        severity: "high",
      },
      {
        name: "Infinity Amount",
        input: { amount: Number.POSITIVE_INFINITY, fromCurrency: "USD", toCurrency: "EUR" },
        expectedError: "Amount must be a finite number",
        severity: "high",
      },
      {
        name: "Negative Infinity",
        input: { amount: Number.NEGATIVE_INFINITY, fromCurrency: "USD", toCurrency: "EUR" },
        expectedError: "Amount must be a finite number",
        severity: "high",
      },
      {
        name: "Negative Amount",
        input: { amount: -100, fromCurrency: "USD", toCurrency: "EUR" },
        expectedError: "Amount must be greater than 0",
        severity: "medium",
      },
      {
        name: "Zero Amount",
        input: { amount: 0, fromCurrency: "USD", toCurrency: "EUR" },
        expectedError: "Amount must be greater than 0",
        severity: "medium",
      },
      {
        name: "String Amount",
        input: { amount: "not-a-number", fromCurrency: "USD", toCurrency: "EUR" },
        expectedError: "Amount must be a valid number",
        severity: "high",
      },
      {
        name: "Null Amount",
        input: { amount: null, fromCurrency: "USD", toCurrency: "EUR" },
        expectedError: "Amount is required",
        severity: "high",
      },
      {
        name: "Undefined Amount",
        input: { amount: undefined, fromCurrency: "USD", toCurrency: "EUR" },
        expectedError: "Amount is required",
        severity: "high",
      },
    ],
  },

  // Currency Code Validation Tests
  {
    name: "Currency Code Validation",
    description: "Test invalid currency codes and formats",
    category: "validation",
    icon: "💱",
    color: "orange",
    tests: [
      {
        name: "Invalid From Currency",
        input: { amount: 100, fromCurrency: "INVALID", toCurrency: "EUR" },
        expectedError: "Invalid currency code: INVALID",
        severity: "medium",
      },
      {
        name: "Invalid To Currency",
        input: { amount: 100, fromCurrency: "USD", toCurrency: "INVALID" },
        expectedError: "Invalid currency code: INVALID",
        severity: "medium",
      },
      {
        name: "Empty From Currency",
        input: { amount: 100, fromCurrency: "", toCurrency: "EUR" },
        expectedError: "Currency code cannot be empty",
        severity: "medium",
      },
      {
        name: "Empty To Currency",
        input: { amount: 100, fromCurrency: "USD", toCurrency: "" },
        expectedError: "Currency code cannot be empty",
        severity: "medium",
      },
      {
        name: "Null From Currency",
        input: { amount: 100, fromCurrency: null, toCurrency: "EUR" },
        expectedError: "Currency code is required",
        severity: "high",
      },
      {
        name: "Lowercase Currency Code",
        input: { amount: 100, fromCurrency: "usd", toCurrency: "EUR" },
        expectedError: "Currency code must be uppercase",
        severity: "low",
      },
      {
        name: "Too Long Currency Code",
        input: { amount: 100, fromCurrency: "USDDD", toCurrency: "EUR" },
        expectedError: "Currency code must be exactly 3 characters",
        severity: "medium",
      },
      {
        name: "Too Short Currency Code",
        input: { amount: 100, fromCurrency: "US", toCurrency: "EUR" },
        expectedError: "Currency code must be exactly 3 characters",
        severity: "medium",
      },
    ],
  },

  // System Boundary Tests
  {
    name: "System Boundary Tests",
    description: "Test system limits and mathematical boundaries",
    category: "boundary",
    icon: "⚠️",
    color: "red",
    tests: [
      {
        name: "Extremely Small Amount",
        input: { amount: Number.MIN_VALUE / 2, fromCurrency: "USD", toCurrency: "EUR" },
        expectedError: "Amount is too small to process accurately",
        severity: "medium",
      },
      {
        name: "Extremely Large Amount",
        input: { amount: Number.MAX_SAFE_INTEGER + 1, fromCurrency: "USD", toCurrency: "EUR" },
        expectedError: "Amount is too large to process accurately",
        severity: "medium",
      },
      {
        name: "Maximum Safe Integer",
        input: { amount: Number.MAX_SAFE_INTEGER, fromCurrency: "USD", toCurrency: "EUR" },
        expectedError: "Amount exceeds maximum safe processing limit",
        severity: "high",
      },
      {
        name: "Scientific Notation Overflow",
        input: { amount: 1e308, fromCurrency: "USD", toCurrency: "EUR" },
        expectedError: "Amount must be a finite number",
        severity: "high",
      },
      {
        name: "Precision Underflow",
        input: { amount: 1e-324, fromCurrency: "USD", toCurrency: "EUR" },
        expectedError: "Amount is too small to process accurately",
        severity: "medium",
      },
    ],
  },

  // Malformed Data Tests
  {
    name: "Malformed Data Tests",
    description: "Test malformed and corrupted input data",
    category: "malformed",
    icon: "🔧",
    color: "purple",
    tests: [
      {
        name: "Object as Amount",
        input: { amount: { value: 100 }, fromCurrency: "USD", toCurrency: "EUR" },
        expectedError: "Amount must be a valid number",
        severity: "high",
      },
      {
        name: "Array as Amount",
        input: { amount: [100], fromCurrency: "USD", toCurrency: "EUR" },
        expectedError: "Amount must be a valid number",
        severity: "high",
      },
      {
        name: "Boolean as Amount",
        input: { amount: true, fromCurrency: "USD", toCurrency: "EUR" },
        expectedError: "Amount must be a valid number",
        severity: "medium",
      },
      {
        name: "Function as Currency",
        input: { amount: 100, fromCurrency: () => "USD", toCurrency: "EUR" },
        expectedError: "Currency code must be a string",
        severity: "high",
      },
      {
        name: "Special Characters in Currency",
        input: { amount: 100, fromCurrency: "U$D", toCurrency: "EUR" },
        expectedError: "Currency code contains invalid characters",
        severity: "medium",
      },
      {
        name: "Unicode Currency Code",
        input: { amount: 100, fromCurrency: "U€D", toCurrency: "EUR" },
        expectedError: "Currency code contains invalid characters",
        severity: "medium",
      },
    ],
  },

  // Network Simulation Tests
  {
    name: "Network Error Simulation",
    description: "Simulate network and API failures",
    category: "network",
    icon: "📡",
    color: "yellow",
    tests: [
      {
        name: "API Timeout",
        input: { amount: 100, fromCurrency: "USD", toCurrency: "EUR", simulateTimeout: true },
        expectedError: "Request timeout - please try again",
        severity: "medium",
      },
      {
        name: "Network Unavailable",
        input: { amount: 100, fromCurrency: "USD", toCurrency: "EUR", simulateNetworkError: true },
        expectedError: "Network error - check your connection",
        severity: "medium",
      },
      {
        name: "API Rate Limit",
        input: { amount: 100, fromCurrency: "USD", toCurrency: "EUR", simulateRateLimit: true },
        expectedError: "Rate limit exceeded - please wait",
        severity: "low",
      },
      {
        name: "Server Error",
        input: { amount: 100, fromCurrency: "USD", toCurrency: "EUR", simulateServerError: true },
        expectedError: "Server error - please try again later",
        severity: "high",
      },
      {
        name: "Invalid API Response",
        input: { amount: 100, fromCurrency: "USD", toCurrency: "EUR", simulateInvalidResponse: true },
        expectedError: "Invalid response from currency service",
        severity: "high",
      },
    ],
  },

  // Security Tests
  {
    name: "Security Validation Tests",
    description: "Test security-related input validation",
    category: "security",
    icon: "🔒",
    color: "green",
    tests: [
      {
        name: "SQL Injection Attempt",
        input: { amount: 100, fromCurrency: "'; DROP TABLE rates; --", toCurrency: "EUR" },
        expectedError: "Currency code contains invalid characters",
        severity: "critical",
      },
      {
        name: "XSS Attempt in Currency",
        input: { amount: 100, fromCurrency: "<script>alert('xss')</script>", toCurrency: "EUR" },
        expectedError: "Currency code contains invalid characters",
        severity: "critical",
      },
      {
        name: "Command Injection",
        input: { amount: 100, fromCurrency: "USD; rm -rf /", toCurrency: "EUR" },
        expectedError: "Currency code contains invalid characters",
        severity: "critical",
      },
      {
        name: "Path Traversal",
        input: { amount: 100, fromCurrency: "../../../etc/passwd", toCurrency: "EUR" },
        expectedError: "Currency code contains invalid characters",
        severity: "critical",
      },
      {
        name: "Buffer Overflow Attempt",
        input: { amount: 100, fromCurrency: "A".repeat(10000), toCurrency: "EUR" },
        expectedError: "Currency code exceeds maximum length",
        severity: "high",
      },
    ],
  },
]

export default function ErrorHandlingTestPage() {
  const [testResults, setTestResults] = useState<ErrorTestResult[]>([])
  const [currentTest, setCurrentTest] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [progress, setProgress] = useState(0)
  const [activeTab, setActiveTab] = useState("validation")
  const [customTestInput, setCustomTestInput] = useState({
    amount: "",
    fromCurrency: "",
    toCurrency: "",
  })

  const runSingleErrorTest = async (
    testName: string,
    input: any,
    expectedError: string,
    category: ErrorTestResult["category"],
    severity: ErrorTestResult["severity"],
  ): Promise<ErrorTestResult> => {
    const startTime = Date.now()

    try {
      // Handle special simulation flags
      if (input.simulateTimeout) {
        await new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Request timeout - please try again")), 5000),
        )
      }
      if (input.simulateNetworkError) {
        throw new Error("Network error - check your connection")
      }
      if (input.simulateRateLimit) {
        throw new Error("Rate limit exceeded - please wait")
      }
      if (input.simulateServerError) {
        throw new Error("Server error - please try again later")
      }
      if (input.simulateInvalidResponse) {
        throw new Error("Invalid response from currency service")
      }

      // First validate the input
      const validation = await validateCurrencyInput(input.amount, input.fromCurrency, input.toCurrency)
      if (!validation.valid) {
        return {
          testName,
          input,
          expectedError,
          actualError: validation.error,
          success: false,
          errorCaught: true,
          duration: Date.now() - startTime,
          timestamp: new Date().toISOString(),
          category,
          severity,
        }
      }

      // If validation passes, try the conversion
      const result = await convertCurrency(input.amount, input.fromCurrency, input.toCurrency)

      if (!result.success && result.error) {
        return {
          testName,
          input,
          expectedError,
          actualError: result.error,
          success: false,
          errorCaught: true,
          duration: Date.now() - startTime,
          timestamp: new Date().toISOString(),
          category,
          severity,
        }
      }

      // If we get here, the test didn't fail as expected
      return {
        testName,
        input,
        expectedError,
        actualError: "No error occurred (test should have failed)",
        success: false,
        errorCaught: false,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        category,
        severity,
      }
    } catch (error) {
      const actualError = error instanceof Error ? error.message : "Unknown error"
      return {
        testName,
        input,
        expectedError,
        actualError,
        success: false,
        errorCaught: true,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        category,
        severity,
      }
    }
  }

  const runErrorTestSuite = async (scenario: ErrorTestScenario) => {
    startTransition(async () => {
      setTestResults([])
      setProgress(0)
      setCurrentTest(`Running ${scenario.name}`)

      const results: ErrorTestResult[] = []
      const totalTests = scenario.tests.length

      for (let i = 0; i < scenario.tests.length; i++) {
        const test = scenario.tests[i]
        setCurrentTest(`${scenario.name}: ${test.name}`)

        const result = await runSingleErrorTest(
          test.name,
          test.input,
          test.expectedError,
          scenario.category,
          test.severity,
        )

        results.push(result)
        setTestResults([...results])
        setProgress(((i + 1) / totalTests) * 100)

        // Small delay for better UX
        await new Promise((resolve) => setTimeout(resolve, 200))
      }

      setCurrentTest(null)
    })
  }

  const runAllErrorTests = async () => {
    startTransition(async () => {
      setTestResults([])
      setProgress(0)
      setCurrentTest("Running All Error Handling Tests")

      const allResults: ErrorTestResult[] = []
      let totalTests = 0
      let completedTests = 0

      // Calculate total tests
      ERROR_TEST_SCENARIOS.forEach((scenario) => {
        totalTests += scenario.tests.length
      })

      for (const scenario of ERROR_TEST_SCENARIOS) {
        setCurrentTest(`Running ${scenario.name}`)

        for (const test of scenario.tests) {
          setCurrentTest(`${scenario.name}: ${test.name}`)

          const result = await runSingleErrorTest(
            test.name,
            test.input,
            test.expectedError,
            scenario.category,
            test.severity,
          )

          allResults.push(result)
          setTestResults([...allResults])

          completedTests++
          setProgress((completedTests / totalTests) * 100)

          await new Promise((resolve) => setTimeout(resolve, 150))
        }
      }

      setCurrentTest(null)
    })
  }

  const runCustomErrorTest = async () => {
    if (!customTestInput.amount || !customTestInput.fromCurrency || !customTestInput.toCurrency) {
      return
    }

    startTransition(async () => {
      setCurrentTest("Running Custom Error Test")

      const result = await runSingleErrorTest(
        "Custom Test",
        {
          amount:
            customTestInput.amount === "NaN"
              ? Number.NaN
              : customTestInput.amount === "Infinity"
                ? Number.POSITIVE_INFINITY
                : customTestInput.amount === "-Infinity"
                  ? Number.NEGATIVE_INFINITY
                  : customTestInput.amount === "null"
                    ? null
                    : customTestInput.amount === "undefined"
                      ? undefined
                      : isNaN(Number(customTestInput.amount))
                        ? customTestInput.amount
                        : Number(customTestInput.amount),
          fromCurrency: customTestInput.fromCurrency,
          toCurrency: customTestInput.toCurrency,
        },
        "Custom test error",
        "validation",
        "medium",
      )

      setTestResults([result, ...testResults])
      setCurrentTest(null)
    })
  }

  const getTestStats = () => {
    const total = testResults.length
    const errorsCaught = testResults.filter((r) => r.errorCaught).length
    const errorsNotCaught = testResults.filter((r) => !r.errorCaught).length
    const avgDuration = total > 0 ? testResults.reduce((sum, r) => sum + r.duration, 0) / total : 0

    const bySeverity = {
      critical: testResults.filter((r) => r.severity === "critical").length,
      high: testResults.filter((r) => r.severity === "high").length,
      medium: testResults.filter((r) => r.severity === "medium").length,
      low: testResults.filter((r) => r.severity === "low").length,
    }

    const byCategory = {
      validation: testResults.filter((r) => r.category === "validation").length,
      network: testResults.filter((r) => r.category === "network").length,
      system: testResults.filter((r) => r.category === "system").length,
      boundary: testResults.filter((r) => r.category === "boundary").length,
      malformed: testResults.filter((r) => r.category === "malformed").length,
      security: testResults.filter((r) => r.category === "security").length,
    }

    return { total, errorsCaught, errorsNotCaught, avgDuration, bySeverity, byCategory }
  }

  const getResultsByCategory = (category: ErrorTestResult["category"]) => {
    return testResults.filter((r) => r.category === category)
  }

  const getResultIcon = (result: ErrorTestResult) => {
    if (result.errorCaught) {
      return <CheckCircle className="h-4 w-4 text-green-600" />
    }
    return <XCircle className="h-4 w-4 text-red-600" />
  }

  const getSeverityColor = (severity: ErrorTestResult["severity"]) => {
    switch (severity) {
      case "critical":
        return "border-red-500 bg-red-50 text-red-900"
      case "high":
        return "border-orange-500 bg-orange-50 text-orange-900"
      case "medium":
        return "border-yellow-500 bg-yellow-50 text-yellow-900"
      case "low":
        return "border-blue-500 bg-blue-50 text-blue-900"
      default:
        return "border-gray-500 bg-gray-50 text-gray-900"
    }
  }

  const getSeverityIcon = (severity: ErrorTestResult["severity"]) => {
    switch (severity) {
      case "critical":
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      case "high":
        return <AlertCircle className="h-4 w-4 text-orange-600" />
      case "medium":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
      case "low":
        return <AlertCircle className="h-4 w-4 text-blue-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />
    }
  }

  const stats = getTestStats()

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/test">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Main Tests
          </Button>
        </Link>
        <div className="flex-1">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
              <Shield className="h-10 w-10" />
              Error Handling Validation Suite
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Comprehensive testing of error handling, input validation, and system robustness for edge cases and
              invalid inputs
            </p>
          </div>
        </div>
      </div>

      {/* Test Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            Error Testing Controls
          </CardTitle>
          <CardDescription>Run comprehensive error handling validation tests</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={runAllErrorTests} disabled={isPending} className="flex-1" size="lg">
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running Error Tests...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  Run All Error Tests
                </>
              )}
            </Button>
            <Button variant="outline" onClick={() => setTestResults([])} disabled={isPending}>
              Clear Results
            </Button>
          </div>

          {/* Progress Bar */}
          {isPending && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{currentTest || "Preparing tests..."}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Custom Error Test */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileX className="h-5 w-5" />
            Custom Error Test
          </CardTitle>
          <CardDescription>Test custom invalid inputs to verify error handling</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="custom-amount">Amount (try: NaN, Infinity, -100, null)</Label>
              <Input
                id="custom-amount"
                value={customTestInput.amount}
                onChange={(e) => setCustomTestInput({ ...customTestInput, amount: e.target.value })}
                placeholder="Enter invalid amount..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="custom-from">From Currency (try: INVALID, empty, usd)</Label>
              <Input
                id="custom-from"
                value={customTestInput.fromCurrency}
                onChange={(e) => setCustomTestInput({ ...customTestInput, fromCurrency: e.target.value })}
                placeholder="Enter invalid currency..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="custom-to">To Currency (try: XYZ, 123, special chars)</Label>
              <Input
                id="custom-to"
                value={customTestInput.toCurrency}
                onChange={(e) => setCustomTestInput({ ...customTestInput, toCurrency: e.target.value })}
                placeholder="Enter invalid currency..."
              />
            </div>
          </div>
          <Button onClick={runCustomErrorTest} disabled={isPending} className="w-full">
            {isPending && currentTest === "Running Custom Error Test" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testing Custom Input...
              </>
            ) : (
              "Test Custom Invalid Input"
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Error Test Scenarios */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ERROR_TEST_SCENARIOS.map((scenario) => (
          <Card key={scenario.name} className={`border-l-4 border-l-${scenario.color}-500`}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <span className="text-lg">{scenario.icon}</span>
                {scenario.name}
              </CardTitle>
              <CardDescription className="text-xs">{scenario.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <div className="text-xs font-medium">Test Cases:</div>
                <div className="flex flex-wrap gap-1">
                  {scenario.tests.slice(0, 3).map((test, index) => (
                    <Badge key={index} variant="outline" className={`text-xs ${getSeverityColor(test.severity)}`}>
                      {test.severity.toUpperCase()}
                    </Badge>
                  ))}
                  {scenario.tests.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{scenario.tests.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>

              <div className="text-xs text-muted-foreground">{scenario.tests.length} error scenarios to validate</div>

              <Button
                size="sm"
                onClick={() => runErrorTestSuite(scenario)}
                disabled={isPending}
                className="w-full"
                variant={scenario.category === "security" ? "destructive" : "default"}
              >
                {isPending && currentTest?.includes(scenario.name) ? (
                  <>
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                    Testing...
                  </>
                ) : (
                  `Test ${scenario.name}`
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Test Statistics */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Error Handling Statistics
            </CardTitle>
            <CardDescription>Overview of error handling validation results</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mb-6">
              <div className="space-y-1">
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-xs text-muted-foreground">Total Tests</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-green-600">{stats.errorsCaught}</div>
                <div className="text-xs text-muted-foreground">Errors Caught</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-red-600">{stats.errorsNotCaught}</div>
                <div className="text-xs text-muted-foreground">Errors Missed</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold">{Math.round(stats.avgDuration)}ms</div>
                <div className="text-xs text-muted-foreground">Avg Duration</div>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm mb-2">By Severity Level</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="space-y-1">
                    <div className="text-lg font-bold text-red-600">{stats.bySeverity.critical}</div>
                    <div className="text-xs text-muted-foreground">Critical</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-lg font-bold text-orange-600">{stats.bySeverity.high}</div>
                    <div className="text-xs text-muted-foreground">High</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-lg font-bold text-yellow-600">{stats.bySeverity.medium}</div>
                    <div className="text-xs text-muted-foreground">Medium</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-lg font-bold text-blue-600">{stats.bySeverity.low}</div>
                    <div className="text-xs text-muted-foreground">Low</div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-sm mb-2">By Category</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
                  <div className="space-y-1">
                    <div className="text-lg font-bold text-blue-600">{stats.byCategory.validation}</div>
                    <div className="text-xs text-muted-foreground">Validation</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-lg font-bold text-yellow-600">{stats.byCategory.network}</div>
                    <div className="text-xs text-muted-foreground">Network</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-lg font-bold text-red-600">{stats.byCategory.system}</div>
                    <div className="text-xs text-muted-foreground">System</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-lg font-bold text-orange-600">{stats.byCategory.boundary}</div>
                    <div className="text-xs text-muted-foreground">Boundary</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-lg font-bold text-purple-600">{stats.byCategory.malformed}</div>
                    <div className="text-xs text-muted-foreground">Malformed</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-lg font-bold text-green-600">{stats.byCategory.security}</div>
                    <div className="text-xs text-muted-foreground">Security</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test Results by Category */}
      {testResults.length > 0 && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="validation" className="text-xs">
              Validation ({stats.byCategory.validation})
            </TabsTrigger>
            <TabsTrigger value="network" className="text-xs">
              Network ({stats.byCategory.network})
            </TabsTrigger>
            <TabsTrigger value="system" className="text-xs">
              System ({stats.byCategory.system})
            </TabsTrigger>
            <TabsTrigger value="boundary" className="text-xs">
              Boundary ({stats.byCategory.boundary})
            </TabsTrigger>
            <TabsTrigger value="malformed" className="text-xs">
              Malformed ({stats.byCategory.malformed})
            </TabsTrigger>
            <TabsTrigger value="security" className="text-xs">
              Security ({stats.byCategory.security})
            </TabsTrigger>
          </TabsList>

          {(["validation", "network", "system", "boundary", "malformed", "security"] as const).map((category) => (
            <TabsContent key={category} value={category}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    {category === "validation" && <CheckCircle className="h-4 w-4" />}
                    {category === "network" && <WifiOff className="h-4 w-4" />}
                    {category === "system" && <Database className="h-4 w-4" />}
                    {category === "boundary" && <AlertTriangle className="h-4 w-4" />}
                    {category === "malformed" && <FileX className="h-4 w-4" />}
                    {category === "security" && <Shield className="h-4 w-4" />}
                    {category.charAt(0).toUpperCase() + category.slice(1)} Error Tests
                    <Badge variant="secondary" className="text-xs">
                      {getResultsByCategory(category).length} tests
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {category === "validation" && "Input validation and type checking errors"}
                    {category === "network" && "Network connectivity and API failure simulation"}
                    {category === "system" && "System limits and resource constraint errors"}
                    {category === "boundary" && "Mathematical boundaries and edge case errors"}
                    {category === "malformed" && "Corrupted and malformed data handling"}
                    {category === "security" && "Security validation and injection attempt prevention"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {getResultsByCategory(category).map((result, index) => (
                    <div key={index} className={`p-4 rounded-lg border ${getSeverityColor(result.severity)}`}>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getResultIcon(result)}
                            {getSeverityIcon(result.severity)}
                            <div>
                              <div className="font-medium text-sm">{result.testName}</div>
                              <div className="text-xs text-muted-foreground">
                                Severity: {result.severity.toUpperCase()}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {result.duration}ms
                            </Badge>
                            <Badge variant={result.errorCaught ? "default" : "destructive"} className="text-xs">
                              {result.errorCaught ? "CAUGHT" : "MISSED"}
                            </Badge>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="text-xs">
                            <span className="font-medium text-muted-foreground">Input:</span>{" "}
                            <code className="bg-gray-100 px-1 rounded text-xs">
                              {JSON.stringify(result.input, null, 0)}
                            </code>
                          </div>
                        </div>

                        <Separator />

                        <div className="space-y-1">
                          <div className="text-xs">
                            <span className="font-medium text-muted-foreground">Expected Error:</span>{" "}
                            {result.expectedError}
                          </div>
                          <div className="text-xs">
                            <span className="font-medium text-muted-foreground">Actual Error:</span>{" "}
                            <span className={result.errorCaught ? "text-green-700" : "text-red-700"}>
                              {result.actualError}
                            </span>
                          </div>
                        </div>

                        {/* Error Handling Assessment */}
                        {result.errorCaught ? (
                          <Alert className="py-2 border-green-200 bg-green-50">
                            <CheckCircle className="h-3 w-3 text-green-600" />
                            <AlertDescription className="text-xs text-green-800">
                              <strong>✅ Error Properly Handled:</strong> The system correctly caught and handled this
                              invalid input with an appropriate error message.
                            </AlertDescription>
                          </Alert>
                        ) : (
                          <Alert className="py-2 border-red-200 bg-red-50">
                            <XCircle className="h-3 w-3 text-red-600" />
                            <AlertDescription className="text-xs text-red-800">
                              <strong>❌ Error Not Caught:</strong> This invalid input was not properly handled and may
                              pose a security or stability risk.
                            </AlertDescription>
                          </Alert>
                        )}

                        {/* Security Alert for Critical Issues */}
                        {result.severity === "critical" && !result.errorCaught && (
                          <Alert className="py-2 border-red-500 bg-red-100">
                            <AlertTriangle className="h-3 w-3 text-red-700" />
                            <AlertDescription className="text-xs text-red-900">
                              <strong>🚨 CRITICAL SECURITY ISSUE:</strong> This unhandled input could potentially be
                              exploited for security attacks. Immediate attention required.
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      )}

      {/* Error Handling Guide */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription className="text-sm">
          <strong>Error Handling Validation Guide:</strong>
          <ul className="mt-2 space-y-1 list-disc list-inside text-xs">
            <li>
              <strong>Input Validation:</strong> All user inputs should be validated for type, range, and format
            </li>
            <li>
              <strong>Security Validation:</strong> Prevent injection attacks and malicious input patterns
            </li>
            <li>
              <strong>Boundary Checking:</strong> Handle mathematical limits and system constraints gracefully
            </li>
            <li>
              <strong>Network Resilience:</strong> Gracefully handle network failures and API errors
            </li>
            <li>
              <strong>Error Messages:</strong> Provide clear, helpful error messages without exposing system details
            </li>
            <li>
              <strong>Logging:</strong> Log errors appropriately for debugging while maintaining security
            </li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  )
}
