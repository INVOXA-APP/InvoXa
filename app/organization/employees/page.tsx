import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { PlusIcon, SearchIcon, FilterIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { OrganizationLayout } from "@/components/organization-layout"

export default function EmployeesPage() {
  const employees = [
    {
      id: "E001",
      name: "Alice Johnson",
      email: "alice@acmecorp.com",
      role: "Manager",
      status: "Active",
    },
    {
      id: "E002",
      name: "Bob Williams",
      email: "bob@acmecorp.com",
      role: "Sales",
      status: "Active",
    },
    {
      id: "E003",
      name: "Charlie Brown",
      email: "charlie@acmecorp.com",
      role: "Marketing",
      status: "Active",
    },
    {
      id: "E004",
      name: "Diana Prince",
      email: "diana@acmecorp.com",
      role: "HR",
      status: "Active",
    },
    {
      id: "E005",
      name: "Eve Adams",
      email: "eve@acmecorp.com",
      role: "Finance",
      status: "Inactive",
    },
  ]

  return (
    <OrganizationLayout>
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Employees</h2>
        <Button>
          <PlusIcon className="mr-2 h-4 w-4" />
          Add New Employee
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Employee Directory</CardTitle>
          <CardDescription>Manage your organization's employees.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center py-4">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search employees..." className="max-w-sm pl-8" />
            </div>
            <div className="ml-auto flex items-center space-x-2">
              <Button variant="outline">
                <FilterIcon className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium">{employee.id}</TableCell>
                  <TableCell>{employee.name}</TableCell>
                  <TableCell>{employee.email}</TableCell>
                  <TableCell>{employee.role}</TableCell>
                  <TableCell>{employee.status}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm">
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </OrganizationLayout>
  )
}
