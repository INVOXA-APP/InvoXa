"use client"

import { useState, useTransition } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { ArrowRightLeft, Loader2, TrendingUp, TrendingDown, Zap, Info } from "lucide-react"
import { convertCurrency } from "@/app/currency/actions"

interface Currency {
  code: string
  name: string
  symbol: string
  flag: string
}

const SUPPORTED_CURRENCIES: Currency[] = [
  { code: "USD", name: "US Dollar", symbol: "$", flag: "🇺🇸" },
  { code: "EUR", name: "Euro", symbol: "€", flag: "🇪🇺" },
  { code: "GBP", name: "British Pound", symbol: "£", flag: "🇬🇧" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥", flag: "🇯🇵" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$", flag: "🇨🇦" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$", flag: "🇦🇺" },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF", flag: "🇨🇭" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥", flag: "🇨🇳" },
  { code: "INR", name: "Indian Rupee", symbol: "₹", flag: "🇮🇳" },
  { code: "BRL", name: "Brazilian Real", symbol: "R$", flag: "🇧🇷" },
  { code: "KRW", name: "South Korean Won", symbol: "₩", flag: "🇰🇷" },
  { code: "MXN", name: "Mexican Peso", symbol: "$", flag: "🇲🇽" },
]

const EXTREME_RATE_PAIRS = [
  {
    from: "USD",
    to: "JPY",
    type: "high-rate",
    description: "High multiplication rate (~110x)",
    icon: <TrendingUp className="h-4 w-4 text-green-600" />,
    expectedRate: 110.0,
    testAmounts: [0.001, 0.005, 0.01, 0.05, 0.1, 1.0],
  },
  {
    from: "JPY",
    to: "USD",
    type: "low-rate",
    description: "Ultra-low division rate (~0.009x)",
    icon: <TrendingDown className="h-4 w-4 text-red-600" />,
    expectedRate: 0.00909,
    testAmounts: [0.001, 0.005, 0.01, 0.1, 1.0, 10.0, 100.0],
  },
  {
    from: "USD",
    to: "INR",
    type: "high-rate",
    description: "Very high multiplication rate (~74.5x)",
    icon: <TrendingUp className="h-4 w-4 text-green-600" />,
    expectedRate: 74.5,
    testAmounts: [0.001, 0.005, 0.01, 0.05, 0.1, 1.0],
  },
  {
    from: "EUR",
    to: "JPY",
    type: "high-rate",
    description: "Compound high rate (~129.4x)",
    icon: <TrendingUp className="h-4 w-4 text-green-600" />,
    expectedRate: 129.4,
    testAmounts: [0.001, 0.005, 0.01, 0.05, 0.1, 1.0],
  },
]

export default function CurrencyConverterWidget() {
  const [amount, setAmount] = useState<string>("0.001")
  const [fromCurrency, setFromCurrency] = useState<string>("USD")
  const [toCurrency, setToCurrency] = useState<string>("JPY")
  const [result, setResult] = useState<{
    convertedAmount: number
    exchangeRate: number
    precision: number
    timestamp: string
  } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [selectedPair, setSelectedPair] = useState<(typeof EXTREME_RATE_PAIRS)[0] | null>(null)

  const formatCurrency = (amount: number, currencyCode: string, precision?: number) => {
    const currency = SUPPORTED_CURRENCIES.find((c) => c.code === currencyCode)
    const symbol = currency?.symbol || currencyCode

    // Special handling for JPY (no decimals for amounts >= 1)
    if (currencyCode === "JPY") {
      if (amount >= 1) {
        return `${symbol}${Math.round(amount).toLocaleString()}`
      } else if (amount < 0.01) {
        return `${symbol}${amount.toFixed(8)}`
      } else {
        return `${symbol}${amount.toFixed(2)}`
      }
    }

    // For very small amounts, show 8-decimal precision
    if (amount < 0.01 && amount > 0) {
      return `${symbol}${amount.toFixed(8)}`
    }

    // Standard formatting
    const actualPrecision = precision || 2
    return `${symbol}${amount.toFixed(actualPrecision)}`
  }

  const handleConvert = () => {
    const numAmount = Number.parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      setError("Please enter a valid amount greater than 0")
      return
    }

    startTransition(async () => {
      setError(null)
      setResult(null)

      try {
        const conversionResult = await convertCurrency(numAmount, fromCurrency, toCurrency)

        if (conversionResult.success && conversionResult.convertedAmount !== undefined) {
          setResult({
            convertedAmount: conversionResult.convertedAmount,
            exchangeRate: conversionResult.exchangeRate || 0,
            precision: conversionResult.precision || 2,
            timestamp: conversionResult.timestamp || new Date().toISOString(),
          })
        } else {
          setError(conversionResult.error || "Conversion failed")
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error occurred")
      }
    })
  }

  const handleSwapCurrencies = () => {
    const temp = fromCurrency
    setFromCurrency(toCurrency)
    setToCurrency(temp)
    setResult(null)
    setError(null)
  }

  const handleQuickTest = (pair: (typeof EXTREME_RATE_PAIRS)[0], testAmount: number) => {
    setFromCurrency(pair.from)
    setToCurrency(pair.to)
    setAmount(testAmount.toString())
    setSelectedPair(pair)
    setResult(null)
    setError(null)
  }

  const getRateType = () => {
    const pair = EXTREME_RATE_PAIRS.find((p) => p.from === fromCurrency && p.to === toCurrency)
    return pair?.type || "standard"
  }

  const getRateDescription = () => {
    const pair = EXTREME_RATE_PAIRS.find((p) => p.from === fromCurrency && p.to === toCurrency)
    return pair?.description || "Standard conversion rate"
  }

  const currentRateType = getRateType()
  const currentRateDescription = getRateDescription()

  return (
    <div className="space-y-6">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5" />
            Extreme Precision Currency Converter
          </CardTitle>
          <CardDescription>
            Test high-rate and low-rate conversions with ultra-small amounts for extreme precision validation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Rate Type Indicator */}
          {currentRateType !== "standard" && (
            <Alert
              className={currentRateType === "high-rate" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}
            >
              <Info className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <strong>{currentRateType === "high-rate" ? "High-Rate" : "Low-Rate"} Conversion Selected:</strong>{" "}
                {currentRateDescription}
              </AlertDescription>
            </Alert>
          )}

          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.001"
              min="0.001"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount (e.g., 0.001)"
              className="text-lg"
            />
          </div>

          {/* Currency Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>From Currency</Label>
              <Select value={fromCurrency} onValueChange={setFromCurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_CURRENCIES.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      <div className="flex items-center gap-2">
                        <span>{currency.flag}</span>
                        <span className="font-medium">{currency.code}</span>
                        <span className="text-sm text-muted-foreground">{currency.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>To Currency</Label>
              <Select value={toCurrency} onValueChange={setToCurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_CURRENCIES.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      <div className="flex items-center gap-2">
                        <span>{currency.flag}</span>
                        <span className="font-medium">{currency.code}</span>
                        <span className="text-sm text-muted-foreground">{currency.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button onClick={handleConvert} disabled={isPending} className="flex-1">
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Converting...
                </>
              ) : (
                <>
                  <ArrowRightLeft className="mr-2 h-4 w-4" />
                  Convert
                </>
              )}
            </Button>
            <Button variant="outline" onClick={handleSwapCurrencies} disabled={isPending}>
              <ArrowRightLeft className="h-4 w-4" />
            </Button>
          </div>

          {/* Results */}
          {result && (
            <Card
              className={`${
                currentRateType === "high-rate"
                  ? "border-green-200 bg-green-50"
                  : currentRateType === "low-rate"
                    ? "border-red-200 bg-red-50"
                    : "border-blue-200 bg-blue-50"
              }`}
            >
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold font-mono">
                      {formatCurrency(Number.parseFloat(amount), fromCurrency)} →{" "}
                      <span
                        className={
                          currentRateType === "high-rate"
                            ? "text-green-700"
                            : currentRateType === "low-rate"
                              ? "text-red-700"
                              : "text-blue-700"
                        }
                      >
                        {formatCurrency(result.convertedAmount, toCurrency, result.precision)}
                      </span>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Exchange Rate</div>
                      <div className="font-mono">{result.exchangeRate.toFixed(8)}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Precision</div>
                      <div className="font-mono">{result.precision} decimals</div>
                    </div>
                  </div>

                  {Number.parseFloat(amount) < 0.01 && (
                    <Badge variant="outline" className="w-full justify-center">
                      Ultra-small amount: 8-decimal precision applied
                    </Badge>
                  )}

                  {currentRateType !== "standard" && (
                    <Badge
                      variant="outline"
                      className={`w-full justify-center ${
                        currentRateType === "high-rate" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}
                    >
                      {currentRateType === "high-rate" ? "High-Rate" : "Low-Rate"} Extreme Precision Test
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error Display */}
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-700">{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Extreme Rate Quick Tests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Extreme Rate Quick Tests
          </CardTitle>
          <CardDescription>
            One-click testing for extreme precision scenarios with pre-configured high-rate and low-rate pairs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {EXTREME_RATE_PAIRS.map((pair, index) => (
            <Card
              key={index}
              className={`${
                pair.type === "high-rate" ? "border-l-4 border-l-green-500" : "border-l-4 border-l-red-500"
              }`}
            >
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {pair.icon}
                      <div>
                        <div className="font-semibold text-sm">
                          {pair.from} → {pair.to}
                        </div>
                        <div className="text-xs text-muted-foreground">{pair.description}</div>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Rate: ~{pair.expectedRate}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground">Quick Test Amounts:</div>
                    <div className="flex flex-wrap gap-2">
                      {pair.testAmounts.map((testAmount) => (
                        <Button
                          key={testAmount}
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuickTest(pair, testAmount)}
                          className="text-xs h-7"
                        >
                          {testAmount < 1 ? testAmount.toFixed(3) : testAmount.toString()}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
