"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Save, TestTube, MessageSquare, User, Bot, Clock, AlertCircle, CheckCircle, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createSearchTemplate, updateSearchTemplate } from "@/app/dashboard/ai-assistant/search-template-actions"
import { searchConversations } from "@/app/dashboard/ai-assistant/actions"
import type { SearchTemplate, SearchTemplateFormData } from "@/types/search-template"
import type { SearchResult, SearchFilters } from "@/types/conversation"

interface SearchTemplateCreatorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  template?: SearchTemplate | null
  onSave?: (template: SearchTemplate) => void
}

export function SearchTemplateCreator({ open, onOpenChange, template, onSave }: SearchTemplateCreatorProps) {
  const [formData, setFormData] = useState<SearchTemplateFormData>({
    name: "",
    description: "",
    query: "",
    category: "general",
    filters: {},
    tags: [],
    is_public: false,
  })

  const [testResults, setTestResults] = useState<SearchResult[]>([])
  const [isTestingTemplate, setIsTestingTemplate] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [newTag, setNewTag] = useState("")

  const { toast } = useToast()

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name,
        description: template.description || "",
        query: template.query,
        category: template.category,
        filters: template.filters || {},
        tags: template.tags || [],
        is_public: template.is_public || false,
      })
    } else {
      // Reset form for new template
      setFormData({
        name: "",
        description: "",
        query: "",
        category: "general",
        filters: {},
        tags: [],
        is_public: false,
      })
    }
    setTestResults([])
    setShowPreview(false)
  }, [template, open])

  const handleInputChange = (field: keyof SearchTemplateFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleFilterChange = (filterKey: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      filters: {
        ...prev.filters,
        [filterKey]: value,
      },
    }))
  }

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }))
      setNewTag("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }))
  }

  const handleTestTemplate = async () => {
    if (!formData.query.trim()) {
      toast({
        title: "No Query",
        description: "Please enter a search query to test",
        variant: "destructive",
      })
      return
    }

    setIsTestingTemplate(true)
    try {
      const { results } = await searchConversations(formData.query, formData.filters as SearchFilters)
      setTestResults(results.slice(0, 10)) // Show first 10 results
      setShowPreview(true)

      toast({
        title: "Test Complete",
        description: `Found ${results.length} results`,
      })
    } catch (error) {
      console.error("Error testing template:", error)
      toast({
        title: "Test Failed",
        description: "Failed to test the search template",
        variant: "destructive",
      })
    } finally {
      setIsTestingTemplate(false)
    }
  }

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.query.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both a name and search query",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      let savedTemplate: SearchTemplate

      if (template) {
        savedTemplate = await updateSearchTemplate(template.id, formData)
        toast({
          title: "Template Updated",
          description: `"${formData.name}" has been updated successfully`,
        })
      } else {
        savedTemplate = await createSearchTemplate(formData)
        toast({
          title: "Template Created",
          description: `"${formData.name}" has been created successfully`,
        })
      }

      onSave?.(savedTemplate)
      onOpenChange(false)
    } catch (error: any) {
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save the search template",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const categories = [
    { value: "general", label: "General" },
    { value: "invoices", label: "Invoices" },
    { value: "clients", label: "Clients" },
    { value: "expenses", label: "Expenses" },
    { value: "reports", label: "Reports" },
    { value: "meetings", label: "Meetings" },
    { value: "projects", label: "Projects" },
    { value: "tasks", label: "Tasks" },
  ]

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getResultSnippet = (result: SearchResult) => {
    const content = result.message_content || result.session_title || ""
    return content.length > 100 ? content.substring(0, 100) + "..." : content
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{template ? "Edit Search Template" : "Create Search Template"}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="query">Query & Filters</TabsTrigger>
            <TabsTrigger value="test">Test & Preview</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[60vh] mt-4">
            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Template Name *</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="e.g., Overdue Invoices Search"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Describe what this template searches for and when to use it..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Tags</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => handleRemoveTag(tag)} />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        handleAddTag()
                      }
                    }}
                  />
                  <Button type="button" onClick={handleAddTag} variant="outline">
                    Add
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="query" className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search Query *</label>
                <Textarea
                  value={formData.query}
                  onChange={(e) => handleInputChange("query", e.target.value)}
                  placeholder='Enter search terms, e.g., "overdue invoice" or "client onboarding"'
                  rows={3}
                />
                <div className="text-xs text-gray-500">
                  Use quotes for exact phrases, separate multiple terms with spaces
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-medium">Search Filters</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Message Type</label>
                    <Select
                      value={formData.filters.messageRole || "all"}
                      onValueChange={(value) => handleFilterChange("messageRole", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Messages</SelectItem>
                        <SelectItem value="user">User Messages</SelectItem>
                        <SelectItem value="assistant">AI Responses</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Minimum Messages</label>
                    <Input
                      type="number"
                      value={formData.filters.minMessageCount || ""}
                      onChange={(e) =>
                        handleFilterChange(
                          "minMessageCount",
                          e.target.value ? Number.parseInt(e.target.value) : undefined,
                        )
                      }
                      placeholder="e.g., 5"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Content Requirements</label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="hasActionItems"
                        checked={formData.filters.hasActionItems || false}
                        onCheckedChange={(checked) => handleFilterChange("hasActionItems", !!checked)}
                      />
                      <label htmlFor="hasActionItems" className="text-sm">
                        Must have action items
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="hasSummary"
                        checked={formData.filters.hasSummary || false}
                        onCheckedChange={(checked) => handleFilterChange("hasSummary", !!checked)}
                      />
                      <label htmlFor="hasSummary" className="text-sm">
                        Must have summary
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="test" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Test Your Template</h3>
                <Button
                  onClick={handleTestTemplate}
                  disabled={isTestingTemplate || !formData.query.trim()}
                  variant="outline"
                >
                  {isTestingTemplate ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                      Testing...
                    </>
                  ) : (
                    <>
                      <TestTube className="w-4 h-4 mr-2" />
                      Run Test
                    </>
                  )}
                </Button>
              </div>

              {showPreview && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-medium">Test Results</span>
                    <Badge variant="secondary">{testResults.length} results</Badge>
                  </div>

                  {testResults.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No results found with current query and filters</p>
                      <p className="text-sm mt-1">Try adjusting your search terms or filters</p>
                    </div>
                  ) : (
                    <ScrollArea className="h-64 border rounded-lg p-4">
                      <div className="space-y-3">
                        {testResults.map((result, index) => (
                          <div key={index} className="border-b border-gray-100 pb-3 last:border-b-0">
                            <div className="flex items-start justify-between mb-1">
                              <h4 className="font-medium text-sm">{result.session_title}</h4>
                              <Badge variant="outline" className="text-xs">
                                Rank: {result.search_rank.toFixed(2)}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{getResultSnippet(result)}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Clock className="w-3 h-3" />
                              <span>{formatDate(result.session_created_at)}</span>
                              {result.match_type === "message" && (
                                <>
                                  {result.message_role === "user" ? (
                                    <User className="w-3 h-3 text-blue-600" />
                                  ) : (
                                    <Bot className="w-3 h-3 text-purple-600" />
                                  )}
                                  <span>Message match</span>
                                </>
                              )}
                              {result.match_type === "session" && (
                                <>
                                  <MessageSquare className="w-3 h-3" />
                                  <span>Session match</span>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isPublic"
                    checked={formData.is_public}
                    onCheckedChange={(checked) => handleInputChange("is_public", !!checked)}
                  />
                  <label htmlFor="isPublic" className="text-sm font-medium">
                    Make this template public
                  </label>
                </div>
                <div className="text-xs text-gray-500 ml-6">
                  Public templates can be used by other team members and may appear in the template gallery
                </div>

                <Separator />

                <div className="space-y-2">
                  <h3 className="font-medium">Template Summary</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Name:</span>
                      <span className="text-sm font-medium">{formData.name || "Untitled"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Category:</span>
                      <span className="text-sm">{categories.find((c) => c.value === formData.category)?.label}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Query:</span>
                      <span className="text-sm font-mono bg-white px-2 py-1 rounded">
                        {formData.query || "No query"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Filters:</span>
                      <span className="text-sm">{Object.keys(formData.filters).length} active</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Tags:</span>
                      <span className="text-sm">{formData.tags.length} tags</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </ScrollArea>

          <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving || !formData.name.trim() || !formData.query.trim()}>
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {template ? "Update Template" : "Create Template"}
                </>
              )}
            </Button>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
