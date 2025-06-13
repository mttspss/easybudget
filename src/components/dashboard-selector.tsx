'use client'

import { useState } from 'react'
import { useDashboards } from '@/lib/dashboard-context'
import { Plus, Trash2 } from 'lucide-react'

export function DashboardSelector() {
  const { 
    dashboards, 
    activeDashboard, 
    loading, 
    createDashboard, 
    deleteDashboard, 
    setActiveDashboard 
  } = useDashboards()
  
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newDashboardName, setNewDashboardName] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const handleCreateDashboard = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newDashboardName.trim()) return

    setIsCreating(true)
    const result = await createDashboard(newDashboardName.trim())
    if (result) {
      setNewDashboardName('')
      setShowCreateForm(false)
    }
    setIsCreating(false)
  }

  const handleDeleteDashboard = async (id: string) => {
    if (confirm('Are you sure you want to delete this dashboard?')) {
      await deleteDashboard(id)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Dashboards</h3>
        <button
          onClick={() => setShowCreateForm(true)}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-1" />
          New
        </button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <form onSubmit={handleCreateDashboard} className="mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex gap-2">
            <input
              type="text"
              value={newDashboardName}
              onChange={(e) => setNewDashboardName(e.target.value)}
              placeholder="Dashboard name"
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              disabled={isCreating}
              autoFocus
            />
            <button
              type="submit"
              disabled={isCreating || !newDashboardName.trim()}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? 'Creating...' : 'Create'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCreateForm(false)
                setNewDashboardName('')
              }}
              className="px-4 py-2 bg-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-400"
              disabled={isCreating}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Dashboard List */}
      {dashboards.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No dashboards yet.</p>
          <p className="text-sm">Create your first dashboard to get started!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {dashboards.map((dashboard) => (
            <div
              key={dashboard.id}
              className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                activeDashboard?.id === dashboard.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setActiveDashboard(dashboard)}
            >
              <div>
                <h4 className="font-medium text-gray-900">{dashboard.name}</h4>
                <p className="text-sm text-gray-500">
                  Created {new Date(dashboard.created_at).toLocaleDateString()}
                </p>
              </div>
              
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleDeleteDashboard(dashboard.id)
                }}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                title="Delete dashboard"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Active Dashboard Info */}
      {activeDashboard && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            <span className="font-medium">Active:</span> {activeDashboard.name}
          </p>
        </div>
      )}
    </div>
  )
} 