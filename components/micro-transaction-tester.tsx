"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, CheckCircle, XCircle, Zap, Calculator, Microscope, Target } from "lucide-react"
import { convertCurrency } from "@/app/currency/actions"

interface MicroTestResult {
  amount: number
  fromCurrency: string
  toCurrency: string
  result?: number
  exchangeRate?: number
  success: boolean
  error?: string
  duration: number
  timestamp: number
}

interface MicroTestScenario {
  name: string
  description: string
  amount: number
  icon: string
  category: "precision" | "micro" | "fractional" | "small"
  expectedBehavior: string
}

const MICRO_TEST_SCENARIOS: MicroTestScenario[] = [
  // Ultra-micro amounts (precision testing)
  {
    name: "Micro Cent",
    description: "0.1 cent",
    amount: 0.001,
    icon: "🔬",
    category: "precision",
    expectedBehavior: "Tests 8-decimal precision handling",
  },
  {
    name: "Half Cent",
    description: "0.5 cent",
    amount: 0.005,
    icon: "💫",
    category: "precision",
    expectedBehavior: "Tests sub-cent accuracy",
  },

  // Cent-level amounts
  {
    name: "One Cent",
    description: "1 cent",
    amount: 0.01,
    icon: "🪙",
    category: "micro",
    expectedBehavior: "Standard micro-transaction",
  },
  {
    name: "Five Cents",
    description: "5 cents (nickel)",
    amount: 0.05,
    icon: "🥉",
    category: "micro",
    expectedBehavior: "Common small denomination",
  },
  {
    name: "Ten Cents",
    description: "10 cents (dime)",
    amount: 0.1,
    icon: "🥈",
    category: "micro",
    expectedBehavior: "Decimal boundary test",
  },
  {
    name: "Quarter",
    description: "25 cents",
    amount: 0.25,
    icon: "🥇",
    category: "micro",
    expectedBehavior: "Quarter-dollar precision",
  },

  // Fractional amounts
  {
    name: "Half Dollar",
    description: "50 cents",
    amount: 0.5,
    icon: "💰",
    category: "fractional",
    expectedBehavior: "Half-unit conversion",
  },
  {
    name: "Three Quarters",
    description: "75 cents",
    amount: 0.75,
    icon: "💎",
    category: "fractional",
    expectedBehavior: "Complex fractional amount",
  },
  {
    name: "Ninety-Nine Cents",
    description: "99 cents",
    amount: 0.99,
    icon: "🎯",
    category: "fractional",
    expectedBehavior: "Common pricing point",
  },

  // Small whole amounts
  {
    name: "One Unit",
    description: "1 dollar/euro/pound",
    amount: 1.0,
    icon: "💵",
    category: "small",
    expectedBehavior: "Base unit conversion",
  },
  {
    name: "Two Units",
    description: "2 units",
    amount: 2.0,
    icon: "💶",
    category: "small",
    expectedBehavior: "Small integer amount",
  },
  {
    name: "Five Units",
    description: "5 units",
    amount: 5.0,
    icon: "💷",
    category: "small",
    expectedBehavior: "Standard small transaction",
  },
]

const MICRO_CURRENCY_PAIRS = [
  { from: "USD", to: "EUR", label: "USD → EUR", description: "Dollar to Euro", rate: "~0.85" },
  { from: "EUR", to: "USD", label: "EUR → USD", description: "Euro to Dollar", rate: "~1.18" },
  { from: "USD", to: "JPY", label: "USD → JPY", description: "Dollar to Yen (high rate)", rate: "~110" },
  { from: "JPY", to: "USD", label: "JPY → USD", description: "Yen to Dollar (low rate)", rate: "~0.009" },
  { from: "GBP", to: "USD", label: "GBP → USD", description: "Pound to Dollar", rate: "~1.37" },
  { from: "USD", to: "INR", label: "USD → INR", description: "Dollar to Rupee (very high rate)", rate: "~74.5" },
]

