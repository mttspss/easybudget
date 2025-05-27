"use client"

import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { 
  Bell,
  Upload,
  LogOut,
  User,
  Settings,
  ChevronDown,
  Sun
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface HeaderProps {
  title?: string
}

export function Header({ title }: HeaderProps) {
  const { data: session } = useSession()

  return (
    <header 
      className="sticky top-0 z-40 h-16 flex items-center justify-between px-8 bg-white border-b"
      style={{
        borderColor: 'var(--card-border)',
        boxShadow: 'var(--elevation-1)'
      }}
    >
      <div className="flex items-center gap-6">
        {title && (
          <h1 
            className="font-bold"
            style={{ 
              fontSize: 'var(--text-lg)',
              color: 'var(--text-primary)'
            }}
          >
            {title}
          </h1>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <Button 
          variant="ghost" 
          size="sm"
          className="h-8 w-8 p-0"
          style={{ color: 'var(--text-secondary)' }}
        >
          <Sun className="h-4 w-4" />
        </Button>

        {/* CSV Import */}
        <Button 
          variant="outline" 
          size="sm"
          className="gap-2"
          style={{
            borderColor: 'var(--card-border)',
            color: 'var(--text-primary)'
          }}
        >
          <Upload className="h-4 w-4" />
          Import
        </Button>

        {/* Notifications */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="relative h-8 w-8 p-0"
          style={{ color: 'var(--text-secondary)' }}
        >
          <Bell className="h-4 w-4" />
          <div 
            className="absolute -top-1 -right-1 h-2 w-2 rounded-full"
            style={{ backgroundColor: 'var(--error)' }}
          />
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="flex items-center gap-2 h-8 px-2"
              style={{ color: 'var(--text-primary)' }}
            >
              <div 
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium text-white"
                style={{ backgroundColor: 'var(--mint)' }}
              >
                {session?.user?.name?.charAt(0) || 'U'}
              </div>
              <span className="text-sm font-medium hidden md:block">
                {session?.user?.name?.split(' ')[0] || 'User'}
              </span>
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut()}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
} 