"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import {
  Upload,
  Download,
  Search,
  Filter,
  FolderPlus,
  File,
  Folder,
  ImageIcon,
  FileText,
  Music,
  Video,
  Archive,
  Trash2,
  Share,
  Eye,
  MoreHorizontal,
} from "lucide-react"

interface FileItem {
  id: string
  name: string
  type: "file" | "folder"
  mimeType?: string
  size: number
  createdAt: string
  updatedAt: string
  path: string
  isPublic: boolean
  downloadCount: number
  thumbnail?: string
}

export function FileManager() {
  const [currentPath, setCurrentPath] = useState("/")
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchTerm, setSearchTerm] = useState("")
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false)

  const files: FileItem[] = [
    {
      id: "1",
      name: "Documentos",
      type: "folder",
      size: 0,
      createdAt: "2024-01-15",
      updatedAt: "2024-01-25",
      path: "/documentos",
      isPublic: false,
      downloadCount: 0,
    },
    {
      id: "2",
      name: "Imágenes",
      type: "folder",
      size: 0,
      createdAt: "2024-01-10",
      updatedAt: "2024-01-26",
      path: "/imagenes",
      isPublic: true,
      downloadCount: 0,
    },
    {
      id: "3",
      name: "logo-invoxa.png",
      type: "file",
      mimeType: "image/png",
      size: 45678,
      createdAt: "2024-01-20",
      updatedAt: "2024-01-20",
      path: "/imagenes/logo-invoxa.png",
      isPublic: true,
      downloadCount: 156,
      thumbnail: "/placeholder.svg?height=100&width=100&text=Logo",
    },
    {
      id: "4",
      name: "manual-usuario.pdf",
      type: "file",
      mimeType: "application/pdf",
      size: 2345678,
      createdAt: "2024-01-18",
      updatedAt: "2024-01-22",
      path: "/documentos/manual-usuario.pdf",
      isPublic: false,
      downloadCount: 89,
    },
    {
      id: "5",
      name: "presentacion.pptx",
      type: "file",
      mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      size: 5678901,
      createdAt: "2024-01-16",
      updatedAt: "2024-01-24",
      path: "/documentos/presentacion.pptx",
      isPublic: false,
      downloadCount: 34,
    },
    {
      id: "6",
      name: "backup.zip",
      type: "file",
      mimeType: "application/zip",
      size: 123456789,
      createdAt: "2024-01-25",
      updatedAt: "2024-01-25",
      path: "/backup.zip",
      isPublic: false,
      downloadCount: 12,
    },
  ]

  const getFileIcon = (file: FileItem) => {
    if (file.type === "folder") return Folder

    if (file.mimeType?.startsWith("image/")) return ImageIcon
    if (file.mimeType?.startsWith("video/")) return Video
    if (file.mimeType?.startsWith("audio/")) return Music
    if (file.mimeType === "application/pdf") return FileText
    if (file.mimeType?.includes("zip") || file.mimeType?.includes("archive")) return Archive

    return File
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const handleFileSelect = (fileId: string) => {
    setSelectedFiles((prev) => (prev.includes(fileId) ? prev.filter((id) => id !== fileId) : [...prev, fileId]))
  }

  const handleUpload = () => {
    setIsUploadDialogOpen(false)
  }

  const handleCreateFolder = () => {
    setIsCreateFolderOpen(false)
  }

  const handleDeleteFiles = () => {
    // Logic to delete selected files
    setSelectedFiles([])
  }

  const filteredFiles = files.filter((file) => file.name.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">Gestor de Archivos</h2>
            <p className="text-muted-foreground">Administra todos los archivos y recursos de la aplicación</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <FolderPlus className="h-4 w-4 mr-2" />
                  Nueva Carpeta
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Crear Nueva Carpeta</DialogTitle>
                  <DialogDescription>Ingresa el nombre de la nueva carpeta</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="folderName" className="text-right">
                      Nombre
                    </Label>
                    <Input id="folderName" className="col-span-3" placeholder="Mi nueva carpeta" />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateFolderOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateFolder}>Crear Carpeta</Button>
                </div>
              </DialogContent>
            </Dialog>
            <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Subir Archivos
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Subir Archivos</DialogTitle>
                  <DialogDescription>Arrastra archivos aquí o haz clic para seleccionar</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                    <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-2">Arrastra archivos aquí o haz clic para seleccionar</p>
                    <Button variant="outline">Seleccionar Archivos</Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Carpeta de destino</Label>
                      <Input value={currentPath} readOnly />
                    </div>
                    <div>
                      <Label>Visibilidad</Label>
                      <select className="w-full p-2 border rounded">
                        <option value="private">Privado</option>
                        <option value="public">Público</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleUpload}>Subir Archivos</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar archivos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-64"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {selectedFiles.length > 0 && (
              <>
                <Badge variant="secondary">{selectedFiles.length} seleccionados</Badge>
                <Button variant="outline" size="sm" onClick={handleDeleteFiles}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Descargar
                </Button>
              </>
            )}
            <div className="flex border rounded-lg">
              <Button variant={viewMode === "grid" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("grid")}>
                Grid
              </Button>
              <Button variant={viewMode === "list" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("list")}>
                Lista
              </Button>
            </div>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
          <Button variant="ghost" size="sm" onClick={() => setCurrentPath("/")}>
            Inicio
          </Button>
          {currentPath !== "/" && (
            <>
              <span>/</span>
              <span>{currentPath.split("/").filter(Boolean).join(" / ")}</span>
            </>
          )}
        </div>
      </div>

      {/* File Content */}
      <div className="flex-1 p-6">
        {viewMode === "grid" ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredFiles.map((file) => {
              const Icon = getFileIcon(file)
              const isSelected = selectedFiles.includes(file.id)

              return (
                <Card
                  key={file.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${isSelected ? "ring-2 ring-primary" : ""}`}
                  onClick={() => handleFileSelect(file.id)}
                >
                  <CardContent className="p-4">
                    <div className="text-center">
                      {file.thumbnail ? (
                        <img
                          src={file.thumbnail || "/placeholder.svg"}
                          alt={file.name}
                          className="w-16 h-16 mx-auto mb-2 rounded object-cover"
                        />
                      ) : (
                        <Icon className="w-16 h-16 mx-auto mb-2 text-muted-foreground" />
                      )}
                      <div className="text-sm font-medium truncate" title={file.name}>
                        {file.name}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {file.type === "file" ? formatFileSize(file.size) : "Carpeta"}
                      </div>
                      <div className="flex items-center justify-center gap-1 mt-2">
                        {file.isPublic && (
                          <Badge variant="outline" className="text-xs">
                            Público
                          </Badge>
                        )}
                        {file.downloadCount > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {file.downloadCount} descargas
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={selectedFiles.length === filteredFiles.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedFiles(filteredFiles.map((f) => f.id))
                        } else {
                          setSelectedFiles([])
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Tamaño</TableHead>
                  <TableHead>Modificado</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFiles.map((file) => {
                  const Icon = getFileIcon(file)
                  const isSelected = selectedFiles.includes(file.id)

                  return (
                    <TableRow key={file.id} className={isSelected ? "bg-muted/50" : ""}>
                      <TableCell>
                        <input type="checkbox" checked={isSelected} onChange={() => handleFileSelect(file.id)} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{file.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {file.type === "folder" ? "Carpeta" : file.mimeType?.split("/")[1] || "Archivo"}
                        </Badge>
                      </TableCell>
                      <TableCell>{file.type === "file" ? formatFileSize(file.size) : "-"}</TableCell>
                      <TableCell>{file.updatedAt}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {file.isPublic && (
                            <Badge variant="outline" className="text-xs">
                              Público
                            </Badge>
                          )}
                          {file.downloadCount > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {file.downloadCount}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Share className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {filteredFiles.length === 0 && (
          <div className="text-center py-12">
            <File className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No se encontraron archivos</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? "Intenta cambiar los términos de búsqueda" : "Esta carpeta está vacía"}
            </p>
            <Button onClick={() => setIsUploadDialogOpen(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Subir Archivos
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
