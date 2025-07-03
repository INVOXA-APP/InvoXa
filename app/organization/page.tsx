import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Users,
  FileText,
  DollarSign,
  TrendingUp,
  Building,
  Globe,
  Shield,
  Activity,
  Clock,
  UserCheck,
  Briefcase,
  Target,
  Award,
} from "lucide-react"
import { OrganizationLayout } from "@/components/organization-layout"

export default function OrganizationDashboardPage() {
  return (
    <OrganizationLayout>
      <div className="space-y-8">
        {/* Organization Header */}
        <div className="relative overflow-hidden rounded-2xl glass-dark border border-teal-500/20 p-8">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500/20 to-cyan-500/20" />
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
                  <Building className="w-8 h-8 mr-3 text-teal-400" />
                  Acme Corporation
                </h1>
                <p className="text-gray-300 text-lg">Organization management and team overview</p>
              </div>
              <div className="hidden md:block">
                <div className="w-32 h-32 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full flex items-center justify-center animate-pulse">
                  <Globe className="w-16 h-16 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Organization Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: "Total Employees",
              value: "247",
              change: "+12",
              icon: Users,
              gradient: "from-teal-500 to-cyan-500",
            },
            {
              title: "Active Projects",
              value: "18",
              change: "+3",
              icon: Briefcase,
              gradient: "from-cyan-500 to-blue-500",
            },
            {
              title: "Monthly Revenue",
              value: "$284,592",
              change: "+18.2%",
              icon: DollarSign,
              gradient: "from-green-500 to-emerald-500",
            },
            {
              title: "Team Performance",
              value: "94%",
              change: "+2.1%",
              icon: Target,
              gradient: "from-purple-500 to-pink-500",
            },
          ].map((stat, index) => (
            <Card
              key={index}
              className="glass-dark border-teal-500/20 hover:border-teal-500/30 transition-all duration-300 group"
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
                  {stat.change} this month
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Department Performance */}
        <Card className="glass-dark border-teal-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Award className="w-5 h-5 mr-2 text-teal-400" />
              Department Performance
            </CardTitle>
            <CardDescription className="text-gray-400">Performance metrics across all departments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[
                { dept: "Sales", performance: 96, revenue: "$125,000", employees: 45 },
                { dept: "Marketing", performance: 89, revenue: "$78,000", employees: 32 },
                { dept: "Engineering", performance: 94, revenue: "$156,000", employees: 67 },
                { dept: "Support", performance: 91, revenue: "$45,000", employees: 28 },
                { dept: "HR", performance: 87, revenue: "$32,000", employees: 15 },
              ].map((dept, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium text-white">{dept.dept}</span>
                      <Badge variant="outline" className="text-xs text-gray-400 border-gray-600">
                        {dept.employees} employees
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-300">{dept.revenue}</span>
                      <span className="text-sm text-white">{dept.performance}%</span>
                    </div>
                  </div>
                  <Progress value={dept.performance} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Organization Activities */}
          <Card className="glass-dark border-teal-500/20">
            <CardHeader>
              <CardTitle className="text-white">Recent Activities</CardTitle>
              <CardDescription className="text-gray-400">
                Latest organization-wide activities and updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  action: "New employee onboarded: Sarah Johnson (Marketing)",
                  time: "2 hours ago",
                  type: "employee",
                  status: "success",
                },
                {
                  action: "Q4 budget approved by finance team",
                  time: "5 hours ago",
                  type: "finance",
                  status: "success",
                },
                {
                  action: "Security training completed by 95% of staff",
                  time: "1 day ago",
                  type: "training",
                  status: "success",
                },
                {
                  action: "New project 'Phoenix' assigned to Engineering",
                  time: "2 days ago",
                  type: "project",
                  status: "info",
                },
                {
                  action: "Monthly performance reviews scheduled",
                  time: "3 days ago",
                  type: "hr",
                  status: "info",
                },
              ].map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-teal-500/5 transition-colors"
                >
                  <div
                    className={`w-2 h-2 rounded-full ${
                      activity.status === "success"
                        ? "bg-green-400"
                        : activity.status === "warning"
                          ? "bg-yellow-400"
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
                          activity.type === "employee"
                            ? "border-teal-500 text-teal-400"
                            : activity.type === "finance"
                              ? "border-green-500 text-green-400"
                              : activity.type === "training"
                                ? "border-blue-500 text-blue-400"
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

          {/* Team Overview */}
          <Card className="glass-dark border-teal-500/20">
            <CardHeader>
              <CardTitle className="text-white">Team Overview</CardTitle>
              <CardDescription className="text-gray-400">Current team status and metrics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 rounded-lg bg-teal-500/10">
                  <UserCheck className="w-8 h-8 text-teal-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">234</div>
                  <div className="text-xs text-gray-400">Active Today</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-cyan-500/10">
                  <Activity className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">18</div>
                  <div className="text-xs text-gray-400">In Meetings</div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-medium text-white">Department Distribution</h4>
                {[
                  { name: "Engineering", count: 67, percentage: 27 },
                  { name: "Sales", count: 45, percentage: 18 },
                  { name: "Marketing", count: 32, percentage: 13 },
                  { name: "Support", count: 28, percentage: 11 },
                  { name: "Others", count: 75, percentage: 31 },
                ].map((dept, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">{dept.name}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-700 rounded-full h-2">
                        <div className="bg-teal-500 h-2 rounded-full" style={{ width: `${dept.percentage}%` }} />
                      </div>
                      <span className="text-sm text-white w-8">{dept.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Organization Actions */}
        <Card className="glass-dark border-teal-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Shield className="w-5 h-5 mr-2 text-teal-400" />
              Quick Actions
            </CardTitle>
            <CardDescription className="text-gray-400">Common organization management tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: "Add Employee", icon: Users, href: "/organization/employees" },
                { name: "View Invoices", icon: FileText, href: "/organization/invoices" },
                { name: "Manage Permissions", icon: Shield, href: "/organization/permissions" },
                { name: "Analytics", icon: TrendingUp, href: "/organization/analytics" },
              ].map((action, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="h-20 flex flex-col items-center justify-center space-y-2 text-gray-300 hover:text-white hover:bg-teal-500/10 transition-all duration-300 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <action.icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs text-center">{action.name}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </OrganizationLayout>
  )
}
