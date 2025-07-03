import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { DownloadIcon, FilterIcon, PrinterIcon, SearchIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { DashboardLayout } from "@/components/dashboard-layout"

export default function ReportsPage() {
  const reports = [
    {
      id: "R001",
      type: "Sales Report",
      date: "2024-05-01",
      status: "Completed",
      amount: "$12,345.67",
    },
    {
      id: "R002",
      type: "Expense Report",
      date: "2024-04-28",
      status: "Completed",
      amount: "$5,678.90",
    },
    {
      id: "R003",
      type: "Profit & Loss",
      date: "2024-04-25",
      status: "Pending",
      amount: "$6,789.01",
    },
    {
      id: "R004",
      type: "Client Activity",
      date: "2024-04-20",
      status: "Completed",
      amount: "N/A",
    },
    {
      id: "R005",
      type: "Invoice Summary",
      date: "2024-04-15",
      status: "Completed",
      amount: "$23,456.78",
    },
  ]

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <FilterIcon className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button>
            <DownloadIcon className="mr-2 h-4 w-4" />
            Download
          </Button>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Generated Reports</CardTitle>
          <CardDescription>View and manage your financial and operational reports.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center py-4">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search reports..." className="max-w-sm pl-8" />
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Report ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="font-medium">{report.id}</TableCell>
                  <TableCell>{report.type}</TableCell>
                  <TableCell>{report.date}</TableCell>
                  <TableCell>{report.status}</TableCell>
                  <TableCell className="text-right">{report.amount}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      <PrinterIcon className="h-4 w-4" />
                      <span className="sr-only">Print</span>
                    </Button>
                    <Button variant="ghost" size="sm">
                      <DownloadIcon className="h-4 w-4" />
                      <span className="sr-only">Download</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}
