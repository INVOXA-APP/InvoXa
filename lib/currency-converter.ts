export interface Currency {
  code: string
  name: string
  symbol: string
  flag: string
}

export const supportedCurrencies: Currency[] = [
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
  { code: "MXN", name: "Mexican Peso", symbol: "$", flag: "🇲🇽" },
  { code: "KRW", name: "South Korean Won", symbol: "₩", flag: "🇰🇷" },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$", flag: "🇸🇬" },
  { code: "HKD", name: "Hong Kong Dollar", symbol: "HK$", flag: "🇭🇰" },
  { code: "SEK", name: "Swedish Krona", symbol: "kr", flag: "🇸🇪" },
  { code: "NOK", name: "Norwegian Krone", symbol: "kr", flag: "🇳🇴" },
  { code: "DKK", name: "Danish Krone", symbol: "kr", flag: "🇩🇰" },
  { code: "PLN", name: "Polish Zloty", symbol: "zł", flag: "🇵🇱" },
  { code: "CZK", name: "Czech Koruna", symbol: "Kč", flag: "🇨🇿" },
  { code: "HUF", name: "Hungarian Forint", symbol: "Ft", flag: "🇭🇺" },
  { code: "ZAR", name: "South African Rand", symbol: "R", flag: "🇿🇦" },
  { code: "THB", name: "Thai Baht", symbol: "฿", flag: "🇹🇭" },
  { code: "MYR", name: "Malaysian Ringgit", symbol: "RM", flag: "🇲🇾" },
  { code: "PHP", name: "Philippine Peso", symbol: "₱", flag: "🇵🇭" },
  { code: "IDR", name: "Indonesian Rupiah", symbol: "Rp", flag: "🇮🇩" },
]

export interface ConversionResult {
  success: boolean
  result?: number
  error?: string
  exchangeRate?: number
  timestamp?: number
}

export async function convertCurrencyAmount(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
): Promise<ConversionResult> {
  try {
    // Import the server action
    const { convertCurrency } = await import("@/app/currency/actions")

    const result = await convertCurrency(amount, fromCurrency, toCurrency)

    if (result.success) {
      return {
        success: true,
        result: result.convertedAmount,
        exchangeRate: result.exchangeRate,
        timestamp: Date.now(),
      }
    } else {
      return {
        success: false,
        error: result.error,
      }
    }
  } catch (error) {
    return {
      success: false,
      error: "Currency conversion service unavailable",
    }
  }
}

export function formatCurrency(amount: number, currencyCode: string): string {
  const currency = supportedCurrencies.find((c) => c.code === currencyCode)
  const symbol = currency?.symbol || currencyCode

  // Handle different formatting for different currencies
  if (currencyCode === "JPY" || currencyCode === "KRW" || currencyCode === "IDR") {
    // No decimal places for these currencies
    return `${symbol}${Math.round(amount).toLocaleString()}`
  }

  // For very small amounts, show more precision
  if (amount < 0.01 && amount > 0) {
    return `${symbol}${amount.toFixed(8)}`
  }

  return `${symbol}${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export function getCurrencySymbol(currencyCode: string): string {
  const currency = supportedCurrencies.find((c) => c.code === currencyCode)
  return currency?.symbol || currencyCode
}

export function getCurrencyName(currencyCode: string): string {
  const currency = supportedCurrencies.find((c) => c.code === currencyCode)
  return currency?.name || currencyCode
}

export function getCurrencyFlag(currencyCode: string): string {
  const currency = supportedCurrencies.find((c) => c.code === currencyCode)
  return currency?.flag || "🏳️"
}
