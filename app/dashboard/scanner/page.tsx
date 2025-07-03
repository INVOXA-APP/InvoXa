"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { uploadReceipt } from "./actions"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Loader2, UploadCloudIcon, CheckCircleIcon, XCircleIcon } from "lucide-react"
import { useLanguageCurrency } from "@/contexts/language-currency-context"

export default function ScannerPage() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle")
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)
  const { toast } = useToast()
  const { t } = useLanguageCurrency()

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0])
      setUploadStatus("idle")
      setUploadedUrl(null)
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!file) {
      toast({
        title: t("error"),
        description: t("receipt-image"),
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    setUploadStatus("uploading")

    const formData = new FormData()
    formData.append("receipt", file)

    const result = await uploadReceipt(formData)

    setLoading(false)
    if (result.success) {
      setUploadStatus("success")
      setUploadedUrl(result.url || null)
      toast({
        title: t("success"),
        description: result.message,
      })
      setFile(null) // Clear file input after successful upload
      if (event.currentTarget) {
        event.currentTarget.reset() // Reset the form to clear the file input visually
      }
    } else {
      setUploadStatus("error")
      toast({
        title: t("error"),
        description: result.message,
        variant: "destructive",
      })
    }
  }

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">{t("receipt-scanner")}</h2>
      </div>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>{t("upload-receipt")}</CardTitle>
          <CardDescription>{t("upload-receipt-description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-2">
              <Label htmlFor="receipt-upload">{t("receipt-image")}</Label>
              <Input id="receipt-upload" type="file" accept="image/*" onChange={handleFileChange} disabled={loading} />
              {file && <p className="text-sm text-muted-foreground">Selected file: {file.name}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={loading || !file}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("uploading")}
                </>
              ) : (
                <>
                  <UploadCloudIcon className="mr-2 h-4 w-4" />
                  {t("upload-and-scan")}
                </>
              )}
            </Button>

            {uploadStatus === "success" && (
              <div className="flex items-center justify-center gap-2 text-green-600">
                <CheckCircleIcon className="h-5 w-5" />
                <span>{t("success")}</span>
                {uploadedUrl && (
                  <a href={uploadedUrl} target="_blank" rel="noopener noreferrer" className="underline ml-2 text-sm">
                    {t("view-details")}
                  </a>
                )}
              </div>
            )}
            {uploadStatus === "error" && (
              <div className="flex items-center justify-center gap-2 text-red-600">
                <XCircleIcon className="h-5 w-5" />
                <span>{t("error")}</span>
              </div>
            )}
          </form>
          <div className="mt-8 text-center text-muted-foreground text-sm">
            <p>{t("supported-formats")}</p>
            <p>{t("max-file-size")}</p>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}
