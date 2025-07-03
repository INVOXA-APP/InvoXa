import { Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getContactSubmissions, getContactSubmissionStats } from "@/app/contact/actions"
import { Users, AlertTriangle, Clock, TrendingUp, Mail, Phone, Building, Calendar } from "lucide-react"
import type { ContactSubmission } from "@/types/contact"

function getPriorityColor(priority: string) {
  switch (priority) {
    case "urgent":
      return "bg-red-100 text-red-800 border-red-200"
    case "high":
      return "bg-orange-100 text-orange-800 border-orange-200"
    case "medium":
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    case "low":
      return "bg-green-100 text-green-800 border-green-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case "new":
      return "bg-blue-100 text-blue-800 border-blue-200"
    case "contacted":
      return "bg-purple-100 text-purple-800 border-purple-200"
    case "qualified":
      return "bg-indigo-100 text-indigo-800 border-indigo-200"
    case "converted":
      return "bg-green-100 text-green-800 border-green-200"
    case "closed":
      return "bg-gray-100 text-gray-800 border-gray-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

async function ContactStats() {
  const stats = await getContactSubmissionStats()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total_submissions}</div>
          <p className="text-xs text-muted-foreground">All time submissions</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">New Leads</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.new_leads}</div>
          <p className="text-xs text-muted-foreground">Last 7 days</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">High Priority</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{stats.high_priority}</div>
          <p className="text-xs text-muted-foreground">Needs immediate attention</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Overdue Follow-ups</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">{stats.overdue_followups}</div>
          <p className="text-xs text-muted-foreground">Past due date</p>
        </CardContent>
      </Card>
    </div>
  )
}

async function ContactSubmissionsTable() {
  const { submissions, error } = await getContactSubmissions()

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">Error loading contact submissions: {error}</div>
        </CardContent>
      </Card>
    )
  }

  if (!submissions || submissions.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">No contact submissions found.</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Contact Submissions</CardTitle>
          <div className="flex items-center gap-2">
            <Input placeholder="Search submissions..." className="w-64" />
            <Button variant="outline" size="sm">
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contact</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Follow-up</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.map((submission: ContactSubmission) => (
                <TableRow key={submission.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">
                        {submission.first_name} {submission.last_name}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Mail className="h-3 w-3" />
                        {submission.email}
                      </div>
                      {submission.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Phone className="h-3 w-3" />
                          {submission.phone}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-gray-400" />
                      {submission.company}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs">
                      <div className="font-medium">{submission.subject}</div>
                      <div className="text-sm text-gray-500 truncate">{submission.message}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getPriorityColor(submission.priority)}>{submission.priority}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(submission.status)}>{submission.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{submission.assigned_to}</div>
                  </TableCell>
                  <TableCell>
                    {submission.follow_up_date && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-3 w-3" />
                        {new Date(submission.follow_up_date).toLocaleDateString()}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        Reply
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-500">
            Showing {submissions.length} of {submissions.length} submissions
          </div>
          <div className="text-sm text-gray-500">
            Total Revenue: <span className="font-medium">$158,000</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function ContactsPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Contact Management</h1>
            <p className="text-gray-600">Manage and track all contact form submissions</p>
          </div>
          <Button>
            <Mail className="w-4 h-4 mr-2" />
            Send Bulk Email
          </Button>
        </div>

        <Suspense
          fallback={
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          }
        >
          <ContactStats />
        </Suspense>

        <Suspense
          fallback={
            <Card>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-12 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          }
        >
          <ContactSubmissionsTable />
        </Suspense>
      </div>
    </div>
  )
}
