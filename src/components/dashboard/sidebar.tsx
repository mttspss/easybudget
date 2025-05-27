"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  BarChart3,
  CreditCard,
  PieChart,
  Target,
  FileText,
  TrendingUp,
  Upload,
  Settings,
  Wallet
} from "lucide-react"

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
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  }
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="w-56 bg-white border-r border-slate-200 flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-600 rounded-lg">
            <Wallet className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold text-slate-900">EasyBudget</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3">
        <div className="space-y-1">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                  isActive
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <item.icon className={cn(
                  "h-4 w-4",
                  isActive ? "text-emerald-600" : "text-slate-500"
                )} />
                <span>{item.title}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Bottom section */}
      <div className="p-3 border-t border-slate-200">
        <div className="bg-slate-50 rounded-lg p-3">
          <div className="text-xs font-semibold text-slate-900 mb-1">Monthly Budget</div>
          <div className="text-lg font-bold text-slate-900">$3,240</div>
          <div className="text-xs text-slate-600">Used this month</div>
          <div className="mt-2 w-full bg-slate-200 rounded-full h-1">
            <div className="bg-emerald-600 h-1 rounded-full w-2/3"></div>
          </div>
        </div>
      </div>
    </div>
  )
} 