"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { shareSearchPattern } from "@/app/dashboard/team-search/actions"
import type { SharePatternRequest } from "@/types/team-search"

interface SharePatternDialogProps {
  onClose: () => void
  onSuccess: () => void
}

export function SharePatternDialog({ onClose, onSuccess }: SharePatternDialogProps) {
  const [formData, setFormData] = useState<SharePatternRequest>({
    pattern_name: "",
    search_query: "",
    description: "",
    category: "",
    tags: [],
    is_public: false,
  })
  const [tagInput, setTagInput] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { toast } = useToast()

  const categories = ["invoices", "clients", "expenses", "reports", "analytics", "general"]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.pattern_name.trim() || !formData.search_query.trim()) {
      toast({
        title: "Validation Error",
        description: "Pattern name and search query are required",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const result = await shareSearchPattern(formData)

      if (result) {
        toast({
          title: "Pattern Shared Successfully",
          description: `Your search pattern "${formData.pattern_name}" has been shared with the team`,
        })
        onSuccess()
        onClose()
      } else {
        throw new Error("Failed to share pattern")
      }
    } catch (error) {
      console.error("Error sharing pattern:", error)
      toast({
        title: "Error",
        description: "Failed to share search pattern. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const addTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()],
      }))
      setTagInput("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags?.filter((tag) => tag !== tagToRemove) || [],
    }))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addTag()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="pattern_name">Pattern Name *</Label>
          <Input
            id="pattern_name"
            placeholder="e.g., Invoice Status Quick Search"
            value={formData.pattern_name}
            onChange={(e) => setFormData((prev) => ({ ...prev, pattern_name: e.target.value }))}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="search_query">Search Query *</Label>
          <Textarea
            id="search_query"
            placeholder="e.g., status:pending payment_date:<30days client:enterprise"
            value={formData.search_query}
            onChange={(e) => setFormData((prev) => ({ ...prev, search_query: e.target.value }))}
            rows={3}
            required
          />
          <p className="text-xs text-gray-500">The exact search query that works well for you</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Explain when and how to use this search pattern..."
            value={formData.description}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Tags</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Add tags..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <Button type="button" variant="outline" onClick={addTag}>
              Add
            </Button>
          </div>
          {formData.tags && formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {formData.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => removeTag(tag)} />
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="is_public">Make Public</Label>
            <p className="text-xs text-gray-500">Allow all team members to see and use this pattern</p>
          </div>
          <Switch
            id="is_public"
            checked={formData.is_public}
            onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_public: checked }))}
          />
        </div>

        {formData.is_public && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Public patterns require approval before being visible to all team members. Private
              patterns are immediately available to you.
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Sharing..." : "Share Pattern"}
        </Button>
      </div>
    </form>
  )
}
