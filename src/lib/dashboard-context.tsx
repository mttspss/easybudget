"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabase'

export interface Dashboard {
  id: string
  user_id: string
  name: string
  created_at: string
  updated_at: string
}

interface DashboardContextType {
  dashboards: Dashboard[]
  activeDashboard: Dashboard | null
  loading: boolean
  createDashboard: (name: string) => Promise<Dashboard | null>
  deleteDashboard: (id: string) => Promise<boolean>
  setActiveDashboard: (dashboard: Dashboard | null) => void
  refreshDashboards: () => Promise<void>
}

const DashboardContext = createContext<DashboardContextType | null>(null)

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [dashboards, setDashboards] = useState<Dashboard[]>([])
  const [activeDashboard, setActiveDashboard] = useState<Dashboard | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshDashboards = async () => {
    try {
      setLoading(true)
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('dashboards')
        .select('*')
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error fetching dashboards:', error)
        return
      }

      setDashboards(data || [])
      
      // Set first dashboard as active if none selected
      if (!activeDashboard && data && data.length > 0) {
        setActiveDashboard(data[0])
      }
    } catch (error) {
      console.error('Error in refreshDashboards:', error)
    } finally {
      setLoading(false)
    }
  }

  const createDashboard = async (name: string): Promise<Dashboard | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const { data, error } = await supabase
        .from('dashboards')
        .insert([{ name, user_id: user.id }])
        .select()
        .single()

      if (error) {
        console.error('Error creating dashboard:', error)
        return null
      }

      await refreshDashboards()
      return data
    } catch (error) {
      console.error('Error in createDashboard:', error)
      return null
    }
  }

  const deleteDashboard = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('dashboards')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting dashboard:', error)
        return false
      }

      // If we deleted the active dashboard, clear it
      if (activeDashboard?.id === id) {
        setActiveDashboard(null)
      }

      await refreshDashboards()
      return true
    } catch (error) {
      console.error('Error in deleteDashboard:', error)
      return false
    }
  }

  useEffect(() => {
    refreshDashboards()
  }, [refreshDashboards])

  const value: DashboardContextType = {
    dashboards,
    activeDashboard,
    loading,
    createDashboard,
    deleteDashboard,
    setActiveDashboard,
    refreshDashboards,
  }

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboards() {
  const context = useContext(DashboardContext)
  if (!context) {
    throw new Error('useDashboards must be used within a DashboardProvider')
  }
  return context
} 