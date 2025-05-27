"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  DollarSign,
  BarChart3,
  Upload,
  Target,
  CreditCard,
  Settings,
  PieChart,
  TrendingUp,
  FileText,
  Search
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

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

  return (
    <div className="flex h-full w-64 flex-col bg-gray-900 text-white">
      {/* Header */}
      <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-800">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <DollarSign className="h-5 w-5 text-white" />
        </div>
        <span className="text-xl font-bold">EasyBudget</span>
      </div>

      {/* Search */}
      <div className="px-4 py-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search..."
            className="pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 pb-4">
        <div className="space-y-1">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-3 text-gray-300 hover:text-white hover:bg-gray-800",
                    isActive && "bg-gray-800 text-white"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.title}
                </Button>
              </Link>
            )
          })}
        </div>

        {/* Quick Stats */}
        <div className="mt-8 space-y-4">
          <div className="rounded-lg bg-gray-800 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">This Month</span>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold">$2,340</div>
              <div className="text-sm text-green-500">+12% vs last month</div>
            </div>
          </div>

          <div className="rounded-lg bg-gray-800 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Savings Goal</span>
              <Target className="h-4 w-4 text-blue-500" />
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold">68%</div>
              <div className="text-sm text-blue-500">$3,400 / $5,000</div>
            </div>
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-800 p-4">
        <Link href="/dashboard/settings">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-gray-300 hover:text-white hover:bg-gray-800"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Button>
        </Link>
      </div>
    </div>
  )
} 