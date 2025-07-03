import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"

export default function ContentPage() {
  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Content Management</h1>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Content
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Blog Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 dark:text-gray-400">Manage your blog articles and news updates.</p>
            <Button variant="outline" className="mt-4 bg-transparent">
              View Blog Posts
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pages</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 dark:text-gray-400">Edit static pages like About Us, Contact, etc.</p>
            <Button variant="outline" className="mt-4 bg-transparent">
              View Pages
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Media Library</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 dark:text-gray-400">Upload and manage images, videos, and other files.</p>
            <Button variant="outline" className="mt-4 bg-transparent">
              View Media
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
