import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export default function OrganizationInvoicesLoading() {
  return (
    <DashboardLayout>
      <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-950">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-lg text-muted-foreground">Loading organization invoices...</p>
        </div>
      </div>

      {/* Original code retained below for context */}
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Organization Invoices</h1>
            <p className="text-gray-400">Manage invoices across your entire organization.</p>
          </div>
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-invoxa-card-bg border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total Org Invoices</CardTitle>
              <div className="flex flex-1 items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-1 items-center justify-center">
                <Loader2 className="h-8 w-20 animate-spin text-primary" />
              </div>
              <div className="flex flex-1 items-center justify-center">
                <Loader2 className="h-4 w-24 animate-spin text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-invoxa-card-bg border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Org Paid Invoices</CardTitle>
              <div className="flex flex-1 items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-1 items-center justify-center">
                <Loader2 className="h-8 w-20 animate-spin text-primary" />
              </div>
              <div className="flex flex-1 items-center justify-center">
                <Loader2 className="h-4 w-24 animate-spin text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-invoxa-card-bg border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Org Pending Amount</CardTitle>
              <div className="flex flex-1 items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-1 items-center justify-center">
                <Loader2 className="h-8 w-20 animate-spin text-primary" />
              </div>
              <div className="flex flex-1 items-center justify-center">
                <Loader2 className="h-4 w-24 animate-spin text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-invoxa-card-bg border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Organization Invoice List</CardTitle>
            <p className="text-gray-400">Loading organization invoices...</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 border border-gray-800 rounded-md">
                  <div className="flex items-center space-x-4">
                    <div className="flex flex-1 items-center justify-center">
                      <Loader2 className="h-6 w-32 animate-spin text-primary" />
                    </div>
                    <div className="flex flex-1 items-center justify-center">
                      <Loader2 className="h-4 w-24 animate-spin text-primary" />
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <div className="flex flex-1 items-center justify-center">
                      <Loader2 className="h-8 w-20 animate-spin text-primary" />
                    </div>
                    <div className="flex flex-1 items-center justify-center">
                      <Loader2 className="h-8 w-20 animate-spin text-primary" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Skeleton updates */}
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
