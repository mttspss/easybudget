'use client'

import { useDashboards } from '@/lib/dashboard-context'
import { Button } from '@/components/ui/button'
import { 
  ChevronDown, 
  Trash2, 
  Check,
  Database
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function DashboardIndicator() {
  const { 
    dashboards, 
    activeDashboard, 
    deleteDashboard, 
    setActiveDashboard 
  } = useDashboards()

  const handleDeleteDashboard = async (id: string) => {
    if (confirm('Are you sure you want to delete this dashboard?')) {
      await deleteDashboard(id)
    }
  }

  // Dashboard name to show (default or active dashboard name)
  const displayName = activeDashboard?.name || 'Main Dashboard'

  return (
    <div className="flex items-center gap-2 text-sm text-gray-600">
      <Database className="h-4 w-4" />
      <span className="hidden sm:inline">Currently showing:</span>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-7 text-xs">
            <span className="font-medium">{displayName}</span>
            <ChevronDown className="h-3 w-3 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {/* Main Dashboard Option */}
          <DropdownMenuItem 
            onClick={() => setActiveDashboard(null)}
            className={`${!activeDashboard ? 'bg-blue-50' : ''}`}
          >
            <div className="flex items-center justify-between w-full">
              <span>Main Dashboard</span>
              {!activeDashboard && <Check className="h-4 w-4 text-blue-600" />}
            </div>
          </DropdownMenuItem>

          {dashboards.length > 0 && <DropdownMenuSeparator />}

          {/* Custom Dashboards */}
          {dashboards.map((dashboard) => (
            <DropdownMenuItem 
              key={dashboard.id}
              onClick={() => setActiveDashboard(dashboard)}
              className={`${activeDashboard?.id === dashboard.id ? 'bg-blue-50' : ''}`}
            >
              <div className="flex items-center justify-between w-full">
                <span>{dashboard.name}</span>
                <div className="flex items-center gap-2">
                  {activeDashboard?.id === dashboard.id && (
                    <Check className="h-4 w-4 text-blue-600" />
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteDashboard(dashboard.id)
                    }}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    title="Delete dashboard"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
} 