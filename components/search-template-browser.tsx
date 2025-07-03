"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Search,
  Grid,
  List,
  Star,
  Clock,
  Tag,
  MoreVertical,
  Copy,
  Edit,
  Trash2,
  Play,
  FileText,
  Users,
  Receipt,
  BarChart,
  CheckSquare,
  Video,
  Shield,
  Monitor,
  TrendingUp,
  Sparkles,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  getSearchTemplates,
  getSearchTemplateCategories,
  getPopularSearchTemplates,
  incrementTemplateUsage,
  duplicateSearchTemplate,
  deleteSearchTemplate,
} from "@/app/dashboard/ai-assistant/search-template-actions"
import type { SearchTemplate, SearchTemplateCategory } from "@/types/search-template"

interface SearchTemplateBrowserProps {
  onTemplateSelect?: (template: SearchTemplate) => void
  onTemplateEdit?: (template: SearchTemplate) => void
}

const categoryIcons: Record<string, any> = {
  "Invoice Management": FileText,
  "Client Management": Users,
  "Expense Management": Receipt,
  "Financial Reports": BarChart,
  "Task Management": CheckSquare,
  Meetings: Video,
  Compliance: Shield,
  Technology: Monitor,
  "Business Development": TrendingUp,
}

export function SearchTemplateBrowser({ onTemplateSelect, onTemplateEdit }: SearchTemplateBrowserProps) {
  const [templates, setTemplates] = useState<SearchTemplate[]>([])
  const [categories, setCategories] = useState<SearchTemplateCategory[]>([])
  const [popularTemplates, setPopularTemplates] = useState<SearchTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showSystemOnly, setShowSystemOnly] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    filterTemplates()
  }, [searchTerm, selectedCategory, showSystemOnly])

  const loadData = async () => {
    try {
      setLoading(true)
      const [templatesData, categoriesData, popularData] = await Promise.all([
        getSearchTemplates(),
        getSearchTemplateCategories(),
        getPopularSearchTemplates(8),
      ])

      setTemplates(templatesData)
      setCategories(categoriesData)
      setPopularTemplates(popularData)
    } catch (error) {
      console.error("Error loading templates:", error)
      toast({
        title: "Error",
        description: "Failed to load search templates",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filterTemplates = async () => {
    try {
      const filters: any = {}

      if (selectedCategory !== "all") {
        filters.category = selectedCategory
      }

      if (showSystemOnly) {
        filters.is_system = true
      }

      if (searchTerm) {
        filters.search = searchTerm
      }

      const filteredData = await getSearchTemplates(filters)
      setTemplates(filteredData)
    } catch (error) {
      console.error("Error filtering templates:", error)
    }
  }

  const handleTemplateUse = async (template: SearchTemplate) => {
    try {
      await incrementTemplateUsage(template.id)
      onTemplateSelect?.(template)
      toast({
        title: "Template Applied",
        description: `Applied "${template.name}" search template`,
      })
    } catch (error) {
      console.error("Error using template:", error)
      toast({
        title: "Error",
        description: "Failed to apply template",
        variant: "destructive",
      })
    }
  }

  const handleTemplateDuplicate = async (template: SearchTemplate) => {
    try {
      const duplicated = await duplicateSearchTemplate(template.id)
      if (duplicated) {
        await loadData()
        toast({
          title: "Template Duplicated",
          description: `Created copy: "${duplicated.name}"`,
        })
      }
    } catch (error) {
      console.error("Error duplicating template:", error)
      toast({
        title: "Error",
        description: "Failed to duplicate template",
        variant: "destructive",
      })
    }
  }

  const handleTemplateDelete = async (template: SearchTemplate) => {
    if (template.is_system) {
      toast({
        title: "Cannot Delete",
        description: "System templates cannot be deleted",
        variant: "destructive",
      })
      return
    }

    try {
      await deleteSearchTemplate(template.id)
      await loadData()
      toast({
        title: "Template Deleted",
        description: `Deleted "${template.name}"`,
      })
    } catch (error) {
      console.error("Error deleting template:", error)
      toast({
        title: "Error",
        description: "Failed to delete template",
        variant: "destructive",
      })
    }
  }

  const getTemplateIcon = (template: SearchTemplate) => {
    const IconComponent = categoryIcons[template.category]
    return IconComponent ? <IconComponent className="w-4 h-4" /> : <FileText className="w-4 h-4" />
  }

  const getColorClass = (color: string | null) => {
    const colorMap: Record<string, string> = {
      red: "border-red-200 bg-red-50",
      blue: "border-blue-200 bg-blue-50",
      green: "border-green-200 bg-green-50",
      orange: "border-orange-200 bg-orange-50",
      purple: "border-purple-200 bg-purple-50",
      indigo: "border-indigo-200 bg-indigo-50",
      pink: "border-pink-200 bg-pink-50",
      yellow: "border-yellow-200 bg-yellow-50",
      gray: "border-gray-200 bg-gray-50",
    }
    return colorMap[color || "gray"] || "border-gray-200 bg-gray-50"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-500">Loading templates...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Search Templates</h2>
          <p className="text-gray-600">Predefined searches for common business scenarios</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}>
            {viewMode === "grid" ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Popular Templates */}
      {popularTemplates.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-5 h-5 text-yellow-500" />
            <h3 className="text-lg font-semibold">Popular Templates</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {popularTemplates.map((template) => (
              <Card
                key={template.id}
                className={`cursor-pointer hover:shadow-md transition-shadow ${getColorClass(template.color)}`}
                onClick={() => handleTemplateUse(template)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getTemplateIcon(template)}
                      <span className="font-medium text-sm">{template.name}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {template.usage_count}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-2">{template.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.name} value={category.name}>
                <div className="flex items-center gap-2">
                  <span>{category.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    {category.count}
                  </Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant={showSystemOnly ? "default" : "outline"}
          onClick={() => setShowSystemOnly(!showSystemOnly)}
          className="flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          System Only
        </Button>
      </div>

      {/* Templates */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All Templates ({templates.length})</TabsTrigger>
          <TabsTrigger value="system">System ({templates.filter((t) => t.is_system).length})</TabsTrigger>
          <TabsTrigger value="custom">Custom ({templates.filter((t) => !t.is_system).length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <TemplateGrid
            templates={templates}
            viewMode={viewMode}
            onTemplateUse={handleTemplateUse}
            onTemplateEdit={onTemplateEdit}
            onTemplateDuplicate={handleTemplateDuplicate}
            onTemplateDelete={handleTemplateDelete}
            getTemplateIcon={getTemplateIcon}
            getColorClass={getColorClass}
          />
        </TabsContent>

        <TabsContent value="system" className="mt-6">
          <TemplateGrid
            templates={templates.filter((t) => t.is_system)}
            viewMode={viewMode}
            onTemplateUse={handleTemplateUse}
            onTemplateEdit={onTemplateEdit}
            onTemplateDuplicate={handleTemplateDuplicate}
            onTemplateDelete={handleTemplateDelete}
            getTemplateIcon={getTemplateIcon}
            getColorClass={getColorClass}
          />
        </TabsContent>

        <TabsContent value="custom" className="mt-6">
          <TemplateGrid
            templates={templates.filter((t) => !t.is_system)}
            viewMode={viewMode}
            onTemplateUse={handleTemplateUse}
            onTemplateEdit={onTemplateEdit}
            onTemplateDuplicate={handleTemplateDuplicate}
            onTemplateDelete={handleTemplateDelete}
            getTemplateIcon={getTemplateIcon}
            getColorClass={getColorClass}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface TemplateGridProps {
  templates: SearchTemplate[]
  viewMode: "grid" | "list"
  onTemplateUse: (template: SearchTemplate) => void
  onTemplateEdit?: (template: SearchTemplate) => void
  onTemplateDuplicate: (template: SearchTemplate) => void
  onTemplateDelete: (template: SearchTemplate) => void
  getTemplateIcon: (template: SearchTemplate) => React.ReactNode
  getColorClass: (color: string | null) => string
}

function TemplateGrid({
  templates,
  viewMode,
  onTemplateUse,
  onTemplateEdit,
  onTemplateDuplicate,
  onTemplateDelete,
  getTemplateIcon,
  getColorClass,
}: TemplateGridProps) {
  if (templates.length === 0) {
    return (
      <div className="text-center py-12">
        <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
        <p className="text-gray-500">Try adjusting your search or filters</p>
      </div>
    )
  }

  if (viewMode === "list") {
    return (
      <div className="space-y-2">
        {templates.map((template) => (
          <Card key={template.id} className="hover:shadow-sm transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className={`p-2 rounded-lg ${getColorClass(template.color)}`}>{getTemplateIcon(template)}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{template.name}</h4>
                      {template.is_system && (
                        <Badge variant="secondary" className="text-xs">
                          <Sparkles className="w-2 h-2 mr-1" />
                          System
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {template.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{template.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Used {template.usage_count} times
                      </span>
                      {template.tags.length > 0 && (
                        <span className="flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          {template.tags.slice(0, 3).join(", ")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={() => onTemplateUse(template)}>
                    <Play className="w-3 h-3 mr-1" />
                    Use
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onTemplateDuplicate(template)}>
                        <Copy className="w-4 h-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      {!template.is_system && onTemplateEdit && (
                        <DropdownMenuItem onClick={() => onTemplateEdit(template)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      {!template.is_system && (
                        <DropdownMenuItem onClick={() => onTemplateDelete(template)} className="text-red-600">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {templates.map((template) => (
        <Card
          key={template.id}
          className={`cursor-pointer hover:shadow-md transition-shadow ${getColorClass(template.color)}`}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                {getTemplateIcon(template)}
                <CardTitle className="text-base">{template.name}</CardTitle>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <MoreVertical className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onTemplateUse(template)}>
                    <Play className="w-4 h-4 mr-2" />
                    Use Template
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onTemplateDuplicate(template)}>
                    <Copy className="w-4 h-4 mr-2" />
                    Duplicate
                  </DropdownMenuItem>
                  {!template.is_system && onTemplateEdit && (
                    <DropdownMenuItem onClick={() => onTemplateEdit(template)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  {!template.is_system && (
                    <DropdownMenuItem onClick={() => onTemplateDelete(template)} className="text-red-600">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex items-center gap-2">
              {template.is_system && (
                <Badge variant="secondary" className="text-xs">
                  <Sparkles className="w-2 h-2 mr-1" />
                  System
                </Badge>
              )}
              <Badge variant="outline" className="text-xs">
                {template.category}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {template.usage_count} uses
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <CardDescription className="mb-3 line-clamp-2">{template.description}</CardDescription>
            <div className="space-y-2">
              <div className="text-xs text-gray-600">
                <strong>Query:</strong> {template.query}
              </div>
              {template.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {template.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {template.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{template.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}
            </div>
            <Button className="w-full mt-4" size="sm" onClick={() => onTemplateUse(template)}>
              <Play className="w-3 h-3 mr-1" />
              Use Template
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
