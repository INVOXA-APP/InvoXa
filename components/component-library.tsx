"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import {
  Plus,
  Search,
  Download,
  Upload,
  Copy,
  Edit,
  Trash2,
  Eye,
  Code,
  Layout,
  MousePointer,
  FileText,
  BarChart,
} from "lucide-react"

interface Component {
  id: string
  name: string
  category: string
  description: string
  code: string
  preview: string
  tags: string[]
  isCustom: boolean
}

export function ComponentLibrary() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedComponent, setSelectedComponent] = useState<Component | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const categories = [
    { id: "all", name: "Todos", icon: Layout },
    { id: "ui", name: "UI Básicos", icon: MousePointer },
    { id: "forms", name: "Formularios", icon: FileText },
    { id: "data", name: "Datos", icon: BarChart },
    { id: "navigation", name: "Navegación", icon: Layout },
    { id: "custom", name: "Personalizados", icon: Code },
  ]

  const components: Component[] = [
    {
      id: "1",
      name: "Botón Primario",
      category: "ui",
      description: "Botón principal con estilos personalizados",
      code: `<Button className="bg-primary hover:bg-primary/90">
  Botón Primario
</Button>`,
      preview: "button-primary",
      tags: ["button", "primary", "ui"],
      isCustom: false,
    },
    {
      id: "2",
      name: "Tarjeta de Estadística",
      category: "data",
      description: "Tarjeta para mostrar métricas y estadísticas",
      code: `<Card>
  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
    <DollarSign className="h-4 w-4 text-muted-foreground" />
  </CardHeader>
  <CardContent>
    <div className="text-2xl font-bold">$45,231.89</div>
    <p className="text-xs text-muted-foreground">+20.1% from last month</p>
  </CardContent>
</Card>`,
      preview: "stat-card",
      tags: ["card", "statistics", "metrics"],
      isCustom: false,
    },
    {
      id: "3",
      name: "Formulario de Login",
      category: "forms",
      description: "Formulario completo de inicio de sesión",
      code: `<Card className="w-[350px]">
  <CardHeader>
    <CardTitle>Iniciar Sesión</CardTitle>
    <CardDescription>Ingresa tus credenciales</CardDescription>
  </CardHeader>
  <CardContent>
    <form>
      <div className="grid w-full items-center gap-4">
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" placeholder="tu@email.com" />
        </div>
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="password">Contraseña</Label>
          <Input id="password" type="password" />
        </div>
      </div>
    </form>
  </CardContent>
  <CardFooter className="flex justify-between">
    <Button variant="outline">Cancelar</Button>
    <Button>Iniciar Sesión</Button>
  </CardFooter>
</Card>`,
      preview: "login-form",
      tags: ["form", "login", "authentication"],
      isCustom: false,
    },
    {
      id: "4",
      name: "Tabla de Datos",
      category: "data",
      description: "Tabla responsive con paginación",
      code: `<Table>
  <TableHeader>
    <TableRow>
      <TableHead className="w-[100px]">Invoice</TableHead>
      <TableHead>Status</TableHead>
      <TableHead>Method</TableHead>
      <TableHead className="text-right">Amount</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell className="font-medium">INV001</TableCell>
      <TableCell>Paid</TableCell>
      <TableCell>Credit Card</TableCell>
      <TableCell className="text-right">$250.00</TableCell>
    </TableRow>
  </TableBody>
</Table>`,
      preview: "data-table",
      tags: ["table", "data", "responsive"],
      isCustom: false,
    },
    {
      id: "5",
      name: "Dashboard Widget",
      category: "custom",
      description: "Widget personalizado para dashboard",
      code: `<Card className="col-span-4">
  <CardHeader>
    <CardTitle>Overview</CardTitle>
  </CardHeader>
  <CardContent className="pl-2">
    <Overview />
  </CardContent>
</Card>`,
      preview: "dashboard-widget",
      tags: ["dashboard", "widget", "custom"],
      isCustom: true,
    },
  ]

  const filteredComponents = components.filter((component) => {
    const matchesSearch =
      component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      component.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      component.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = selectedCategory === "all" || component.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleCreateComponent = () => {
    // Logic to create new component
    setIsCreateDialogOpen(false)
  }

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
  }

  const handleDeleteComponent = (id: string) => {
    // Logic to delete component
  }

  return (
    <div className="h-full flex">
      {/* Left Sidebar - Categories and Search */}
      <div className="w-80 border-r bg-card">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Biblioteca de Componentes</h3>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Crear
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Crear Nuevo Componente</DialogTitle>
                  <DialogDescription>Crea un componente personalizado para tu biblioteca</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Nombre
                    </Label>
                    <Input id="name" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">
                      Descripción
                    </Label>
                    <Input id="description" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="code" className="text-right">
                      Código
                    </Label>
                    <Textarea id="code" className="col-span-3 h-32" />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateComponent}>Crear Componente</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar componentes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">Categorías</Label>
              <div className="space-y-1">
                {categories.map((category) => {
                  const Icon = category.icon
                  return (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {category.name}
                    </Button>
                  )
                })}
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                <Upload className="h-4 w-4 mr-2" />
                Importar
              </Button>
              <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Component Grid */}
      <div className="flex-1 p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Componentes Disponibles</h2>
          <p className="text-muted-foreground">{filteredComponents.length} componentes encontrados</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredComponents.map((component) => (
            <Card key={component.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{component.name}</CardTitle>
                  {component.isCustom && <Badge variant="secondary">Personalizado</Badge>}
                </div>
                <CardDescription>{component.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-1">
                    {component.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="bg-muted p-3 rounded-md">
                    <div className="text-xs text-muted-foreground mb-2">Vista Previa:</div>
                    <div className="bg-white p-2 rounded border">
                      {component.preview === "button-primary" && <Button>Botón Primario</Button>}
                      {component.preview === "stat-card" && (
                        <div className="text-center">
                          <div className="text-2xl font-bold">$45,231.89</div>
                          <div className="text-xs text-muted-foreground">+20.1% from last month</div>
                        </div>
                      )}
                      {component.preview === "login-form" && (
                        <div className="space-y-2">
                          <Input placeholder="Email" size="sm" />
                          <Input placeholder="Password" type="password" size="sm" />
                        </div>
                      )}
                      {component.preview === "data-table" && (
                        <div className="text-xs">
                          <div className="font-medium">INV001 | Paid | $250.00</div>
                        </div>
                      )}
                      {component.preview === "dashboard-widget" && (
                        <div className="text-center text-xs text-muted-foreground">Dashboard Widget</div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setSelectedComponent(component)}>
                      <Eye className="h-3 w-3 mr-1" />
                      Ver
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleCopyCode(component.code)}>
                      <Copy className="h-3 w-3 mr-1" />
                      Copiar
                    </Button>
                    {component.isCustom && (
                      <>
                        <Button size="sm" variant="outline">
                          <Edit className="h-3 w-3 mr-1" />
                          Editar
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDeleteComponent(component.id)}>
                          <Trash2 className="h-3 w-3 mr-1" />
                          Eliminar
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredComponents.length === 0 && (
          <div className="text-center py-12">
            <Code className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No se encontraron componentes</h3>
            <p className="text-muted-foreground mb-4">Intenta cambiar los filtros o crear un nuevo componente</p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Crear Componente
            </Button>
          </div>
        )}
      </div>

      {/* Component Detail Dialog */}
      {selectedComponent && (
        <Dialog open={!!selectedComponent} onOpenChange={() => setSelectedComponent(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedComponent.name}
                {selectedComponent.isCustom && <Badge variant="secondary">Personalizado</Badge>}
              </DialogTitle>
              <DialogDescription>{selectedComponent.description}</DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="preview" className="w-full">
              <TabsList>
                <TabsTrigger value="preview">Vista Previa</TabsTrigger>
                <TabsTrigger value="code">Código</TabsTrigger>
              </TabsList>

              <TabsContent value="preview" className="space-y-4">
                <div className="border rounded-lg p-6 bg-white">
                  <div dangerouslySetInnerHTML={{ __html: selectedComponent.code }} />
                </div>
              </TabsContent>

              <TabsContent value="code" className="space-y-4">
                <div className="relative">
                  <Button
                    size="sm"
                    className="absolute top-2 right-2 z-10"
                    onClick={() => handleCopyCode(selectedComponent.code)}
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copiar
                  </Button>
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                    <code>{selectedComponent.code}</code>
                  </pre>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex flex-wrap gap-1 mt-4">
              {selectedComponent.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
