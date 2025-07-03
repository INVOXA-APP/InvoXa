"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Plus, Info } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createSearchTemplate } from "@/app/dashboard/team-search/actions"
import type { CreateTemplateRequest } from "@/types/team-search"

interface CreateTemplateDialogProps {
  onClose: () => void
  onSuccess: () => void
}

export function CreateTemplateDialog({ onClose, onSuccess }: CreateTemplateDialogProps) {
  const [formData, setFormData] = useState<CreateTemplateRequest>({
    template_name: "",
    template_query: "",
    description: "",
    category: "",
    variables: {},
    usage_instructions: "",
    is_public: false,
  })
  const [variableName, setVariableName] = useState("")
  const [variableDescription, setVariableDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { toast } = useToast()

  const categories = ["invoices", "clients", "expenses", "reports", "analytics", "general"]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.template_name.trim() || !formData.template_query.trim()) {
      toast({
        title: "Validation Error",
        description: "Template name and query are required",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const result = await createSearchTemplate(formData)

      if (result) {
        toast({
          title: "Template Created Successfully",
          description: `Your search template "${formData.template_name}" has been created`,
        })
        onSuccess()
        onClose()
      } else {
        throw new Error("Failed to create template")
      }
    } catch (error) {
      console.error("Error creating template:", error)
      toast({
        title: "Error",
        description: "Failed to create search template. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const addVariable = () => {
    if (variableName.trim() && !formData.variables?.[variableName.trim()]) {
      setFormData((prev) => ({
        ...prev,
        variables: {
          ...prev.variables,
          [variableName.trim()]: {
            description: variableDescription.trim() || "No description",
            type: "string",
            required: true,
          },
        },
      }))
      setVariableName("")
      setVariableDescription("")
    }
  }

  const removeVariable = (variableToRemove: string) => {
    setFormData((prev) => {
      const newVariables = { ...prev.variables }
      delete newVariables[variableToRemove]
      return {
        ...prev,
        variables: newVariables,
      }
    })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addVariable()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[80vh] overflow-y-auto">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="template_name">Template Name *</Label>
          <Input
            id="template_name"
            placeholder="e.g., Client Payment Status Template"
            value={formData.template_name}
            onChange={(e) => setFormData((prev) => ({ ...prev, template_name: e.target.value }))}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="template_query">Template Query *</Label>
          <Textarea
            id="template_query"
            placeholder="e.g., client:{{client_name}} status:{{status}} date:{{date_range}}"
            value={formData.template_query}
            onChange={(e) => setFormData((prev) => ({ ...prev, template_query: e.target.value }))}
            rows={3}
            required
          />
          <p className="text-xs text-gray-500">
            Use {"{{variable_name}}"} syntax for variables that users can customize
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Explain what this template does and when to use it..."
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

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Info className="w-4 h-4" />
              Template Variables
            </CardTitle>
            <CardDescription>Define variables that users can customize when using this template</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Variable name (e.g., client_name)"
                value={variableName}
                onChange={(e) => setVariableName(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <Input
                placeholder="Description"
                value={variableDescription}
                onChange={(e) => setVariableDescription(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <Button type="button" variant="outline" onClick={addVariable}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {Object.keys(formData.variables || {}).length > 0 && (
              <div className="space-y-2">
                <Label>Defined Variables:</Label>
                <div className="space-y-2">
                  {Object.entries(formData.variables || {}).map(([name, config]) => (
                    <div key={name} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <span className="font-medium">{"{{" + name + "}}"}</span>
                        <p className="text-xs text-gray-500">{config.description}</p>
                      </div>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeVariable(name)}>
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-2">
          <Label htmlFor="usage_instructions">Usage Instructions</Label>
          <Textarea
            id="usage_instructions"
            placeholder="Step-by-step instructions on how to use this template effectively..."
            value={formData.usage_instructions}
            onChange={(e) => setFormData((prev) => ({ ...prev, usage_instructions: e.target.value }))}
            rows={3}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="is_public">Make Public</Label>
            <p className="text-xs text-gray-500">Allow all team members to see and use this template</p>
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
              <strong>Note:</strong> Public templates require approval before being visible to all team members. You can
              still use your own templates immediately.
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Template"}
        </Button>
      </div>
    </form>
  )
}
