import jsPDF from "jspdf"
import type { ConversationSession, ConversationMessage } from "@/types/conversation"

export interface ExportOptions {
  format: "pdf" | "text" | "json" | "csv"
  includeMetadata: boolean
  includeTimestamps: boolean
  includeSummaries: boolean
  dateRange?: {
    start: Date
    end: Date
  }
  sessionIds?: string[]
  groupBy: "session" | "chronological"
}

export interface ExportData {
  sessions: ConversationSession[]
  messages: ConversationMessage[]
  exportOptions: ExportOptions
  generatedAt: string
}

export class ConversationExporter {
  static async exportConversations(
    sessions: ConversationSession[],
    messages: ConversationMessage[],
    options: ExportOptions,
  ): Promise<Blob> {
    const exportData: ExportData = {
      sessions,
      messages,
      exportOptions: options,
      generatedAt: new Date().toISOString(),
    }

    switch (options.format) {
      case "pdf":
        return this.exportToPDF(exportData)
      case "text":
        return this.exportToText(exportData)
      case "json":
        return this.exportToJSON(exportData)
      case "csv":
        return this.exportToCSV(exportData)
      default:
        throw new Error(`Unsupported export format: ${options.format}`)
    }
  }

  private static async exportToPDF(data: ExportData): Promise<Blob> {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 20
    const lineHeight = 7
    let yPosition = margin

    // Helper function to add text with word wrapping
    const addText = (text: string, fontSize = 10, isBold = false) => {
      doc.setFontSize(fontSize)
      if (isBold) {
        doc.setFont(undefined, "bold")
      } else {
        doc.setFont(undefined, "normal")
      }

      const lines = doc.splitTextToSize(text, pageWidth - 2 * margin)

      for (const line of lines) {
        if (yPosition > pageHeight - margin) {
          doc.addPage()
          yPosition = margin
        }
        doc.text(line, margin, yPosition)
        yPosition += lineHeight
      }
      yPosition += 3 // Extra spacing
    }

    // Header
    addText("INVOXA - Conversation Export", 16, true)
    addText(`Generated: ${new Date(data.generatedAt).toLocaleString()}`, 10)
    addText(`Export Format: PDF | Sessions: ${data.sessions.length} | Messages: ${data.messages.length}`, 10)
    yPosition += 10

    // Group messages by session or chronologically
    if (data.exportOptions.groupBy === "session") {
      for (const session of data.sessions) {
        // Session header
        addText(`\n=== Conversation Session ===`, 12, true)

        if (data.exportOptions.includeMetadata) {
          addText(`Session ID: ${session.id}`)
          addText(`Created: ${new Date(session.created_at).toLocaleString()}`)
          addText(`Messages: ${session.message_count || 0}`)

          if (session.title) {
            addText(`Title: ${session.title}`)
          }
        }

        if (data.exportOptions.includeSummaries && (session.summary || session.auto_summary)) {
          addText("\n--- Summary ---", 11, true)
          addText(session.summary || session.auto_summary || "")
        }

        addText("\n--- Messages ---", 11, true)

        // Session messages
        const sessionMessages = data.messages.filter((m) => m.session_id === session.id)

        for (const message of sessionMessages) {
          const role = message.role === "user" ? "You" : "ARIA"
          const timestamp = data.exportOptions.includeTimestamps
            ? ` (${new Date(message.created_at).toLocaleTimeString()})`
            : ""

          addText(`\n${role}${timestamp}:`, 10, true)
          addText(message.content)
        }

        yPosition += 15 // Extra spacing between sessions
      }
    } else {
      // Chronological order
      addText("=== All Messages (Chronological) ===", 12, true)

      const sortedMessages = [...data.messages].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      )

      for (const message of sortedMessages) {
        const session = data.sessions.find((s) => s.id === message.session_id)
        const role = message.role === "user" ? "You" : "ARIA"
        const timestamp = data.exportOptions.includeTimestamps
          ? ` (${new Date(message.created_at).toLocaleString()})`
          : ""
        const sessionInfo = data.exportOptions.includeMetadata && session?.title ? ` [${session.title}]` : ""

        addText(`\n${role}${timestamp}${sessionInfo}:`, 10, true)
        addText(message.content)
      }
    }

