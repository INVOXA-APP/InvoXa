"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit, Trash2, Plus, Upload, Save, X } from "lucide-react"
import { getContent, updateContent, deleteContent, uploadFile, createContent, type ContentItem } from "./actions"
import { useToast } from "@/hooks/use-toast"

export default function CMSPage() {
  const [content, setContent] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null)
  const [editValue, setEditValue] = useState("")
  const [newKey, setNewKey] = useState("")
  const [newValue, setNewValue] = useState("")
  const [newType, setNewType] = useState<"text" | "image" | "html">("text")
  const [uploading, setUploading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadContent()
  }, [])

  const loadContent = async () => {
    try {
      const data = await getContent()
      setContent(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load content",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (item: ContentItem) => {
    setEditingItem(item)
    setEditValue(item.value)
  }

  const handleSave = async () => {
    if (!editingItem) return

    try {
      await updateContent(editingItem.key, editValue, editingItem.type)
      setContent(
        content.map((item) =>
          item.key === editingItem.key ? { ...item, value: editValue, updated_at: new Date().toISOString() } : item,
        ),
      )
      setEditingItem(null)
      setEditValue("")
      toast({
        title: "Success",
        description: "Content updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update content",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (key: string) => {
    if (!confirm("Are you sure you want to delete this content?")) return

    try {
      await deleteContent(key)
      setContent(content.filter((item) => item.key !== key))
      toast({
        title: "Success",
        description: "Content deleted successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete content",
        variant: "destructive",
      })
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const result = await uploadFile(formData)
      setNewValue(result.url)
      setNewType("image")

      toast({
        title: "Success",
        description: "File uploaded successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleCreate = async () => {
    if (!newKey || !newValue) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    try {
      await createContent(newKey, newValue, newType)
      const newItem: ContentItem = {
        id: Date.now().toString(),
        key: newKey,
        value: newValue,
        type: newType,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      setContent([...content, newItem])
      setNewKey("")
      setNewValue("")
      setNewType("text")

      toast({
        title: "Success",
        description: "Content created successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create content",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading CMS...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Content Management System</h1>
          <p className="text-gray-600">Manage your website content, images, and settings</p>
        </div>

        <Tabs defaultValue="content" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="files">Files</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-6">
            {/* Create New Content */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Create New Content
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    placeholder="Content key (e.g., hero.title)"
                    value={newKey}
                    onChange={(e) => setNewKey(e.target.value)}
                  />
                  <Select value={newType} onValueChange={(value: "text" | "image" | "html") => setNewType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="html">HTML</SelectItem>
                      <SelectItem value="image">Image</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Create
                  </Button>
                </div>

                {newType === "html" ? (
                  <Textarea
                    placeholder="Content value"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    rows={4}
                  />
                ) : (
                  <Input placeholder="Content value" value={newValue} onChange={(e) => setNewValue(e.target.value)} />
                )}
              </CardContent>
            </Card>

            {/* Content List */}
            <div className="grid gap-4">
              {content.map((item) => (
                <Card key={item.key} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900">{item.key}</h3>
                          <Badge
                            variant={item.type === "text" ? "default" : item.type === "image" ? "secondary" : "outline"}
                          >
                            {item.type}
                          </Badge>
                        </div>

                        {editingItem?.key === item.key ? (
                          <div className="space-y-3">
                            {item.type === "html" ? (
                              <Textarea
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                rows={4}
                                className="w-full"
                              />
                            ) : (
                              <Input
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="w-full"
                              />
                            )}
                            <div className="flex gap-2">
                              <Button onClick={handleSave} size="sm" className="bg-green-600 hover:bg-green-700">
                                <Save className="w-4 h-4 mr-1" />
                                Save
                              </Button>
                              <Button onClick={() => setEditingItem(null)} size="sm" variant="outline">
                                <X className="w-4 h-4 mr-1" />
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            {item.type === "image" ? (
                              <img
                                src={item.value || "/placeholder.svg"}
                                alt={item.key}
                                className="max-w-xs h-auto rounded-lg mb-2"
                              />
                            ) : (
                              <p className="text-gray-700 mb-2 break-words">
                                {item.value.length > 200 ? `${item.value.substring(0, 200)}...` : item.value}
                              </p>
                            )}
                            <p className="text-sm text-gray-500">
                              Updated: {new Date(item.updated_at).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 ml-4">
                        <Button
                          onClick={() => handleEdit(item)}
                          size="sm"
                          variant="outline"
                          disabled={editingItem?.key === item.key}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleDelete(item.key)}
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="files" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Upload Files
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                    accept="image/*,video/*,.pdf,.doc,.docx"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-900 mb-2">
                      {uploading ? "Uploading..." : "Click to upload files"}
                    </p>
                    <p className="text-gray-500">Support for images, videos, PDFs, and documents</p>
                  </label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Site Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Site Title</label>
                    <Input placeholder="Enter site title" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Site Description</label>
                    <Textarea placeholder="Enter site description" rows={3} />
                  </div>
                  <Button className="bg-blue-600 hover:bg-blue-700">Save Settings</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
