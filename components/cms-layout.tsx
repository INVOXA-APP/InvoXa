"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Settings, LogOut, User, Crown, Shield, Zap, Bell, HelpCircle } from "lucide-react"

interface CMSLayoutProps {
  children: React.ReactNode
}

export function CMSLayout({ children }: CMSLayoutProps) {
  const router = useRouter()
  const [userRole, setUserRole] = useState<"admin" | "developer">("developer")

  // Check user permissions
  useEffect(() => {
    // In a real app, you'd check the user's role from your auth system
    const checkPermissions = () => {
      // Mock check - in real app, get from session/JWT
      const mockUser = { role: "developer" } // or "admin"

      if (mockUser.role !== "admin" && mockUser.role !== "developer") {
        router.push("/dashboard")
        return
      }

      setUserRole(mockUser.role as "admin" | "developer")
    }

    checkPermissions()
  }, [router])

  return (
    <div className="min-h-screen bg-background">
      {/* CMS Navigation Bar */}
      <div className="border-b bg-card">
        <div className="flex h-16 items-center px-4 justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/dashboard")}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Button>

            <div className="h-6 w-px bg-border" />

            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Crown className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="font-semibold">CMS Panel</h2>
                <p className="text-xs text-muted-foreground">Content Management</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Role Badge */}
            <Badge variant={userRole === "admin" ? "destructive" : "secondary"} className="flex items-center space-x-1">
              {userRole === "admin" ? <Shield className="w-3 h-3" /> : <Zap className="w-3 h-3" />}
              <span className="capitalize">{userRole}</span>
            </Badge>

            {/* Notifications */}
            <Button variant="ghost" size="sm">
              <Bell className="w-4 h-4" />
            </Button>

            {/* Help */}
            <Button variant="ghost" size="sm">
              <HelpCircle className="w-4 h-4" />
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder-32px.png" alt="User" />
                    <AvatarFallback>{userRole === "admin" ? "AD" : "DV"}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {userRole === "admin" ? "Administrator" : "Developer"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">{userRole}@invoxa.com</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>CMS Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/dashboard")}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Exit CMS</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* CMS Content */}
      <main className="flex-1">{children}</main>
    </div>
  )
}
