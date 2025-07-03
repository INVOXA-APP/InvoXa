export interface Permission {
  id: string
  name: string
  description: string
  resource: string
  action: string
  level: number
}

export interface Role {
  id: string
  name: string
  description: string
  level: number
  color: string
  permissions: Permission[]
}

export interface UserRole {
  userId: string
  roleId: string
  assignedAt: Date
  assignedBy: string
}

export interface PermissionCheck {
  userId: string
  permission: string
  granted: boolean
  reason?: string
}

export type PermissionAction = "create" | "read" | "update" | "delete" | "manage" | "view" | "edit"
export type PermissionResource =
  | "users"
  | "invoices"
  | "clients"
  | "admin"
  | "system"
  | "reports"
  | "organization"
  | "content"
  | "files"
  | "cms"
  | "database"
  | "api"

export const PERMISSION_LEVELS = {
  SUPER_ADMIN: 100,
  ADMIN: 80,
  MANAGER: 60,
  EMPLOYEE: 40,
  CLIENT: 20,
  VIEWER: 10,
  DEVELOPER: 999, // Acceso total para desarrolladores
} as const

export const DEFAULT_PERMISSIONS: Permission[] = [
  // Gestión de Usuarios
  {
    id: "users_view",
    name: "Ver Usuarios",
    description: "Ver lista de usuarios",
    resource: "users",
    action: "view",
    level: PERMISSION_LEVELS.VIEWER,
  },
  {
    id: "users_create",
    name: "Crear Usuarios",
    description: "Crear nuevos usuarios",
    resource: "users",
    action: "create",
    level: PERMISSION_LEVELS.MANAGER,
  },
  {
    id: "users_edit",
    name: "Editar Usuarios",
    description: "Modificar usuarios existentes",
    resource: "users",
    action: "edit",
    level: PERMISSION_LEVELS.ADMIN,
  },
  {
    id: "users_delete",
    name: "Eliminar Usuarios",
    description: "Eliminar usuarios del sistema",
    resource: "users",
    action: "delete",
    level: PERMISSION_LEVELS.SUPER_ADMIN,
  },
  {
    id: "users_manage",
    name: "Gestionar Usuarios",
    description: "Gestión completa de usuarios",
    resource: "users",
    action: "manage",
    level: PERMISSION_LEVELS.DEVELOPER,
  },

  // Gestión de Facturas
  {
    id: "invoices_view",
    name: "Ver Facturas",
    description: "Ver facturas del sistema",
    resource: "invoices",
    action: "view",
    level: PERMISSION_LEVELS.VIEWER,
  },
  {
    id: "invoices_create",
    name: "Crear Facturas",
    description: "Crear nuevas facturas",
    resource: "invoices",
    action: "create",
    level: PERMISSION_LEVELS.MANAGER,
  },
  {
    id: "invoices_edit",
    name: "Editar Facturas",
    description: "Modificar facturas existentes",
    resource: "invoices",
    action: "edit",
    level: PERMISSION_LEVELS.ADMIN,
  },
  {
    id: "invoices_delete",
    name: "Eliminar Facturas",
    description: "Eliminar facturas",
    resource: "invoices",
    action: "delete",
    level: PERMISSION_LEVELS.SUPER_ADMIN,
  },
  {
    id: "invoices_manage",
    name: "Gestionar Facturas",
    description: "Gestión completa de facturas",
    resource: "invoices",
    action: "manage",
    level: PERMISSION_LEVELS.DEVELOPER,
  },

  // Gestión de Clientes
  {
    id: "clients_view",
    name: "Ver Clientes",
    description: "Ver lista de clientes",
    resource: "clients",
    action: "view",
    level: PERMISSION_LEVELS.VIEWER,
  },
  {
    id: "clients_create",
    name: "Crear Clientes",
    description: "Agregar nuevos clientes",
    resource: "clients",
    action: "create",
    level: PERMISSION_LEVELS.MANAGER,
  },
  {
    id: "clients_edit",
    name: "Editar Clientes",
    description: "Modificar información de clientes",
    resource: "clients",
    action: "edit",
    level: PERMISSION_LEVELS.ADMIN,
  },
  {
    id: "clients_delete",
    name: "Eliminar Clientes",
    description: "Eliminar clientes",
    resource: "clients",
    action: "delete",
    level: PERMISSION_LEVELS.SUPER_ADMIN,
  },
  {
    id: "clients_manage",
    name: "Gestionar Clientes",
    description: "Gestión completa de clientes",
    resource: "clients",
    action: "manage",
    level: PERMISSION_LEVELS.DEVELOPER,
  },

  // Panel Administrativo
  {
    id: "admin_view",
    name: "Ver Panel Admin",
    description: "Acceso al panel administrativo",
    resource: "admin",
    action: "view",
    level: PERMISSION_LEVELS.ADMIN,
  },
  {
    id: "admin_manage",
    name: "Gestionar Admin",
    description: "Gestión completa del panel admin",
    resource: "admin",
    action: "manage",
    level: PERMISSION_LEVELS.SUPER_ADMIN,
  },

  // Sistema
  {
    id: "system_config",
    name: "Configurar Sistema",
    description: "Modificar configuraciones del sistema",
    resource: "system",
    action: "manage",
    level: PERMISSION_LEVELS.SUPER_ADMIN,
  },
  {
    id: "system_backup",
    name: "Backup Sistema",
    description: "Realizar copias de seguridad",
    resource: "system",
    action: "manage",
    level: PERMISSION_LEVELS.SUPER_ADMIN,
  },

  // Reportes
  {
    id: "reports_view",
    name: "Ver Reportes",
    description: "Acceso a reportes y analíticas",
    resource: "reports",
    action: "view",
    level: PERMISSION_LEVELS.VIEWER,
  },
  {
    id: "reports_export",
    name: "Exportar Reportes",
    description: "Exportar datos y reportes",
    resource: "reports",
    action: "manage",
    level: PERMISSION_LEVELS.SUPER_ADMIN,
  },

  // Organización
  {
    id: "org_view",
    name: "Ver Organización",
    description: "Ver información organizacional",
    resource: "organization",
    action: "view",
    level: PERMISSION_LEVELS.VIEWER,
  },
  {
    id: "org_manage",
    name: "Gestionar Organización",
    description: "Gestión organizacional completa",
    resource: "organization",
    action: "manage",
    level: PERMISSION_LEVELS.SUPER_ADMIN,
  },

  // CMS y Contenido
  {
    id: "cms_view",
    name: "Ver CMS",
    description: "Acceso al sistema de gestión de contenido",
    resource: "cms",
    action: "view",
    level: PERMISSION_LEVELS.ADMIN,
  },
  {
    id: "cms_edit",
    name: "Editar Contenido",
    description: "Editar contenido del sitio",
    resource: "content",
    action: "edit",
    level: PERMISSION_LEVELS.MANAGER,
  },
  {
    id: "cms_manage",
    name: "Gestionar CMS",
    description: "Gestión completa del CMS",
    resource: "cms",
    action: "manage",
    level: PERMISSION_LEVELS.SUPER_ADMIN,
  },
  {
    id: "files_manage",
    name: "Gestionar Archivos",
    description: "Subir, editar y eliminar archivos",
    resource: "files",
    action: "manage",
    level: PERMISSION_LEVELS.MANAGER,
  },

  // Base de Datos
  {
    id: "database_view",
    name: "Ver Base de Datos",
    description: "Ver estructura de la base de datos",
    resource: "database",
    action: "view",
    level: PERMISSION_LEVELS.ADMIN,
  },
  {
    id: "database_manage",
    name: "Gestionar Base de Datos",
    description: "Gestión completa de la base de datos",
    resource: "database",
    action: "manage",
    level: PERMISSION_LEVELS.SUPER_ADMIN,
  },

  // APIs
  {
    id: "api_view",
    name: "Ver APIs",
    description: "Ver documentación y endpoints de API",
    resource: "api",
    action: "view",
    level: PERMISSION_LEVELS.ADMIN,
  },
  {
    id: "api_manage",
    name: "Gestionar APIs",
    description: "Gestión completa de APIs",
    resource: "api",
    action: "manage",
    level: PERMISSION_LEVELS.SUPER_ADMIN,
  },
]

