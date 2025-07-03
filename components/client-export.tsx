"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Download, FileSpreadsheet, FileText, Mail } from "lucide-react"

interface ExportOptions {
  format: "csv" | "excel" | "pdf"
  fields: string[]
  filters: {
    status?: string
    dateRange?: string
  }
}

interface ClientExportProps {
  clientCount: number
}

export function ClientExport({ clientCount }: ClientExportProps) {
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: "csv",
    fields: ["name", "email", "company", "status", "total_amount"],
    filters: {},
  })
  const [isExporting, setIsExporting] = useState(false)

  const availableFields = [
    { id: "name", label: "Name" },
    { id: "email", label: "Email" },
    { id: "phone", label: "Phone" },
    { id: "company", label: "Company" },
    { id: "address", label: "Address" },
    { id: "status", label: "Status" },
    { id: "total_invoices", label: "Total Invoices" },
    { id: "total_amount", label: "Total Amount" },
    { id: "last_invoice_date", label: "Last Invoice Date" },
    { id: "created_at", label: "Created Date" },
  ]

  const handleFieldToggle = (fieldId: string, checked: boolean) => {
    setExportOptions((prev) => ({
      ...prev,
      fields: checked ? [...prev.fields, fieldId] : prev.fields.filter((f) => f !== fieldId),
    }))
  }

  const handleExport = async () => {
    setIsExporting(true)

    // Simulate export process
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // In a real app, this would call an API endpoint to generate and download the file
    console.log("Exporting with options:", exportOptions)

    setIsExporting(false)
  }

  const getFormatIcon = (format: string) => {
    switch (format) {
      case "csv":
      case "excel":
        return <FileSpreadsheet className="h-4 w-4" />
      case "pdf":
        return <FileText className="h-4 w-4" />
      default:
        return <Download className="h-4 w-4" />
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Clients
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Export Client Data</DialogTitle>
          <DialogDescription>
            Export {clientCount} clients to your preferred format with customizable fields and filters.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Format Selection */}
          <div className="space-y-2">
            <Label>Export Format</Label>
            <Select
              value={exportOptions.format}
              onValueChange={(value: "csv" | "excel" | "pdf") =>
                setExportOptions((prev) => ({ ...prev, format: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    CSV File
                  </div>
                </SelectItem>
                <SelectItem value="excel">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    Excel File
                  </div>
                </SelectItem>
                <SelectItem value="pdf">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    PDF Report
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Field Selection */}
          <div className="space-y-3">
            <Label>Fields to Include</Label>
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-3">
                  {availableFields.map((field) => (
                    <div key={field.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={field.id}
                        checked={exportOptions.fields.includes(field.id)}
                        onCheckedChange={(checked) => handleFieldToggle(field.id, checked as boolean)}
                      />
                      <Label htmlFor={field.id} className="text-sm">
                        {field.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="space-y-3">
            <Label>Filters</Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-sm">Status</Label>
                <Select
                  value={exportOptions.filters.status || "all"}
                  onValueChange={(value) =>
                    setExportOptions((prev) => ({
                      ...prev,
                      filters: { ...prev.filters, status: value === "all" ? undefined : value },
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active Only</SelectItem>
                    <SelectItem value="inactive">Inactive Only</SelectItem>
                    <SelectItem value="pending">Pending Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Date Range</Label>
                <Select
                  value={exportOptions.filters.dateRange || "all"}
                  onValueChange={(value) =>
                    setExportOptions((prev) => ({
                      ...prev,
                      filters: { ...prev.filters, dateRange: value === "all" ? undefined : value },
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="last_30_days">Last 30 Days</SelectItem>
                    <SelectItem value="last_90_days">Last 90 Days</SelectItem>
                    <SelectItem value="this_year">This Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Export Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Export Summary</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p>
                Exporting {clientCount} clients in {exportOptions.format.toUpperCase()} format with{" "}
                {exportOptions.fields.length} selected fields.
              </p>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" disabled={isExporting}>
              <Mail className="h-4 w-4 mr-2" />
              Email Export
            </Button>
            <Button onClick={handleExport} disabled={isExporting || exportOptions.fields.length === 0}>
              {isExporting ? (
                <>
                  <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Exporting...
                </>
              ) : (
                <>
                  {getFormatIcon(exportOptions.format)}
                  <span className="ml-2">Export {exportOptions.format.toUpperCase()}</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
