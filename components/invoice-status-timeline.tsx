"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, AlertTriangle, XCircle, FileText, Send, Eye, DollarSign } from "lucide-react"

interface TimelineEvent {
  id: string
  status: string
  timestamp: string
  description: string
  user?: string
  automated?: boolean
}

interface InvoiceStatusTimelineProps {
  invoiceId: string
  currentStatus: string
  events: TimelineEvent[]
}

export function InvoiceStatusTimeline({ invoiceId, currentStatus, events }: InvoiceStatusTimelineProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "draft":
        return <FileText className="h-4 w-4" />
      case "sent":
        return <Send className="h-4 w-4" />
      case "viewed":
        return <Eye className="h-4 w-4" />
      case "pending":
        return <Clock className="h-4 w-4" />
      case "paid":
        return <CheckCircle className="h-4 w-4" />
      case "overdue":
        return <AlertTriangle className="h-4 w-4" />
      case "cancelled":
        return <XCircle className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800 border-gray-200"
      case "sent":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "viewed":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "paid":
        return "bg-green-100 text-green-800 border-green-200"
      case "overdue":
        return "bg-red-100 text-red-800 border-red-200"
      case "cancelled":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getTimelineColor = (status: string, isCurrent: boolean) => {
    if (isCurrent) {
      switch (status) {
        case "paid":
          return "bg-green-500"
        case "overdue":
          return "bg-red-500"
        case "pending":
          return "bg-yellow-500"
        case "sent":
          return "bg-blue-500"
        default:
          return "bg-gray-500"
      }
    }
    return "bg-gray-300"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-blue-600" />
          Invoice Status Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {events.map((event, index) => {
            const isLast = index === events.length - 1
            const isCurrent = event.status === currentStatus

            return (
              <div key={event.id} className="flex items-start gap-4">
                {/* Timeline dot and line */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-3 h-3 rounded-full ${getTimelineColor(event.status, isCurrent)} ${
                      isCurrent ? "ring-4 ring-opacity-30" : ""
                    } ${
                      event.status === "paid"
                        ? "ring-green-200"
                        : event.status === "overdue"
                          ? "ring-red-200"
                          : event.status === "pending"
                            ? "ring-yellow-200"
                            : event.status === "sent"
                              ? "ring-blue-200"
                              : "ring-gray-200"
                    }`}
                  />
                  {!isLast && <div className="w-0.5 h-8 bg-gray-200 mt-2" />}
                </div>

                {/* Event content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={getStatusColor(event.status)}>
                      <span className="flex items-center gap-1">
                        {getStatusIcon(event.status)}
                        {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                      </span>
                    </Badge>
                    <span className="text-sm text-gray-500">{new Date(event.timestamp).toLocaleString()}</span>
                    {event.automated && (
                      <Badge variant="outline" className="text-xs">
                        Automated
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-700">{event.description}</p>
                  {event.user && <p className="text-xs text-gray-500 mt-1">by {event.user}</p>}
                </div>
              </div>
            )
          })}
        </div>

        {/* Current status summary */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Current Status:</span>
              <Badge className={getStatusColor(currentStatus)}>
                <span className="flex items-center gap-1">
                  {getStatusIcon(currentStatus)}
                  {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
                </span>
              </Badge>
            </div>
            <div className="text-sm text-gray-500">
              Last updated: {events.length > 0 ? new Date(events[events.length - 1].timestamp).toLocaleString() : "N/A"}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
