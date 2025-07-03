"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ModeToggle } from "@/components/mode-toggle"
import {
  BarChart3,
  FileText,
  Users,
  Receipt,
  Settings,
  Menu,
  Home,
  Building2,
  Shield,
  Database,
  Code,
  Palette,
  Globe,
  Zap,
  Brain,
  Scan,
  Bell,
  Music,
  Blocks,
  TrendingUp,
  Activity,
  CircuitBoard,
  Cpu,
  Search,
  MessageSquare,
  UserCheck,
  Crown,
  LogOut,
  ChevronDown,
  ImageIcon,
  Key,
} from "lucide-react"
import { canViewAdminPanel, canAccessCMS, getUserRoles, getUserLevel } from "@/lib/permissions"
import type { Role } from "@/types/permissions"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [userRoles, setUserRoles] = useState<Role[]>([])
  const [userLevel, setUserLevel] = useState(0)
  const [canViewAdmin, setCanViewAdmin] = useState(false)
  const [canUseCMS, setCanUseCMS] = useState(false)

  // Simular usuario actual - en producción vendría del contexto de autenticación
  const currentUser = {
    id: "developer@invoxa.com", // Cambiar según el usuario logueado
    name: "Desarrollador Principal",
    email: "developer@invoxa.com",
    avatar: "/placeholder.svg?height=32&width=32&text=DEV",
  }

  useEffect(() => {
    const loadUserPermissions = async () => {
      const roles = await getUserRoles(currentUser.id)
      const level = await getUserLevel(currentUser.id)
      const adminAccess = await canViewAdminPanel(currentUser.id)
      const cmsAccess = await canAccessCMS(currentUser.id)

      setUserRoles(roles)
      setUserLevel(level)
      setCanViewAdmin(adminAccess)
      setCanUseCMS(cmsAccess)
    }

    loadUserPermissions()
  }, [currentUser.id])

  const navigationItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: Home,
      description: "Panel principal",
      requiredLevel: 0,
    },
    {
      title: "Facturas",
      href: "/dashboard/invoices",
      icon: FileText,
      description: "Gestión de facturas",
      requiredLevel: 20,
    },
    {
      title: "Clientes",
      href: "/dashboard/clients",
      icon: Users,
      description: "Gestión de clientes",
      requiredLevel: 20,
    },
    {
      title: "Gastos",
      href: "/dashboard/expenses",
      icon: Receipt,
      description: "Control de gastos",
      requiredLevel: 40,
    },
    {
      title: "Reportes",
      href: "/dashboard/reports",
      icon: BarChart3,
      description: "Analíticas y reportes",
      requiredLevel: 40,
    },
    {
      title: "Configuración",
      href: "/dashboard/settings",
      icon: Settings,
      description: "Configuración personal",
      requiredLevel: 0,
    },
  ]

  const advancedFeatures = [
    {
      title: "Escáner IA",
      href: "/dashboard/scanner",
      icon: Scan,
      description: "Escaneo inteligente de documentos",
      requiredLevel: 40,
    },
    {
      title: "Predicciones IA",
      href: "/dashboard/ai-predictions",
      icon: Brain,
      description: "Predicciones con inteligencia artificial",
      requiredLevel: 60,
    },
    {
      title: "Asistente IA",
      href: "/dashboard/ai-assistant",
      icon: MessageSquare,
      description: "Asistente conversacional",
      requiredLevel: 40,
    },
    {
      title: "Blockchain",
      href: "/dashboard/blockchain-invoices",
      icon: Blocks,
      description: "Facturas en blockchain",
      requiredLevel: 80,
    },
    {
      title: "Música Ambiental",
      href: "/dashboard/ambient-music",
      icon: Music,
      description: "Ambiente de trabajo",
      requiredLevel: 20,
    },
    {
      title: "Oficina Virtual",
      href: "/dashboard/virtual-office",
      icon: Building2,
      description: "Espacio de trabajo virtual",
      requiredLevel: 40,
    },
    {
      title: "Recordatorios",
      href: "/dashboard/reminders",
      icon: Bell,
      description: "Sistema de recordatorios",
      requiredLevel: 20,
    },
  ]

  const systemFeatures = [
    {
      title: "Salud del Sistema",
      href: "/dashboard/system-health",
      icon: Activity,
      description: "Monitoreo del sistema",
      requiredLevel: 80,
    },
    {
      title: "Análisis Temporal",
      href: "/dashboard/temporal-analysis",
      icon: TrendingUp,
      description: "Análisis de tendencias",
      requiredLevel: 60,
    },
    {
      title: "Circuit Breakers",
      href: "/dashboard/circuit-breakers",
      icon: CircuitBoard,
      description: "Protección de circuitos",
      requiredLevel: 80,
    },
    {
      title: "ML Cascade",
      href: "/dashboard/ml-cascade-prediction",
      icon: Cpu,
      description: "Predicciones en cascada",
      requiredLevel: 80,
    },
    {
      title: "Búsqueda por Voz",
      href: "/dashboard/voice-search-test",
      icon: Search,
      description: "Búsqueda por comandos de voz",
      requiredLevel: 40,
    },
    {
      title: "Analíticas de Búsqueda",
      href: "/dashboard/search-analytics",
      icon: BarChart3,
      description: "Estadísticas de búsqueda",
      requiredLevel: 60,
    },
    {
      title: "Insights de Búsqueda",
      href: "/dashboard/search-insights",
      icon: Brain,
      description: "Insights inteligentes",
      requiredLevel: 60,
    },
    {
      title: "Búsqueda en Equipo",
      href: "/dashboard/team-search",
      icon: Users,
      description: "Colaboración en búsquedas",
      requiredLevel: 40,
    },
  ]

  const organizationItems = [
    {
      title: "Empleados",
      href: "/organization/employees",
      icon: UserCheck,
      description: "Gestión de empleados",
      requiredLevel: 60,
    },
    {
      title: "Facturas Org.",
      href: "/organization/invoices",
      icon: FileText,
      description: "Facturas organizacionales",
      requiredLevel: 60,
    },
    {
      title: "Permisos",
      href: "/organization/permissions",
      icon: Shield,
      description: "Gestión de permisos",
      requiredLevel: 80,
    },
  ]

  const adminItems = [
    {
      title: "Usuarios",
      href: "/admin/users",
      icon: Users,
      description: "Gestión de usuarios",
      requiredLevel: 80,
    },
    {
      title: "Roles y Permisos",
      href: "/admin/roles-permissions",
      icon: Shield,
      description: "Sistema de permisos",
      requiredLevel: 80,
    },
    {
      title: "Contenido",
      href: "/admin/content",
      icon: FileText,
      description: "Gestión de contenido",
      requiredLevel: 80,
    },
    {
      title: "Editor de Contenido",
      href: "/admin/content-editor",
      icon: ImageIcon,
      description: "Editor avanzado",
      requiredLevel: 80,
    },
    {
      title: "Configuración App",
      href: "/admin/app-settings",
      icon: Settings,
      description: "Configuración de la aplicación",
      requiredLevel: 100,
    },
    {
      title: "Gestor de Temas",
      href: "/admin/theme-manager",
      icon: Palette,
      description: "Personalización de temas",
      requiredLevel: 80,
    },
    {
      title: "Contactos",
      href: "/admin/contacts",
      icon: Users,
      description: "Mensajes de contacto",
      requiredLevel: 80,
    },
  ]

  const cmsItems = [
    {
      title: "CMS Principal",
      href: "/cms",
      icon: Globe,
      description: "Sistema de gestión de contenido",
      requiredLevel: 999,
    },
    {
      title: "Editor Visual",
      href: "/cms?tab=visual-editor",
      icon: ImageIcon,
      description: "Editor visual de páginas",
      requiredLevel: 999,
    },
    {
      title: "Componentes",
      href: "/cms?tab=components",
      icon: ImageIcon,
      description: "Biblioteca de componentes",
      requiredLevel: 999,
    },
    {
      title: "Gestión de Contenido",
      href: "/cms?tab=content",
      icon: ImageIcon,
      description: "Administrar contenido",
      requiredLevel: 999,
    },
    {
      title: "Editor de Layouts",
      href: "/cms?tab=layout",
      icon: ImageIcon,
      description: "Diseñar layouts",
      requiredLevel: 999,
    },
    {
      title: "Base de Datos",
      href: "/cms?tab=database",
      icon: Database,
      description: "Gestión de base de datos",
      requiredLevel: 999,
    },
    {
      title: "APIs",
      href: "/cms?tab=api",
      icon: Code,
      description: "Gestión de APIs",
      requiredLevel: 999,
    },
    {
      title: "Gestor de Archivos",
      href: "/cms?tab=files",
      icon: ImageIcon,
      description: "Administrar archivos",
      requiredLevel: 999,
    },
    {
      title: "Personalizador",
      href: "/cms?tab=theme",
      icon: ImageIcon,
      description: "Personalizar tema",
      requiredLevel: 999,
    },
  ]

  const filterItemsByLevel = (items: any[]) => {
    return items.filter((item) => userLevel >= item.requiredLevel)
  }

  const getRoleIcon = (role: Role) => {
    if (role.level >= 999) return Code
    if (role.level >= 100) return Crown
    if (role.level >= 80) return Shield
    if (role.level >= 60) return Settings
    if (role.level >= 40) return Users
    return Key
  }

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Zap className="h-4 w-4" />
          </div>
          <span>INVOXA</span>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-auto">
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
          {/* Main Navigation */}
          <div className="py-2">
            <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Principal
            </div>
            {filterItemsByLevel(navigationItems).map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ${
                    pathname === item.href ? "bg-muted text-primary" : ""
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.title}
                </Link>
              )
            })}
          </div>

          {/* Advanced Features */}
          {filterItemsByLevel(advancedFeatures).length > 0 && (
            <div className="py-2">
              <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Funciones Avanzadas
              </div>
              {filterItemsByLevel(advancedFeatures).map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ${
                      pathname === item.href ? "bg-muted text-primary" : ""
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.title}
                  </Link>
                )
              })}
            </div>
          )}

          {/* System Features */}
          {filterItemsByLevel(systemFeatures).length > 0 && (
            <div className="py-2">
              <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Sistema
              </div>
              {filterItemsByLevel(systemFeatures).map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ${
                      pathname === item.href ? "bg-muted text-primary" : ""
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.title}
                  </Link>
                )
              })}
            </div>
          )}

          {/* Organization */}
          {filterItemsByLevel(organizationItems).length > 0 && (
            <div className="py-2">
              <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Organización
              </div>
              {filterItemsByLevel(organizationItems).map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ${
                      pathname === item.href ? "bg-muted text-primary" : ""
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.title}
                  </Link>
                )
              })}
            </div>
          )}

          {/* Admin Panel */}
          {canViewAdmin && (
            <div className="py-2">
              <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Administración
              </div>
              {filterItemsByLevel(adminItems).map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ${
                      pathname === item.href ? "bg-muted text-primary" : ""
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.title}
                  </Link>
                )
              })}
            </div>
          )}

          {/* CMS - Solo para desarrolladores */}
          {canUseCMS && userLevel >= 999 && (
            <div className="py-2">
              <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Code className="h-3 w-3" />
                CMS Desarrollador
              </div>
              {cmsItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ${
                      pathname.startsWith("/cms") && item.href.includes(pathname) ? "bg-muted text-primary" : ""
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.title}
                  </Link>
                )
              })}
            </div>
          )}
        </nav>
      </div>

      {/* User Info */}
      <div className="border-t p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={currentUser.avatar || "/placeholder.svg"} alt={currentUser.name} />
            <AvatarFallback>
              {currentUser.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{currentUser.name}</div>
            <div className="flex flex-wrap gap-1 mt-1">
              {userRoles.slice(0, 2).map((role) => {
                const Icon = getRoleIcon(role)
                return (
                  <Badge key={role.id} className={`${role.color} text-xs`}>
                    <Icon className="h-2 w-2 mr-1" />
                    {role.name}
                  </Badge>
                )
              })}
              {userRoles.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{userRoles.length - 2}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      {/* Desktop Sidebar */}
      <div className="hidden border-r bg-muted/40 md:block">
        <SidebarContent />
      </div>

      {/* Main Content */}
      <div className="flex flex-col">
        {/* Header */}
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          {/* Mobile Menu */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0 md:hidden bg-transparent">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col p-0">
              <SidebarContent />
            </SheetContent>
          </Sheet>

          {/* Breadcrumb or Title */}
          <div className="w-full flex-1">
            <h1 className="text-lg font-semibold md:text-2xl">
              {pathname === "/dashboard" && "Dashboard"}
              {pathname === "/dashboard/invoices" && "Facturas"}
              {pathname === "/dashboard/clients" && "Clientes"}
              {pathname === "/dashboard/expenses" && "Gastos"}
              {pathname === "/dashboard/reports" && "Reportes"}
              {pathname === "/dashboard/settings" && "Configuración"}
              {pathname.startsWith("/admin") && "Panel de Administración"}
              {pathname.startsWith("/cms") && "Sistema de Gestión de Contenido"}
              {pathname.startsWith("/organization") && "Organización"}
            </h1>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-4">
            {/* Quick Admin Access */}
            {canViewAdmin && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                    <Shield className="h-4 w-4" />
                    Admin
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Panel de Administración</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {filterItemsByLevel(adminItems).map((item) => {
                    const Icon = item.icon
                    return (
                      <DropdownMenuItem key={item.href} asChild>
                        <Link href={item.href} className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {item.title}
                        </Link>
                      </DropdownMenuItem>
                    )
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Quick CMS Access */}
            {canUseCMS && userLevel >= 999 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                    <Code className="h-4 w-4" />
                    CMS
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Sistema de Gestión de Contenido</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {cmsItems.slice(0, 6).map((item) => {
                    const Icon = item.icon
                    return (
                      <DropdownMenuItem key={item.href} asChild>
                        <Link href={item.href} className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {item.title}
                        </Link>
                      </DropdownMenuItem>
                    )
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <ModeToggle />

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={currentUser.avatar || "/placeholder.svg"} alt={currentUser.name} />
                    <AvatarFallback>
                      {currentUser.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <span className="sr-only">Toggle user menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{currentUser.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{currentUser.email}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {userRoles.map((role) => {
                        const Icon = getRoleIcon(role)
                        return (
                          <Badge key={role.id} className={`${role.color} text-xs`}>
                            <Icon className="h-2 w-2 mr-1" />
                            {role.name}
                          </Badge>
                        )
                      })}
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Configuración
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex items-center gap-2 text-red-600">
                  <LogOut className="h-4 w-4" />
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
