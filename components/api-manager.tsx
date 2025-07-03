"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  Plus,
  Code,
  Play,
  Edit,
  Trash2,
  Copy,
  Download,
  Upload,
  RefreshCw,
  Globe,
  Key,
  Activity,
  CheckCircle,
  AlertTriangle,
  XCircle,
} from "lucide-react"

interface APIEndpoint {
  id: string
  name: string
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
  path: string
  description: string
  status: "active" | "inactive" | "deprecated"
  authentication: "none" | "api-key" | "bearer" | "oauth"
  rateLimit: number
  lastUsed: string
  responseTime: number
  successRate: number
  documentation: string
  parameters: Parameter[]
  responses: Response[]
}

interface Parameter {
  name: string
  type: string
  required: boolean
  description: string
  example: string
}

interface Response {
  status: number
  description: string
  example: string
}

export function ApiManager() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<APIEndpoint | null>(null)
  const [activeTab, setActiveTab] = useState("endpoints")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false)
  const [testRequest, setTestRequest] = useState("")
  const [testResponse, setTestResponse] = useState("")

  const endpoints: APIEndpoint[] = [
    {
      id: "1",
      name: "Get User Profile",
      method: "GET",
      path: "/api/user/profile",
      description: "Obtiene el perfil del usuario autenticado",
      status: "active",
      authentication: "bearer",
      rateLimit: 100,
      lastUsed: "2024-01-26 14:30",
      responseTime: 120,
      successRate: 99.5,
      documentation: "Retorna la información completa del perfil del usuario",
      parameters: [
        {
          name: "include",
          type: "string",
          required: false,
          description: "Campos adicionales a incluir",
          example: "preferences,settings",
        },
      ],
      responses: [
        {
          status: 200,
          description: "Perfil obtenido exitosamente",
          example: '{"id": "123", "name": "John Doe", "email": "john@example.com"}',
        },
        {
          status: 401,
          description: "No autorizado",
          example: '{"error": "Unauthorized"}',
        },
      ],
    },
    {
      id: "2",
      name: "Create Invoice",
      method: "POST",
      path: "/api/invoices",
      description: "Crea una nueva factura",
      status: "active",
      authentication: "api-key",
      rateLimit: 50,
      lastUsed: "2024-01-26 15:45",
      responseTime: 250,
      successRate: 98.2,
      documentation: "Endpoint para crear facturas con validación completa",
      parameters: [
        {
          name: "client_id",
          type: "string",
          required: true,
          description: "ID del cliente",
          example: "client_123",
        },
        {
          name: "amount",
          type: "number",
          required: true,
          description: "Monto de la factura",
          example: "1500.00",
        },
        {
          name: "due_date",
          type: "string",
          required: true,
          description: "Fecha de vencimiento",
          example: "2024-02-15",
        },
      ],
      responses: [
        {
          status: 201,
          description: "Factura creada exitosamente",
          example: '{"id": "inv_456", "status": "pending", "amount": 1500.00}',
        },
        {
          status: 400,
          description: "Datos inválidos",
          example: '{"error": "Invalid client_id"}',
        },
      ],
    },
    {
      id: "3",
      name: "Update Client",
      method: "PUT",
      path: "/api/clients/{id}",
      description: "Actualiza información de un cliente",
      status: "active",
      authentication: "bearer",
      rateLimit: 75,
      lastUsed: "2024-01-26 12:20",
      responseTime: 180,
      successRate: 97.8,
      documentation: "Actualiza parcial o completamente los datos del cliente",
      parameters: [
        {
          name: "id",
          type: "string",
          required: true,
          description: "ID del cliente",
          example: "client_123",
        },
        {
          name: "name",
          type: "string",
          required: false,
          description: "Nombre del cliente",
          example: "Empresa ABC",
        },
        {
          name: "email",
          type: "string",
          required: false,
          description: "Email del cliente",
          example: "contact@empresa.com",
        },
      ],
      responses: [
        {
          status: 200,
          description: "Cliente actualizado exitosamente",
          example: '{"id": "client_123", "name": "Empresa ABC", "updated_at": "2024-01-26T12:20:00Z"}',
        },
        {
          status: 404,
          description: "Cliente no encontrado",
          example: '{"error": "Client not found"}',
        },
      ],
    },
    {
      id: "4",
      name: "Delete Expense",
      method: "DELETE",
      path: "/api/expenses/{id}",
      description: "Elimina un gasto específico",
      status: "deprecated",
      authentication: "api-key",
      rateLimit: 25,
      lastUsed: "2024-01-20 09:15",
      responseTime: 95,
      successRate: 99.9,
      documentation: "Endpoint deprecado - usar soft delete en su lugar",
      parameters: [
        {
          name: "id",
          type: "string",
          required: true,
          description: "ID del gasto",
          example: "exp_789",
        },
      ],
      responses: [
        {
          status: 204,
          description: "Gasto eliminado exitosamente",
          example: "",
        },
        {
          status: 404,
          description: "Gasto no encontrado",
          example: '{"error": "Expense not found"}',
        },
      ],
    },
  ]

  const apiKeys = [
    {
      id: "1",
      name: "Production API Key",
      key: "pk_live_1234567890abcdef",
      permissions: ["read", "write"],
      lastUsed: "2024-01-26 15:30",
      status: "active",
    },
    {
      id: "2",
      name: "Development API Key",
      key: "pk_test_abcdef1234567890",
      permissions: ["read", "write", "delete"],
      lastUsed: "2024-01-26 14:20",
      status: "active",
    },
    {
      id: "3",
      name: "Read-only Key",
      key: "pk_readonly_fedcba0987654321",
      permissions: ["read"],
      lastUsed: "2024-01-25 18:45",
      status: "inactive",
    },
  ]

  const webhooks = [
    {
      id: "1",
      name: "Invoice Created",
      url: "https://myapp.com/webhooks/invoice-created",
      events: ["invoice.created", "invoice.updated"],
      status: "active",
      lastTriggered: "2024-01-26 15:45",
      successRate: 98.5,
    },
    {
      id: "2",
      name: "Payment Received",
      url: "https://myapp.com/webhooks/payment",
      events: ["payment.received", "payment.failed"],
      status: "active",
      lastTriggered: "2024-01-26 14:30",
      successRate: 99.2,
    },
  ]

  const handleCreateEndpoint = () => {
    setIsCreateDialogOpen(false)
  }

  const handleTestEndpoint = () => {
    // Simulate API test
    setTestResponse(`{
  "status": "success",
  "data": {
    "message": "API endpoint tested successfully",
    "timestamp": "${new Date().toISOString()}"
  }
}`)
  }

  const handleDeleteEndpoint = (id: string) => {
    // Logic to delete endpoint
  }

  const getStatusBadge = (status: APIEndpoint["status"]) => {
    const variants = {
      active: "default",
      inactive: "secondary",
      deprecated: "destructive",
    } as const

    const icons = {
      active: CheckCircle,
      inactive: XCircle,
      deprecated: AlertTriangle,
    }

    const Icon = icons[status]

    return (
      <Badge variant={variants[status]} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    )
  }

  const getMethodBadge = (method: APIEndpoint["method"]) => {
    const colors = {
      GET: "bg-green-100 text-green-800",
      POST: "bg-blue-100 text-blue-800",
      PUT: "bg-yellow-100 text-yellow-800",
      DELETE: "bg-red-100 text-red-800",
      PATCH: "bg-purple-100 text-purple-800",
    }

    return <Badge className={colors[method]}>{method}</Badge>
  }

  return (
    <div className="h-full flex flex-col">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
        {/* Header */}
        <div className="border-b bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">Gestor de APIs</h2>
              <p className="text-muted-foreground">Administra endpoints, claves API y webhooks</p>
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
                    Nuevo Endpoint
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Crear Nuevo Endpoint</DialogTitle>
                    <DialogDescription>Define un nuevo endpoint de API</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">
                        Nombre
                      </Label>
                      <Input id="name" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="method" className="text-right">
                        Método
                      </Label>
                      <Select>
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Seleccionar método" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="GET">GET</SelectItem>
                          <SelectItem value="POST">POST</SelectItem>
                          <SelectItem value="PUT">PUT</SelectItem>
                          <SelectItem value="DELETE">DELETE</SelectItem>
                          <SelectItem value="PATCH">PATCH</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="path" className="text-right">
                        Ruta
                      </Label>
                      <Input id="path" placeholder="/api/..." className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="description" className="text-right">
                        Descripción
                      </Label>
                      <Textarea id="description" className="col-span-3" />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleCreateEndpoint}>Crear Endpoint</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="endpoints" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Endpoints
            </TabsTrigger>
            <TabsTrigger value="keys" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              API Keys
            </TabsTrigger>
            <TabsTrigger value="webhooks" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Webhooks
            </TabsTrigger>
            <TabsTrigger value="docs" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              Documentación
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <TabsContent value="endpoints" className="h-full flex m-0">
            {/* Endpoints List */}
            <div className="w-1/2 border-r">
              <div className="p-4">
                <h3 className="font-semibold mb-4">Endpoints ({endpoints.length})</h3>
                <div className="space-y-2">
                  {endpoints.map((endpoint) => (
                    <Card
                      key={endpoint.id}
                      className={`cursor-pointer transition-colors ${
                        selectedEndpoint?.id === endpoint.id ? "ring-2 ring-primary" : ""
                      }`}
                      onClick={() => setSelectedEndpoint(endpoint)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getMethodBadge(endpoint.method)}
                            <span className="font-medium">{endpoint.name}</span>
                          </div>
                          {getStatusBadge(endpoint.status)}
                        </div>
                        <div className="text-sm text-muted-foreground mb-2">{endpoint.path}</div>
                        <div className="text-xs text-muted-foreground">{endpoint.description}</div>
                        <div className="flex items-center justify-between mt-3 text-xs">
                          <span>Última uso: {endpoint.lastUsed}</span>
                          <span>{endpoint.responseTime}ms</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            {/* Endpoint Details */}
            <div className="flex-1 p-6">
              {selectedEndpoint ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold">{selectedEndpoint.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        {getMethodBadge(selectedEndpoint.method)}
                        <code className="bg-muted px-2 py-1 rounded text-sm">{selectedEndpoint.path}</code>
                        {getStatusBadge(selectedEndpoint.status)}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Dialog open={isTestDialogOpen} onOpenChange={setIsTestDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Play className="h-4 w-4 mr-2" />
                            Probar
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Probar Endpoint</DialogTitle>
                            <DialogDescription>
                              {selectedEndpoint.method} {selectedEndpoint.path}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div>
                              <Label>Request Body</Label>
                              <Textarea
                                value={testRequest}
                                onChange={(e) => setTestRequest(e.target.value)}
                                placeholder="Ingresa el JSON del request..."
                                className="h-32 font-mono"
                              />
                            </div>
                            <Button onClick={handleTestEndpoint}>
                              <Play className="h-4 w-4 mr-2" />
                              Ejecutar Test
                            </Button>
                            {testResponse && (
                              <div>
                                <Label>Response</Label>
                                <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">{testResponse}</pre>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteEndpoint(selectedEndpoint.id)}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-sm text-muted-foreground">Tiempo de Respuesta</div>
                        <div className="text-2xl font-bold">{selectedEndpoint.responseTime}ms</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-sm text-muted-foreground">Tasa de Éxito</div>
                        <div className="text-2xl font-bold">{selectedEndpoint.successRate}%</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-sm text-muted-foreground">Rate Limit</div>
                        <div className="text-2xl font-bold">{selectedEndpoint.rateLimit}/min</div>
                      </CardContent>
                    </Card>
                  </div>

                  <Tabs defaultValue="parameters" className="w-full">
                    <TabsList>
                      <TabsTrigger value="parameters">Parámetros</TabsTrigger>
                      <TabsTrigger value="responses">Respuestas</TabsTrigger>
                      <TabsTrigger value="documentation">Documentación</TabsTrigger>
                    </TabsList>

                    <TabsContent value="parameters" className="space-y-4">
                      <div className="border rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Nombre</TableHead>
                              <TableHead>Tipo</TableHead>
                              <TableHead>Requerido</TableHead>
                              <TableHead>Descripción</TableHead>
                              <TableHead>Ejemplo</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {selectedEndpoint.parameters.map((param, index) => (
                              <TableRow key={index}>
                                <TableCell className="font-mono">{param.name}</TableCell>
                                <TableCell>
                                  <Badge variant="outline">{param.type}</Badge>
                                </TableCell>
                                <TableCell>
                                  {param.required ? (
                                    <Badge variant="destructive">Sí</Badge>
                                  ) : (
                                    <Badge variant="secondary">No</Badge>
                                  )}
                                </TableCell>
                                <TableCell>{param.description}</TableCell>
                                <TableCell className="font-mono text-sm">{param.example}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </TabsContent>

                    <TabsContent value="responses" className="space-y-4">
                      <div className="space-y-4">
                        {selectedEndpoint.responses.map((response, index) => (
                          <Card key={index}>
                            <CardHeader>
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant={
                                    response.status < 300
                                      ? "default"
                                      : response.status < 400
                                        ? "secondary"
                                        : "destructive"
                                  }
                                >
                                  {response.status}
                                </Badge>
                                <span className="font-medium">{response.description}</span>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">{response.example}</pre>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="documentation" className="space-y-4">
                      <Card>
                        <CardContent className="p-6">
                          <p>{selectedEndpoint.documentation}</p>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Globe className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">Selecciona un Endpoint</h3>
                    <p className="text-muted-foreground">Elige un endpoint de la lista para ver sus detalles</p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="keys" className="h-full p-6 m-0">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">API Keys</h3>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva API Key
                </Button>
              </div>

              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Key</TableHead>
                      <TableHead>Permisos</TableHead>
                      <TableHead>Último Uso</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {apiKeys.map((key) => (
                      <TableRow key={key.id}>
                        <TableCell className="font-medium">{key.name}</TableCell>
                        <TableCell className="font-mono text-sm">
                          {key.key.substring(0, 20)}...
                          <Button variant="ghost" size="sm" className="ml-2">
                            <Copy className="h-3 w-3" />
                          </Button>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {key.permissions.map((permission) => (
                              <Badge key={permission} variant="outline" className="text-xs">
                                {permission}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>{key.lastUsed}</TableCell>
                        <TableCell>
                          <Badge variant={key.status === "active" ? "default" : "secondary"}>{key.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="outline" size="sm">
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="webhooks" className="h-full p-6 m-0">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Webhooks</h3>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Webhook
                </Button>
              </div>

              <div className="grid gap-4">
                {webhooks.map((webhook) => (
                  <Card key={webhook.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{webhook.name}</CardTitle>
                        <Badge variant={webhook.status === "active" ? "default" : "secondary"}>{webhook.status}</Badge>
                      </div>
                      <CardDescription>{webhook.url}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <Label className="text-sm font-medium">Eventos</Label>
                          <div className="flex gap-1 mt-1">
                            {webhook.events.map((event) => (
                              <Badge key={event} variant="outline" className="text-xs">
                                {event}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Último disparo:</span>
                            <div>{webhook.lastTriggered}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Tasa de éxito:</span>
                            <div>{webhook.successRate}%</div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-3 w-3 mr-1" />
                            Editar
                          </Button>
                          <Button variant="outline" size="sm">
                            <Play className="h-3 w-3 mr-1" />
                            Probar
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-3 w-3 mr-1" />
                            Eliminar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="docs" className="h-full p-6 m-0">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Documentación de API</h3>
                <div className="flex gap-2">
                  <Button variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Regenerar
                  </Button>
                  <Button>
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </Button>
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>API Documentation</CardTitle>
                  <CardDescription>Documentación automática generada para todos los endpoints</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-muted p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Base URL</h4>
                      <code>https://api.invoxa.com/v1</code>
                    </div>

                    <div className="bg-muted p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Autenticación</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Incluye tu API key en el header Authorization:
                      </p>
                      <code>Authorization: Bearer your_api_key_here</code>
                    </div>

                    <div className="bg-muted p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Rate Limiting</h4>
                      <p className="text-sm text-muted-foreground">
                        Las requests están limitadas por endpoint. Consulta la documentación específica de cada endpoint
                        para conocer los límites.
                      </p>
                    </div>

                    <div className="bg-muted p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Formatos de Respuesta</h4>
                      <p className="text-sm text-muted-foreground">
                        Todas las respuestas están en formato JSON. Los errores incluyen un código de estado HTTP
                        apropiado y un mensaje descriptivo.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