export function MicroTransactionTester() {
  const [selectedPair, setSelectedPair] = useState(MICRO_CURRENCY_PAIRS[0])
  const [testResults, setTestResults] = useState<MicroTestResult[]>([])
  const [currentTest, setCurrentTest] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [progress, setProgress] = useState(0)
  const [focusedCategory, setFocusedCategory] = useState<string | null>(null)

  const formatCurrency = (amount: number, currencyCode: string) => {
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

    if (currency.decimals === 0) {
      return `${currency.symbol}${Math.round(amount).toLocaleString()}`
    }

    // For very small amounts, show more precision
    if (amount < 0.01 && amount > 0) {
      return `${currency.symbol}${amount.toFixed(8)}`
    }

    return `${currency.symbol}${amount.toFixed(currency.decimals)}`
  }

  const runSingleTest = async (scenario: MicroTestScenario): Promise<MicroTestResult> => {
    const startTime = Date.now()

    try {
      const result = await convertCurrency(scenario.amount, selectedPair.from, selectedPair.to)
      const duration = Date.now() - startTime

      return {
        amount: scenario.amount,
        fromCurrency: selectedPair.from,
        toCurrency: selectedPair.to,
        result: result.success ? result.convertedAmount : undefined,
        exchangeRate: result.success ? result.exchangeRate : undefined,
        success: result.success,
        error: result.error,
        duration,
        timestamp: Date.now(),
      }
    } catch (error) {
      return {
        amount: scenario.amount,
        fromCurrency: selectedPair.from,
        toCurrency: selectedPair.to,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        duration: Date.now() - startTime,
        timestamp: Date.now(),
      }
    }
  }

  const runPrecisionTests = () => {
    const precisionScenarios = MICRO_TEST_SCENARIOS.filter((s) => s.category === "precision")

    startTransition(async () => {
      setTestResults([])
      setProgress(0)
      setFocusedCategory("precision")
      setCurrentTest("Precision Tests")

      const results: MicroTestResult[] = []

      for (let i = 0; i < precisionScenarios.length; i++) {
        const scenario = precisionScenarios[i]
        setCurrentTest(`Testing ${scenario.name} (${scenario.amount})`)

        const result = await runSingleTest(scenario)
        results.push(result)
        setTestResults([...results])

        setProgress(((i + 1) / precisionScenarios.length) * 100)

        // Small delay between tests for better UX
        await new Promise((resolve) => setTimeout(resolve, 500))
      }

      setCurrentTest(null)
      setFocusedCategory(null)
    })
  }

  const runAllMicroTests = () => {
    startTransition(async () => {
      setTestResults([])
      setProgress(0)
      setFocusedCategory("all")

      const results: MicroTestResult[] = []

      for (let i = 0; i < MICRO_TEST_SCENARIOS.length; i++) {
        const scenario = MICRO_TEST_SCENARIOS[i]
        setCurrentTest(`Testing ${scenario.name} (${scenario.amount})`)

        const result = await runSingleTest(scenario)
        results.push(result)
        setTestResults([...results])

        setProgress(((i + 1) / MICRO_TEST_SCENARIOS.length) * 100)

        // Small delay between tests for better UX
        await new Promise((resolve) => setTimeout(resolve, 300))
      }

      setCurrentTest(null)
      setFocusedCategory(null)
    })
  }

  const runCategoryTests = (category: MicroTestScenario["category"]) => {
    const categoryScenarios = MICRO_TEST_SCENARIOS.filter((s) => s.category === category)

    startTransition(async () => {
      setFocusedCategory(category)
      setCurrentTest(`${category} tests`)

      const results: MicroTestResult[] = []

      for (const scenario of categoryScenarios) {
        setCurrentTest(`Testing ${scenario.name} (${scenario.amount})`)
        const result = await runSingleTest(scenario)
        results.push(result)
        setTestResults((prev) => [...prev, result])

        await new Promise((resolve) => setTimeout(resolve, 400))
      }

      setCurrentTest(null)
      setFocusedCategory(null)
    })
  }

  const getResultsByCategory = () => {
    const categories = {
      precision: testResults.filter(
        (r) => MICRO_TEST_SCENARIOS.find((s) => s.amount === r.amount)?.category === "precision",
      ),
      micro: testResults.filter((r) => MICRO_TEST_SCENARIOS.find((s) => s.amount === r.amount)?.category === "micro"),
      fractional: testResults.filter(
        (r) => MICRO_TEST_SCENARIOS.find((s) => s.amount === r.amount)?.category === "fractional",
      ),
      small: testResults.filter((r) => MICRO_TEST_SCENARIOS.find((s) => s.amount === r.amount)?.category === "small"),
    }
    return categories
  }

  const getTestStats = () => {
    const total = testResults.length
    const successful = testResults.filter((r) => r.success).length
    const failed = testResults.filter((r) => !r.success).length
    const avgDuration = total > 0 ? testResults.reduce((sum, r) => sum + r.duration, 0) / total : 0

    return { total, successful, failed, avgDuration }
  }

  const getPrecisionTestResults = () => {
    return testResults.filter((r) => MICRO_TEST_SCENARIOS.find((s) => s.amount === r.amount)?.category === "precision")
  }

  const stats = getTestStats()
  const categorizedResults = getResultsByCategory()
  const precisionResults = getPrecisionTestResults()

  return (
    <div className="space-y-6">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Microscope className="h-5 w-5" />
            Ultra-Small Precision Testing (0.001 - 0.005)
          </CardTitle>
          <CardDescription>
            Specialized testing for ultra-small amounts to verify 8-decimal precision and sub-cent accuracy
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Currency Pair Selection */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Select Currency Pair for Precision Testing</h3>
            <Select
              value={`${selectedPair.from}-${selectedPair.to}`}
              onValueChange={(value) => {
                const [from, to] = value.split("-")
                const pair = MICRO_CURRENCY_PAIRS.find((p) => p.from === from && p.to === to)
                if (pair) setSelectedPair(pair)
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MICRO_CURRENCY_PAIRS.map((pair) => (
                  <SelectItem key={`${pair.from}-${pair.to}`} value={`${pair.from}-${pair.to}`}>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{pair.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {pair.description} • Rate: {pair.rate}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Precision Test Focus */}
          <Card className="border-l-4 border-l-purple-500 bg-purple-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="h-4 w-4" />
                Ultra-Small Precision Tests
              </CardTitle>
              <CardDescription className="text-xs">
                Focus on amounts 0.001 - 0.005 to test extreme precision handling
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {MICRO_TEST_SCENARIOS.filter((s) => s.category === "precision").map((scenario) => (
                  <Card key={scenario.name} className="border-dashed">
                    <CardContent className="pt-3">
                      <div className="text-center space-y-2">
                        <div className="text-2xl">{scenario.icon}</div>
                        <div className="font-semibold text-sm">{scenario.name}</div>
                        <div className="text-xs text-muted-foreground">{scenario.description}</div>
                        <Badge variant="outline" className="text-xs font-mono">
                          {scenario.amount}
                        </Badge>
                        <div className="text-xs text-muted-foreground italic">{scenario.expectedBehavior}</div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Button onClick={runPrecisionTests} disabled={isPending} className="w-full" size="lg">
                {isPending && focusedCategory === "precision" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Running Precision Tests...
                  </>
                ) : (
                  <>
                    <Microscope className="mr-2 h-4 w-4" />
                    Run Ultra-Small Precision Tests
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Test Controls */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">All Test Controls</h3>
              {isPending && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {currentTest && `${currentTest}`}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <Button onClick={runAllMicroTests} disabled={isPending} className="flex flex-col h-auto py-3">
                <Zap className="h-4 w-4 mb-1" />
                <span className="text-xs">Run All Tests</span>
                <span className="text-xs opacity-75">({MICRO_TEST_SCENARIOS.length} tests)</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => runCategoryTests("micro")}
                disabled={isPending}
                className="flex flex-col h-auto py-3"
              >
                <span className="text-lg mb-1">🪙</span>
                <span className="text-xs">Micro Tests</span>
                <span className="text-xs opacity-75">(0.01 - 0.25)</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => runCategoryTests("fractional")}
                disabled={isPending}
                className="flex flex-col h-auto py-3"
              >
                <span className="text-lg mb-1">💰</span>
                <span className="text-xs">Fractional Tests</span>
                <span className="text-xs opacity-75">(0.50 - 0.99)</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => runCategoryTests("small")}
                disabled={isPending}
                className="flex flex-col h-auto py-3"
              >
                <span className="text-lg mb-1">💵</span>
                <span className="text-xs">Small Amount Tests</span>
                <span className="text-xs opacity-75">(1.00 - 5.00)</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => setTestResults([])}
                disabled={isPending}
                className="flex flex-col h-auto py-3"
              >
                <span className="text-lg mb-1">🗑️</span>
                <span className="text-xs">Clear Results</span>
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          {isPending && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Test Progress</span>
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

          {/* Precision Test Results Highlight */}
          {precisionResults.length > 0 && (
            <Card className="border-l-4 border-l-purple-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Microscope className="h-4 w-4" />
                  Ultra-Small Precision Results
                  <Badge variant="secondary" className="text-xs">
                    {precisionResults.length} tests
                  </Badge>
                </CardTitle>
                <CardDescription className="text-xs">
                  Results for amounts 0.001 - 0.005 • {selectedPair.label}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {precisionResults.map((result, index) => {
                  const scenario = MICRO_TEST_SCENARIOS.find((s) => s.amount === result.amount)

                  return (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border ${
                        result.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {result.success ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600" />
                          )}
                          <div>
                            <div className="font-medium text-sm flex items-center gap-2">
                              <span className="text-lg">{scenario?.icon}</span>
                              {scenario?.name}
                            </div>
                            <div className="text-xs text-muted-foreground">{scenario?.description}</div>
                            <div className="text-xs text-muted-foreground italic mt-1">
                              {scenario?.expectedBehavior}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          {result.success && result.result !== undefined ? (
                            <div className="space-y-1">
                              <div className="font-mono text-sm">
                                {formatCurrency(result.amount, result.fromCurrency)} →{" "}
                                {formatCurrency(result.result, result.toCurrency)}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Rate: {result.exchangeRate?.toFixed(8)} • {result.duration}ms
                              </div>
                              {result.result < 0.01 && (
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
                  )
                })}
              </CardContent>
            </Card>
          )}

          {/* Testing Tips */}
          <Alert>
            <Calculator className="h-4 w-4" />
            <AlertDescription className="text-xs">
              <strong>Ultra-Small Precision Testing Tips:</strong>
              <ul className="mt-2 space-y-1 list-disc list-inside">
                <li>
                  <strong>0.001 tests:</strong> Verify 8-decimal precision for micro-cent amounts
                </li>
                <li>
                  <strong>0.005 tests:</strong> Test half-cent accuracy and rounding behavior
                </li>
                <li>
                  <strong>High-rate currencies (JPY, INR):</strong> Show different precision handling
                </li>
                <li>
                  <strong>Low-rate conversions (JPY→USD):</strong> Test extreme decimal precision
                </li>
                <li>
                  <strong>Results display:</strong> Amounts under 0.01 show 8 decimal places automatically
                </li>
                <li>
                  <strong>Performance:</strong> Precision tests may take slightly longer due to calculation complexity
                </li>
              </ul>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}

export default MicroTransactionTester
