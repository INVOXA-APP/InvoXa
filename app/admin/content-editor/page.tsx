import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AdminLayout } from "@/components/admin-layout"

export default function ContentEditorPage() {
  return (
    <AdminLayout>
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Content Editor</h2>
        <Button>Save Content</Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Edit Website Content</CardTitle>
          <CardDescription>Manage and update various sections of your website.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-2">
            <Label htmlFor="page-select">Select Page</Label>
            <Select defaultValue="homepage">
              <SelectTrigger id="page-select">
                <SelectValue placeholder="Select a page" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="homepage">Homepage</SelectItem>
                <SelectItem value="about">About Us</SelectItem>
                <SelectItem value="contact">Contact</SelectItem>
                <SelectItem value="features">Features</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="section-title">Section Title</Label>
            <Input
              id="section-title"
              placeholder="Enter section title"
              defaultValue="AI-Powered Invoicing & Business Management"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="section-content">Section Content</Label>
            <Textarea
              id="section-content"
              placeholder="Enter section content"
              rows={10}
              defaultValue="Streamline your business operations with intelligent invoicing, expense tracking, client management, and more."
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="image-upload">Upload Image</Label>
            <Input id="image-upload" type="file" />
            <p className="text-sm text-muted-foreground">Current Image: /futuristic-network-background.png</p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="cta-text">Call to Action Text</Label>
            <Input id="cta-text" placeholder="e.g., Get Started" defaultValue="Get Started" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="cta-link">Call to Action Link</Label>
            <Input id="cta-link" placeholder="e.g., /register" defaultValue="/register" />
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  )
}
