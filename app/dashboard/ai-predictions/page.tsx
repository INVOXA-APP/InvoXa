"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, BarChart3 } from "lucide-react"
import { useLanguageCurrency } from "@/contexts/language-currency-context"

export default function AIPredictionsPage() {
  const { t, formatCurrency } = useLanguageCurrency()

  const predictions = [
    {
      id: 1,
      type: t("revenue-forecast"),
      period: t("next-quarter"),
      prediction: formatCurrency(1200000),
      accuracy: 92,
      status: t("high-confidence"),
      statusColor: "bg-blue-100 text-blue-800",
    },
    {
      id: 2,
      type: t("expense-anomaly-detection"),
      period: t("last-month"),
      prediction: t("potential-overspend-marketing"),
      accuracy: 85,
      status: t("action-required"),
      statusColor: "bg-red-100 text-red-800",
    },
    {
      id: 3,
      type: t("client-churn-probability"),
      period: t("next-6-months"),
      prediction: t("acme-corp-15"),
      accuracy: 78,
      status: t("monitor"),
      statusColor: "bg-yellow-100 text-yellow-800",
    },
    {
      id: 4,
      type: t("invoice-payment-delay"),
      period: t("next-30-days"),
      prediction: t("globex-likely-delay"),
      accuracy: 90,
      status: t("high-confidence"),
      statusColor: "bg-blue-100 text-blue-800",
    },
  ]

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">{t("ai-predictions")}</h2>
        <div className="flex items-center space-x-2">
          <Button>
            <TrendingUp className="mr-2 h-4 w-4" />
            {t("generate-new-prediction")}
          </Button>
        </div>
      </div>

      {/* Prediction Overview */}
      <div
        className="relative overflow-hidden rounded-lg bg-gradient-to-br from-purple-500 via-blue-500 to-indigo-600 p-6 text-white"
        style={{
          backgroundImage: `url('/futuristic-network-background.png')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundBlendMode: "overlay",
        }}
      >
        <div className="relative z-10">
          <h3 className="text-2xl font-bold mb-6">{t("prediction-overview")}</h3>
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-8 w-8 text-green-400" />
                  <div>
                    <p className="text-sm opacity-90">{t("revenue-forecast")}</p>
                    <p className="text-2xl font-bold">{formatCurrency(1200000)}</p>
                    <p className="text-xs opacity-75">{t("next-quarter")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-8 w-8 text-orange-400" />
                  <div>
                    <p className="text-sm opacity-90">{t("expense-anomalies")}</p>
                    <p className="text-2xl font-bold">2 {t("detected")}</p>
                    <p className="text-xs opacity-75">{t("last-month")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <TrendingDown className="h-8 w-8 text-red-400" />
                  <div>
                    <p className="text-sm opacity-90">{t("churn-risk")}</p>
                    <p className="text-2xl font-bold">3 {t("high-risk-clients")}</p>
                    <p className="text-xs opacity-75">{t("next-6-months")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Recent Predictions Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t("recent-predictions")}</CardTitle>
          <CardDescription>AI-powered insights and forecasts for your business</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Table Header */}
            <div className="grid grid-cols-6 gap-4 text-sm font-medium text-muted-foreground border-b pb-2">
              <div>{t("prediction-type")}</div>
              <div>{t("period")}</div>
              <div>{t("prediction")}</div>
              <div>{t("accuracy")}</div>
              <div>{t("status")}</div>
              <div>{t("actions")}</div>
            </div>

            {/* Table Rows */}
            {predictions.map((prediction) => (
              <div key={prediction.id} className="grid grid-cols-6 gap-4 items-center py-3 border-b last:border-b-0">
                <div className="font-medium">{prediction.type}</div>
                <div className="text-sm text-muted-foreground">{prediction.period}</div>
                <div className="font-medium">{prediction.prediction}</div>
                <div className="flex items-center gap-2">
                  <Progress value={prediction.accuracy} className="w-16 h-2" />
                  <span className="text-sm font-medium">{prediction.accuracy}%</span>
                </div>
                <div>
                  <Badge className={prediction.statusColor}>{prediction.status}</Badge>
                </div>
                <div>
                  <Button variant="outline" size="sm">
                    {t("view-details")}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
