"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import {
  Calculator,
  Zap,
  TestTube,
  Microscope,
  TrendingUp,
  TrendingDown,
  Target,
  ArrowRight,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
} from "lucide-react"
import Link from "next/link"
import { convertCurrency } from "@/app/currency/actions"

interface ExtremePrecisionTest {
  name: string
  description: string
  fromCurrency: string
  toCurrency: string
  amounts: number[]
  category: "high-rate" | "low-rate" | "standard"
  expectedRate: number
  icon: string
  rateDescription: string
}

interface TestResult {
  amount: number
  fromCurrency: string
  toCurrency: string
  convertedAmount?: number
  exchangeRate?: number
  success: boolean
  error?: string
  duration: number
  precision: number
  timestamp: string
}

const EXTREME_PRECISION_TESTS: ExtremePrecisionTest[] = [
  {
    name: "USD → JPY (High Rate)",
    description: "High multiplication rate testing",
    fromCurrency: "USD",
    toCurrency: "JPY",
    amounts: [0.001, 0.005, 0.01, 0.05, 0.1],
    category: "high-rate",
    expectedRate: 110.0,
    icon: "📈",
    rateDescription: "~110x multiplication - tests precision with large rate multipliers",
  },
  {
    name: "JPY → USD (Low Rate)",
    description: "Ultra-low division rate testing",
    fromCurrency: "JPY",
    toCurrency: "USD",
    amounts: [0.001, 0.005, 0.01, 0.05, 0.1, 1.0, 10.0],
    category: "low-rate",
    expectedRate: 0.00909,
    icon: "📉",
    rateDescription: "~0.009x division - tests extreme decimal precision",
  },
  {
    name: "USD → INR (Very High Rate)",
    description: "Very high multiplication testing",
    fromCurrency: "USD",
    toCurrency: "INR",
    amounts: [0.001, 0.005, 0.01, 0.05, 0.1],
    category: "high-rate",
    expectedRate: 74.5,
    icon: "🚀",
    rateDescription: "~74.5x multiplication - tests high-rate precision",
  },
  {
    name: "EUR → JPY (Compound High Rate)",
    description: "Compound high rate conversion",
    fromCurrency: "EUR",
    toCurrency: "JPY",
    amounts: [0.001, 0.005, 0.01, 0.05, 0.1],
    category: "high-rate",
    expectedRate: 129.4,
    icon: "⚡",
    rateDescription: "~129.4x multiplication - compound high-rate testing",
  },
]

