"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Plus,
  Users,
  Shield,
  Key,
  Edit,
  Trash2,
  Save,
  Search,
  Filter,
  UserPlus,
  Settings,
  Crown,
  Code,
  AlertTriangle,
} from "lucide-react"
import { DEFAULT_PERMISSIONS, DEFAULT_ROLES, type Role, type Permission } from "@/types/permissions"

interface UserWithRoles {
  id: string
  name: string
  email: string
  roles: Role[]
  level: number
  lastActive: string
}

export function RolePermissionManager() {
  const [activeTab, setActiveTab] = useState("users")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUser, setSelectedUser] = useState<UserWithRoles | null>(null)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false)
  const [isAssignRoleOpen, setIsAssignRoleOpen] = useState(false)
  const [newRole, setNewRole] = useState<Partial<Role>>({
    name: "",
    description: "",
    level: 10,
    permissions: [],
    isSystem: false,
    color: "bg-gray-100 text-gray-800",
  })

  // Mock data - en producción vendría de la base de datos
  const [users, setUsers] = useState<UserWithRoles[]>([
    {
      id: "1",
      name: "Desarrollador Principal",
      email: "developer@invoxa.com",
      roles: [DEFAULT_ROLES.find((r) => r.id === "developer")!],
      level: 999,
      lastActive: "2024-01-26 15:30",
    },
    {
      id: "2",
      name: "Admin Sistema",
      email: "admin@invoxa.com",
      roles: [DEFAULT_ROLES.find((r) => r.id === "super_admin")!],
      level: 100,
      lastActive: "2024-01-26 14:20",
    },
    {
      id: "3",
      name: "Manager Operaciones",
      email: "manager@invoxa.com",
      roles: [DEFAULT_ROLES.find((r) => r.id === "manager")!],
      level: 60,
      lastActive: "2024-01-26 13:45",
    },
    {
      id: "4",
      name: "Empleado Juan",
      email: "juan@invoxa.com",
      roles: [DEFAULT_ROLES.find((r) => r.id === "employee")!],
      level: 40,
      lastActive: "2024-01-26 12:30",
    },
    {
      id: "5",
      name: "Cliente ABC Corp",
      email: "cliente@abccorp.com",
      roles: [DEFAULT_ROLES.find((r) => r.id === "client")!],
      level: 20,
      lastActive: "2024-01-25 18:15",
    },
  ])

  const [roles, setRoles] = useState<Role[]>(DEFAULT_ROLES)
  const [permissions] = useState<Permission[]>(DEFAULT_PERMISSIONS)

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredRoles = roles.filter(
    (role) =>
      role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAssignRole = (userId: string, roleId: string) => {
    setUsers((prev) =>
      prev.map((user) => {
        if (user.id === userId) {
          const role = roles.find((r) => r.id === roleId)
          if (role && !user.roles.find((r) => r.id === roleId)) {
            return {
              ...user,
              roles: [...user.roles, role],
              level: Math.max(user.level, role.level),
            }
          }
        }
        return user
      }),
    )
  }

  const handleRemoveRole = (userId: string, roleId: string) => {
    setUsers((prev) =>
      prev.map((user) => {
        if (user.id === userId) {
          const newRoles = user.roles.filter((r) => r.id !== roleId)
          return {
            ...user,
            roles: newRoles,
            level: Math.max(...newRoles.map((r) => r.level), 0),
          }
        }
        return user
      }),
    )
  }

  const handleCreateRole = () => {
    if (newRole.name && newRole.description) {
      const role: Role = {
        id: newRole.name.toLowerCase().replace(/\s+/g, "_"),
        name: newRole.name,
        description: newRole.description,
        level: newRole.level || 10,
        permissions: newRole.permissions || [],
        isSystem: false,
        color: newRole.color || "bg-gray-100 text-gray-800",
      }

      setRoles((prev) => [...prev, role])
      setNewRole({
        name: "",
        description: "",
        level: 10,
        permissions: [],
        isSystem: false,
        color: "bg-gray-100 text-gray-800",
      })
      setIsCreateRoleOpen(false)
    }
  }

  const handleDeleteRole = (roleId: string) => {
    if (roles.find((r) => r.id === roleId)?.isSystem) {
      alert("No se pueden eliminar roles del sistema")
      return
    }

    setRoles((prev) => prev.filter((r) => r.id !== roleId))
    setUsers((prev) =>
      prev.map((user) => ({
        ...user,
        roles: user.roles.filter((r) => r.id !== roleId),
      })),
    )
  }

  const getRoleIcon = (role: Role) => {
    if (role.level >= 999) return Code
    if (role.level >= 100) return Crown
    if (role.level >= 80) return Shield
    if (role.level >= 60) return Settings
    if (role.level >= 40) return Users
    return Key
  }

  const getLevelBadge = (level: number) => {
    if (level >= 999) return <Badge className="bg-purple-100 text-purple-800">DEVELOPER</Badge>
    if (level >= 100) return <Badge className="bg-red-100 text-red-800">SUPER ADMIN</Badge>
    if (level >= 80) return <Badge className="bg-orange-100 text-orange-800">ADMIN</Badge>
    if (level >= 60) return <Badge className="bg-blue-100 text-blue-800">MANAGER</Badge>
    if (level >= 40) return <Badge className="bg-green-100 text-green-800">EMPLOYEE</Badge>
    if (level >= 20) return <Badge className="bg-gray-100 text-gray-800">CLIENT</Badge>
    return <Badge variant="outline">VIEWER</Badge>
  }

  const groupedPermissions = permissions.reduce(
    (acc, permission) => {
      if (!acc[permission.category]) {
        acc[permission.category] = []
      }
      acc[permission.category].push(permission)
      return acc
    },
    {} as Record<string, Permission[]>,
  )

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">Gestión de Roles y Permisos</h2>
            <p className="text-muted-foreground">Administra usuarios, roles y permisos del sistema</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={isCreateRoleOpen} onOpenChange={setIsCreateRoleOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Rol
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Crear Nuevo Rol</DialogTitle>
                  <DialogDescription>Define un nuevo rol con permisos específicos</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Nombre del Rol</Label>
                      <Input
                        value={newRole.name}
                        onChange={(e) => setNewRole((prev) => ({ ...prev, name: e.target.value }))}
                        placeholder="Ej: Editor de Contenido"
                      />
                    </div>
                    <div>
                      <Label>Nivel de Acceso</Label>
                      <Input
                        type="number"
                        value={newRole.level}
                        onChange={(e) =>
                          setNewRole((prev) => ({ ...prev, level: Number.parseInt(e.target.value) || 10 }))
                        }
                        min="1"
                        max="99"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Descripción</Label>
                    <Textarea
                      value={newRole.description}
                      onChange={(e) => setNewRole((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe las responsabilidades de este rol"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-3 block">Permisos</Label>
                    <ScrollArea className="h-64 border rounded-lg p-4">
                      {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => (
                        <div key={category} className="mb-4">
                          <h4 className="font-medium mb-2">{category}</h4>
                          <div className="space-y-2">
                            {categoryPermissions.map((permission) => (
                              <div key={permission.id} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id={permission.id}
                                  checked={newRole.permissions?.includes(permission.id)}
                                  onChange={(e) => {
                                    const checked = e.target.checked
                                    setNewRole((prev) => ({
                                      ...prev,
                                      permissions: checked
                                        ? [...(prev.permissions || []), permission.id]
                                        : (prev.permissions || []).filter((p) => p !== permission.id),
                                    }))
                                  }}
                                />
                                <Label htmlFor={permission.id} className="text-sm">
                                  {permission.name}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </ScrollArea>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateRoleOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateRole}>
                    <Save className="h-4 w-4 mr-2" />
                    Crear Rol
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Usuarios y Roles
            </TabsTrigger>
            <TabsTrigger value="roles" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Gestión de Roles
            </TabsTrigger>
            <TabsTrigger value="permissions" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              Lista de Permisos
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <TabsContent value="users" className="h-full m-0">
          <div className="h-full flex">
            {/* Users List */}
            <div className="w-1/2 border-r">
              <div className="p-4">
                <h3 className="font-semibold mb-4">Usuarios ({filteredUsers.length})</h3>
                <div className="space-y-2">
                  {filteredUsers.map((user) => (
                    <Card
                      key={user.id}
                      className={`cursor-pointer transition-colors ${
                        selectedUser?.id === user.id ? "ring-2 ring-primary" : ""
                      }`}
                      onClick={() => setSelectedUser(user)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                          </div>
                          {getLevelBadge(user.level)}
                        </div>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {user.roles.map((role) => {
                            const Icon = getRoleIcon(role)
                            return (
                              <Badge key={role.id} className={role.color}>
                                <Icon className="h-3 w-3 mr-1" />
                                {role.name}
                              </Badge>
                            )
                          })}
                        </div>
                        <div className="text-xs text-muted-foreground">Última actividad: {user.lastActive}</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            {/* User Details */}
            <div className="flex-1 p-6">
              {selectedUser ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold">{selectedUser.name}</h3>
                      <p className="text-muted-foreground">{selectedUser.email}</p>
                      <div className="flex items-center gap-2 mt-2">
                        {getLevelBadge(selectedUser.level)}
                        <Badge variant="outline">Nivel {selectedUser.level}</Badge>
                      </div>
                    </div>
                    <Dialog open={isAssignRoleOpen} onOpenChange={setIsAssignRoleOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Asignar Rol
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Asignar Rol a {selectedUser.name}</DialogTitle>
                          <DialogDescription>Selecciona un rol para asignar al usuario</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <Select
                            onValueChange={(value) => {
                              handleAssignRole(selectedUser.id, value)
                              setIsAssignRoleOpen(false)
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar rol" />
                            </SelectTrigger>
                            <SelectContent>
                              {roles
                                .filter((role) => !selectedUser.roles.find((r) => r.id === role.id))
                                .map((role) => (
                                  <SelectItem key={role.id} value={role.id}>
                                    <div className="flex items-center gap-2">
                                      <Badge className={role.color}>{role.name}</Badge>
                                      <span className="text-sm text-muted-foreground">Nivel {role.level}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-semibold mb-3">Roles Asignados</h4>
                    <div className="space-y-2">
                      {selectedUser.roles.map((role) => {
                        const Icon = getRoleIcon(role)
                        return (
                          <Card key={role.id}>
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <Icon className="h-5 w-5 text-muted-foreground" />
                                  <div>
                                    <div className="font-medium">{role.name}</div>
                                    <div className="text-sm text-muted-foreground">{role.description}</div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge className={role.color}>Nivel {role.level}</Badge>
                                  {!role.isSystem && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleRemoveRole(selectedUser.id, role.id)}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  )}
                                  {role.isSystem && (
                                    <Badge variant="outline" className="text-xs">
                                      <AlertTriangle className="h-3 w-3 mr-1" />
                                      Sistema
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Permisos Efectivos</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {Array.from(new Set(selectedUser.roles.flatMap((role) => role.permissions))).map(
                        (permissionId) => {
                          const permission = permissions.find((p) => p.id === permissionId)
                          return permission ? (
                            <Badge key={permissionId} variant="outline" className="text-xs">
                              {permission.name}
                            </Badge>
                          ) : null
                        },
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">Selecciona un Usuario</h3>
                    <p className="text-muted-foreground">Elige un usuario para gestionar sus roles y permisos</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="roles" className="h-full p-6 m-0">
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredRoles.map((role) => {
                const Icon = getRoleIcon(role)
                return (
                  <Card key={role.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="h-5 w-5" />
                          <CardTitle className="text-lg">{role.name}</CardTitle>
                        </div>
                        <div className="flex items-center gap-1">
                          <Badge className={role.color}>Nivel {role.level}</Badge>
                          {role.isSystem && (
                            <Badge variant="outline" className="text-xs">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Sistema
                            </Badge>
                          )}
                        </div>
                      </div>
                      <CardDescription>{role.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <div className="text-sm font-medium mb-1">Permisos ({role.permissions.length})</div>
                          <div className="flex flex-wrap gap-1">
                            {role.permissions.slice(0, 3).map((permissionId) => {
                              const permission = permissions.find((p) => p.id === permissionId)
                              return permission ? (
                                <Badge key={permissionId} variant="outline" className="text-xs">
                                  {permission.name}
                                </Badge>
                              ) : null
                            })}
                            {role.permissions.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{role.permissions.length - 3} más
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                            <Edit className="h-3 w-3 mr-1" />
                            Editar
                          </Button>
                          {!role.isSystem && (
                            <Button variant="outline" size="sm" onClick={() => handleDeleteRole(role.id)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="permissions" className="h-full p-6 m-0">
          <div className="space-y-6">
            {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    {category}
                  </CardTitle>
                  <CardDescription>{categoryPermissions.length} permisos en esta categoría</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Permiso</TableHead>
                          <TableHead>Descripción</TableHead>
                          <TableHead>Recurso</TableHead>
                          <TableHead>Acción</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {categoryPermissions.map((permission) => (
                          <TableRow key={permission.id}>
                            <TableCell className="font-medium">{permission.name}</TableCell>
                            <TableCell>{permission.description}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{permission.resource}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">{permission.action}</Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </div>
    </div>
  )
}
