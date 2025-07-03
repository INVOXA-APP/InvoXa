"use client"

import { useState, useTransition } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Loader2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Microscope,
  Target,
  TrendingUp,
  Calculator,
  Zap,
  BarChart3,
  AlertCircle,
} from "lucide-react"
import { convertCurrency } from "@/app/currency/actions"

interface BoundaryTestResult {
  testName: string
  amount: number
  fromCurrency: string
  toCurrency: string
  convertedAmount?: number
  exchangeRate?: number
  precision?: number
  success: boolean
  error?: string
  duration: number
  timestamp: string
  category: "boundary" | "micro" | "large" | "extreme"
  expectedBehavior: string
  actualBehavior: string
}

interface BoundaryTestScenario {
  name: string
  description: string
  amounts: number[]
  category: "boundary" | "micro" | "large" | "extreme"
  expectedBehavior: string
  icon: string
  color: string
}

const BOUNDARY_TEST_SCENARIOS: BoundaryTestScenario[] = [
  // Precision Boundary Tests (around 0.01)
  {
    name: "Precision Boundary Tests",
    description: "Test exactly at 0.01 precision boundary",
    amounts: [0.009, 0.0099, 0.01, 0.0101, 0.011],
    category: "boundary",
    expectedBehavior: "Precision switches from 8-decimal to 6-decimal at exactly 0.01",
    icon: "🎯",
    color: "orange",
  },

  // Ultra-Micro Amount Tests
  {
    name: "Ultra-Micro Amount Tests",
    description: "Extreme small amounts testing precision limits",
    amounts: [0.0000001, 0.000001, 0.00001, 0.0001, 0.001],
    category: "micro",
    expectedBehavior: "All amounts maintain 8-decimal precision",
    icon: "🔬",
    color: "purple",
  },

  // Large Number Tests
  {
    name: "Large Number Tests",
    description: "Test very large amounts for precision handling",
    amounts: [1000, 10000, 100000, 1000000, 10000000],
    category: "large",
    expectedBehavior: "Large amounts use 2-decimal precision, no overflow",
    icon: "💰",
    color: "green",
  },

  // Extreme Boundary Tests
  {
    name: "Extreme Boundary Tests",
    description: "Edge cases and mathematical limits",
    amounts: [0.00000001, 0.99999999, 1.00000001, 999999.99, 1000000.01],
    category: "extreme",
    expectedBehavior: "Handle extreme precision and large number edge cases",
    icon: "⚡",
    color: "red",
  },

  // Decimal Precision Tests
  {
    name: "Decimal Precision Tests",
    description: "Test various decimal precision levels",
    amounts: [0.1, 0.12, 0.123, 0.1234, 0.12345, 0.123456, 0.1234567, 0.12345678],
    category: "boundary",
    expectedBehavior: "Precision handling varies by amount size",
    icon: "📊",
    color: "blue",
  },

  // Currency-Specific Boundary Tests
  {
    name: "Currency-Specific Boundaries",
    description: "Test boundaries specific to different currencies",
    amounts: [0.01, 0.1, 1.0, 10.0, 100.0, 1000.0],
    category: "boundary",
    expectedBehavior: "Different currencies handle boundaries differently (JPY vs USD)",
    icon: "🌍",
    color: "teal",
  },
]

const CURRENCY_PAIRS = [
  { from: "USD", to: "EUR", label: "USD → EUR", type: "standard", rate: "~0.85" },
  { from: "USD", to: "JPY", label: "USD → JPY", type: "high-rate", rate: "~110" },
  { from: "JPY", to: "USD", label: "JPY → USD", type: "low-rate", rate: "~0.009" },
  { from: "USD", to: "INR", label: "USD → INR", type: "very-high-rate", rate: "~74.5" },
  { from: "EUR", to: "JPY", label: "EUR → JPY", type: "compound-high", rate: "~129.4" },
  { from: "GBP", to: "USD", label: "GBP → USD", type: "standard", rate: "~1.37" },
]

