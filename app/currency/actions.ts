"use server"

import { z } from "zod"

// Enhanced validation schema for extended testing
const CurrencyInputSchema = z.object({
  amount: z.number().finite().positive().min(0.000001).max(Number.MAX_SAFE_INTEGER),
  fromCurrency: z
    .string()
    .length(3)
    .regex(/^[A-Z]{3}$/),
  toCurrency: z
    .string()
    .length(3)
    .regex(/^[A-Z]{3}$/),
})

// Extended error types for comprehensive testing
export type ExtendedValidationError = {
  valid: false
  error: string
  errorType: "type" | "range" | "format" | "security" | "system"
  severity: "low" | "medium" | "high" | "critical"
  details?: string
}

export type ExtendedValidationSuccess = {
  valid: true
  sanitizedAmount: number
  normalizedFromCurrency: string
  normalizedToCurrency: string
}

export type ExtendedValidationResult = ExtendedValidationError | ExtendedValidationSuccess

// Comprehensive input validation with extended error handling
export async function validateCurrencyInput(
  amount: any,
  fromCurrency: any,
  toCurrency: any,
): Promise<ExtendedValidationResult> {
  try {
    // Enhanced type checking for extended testing scenarios
    if (typeof amount === "undefined") {
      return {
        valid: false,
        error: "Amount is required",
        errorType: "type",
        severity: "high",
        details: "Amount parameter is undefined",
      }
    }

    if (amount === null) {
      return {
        valid: false,
        error: "Amount cannot be null",
        errorType: "type",
        severity: "high",
        details: "Amount parameter is null",
      }
    }

    // Handle various invalid types for extended testing
    if (typeof amount === "string") {
      const numericAmount = Number.parseFloat(amount)
      if (isNaN(numericAmount)) {
        return {
          valid: false,
          error: "Amount must be a valid number",
          errorType: "type",
          severity: "medium",
          details: `Cannot convert string "${amount}" to number`,
        }
      }
      amount = numericAmount
    }

    if (typeof amount === "boolean") {
      return {
        valid: false,
        error: "Amount cannot be a boolean value",
        errorType: "type",
        severity: "medium",
        details: `Boolean value ${amount} is not a valid amount`,
      }
    }

    if (typeof amount === "object" && amount !== null) {
      return {
        valid: false,
        error: "Amount must be a valid number",
        errorType: "type",
        severity: "medium",
        details: `Object type ${typeof amount} is not supported`,
      }
    }

    if (typeof amount === "function") {
      return {
        valid: false,
        error: "Amount cannot be a function",
        errorType: "type",
        severity: "medium",
        details: "Function types are not supported for amount",
      }
    }

    if (typeof amount === "symbol") {
      return {
        valid: false,
        error: "Amount cannot be a symbol",
        errorType: "type",
        severity: "medium",
        details: "Symbol types are not supported for amount",
      }
    }

    if (typeof amount === "bigint") {
      return {
        valid: false,
        error: "Amount cannot be a BigInt",
        errorType: "type",
        severity: "medium",
        details: "BigInt types are not supported for amount",
      }
    }

    // Enhanced numeric validation
    const numericAmount = Number(amount)

    if (!Number.isFinite(numericAmount)) {
      if (Number.isNaN(numericAmount)) {
        return {
          valid: false,
          error: "Amount must be a finite number",
          errorType: "range",
          severity: "high",
          details: "Amount is NaN (Not a Number)",
        }
      }
      if (numericAmount === Number.POSITIVE_INFINITY) {
        return {
          valid: false,
          error: "Amount must be a finite number",
          errorType: "range",
          severity: "high",
          details: "Amount is positive infinity",
        }
      }
      if (numericAmount === Number.NEGATIVE_INFINITY) {
        return {
          valid: false,
          error: "Amount must be a finite number",
          errorType: "range",
          severity: "high",
          details: "Amount is negative infinity",
        }
      }
    }

    // Enhanced range validation for extended testing
    if (numericAmount <= 0) {
      return {
        valid: false,
        error: "Amount must be greater than 0",
        errorType: "range",
        severity: "medium",
        details: `Amount ${numericAmount} is not positive`,
      }
    }

    if (numericAmount < Number.MIN_VALUE) {
      return {
        valid: false,
        error: "Amount is too small to process accurately",
        errorType: "range",
        severity: "high",
        details: `Amount ${numericAmount} is below minimum representable value`,
      }
    }

    if (numericAmount > Number.MAX_SAFE_INTEGER) {
      return {
        valid: false,
        error: "Amount is too large to process accurately",
        errorType: "range",
        severity: "high",
        details: `Amount ${numericAmount} exceeds maximum safe integer`,
      }
    }

    // Enhanced currency code validation
    if (typeof fromCurrency !== "string") {
      return {
        valid: false,
        error: "Currency code must be a string",
        errorType: "type",
        severity: "medium",
        details: `From currency is ${typeof fromCurrency}, expected string`,
      }
    }

    if (typeof toCurrency !== "string") {
      return {
        valid: false,
        error: "Currency code must be a string",
        errorType: "type",
        severity: "medium",
        details: `To currency is ${typeof toCurrency}, expected string`,
      }
    }

    // Security validation for extended testing
    const securityPatterns = [
      { pattern: /[<>]/g, name: "HTML/XML tags" },
      { pattern: /['";]/g, name: "SQL injection characters" },
      { pattern: /[&|;`]/g, name: "Command injection characters" },
      { pattern: /\.\./g, name: "Path traversal" },
      { pattern: /\$\{|\{\{/g, name: "Template injection" },
      { pattern: /javascript:/gi, name: "JavaScript protocol" },
      { pattern: /data:/gi, name: "Data protocol" },
      { pattern: /vbscript:/gi, name: "VBScript protocol" },
    ]

    for (const { pattern, name } of securityPatterns) {
      if (pattern.test(fromCurrency) || pattern.test(toCurrency)) {
        return {
          valid: false,
          error: "Currency code contains invalid characters",
          errorType: "security",
          severity: "critical",
          details: `Detected ${name} in currency code`,
        }
      }
    }

    // Enhanced format validation
    if (fromCurrency.length !== 3) {
      return {
        valid: false,
        error: "Currency code must be exactly 3 characters",
        errorType: "format",
        severity: "medium",
        details: `From currency "${fromCurrency}" has ${fromCurrency.length} characters`,
      }
    }

    if (toCurrency.length !== 3) {
      return {
        valid: false,
        error: "Currency code must be exactly 3 characters",
        errorType: "format",
        severity: "medium",
        details: `To currency "${toCurrency}" has ${toCurrency.length} characters`,
      }
    }

    // Uppercase validation
    if (fromCurrency !== fromCurrency.toUpperCase()) {
      return {
        valid: false,
        error: "Currency code must be uppercase",
        errorType: "format",
        severity: "low",
        details: `From currency "${fromCurrency}" is not uppercase`,
      }
    }

    if (toCurrency !== toCurrency.toUpperCase()) {
      return {
        valid: false,
        error: "Currency code must be uppercase",
        errorType: "format",
        severity: "low",
        details: `To currency "${toCurrency}" is not uppercase`,
      }
    }

    // Character validation
    const validCurrencyPattern = /^[A-Z]{3}$/
    if (!validCurrencyPattern.test(fromCurrency)) {
      return {
        valid: false,
        error: "Invalid currency code format",
        errorType: "format",
        severity: "medium",
        details: `From currency "${fromCurrency}" contains invalid characters`,
      }
    }

    if (!validCurrencyPattern.test(toCurrency)) {
      return {
        valid: false,
        error: "Invalid currency code format",
        errorType: "format",
        severity: "medium",
        details: `To currency "${toCurrency}" contains invalid characters`,
      }
    }

    // Extended currency code validation
    const validCurrencies = [
      "USD",
      "EUR",
      "GBP",
      "JPY",
      "CAD",
      "AUD",
      "CHF",
      "CNY",
      "INR",
      "BRL",
      "KRW",
      "MXN",
      "SGD",
      "HKD",
      "SEK",
      "NOK",
      "DKK",
      "PLN",
      "CZK",
      "HUF",
      "RUB",
      "ZAR",
      "TRY",
      "ILS",
      "AED",
      "SAR",
      "QAR",
      "KWD",
      "BHD",
      "OMR",
      "JOD",
      "LBP",
      "EGP",
      "MAD",
      "TND",
      "DZD",
      "LYD",
      "SDG",
      "ETB",
      "KES",
      "UGX",
      "TZS",
      "RWF",
      "MWK",
      "ZMW",
      "BWP",
      "SZL",
      "LSL",
      "NAD",
      "MZN",
      "AOA",
      "XAF",
      "XOF",
      "CDF",
      "GHS",
      "NGN",
      "XPF",
      "FJD",
      "TOP",
      "WST",
      "VUV",
      "SBD",
      "PGK",
      "NCL",
      "TVD",
      "KID",
      "AUD",
      "NZD",
    ]

    if (!validCurrencies.includes(fromCurrency)) {
      return {
        valid: false,
        error: `Invalid currency code: ${fromCurrency}`,
        errorType: "format",
        severity: "medium",
        details: `Currency "${fromCurrency}" is not supported`,
      }
    }

    if (!validCurrencies.includes(toCurrency)) {
      return {
        valid: false,
        error: `Invalid currency code: ${toCurrency}`,
        errorType: "format",
        severity: "medium",
        details: `Currency "${toCurrency}" is not supported`,
      }
    }

    // Success case with sanitized data
    return {
      valid: true,
      sanitizedAmount: numericAmount,
      normalizedFromCurrency: fromCurrency.toUpperCase(),
      normalizedToCurrency: toCurrency.toUpperCase(),
    }
  } catch (error) {
    return {
      valid: false,
      error: "Validation system error",
      errorType: "system",
      severity: "critical",
      details: error instanceof Error ? error.message : "Unknown system error",
    }
  }
}

// Enhanced conversion function with extended error handling
export async function convertCurrency(
  amount: any,
  fromCurrency: any,
  toCurrency: any,
): Promise<{
  success: boolean
  result?: number
  error?: string
  errorType?: string
  severity?: string
  responseTime?: number
  metadata?: {
    rate: number
    precision: number
    timestamp: number
    fromCurrency: string
    toCurrency: string
  }
}> {
  const startTime = Date.now()

  try {
    // Validate input with extended validation
    const validation = await validateCurrencyInput(amount, fromCurrency, toCurrency)

    if (!validation.valid) {
      return {
        success: false,
        error: validation.error,
        errorType: validation.errorType,
        severity: validation.severity,
        responseTime: Date.now() - startTime,
      }
    }

    // Simulate network delays for extended testing
    const networkDelay = Math.random() * 100 + 50 // 50-150ms
    await new Promise((resolve) => setTimeout(resolve, networkDelay))

    // Simulate occasional network errors for extended testing
    if (Math.random() < 0.001) {
      // 0.1% chance of network error
      const errorTypes = [
        { error: "Request timeout - please try again", type: "network", severity: "medium" },
        { error: "Network error - check your connection", type: "network", severity: "high" },
        { error: "Rate limit exceeded - please wait", type: "rate_limit", severity: "medium" },
        { error: "Server error - please try again later", type: "server", severity: "high" },
        { error: "Invalid response from currency service", type: "service", severity: "medium" },
      ]
      const randomError = errorTypes[Math.floor(Math.random() * errorTypes.length)]
      return {
        success: false,
        error: randomError.error,
        errorType: randomError.type,
        severity: randomError.severity,
        responseTime: Date.now() - startTime,
      }
    }

    // Enhanced exchange rate simulation with realistic rates
    const exchangeRates: Record<string, Record<string, number>> = {
      USD: {
        EUR: 0.85235,
        GBP: 0.73456,
        JPY: 110.234,
        CAD: 1.25678,
        AUD: 1.34567,
        CHF: 0.91234,
        CNY: 6.45678,
        INR: 74.5678,
        BRL: 5.23456,
        KRW: 1180.234,
        MXN: 20.1234,
        SGD: 1.35678,
        HKD: 7.78901,
        SEK: 8.56789,
        NOK: 8.6789,
        DKK: 6.34567,
      },
      EUR: {
        USD: 1.17345,
        GBP: 0.86234,
        JPY: 129.345,
        CAD: 1.47456,
        AUD: 1.5789,
        CHF: 1.07123,
        CNY: 7.5789,
        INR: 87.4567,
        BRL: 6.14567,
        KRW: 1384.567,
        MXN: 23.6789,
        SGD: 1.59234,
        HKD: 9.13456,
        SEK: 10.0567,
        NOK: 10.1789,
        DKK: 7.44567,
      },
      GBP: {
        USD: 1.36123,
        EUR: 1.15987,
        JPY: 150.123,
        CAD: 1.71234,
        AUD: 1.83456,
        CHF: 1.24567,
        CNY: 8.79012,
        INR: 101.456,
        BRL: 7.13456,
        KRW: 1607.89,
        MXN: 27.4567,
        SGD: 1.84567,
        HKD: 10.6012,
        SEK: 11.6789,
        NOK: 11.8012,
        DKK: 8.64567,
      },
      JPY: {
        USD: 0.00907,
        EUR: 0.00773,
        GBP: 0.00665,
        CAD: 0.0114,
        AUD: 0.01221,
        CHF: 0.00828,
        CNY: 0.05856,
        INR: 0.67612,
        BRL: 0.04751,
        KRW: 10.7123,
        MXN: 0.18267,
        SGD: 0.01229,
        HKD: 0.07067,
        SEK: 0.07778,
        NOK: 0.07856,
        DKK: 0.05756,
      },
    }

    // Get exchange rate
    const rate = exchangeRates[validation.normalizedFromCurrency]?.[validation.normalizedToCurrency] || 1

    // Calculate result with enhanced precision handling
    const rawResult = validation.sanitizedAmount * rate

    // Enhanced precision calculation based on amount and currencies
    let precision = 2 // Default precision

    // Ultra-micro amounts (< 0.000001)
    if (validation.sanitizedAmount < 0.000001) {
      precision = 8
    }
    // Micro amounts (< 0.01)
    else if (validation.sanitizedAmount < 0.01) {
      precision = 8
    }
    // Sub-dollar amounts (< 1)
    else if (validation.sanitizedAmount < 1) {
      precision = 6
    }
    // Normal amounts (< 100)
    else if (validation.sanitizedAmount < 100) {
      precision = 4
    }
    // Large amounts (< 1,000,000)
    else if (validation.sanitizedAmount < 1000000) {
      precision = 2
    }
    // Very large amounts
    else {
      precision = 2
    }

    // Special precision handling for certain currency pairs
    if (validation.normalizedToCurrency === "JPY" || validation.normalizedFromCurrency === "JPY") {
      precision = Math.max(0, precision - 2) // JPY typically has no decimal places
    }

    const result = Math.round(rawResult * Math.pow(10, precision)) / Math.pow(10, precision)

    return {
      success: true,
      result,
      responseTime: Date.now() - startTime,
      metadata: {
        rate,
        precision,
        timestamp: Date.now(),
        fromCurrency: validation.normalizedFromCurrency,
        toCurrency: validation.normalizedToCurrency,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: "Currency conversion system error",
      errorType: "system",
      severity: "critical",
      responseTime: Date.now() - startTime,
    }
  }
}

// Extended performance monitoring function
export async function getSystemHealthMetrics(): Promise<{
  memoryUsage: number
  cpuUsage: number
  responseTime: number
  errorRate: number
  throughput: number
  networkLatency: number
  diskUsage: number
  cacheHitRate: number
  gcCollections: number
  threadCount: number
  connectionPoolSize: number
  timestamp: number
}> {
  const startTime = Date.now()

  // Simulate system metrics collection
  await new Promise((resolve) => setTimeout(resolve, Math.random() * 50 + 10))

  return {
    memoryUsage: Math.random() * 200 + 50, // 50-250 MB
    cpuUsage: Math.random() * 60 + 10, // 10-70%
    responseTime: Math.random() * 200 + 50, // 50-250ms
    errorRate: Math.random() * 5, // 0-5%
    throughput: Math.random() * 100 + 50, // 50-150 RPS
    networkLatency: Math.random() * 100 + 20, // 20-120ms
    diskUsage: Math.random() * 40 + 20, // 20-60%
    cacheHitRate: Math.random() * 30 + 70, // 70-100%
    gcCollections: Math.floor(Math.random() * 10), // 0-9 collections
    threadCount: Math.floor(Math.random() * 20) + 10, // 10-29 threads
    connectionPoolSize: Math.floor(Math.random() * 30) + 5, // 5-34 connections
    timestamp: Date.now(),
  }
}

// Extended stress testing function
export async function executeStressTest(
  duration: number,
  concurrency: number,
  requestRate: number,
): Promise<{
  success: boolean
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  averageResponseTime: number
  maxResponseTime: number
  minResponseTime: number
  errorRate: number
  throughput: number
  duration: number
  timestamp: number
}> {
  const startTime = Date.now()
  let totalRequests = 0
  let successfulRequests = 0
  let failedRequests = 0
  const responseTimes: number[] = []

  // Simulate stress test execution
  const testDuration = Math.min(duration, 30000) // Cap at 30 seconds for simulation
  const endTime = startTime + testDuration

  while (Date.now() < endTime) {
    const batchPromises: Promise<any>[] = []

    for (let i = 0; i < Math.min(concurrency, requestRate); i++) {
      batchPromises.push(
        convertCurrency(100, "USD", "EUR").then((result) => {
          totalRequests++
          if (result.success) {
            successfulRequests++
          } else {
            failedRequests++
          }
          if (result.responseTime) {
            responseTimes.push(result.responseTime)
          }
        }),
      )
    }

    await Promise.allSettled(batchPromises)
    await new Promise((resolve) => setTimeout(resolve, 1000 / requestRate))
  }

  const actualDuration = Date.now() - startTime
  const averageResponseTime =
    responseTimes.length > 0 ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length : 0
  const maxResponseTime = responseTimes.length > 0 ? Math.max(...responseTimes) : 0
  const minResponseTime = responseTimes.length > 0 ? Math.min(...responseTimes) : 0
  const errorRate = totalRequests > 0 ? (failedRequests / totalRequests) * 100 : 0
  const throughput = totalRequests / (actualDuration / 1000)

  return {
    success: true,
    totalRequests,
    successfulRequests,
    failedRequests,
    averageResponseTime,
    maxResponseTime,
    minResponseTime,
    errorRate,
    throughput,
    duration: actualDuration,
    timestamp: Date.now(),
  }
}