export default function TestPage() {
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [currentTest, setCurrentTest] = useState<string | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [selectedTestSuite, setSelectedTestSuite] = useState<string | null>(null)

  const formatCurrency = (amount: number, currencyCode: string, precision?: number) => {
    const currencyMap: Record<string, { symbol: string; decimals: number }> = {
      USD: { symbol: "$", decimals: 2 },
      EUR: { symbol: "€", decimals: 2 },
      GBP: { symbol: "£", decimals: 2 },
      JPY: { symbol: "¥", decimals: 0 },
      INR: { symbol: "₹", decimals: 2 },
      CAD: { symbol: "C$", decimals: 2 },
      AUD: { symbol: "A$", decimals: 2 },
    }

    const currency = currencyMap[currencyCode] || { symbol: currencyCode, decimals: 2 }

    // For JPY, show no decimals for amounts >= 1, but show decimals for micro amounts
    if (currencyCode === "JPY") {
      if (amount >= 1) {
        return `${currency.symbol}${Math.round(amount).toLocaleString()}`
      } else if (amount < 0.01) {
        return `${currency.symbol}${amount.toFixed(8)}`
      } else {
        return `${currency.symbol}${amount.toFixed(2)}`
      }
    }

    // For very small amounts, show 8-decimal precision
    if (amount < 0.01 && amount > 0) {
      return `${currency.symbol}${amount.toFixed(8)}`
    }

    // For other amounts, use standard precision
    const actualPrecision = precision || currency.decimals
    return `${currency.symbol}${amount.toFixed(actualPrecision)}`
  }

  const runSingleTest = async (amount: number, fromCurrency: string, toCurrency: string): Promise<TestResult> => {
    const startTime = Date.now()

    try {
      const result = await convertCurrency(amount, fromCurrency, toCurrency)
      const duration = Date.now() - startTime

      return {
        amount,
        fromCurrency,
        toCurrency,
        convertedAmount: result.success ? result.convertedAmount : undefined,
        exchangeRate: result.success ? result.exchangeRate : undefined,
        success: result.success,
        error: result.error,
        duration,
        precision: result.precision || 2,
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      return {
        amount,
        fromCurrency,
        toCurrency,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        duration: Date.now() - startTime,
        precision: 2,
        timestamp: new Date().toISOString(),
      }
    }
  }

  const runExtremePrecisionTest = async (testSuite: ExtremePrecisionTest) => {
    setIsRunning(true)
    setSelectedTestSuite(testSuite.name)
    setTestResults([])
    setProgress(0)

    const results: TestResult[] = []
    const totalTests = testSuite.amounts.length

    for (let i = 0; i < testSuite.amounts.length; i++) {
      const amount = testSuite.amounts[i]
      setCurrentTest(`Testing ${testSuite.name}: ${formatCurrency(amount, testSuite.fromCurrency)}`)

      const result = await runSingleTest(amount, testSuite.fromCurrency, testSuite.toCurrency)
      results.push(result)
      setTestResults([...results])

      setProgress(((i + 1) / totalTests) * 100)

      // Small delay for better UX
      await new Promise((resolve) => setTimeout(resolve, 400))
    }

    setCurrentTest(null)
    setIsRunning(false)
    setSelectedTestSuite(null)
  }

  const runAllExtremePrecisionTests = async () => {
    setIsRunning(true)
    setSelectedTestSuite("All Extreme Precision Tests")
    setTestResults([])
    setProgress(0)

    const allResults: TestResult[] = []
    let totalTests = 0
    let completedTests = 0

    // Calculate total tests
    EXTREME_PRECISION_TESTS.forEach((suite) => {
      totalTests += suite.amounts.length
    })

    for (const testSuite of EXTREME_PRECISION_TESTS) {
      setCurrentTest(`Running ${testSuite.name}`)

      for (const amount of testSuite.amounts) {
        setCurrentTest(`Testing ${testSuite.name}: ${formatCurrency(amount, testSuite.fromCurrency)}`)

        const result = await runSingleTest(amount, testSuite.fromCurrency, testSuite.toCurrency)
        allResults.push(result)
        setTestResults([...allResults])

        completedTests++
        setProgress((completedTests / totalTests) * 100)

        await new Promise((resolve) => setTimeout(resolve, 200))
      }
    }

    setCurrentTest(null)
    setIsRunning(false)
    setSelectedTestSuite(null)
  }

  const getTestStats = () => {
    const total = testResults.length
    const successful = testResults.filter((r) => r.success).length
    const failed = testResults.filter((r) => !r.success).length
    const avgDuration = total > 0 ? testResults.reduce((sum, r) => sum + r.duration, 0) / total : 0

    return { total, successful, failed, avgDuration }
  }

  const getHighRateResults = () => {
    return testResults.filter(
      (r) =>
        (r.fromCurrency === "USD" && r.toCurrency === "JPY") ||
        (r.fromCurrency === "USD" && r.toCurrency === "INR") ||
        (r.fromCurrency === "EUR" && r.toCurrency === "JPY"),
    )
  }

  const getLowRateResults = () => {
    return testResults.filter((r) => r.fromCurrency === "JPY" && r.toCurrency === "USD")
  }

  const stats = getTestStats()
  const highRateResults = getHighRateResults()
  const lowRateResults = getLowRateResults()

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
          <TestTube className="h-10 w-10" />
          Currency Conversion Testing Suite
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Comprehensive testing platform for currency conversion accuracy, precision, and performance validation
        </p>
      </div>

      {/* Quick Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/test/micro">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-purple-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Microscope className="h-5 w-5" />
                Ultra-Small Precision Tests
              </CardTitle>
              <CardDescription className="text-sm">
                Specialized testing for amounts 0.001 - 0.005 with 8-decimal precision
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-xs">
                  0.001 - 0.005
                </Badge>
                <ArrowRight className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Standard Conversion Tests
            </CardTitle>
            <CardDescription className="text-sm">
              Regular currency conversion testing with standard amounts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="text-xs">
                1.00 - 1000.00
              </Badge>
              <span className="text-sm text-muted-foreground">Coming Soon</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Performance Benchmarks
            </CardTitle>
            <CardDescription className="text-sm">
              Load testing and performance validation for high-volume scenarios
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="text-xs">
                Bulk Testing
              </Badge>
              <span className="text-sm text-muted-foreground">Coming Soon</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Extreme Precision Testing */}
      <Card className="border-l-4 border-l-orange-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Extreme Precision Testing: High-Rate & Low-Rate Conversions
          </CardTitle>
          <CardDescription>
            Test currency conversion accuracy with extreme exchange rates - high multiplication rates (USD→JPY) and
            ultra-low division rates (JPY→USD) to verify precision handling at the extremes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Test Suite Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {EXTREME_PRECISION_TESTS.map((testSuite) => (
              <Card
                key={testSuite.name}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  testSuite.category === "high-rate"
                    ? "border-l-4 border-l-green-500 bg-green-50"
                    : testSuite.category === "low-rate"
                      ? "border-l-4 border-l-red-500 bg-red-50"
                      : "border-l-4 border-l-blue-500 bg-blue-50"
                }`}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <span className="text-lg">{testSuite.icon}</span>
                    {testSuite.name}
                    {testSuite.category === "high-rate" && <TrendingUp className="h-4 w-4 text-green-600" />}
                    {testSuite.category === "low-rate" && <TrendingDown className="h-4 w-4 text-red-600" />}
                  </CardTitle>
                  <CardDescription className="text-xs">{testSuite.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-xs text-muted-foreground">{testSuite.rateDescription}</div>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      Rate: ~{testSuite.expectedRate}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {testSuite.amounts.length} tests
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => runExtremePrecisionTest(testSuite)}
                    disabled={isRunning}
                    className="w-full"
                  >
                    {isRunning && selectedTestSuite === testSuite.name ? (
                      <>
                        <Clock className="mr-2 h-3 w-3 animate-spin" />
                        Testing...
                      </>
                    ) : (
                      `Test ${testSuite.name}`
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Master Control */}
          <div className="flex gap-4">
            <Button onClick={runAllExtremePrecisionTests} disabled={isRunning} className="flex-1" size="lg">
              {isRunning && selectedTestSuite === "All Extreme Precision Tests" ? (
                <>
                  <Clock className="mr-2 h-4 w-4 animate-spin" />
                  Running All Extreme Tests...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  Run All Extreme Precision Tests
                </>
              )}
            </Button>
            <Button variant="outline" onClick={() => setTestResults([])} disabled={isRunning}>
              Clear Results
            </Button>
          </div>

          {/* Progress Bar */}
          {isRunning && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{currentTest || "Preparing tests..."}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {/* Test Statistics */}
          {testResults.length > 0 && (
            <Card className="bg-muted/50">
              <CardContent className="pt-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="space-y-1">
                    <div className="text-2xl font-bold">{stats.total}</div>
                    <div className="text-xs text-muted-foreground">Total Tests</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-green-600">{stats.successful}</div>
                    <div className="text-xs text-muted-foreground">Successful</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
                    <div className="text-xs text-muted-foreground">Failed</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold">{Math.round(stats.avgDuration)}ms</div>
                    <div className="text-xs text-muted-foreground">Avg Duration</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* High-Rate Results */}
          {highRateResults.length > 0 && (
            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  High-Rate Conversion Results
                  <Badge variant="secondary" className="text-xs">
                    {highRateResults.length} tests
                  </Badge>
                </CardTitle>
                <CardDescription className="text-xs">
                  Results for high multiplication rates (USD→JPY ~110x, USD→INR ~74.5x, EUR→JPY ~129.4x)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {highRateResults.map((result, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border ${
                      result.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {result.success ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <div className="text-sm">
                          <span className="font-medium">
                            {result.fromCurrency} → {result.toCurrency}
                          </span>
                          <div className="text-xs text-muted-foreground">High-rate multiplication test</div>
                        </div>
                      </div>

                      <div className="text-right">
                        {result.success && result.convertedAmount !== undefined ? (
                          <div className="space-y-1">
                            <div className="font-mono text-sm">
                              {formatCurrency(result.amount, result.fromCurrency)} →{" "}
                              <span className="font-bold text-green-700">
                                {formatCurrency(result.convertedAmount, result.toCurrency)}
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Rate: {result.exchangeRate?.toFixed(8)} • {result.duration}ms
                            </div>
                            {result.amount < 0.01 && (
                              <Badge variant="outline" className="text-xs">
                                8-decimal precision
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <div className="text-xs text-red-600">{result.error}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Low-Rate Results */}
          {lowRateResults.length > 0 && (
            <Card className="border-l-4 border-l-red-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingDown className="h-4 w-4" />
                  Low-Rate Conversion Results
                  <Badge variant="secondary" className="text-xs">
                    {lowRateResults.length} tests
                  </Badge>
                </CardTitle>
                <CardDescription className="text-xs">
                  Results for ultra-low division rates (JPY→USD ~0.009x) - extreme decimal precision testing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {lowRateResults.map((result, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border ${
                      result.success ? "bg-red-50 border-red-200" : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {result.success ? (
                          <CheckCircle className="h-4 w-4 text-red-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-gray-600" />
                        )}
                        <div className="text-sm">
                          <span className="font-medium">
                            {result.fromCurrency} → {result.toCurrency}
                          </span>
                          <div className="text-xs text-muted-foreground">Ultra-low rate division test</div>
                        </div>
                      </div>

                      <div className="text-right">
                        {result.success && result.convertedAmount !== undefined ? (
                          <div className="space-y-1">
                            <div className="font-mono text-sm">
                              {formatCurrency(result.amount, result.fromCurrency)} →{" "}
                              <span className="font-bold text-red-700">
                                {formatCurrency(result.convertedAmount, result.toCurrency)}
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Rate: {result.exchangeRate?.toFixed(8)} • {result.duration}ms
                            </div>
                            {result.convertedAmount < 0.01 && (
                              <Badge variant="outline" className="text-xs bg-red-100 text-red-700">
                                Ultra-precision required
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <div className="text-xs text-red-600">{result.error}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Testing Guide */}
          <Alert>
            <DollarSign className="h-4 w-4" />
            <AlertDescription className="text-xs">
              <strong>Extreme Precision Testing Guide:</strong>
              <ul className="mt-2 space-y-1 list-disc list-inside">
                <li>
                  <strong>High-Rate Tests (USD→JPY ~110x):</strong> Verify precision is maintained when small amounts
                  are multiplied by large rates
                </li>
                <li>
                  <strong>Low-Rate Tests (JPY→USD ~0.009x):</strong> Test extreme decimal precision when amounts are
                  divided by very small rates
                </li>
                <li>
                  <strong>Ultra-Small + High-Rate:</strong> $0.001 → ¥0.11 tests micro-amount multiplication accuracy
                </li>
                <li>
                  <strong>Ultra-Small + Low-Rate:</strong> ¥0.001 → $0.00000910 tests extreme decimal precision limits
                </li>
                <li>
                  <strong>Performance Impact:</strong> Extreme precision calculations may have slightly higher latency
                </li>
              </ul>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}
