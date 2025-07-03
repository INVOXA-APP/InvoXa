"use client"

import { useState } from "react"
import { ClientSearch } from "@/components/client-search"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Users, Building2, Heart, ShoppingCart, RefreshCw } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DashboardLayout } from "@/components/dashboard-layout"

interface Client {
  id: string
  name: string
  email: string
  phone?: string
  company?: string
  address?: string
  status: "active" | "inactive" | "pending"
  total_invoices: number
  total_amount: number
  last_invoice_date?: string
  created_at: string
  industry?: string
  payment_terms?: number
}

export default function ClientsPage() {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)

  const handleClientSelect = (client: Client) => {
    setSelectedClient(client)
  }

  const handleAddClient = () => {
    setShowAddDialog(true)
  }

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Client Management</h1>
            <p className="text-gray-600 mt-1">
              Advanced filtering with Active+Healthcare and Inactive+Retail combinations
            </p>
          </div>
          <Button onClick={handleAddClient} size="lg" className="w-full sm:w-auto">
            <Plus className="h-5 w-5 mr-2" />
            Add New Client
          </Button>
        </div>

        {/* Filter Combination Preview */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900 flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              New Filter Combinations Available
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white rounded-lg border border-red-200">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="h-4 w-4 text-red-600" />
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                  <Badge className="bg-red-100 text-red-800">Healthcare</Badge>
                </div>
                <p className="text-sm text-gray-600">Active healthcare providers</p>
                <p className="text-xs text-red-600 font-medium">3 clients • $623K revenue</p>
                <p className="text-xs text-gray-500 mt-1">Dr. Patricia Williams, Dr. James Mitchell, Lisa Anderson</p>
              </div>

              <div className="p-4 bg-white rounded-lg border border-pink-200">
                <div className="flex items-center gap-2 mb-2">
                  <ShoppingCart className="h-4 w-4 text-pink-600" />
                  <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
                  <Badge className="bg-pink-100 text-pink-800">Retail</Badge>
                </div>
                <p className="text-sm text-gray-600">Inactive retail businesses</p>
                <p className="text-xs text-pink-600 font-medium">3 clients • $275K revenue</p>
                <p className="text-xs text-gray-500 mt-1">Brian Foster, Marcus Johnson, Angela Davis</p>
              </div>
            </div>
            <p className="text-sm text-blue-700 mt-4">
              💡 <strong>Try it:</strong> Use the filter cards below to explore these new combinations and see detailed
              client information.
            </p>
          </CardContent>
        </Card>

        {/* Client Search Component */}
        <ClientSearch onClientSelect={handleClientSelect} onAddClient={handleAddClient} />

        {/* Client Details Dialog */}
        <Dialog open={!!selectedClient} onOpenChange={() => setSelectedClient(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <Users className="h-6 w-6 text-blue-600" />
                Client Details
              </DialogTitle>
              <DialogDescription>Complete information for {selectedClient?.name}</DialogDescription>
            </DialogHeader>

            {selectedClient && (
              <div className="space-y-6">
                {/* Client Header */}
                <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-gray-900">{selectedClient.name}</h3>
                    {selectedClient.company && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Building2 className="h-4 w-4" />
                        <span className="font-medium">{selectedClient.company}</span>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Badge
                        className={
                          selectedClient.status === "active"
                            ? "bg-green-100 text-green-800"
                            : selectedClient.status === "inactive"
                              ? "bg-gray-100 text-gray-800"
                              : "bg-yellow-100 text-yellow-800"
                        }
                      >
                        {selectedClient.status.charAt(0).toUpperCase() + selectedClient.status.slice(1)}
                      </Badge>
                      {selectedClient.industry && (
                        <Badge variant="outline" className="bg-blue-100 text-blue-800">
                          {selectedClient.industry}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      ${selectedClient.total_amount.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">{selectedClient.total_invoices} invoices</div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">Contact Information</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium text-gray-600">Email:</span>
                        <div className="text-gray-900">{selectedClient.email}</div>
                      </div>
                      {selectedClient.phone && (
                        <div>
                          <span className="font-medium text-gray-600">Phone:</span>
                          <div className="text-gray-900">{selectedClient.phone}</div>
                        </div>
                      )}
                      {selectedClient.address && (
                        <div>
                          <span className="font-medium text-gray-600">Address:</span>
                          <div className="text-gray-900">{selectedClient.address}</div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">Business Details</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium text-gray-600">Industry:</span>
                        <div className="text-gray-900">{selectedClient.industry || "Not specified"}</div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Payment Terms:</span>
                        <div className="text-gray-900">{selectedClient.payment_terms || 30} days</div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Client Since:</span>
                        <div className="text-gray-900">{new Date(selectedClient.created_at).toLocaleDateString()}</div>
                      </div>
                      {selectedClient.last_invoice_date && (
                        <div>
                          <span className="font-medium text-gray-600">Last Invoice:</span>
                          <div className="text-gray-900">
                            {new Date(selectedClient.last_invoice_date).toLocaleDateString()}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Invoice
                  </Button>
                  <Button variant="outline">Edit Client</Button>
                  <Button variant="outline">Send Email</Button>
                  <Button variant="outline">View History</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Add Client Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Client</DialogTitle>
              <DialogDescription>
                Create a new client profile to start managing your business relationship.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-center py-8">
                <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Add Client Form</h3>
                <p className="text-gray-600 mb-4">
                  This would contain a comprehensive client creation form with all necessary fields.
                </p>
                <Button onClick={() => setShowAddDialog(false)}>Close for Now</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
