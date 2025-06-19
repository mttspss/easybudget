'use client'

import { useState } from 'react'
import { useDashboards } from '@/lib/dashboard-context'
import { useSubscription } from '@/lib/subscription-context'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { 
  Plus, 
  ChevronDown, 
  Trash2, 
  Check,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface DashboardHeaderProps {
  user: any
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const router = useRouter()
  const { 
    dashboards, 
    activeDashboard, 
    createDashboard, 
    deleteDashboard, 
    setActiveDashboard 
  } = useDashboards()
  const { canCreateDashboard } = useSubscription()
  
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newDashboardName, setNewDashboardName] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const handleCreateDashboard = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newDashboardName.trim()) return

    setIsCreating(true)
    const result = await createDashboard(newDashboardName.trim())
    if (result) {
      setNewDashboardName('')
      setShowCreateDialog(false)
      setActiveDashboard(result)
    }
    setIsCreating(false)
  }

  const handleDeleteDashboard = async (id: string) => {
    if (confirm('Are you sure you want to delete this dashboard?')) {
      await deleteDashboard(id)
    }
  }

  const handleAddTransaction = (type: 'income' | 'expense') => {
    // Navigate to the appropriate page with a flag to open the dialog
    const targetPage = type === 'income' ? '/dashboard/income' : '/dashboard/expenses'
    router.push(`${targetPage}?add=true`)
  }

  // Dashboard name to show (default or active dashboard name)
  const displayName = activeDashboard?.name || 'Main Dashboard'

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Welcome back, {user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'there'}! 👋
          </h1>
          <p className="text-gray-600 text-xs">
            Here&apos;s your financial overview for {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* Dashboard Selector */}
        <div className="hidden md:flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                <span className="text-sm font-medium">{displayName}</span>
                <ChevronDown className="h-3 w-3 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
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
      </div>

      <div className="flex items-center gap-2">
        {/* Create Dashboard Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="inline-block">
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      disabled={!canCreateDashboard(dashboards.length)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      New Dashboard
                    </Button>
                  </DialogTrigger>
                </div>
              </TooltipTrigger>
              {!canCreateDashboard(dashboards.length) && (
                <TooltipContent>
                  <p>Upgrade your plan to create more dashboards.</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Dashboard</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateDashboard} className="space-y-4">
              <div>
                <label htmlFor="dashboard-name" className="block text-sm font-medium text-gray-700 mb-2">
                  Dashboard Name
                </label>
                <Input
                  id="dashboard-name"
                  type="text"
                  value={newDashboardName}
                  onChange={(e) => setNewDashboardName(e.target.value)}
                  placeholder="Enter dashboard name"
                  disabled={isCreating}
                  autoFocus
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateDialog(false)
                    setNewDashboardName('')
                  }}
                  disabled={isCreating}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isCreating || !newDashboardName.trim()}
                >
                  {isCreating ? 'Creating...' : 'Create Dashboard'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Add Transaction Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add Transaction
              <ChevronDown className="h-3 w-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleAddTransaction('income')}>
              <ArrowUpRight className="h-4 w-4 mr-2 text-green-600" />
              Add Income
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAddTransaction('expense')}>
              <ArrowDownRight className="h-4 w-4 mr-2 text-red-600" />
              Add Expense
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
} 