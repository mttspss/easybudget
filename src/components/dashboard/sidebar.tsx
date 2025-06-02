"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
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
  Layers,
  User,
  LogOut,
  HelpCircle,
  MoreHorizontal
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

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
  const { user, signOut } = useAuth()
  const router = useRouter()

  const handleProfileSettings = () => {
    router.push('/dashboard/profile')
  }

  const handlePreferences = () => {
    router.push('/dashboard/preferences')
  }

  return (
    <div className="w-64 flex flex-col">
      {/* Logo - Now clickable */}
      <div className="p-4">
        <Link href="/" className="block">
          <div className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer">
            <div className="w-8 h-8 rounded-lg overflow-hidden">
              <Image src="/mainlogo.svg" alt="EasyBudget Logo" width={32} height={32} className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="text-lg font-bold">
                <span className="text-black">easybudget</span>
                <span className="text-green-400">.ing</span>
              </span>
            </div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4">
        <div className="space-y-1">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
                  isActive
                    ? "bg-blue-50 text-blue-700 shadow-sm border border-blue-100"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <item.icon className={cn(
                  "h-4 w-4",
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
      <div className="p-4 space-y-4">
        {/* Monthly Budget */}
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

        {/* User Profile - Enhanced with 3-dot menu */}
        <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors group">
          <Avatar className="h-8 w-8 ring-2 ring-gray-200">
            <AvatarImage src={user?.user_metadata?.avatar_url || ""} alt="Profile" />
            <AvatarFallback className="text-sm bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold">
              {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="text-left flex-1 min-w-0">
            <div className="text-sm font-semibold text-gray-900 truncate">
              {user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'User'}
            </div>
            <div className="text-xs text-gray-500">Free Plan</div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 hover:bg-gray-100 transition-opacity"
              >
                <MoreHorizontal className="h-4 w-4 text-gray-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white border border-gray-200 shadow-lg">
              <DropdownMenuLabel className="text-sm">
                <div className="space-y-1">
                  <p className="font-semibold text-gray-900">{user?.user_metadata?.full_name || user?.email}</p>
                  <p className="text-gray-500 text-xs">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-100" />
              <DropdownMenuItem 
                className="text-sm py-2 focus:bg-gray-50 cursor-pointer"
                onClick={handleProfileSettings}
              >
                <User className="mr-3 h-4 w-4 text-gray-500" />
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-sm py-2 focus:bg-gray-50 cursor-pointer"
                onClick={handlePreferences}
              >
                <Settings className="mr-3 h-4 w-4 text-gray-500" />
                Preferences
              </DropdownMenuItem>
              <DropdownMenuItem className="text-sm py-2 focus:bg-gray-50">
                <HelpCircle className="mr-3 h-4 w-4 text-gray-500" />
                Help & Support
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-100" />
              <DropdownMenuItem 
                className="text-sm py-2 text-red-600 focus:text-red-600 focus:bg-red-50"
                onClick={() => signOut()}
              >
                <LogOut className="mr-3 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
} 