    return new Blob([doc.output("blob")], { type: "application/pdf" })
  }

  private static async exportToText(data: ExportData): Promise<Blob> {
    let content = ""

    // Header
    content += "INVOXA - Conversation Export\n"
    content += "=".repeat(50) + "\n"
    content += `Generated: ${new Date(data.generatedAt).toLocaleString()}\n`
    content += `Sessions: ${data.sessions.length} | Messages: ${data.messages.length}\n\n`

    if (data.exportOptions.groupBy === "session") {
      for (const session of data.sessions) {
        content += `\n${"=".repeat(30)}\n`
        content += `CONVERSATION SESSION\n`
        content += `${"=".repeat(30)}\n`

        if (data.exportOptions.includeMetadata) {
          content += `Session ID: ${session.id}\n`
          content += `Created: ${new Date(session.created_at).toLocaleString()}\n`
          content += `Messages: ${session.message_count || 0}\n`

          if (session.title) {
            content += `Title: ${session.title}\n`
          }
        }

        if (data.exportOptions.includeSummaries && (session.summary || session.auto_summary)) {
          content += `\n--- SUMMARY ---\n`
          content += `${session.summary || session.auto_summary}\n`
        }

        content += `\n--- MESSAGES ---\n`

        const sessionMessages = data.messages.filter((m) => m.session_id === session.id)

        for (const message of sessionMessages) {
          const role = message.role === "user" ? "YOU" : "ARIA"
          const timestamp = data.exportOptions.includeTimestamps
            ? ` (${new Date(message.created_at).toLocaleTimeString()})`
            : ""

          content += `\n${role}${timestamp}:\n`
          content += `${message.content}\n`
        }

        content += "\n"
      }
    } else {
      content += `${"=".repeat(30)}\n`
      content += `ALL MESSAGES (CHRONOLOGICAL)\n`
      content += `${"=".repeat(30)}\n`

      const sortedMessages = [...data.messages].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      )

      for (const message of sortedMessages) {
        const session = data.sessions.find((s) => s.id === message.session_id)
        const role = message.role === "user" ? "YOU" : "ARIA"
        const timestamp = data.exportOptions.includeTimestamps
          ? ` (${new Date(message.created_at).toLocaleString()})`
          : ""
        const sessionInfo = data.exportOptions.includeMetadata && session?.title ? ` [${session.title}]` : ""

        content += `\n${role}${timestamp}${sessionInfo}:\n`
        content += `${message.content}\n`
      }
    }

    return new Blob([content], { type: "text/plain" })
  }

  private static async exportToJSON(data: ExportData): Promise<Blob> {
    const jsonData = {
      metadata: {
        exportedAt: data.generatedAt,
        exportOptions: data.exportOptions,
        totalSessions: data.sessions.length,
        totalMessages: data.messages.length,
        application: "INVOXA",
        version: "1.0",
      },
      sessions: data.sessions.map((session) => ({
        ...session,
        messages: data.messages.filter((m) => m.session_id === session.id),
      })),
    }

    return new Blob([JSON.stringify(jsonData, null, 2)], { type: "application/json" })
  }

  private static async exportToCSV(data: ExportData): Promise<Blob> {
    const headers = [
      "Session ID",
      "Session Title",
      "Session Created",
      "Message ID",
      "Role",
      "Content",
      "Message Created",
      "Has Summary",
    ]

    if (data.exportOptions.includeMetadata) {
      headers.push("Session Message Count", "Summary Type")
    }

    let csv = headers.join(",") + "\n"

    for (const session of data.sessions) {
      const sessionMessages = data.messages.filter((m) => m.session_id === session.id)

      for (const message of sessionMessages) {
        const row = [
          `"${session.id}"`,
          `"${session.title || ""}"`,
          `"${new Date(session.created_at).toISOString()}"`,
          `"${message.id}"`,
          `"${message.role}"`,
          `"${message.content.replace(/"/g, '""')}"`,
          `"${new Date(message.created_at).toISOString()}"`,
          `"${!!(session.summary || session.auto_summary)}"`,
        ]

        if (data.exportOptions.includeMetadata) {
          row.push(
            `"${session.message_count || 0}"`,
            `"${session.auto_summary ? "Auto" : session.summary ? "Manual" : "None"}"`,
          )
        }

        csv += row.join(",") + "\n"
      }
    }

    return new Blob([csv], { type: "text/csv" })
  }

  static generateFilename(format: string, options: ExportOptions): string {
    const timestamp = new Date().toISOString().split("T")[0]
    const sessionCount = options.sessionIds?.length || "all"

    return `invoxa-conversations-${sessionCount}-sessions-${timestamp}.${format}`
  }
}