export default function MicroTestPage() {
  const [testResults, setTestResults] = useState<BoundaryTestResult[]>([])
  const [currentTest, setCurrentTest] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [progress, setProgress] = useState(0)
  const [selectedPair, setSelectedPair] = useState(CURRENCY_PAIRS[0])
  const [activeTab, setActiveTab] = useState("boundary")

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

    // Special handling for JPY
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

    // For large amounts, use appropriate precision
    if (amount >= 1000000) {
      return `${currency.symbol}${(amount / 1000000).toFixed(2)}M`
    } else if (amount >= 1000) {
      return `${currency.symbol}${(amount / 1000).toFixed(1)}K`
    }

    // Standard formatting
    const actualPrecision = precision || currency.decimals
    return `${currency.symbol}${amount.toLocaleString("en-US", {
      minimumFractionDigits: actualPrecision,
      maximumFractionDigits: actualPrecision,
    })}`
  }

  const runSingleTest = async (
    amount: number,
    fromCurrency: string,
    toCurrency: string,
    testName: string,
    expectedBehavior: string,
    category: BoundaryTestResult["category"],
  ): Promise<BoundaryTestResult> => {
    const startTime = Date.now()

    try {
      const result = await convertCurrency(amount, fromCurrency, toCurrency)
      const duration = Date.now() - startTime

      let actualBehavior = ""
      if (result.success && result.convertedAmount !== undefined) {
        const precision = result.precision || 2
        if (amount < 0.01) {
          actualBehavior = `8-decimal precision applied (${precision} decimals)`
        } else if (amount < 1) {
          actualBehavior = `6-decimal precision applied (${precision} decimals)`
        } else if (amount < 100) {
          actualBehavior = `4-decimal precision applied (${precision} decimals)`
        } else {
          actualBehavior = `2-decimal precision applied (${precision} decimals)`
        }

        if (amount >= 1000000) {
          actualBehavior += " - Large number handling"
        }
      } else {
        actualBehavior = `Conversion failed: ${result.error}`
      }

      return {
        testName,
        amount,
        fromCurrency,
        toCurrency,
        convertedAmount: result.success ? result.convertedAmount : undefined,
        exchangeRate: result.success ? result.exchangeRate : undefined,
        precision: result.success ? result.precision : undefined,
        success: result.success,
        error: result.error,
        duration,
        timestamp: new Date().toISOString(),
        category,
        expectedBehavior,
        actualBehavior,
      }
    } catch (error) {
      return {
        testName,
        amount,
        fromCurrency,
        toCurrency,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        category,
        expectedBehavior,
        actualBehavior: `Exception thrown: ${error instanceof Error ? error.message : "Unknown error"}`,
      }
    }
  }

  const runBoundaryTestSuite = async (scenario: BoundaryTestScenario) => {
    startTransition(async () => {
      setTestResults([])
      setProgress(0)
      setCurrentTest(`Running ${scenario.name}`)

      const results: BoundaryTestResult[] = []
      const totalTests = scenario.amounts.length

      for (let i = 0; i < scenario.amounts.length; i++) {
        const amount = scenario.amounts[i]
        setCurrentTest(`${scenario.name}: Testing ${formatCurrency(amount, selectedPair.from)}`)

        const result = await runSingleTest(
          amount,
          selectedPair.from,
          selectedPair.to,
          scenario.name,
          scenario.expectedBehavior,
          scenario.category,
        )

        results.push(result)
        setTestResults([...results])
        setProgress(((i + 1) / totalTests) * 100)

        // Small delay for better UX
        await new Promise((resolve) => setTimeout(resolve, 300))
      }

      setCurrentTest(null)
    })
  }

  const runAllBoundaryTests = async () => {
    startTransition(async () => {
      setTestResults([])
      setProgress(0)
      setCurrentTest("Running All Boundary Tests")

      const allResults: BoundaryTestResult[] = []
      let totalTests = 0
      let completedTests = 0

      // Calculate total tests
      BOUNDARY_TEST_SCENARIOS.forEach((scenario) => {
        totalTests += scenario.amounts.length
      })

      for (const scenario of BOUNDARY_TEST_SCENARIOS) {
        setCurrentTest(`Running ${scenario.name}`)

        for (const amount of scenario.amounts) {
          setCurrentTest(`${scenario.name}: Testing ${formatCurrency(amount, selectedPair.from)}`)

          const result = await runSingleTest(
            amount,
            selectedPair.from,
            selectedPair.to,
            scenario.name,
            scenario.expectedBehavior,
            scenario.category,
          )

          allResults.push(result)
          setTestResults([...allResults])

          completedTests++
          setProgress((completedTests / totalTests) * 100)

          await new Promise((resolve) => setTimeout(resolve, 200))
        }
      }

      setCurrentTest(null)
    })
  }

  const getTestStats = () => {
    const total = testResults.length
    const successful = testResults.filter((r) => r.success).length
    const failed = testResults.filter((r) => !r.success).length
    const avgDuration = total > 0 ? testResults.reduce((sum, r) => sum + r.duration, 0) / total : 0

    const byCategory = {
      boundary: testResults.filter((r) => r.category === "boundary").length,
      micro: testResults.filter((r) => r.category === "micro").length,
      large: testResults.filter((r) => r.category === "large").length,
      extreme: testResults.filter((r) => r.category === "extreme").length,
    }

    return { total, successful, failed, avgDuration, byCategory }
  }

  const getResultsByCategory = (category: BoundaryTestResult["category"]) => {
    return testResults.filter((r) => r.category === category)
  }

  const getResultIcon = (result: BoundaryTestResult) => {
    if (result.success) {
      return <CheckCircle className="h-4 w-4 text-green-600" />
    }
    return <XCircle className="h-4 w-4 text-red-600" />
  }

  const getResultColor = (result: BoundaryTestResult) => {
    if (!result.success) return "border-red-200 bg-red-50"

    switch (result.category) {
      case "boundary":
        return "border-orange-200 bg-orange-50"
      case "micro":
        return "border-purple-200 bg-purple-50"
      case "large":
        return "border-green-200 bg-green-50"
      case "extreme":
        return "border-red-200 bg-red-50"
      default:
        return "border-blue-200 bg-blue-50"
    }
  }

  const stats = getTestStats()

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
          <Target className="h-10 w-10" />
          Boundary Condition Testing Suite
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Comprehensive testing of boundary conditions, precision limits, and edge cases for currency conversion
          accuracy validation
        </p>
      </div>

      {/* Currency Pair Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Test Configuration
          </CardTitle>
          <CardDescription>Select currency pair for boundary condition testing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Currency Pair</label>
            <Select
              value={`${selectedPair.from}-${selectedPair.to}`}
              onValueChange={(value) => {
                const [from, to] = value.split("-")
                const pair = CURRENCY_PAIRS.find((p) => p.from === from && p.to === to)
                if (pair) setSelectedPair(pair)
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCY_PAIRS.map((pair) => (
                  <SelectItem key={`${pair.from}-${pair.to}`} value={`${pair.from}-${pair.to}`}>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{pair.label}</span>
                      <Badge variant="outline" className="text-xs">
                        {pair.type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">Rate: {pair.rate}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button onClick={runAllBoundaryTests} disabled={isPending} className="flex-1" size="lg">
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running All Boundary Tests...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  Run All Boundary Tests
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

      {/* Test Scenarios */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {BOUNDARY_TEST_SCENARIOS.map((scenario) => (
          <Card key={scenario.name} className={`border-l-4 border-l-${scenario.color}-500`}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <span className="text-lg">{scenario.icon}</span>
                {scenario.name}
              </CardTitle>
              <CardDescription className="text-xs">{scenario.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-xs text-muted-foreground italic">{scenario.expectedBehavior}</div>

              <div className="space-y-1">
                <div className="text-xs font-medium">Test Amounts:</div>
                <div className="flex flex-wrap gap-1">
                  {scenario.amounts.slice(0, 3).map((amount, index) => (
                    <Badge key={index} variant="outline" className="text-xs font-mono">
                      {amount < 1 ? amount.toFixed(8).replace(/\.?0+$/, "") : amount.toLocaleString()}
                    </Badge>
                  ))}
                  {scenario.amounts.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{scenario.amounts.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>

              <Button
                size="sm"
                onClick={() => runBoundaryTestSuite(scenario)}
                disabled={isPending}
                className="w-full"
                variant={scenario.category === "extreme" ? "destructive" : "default"}
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
              <BarChart3 className="h-5 w-5" />
              Test Statistics
            </CardTitle>
            <CardDescription>Overview of boundary condition test results</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mb-6">
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

            <Separator className="my-4" />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="space-y-1">
                <div className="text-lg font-bold text-orange-600">{stats.byCategory.boundary}</div>
                <div className="text-xs text-muted-foreground">Boundary Tests</div>
              </div>
              <div className="space-y-1">
                <div className="text-lg font-bold text-purple-600">{stats.byCategory.micro}</div>
                <div className="text-xs text-muted-foreground">Micro Tests</div>
              </div>
              <div className="space-y-1">
                <div className="text-lg font-bold text-green-600">{stats.byCategory.large}</div>
                <div className="text-xs text-muted-foreground">Large Tests</div>
              </div>
              <div className="space-y-1">
                <div className="text-lg font-bold text-red-600">{stats.byCategory.extreme}</div>
                <div className="text-xs text-muted-foreground">Extreme Tests</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test Results by Category */}
      {testResults.length > 0 && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="boundary" className="text-xs">
              Boundary ({stats.byCategory.boundary})
            </TabsTrigger>
            <TabsTrigger value="micro" className="text-xs">
              Micro ({stats.byCategory.micro})
            </TabsTrigger>
            <TabsTrigger value="large" className="text-xs">
              Large ({stats.byCategory.large})
            </TabsTrigger>
            <TabsTrigger value="extreme" className="text-xs">
              Extreme ({stats.byCategory.extreme})
            </TabsTrigger>
          </TabsList>

          {(["boundary", "micro", "large", "extreme"] as const).map((category) => (
            <TabsContent key={category} value={category}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    {category === "boundary" && <Target className="h-4 w-4" />}
                    {category === "micro" && <Microscope className="h-4 w-4" />}
                    {category === "large" && <TrendingUp className="h-4 w-4" />}
                    {category === "extreme" && <AlertTriangle className="h-4 w-4" />}
                    {category.charAt(0).toUpperCase() + category.slice(1)} Test Results
                    <Badge variant="secondary" className="text-xs">
                      {getResultsByCategory(category).length} tests
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {category === "boundary" && "Tests around precision boundaries (0.01, 1.0, 100.0)"}
                    {category === "micro" && "Ultra-small amount tests (0.0000001 - 0.001)"}
                    {category === "large" && "Large number tests (1,000 - 10,000,000)"}
                    {category === "extreme" && "Edge cases and mathematical limits"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {getResultsByCategory(category).map((result, index) => (
                    <div key={index} className={`p-4 rounded-lg border ${getResultColor(result)}`}>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getResultIcon(result)}
                            <div>
                              <div className="font-medium text-sm">{result.testName}</div>
                              <div className="text-xs text-muted-foreground">
                                Amount: {formatCurrency(result.amount, result.fromCurrency)}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {result.duration}ms
                            </Badge>
                            {result.precision && (
                              <Badge variant="secondary" className="text-xs">
                                {result.precision}-decimal
                              </Badge>
                            )}
                          </div>
                        </div>

                        {result.success && result.convertedAmount !== undefined ? (
                          <div className="space-y-2">
                            <div className="font-mono text-sm">
                              {formatCurrency(result.amount, result.fromCurrency)} →{" "}
                              <span className="font-bold">
                                {formatCurrency(result.convertedAmount, result.toCurrency, result.precision)}
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Exchange Rate: {result.exchangeRate?.toFixed(8)}
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-red-600">Error: {result.error}</div>
                        )}

                        <Separator />

                        <div className="space-y-1">
                          <div className="text-xs">
                            <span className="font-medium text-muted-foreground">Expected:</span>{" "}
                            {result.expectedBehavior}
                          </div>
                          <div className="text-xs">
                            <span className="font-medium text-muted-foreground">Actual:</span> {result.actualBehavior}
                          </div>
                        </div>

                        {/* Special indicators for boundary conditions */}
                        {result.amount === 0.01 && (
                          <Alert className="py-2">
                            <AlertCircle className="h-3 w-3" />
                            <AlertDescription className="text-xs">
                              <strong>Precision Boundary:</strong> This is exactly at the 0.01 boundary where precision
                              switches from 8-decimal to 6-decimal.
                            </AlertDescription>
                          </Alert>
                        )}

                        {result.amount >= 1000000 && (
                          <Alert className="py-2">
                            <AlertCircle className="h-3 w-3" />
                            <AlertDescription className="text-xs">
                              <strong>Large Number:</strong> Testing system handling of amounts ≥ 1 million.
                            </AlertDescription>
                          </Alert>
                        )}

                        {result.amount < 0.000001 && (
                          <Alert className="py-2">
                            <AlertCircle className="h-3 w-3" />
                            <AlertDescription className="text-xs">
                              <strong>Ultra-Micro Amount:</strong> Testing extreme precision limits with amounts &lt;
                              0.000001.
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

      {/* Boundary Testing Guide */}
      <Alert>
        <Target className="h-4 w-4" />
        <AlertDescription className="text-sm">
          <strong>Boundary Condition Testing Guide:</strong>
          <ul className="mt-2 space-y-1 list-disc list-inside text-xs">
            <li>
              <strong>Precision Boundaries:</strong> Test exactly at 0.01 where precision switches from 8-decimal to
              6-decimal
            </li>
            <li>
              <strong>Ultra-Micro Tests:</strong> Verify 8-decimal precision for amounts as small as 0.0000001
            </li>
            <li>
              <strong>Large Number Tests:</strong> Ensure no overflow or precision loss with amounts up to 10 million
            </li>
            <li>
              <strong>Extreme Edge Cases:</strong> Test mathematical limits and unusual decimal patterns
            </li>
            <li>
              <strong>Currency-Specific:</strong> Different currencies (JPY vs USD) may handle boundaries differently
            </li>
            <li>
              <strong>Performance Impact:</strong> Boundary conditions may have different performance characteristics
            </li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  )
}
