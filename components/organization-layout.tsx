"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Users,
  Settings,
  FileText,
  BarChart3,
  Shield,
  Building,
  Bell,
  Search,
  Menu,
  X,
  LogOut,
  User,
  Globe,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Organization", href: "/organization", icon: Building },
  { name: "Employees", href: "/organization/employees", icon: Users },
  { name: "Invoices", href: "/organization/invoices", icon: FileText },
  { name: "Permissions", href: "/organization/permissions", icon: Shield },
  { name: "Analytics", href: "/organization/analytics", icon: BarChart3 },
  { name: "Settings", href: "/organization/settings", icon: Settings },
]

interface OrganizationLayoutProps {
  children: React.ReactNode
}

export function OrganizationLayout({ children }: OrganizationLayoutProps) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-900 via-cyan-900 to-teal-900">
      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col glass-dark border-r border-teal-500/20">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-teal-500/20">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <Building className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text-org">ORG</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-white hover:bg-teal-500/20"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Organization Info */}
          <div className="mx-3 mt-4 p-3 bg-teal-500/20 border border-teal-500/30 rounded-lg">
            <div className="flex items-center space-x-2">
              <Globe className="w-4 h-4 text-teal-400" />
              <span className="text-xs text-teal-300 font-medium">Acme Corporation</span>
            </div>
            <p className="text-xs text-teal-200 mt-1">Organization Management</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                    isActive
                      ? "bg-gradient-to-r from-teal-500/20 to-cyan-500/20 text-white border border-teal-500/30"
                      : "text-gray-300 hover:text-white hover:bg-teal-500/10",
                  )}
                >
                  <item.icon
                    className={cn(
                      "mr-3 h-5 w-5 transition-colors",
                      isActive ? "text-teal-400" : "text-gray-400 group-hover:text-white",
                    )}
                  />
                  {item.name}
                  {isActive && <div className="ml-auto w-2 h-2 bg-teal-400 rounded-full animate-pulse" />}
                </Link>
              )
            })}
          </nav>

          {/* User
                  )}
                </Link>
              )
            })}
          </nav>

          {/* User Profile */}
          <div className="border-t border-teal-500/20 p-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start text-white hover:bg-teal-500/10">
                  <Avatar className="h-8 w-8 mr-3">
                    <AvatarImage src="/placeholder-32px.png" />
                    <AvatarFallback className="bg-teal-500 text-white">OM</AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <div className="text-sm font-medium">Org Manager</div>
                    <div className="text-xs text-gray-400">manager@acme.com</div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-slate-800 border-gray-700 text-white">
                <DropdownMenuLabel>Organization Account</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-700" />
                <DropdownMenuItem className="hover:bg-gray-700">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-gray-700">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-700" />
                <DropdownMenuItem className="hover:bg-gray-700 text-red-400">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 items-center gap-x-4 glass-dark border-b border-teal-500/20 px-4 sm:gap-x-6 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-white hover:bg-teal-500/20"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="relative flex flex-1 items-center">
              <Search className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-gray-400 pl-3" />
              <input
                className="block h-full w-full border-0 bg-teal-500/10 py-0 pl-10 pr-0 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-teal-500 sm:text-sm rounded-lg"
                placeholder="Search organization..."
                type="search"
              />
            </div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <Button variant="ghost" size="icon" className="text-white hover:bg-teal-500/20">
                <Bell className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="animate-fade-in">{children}</div>
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  )
}
