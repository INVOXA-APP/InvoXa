import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { AdminLayout } from "@/components/admin-layout"

export default function AppSettingsPage() {
  return (
    <AdminLayout>
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">App Settings</h2>
        <Button>Save Settings</Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>General Application Settings</CardTitle>
          <CardDescription>Configure global settings for your Invoxa application.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-2">
            <Label htmlFor="app-name">Application Name</Label>
            <Input id="app-name" defaultValue="Invoxa" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="default-currency">Default Currency</Label>
            <Input id="default-currency" defaultValue="USD" />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="dark-mode">Enable Dark Mode</Label>
            <Switch id="dark-mode" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="user-registration">Allow User Registration</Label>
            <Switch id="user-registration" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="email-notifications">Enable Email Notifications</Label>
            <Switch id="email-notifications" defaultChecked />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="admin-email">Admin Contact Email</Label>
            <Input id="admin-email" type="email" defaultValue="admin@invoxa.com" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="support-url">Support URL</Label>
            <Input id="support-url" defaultValue="https://support.invoxa.com" />
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  )
}
