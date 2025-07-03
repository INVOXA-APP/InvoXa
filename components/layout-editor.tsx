"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import {
  Plus,
  Layout,
  Grid,
  Sidebar,
  HeadingIcon as Header,
  Edit,
  Save,
  Settings,
  Monitor,
  Smartphone,
  Tablet,
} from "lucide-react"

interface LayoutTemplate {
  id: string
  name: string
  description: string
  type: "dashboard" | "landing" | "auth" | "admin"
  structure: {
    header: boolean
    sidebar: boolean
    footer: boolean
    columns: number
    sections: string[]
  }
  styles: Record<string, string>
  isActive: boolean
  isCustom: boolean
}

export function LayoutEditor() {
  const [selectedLayout, setSelectedLayout] = useState<LayoutTemplate | null>(null)
  const [previewMode, setPreviewMode] = useState<"desktop" | "tablet" | "mobile">("desktop")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)

  const layoutTemplates: LayoutTemplate[] = [
    {
      id: "1",
      name: "Dashboard Principal",
      description: "Layout principal del dashboard con sidebar y header",
      type: "dashboard",
      structure: {
        header: true,
        sidebar: true,
        footer: false,
        columns: 1,
        sections: ["header", "sidebar", "main"],
      },
      styles: {
        headerHeight: "64px",
        sidebarWidth: "256px",
        backgroundColor: "#ffffff",
        textColor: "#000000",
      },
      isActive: true,
      isCustom: false,
    },
    {
      id: "2",
      name: "Página de Autenticación",
      description: "Layout centrado para login y registro",
      type: "auth",
      structure: {
        header: false,
        sidebar: false,
        footer: true,
        columns: 1,
        sections: ["main", "footer"],
      },
      styles: {
        backgroundColor: "#f8f9fa",
        textColor: "#000000",
        centerContent: "true",
      },
      isActive: false,
      isCustom: false,
    },
    {
      id: "3",
      name: "Landing Page",
      description: "Layout para página principal con hero y secciones",
      type: "landing",
      structure: {
        header: true,
        sidebar: false,
        footer: true,
        columns: 1,
        sections: ["header", "hero", "features", "cta", "footer"],
      },
      styles: {
        headerHeight: "80px",
        backgroundColor: "#ffffff",
        textColor: "#000000",
      },
      isActive: false,
      isCustom: false,
    },
    {
      id: "4",
      name: "Admin Panel",
      description: "Layout personalizado para administración",
      type: "admin",
      structure: {
        header: true,
        sidebar: true,
        footer: false,
        columns: 2,
        sections: ["header", "sidebar", "main", "aside"],
      },
      styles: {
        headerHeight: "72px",
        sidebarWidth: "280px",
        backgroundColor: "#fafafa",
        textColor: "#1a1a1a",
      },
      isActive: false,
      isCustom: true,
    },
  ]

  const layoutTypes = [
    { id: "dashboard", name: "Dashboard", icon: Layout },
    { id: "landing", name: "Landing", icon: Grid },
    { id: "auth", name: "Autenticación", icon: Header },
    { id: "admin", name: "Admin", icon: Settings },
  ]

  const handleCreateLayout = () => {
    // Logic to create new layout
    setIsCreateDialogOpen(false)
  }

  const handleSaveLayout = () => {
    // Logic to save layout
    setIsEditMode(false)
  }

  const handleDeleteLayout = (id: string) => {
    // Logic to delete layout
  }

  const handleActivateLayout = (id: string) => {
    // Logic to activate layout
  }

  const renderLayoutPreview = (layout: LayoutTemplate) => {
    const { structure } = layout

    return (
      <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
        {structure.header && (
          <div className="h-8 bg-gray-200 border-b flex items-center px-2">
            <div className="text-xs text-gray-600">Header</div>
          </div>
        )}
        <div className="flex" style={{ minHeight: "120px" }}>
          {structure.sidebar && (
            <div className="w-16 bg-gray-100 border-r flex items-center justify-center">
              <div className="text-xs text-gray-600 transform -rotate-90">Sidebar</div>
            </div>
          )}
          <div className="flex-1 p-2">
            <div className="text-xs text-gray-600 mb-1">Main Content</div>
            <div className="space-y-1">
              {structure.sections
                .filter((s) => !["header", "sidebar", "footer"].includes(s))
                .map((section) => (
                  <div key={section} className="h-4 bg-gray-100 rounded text-xs flex items-center px-1">
                    {section}
                  </div>
                ))}
            </div>
          </div>
        </div>
        {structure.footer && (
          <div className="h-6 bg-gray-200 border-t flex items-center px-2">
            <div className="text-xs text-gray-600">Footer</div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="h-full flex">
      {/* Left Sidebar - Layout List */}
      <div className="w-80 border-r bg-card">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Editor de Layouts</h3>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Crear
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Crear Nuevo Layout</DialogTitle>
                  <DialogDescription>Crea un layout personalizado para tu aplicación</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Nombre
                    </Label>
                    <Input id="name" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="type" className="text-right">
                      Tipo
                    </Label>
                    <Select>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {layoutTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">
                      Descripción
                    </Label>
                    <Input id="description" className="col-span-3" />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateLayout}>Crear Layout</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <ScrollArea className="h-[calc(100vh-12rem)]">
            <div className="space-y-3">
              {layoutTemplates.map((layout) => (
                <Card
                  key={layout.id}
                  className={`cursor-pointer transition-all ${
                    selectedLayout?.id === layout.id ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => setSelectedLayout(layout)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">{layout.name}</CardTitle>
                      <div className="flex gap-1">
                        {layout.isActive && (
                          <Badge variant="default" className="text-xs">
                            Activo
                          </Badge>
                        )}
                        {layout.isCustom && (
                          <Badge variant="secondary" className="text-xs">
                            Custom
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CardDescription className="text-xs">{layout.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="mb-2">{renderLayoutPreview(layout)}</div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-xs bg-transparent"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedLayout(layout)
                          setIsEditMode(true)
                        }}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Editar
                      </Button>
                      {!layout.isActive && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs bg-transparent"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleActivateLayout(layout.id)
                          }}
                        >
                          Activar
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Main Content - Layout Editor */}
      <div className="flex-1 flex flex-col">
        {selectedLayout ? (
          <>
            {/* Header */}
            <div className="border-b bg-card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">{selectedLayout.name}</h2>
                  <p className="text-muted-foreground">{selectedLayout.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant={previewMode === "desktop" ? "default" : "outline"}
                      onClick={() => setPreviewMode("desktop")}
                    >
                      <Monitor className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant={previewMode === "tablet" ? "default" : "outline"}
                      onClick={() => setPreviewMode("tablet")}
                    >
                      <Tablet className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant={previewMode === "mobile" ? "default" : "outline"}
                      onClick={() => setPreviewMode("mobile")}
                    >
                      <Smartphone className="h-4 w-4" />
                    </Button>
                  </div>
                  <Separator orientation="vertical" className="h-6" />
                  <Button
                    size="sm"
                    variant={isEditMode ? "default" : "outline"}
                    onClick={() => setIsEditMode(!isEditMode)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    {isEditMode ? "Vista Previa" : "Editar"}
                  </Button>
                  {isEditMode && (
                    <Button size="sm" onClick={handleSaveLayout}>
                      <Save className="h-4 w-4 mr-2" />
                      Guardar
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex">
              {/* Layout Preview/Editor */}
              <div className="flex-1 p-6 bg-muted/20">
                <div
                  className={`mx-auto bg-white border shadow-lg transition-all duration-300 ${
                    previewMode === "desktop"
                      ? "w-full h-full"
                      : previewMode === "tablet"
                        ? "w-[768px] h-[600px]"
                        : "w-[375px] h-[600px]"
                  }`}
                >
                  {/* Layout Structure Visualization */}
                  <div className="h-full flex flex-col">
                    {selectedLayout.structure.header && (
                      <div
                        className="bg-gray-100 border-b flex items-center px-4"
                        style={{ height: selectedLayout.styles.headerHeight || "64px" }}
                      >
                        <div className="text-sm text-gray-600">Header Section</div>
                      </div>
                    )}

                    <div className="flex-1 flex">
                      {selectedLayout.structure.sidebar && (
                        <div
                          className="bg-gray-50 border-r flex flex-col items-center justify-center"
                          style={{ width: selectedLayout.styles.sidebarWidth || "256px" }}
                        >
                          <Sidebar className="h-8 w-8 text-gray-400 mb-2" />
                          <div className="text-xs text-gray-600">Sidebar</div>
                        </div>
                      )}

                      <div className="flex-1 p-6">
                        <div className="space-y-4">
                          {selectedLayout.structure.sections
                            .filter((s) => !["header", "sidebar", "footer"].includes(s))
                            .map((section) => (
                              <div
                                key={section}
                                className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center"
                              >
                                <div className="text-gray-600 capitalize">{section} Section</div>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>

                    {selectedLayout.structure.footer && (
                      <div className="bg-gray-100 border-t flex items-center px-4 h-16">
                        <div className="text-sm text-gray-600">Footer Section</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Properties Panel */}
              {isEditMode && (
                <div className="w-80 border-l bg-card">
                  <div className="p-4">
                    <h3 className="font-semibold mb-4">Propiedades del Layout</h3>

                    <Tabs defaultValue="structure" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="structure">Estructura</TabsTrigger>
                        <TabsTrigger value="styles">Estilos</TabsTrigger>
                      </TabsList>

                      <TabsContent value="structure" className="space-y-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm">Header</Label>
                            <input type="checkbox" checked={selectedLayout.structure.header} className="rounded" />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label className="text-sm">Sidebar</Label>
                            <input type="checkbox" checked={selectedLayout.structure.sidebar} className="rounded" />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label className="text-sm">Footer</Label>
                            <input type="checkbox" checked={selectedLayout.structure.footer} className="rounded" />
                          </div>
                          <div>
                            <Label className="text-sm">Columnas</Label>
                            <Input
                              type="number"
                              value={selectedLayout.structure.columns}
                              min="1"
                              max="4"
                              className="mt-1"
                            />
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="styles" className="space-y-4">
                        <div className="space-y-3">
                          <div>
                            <Label className="text-sm">Color de Fondo</Label>
                            <Input
                              type="color"
                              value={selectedLayout.styles.backgroundColor || "#ffffff"}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-sm">Color de Texto</Label>
                            <Input type="color" value={selectedLayout.styles.textColor || "#000000"} className="mt-1" />
                          </div>
                          {selectedLayout.structure.header && (
                            <div>
                              <Label className="text-sm">Altura del Header</Label>
                              <Input value={selectedLayout.styles.headerHeight || "64px"} className="mt-1" />
                            </div>
                          )}
                          {selectedLayout.structure.sidebar && (
                            <div>
                              <Label className="text-sm">Ancho del Sidebar</Label>
                              <Input value={selectedLayout.styles.sidebarWidth || "256px"} className="mt-1" />
                            </div>
                          )}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Layout className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Selecciona un Layout</h3>
              <p className="text-muted-foreground">Elige un layout de la lista para editarlo o crear uno nuevo</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
