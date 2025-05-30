"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { 
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  Target,
  FileText,
  TrendingUp,
  Upload,
  Settings,
  Layers
} from "lucide-react"

const sidebarItems = [
  {
    title: "Overview",
    href: "/dashboard",
    icon: BarChart3,
  },
  {
    title: "Income",
    href: "/dashboard/income",
    icon: ArrowUpRight,
  },
  {
    title: "Expenses",
    href: "/dashboard/expenses",
    icon: ArrowDownRight,
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
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  }
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg overflow-hidden">
            <Image src="/mainlogo.svg" alt="EasyBudget Logo" width={40} height={40} className="w-full h-full object-contain" />
          </div>
          <div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">easybudget</span>
            <div className="text-xs text-gray-500">Financial Dashboard</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-1">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200",
                  isActive
                    ? "bg-blue-50 text-blue-700 shadow-sm border border-blue-100"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <item.icon className={cn(
                  "h-5 w-5",
                  isActive ? "text-blue-600" : "text-gray-500"
                )} />
                <span>{item.title}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                )}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Bottom section */}
      <div className="p-4 border-t border-gray-100">
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-1.5 bg-white rounded-lg shadow-sm">
              <Layers className="h-4 w-4 text-gray-600" />
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">Monthly Budget</div>
              <div className="text-xs text-gray-500">Track your spending</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-gray-900">$3,847</span>
              <span className="text-xs text-gray-500">of $5,500</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full w-3/4 relative">
                <div className="absolute right-0 top-0 w-2 h-2 bg-blue-600 rounded-full"></div>
              </div>
            </div>
            <div className="text-xs text-gray-600">$1,653 remaining this month</div>
          </div>
        </div>
      </div>
    </div>
  )
} 