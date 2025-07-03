"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Trash2, Copy, Type, MousePointer, Layers, Grid } from "lucide-react"

interface PageElement {
  id: string
  type: "text" | "button" | "card" | "image" | "form" | "table"
  content: string
  styles: Record<string, string>
  position: { x: number; y: number }
  size: { width: number; height: number }
}

export function VisualEditor() {
  const [selectedPage, setSelectedPage] = useState("dashboard")
  const [selectedElement, setSelectedElement] = useState<string | null>(null)
  const [elements, setElements] = useState<PageElement[]>([
    {
      id: "1",
      type: "text",
      content: "Bienvenido a INVOXA",
      styles: { fontSize: "24px", fontWeight: "bold", color: "#000" },
      position: { x: 50, y: 50 },
      size: { width: 300, height: 40 },
    },
    {
      id: "2",
      type: "card",
      content: "Tarjeta de ejemplo",
      styles: { backgroundColor: "#f8f9fa", padding: "20px", borderRadius: "8px" },
      position: { x: 50, y: 120 },
      size: { width: 400, height: 200 },
    },
  ])

  const pages = [
    { id: "dashboard", name: "Dashboard", path: "/dashboard" },
    { id: "invoices", name: "Facturas", path: "/dashboard/invoices" },
    { id: "clients", name: "Clientes", path: "/dashboard/clients" },
    { id: "landing", name: "Página Principal", path: "/" },
  ]

  const elementTypes = [
    { type: "text", name: "Texto", icon: Type },
    { type: "button", name: "Botón", icon: MousePointer },
    { type: "card", name: "Tarjeta", icon: Layers },
    { type: "image", name: "Imagen", icon: Grid },
    { type: "form", name: "Formulario", icon: Grid },
    { type: "table", name: "Tabla", icon: Grid },
  ]

  const addElement = (type: PageElement["type"]) => {
    const newElement: PageElement = {
      id: Date.now().toString(),
      type,
      content: `Nuevo ${type}`,
      styles: {},
      position: { x: 100, y: 100 },
      size: { width: 200, height: 100 },
    }
    setElements([...elements, newElement])
  }

  const updateElement = (id: string, updates: Partial<PageElement>) => {
    setElements(elements.map((el) => (el.id === id ? { ...el, ...updates } : el)))
  }

  const deleteElement = (id: string) => {
    setElements(elements.filter((el) => el.id !== id))
    if (selectedElement === id) {
      setSelectedElement(null)
    }
  }

  const selectedElementData = elements.find((el) => el.id === selectedElement)

  return (
    <div className="h-full flex">
      {/* Left Sidebar - Pages & Elements */}
      <div className="w-80 border-r bg-card">
        <div className="p-4">
          <h3 className="font-semibold mb-4">Editor Visual</h3>

          <Tabs defaultValue="pages" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pages">Páginas</TabsTrigger>
              <TabsTrigger value="elements">Elementos</TabsTrigger>
            </TabsList>

            <TabsContent value="pages" className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Página Actual</Label>
                <Select value={selectedPage} onValueChange={setSelectedPage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {pages.map((page) => (
                      <SelectItem key={page.id} value={page.id}>
                        {page.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Elementos en la Página</Label>
                <ScrollArea className="h-40">
                  {elements.map((element) => (
                    <div
                      key={element.id}
                      className={`p-2 mb-2 rounded cursor-pointer border ${
                        selectedElement === element.id ? "border-primary bg-primary/10" : "border-border"
                      }`}
                      onClick={() => setSelectedElement(element.id)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{element.content}</span>
                        <Badge variant="outline" className="text-xs">
                          {element.type}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </ScrollArea>
              </div>
            </TabsContent>

            <TabsContent value="elements" className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Agregar Elemento</Label>
                <div className="grid grid-cols-2 gap-2">
                  {elementTypes.map(({ type, name, icon: Icon }) => (
                    <Button
                      key={type}
                      variant="outline"
                      size="sm"
                      onClick={() => addElement(type as PageElement["type"])}
                      className="flex flex-col items-center gap-1 h-auto py-3"
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-xs">{name}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Center - Canvas */}
      <div className="flex-1 bg-muted/20 relative overflow-auto">
        <div className="absolute inset-0 p-8">
          <div className="bg-white min-h-full border shadow-sm relative">
            {/* Grid overlay */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `
                  linear-gradient(to right, #000 1px, transparent 1px),
                  linear-gradient(to bottom, #000 1px, transparent 1px)
                `,
                backgroundSize: "20px 20px",
              }}
            />

            {/* Elements */}
            {elements.map((element) => (
              <div
                key={element.id}
                className={`absolute border-2 cursor-pointer ${
                  selectedElement === element.id ? "border-primary" : "border-transparent hover:border-gray-300"
                }`}
                style={{
                  left: element.position.x,
                  top: element.position.y,
                  width: element.size.width,
                  height: element.size.height,
                  ...element.styles,
                }}
                onClick={() => setSelectedElement(element.id)}
              >
                {element.type === "text" && <div className="p-2">{element.content}</div>}
                {element.type === "button" && <Button className="w-full h-full">{element.content}</Button>}
                {element.type === "card" && (
                  <Card className="w-full h-full">
                    <CardContent className="p-4">{element.content}</CardContent>
                  </Card>
                )}
                {element.type === "image" && (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">Imagen</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Sidebar - Properties */}
      <div className="w-80 border-l bg-card">
        <div className="p-4">
          <h3 className="font-semibold mb-4">Propiedades</h3>

          {selectedElementData ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge>{selectedElementData.type}</Badge>
                <div className="flex gap-1">
                  <Button size="sm" variant="outline">
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => deleteElement(selectedElementData.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div>
                  <Label className="text-sm">Contenido</Label>
                  <Textarea
                    value={selectedElementData.content}
                    onChange={(e) => updateElement(selectedElementData.id, { content: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-sm">X</Label>
                    <Input
                      type="number"
                      value={selectedElementData.position.x}
                      onChange={(e) =>
                        updateElement(selectedElementData.id, {
                          position: { ...selectedElementData.position, x: Number.parseInt(e.target.value) || 0 },
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Y</Label>
                    <Input
                      type="number"
                      value={selectedElementData.position.y}
                      onChange={(e) =>
                        updateElement(selectedElementData.id, {
                          position: { ...selectedElementData.position, y: Number.parseInt(e.target.value) || 0 },
                        })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-sm">Ancho</Label>
                    <Input
                      type="number"
                      value={selectedElementData.size.width}
                      onChange={(e) =>
                        updateElement(selectedElementData.id, {
                          size: { ...selectedElementData.size, width: Number.parseInt(e.target.value) || 0 },
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Alto</Label>
                    <Input
                      type="number"
                      value={selectedElementData.size.height}
                      onChange={(e) =>
                        updateElement(selectedElementData.id, {
                          size: { ...selectedElementData.size, height: Number.parseInt(e.target.value) || 0 },
                        })
                      }
                    />
                  </div>
                </div>

                <Separator />

                <div>
                  <Label className="text-sm mb-2 block">Estilos</Label>
                  <div className="space-y-2">
                    <div>
                      <Label className="text-xs">Color de Fondo</Label>
                      <Input
                        type="color"
                        value={selectedElementData.styles.backgroundColor || "#ffffff"}
                        onChange={(e) =>
                          updateElement(selectedElementData.id, {
                            styles: { ...selectedElementData.styles, backgroundColor: e.target.value },
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Color de Texto</Label>
                      <Input
                        type="color"
                        value={selectedElementData.styles.color || "#000000"}
                        onChange={(e) =>
                          updateElement(selectedElementData.id, {
                            styles: { ...selectedElementData.styles, color: e.target.value },
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Tamaño de Fuente</Label>
                      <Input
                        value={selectedElementData.styles.fontSize || "16px"}
                        onChange={(e) =>
                          updateElement(selectedElementData.id, {
                            styles: { ...selectedElementData.styles, fontSize: e.target.value },
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              <MousePointer className="h-8 w-8 mx-auto mb-2" />
              <p>Selecciona un elemento para editar sus propiedades</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
