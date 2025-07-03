"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Download, Send, Edit } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { InvoiceStatusTimeline } from "@/components/invoice-status-timeline"
import { currencyData, type Currency } from "@/contexts/language-currency-context"

interface InvoiceItem {
  description: string
  quantity: number
  rate: number
  amount: number
  currency?: Currency
}

interface Invoice {
  id: string
  invoice_number: string
  client_name: string
  client_email: string
  client_address?: string
  amount: number
  status: string
  due_date: string
  created_at: string
  description: string
  currency: Currency
  client_currency?: Currency
  exchange_rate?: number
  items: InvoiceItem[]
  tax_rate?: number
  payment_terms?: string
}

interface TimelineEvent {
  id: string
  status: string
  timestamp: string
  description: string
  user?: string
  automated?: boolean
}

export default function InvoiceDetailPage() {
  const params = useParams()
  const invoiceId = params.id as string
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock data for demonstration
    const mockInvoice: Invoice = {
      id: invoiceId,
      invoice_number: "INV-2024-001",
      client_name: "Acme Corporation",
      client_email: "billing@acme.com",
      client_address: "123 Business St\nNew York, NY 10001\nUnited States",
      amount: 2500.0,
      status: "pending",
      due_date: "2024-02-15",
      created_at: "2024-01-15T10:00:00Z",
      description: "Web development services for Q1 2024",
      currency: "USD",
      client_currency: "EUR",
      exchange_rate: 0.85,
      tax_rate: 8.5,
      payment_terms: "net30",
      items: [
        {
          description: "Frontend Development",
          quantity: 40,
          rate: 50,
          amount: 2000,
          currency: "USD",
        },
        {
          description: "Backend Integration",
          quantity: 10,
          rate: 50,
          amount: 500,
          currency: "USD",
        },
      ],
    }

    const mockTimelineEvents: TimelineEvent[] = [
      {
        id: "1",
        status: "draft",
        timestamp: "2024-01-15T10:00:00Z",
        description: "Invoice created as draft",
        user: "John Doe",
      },
      {
        id: "2",
        status: "sent",
        timestamp: "2024-01-15T14:30:00Z",
        description: "Invoice sent to client via email",
        user: "John Doe",
      },
      {
        id: "3",
        status: "viewed",
        timestamp: "2024-01-16T09:15:00Z",
        description: "Client viewed the invoice",
        automated: true,
      },
      {
        id: "4",
        status: "pending",
        timestamp: "2024-01-16T09:16:00Z",
        description: "Invoice status updated to pending payment",
        automated: true,
      },
    ]

    setInvoice(mockInvoice)
    setTimelineEvents(mockTimelineEvents)
    setLoading(false)
  }, [invoiceId])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "overdue":
        return "bg-red-100 text-red-800"
      case "draft":
        return "bg-gray-100 text-gray-800"
      case "sent":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded mb-4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Invoice not found</h2>
          <p className="text-gray-500 mt-2">The invoice you're looking for doesn't exist.</p>
          <Button asChild className="mt-4">
            <Link href="/dashboard/invoices">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Invoices
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  const subtotal = invoice.items.reduce((sum, item) => sum + item.amount, 0)
  const taxAmount = (subtotal * (invoice.tax_rate || 0)) / 100
  const total = subtotal + taxAmount

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" asChild>
            <Link href="/dashboard/invoices">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{invoice.invoice_number}</h1>
            <p className="text-gray-500">Invoice Details</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={getStatusColor(invoice.status)}>
            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
          </Badge>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
          <Button variant="outline" size="sm">
            <Send className="mr-2 h-4 w-4" />
            Send
          </Button>
          <Button variant="outline" size="sm">
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Invoice Details */}
        <div className="md:col-span-2 space-y-6">
          {/* Invoice Information */}
          <Card>
            <CardHeader>
              <CardTitle>Invoice Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Invoice Number</p>
                  <p className="text-lg font-semibold">{invoice.invoice_number}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Issue Date</p>
                  <p>{new Date(invoice.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Due Date</p>
                  <p>{new Date(invoice.due_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Payment Terms</p>
                  <p>{invoice.payment_terms || "Net 30"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Client Information */}
          <Card>
            <CardHeader>
              <CardTitle>Client Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-semibold">{invoice.client_name}</p>
                <p className="text-gray-600">{invoice.client_email}</p>
                {invoice.client_address && (
                  <div className="text-gray-600 whitespace-pre-line">{invoice.client_address}</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Items */}
          <Card>
            <CardHeader>
              <CardTitle>Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {invoice.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                    <div className="flex-1">
                      <p className="font-medium">{item.description}</p>
                      <p className="text-sm text-gray-500">
                        {item.quantity} × {currencyData[invoice.currency]?.symbol}
                        {item.rate}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {currencyData[invoice.currency]?.symbol}
                        {item.amount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>
                      {currencyData[invoice.currency]?.symbol}
                      {subtotal.toFixed(2)}
                    </span>
                  </div>
                  {invoice.tax_rate && invoice.tax_rate > 0 && (
                    <div className="flex justify-between">
                      <span>Tax ({invoice.tax_rate}%):</span>
                      <span>
                        {currencyData[invoice.currency]?.symbol}
                        {taxAmount.toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>
                      {currencyData[invoice.currency]?.symbol}
                      {total.toFixed(2)}
                    </span>
                  </div>
                  {invoice.client_currency && invoice.client_currency !== invoice.currency && invoice.exchange_rate && (
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Client Total ({invoice.client_currency}):</span>
                      <span>
                        {currencyData[invoice.client_currency]?.symbol}
                        {(total * invoice.exchange_rate).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Timeline */}
        <div>
          <InvoiceStatusTimeline invoiceId={invoice.id} currentStatus={invoice.status} events={timelineEvents} />
        </div>
      </div>
    </div>
  )
}
