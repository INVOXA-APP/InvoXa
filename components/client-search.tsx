"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  Plus,
  Filter,
  MoreHorizontal,
  Mail,
  Phone,
  MapPin,
  Building2,
  Calendar,
  DollarSign,
  X,
  TrendingUp,
  CheckCircle,
  Heart,
  ShoppingCart,
  Store,
  AlertTriangle,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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

interface ClientSearchProps {
  onClientSelect?: (client: Client) => void
  onAddClient?: () => void
}

export function ClientSearch({ onClientSelect, onAddClient }: ClientSearchProps) {
  const [clients, setClients] = useState<Client[]>([])
  const [filteredClients, setFilteredClients] = useState<Client[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("inactive") // Pre-applied Inactive filter
  const [industryFilter, setIndustryFilter] = useState<string>("Retail") // Pre-applied Retail filter
  const [sortBy, setSortBy] = useState<string>("total_amount") // Sort by revenue to show patterns
  const [loading, setLoading] = useState(true)
  const [searchResults, setSearchResults] = useState<number>(0)

  // Enhanced mock data with more realistic client information
  useEffect(() => {
    const mockClients: Client[] = [
      {
        id: "1",
        name: "John Smith",
        email: "john@techsolutions.com",
        phone: "+1 (555) 123-4567",
        company: "Tech Solutions Inc",
        address: "123 Silicon Valley Blvd, San Francisco, CA 94105",
        status: "active",
        total_invoices: 24,
        total_amount: 125000,
        last_invoice_date: "2024-01-15",
        created_at: "2023-06-15T10:00:00Z",
        industry: "Technology",
        payment_terms: 30,
      },
      {
        id: "2",
        name: "Sarah Johnson",
        email: "sarah@creativestudio.com",
        phone: "+1 (555) 987-6543",
        company: "Creative Design Studio",
        address: "456 Arts District, Los Angeles, CA 90013",
        status: "active",
        total_invoices: 18,
        total_amount: 89500,
        last_invoice_date: "2024-01-10",
        created_at: "2023-08-20T14:30:00Z",
        industry: "Design",
        payment_terms: 15,
      },
      {
        id: "3",
        name: "Michael Brown",
        email: "mike@innovationstartup.io",
        phone: "+1 (555) 456-7890",
        company: "Innovation Startup",
        address: "789 Startup Lane, Austin, TX 78701",
        status: "pending",
        total_invoices: 6,
        total_amount: 32500,
        last_invoice_date: "2023-12-20",
        created_at: "2023-11-01T09:15:00Z",
        industry: "Technology",
        payment_terms: 45,
      },
      {
        id: "4",
        name: "Emily Davis",
        email: "emily@businessconsulting.com",
        phone: "+1 (555) 321-0987",
        company: "Business Consulting Group",
        address: "321 Corporate Plaza, Chicago, IL 60601",
        status: "active",
        total_invoices: 35,
        total_amount: 245000,
        last_invoice_date: "2024-01-08",
        created_at: "2023-03-10T16:45:00Z",
        industry: "Consulting",
        payment_terms: 30,
      },
      {
        id: "5",
        name: "David Wilson",
        email: "david@ecommercesolutions.com",
        phone: "+1 (555) 654-3210",
        company: "E-commerce Solutions",
        address: "654 Commerce Street, Miami, FL 33101",
        status: "active",
        total_invoices: 42,
        total_amount: 186000,
        last_invoice_date: "2024-01-12",
        created_at: "2023-01-15T11:20:00Z",
        industry: "E-commerce",
        payment_terms: 30,
      },
      {
        id: "6",
        name: "Lisa Anderson",
        email: "lisa@healthcareplus.com",
        phone: "+1 (555) 789-0123",
        company: "Healthcare Plus",
        address: "987 Medical Center Dr, Boston, MA 02101",
        status: "active",
        total_invoices: 28,
        total_amount: 156000,
        last_invoice_date: "2024-01-14",
        created_at: "2023-05-22T13:10:00Z",
        industry: "Healthcare",
        payment_terms: 60,
      },
      {
        id: "7",
        name: "Robert Taylor",
        email: "robert@financialservices.com",
        phone: "+1 (555) 234-5678",
        company: "Financial Services Corp",
        address: "234 Wall Street, New York, NY 10005",
        status: "inactive",
        total_invoices: 15,
        total_amount: 95000,
        last_invoice_date: "2023-09-15",
        created_at: "2023-02-08T08:30:00Z",
        industry: "Finance",
        payment_terms: 30,
      },
      {
        id: "8",
        name: "Jennifer Martinez",
        email: "jennifer@retailchain.com",
        phone: "+1 (555) 345-6789",
        company: "Retail Chain Solutions",
        address: "345 Shopping Plaza, Denver, CO 80202",
        status: "pending",
        total_invoices: 8,
        total_amount: 42000,
        last_invoice_date: "2023-12-28",
        created_at: "2023-10-12T15:45:00Z",
        industry: "Retail",
        payment_terms: 30,
      },
      {
        id: "9",
        name: "Christopher Lee",
        email: "chris@manufacturingco.com",
        phone: "+1 (555) 567-8901",
        company: "Manufacturing Co",
        address: "567 Industrial Blvd, Detroit, MI 48201",
        status: "active",
        total_invoices: 31,
        total_amount: 198000,
        last_invoice_date: "2024-01-11",
        created_at: "2023-04-18T12:00:00Z",
        industry: "Manufacturing",
        payment_terms: 45,
      },
      {
        id: "10",
        name: "Amanda White",
        email: "amanda@educationtech.com",
        phone: "+1 (555) 678-9012",
        company: "Education Tech Solutions",
        address: "678 Campus Drive, Seattle, WA 98101",
        status: "active",
        total_invoices: 19,
        total_amount: 87500,
        last_invoice_date: "2024-01-09",
        created_at: "2023-07-25T10:15:00Z",
        industry: "Education",
        payment_terms: 30,
      },
      {
        id: "11",
        name: "Mark Thompson",
        email: "mark@techcorp.com",
        phone: "+1 (555) 111-2222",
        company: "TechCorp Industries",
        address: "111 Innovation Way, Portland, OR 97201",
        status: "active",
        total_invoices: 12,
        total_amount: 32500,
        last_invoice_date: "2024-01-05",
        created_at: "2023-11-15T14:20:00Z",
        industry: "Technology",
        payment_terms: 30,
      },
      {
        id: "12",
        name: "Rachel Green",
        email: "rachel@healthsystems.com",
        phone: "+1 (555) 333-4444",
        company: "Health Systems Inc",
        address: "333 Wellness Blvd, Phoenix, AZ 85001",
        status: "inactive",
        total_invoices: 12,
        total_amount: 67000,
        last_invoice_date: "2023-08-20",
        created_at: "2023-01-10T09:30:00Z",
        industry: "Healthcare",
        payment_terms: 45,
      },
      {
        id: "13",
        name: "Kevin Rodriguez",
        email: "kevin@designworks.com",
        phone: "+1 (555) 555-6666",
        company: "Design Works Studio",
        address: "555 Creative Ave, Nashville, TN 37201",
        status: "active",
        total_invoices: 22,
        total_amount: 134000,
        last_invoice_date: "2024-01-13",
        created_at: "2023-03-25T11:45:00Z",
        industry: "Design",
        payment_terms: 15,
      },
      {
        id: "14",
        name: "Nicole Parker",
        email: "nicole@consultingpro.com",
        phone: "+1 (555) 777-8888",
        company: "Consulting Pro Services",
        address: "777 Business Park, Atlanta, GA 30301",
        status: "pending",
        total_invoices: 7,
        total_amount: 38500,
        last_invoice_date: "2023-12-30",
        created_at: "2023-09-18T16:10:00Z",
        industry: "Consulting",
        payment_terms: 30,
      },
      {
        id: "15",
        name: "Brian Foster",
        email: "brian@retailsolutions.com",
        phone: "+1 (555) 999-0000",
        company: "Retail Solutions Group",
        address: "999 Commerce Way, Las Vegas, NV 89101",
        status: "inactive",
        total_invoices: 9,
        total_amount: 52000,
        last_invoice_date: "2023-07-10",
        created_at: "2023-02-28T13:25:00Z",
        industry: "Retail",
        payment_terms: 30,
      },
      {
        id: "16",
        name: "Dr. Patricia Williams",
        email: "patricia@medicalcenter.com",
        phone: "+1 (555) 222-3333",
        company: "Williams Medical Center",
        address: "222 Health Plaza, Houston, TX 77001",
        status: "active",
        total_invoices: 45,
        total_amount: 289000,
        last_invoice_date: "2024-01-16",
        created_at: "2023-02-14T08:15:00Z",
        industry: "Healthcare",
        payment_terms: 30,
      },
      {
        id: "17",
        name: "Dr. James Mitchell",
        email: "james@dentalcare.com",
        phone: "+1 (555) 444-5555",
        company: "Mitchell Dental Care",
        address: "444 Smile Street, Orlando, FL 32801",
        status: "active",
        total_invoices: 33,
        total_amount: 178000,
        last_invoice_date: "2024-01-12",
        created_at: "2023-04-20T14:30:00Z",
        industry: "Healthcare",
        payment_terms: 15,
      },
      {
        id: "18",
        name: "Dr. Susan Clark",
        email: "susan@veterinarycare.com",
        phone: "+1 (555) 666-7777",
        company: "Clark Veterinary Services",
        address: "666 Pet Care Lane, Portland, OR 97201",
        status: "inactive",
        total_invoices: 18,
        total_amount: 94000,
        last_invoice_date: "2023-06-15",
        created_at: "2023-01-05T11:00:00Z",
        industry: "Healthcare",
        payment_terms: 30,
      },
      {
        id: "19",
        name: "Marcus Johnson",
        email: "marcus@fashionretail.com",
        phone: "+1 (555) 888-9999",
        company: "Fashion Forward Retail",
        address: "888 Style Boulevard, New York, NY 10001",
        status: "inactive",
        total_invoices: 25,
        total_amount: 145000,
        last_invoice_date: "2023-05-20",
        created_at: "2022-11-10T16:45:00Z",
        industry: "Retail",
        payment_terms: 30,
      },
      {
        id: "20",
        name: "Angela Davis",
        email: "angela@homegoods.com",
        phone: "+1 (555) 000-1111",
        company: "Davis Home & Garden",
        address: "111 Garden Center Dr, Sacramento, CA 95814",
        status: "inactive",
        total_invoices: 14,
        total_amount: 78000,
        last_invoice_date: "2023-04-10",
        created_at: "2022-12-15T09:20:00Z",
        industry: "Retail",
        payment_terms: 45,
      },
    ]

    setTimeout(() => {
      setClients(mockClients)
      setFilteredClients(mockClients)
      setSearchResults(mockClients.length)
      setLoading(false)
    }, 500) // Faster loading to simulate filter click
  }, [])

  // Advanced filter and search logic with multiple filter combination
  useEffect(() => {
    let filtered = clients

    // Apply search filter with multiple criteria
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (client) =>
          client.name.toLowerCase().includes(searchLower) ||
          client.email.toLowerCase().includes(searchLower) ||
          client.company?.toLowerCase().includes(searchLower) ||
          client.industry?.toLowerCase().includes(searchLower) ||
          client.phone?.includes(searchTerm) ||
          client.address?.toLowerCase().includes(searchLower),
      )
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((client) => client.status === statusFilter)
    }

    // Apply industry filter
    if (industryFilter !== "all") {
      filtered = filtered.filter((client) => client.industry === industryFilter)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name)
        case "company":
          return (a.company || "").localeCompare(b.company || "")
        case "total_amount":
          return b.total_amount - a.total_amount
        case "total_invoices":
          return b.total_invoices - a.total_invoices
        case "last_invoice":
          return new Date(b.last_invoice_date || 0).getTime() - new Date(a.last_invoice_date || 0).getTime()
        case "created_at":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        default:
          return 0
      }
    })

    setFilteredClients(filtered)
    setSearchResults(filtered.length)
  }, [clients, searchTerm, statusFilter, industryFilter, sortBy])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200"
      case "inactive":
        return "bg-gray-100 text-gray-800 border-gray-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getIndustryColor = (industry: string) => {
    const colors = {
      Technology: "bg-blue-100 text-blue-800",
      Design: "bg-purple-100 text-purple-800",
      Consulting: "bg-indigo-100 text-indigo-800",
      "E-commerce": "bg-orange-100 text-orange-800",
      Healthcare: "bg-red-100 text-red-800",
      Finance: "bg-green-100 text-green-800",
      Retail: "bg-pink-100 text-pink-800",
      Manufacturing: "bg-gray-100 text-gray-800",
      Education: "bg-cyan-100 text-cyan-800",
    }
    return colors[industry as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const uniqueIndustries = Array.from(new Set(clients.map((client) => client.industry).filter(Boolean)))

  const clearFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
    setIndustryFilter("all")
    setSortBy("name")
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (searchTerm.trim()) count++
    if (statusFilter !== "all") count++
    if (industryFilter !== "all") count++
    if (sortBy !== "name") count++
    return count
  }

  const getFilterSummary = () => {
    const filters = []
    if (statusFilter !== "all") filters.push(`Status: ${statusFilter}`)
    if (industryFilter !== "all") filters.push(`Industry: ${industryFilter}`)
    if (searchTerm.trim()) filters.push(`Search: "${searchTerm}"`)
    return filters.join(" • ")
  }

  // Get statistics for current filtered results
  const getFilteredStats = () => {
    const totalRevenue = filteredClients.reduce((sum, client) => sum + client.total_amount, 0)
    const totalInvoices = filteredClients.reduce((sum, client) => sum + client.total_invoices, 0)
    const avgRevenue = filteredClients.length > 0 ? totalRevenue / filteredClients.length : 0

    const statusCounts = filteredClients.reduce(
      (acc, client) => {
        acc[client.status] = (acc[client.status] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return {
      totalRevenue,
      totalInvoices,
      avgRevenue,
      statusCounts,
    }
  }

  const stats = getFilteredStats()

  // Quick filter presets
  const applyQuickFilter = (status: string, industry: string) => {
    setStatusFilter(status)
    setIndustryFilter(industry)
  }

  // Get filter combination results for preview
  const getFilterPreview = (status: string, industry: string) => {
    const preview = clients.filter((client) => client.status === status && client.industry === industry)
    return {
      count: preview.length,
      revenue: preview.reduce((sum, client) => sum + client.total_amount, 0),
      clients: preview.slice(0, 3), // Show first 3 clients
    }
  }

  const activeHealthcarePreview = getFilterPreview("active", "Healthcare")
  const inactiveRetailPreview = getFilterPreview("inactive", "Retail")

  // Calculate days since last invoice for inactive clients
  const getDaysSinceLastInvoice = (lastInvoiceDate: string) => {
    const today = new Date()
    const lastInvoice = new Date(lastInvoiceDate)
    const diffTime = Math.abs(today.getTime() - lastInvoice.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 h-10 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-32 h-10 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-32 h-10 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-32 h-10 bg-gray-200 rounded animate-pulse"></div>
        </div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-40 bg-gray-200 rounded animate-pulse"></div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Inactive Retail Filter Applied Banner */}
      <Card className="bg-gradient-to-r from-pink-50 to-rose-50 border-pink-300 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-6 w-6 text-pink-600" />
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-pink-900 flex items-center gap-2">
                  Inactive + Retail Filter Applied
                  <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
                  <Badge className="bg-pink-100 text-pink-800">Retail</Badge>
                </h4>
                <p className="text-sm text-pink-700">
                  Showing {searchResults} inactive retail clients with ${stats.totalRevenue.toLocaleString()} dormant
                  revenue
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={clearFilters}
              size="sm"
              className="border-pink-300 text-pink-700 hover:bg-pink-100 bg-transparent"
            >
              <X className="h-4 w-4 mr-1" />
              Clear Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Retail Re-engagement Insights */}
      <Card className="bg-gradient-to-r from-pink-50 to-rose-50 border-pink-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-5 w-5 text-pink-600" />
            <h4 className="font-semibold text-pink-900">Retail Re-engagement Opportunities</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-white rounded-lg border border-pink-200">
              <div className="text-2xl font-bold text-pink-600">${Math.round(stats.avgRevenue).toLocaleString()}</div>
              <div className="text-sm text-pink-700">Average Revenue</div>
              <div className="text-xs text-gray-500">per inactive retail client</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg border border-pink-200">
              <div className="text-2xl font-bold text-pink-600">
                {Math.round(
                  filteredClients.reduce((sum, client) => {
                    if (client.last_invoice_date) {
                      return sum + getDaysSinceLastInvoice(client.last_invoice_date)
                    }
                    return sum
                  }, 0) / filteredClients.length,
                )}
              </div>
              <div className="text-sm text-pink-700">Avg Days Inactive</div>
              <div className="text-xs text-gray-500">since last invoice</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg border border-pink-200">
              <div className="text-2xl font-bold text-pink-600">
                {Math.round(stats.totalInvoices / stats.statusCounts.inactive)}
              </div>
              <div className="text-sm text-pink-700">Avg Past Invoices</div>
              <div className="text-xs text-gray-500">per inactive client</div>
            </div>
          </div>
          <p className="text-sm text-pink-700 mt-3">
            💡 <strong>Re-engagement Strategy:</strong> These inactive retail clients represent $
            {stats.totalRevenue.toLocaleString()} in dormant revenue. Consider targeted outreach campaigns to reactivate
            these relationships.
          </p>
        </CardContent>
      </Card>

      {/* Enhanced Quick Filter Buttons with Current State */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Active + Healthcare Filter - Available */}
        <Card className="bg-gradient-to-r from-red-50 to-pink-50 border-red-200 hover:shadow-md transition-all duration-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Heart className="h-5 w-5 text-red-600" />
              <h4 className="font-semibold text-red-900">Active + Healthcare</h4>
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              <Button
                size="sm"
                variant="outline"
                onClick={() => applyQuickFilter("active", "Healthcare")}
                className="border-red-300 text-red-700 hover:bg-red-100"
              >
                <Heart className="h-4 w-4 mr-1" />
                Apply Filter
              </Button>
              <Badge className="bg-green-100 text-green-800">Active</Badge>
              <Badge className="bg-red-100 text-red-800">Healthcare</Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-red-700">
                <strong>{activeHealthcarePreview.count} clients</strong> •{" "}
                <strong>${activeHealthcarePreview.revenue.toLocaleString()}</strong> revenue
              </p>
              <div className="text-xs text-red-600 space-y-1">
                {activeHealthcarePreview.clients.map((client, index) => (
                  <div key={client.id}>
                    • {client.name} ({client.company}) - ${client.total_amount.toLocaleString()}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inactive + Retail Filter - Currently Applied */}
        <Card className="bg-gradient-to-r from-pink-50 to-rose-50 border-pink-300 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <ShoppingCart className="h-5 w-5 text-pink-600" />
              <h4 className="font-semibold text-pink-900">Inactive + Retail</h4>
              <CheckCircle className="h-4 w-4 text-green-600" />
              <Badge className="bg-pink-100 text-pink-800 text-xs">APPLIED</Badge>
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              <Button size="sm" className="bg-pink-600 hover:bg-pink-700 text-white" disabled>
                <ShoppingCart className="h-4 w-4 mr-1" />
                Currently Applied
              </Button>
              <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
              <Badge className="bg-pink-100 text-pink-800">Retail</Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-pink-700">
                <strong>{inactiveRetailPreview.count} clients</strong> •{" "}
                <strong>${inactiveRetailPreview.revenue.toLocaleString()}</strong> revenue
              </p>
              <div className="text-xs text-pink-600 space-y-1">
                {inactiveRetailPreview.clients.map((client, index) => (
                  <div key={client.id}>
                    • {client.name} ({client.company}) - ${client.total_amount.toLocaleString()}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Search and Filter Controls */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search inactive retail clients by name, email, company, or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-pink-200 focus:border-pink-400"
            />
          </div>
          {onAddClient && (
            <Button onClick={onAddClient} className="w-full sm:w-auto bg-pink-600 hover:bg-pink-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Retail Client
            </Button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40 border-pink-200">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>

          <Select value={industryFilter} onValueChange={setIndustryFilter}>
            <SelectTrigger className="w-full sm:w-40 border-pink-200">
              <Building2 className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Industry" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Industries</SelectItem>
              {uniqueIndustries.map((industry) => (
                <SelectItem key={industry} value={industry}>
                  {industry}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-40 border-pink-200">
              <TrendingUp className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name A-Z</SelectItem>
              <SelectItem value="company">Company A-Z</SelectItem>
              <SelectItem value="total_amount">Revenue (High-Low)</SelectItem>
              <SelectItem value="total_invoices">Invoice Count</SelectItem>
              <SelectItem value="last_invoice">Recent Activity</SelectItem>
              <SelectItem value="created_at">Newest First</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={clearFilters}
            className="w-full sm:w-auto border-pink-300 text-pink-700 hover:bg-pink-50 bg-transparent"
          >
            <X className="h-4 w-4 mr-2" />
            Clear Filters
          </Button>
        </div>

        {/* Active Filters Display */}
        <div className="flex flex-wrap gap-2 p-3 bg-pink-50 rounded-lg border border-pink-200">
          <span className="text-sm font-medium text-pink-800">Active Filters:</span>
          <Badge variant="secondary" className="bg-pink-100 text-pink-800">
            Status: inactive
            <button onClick={() => setStatusFilter("all")} className="ml-1 hover:bg-pink-200 rounded-full p-0.5">
              <X className="h-3 w-3" />
            </button>
          </Badge>
          <Badge variant="secondary" className="bg-pink-100 text-pink-800">
            Industry: Retail
            <button onClick={() => setIndustryFilter("all")} className="ml-1 hover:bg-pink-200 rounded-full p-0.5">
              <X className="h-3 w-3" />
            </button>
          </Badge>
          {searchTerm.trim() && (
            <Badge variant="secondary" className="bg-pink-100 text-pink-800">
              Search: "{searchTerm}"
              <button onClick={() => setSearchTerm("")} className="ml-1 hover:bg-pink-200 rounded-full p-0.5">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      </div>

      {/* Enhanced Results Summary with Retail Focus */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-pink-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inactive Retail</p>
                <div className="text-2xl font-bold text-pink-600">{searchResults}</div>
                <p className="text-xs text-gray-500">dormant businesses</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-pink-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Dormant Revenue</p>
                <div className="text-2xl font-bold text-orange-600">${stats.totalRevenue.toLocaleString()}</div>
                <p className="text-xs text-gray-500">potential reactivation</p>
              </div>
              <DollarSign className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Past Invoices</p>
                <div className="text-2xl font-bold text-purple-600">{stats.totalInvoices}</div>
                <p className="text-xs text-gray-500">historical activity</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Revenue</p>
                <div className="text-2xl font-bold text-red-600">${Math.round(stats.avgRevenue).toLocaleString()}</div>
                <p className="text-xs text-gray-500">per inactive client</p>
              </div>
              <Store className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inactive Retail Client Cards */}
      <div className="grid gap-4">
        {filteredClients.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-16">
              <div className="text-center">
                <ShoppingCart className="h-16 w-16 text-pink-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No inactive retail clients found</h3>
                <p className="text-gray-600 mb-6 max-w-md">
                  No inactive retail clients match your current search criteria. Try adjusting your search terms.
                </p>
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <Button variant="outline" onClick={clearFilters}>
                    <X className="h-4 w-4 mr-2" />
                    Clear All Filters
                  </Button>
                  {onAddClient && (
                    <Button onClick={onAddClient} className="bg-pink-600 hover:bg-pink-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Retail Client
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredClients.map((client, index) => (
            <Card
              key={client.id}
              className="hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4 border-l-pink-500 hover:border-l-pink-600 bg-gradient-to-r from-pink-50/30 to-rose-50/30"
              onClick={() => onClientSelect?.(client)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    {/* Header with name and badges */}
                    <div className="flex items-start gap-3 flex-wrap">
                      <div className="flex items-center gap-2">
                        {index === 0 && (
                          <div className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full font-medium">
                            HIGHEST VALUE
                          </div>
                        )}
                        <h3 className="text-xl font-bold text-gray-900">{client.name}</h3>
                      </div>
                      <div className="flex gap-2">
                        <Badge className="bg-gray-100 text-gray-800 border-gray-200">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Inactive
                        </Badge>
                        <Badge className="bg-pink-100 text-pink-800 border-pink-200">
                          <ShoppingCart className="h-3 w-3 mr-1" />
                          Retail
                        </Badge>
                      </div>
                    </div>

                    {/* Company */}
                    <div className="flex items-center gap-2 text-gray-700">
                      <Building2 className="h-4 w-4 text-pink-400" />
                      <span className="font-medium">{client.company}</span>
                      <Store className="h-4 w-4 text-pink-400" />
                    </div>

                    {/* Contact Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span>{client.email}</span>
                      </div>
                      {client.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span>{client.phone}</span>
                        </div>
                      )}
                      {client.address && (
                        <div className="flex items-center gap-2 md:col-span-2">
                          <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          <span className="truncate">{client.address}</span>
                        </div>
                      )}
                    </div>

                    {/* Business Metrics */}
                    <div className="flex flex-wrap gap-4 pt-2 border-t border-pink-100">
                      <div className="flex items-center gap-1 text-sm">
                        <DollarSign className="h-4 w-4 text-orange-500" />
                        <span className="font-semibold text-orange-600">${client.total_amount.toLocaleString()}</span>
                        <span className="text-gray-500">dormant revenue</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <span className="font-semibold text-pink-600">{client.total_invoices}</span>
                        <span className="text-gray-500">past invoices</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">{client.payment_terms} days</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <span className="text-xs bg-pink-100 text-pink-800 px-2 py-1 rounded-full">
                          {client.last_invoice_date
                            ? `${getDaysSinceLastInvoice(client.last_invoice_date)} days inactive`
                            : "Long inactive"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Menu */}
                  <div className="flex flex-col items-end gap-2">
                    {client.last_invoice_date && (
                      <div className="text-right">
                        <div className="text-xs text-gray-400">Last Invoice</div>
                        <div className="text-sm font-medium text-gray-600">
                          {new Date(client.last_invoice_date).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-red-600 font-medium">
                          {getDaysSinceLastInvoice(client.last_invoice_date)} days ago
                        </div>
                      </div>
                    )}

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-pink-100">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>Re-engagement Actions</DropdownMenuLabel>
                        <DropdownMenuItem>
                          <Mail className="h-4 w-4 mr-2" />
                          Send Reactivation Email
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Plus className="h-4 w-4 mr-2" />
                          Create Follow-up Invoice
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Phone className="h-4 w-4 mr-2" />
                          Schedule Call
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>View Purchase History</DropdownMenuItem>
                        <DropdownMenuItem>Edit Client Info</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-green-600">Reactivate Client</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">Archive Client</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Retail Re-engagement Strategy */}
      <Card className="bg-gradient-to-r from-pink-50 to-rose-50 border-pink-200">
        <CardContent className="p-4">
          <div className="text-center">
            <h4 className="font-semibold text-pink-900 mb-2">Retail Re-engagement Strategy</h4>
            <p className="text-sm text-pink-700">
              Your {searchResults} inactive retail clients represent ${stats.totalRevenue.toLocaleString()} in dormant
              revenue potential. These businesses averaged {Math.round(stats.totalInvoices / searchResults)} invoices
              each, indicating established relationships worth reactivating. Consider targeted campaigns focusing on
              seasonal promotions, new product launches, or loyalty programs to re-engage these valuable retail
              partnerships.
            </p>
            <div className="flex justify-center gap-2 mt-4">
              <Button size="sm" className="bg-pink-600 hover:bg-pink-700">
                <Mail className="h-4 w-4 mr-1" />
                Send Bulk Reactivation
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-pink-300 text-pink-700 hover:bg-pink-100 bg-transparent"
              >
                <Phone className="h-4 w-4 mr-1" />
                Schedule Follow-ups
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
