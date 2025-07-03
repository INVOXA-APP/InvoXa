import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Loader2Icon } from "lucide-react"

export default function AIPredictionsLoading() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">AI Predictions</h1>
            <p className="text-gray-400">Leverage AI to predict future business trends and optimize decisions.</p>
          </div>
          <Loader2Icon className="h-10 w-10 animate-spin text-primary" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-invoxa-card-bg border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Predicted Revenue (Next Month)</CardTitle>
              <Loader2Icon className="h-5 w-5 animate-spin text-primary" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-24 mb-2" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-2 w-full mt-2" />
            </CardContent>
          </Card>
          <Card className="bg-invoxa-card-bg border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Client Churn Risk</CardTitle>
              <Loader2Icon className="h-5 w-5 animate-spin text-primary" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-24 mb-2" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-2 w-full mt-2" />
            </CardContent>
          </Card>
          <Card className="bg-invoxa-card-bg border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Invoice Payment Time</CardTitle>
              <Loader2Icon className="h-5 w-5 animate-spin text-primary" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-24 mb-2" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-2 w-full mt-2" />
            </CardContent>
          </Card>
        </div>

        <Card className="bg-invoxa-card-bg border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Prediction Models</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-10 w-full md:col-span-2" />
          </CardContent>
        </Card>

        <Card className="bg-invoxa-card-bg border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Prediction Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* New loading component */}
        <div className="flex flex-col space-y-3">
          <Skeleton className="h-[125px] w-[250px] rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
