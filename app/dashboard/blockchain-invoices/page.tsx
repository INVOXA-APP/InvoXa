import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ArrowUpRight, PlusCircle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function BlockchainInvoicesPage() {
  const invoices = [
    {
      id: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b",
      invoiceNumber: "INV-2024-001",
      client: "Acme Corp",
      amount: "1,250.00 USDC",
      status: "Paid",
      date: "2024-07-01",
      transactionHash: "0xabc123def456...",
    },
    {
      id: "0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c",
      invoiceNumber: "INV-2024-002",
      client: "Globex Inc.",
      amount: "750.00 ETH",
      status: "Pending",
      date: "2024-07-05",
      transactionHash: "0xdef789ghi012...",
    },
    {
      id: "0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d",
      invoiceNumber: "INV-2024-003",
      client: "Cyberdyne Systems",
      amount: "3,000.00 BTC",
      status: "Overdue",
      date: "2024-06-20",
      transactionHash: "0xjkl345mno678...",
    },
  ]

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Blockchain Invoices</h1>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Create New Blockchain Invoice
        </Button>
      </div>

      <Card className="relative overflow-hidden">
        <Image
          src="/futuristic-network-background.png"
          alt="Background"
          layout="fill"
          objectFit="cover"
          className="absolute inset-0 opacity-20 dark:opacity-10"
        />
        <CardHeader className="relative z-10">
          <CardTitle>Overview</CardTitle>
        </CardHeader>
        <CardContent className="relative z-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value Transacted</CardTitle>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$5,000,000</div>
              <p className="text-xs text-muted-foreground">+20.1% from last month</p>
            </CardContent>
          </Card>
          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Wallets</CardTitle>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,234</div>
              <p className="text-xs text-muted-foreground">+5.3% from last month</p>
            </CardContent>
          </Card>
          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Transactions</CardTitle>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">42</div>
              <p className="text-xs text-muted-foreground">Requires attention</p>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Blockchain Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice Number</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Transaction Hash</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                  <TableCell>{invoice.client}</TableCell>
                  <TableCell>{invoice.amount}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        invoice.status === "Paid"
                          ? "default"
                          : invoice.status === "Pending"
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {invoice.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{invoice.date}</TableCell>
                  <TableCell>
                    <Link
                      href={`https://etherscan.io/tx/${invoice.transactionHash}`}
                      target="_blank"
                      className="text-blue-500 hover:underline"
                    >
                      {invoice.transactionHash.substring(0, 10)}...
                    </Link>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
