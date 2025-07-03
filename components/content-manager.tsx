"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Edit, Trash2, Save, FileText, Globe, Tag, Eye, Upload, Download } from "lucide-react"

interface ContentItem {
  id: string
  title: string
  type: "page" | "post" | "component" | "translation"
  status: "published" | "draft" | "archived"
  content: string
  metadata: Record<string, any>
  createdAt: string
  updatedAt: string
  language: string
}

export function ContentManager() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)

  const contentTypes = [
    { id: "all", name: "Todos", icon: FileText },
    { id: "page", name: "Páginas", icon: Globe },
    { id: "post", name: "Posts", icon: FileText },
    { id: "component", name: "Componentes", icon: Tag },
    { id: "translation", name: "Traducciones", icon: Globe },
  ]

  const statusOptions = [
    { id: "all", name: "Todos" },
    { id: "published", name: "Publicado" },
    { id: "draft", name: "Borrador" },
    { id: "archived", name: "Archivado" },
  ]

  const contentItems: ContentItem[] = [
    {
      id: "1",
      title: "Página Principal",
      type: "page",
      status: "published",
      content: "Contenido de la página principal...",
      metadata: { slug: "/", template: "home" },
      createdAt: "2024-01-15",
      updatedAt: "2024-01-20",
      language: "es",
    },
    {
      id: "2",
      title: "Dashboard - Bienvenida",
      type: "component",
      status: "published",
      content: "Bienvenido a INVOXA",
      metadata: { component: "dashboard-welcome", section: "hero" },
      createdAt: "2024-01-10",
      updatedAt: "2024-01-18",
      language: "es",
    },
    {
      id: "3",
      title: "Términos y Condiciones",
      type: "page",
      status: "draft",
      content: "Términos y condiciones de uso...",
      metadata: { slug: "/terms", template: "legal" },
      createdAt: "2024-01-12",
      updatedAt: "2024-01-19",
      language: "es",
    },
    {
      id: "4",
      title: "Navigation Labels",
      type: "translation",
      status: "published",
      content: JSON.stringify({
        "nav.dashboard": "Dashboard",
        "nav.invoices": "Facturas",
        "nav.clients": "Clientes",
      }),
      metadata: { category: "navigation", language: "es" },
      createdAt: "2024-01-08",
      updatedAt: "2024-01-22",
      language: "es",
    },
  ]

  const filteredItems = contentItems.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedType === "all" || item.type === selectedType
    const matchesStatus = selectedStatus === "all" || item.status === selectedStatus
    return matchesSearch && matchesType && matchesStatus
  })

  const handleCreateContent = () => {
    // Logic to create new content
    setIsCreateDialogOpen(false)
  }

  const handleSaveContent = () => {
    // Logic to save content
    setIsEditMode(false)
  }

  const handleDeleteContent = (id: string) => {
    // Logic to delete content
  }

  const getStatusBadge = (status: ContentItem["status"]) => {
    const variants = {
      published: "default",
      draft: "secondary",
      archived: "outline",
    } as const

    return <Badge variant={variants[status]}>{status}</Badge>
  }

  const getTypeBadge = (type: ContentItem["type"]) => {
    const colors = {
      page: "bg-blue-100 text-blue-800",
      post: "bg-green-100 text-green-800",
      component: "bg-purple-100 text-purple-800",
      translation: "bg-orange-100 text-orange-800",
    }

    return <Badge className={colors[type]}>{type}</Badge>
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">Gestor de Contenido</h2>
            <p className="text-muted-foreground">Administra todo el contenido de la aplicación</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Importar
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Contenido
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Crear Nuevo Contenido</DialogTitle>
                  <DialogDescription>Crea una nueva página, componente o traducción</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="title" className="text-right">
                      Título
                    </Label>
                    <Input id="title" className="col-span-3" />
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
                        <SelectItem value="page">Página</SelectItem>
                        <SelectItem value="post">Post</SelectItem>
                        <SelectItem value="component">Componente</SelectItem>
                        <SelectItem value="translation">Traducción</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="content" className="text-right">
                      Contenido
                    </Label>
                    <Textarea id="content" className="col-span-3 h-32" />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateContent}>Crear</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar contenido..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {contentTypes.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((status) => (
                <SelectItem key={status.id} value={status.id}>
                  {status.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content Table */}
      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Idioma</TableHead>
              <TableHead>Actualizado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{item.title}</div>
                    <div className="text-sm text-muted-foreground truncate max-w-xs">
                      {item.content.substring(0, 50)}...
                    </div>
                  </div>
                </TableCell>
                <TableCell>{getTypeBadge(item.type)}</TableCell>
                <TableCell>{getStatusBadge(item.status)}</TableCell>
                <TableCell>
                  <Badge variant="outline">{item.language}</Badge>
                </TableCell>
                <TableCell>{item.updatedAt}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button size="sm" variant="outline" onClick={() => setSelectedItem(item)}>
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedItem(item)
                        setIsEditMode(true)
                      }}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDeleteContent(item.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No se encontró contenido</h3>
            <p className="text-muted-foreground mb-4">Intenta cambiar los filtros o crear nuevo contenido</p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Crear Contenido
            </Button>
          </div>
        )}
      </div>

      {/* Content Detail/Edit Dialog */}
      {selectedItem && (
        <Dialog
          open={!!selectedItem}
          onOpenChange={() => {
            setSelectedItem(null)
            setIsEditMode(false)
          }}
        >
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {isEditMode ? "Editar" : "Ver"} Contenido
                {getTypeBadge(selectedItem.type)}
                {getStatusBadge(selectedItem.status)}
              </DialogTitle>
              <DialogDescription>{isEditMode ? "Modifica el contenido" : "Detalles del contenido"}</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Título</Label>
                  {isEditMode ? (
                    <Input defaultValue={selectedItem.title} />
                  ) : (
                    <div className="p-2 bg-muted rounded">{selectedItem.title}</div>
                  )}
                </div>
                <div>
                  <Label>Idioma</Label>
                  {isEditMode ? (
                    <Select defaultValue={selectedItem.language}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="p-2 bg-muted rounded">{selectedItem.language}</div>
                  )}
                </div>
              </div>

              <div>
                <Label>Contenido</Label>
                {isEditMode ? (
                  <Textarea defaultValue={selectedItem.content} className="h-40" />
                ) : (
                  <div className="p-4 bg-muted rounded max-h-40 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm">{selectedItem.content}</pre>
                  </div>
                )}
              </div>

              <div>
                <Label>Metadatos</Label>
                <div className="p-4 bg-muted rounded">
                  <pre className="text-sm">{JSON.stringify(selectedItem.metadata, null, 2)}</pre>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div>Creado: {selectedItem.createdAt}</div>
                <div>Actualizado: {selectedItem.updatedAt}</div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedItem(null)
                  setIsEditMode(false)
                }}
              >
                {isEditMode ? "Cancelar" : "Cerrar"}
              </Button>
              {isEditMode ? (
                <Button onClick={handleSaveContent}>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar
                </Button>
              ) : (
                <Button onClick={() => setIsEditMode(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
