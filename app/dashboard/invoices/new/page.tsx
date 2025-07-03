"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { PlusCircle, MinusCircle, Calculator, Globe, TrendingUp } from "lucide-react"
import { createInvoice } from "../actions"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { useLanguageCurrency, currencyData, type Currency } from "@/contexts/language-currency-context"
import { CurrencyConverterWidget } from "@/components/currency-converter-widget"
import { currencyConverter, type ConversionResult } from "@/lib/currency-converter"

interface InvoiceItem {
  description: string
  quantity: number
  unitPrice: number
  currency: Currency
  convertedPrice?: number
  convertedCurrency?: Currency
}

export default function NewInvoicePage() {
  const [items, setItems] = useState<InvoiceItem[]>([{ description: "", quantity: 1, unitPrice: 0, currency: "USD" }])
  const [invoiceCurrency, setInvoiceCurrency] = useState<Currency>("USD")
  const [clientCurrency, setClientCurrency] = useState<Currency>("USD")
  const [showCurrencyConverter, setShowCurrencyConverter] = useState(false)
  const [exchangeRates, setExchangeRates] = useState<Record<Currency, number>>({})
  const [lastRateUpdate, setLastRateUpdate] = useState<Date | null>(null)
  const [totalConversions, setTotalConversions] = useState<{
    originalTotal: number
    convertedTotal: number
    originalCurrency: Currency
    convertedCurrency: Currency
  } | null>(null)

  const { toast } = useToast()
  const router = useRouter()
  const { currency: userCurrency, formatCurrency } = useLanguageCurrency()

  // Popular currencies for quick selection
  const popularCurrencies: Currency[] = ["USD", "EUR", "GBP", "JPY", "CAD", "AUD", "CHF", "CNY"]

  // Update exchange rates
  const updateExchangeRates = async () => {
    try {
      const currencies = Array.from(
        new Set([invoiceCurrency, clientCurrency, userCurrency, ...items.map((item) => item.currency)]),
      )

      const rates = await currencyConverter.getMultipleRates(invoiceCurrency, currencies)
      setExchangeRates(rates)
      setLastRateUpdate(currencyConverter.getLastUpdateTime())
    } catch (error) {
      console.error("Failed to update exchange rates:", error)
      toast({
        title: "Exchange Rate Update Failed",
        description: "Using cached rates. Some conversions may be outdated.",
        variant: "destructive",
      })
    }
  }

  // Calculate totals with currency conversion
  const calculateTotals = async () => {
    let originalTotal = 0
    let convertedTotal = 0

    for (const item of items) {
      const itemTotal = item.quantity * item.unitPrice
      originalTotal += itemTotal

      if (item.currency !== invoiceCurrency) {
        const conversion = await currencyConverter.convert(itemTotal, item.currency, invoiceCurrency)
        convertedTotal += conversion.success ? conversion.convertedAmount : itemTotal
      } else {
        convertedTotal += itemTotal
      }
    }

    // Convert to client currency if different
    if (clientCurrency !== invoiceCurrency) {
      const clientConversion = await currencyConverter.convert(convertedTotal, invoiceCurrency, clientCurrency)
      setTotalConversions({
        originalTotal: convertedTotal,
        convertedTotal: clientConversion.success ? clientConversion.convertedAmount : convertedTotal,
        originalCurrency: invoiceCurrency,
        convertedCurrency: clientCurrency,
      })
    } else {
      setTotalConversions(null)
    }
  }

  const handleAddItem = () => {
    setItems([...items, { description: "", quantity: 1, unitPrice: 0, currency: invoiceCurrency }])
  }

  const handleRemoveItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index)
    setItems(newItems)
  }

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: string | number | Currency) => {
    const newItems = items.map((item, i) => {
      if (i === index) {
        const updatedItem = { ...item, [field]: value }

        // If currency changed, convert the price
        if (field === "currency" && value !== item.currency) {
          convertItemPrice(updatedItem, value as Currency)
        }

        return updatedItem
      }
      return item
    })
    setItems(newItems)
  }

  const convertItemPrice = async (item: InvoiceItem, newCurrency: Currency) => {
    if (item.unitPrice > 0 && item.currency !== newCurrency) {
      const conversion = await currencyConverter.convert(item.unitPrice, item.currency, newCurrency)
      if (conversion.success) {
        const itemIndex = items.findIndex((i) => i === item)
        if (itemIndex !== -1) {
          const newItems = [...items]
          newItems[itemIndex] = {
            ...item,
            currency: newCurrency,
            unitPrice: conversion.convertedAmount,
            convertedPrice: item.unitPrice,
            convertedCurrency: item.currency,
          }
          setItems(newItems)
        }
      }
    }
  }

  const handleCurrencyConversion = (result: ConversionResult) => {
    toast({
      title: "Currency Converted",
      description: `${currencyData[result.originalCurrency]?.symbol}${result.originalAmount} = ${currencyData[result.convertedCurrency]?.symbol}${result.convertedAmount}`,
      className: "bg-blue-50 border-blue-200 text-blue-800",
    })
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    // Add currency information
    formData.append("invoiceCurrency", invoiceCurrency)
    formData.append("clientCurrency", clientCurrency)
    formData.append("exchangeRates", JSON.stringify(exchangeRates))

    // Append items data with currency information
    items.forEach((item, index) => {
      formData.append(`items[${index}].description`, item.description)
      formData.append(`items[${index}].quantity`, item.quantity.toString())
      formData.append(`items[${index}].unitPrice`, item.unitPrice.toString())
      formData.append(`items[${index}].currency`, item.currency)
      if (item.convertedPrice) {
        formData.append(`items[${index}].convertedPrice`, item.convertedPrice.toString())
        formData.append(`items[${index}].convertedCurrency`, item.convertedCurrency || "")
      }
    })

    const result = await createInvoice(formData)

    if (result.success) {
      toast({
        title: "Success!",
        description: result.message,
        variant: "default",
      })
      router.push("/dashboard/invoices")
    } else {
      toast({
        title: "Error!",
        description: result.message,
        variant: "destructive",
      })
    }
  }

  // Update rates when currencies change
  useEffect(() => {
    updateExchangeRates()
  }, [invoiceCurrency, clientCurrency, userCurrency])

  // Recalculate totals when items change
  useEffect(() => {
    calculateTotals()
  }, [items, invoiceCurrency, clientCurrency])

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Globe className="w-6 h-6 text-blue-600" />
          Create New Invoice
        </h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowCurrencyConverter(!showCurrencyConverter)}>
            <Calculator className="w-4 h-4 mr-2" />
            Currency Converter
          </Button>
          {lastRateUpdate && <Badge variant="outline">Rates updated: {lastRateUpdate.toLocaleTimeString()}</Badge>}
        </div>
      </div>

      {/* Currency Converter Widget */}
      {showCurrencyConverter && (
        <CurrencyConverterWidget
          defaultFromCurrency={invoiceCurrency}
          defaultToCurrency={clientCurrency}
          onConversionChange={handleCurrencyConversion}
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Currency Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Currency Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="invoiceCurrency">Invoice Currency</Label>
              <Select value={invoiceCurrency} onValueChange={(value: Currency) => setInvoiceCurrency(value)}>
                <SelectTrigger>
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      <span>{currencyData[invoiceCurrency]?.flag}</span>
                      <span>{currencyData[invoiceCurrency]?.symbol}</span>
                      <span>{invoiceCurrency}</span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <div className="p-2">
                    <div className="text-xs font-medium text-gray-500 mb-2">Popular Currencies</div>
                    {popularCurrencies.map((currency) => (
                      <SelectItem key={currency} value={currency}>
                        <div className="flex items-center gap-2">
                          <span>{currencyData[currency]?.flag}</span>
                          <span className="font-medium">{currencyData[currency]?.symbol}</span>
                          <span>{currency}</span>
                          <span className="text-xs text-gray-500">{currencyData[currency]?.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                    <Separator className="my-2" />
                    <div className="text-xs font-medium text-gray-500 mb-2">All Currencies</div>
                    {Object.entries(currencyData)
                      .filter(([code]) => !popularCurrencies.includes(code as Currency))
                      .map(([code, data]) => (
                        <SelectItem key={code} value={code}>
                          <div className="flex items-center gap-2">
                            <span>{data.flag}</span>
                            <span className="font-medium">{data.symbol}</span>
                            <span>{code}</span>
                            <span className="text-xs text-gray-500">{data.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                  </div>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="clientCurrency">Client Currency (Optional)</Label>
              <Select value={clientCurrency} onValueChange={(value: Currency) => setClientCurrency(value)}>
                <SelectTrigger>
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      <span>{currencyData[clientCurrency]?.flag}</span>
                      <span>{currencyData[clientCurrency]?.symbol}</span>
                      <span>{clientCurrency}</span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <div className="p-2">
                    <div className="text-xs font-medium text-gray-500 mb-2">Popular Currencies</div>
                    {popularCurrencies.map((currency) => (
                      <SelectItem key={currency} value={currency}>
                        <div className="flex items-center gap-2">
                          <span>{currencyData[currency]?.flag}</span>
                          <span className="font-medium">{currencyData[currency]?.symbol}</span>
                          <span>{currency}</span>
                          <span className="text-xs text-gray-500">{currencyData[currency]?.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                    <Separator className="my-2" />
                    <div className="text-xs font-medium text-gray-500 mb-2">All Currencies</div>
                    {Object.entries(currencyData)
                      .filter(([code]) => !popularCurrencies.includes(code as Currency))
                      .map(([code, data]) => (
                        <SelectItem key={code} value={code}>
                          <div className="flex items-center gap-2">
                            <span>{data.flag}</span>
                            <span className="font-medium">{data.symbol}</span>
                            <span>{code}</span>
                            <span className="text-xs text-gray-500">{data.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                  </div>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Invoice Details */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="invoiceNumber">Invoice Number</Label>
              <Input id="invoiceNumber" name="invoiceNumber" placeholder="INV-2024-001" required />
            </div>
            <div>
              <Label htmlFor="issueDate">Issue Date</Label>
              <Input id="issueDate" name="issueDate" type="date" required />
            </div>
            <div>
              <Label htmlFor="dueDate">Due Date</Label>
              <Input id="dueDate" name="dueDate" type="date" required />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select name="status" defaultValue="pending">
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Client Information */}
        <Card>
          <CardHeader>
            <CardTitle>Client Information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="clientName">Client Name</Label>
              <Input id="clientName" name="clientName" placeholder="Acme Corp" required />
            </div>
            <div>
              <Label htmlFor="clientEmail">Client Email</Label>
              <Input id="clientEmail" name="clientEmail" type="email" placeholder="client@example.com" required />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="clientAddress">Client Address</Label>
              <Textarea id="clientAddress" name="clientAddress" placeholder="123 Client St, City, Country" rows={3} />
            </div>
          </CardContent>
        </Card>

        {/* Items */}
        <Card>
          <CardHeader>
            <CardTitle>Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end border-b pb-4">
                <div className="md:col-span-2">
                  <Label htmlFor={`description-${index}`}>Description</Label>
                  <Input
                    id={`description-${index}`}
                    value={item.description}
                    onChange={(e) => handleItemChange(index, "description", e.target.value)}
                    placeholder="Service or Product"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor={`quantity-${index}`}>Quantity</Label>
                  <Input
                    id={`quantity-${index}`}
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, "quantity", Number(e.target.value))}
                    min="1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor={`unitPrice-${index}`}>Unit Price</Label>
                  <Input
                    id={`unitPrice-${index}`}
                    type="number"
                    value={item.unitPrice}
                    onChange={(e) => handleItemChange(index, "unitPrice", Number(e.target.value))}
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor={`currency-${index}`}>Currency</Label>
                  <Select
                    value={item.currency}
                    onValueChange={(value: Currency) => handleItemChange(index, "currency", value)}
                  >
                    <SelectTrigger>
                      <SelectValue>
                        <span className="flex items-center gap-1">
                          <span>{currencyData[item.currency]?.flag}</span>
                          <span>{item.currency}</span>
                        </span>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {popularCurrencies.map((currency) => (
                        <SelectItem key={currency} value={currency}>
                          <div className="flex items-center gap-2">
                            <span>{currencyData[currency]?.flag}</span>
                            <span>{currency}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-sm font-medium">
                    Total: {currencyData[item.currency]?.symbol}
                    {(item.quantity * item.unitPrice).toFixed(2)}
                  </div>
                  {items.length > 1 && (
                    <Button type="button" variant="destructive" size="icon" onClick={() => handleRemoveItem(index)}>
                      <MinusCircle className="h-4 w-4" />
                      <span className="sr-only">Remove item</span>
                    </Button>
                  )}
                </div>
                {item.convertedPrice && item.convertedCurrency && (
                  <div className="md:col-span-6 text-xs text-gray-500">
                    Converted from: {currencyData[item.convertedCurrency]?.symbol}
                    {item.convertedPrice} {item.convertedCurrency}
                  </div>
                )}
              </div>
            ))}
            <Button type="button" variant="outline" onClick={handleAddItem}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Item
            </Button>

            {/* Totals */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-lg font-semibold">
                <span>Subtotal ({invoiceCurrency}):</span>
                <span>
                  {currencyData[invoiceCurrency]?.symbol}
                  {subtotal.toFixed(2)}
                </span>
              </div>
              {totalConversions && (
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Client Total ({totalConversions.convertedCurrency}):</span>
                  <span>
                    {currencyData[totalConversions.convertedCurrency]?.symbol}
                    {totalConversions.convertedTotal.toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Payment Details */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="taxRate">Tax Rate (%)</Label>
              <Input id="taxRate" name="taxRate" type="number" step="0.01" defaultValue="0" />
            </div>
            <div>
              <Label htmlFor="paymentTerms">Payment Terms</Label>
              <Select name="paymentTerms" defaultValue="net30">
                <SelectTrigger>
                  <SelectValue placeholder="Select payment terms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Due Immediately</SelectItem>
                  <SelectItem value="net15">Net 15 Days</SelectItem>
                  <SelectItem value="net30">Net 30 Days</SelectItem>
                  <SelectItem value="net60">Net 60 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" name="notes" placeholder="Any additional notes or terms..." rows={3} />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className="w-full">
          Create Invoice
        </Button>
      </form>
    </div>
  )
}
