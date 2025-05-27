"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { 
  BarChart3,
  Upload,
  Target,
  CreditCard,
  PieChart,
  TrendingUp,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Plus
} from "lucide-react"
import { Button } from "@/components/ui/button"

const sidebarItems = [
  {
    title: "Overview",
    href: "/dashboard",
    icon: BarChart3,
  },
  {
    title: "Transactions",
    href: "/dashboard/transactions",
    icon: CreditCard,
  },
  {
    title: "Categories",
    href: "/dashboard/categories",
    icon: PieChart,
  },
  {
    title: "Goals",
    href: "/dashboard/goals",
    icon: Target,
  },
  {
    title: "Reports",
    href: "/dashboard/reports",
    icon: FileText,
  },
  {
    title: "Analytics",
    href: "/dashboard/analytics",
    icon: TrendingUp,
  },
  {
    title: "Import CSV",
    href: "/dashboard/import",
    icon: Upload,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div 
      className={cn(
        "h-screen bg-white border-r border-gray-200 transition-all duration-300 flex flex-col",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-gray-900">EasyBudget</span>
          </div>
        )}
        
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8 p-0 text-gray-500 hover:text-gray-900"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Quick Actions */}
      {!collapsed && (
        <div className="p-4 border-b border-gray-200">
          <Button size="sm" className="w-full justify-start bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Transaction
          </Button>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 py-4">
        <div className="space-y-1 px-2">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "group relative flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all",
                    "hover:bg-gray-100",
                    isActive 
                      ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600" 
                      : "text-gray-700 hover:text-gray-900"
                  )}
                >
                  <item.icon 
                    className={cn(
                      "h-5 w-5 flex-shrink-0",
                      isActive ? "text-blue-600" : "text-gray-500"
                    )} 
                  />
                  
                  {!collapsed && (
                    <span className="ml-3">
                      {item.title}
                    </span>
                  )}
                  
                  {/* Tooltip for collapsed state */}
                  {collapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                      {item.title}
                    </div>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-gray-200">
        <Link href="/dashboard/settings">
          <div
            className="group relative flex items-center rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-100 hover:text-gray-900"
          >
            <Settings className="h-5 w-5 flex-shrink-0 text-gray-500" />
            
            {!collapsed && (
              <span className="ml-3">
                Settings
              </span>
            )}
            
            {collapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                Settings
              </div>
            )}
          </div>
        </Link>
      </div>
    </div>
  )
} 