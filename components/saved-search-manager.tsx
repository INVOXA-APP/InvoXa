"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Bookmark,
  Plus,
  Search,
  Star,
  StarOff,
  MoreVertical,
  Edit,
  Copy,
  Trash2,
  Filter,
  Calendar,
  TrendingUp,
  Clock,
  Tag,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type {
  SavedSearch,
  CreateSavedSearchData,
  UpdateSavedSearchData,
  SavedSearchStats,
  SearchFilters,
} from "@/types/saved-search"
import {
  getSavedSearches,
  createSavedSearch,
  updateSavedSearch,
  deleteSavedSearch,
  incrementSearchUsage,
  getSavedSearchStats,
  duplicateSavedSearch,
} from "@/app/dashboard/ai-assistant/saved-search-actions"

interface SavedSearchManagerProps {
  currentQuery?: string
  currentFilters?: SearchFilters
  onApplySearch: (query: string, filters: SearchFilters) => void
  onSaveCurrentSearch?: () => void
}

const CATEGORIES = ["General", "Invoices", "Expenses", "Clients", "Reports", "Tasks", "Meetings", "Analytics"]

export function SavedSearchManager({
  currentQuery = "",
  currentFilters = {},
  onApplySearch,
  onSaveCurrentSearch,
}: SavedSearchManagerProps) {
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([])
  const [stats, setStats] = useState<SavedSearchStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showStatsDialog, setShowStatsDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedSearch, setSelectedSearch] = useState<SavedSearch | null>(null)
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const [formData, setFormData] = useState<CreateSavedSearchData>({
    name: "",
    description: "",
    query: "",
    filters: {},
    category: "General",
    is_favorite: false,
  })

  const { toast } = useToast()

  useEffect(() => {
    loadSavedSearches()
    loadStats()
  }, [])

  const loadSavedSearches = async () => {
    try {
      setIsLoading(true)
      const searches = await getSavedSearches()
      setSavedSearches(searches)
    } catch (error) {
      console.error("Error loading saved searches:", error)
      toast({
        title: "Error",
        description: "Failed to load saved searches",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const searchStats = await getSavedSearchStats()
      setStats(searchStats)
    } catch (error) {
      console.error("Error loading stats:", error)
    }
  }

  const handleCreateSearch = async () => {
    if (!formData.name.trim() || !formData.query.trim()) {
      toast({
        title: "Validation Error",
        description: "Name and query are required",
        variant: "destructive",
      })
      return
    }

    try {
      await createSavedSearch(formData)
      await loadSavedSearches()
      await loadStats()
      setShowCreateDialog(false)
      resetForm()
      toast({
        title: "Success",
        description: "Search saved successfully",
      })
    } catch (error) {
      console.error("Error creating saved search:", error)
      toast({
        title: "Error",
        description: "Failed to save search",
        variant: "destructive",
      })
    }
  }

  const handleUpdateSearch = async () => {
    if (!selectedSearch || !formData.name.trim()) return

    try {
      const updateData: UpdateSavedSearchData = {
        name: formData.name,
        description: formData.description,
        query: formData.query,
        filters: formData.filters,
        category: formData.category,
        is_favorite: formData.is_favorite,
      }

      await updateSavedSearch(selectedSearch.id, updateData)
      await loadSavedSearches()
      await loadStats()
      setShowEditDialog(false)
      setSelectedSearch(null)
      resetForm()
      toast({
        title: "Success",
        description: "Search updated successfully",
      })
    } catch (error) {
      console.error("Error updating saved search:", error)
      toast({
        title: "Error",
        description: "Failed to update search",
        variant: "destructive",
      })
    }
  }

  const handleDeleteSearch = async () => {
    if (!selectedSearch) return

    try {
      await deleteSavedSearch(selectedSearch.id)
      await loadSavedSearches()
      await loadStats()
      setShowDeleteDialog(false)
      setSelectedSearch(null)
      toast({
        title: "Success",
        description: "Search deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting saved search:", error)
      toast({
        title: "Error",
        description: "Failed to delete search",
        variant: "destructive",
      })
    }
  }

  const handleApplySearch = async (search: SavedSearch) => {
    try {
      await incrementSearchUsage(search.id)
      onApplySearch(search.query, search.filters)
      await loadSavedSearches() // Refresh to show updated usage
      toast({
        title: "Search Applied",
        description: `Applied "${search.name}"`,
      })
    } catch (error) {
      console.error("Error applying search:", error)
      onApplySearch(search.query, search.filters) // Still apply the search
    }
  }

  const handleToggleFavorite = async (search: SavedSearch) => {
    try {
      await updateSavedSearch(search.id, { is_favorite: !search.is_favorite })
      await loadSavedSearches()
      await loadStats()
      toast({
        title: "Success",
        description: search.is_favorite ? "Removed from favorites" : "Added to favorites",
      })
    } catch (error) {
      console.error("Error toggling favorite:", error)
      toast({
        title: "Error",
        description: "Failed to update favorite status",
        variant: "destructive",
      })
    }
  }

  const handleDuplicateSearch = async (search: SavedSearch) => {
    try {
      const newName = `${search.name} (Copy)`
      await duplicateSavedSearch(search.id, newName)
      await loadSavedSearches()
      await loadStats()
      toast({
        title: "Success",
        description: "Search duplicated successfully",
      })
    } catch (error) {
      console.error("Error duplicating search:", error)
      toast({
        title: "Error",
        description: "Failed to duplicate search",
        variant: "destructive",
      })
    }
  }

  const handleSaveCurrentSearch = () => {
    setFormData({
      name: `Search: ${currentQuery.slice(0, 30)}${currentQuery.length > 30 ? "..." : ""}`,
      description: "",
      query: currentQuery,
      filters: currentFilters,
      category: "General",
      is_favorite: false,
    })
    setShowCreateDialog(true)
  }

  const handleEditSearch = (search: SavedSearch) => {
    setSelectedSearch(search)
    setFormData({
      name: search.name,
      description: search.description || "",
      query: search.query,
      filters: search.filters,
      category: search.category || "General",
      is_favorite: search.is_favorite,
    })
    setShowEditDialog(true)
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      query: "",
      filters: {},
      category: "General",
      is_favorite: false,
    })
  }

  const filteredSearches = savedSearches.filter((search) => {
    if (showFavoritesOnly && !search.is_favorite) return false
    if (filterCategory !== "all" && search.category !== filterCategory) return false
    if (
      searchQuery &&
      !search.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !search.query.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false
    return true
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bookmark className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Saved Searches</h3>
          <Badge variant="secondary">{savedSearches.length}</Badge>
        </div>
        <div className="flex items-center gap-2">
          {currentQuery && (
            <Button variant="outline" size="sm" onClick={handleSaveCurrentSearch} className="text-xs bg-transparent">
              <Plus className="w-3 h-3 mr-1" />
              Save Current
            </Button>
          )}
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-1" />
                New Search
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Save New Search</DialogTitle>
                <DialogDescription>Create a saved search for quick access later</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Recent Invoice Discussions"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Optional description..."
                    rows={2}
                  />
                </div>
                <div>
                  <Label htmlFor="query">Search Query *</Label>
                  <Input
                    id="query"
                    value={formData.query}
                    onChange={(e) => setFormData({ ...formData, query: e.target.value })}
                    placeholder="Enter search terms..."
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="favorite"
                    checked={formData.is_favorite}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_favorite: checked })}
                  />
                  <Label htmlFor="favorite">Add to favorites</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateSearch}>Save Search</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog open={showStatsDialog} onOpenChange={setShowStatsDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <TrendingUp className="w-4 h-4 mr-1" />
                Stats
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Search Statistics</DialogTitle>
                <DialogDescription>Overview of your saved searches usage</DialogDescription>
              </DialogHeader>
              {stats && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                      <div className="text-sm text-blue-800">Total Searches</div>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">{stats.favorites}</div>
                      <div className="text-sm text-yellow-800">Favorites</div>
                    </div>
                  </div>

                  {Object.keys(stats.categories).length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Categories</h4>
                      <div className="space-y-2">
                        {Object.entries(stats.categories).map(([category, count]) => (
                          <div key={category} className="flex justify-between items-center">
                            <span className="text-sm">{category}</span>
                            <Badge variant="secondary">{count}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {stats.mostUsed.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Most Used</h4>
                      <div className="space-y-2">
                        {stats.mostUsed.slice(0, 3).map((search) => (
                          <div key={search.id} className="flex justify-between items-center text-sm">
                            <span className="truncate flex-1">{search.name}</span>
                            <Badge variant="outline">{search.usage_count} uses</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2">
          <Switch id="favorites-only" checked={showFavoritesOnly} onCheckedChange={setShowFavoritesOnly} />
          <Label htmlFor="favorites-only" className="text-sm">
            Favorites only
          </Label>
        </div>
        <div className="flex-1 max-w-xs">
          <Input
            placeholder="Search saved searches..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="text-sm"
          />
        </div>
      </div>

      {/* Saved Searches List */}
      <ScrollArea className="h-96 border rounded-lg">
        <div className="p-4 space-y-3">
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading saved searches...</div>
          ) : filteredSearches.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {savedSearches.length === 0 ? "No saved searches yet" : "No searches match your filters"}
            </div>
          ) : (
            filteredSearches.map((search) => (
              <div key={search.id} className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium truncate">{search.name}</h4>
                      {search.is_favorite && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                      {search.category && (
                        <Badge variant="outline" className="text-xs">
                          <Tag className="w-2 h-2 mr-1" />
                          {search.category}
                        </Badge>
                      )}
                    </div>
                    {search.description && <p className="text-sm text-gray-600 mb-2">{search.description}</p>}
                    <div className="text-sm text-gray-800 bg-gray-100 rounded px-2 py-1 mb-2 font-mono">
                      {search.query}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        {search.usage_count} uses
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {search.last_used_at ? formatDate(search.last_used_at) : "Never used"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(search.created_at)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleApplySearch(search)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Search className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleFavorite(search)}
                      className={search.is_favorite ? "text-yellow-600" : "text-gray-400"}
                    >
                      {search.is_favorite ? <Star className="w-4 h-4 fill-current" /> : <StarOff className="w-4 h-4" />}
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditSearch(search)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicateSearch(search)}>
                          <Copy className="w-4 h-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedSearch(search)
                            setShowDeleteDialog(true)
                          }}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Saved Search</DialogTitle>
            <DialogDescription>Update your saved search details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="edit-query">Search Query *</Label>
              <Input
                id="edit-query"
                value={formData.query}
                onChange={(e) => setFormData({ ...formData, query: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-favorite"
                checked={formData.is_favorite}
                onCheckedChange={(checked) => setFormData({ ...formData, is_favorite: checked })}
              />
              <Label htmlFor="edit-favorite">Favorite</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateSearch}>Update Search</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Saved Search</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedSearch?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSearch} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
