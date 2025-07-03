import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Users,
  Shield,
  Database,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Server,
  Cpu,
  HardDrive,
  Wifi,
  Crown,
  Settings,
  FileText,
} from "lucide-react"
import { AdminLayout } from "@/components/admin-layout"

export default function AdminDashboardPage() {
  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Admin Header */}
        <div className="relative overflow-hidden rounded-2xl glass-dark border border-red-500/20 p-8">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-orange-500/20" />
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
                  <Crown className="w-8 h-8 mr-3 text-red-400" />
                  Admin Dashboard
                </h1>
                <p className="text-gray-300 text-lg">System overview and administrative controls</p>
              </div>
              <div className="hidden md:block">
                <div className="w-32 h-32 bg-gradient-to-br from-red-400 to-orange-500 rounded-full flex items-center justify-center animate-pulse">
                  <Shield className="w-16 h-16 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* System Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: "Total Users",
              value: "12,847",
              change: "+12.5%",
              icon: Users,
              gradient: "from-red-500 to-pink-500",
            },
            {
              title: "Active Sessions",
              value: "3,421",
              change: "+8.2%",
              icon: Activity,
              gradient: "from-orange-500 to-red-500",
            },
            {
              title: "System Health",
              value: "98.7%",
              change: "+0.3%",
              icon: CheckCircle,
              gradient: "from-green-500 to-emerald-500",
            },
            {
              title: "Security Alerts",
              value: "2",
              change: "-5",
              icon: AlertTriangle,
              gradient: "from-yellow-500 to-orange-500",
            },
          ].map((stat, index) => (
            <Card
              key={index}
              className="glass-dark border-red-500/20 hover:border-red-500/30 transition-all duration-300 group"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">{stat.title}</CardTitle>
                <div
                  className={`w-10 h-10 rounded-lg bg-gradient-to-r ${stat.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                >
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <p className="text-xs text-green-400 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {stat.change} from last week
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* System Performance */}
        <Card className="glass-dark border-red-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Server className="w-5 h-5 mr-2 text-red-400" />
              System Performance
            </CardTitle>
            <CardDescription className="text-gray-400">Real-time server metrics and resource usage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Cpu className="w-4 h-4 text-red-400" />
                    <span className="text-sm text-gray-300">CPU Usage</span>
                  </div>
                  <span className="text-sm text-white">67%</span>
                </div>
                <Progress value={67} className="h-2" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <HardDrive className="w-4 h-4 text-orange-400" />
                    <span className="text-sm text-gray-300">Memory</span>
                  </div>
                  <span className="text-sm text-white">84%</span>
                </div>
                <Progress value={84} className="h-2" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Database className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm text-gray-300">Storage</span>
                  </div>
                  <span className="text-sm text-white">45%</span>
                </div>
                <Progress value={45} className="h-2" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Wifi className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-gray-300">Network</span>
                  </div>
                  <span className="text-sm text-white">92%</span>
                </div>
                <Progress value={92} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Admin Activities */}
          <Card className="glass-dark border-red-500/20">
            <CardHeader>
              <CardTitle className="text-white">Recent Admin Activities</CardTitle>
              <CardDescription className="text-gray-400">
                Latest administrative actions and system events
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  action: "User permissions updated for john@example.com",
                  time: "5 minutes ago",
                  type: "user",
                  status: "success",
                },
                {
                  action: "System backup completed successfully",
                  time: "1 hour ago",
                  type: "system",
                  status: "success",
                },
                {
                  action: "Security scan detected 2 vulnerabilities",
                  time: "2 hours ago",
                  type: "security",
                  status: "warning",
                },
                {
                  action: "Database optimization completed",
                  time: "4 hours ago",
                  type: "database",
                  status: "success",
                },
                {
                  action: "New admin user created: admin2@invoxa.com",
                  time: "6 hours ago",
                  type: "user",
                  status: "info",
                },
              ].map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-red-500/5 transition-colors"
                >
                  <div
                    className={`w-2 h-2 rounded-full ${
                      activity.status === "success"
                        ? "bg-green-400"
                        : activity.status === "warning"
                          ? "bg-yellow-400"
                          : activity.status === "error"
                            ? "bg-red-400"
                            : "bg-blue-400"
                    }`}
                  />
                  <div className="flex-1">
                    <p className="text-sm text-white">{activity.action}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-400">{activity.time}</span>
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          activity.type === "security"
                            ? "border-red-500 text-red-400"
                            : activity.type === "system"
                              ? "border-blue-500 text-blue-400"
                              : activity.type === "database"
                                ? "border-green-500 text-green-400"
                                : "border-gray-500 text-gray-400"
                        }`}
                      >
                        {activity.type}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Admin Actions */}
          <Card className="glass-dark border-red-500/20">
            <CardHeader>
              <CardTitle className="text-white">Quick Actions</CardTitle>
              <CardDescription className="text-gray-400">Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { name: "Manage Users", icon: Users, href: "/admin/users" },
                  { name: "System Settings", icon: Settings, href: "/admin/app-settings" },
                  { name: "Content Editor", icon: FileText, href: "/admin/content-editor" },
                  { name: "Security Center", icon: Shield, href: "/admin/security" },
                  { name: "Database Admin", icon: Database, href: "/admin/database" },
                  { name: "Theme Manager", icon: Settings, href: "/admin/theme-manager" },
                ].map((action, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    className="h-20 flex flex-col items-center justify-center space-y-2 text-gray-300 hover:text-white hover:bg-red-500/10 transition-all duration-300 group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <action.icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs text-center">{action.name}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Status */}
        <Card className="glass-dark border-red-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Activity className="w-5 h-5 mr-2 text-red-400" />
              System Status
            </CardTitle>
            <CardDescription className="text-gray-400">Current status of all system components</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { service: "Web Server", status: "operational", uptime: "99.9%" },
                { service: "Database", status: "operational", uptime: "99.8%" },
                { service: "API Gateway", status: "operational", uptime: "99.7%" },
                { service: "File Storage", status: "operational", uptime: "99.9%" },
                { service: "Email Service", status: "degraded", uptime: "98.2%" },
                { service: "Backup System", status: "operational", uptime: "99.5%" },
              ].map((service, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <div>
                    <p className="text-sm font-medium text-white">{service.service}</p>
                    <p className="text-xs text-gray-400">Uptime: {service.uptime}</p>
                  </div>
                  <div
                    className={`w-3 h-3 rounded-full ${
                      service.status === "operational"
                        ? "bg-green-400"
                        : service.status === "degraded"
                          ? "bg-yellow-400"
                          : "bg-red-400"
                    }`}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
