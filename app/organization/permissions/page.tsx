import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { OrganizationLayout } from "@/components/organization-layout"

export default function PermissionsPage() {
  const roles = [
    {
      name: "Admin",
      description: "Full access to all features and settings.",
      permissions: {
        manageUsers: true,
        manageInvoices: true,
        viewReports: true,
        editSettings: true,
      },
    },
    {
      name: "Manager",
      description: "Manage invoices, view reports, and manage employees.",
      permissions: {
        manageUsers: true,
        manageInvoices: true,
        viewReports: true,
        editSettings: false,
      },
    },
    {
      name: "Employee",
      description: "Create invoices and track expenses.",
      permissions: {
        manageUsers: false,
        manageInvoices: true,
        viewReports: false,
        editSettings: false,
      },
    },
    {
      name: "Client",
      description: "View their own invoices and reports.",
      permissions: {
        manageUsers: false,
        manageInvoices: false,
        viewReports: true,
        editSettings: false,
      },
    },
  ]

  return (
    <OrganizationLayout>
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Permissions</h2>
        <Button>Save Changes</Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Role-Based Access Control</CardTitle>
          <CardDescription>
            Define and manage permissions for different user roles within your organization.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px]">Role</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-center">Manage Users</TableHead>
                <TableHead className="text-center">Manage Invoices</TableHead>
                <TableHead className="text-center">View Reports</TableHead>
                <TableHead className="text-center">Edit Settings</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role.name}>
                  <TableCell className="font-medium">{role.name}</TableCell>
                  <TableCell>{role.description}</TableCell>
                  <TableCell className="text-center">
                    <Switch checked={role.permissions.manageUsers} />
                  </TableCell>
                  <TableCell className="text-center">
                    <Switch checked={role.permissions.manageInvoices} />
                  </TableCell>
                  <TableCell className="text-center">
                    <Switch checked={role.permissions.viewReports} />
                  </TableCell>
                  <TableCell className="text-center">
                    <Switch checked={role.permissions.editSettings} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-semibold">Global Permissions</h3>
            <div className="flex items-center justify-between">
              <Label htmlFor="public-access">Allow Public Access to certain pages</Label>
              <Switch id="public-access" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="guest-invoicing">Enable Guest Invoicing</Label>
              <Switch id="guest-invoicing" />
            </div>
          </div>
        </CardContent>
      </Card>
    </OrganizationLayout>
  )
}
