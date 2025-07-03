import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { DollarSign, FileText, Users, Receipt, Plus, ArrowUpRight, TrendingUp } from "lucide-react"
import Link from "next/link"

// Mock data for dashboard
const dashboardData = {
  stats: {
    totalRevenue: 45231.89,
    totalInvoices: 254,
    totalClients: 48,
    totalExpenses: 12543.67,
    revenueChange: 20.1,
    invoicesChange: 12.5,
    clientsChange: 8.2,
    expensesChange: -5.4,
  },
  recentInvoices: [
    {
      id: "INV-001",
      client: "Acme Corporation",
      amount: 2500.0,
      status: "paid",
      date: "2024-01-15",
    },
    {
      id: "INV-002",
      client: "Tech Solutions Ltd",
      amount: 1800.5,
      status: "pending",
      date: "2024-01-14",
    },
    {
      id: "INV-003",
      client: "Global Industries",
      amount: 3200.0,
      status: "overdue",
      date: "2024-01-10",
    },
    {
      id: "INV-004",
      client: "StartupXYZ",
      amount: 950.75,
      status: "paid",
      date: "2024-01-08",
    },
  ],
  recentExpenses: [
    {
      id: "EXP-001",
      description: "Office Supplies",
      amount: 299.99,
      category: "office",
      date: "2024-01-15",
    },
    {
      id: "EXP-002",
      description: "Software License",
      amount: 89.5,
      category: "software",
      date: "2024-01-14",
    },
    {
      id: "EXP-003",
      description: "Business Travel",
      amount: 450.0,
      category: "travel",
      date: "2024-01-12",
    },
    {
      id: "EXP-004",
      description: "Team Lunch",
      amount: 125.75,
      category: "office",
      date: "2024-01-10",
    },
  ],
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-[120px] mb-2" />
              <Skeleton className="h-3 w-[80px]" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-[150px]" />
            <Skeleton className="h-4 w-[200px]" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-[120px]" />
                    <Skeleton className="h-3 w-[80px]" />
                  </div>
                  <Skeleton className="h-6 w-[60px]" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-[150px]" />
            <Skeleton className="h-4 w-[200px]" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-[120px]" />
                    <Skeleton className="h-3 w-[80px]" />
                  </div>
                  <Skeleton className="h-6 w-[60px]" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function DashboardContent() {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    const colors = {
      paid: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      overdue: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    }
    return colors[status as keyof typeof colors] || colors.pending
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      office: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      software: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      travel: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    }
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(dashboardData.stats.totalRevenue)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="mr-1 h-3 w-3 text-green-500" />+{dashboardData.stats.revenueChange}% from last
              month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Invoices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.stats.totalInvoices}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="mr-1 h-3 w-3 text-green-500" />+{dashboardData.stats.invoicesChange}% from last
              month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.stats.totalClients}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="mr-1 h-3 w-3 text-green-500" />+{dashboardData.stats.clientsChange}% from last
              month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expenses</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(dashboardData.stats.totalExpenses)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
              {dashboardData.stats.expensesChange}% from last month
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Invoices</CardTitle>
                <CardDescription>Latest invoice activity</CardDescription>
              </div>
              <Link href="/dashboard/invoices">
                <Button variant="outline" size="sm">
                  View All
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.recentInvoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{invoice.id}</p>
                      <Badge className={getStatusColor(invoice.status)}>{invoice.status}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{invoice.client}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{formatCurrency(invoice.amount)}</p>
                    <p className="text-xs text-muted-foreground">{new Date(invoice.date).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Link href="/dashboard/invoices/new">
                <Button className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Invoice
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Expenses</CardTitle>
                <CardDescription>Latest expense activity</CardDescription>
              </div>
              <Link href="/dashboard/expenses">
                <Button variant="outline" size="sm">
                  View All
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.recentExpenses.map((expense) => (
                <div key={expense.id} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{expense.description}</p>
                      <Badge className={getCategoryColor(expense.category)}>{expense.category}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{new Date(expense.date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{formatCurrency(expense.amount)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Link href="/dashboard/expenses/new">
                <Button className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Expense
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Welcome to INVOXA</h2>
      </div>
      <div className="text-muted-foreground">Here's what's happening with your business today.</div>
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  )
}