export const DEFAULT_ROLES: Role[] = [
  {
    id: "developer",
    name: "Desarrollador",
    description: "Acceso total al sistema para desarrollo",
    level: PERMISSION_LEVELS.DEVELOPER,
    permissions: DEFAULT_PERMISSIONS, // TODOS los permisos
    isSystem: true,
    color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  },
  {
    id: "super_admin",
    name: "Super Administrador",
    description: "Acceso completo al sistema",
    level: PERMISSION_LEVELS.SUPER_ADMIN,
    permissions: DEFAULT_PERMISSIONS.filter((p) => p.level <= PERMISSION_LEVELS.SUPER_ADMIN),
    isSystem: true,
    color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  },
  {
    id: "admin",
    name: "Administrador",
    description: "Gestión administrativa completa",
    level: PERMISSION_LEVELS.ADMIN,
    permissions: DEFAULT_PERMISSIONS.filter((p) => p.level <= PERMISSION_LEVELS.ADMIN),
    isSystem: true,
    color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  },
  {
    id: "manager",
    name: "Manager",
    description: "Gestión de operaciones de negocio",
    level: PERMISSION_LEVELS.MANAGER,
    permissions: DEFAULT_PERMISSIONS.filter((p) => p.level <= PERMISSION_LEVELS.MANAGER),
    isSystem: true,
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  },
  {
    id: "employee",
    name: "Empleado",
    description: "Acceso a operaciones diarias",
    level: PERMISSION_LEVELS.EMPLOYEE,
    permissions: DEFAULT_PERMISSIONS.filter((p) => p.level <= PERMISSION_LEVELS.EMPLOYEE),
    isSystem: true,
    color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  },
  {
    id: "client",
    name: "Cliente",
    description: "Acceso limitado a sus propios datos",
    level: PERMISSION_LEVELS.CLIENT,
    permissions: DEFAULT_PERMISSIONS.filter((p) => p.level <= PERMISSION_LEVELS.CLIENT),
    isSystem: true,
    color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
  },
  {
    id: "viewer",
    name: "Viewer",
    description: "Solo lectura de información básica",
    level: PERMISSION_LEVELS.VIEWER,
    permissions: DEFAULT_PERMISSIONS.filter((p) => p.level <= PERMISSION_LEVELS.VIEWER),
    isSystem: true,
    color: "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-300",
  },
]
