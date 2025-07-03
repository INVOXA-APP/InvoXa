"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import {
  Download,
  FileText,
  File,
  Database,
  Table,
  CalendarIcon,
  Clock,
  MessageSquare,
  Sparkles,
  Settings,
  CheckCircle,
  AlertCircle,
} from "lucide-react"
import { ConversationExporter, type ExportOptions } from "@/lib/conversation-exporter"
import type { ConversationSession, ConversationMessage } from "@/types/conversation"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface ConversationExportProps {
  sessions: ConversationSession[]
  messages: ConversationMessage[]
  selectedSessionIds?: string[]
  trigger?: React.ReactNode
}

export function ConversationExport({ sessions, messages, selectedSessionIds, trigger }: ConversationExportProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: "pdf",
    includeMetadata: true,
    includeTimestamps: true,
    includeSummaries: true,
    sessionIds: selectedSessionIds,
    groupBy: "session",
  })
  const [dateRange, setDateRange] = useState<{ start?: Date; end?: Date }>({})
  const [selectedSessions, setSelectedSessions] = useState<Set<string>>(
    new Set(selectedSessionIds || sessions.map((s) => s.id)),
  )

  const { toast } = useToast()

  const formatIcons = {
    pdf: FileText,
    text: File,
    json: Database,
    csv: Table,
  }

  const formatDescriptions = {
    pdf: "Professional formatted document with proper layout",
    text: "Plain text file for easy reading and sharing",
    json: "Structured data format for developers",
    csv: "Spreadsheet format for data analysis",
  }

  const handleSessionToggle = (sessionId: string) => {
    const newSelected = new Set(selectedSessions)
    if (newSelected.has(sessionId)) {
      newSelected.delete(sessionId)
    } else {
      newSelected.add(sessionId)
    }
    setSelectedSessions(newSelected)
    setExportOptions((prev) => ({
      ...prev,
      sessionIds: Array.from(newSelected),
    }))
  }

  const handleSelectAll = () => {
    const allIds = sessions.map((s) => s.id)
    setSelectedSessions(new Set(allIds))
    setExportOptions((prev) => ({
      ...prev,
      sessionIds: allIds,
    }))
  }

  const handleSelectNone = () => {
    setSelectedSessions(new Set())
    setExportOptions((prev) => ({
      ...prev,
      sessionIds: [],
    }))
  }

  const handleDateRangeChange = (field: "start" | "end", date?: Date) => {
    const newDateRange = { ...dateRange, [field]: date }
    setDateRange(newDateRange)

    if (newDateRange.start || newDateRange.end) {
      setExportOptions((prev) => ({
        ...prev,
        dateRange:
          newDateRange.start && newDateRange.end ? { start: newDateRange.start, end: newDateRange.end } : undefined,
      }))
    } else {
      setExportOptions((prev) => ({
        ...prev,
        dateRange: undefined,
      }))
    }
  }

  const getFilteredData = () => {
    let filteredSessions = sessions.filter((s) => selectedSessions.has(s.id))
    let filteredMessages = messages.filter((m) => selectedSessions.has(m.session_id))

    if (exportOptions.dateRange) {
      const { start, end } = exportOptions.dateRange
      filteredSessions = filteredSessions.filter((s) => {
        const sessionDate = new Date(s.created_at)
        return sessionDate >= start && sessionDate <= end
      })
      filteredMessages = filteredMessages.filter((m) => {
        const messageDate = new Date(m.created_at)
        return messageDate >= start && messageDate <= end
      })
    }

    return { sessions: filteredSessions, messages: filteredMessages }
  }

  const handleExport = async () => {
    if (selectedSessions.size === 0) {
      toast({
        title: "No Sessions Selected",
        description: "Please select at least one conversation to export.",
        variant: "destructive",
      })
      return
    }

    setIsExporting(true)
    setExportProgress(0)

    try {
      const { sessions: filteredSessions, messages: filteredMessages } = getFilteredData()

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setExportProgress((prev) => Math.min(prev + 10, 90))
      }, 100)

      const blob = await ConversationExporter.exportConversations(filteredSessions, filteredMessages, exportOptions)

      clearInterval(progressInterval)
      setExportProgress(100)

      // Download the file
      const filename = ConversationExporter.generateFilename(exportOptions.format, exportOptions)
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: "Export Successful",
        description: `Conversations exported as ${exportOptions.format.toUpperCase()} file.`,
      })

      setIsOpen(false)
    } catch (error) {
      console.error("Export error:", error)
      toast({
        title: "Export Failed",
        description: "There was an error exporting your conversations. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
      setExportProgress(0)
    }
  }

  const { sessions: previewSessions, messages: previewMessages } = getFilteredData()

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export Conversations
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[70vh]">
          {/* Export Options */}
          <div className="lg:col-span-2 space-y-6">
            {/* Format Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Export Format</Label>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(formatIcons).map(([format, Icon]) => (
                  <div
                    key={format}
                    className={cn(
                      "border rounded-lg p-3 cursor-pointer transition-all",
                      exportOptions.format === format
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300",
                    )}
                    onClick={() => setExportOptions((prev) => ({ ...prev, format: format as any }))}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="w-4 h-4" />
                      <span className="font-medium text-sm uppercase">{format}</span>
                    </div>
                    <p className="text-xs text-gray-600">
                      {formatDescriptions[format as keyof typeof formatDescriptions]}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Options */}
            <div className="space-y-4">
              <Label className="text-sm font-medium">Export Options</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="metadata"
                    checked={exportOptions.includeMetadata}
                    onCheckedChange={(checked) => setExportOptions((prev) => ({ ...prev, includeMetadata: !!checked }))}
                  />
                  <Label htmlFor="metadata" className="text-sm">
                    Include Metadata
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="timestamps"
                    checked={exportOptions.includeTimestamps}
                    onCheckedChange={(checked) =>
                      setExportOptions((prev) => ({ ...prev, includeTimestamps: !!checked }))
                    }
                  />
                  <Label htmlFor="timestamps" className="text-sm">
                    Include Timestamps
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="summaries"
                    checked={exportOptions.includeSummaries}
                    onCheckedChange={(checked) =>
                      setExportOptions((prev) => ({ ...prev, includeSummaries: !!checked }))
                    }
                  />
                  <Label htmlFor="summaries" className="text-sm">
                    Include Summaries
                  </Label>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Group By</Label>
                  <Select
                    value={exportOptions.groupBy}
                    onValueChange={(value) => setExportOptions((prev) => ({ ...prev, groupBy: value as any }))}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="session">Session</SelectItem>
                      <SelectItem value="chronological">Chronological</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Date Range */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Date Range (Optional)</Label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-start text-left font-normal bg-transparent">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.start ? format(dateRange.start, "PPP") : "Start date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateRange.start}
                      onSelect={(date) => handleDateRangeChange("start", date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-start text-left font-normal bg-transparent">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.end ? format(dateRange.end, "PPP") : "End date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateRange.end}
                      onSelect={(date) => handleDateRangeChange("end", date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Session Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Select Conversations</Label>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={handleSelectAll}>
                    Select All
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleSelectNone}>
                    Select None
                  </Button>
                </div>
              </div>
              <ScrollArea className="h-40 border rounded-md p-3">
                <div className="space-y-2">
                  {sessions.map((session) => (
                    <div key={session.id} className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50">
                      <Checkbox
                        id={session.id}
                        checked={selectedSessions.has(session.id)}
                        onCheckedChange={() => handleSessionToggle(session.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium truncate">
                            {session.title || `Session ${session.id.slice(0, 8)}`}
                          </span>
                          {(session.summary || session.auto_summary) && <Sparkles className="w-3 h-3 text-green-500" />}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          {format(new Date(session.created_at), "MMM d, yyyy")}
                          <MessageSquare className="w-3 h-3" />
                          {session.message_count || 0} messages
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="border-l pl-6 space-y-4">
            <div>
              <Label className="text-sm font-medium">Export Preview</Label>
              <div className="mt-2 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>{previewSessions.length} conversations</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MessageSquare className="w-4 h-4 text-blue-500" />
                  <span>{previewMessages.length} messages</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="w-4 h-4 text-purple-500" />
                  <span>{exportOptions.format.toUpperCase()} format</span>
                </div>
                {exportOptions.includeSummaries && (
                  <div className="flex items-center gap-2 text-sm">
                    <Sparkles className="w-4 h-4 text-green-500" />
                    <span>{previewSessions.filter((s) => s.summary || s.auto_summary).length} with summaries</span>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label className="text-sm font-medium">File Details</Label>
              <div className="text-xs text-gray-600 space-y-1">
                <div>
                  <strong>Filename:</strong>
                  <br />
                  {ConversationExporter.generateFilename(exportOptions.format, exportOptions)}
                </div>
                <div>
                  <strong>Estimated size:</strong>
                  <br />
                  {exportOptions.format === "pdf" ? "Medium" : exportOptions.format === "json" ? "Large" : "Small"}
                </div>
              </div>
            </div>

            {selectedSessions.size === 0 && (
              <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <AlertCircle className="w-4 h-4 text-yellow-600" />
                <span className="text-sm text-yellow-800">Select at least one conversation to export</span>
              </div>
            )}
          </div>
        </div>

        {/* Export Progress */}
        {isExporting && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Exporting conversations...</span>
              <span>{exportProgress}%</span>
            </div>
            <Progress value={exportProgress} className="w-full" />
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isExporting}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isExporting || selectedSessions.size === 0}>
            {isExporting ? (
              <>
                <Settings className="w-4 h-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Export {selectedSessions.size} Conversation{selectedSessions.size !== 1 ? "s" : ""}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
