import type { Role, Permission } from "@/types/permissions"

// Mock permissions data
const mockPermissions: Permission[] = [
  {
    id: "view_dashboard",
    name: "View Dashboard",
    description: "Access to main dashboard",
    resource: "dashboard",
    action: "read",
    level: 0,
  },
  {
    id: "manage_invoices",
    name: "Manage Invoices",
    description: "Create, edit, and delete invoices",
    resource: "invoices",
    action: "write",
    level: 20,
  },
  {
    id: "manage_clients",
    name: "Manage Clients",
    description: "Create, edit, and delete clients",
    resource: "clients",
    action: "write",
    level: 20,
  },
  {
    id: "manage_expenses",
    name: "Manage Expenses",
    description: "Create, edit, and delete expenses",
    resource: "expenses",
    action: "write",
    level: 40,
  },
  {
    id: "view_reports",
    name: "View Reports",
    description: "Access to analytics and reports",
    resource: "reports",
    action: "read",
    level: 40,
  },
  {
    id: "admin_panel",
    name: "Admin Panel",
    description: "Access to administration panel",
    resource: "admin",
    action: "read",
    level: 80,
  },
  {
    id: "cms_access",
    name: "CMS Access",
    description: "Access to content management system",
    resource: "cms",
    action: "write",
    level: 999,
  },
]

// Mock roles data
const mockRoles: Role[] = [
  {
    id: "user",
    name: "User",
    description: "Standard user with basic permissions",
    level: 20,
    color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    permissions: mockPermissions.filter((p) => p.level <= 20),
  },
  {
    id: "manager",
    name: "Manager",
    description: "Manager with extended permissions",
    level: 60,
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    permissions: mockPermissions.filter((p) => p.level <= 60),
  },
  {
    id: "admin",
    name: "Administrator",
    description: "Administrator with full system access",
    level: 100,
    color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    permissions: mockPermissions.filter((p) => p.level <= 100),
  },
  {
    id: "developer",
    name: "Developer",
    description: "Developer with full system and CMS access",
    level: 999,
    color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    permissions: mockPermissions,
  },
]

// Mock user roles mapping
const mockUserRoles: Record<string, string[]> = {
  "user@invoxa.com": ["user"],
  "manager@invoxa.com": ["manager"],
  "admin@invoxa.com": ["admin"],
  "developer@invoxa.com": ["developer"],
  "vatui_bogdan@yahoo.es": ["user"],
  "demo@invoxa.com": ["user"],
}

export async function getUserRoles(userId: string): Promise<Role[]> {
  const roleIds = mockUserRoles[userId] || ["user"]
  return mockRoles.filter((role) => roleIds.includes(role.id))
}

export async function getUserLevel(userId: string): Promise<number> {
  const roles = await getUserRoles(userId)
  return Math.max(...roles.map((role) => role.level))
}

export async function hasPermission(userId: string, permissionId: string): Promise<boolean> {
  const roles = await getUserRoles(userId)
  return roles.some((role) => role.permissions.some((permission) => permission.id === permissionId))
}

export async function canViewAdminPanel(userId: string): Promise<boolean> {
  const level = await getUserLevel(userId)
  return level >= 80
}

export async function canAccessCMS(userId: string): Promise<boolean> {
  const level = await getUserLevel(userId)
  return level >= 999
}

export async function getAllRoles(): Promise<Role[]> {
  return mockRoles
}

export async function getAllPermissions(): Promise<Permission[]> {
  return mockPermissions
}
