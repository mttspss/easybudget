"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { 
  Bell,
  Search,
  LogOut,
  User,
  Settings,
  HelpCircle,
  Command
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

export function Header() {
  const { user, signOut } = useAuth()
  const router = useRouter()

  const handleProfileSettings = () => {
    router.push('/dashboard/profile')
  }

  const handlePreferences = () => {
    router.push('/dashboard/preferences')
  }

  return (
    <header className="h-16 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
      <div className="flex items-center justify-between h-full px-6">
        
        {/* Search */}
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
              <Search className="h-4 w-4 text-gray-400" />
              <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-xs font-mono text-gray-500 bg-gray-100 border border-gray-200 rounded">
                <Command className="h-3 w-3" />
                K
              </kbd>
            </div>
            <input
              type="text"
              placeholder="Search transactions, categories..."
              className="w-full pl-16 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          
          {/* Help */}
          <Button variant="ghost" size="sm" className="h-9 w-9 p-0 hover:bg-gray-100">
            <HelpCircle className="h-4 w-4 text-gray-500" />
          </Button>
          
          {/* Notifications */}
          <div className="relative">
            <Button variant="ghost" size="sm" className="h-9 w-9 p-0 hover:bg-gray-100">
              <Bell className="h-4 w-4 text-gray-500" />
            </Button>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white">
              <div className="w-full h-full bg-red-500 rounded-full animate-pulse"></div>
            </div>
          </div>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-9 px-3 hover:bg-gray-100">
                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <div className="text-sm font-semibold text-gray-900">
                      {user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'User'}
                    </div>
                    <div className="text-xs text-gray-500">Free Plan</div>
                  </div>
                  <Avatar className="h-8 w-8 ring-2 ring-gray-200">
                    <AvatarImage src={user?.user_metadata?.avatar_url || ""} alt="Profile" />
                    <AvatarFallback className="text-sm bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold">
                      {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </div>
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
    </header>
  )
} 