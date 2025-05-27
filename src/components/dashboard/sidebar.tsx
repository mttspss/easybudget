"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { 
  DollarSign,
  BarChart3,
  Upload,
  Target,
  CreditCard,
  PieChart,
  TrendingUp,
  FileText,
  Settings,
  Menu,
  X
} from "lucide-react"
import { Button } from "@/components/ui/button"

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: BarChart3,
  },
  {
    title: "Import CSV",
    href: "/dashboard/import",
    icon: Upload,
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
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div 
      className={cn(
        "h-screen transition-all duration-300 flex flex-col",
        collapsed ? "w-20" : "w-60"
      )}
      style={{ 
        backgroundColor: 'var(--deep-blue)',
        transition: 'var(--transition-fast)'
      }}
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-white/10">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: 'var(--mint)' }}
            >
              <DollarSign className="h-5 w-5 text-white" />
            </div>
            <span className="text-white font-semibold text-lg">EasyBudget</span>
          </div>
        )}
        
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="text-white hover:bg-white/10 p-2"
        >
          {collapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6">
        <div className="space-y-2 px-3">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "group relative flex items-center rounded-xl p-3 transition-all",
                    "hover:bg-white/5",
                    isActive && "bg-white/10"
                  )}
                  style={{
                    backgroundColor: isActive ? 'var(--mint)' : undefined,
                    borderRadius: 'var(--radius-sm)'
                  }}
                >
                  <item.icon 
                    className={cn(
                      "h-5 w-5 flex-shrink-0",
                      isActive ? "text-white" : "text-white/70"
                    )} 
                  />
                  
                  {!collapsed && (
                    <span 
                      className={cn(
                        "ml-3 text-sm font-medium",
                        isActive ? "text-white" : "text-white/80"
                      )}
                    >
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
      <div className="p-3 border-t border-white/10">
        <Link href="/dashboard/settings">
          <div
            className="group relative flex items-center rounded-xl p-3 transition-all hover:bg-white/5"
            style={{ borderRadius: 'var(--radius-sm)' }}
          >
            <Settings className="h-5 w-5 flex-shrink-0 text-white/70" />
            
            {!collapsed && (
              <span className="ml-3 text-sm font-medium text-white/80">
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