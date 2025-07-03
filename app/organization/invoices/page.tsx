"use client"

import { CardDescription } from "@/components/ui/card"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardLayout } from "@/components/dashboard-layout"
import { MoreHorizontal } from "lucide-react"
import Link from "next/link"
import { PlusCircle } from "lucide-react"

export default function OrganizationInvoicesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedEmployee, setSelectedEmployee] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")

  const invoices = [
    {
      id: "INV-ORG-001",
      client: "Global Solutions Inc.",
      amount: "$5,000.00",
      status: "Paid",
      date: "2024-06-25",
    },
    {
      id: "INV-ORG-002",
      client: "Tech Innovations LLC",
      amount: "$2,500.00",
      status: "Pending",
      date: "2024-07-01",
    },
    {
      id: "INV-ORG-003",
      client: "Creative Minds Agency",
      amount: "$1,200.00",
      status: "Overdue",
      date: "2024-06-10",
    },
  ]

  const employees = [
    { id: "all", name: "All Employees" },
    { id: "1", name: "John Doe" },
    { id: "2", name: "Jane Smith" },
    { id: "3", name: "Alice Johnson" },
    { id: "4", name: "Bob Brown" },
    { id: "5", name: "Charlie Davis" },
  ]

  const statuses = [
    { value: "all", label: "All Statuses" },
    { value: "Paid", label: "Paid" },
    { value: "Pending", label: "Pending" },
    { value: "Sent", label: "Sent" },
    { value: "Overdue", label: "Overdue" },
  ]

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.client.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesEmployee = selectedEmployee === "all" || invoice.employeeId === selectedEmployee
    const matchesStatus = selectedStatus === "all" || invoice.status === selectedStatus
    return matchesSearch && matchesEmployee && matchesStatus
  })

  // Calculate stats
  const totalInvoices = invoices.length
  const totalAmount = invoices.reduce((sum, inv) => sum + Number.parseFloat(inv.amount.replace("$", "")), 0)
  const paidInvoices = invoices.filter((inv) => inv.status === "Paid").length
  const overdueInvoices = invoices.filter((inv) => inv.status === "Overdue").length

  // Employee performance
  const employeeStats = employees.slice(1).map((emp) => {
    const empInvoices = invoices.filter((inv) => inv.employeeId === emp.id)
    const empTotal = empInvoices.reduce((sum, inv) => sum + Number.parseFloat(inv.amount.replace("$", "")), 0)
    const empPaid = empInvoices.filter((inv) => inv.status === "Paid").length
    return {
      ...emp,
      totalInvoices: empInvoices.length,
      totalAmount: empTotal,
      paidInvoices: empPaid,
      successRate: empInvoices.length > 0 ? Math.round((empPaid / empInvoices.length) * 100) : 0,
    }
  })

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Organization Invoices</h1>
            <p className="text-gray-400">Manage invoices across your entire organization.</p>
          </div>
          <Button className="bg-gradient-to-r from-invoxa-purple to-invoxa-blue text-white hover:opacity-90">
            <PlusCircle className="w-4 h-4 mr-2" />
            Create New Invoice
          </Button>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-invoxa-card-bg border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{totalInvoices}</div>
              <p className="text-gray-400">in organization</p>
            </CardContent>
          </Card>
          <Card className="bg-invoxa-card-bg border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total Amount</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">${totalAmount.toFixed(2)}</div>
              <p className="text-xs text-green-600 flex items-center">+15% this month</p>
            </CardContent>
          </Card>
          <Card className="bg-invoxa-card-bg border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Paid Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{paidInvoices}</div>
              <p className="text-xs text-gray-400">of {totalInvoices} total</p>
            </CardContent>
          </Card>
          <Card className="bg-invoxa-card-bg border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Overdue Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{overdueInvoices}</div>
              <p className="text-xs text-red-400">require attention</p>
            </CardContent>
          </Card>
        </div>

        {/* Employee Performance */}
        <Card className="bg-invoxa-card-bg border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center text-white">Employee Performance</CardTitle>
            <CardDescription className="text-gray-400">Statistics for each employee</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {employeeStats.map((emp) => (
                <div key={emp.id} className="p-4 border rounded-lg bg-gray-800">
                  <div className="flex items-center space-x-3 mb-3">
                    <Avatar>
                      <AvatarImage src={`/placeholder-32px.png?height=32&width=32`} />
                      <AvatarFallback>
                        {emp.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-white">{emp.name}</p>
                      <p className="text-sm text-gray-400">{emp.totalInvoices} invoices</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">Amount</p>
                      <p className="font-semibold text-white">${emp.totalAmount.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Payment Rate</p>
                      <p className="font-semibold text-white">{emp.successRate}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Filters and Search */}
        <Card className="bg-invoxa-card-bg border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Complete Invoice List</CardTitle>
            <CardDescription className="text-gray-400">All invoices created by organization employees</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4 mb-6">
              <div className="relative flex-1">
                <Input
                  placeholder="Search by invoice number, client, or employee..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-800 text-white"
                />
              </div>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee} className="bg-gray-800 text-white">
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 text-white">
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id} className="bg-gray-800 text-white">
                      {emp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedStatus} onValueChange={setSelectedStatus} className="bg-gray-800 text-white">
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 text-white">
                  {statuses.map((status) => (
                    <SelectItem key={status.value} value={status.value} className="bg-gray-800 text-white">
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Tabs defaultValue="table" className="w-full">
              <TabsList className="bg-gray-800 text-white">
                <TabsTrigger value="table">Detailed Table</TabsTrigger>
                <TabsTrigger value="summary">Summary</TabsTrigger>
              </TabsList>

              <TabsContent value="table">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-700">
                        <TableHead className="text-gray-300">Invoice</TableHead>
                        <TableHead className="text-gray-300">Client</TableHead>
                        <TableHead className="text-gray-300">Employee</TableHead>
                        <TableHead className="text-gray-300">Amount</TableHead>
                        <TableHead className="text-gray-300">Status</TableHead>
                        <TableHead className="text-gray-300">Date Created</TableHead>
                        <TableHead className="text-gray-300">Due Date</TableHead>
                        <TableHead className="text-right text-gray-300">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredInvoices.map((invoice) => (
                        <TableRow key={invoice.id} className="border-gray-800 hover:bg-gray-700/30">
                          <TableCell className="font-medium text-white">{invoice.id}</TableCell>
                          <TableCell className="text-gray-300">{invoice.client}</TableCell>
                          <TableCell className="text-gray-300">Employee Name</TableCell>
                          <TableCell className="font-medium text-white">{invoice.amount}</TableCell>
                          <TableCell>
                            <Badge
                              className={`${
                                invoice.status === "Paid"
                                  ? "bg-green-500/20 text-green-400"
                                  : invoice.status === "Pending"
                                    ? "bg-yellow-500/20 text-yellow-400"
                                    : "bg-red-500/20 text-red-400"
                              }`}
                            >
                              {invoice.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-gray-300">{invoice.date}</TableCell>
                          <TableCell className="text-gray-300">Due Date</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0 text-gray-400 hover:text-white">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-invoxa-card-bg border-gray-700 text-white">
                                <DropdownMenuItem className="hover:bg-gray-700/50">View Details</DropdownMenuItem>
                                <DropdownMenuItem className="hover:bg-gray-700/50">Edit Invoice</DropdownMenuItem>
                                <DropdownMenuItem className="hover:bg-gray-700/50 text-red-400">
                                  Delete Invoice
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="summary">
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <Card className="bg-invoxa-card-bg border-gray-700">
                      <CardHeader>
                        <CardTitle className="text-lg text-white">Status Distribution</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {statuses.slice(1).map((status) => {
                            const count = invoices.filter((inv) => inv.status === status.value).length
                            const percentage = totalInvoices > 0 ? Math.round((count / totalInvoices) * 100) : 0
                            return (
                              <div key={status.value} className="flex items-center justify-between">
                                <span className="text-sm text-gray-300">{status.label}</span>
                                <div className="flex items-center space-x-2">
                                  <div className="w-20 bg-gray-200 rounded-full h-2">
                                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${percentage}%` }} />
                                  </div>
                                  <span className="text-sm font-medium text-white">{count}</span>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-invoxa-card-bg border-gray-700">
                      <CardHeader>
                        <CardTitle className="text-lg text-white">Top Employees</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {employeeStats
                            .sort((a, b) => b.totalAmount - a.totalAmount)
                            .slice(0, 5)
                            .map((emp, index) => (
                              <div key={emp.id} className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm font-medium text-white">#{index + 1}</span>
                                  <span className="text-sm text-white">{emp.name}</span>
                                </div>
                                <span className="text-sm font-medium text-white">${emp.totalAmount.toFixed(2)}</span>
                              </div>
                            ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Recent Invoices */}
        <Card className="bg-invoxa-card-bg border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Recent Invoices</CardTitle>
            <CardDescription className="text-gray-400">
              A list of the most recent invoices in your organization.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice ID</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id} className="border-gray-800 hover:bg-gray-700/30">
                    <TableCell className="font-medium text-white">{invoice.id}</TableCell>
                    <TableCell className="text-gray-300">{invoice.client}</TableCell>
                    <TableCell className="text-gray-300">{invoice.amount}</TableCell>
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
                    <TableCell className="text-gray-300">{invoice.date}</TableCell>
                    <TableCell className="text-right">
                      <Link href={`/organization/invoices/${invoice.id}`} className="text-primary hover:underline">
                        View Details
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
