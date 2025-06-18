"use client"

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from './auth-context'
import { useRouter } from 'next/navigation'

interface OnboardingContextType {
  isTourOpen: boolean
  currentStep: number
  startTour: () => void
  nextStep: () => void
  endTour: () => void
  goToStep: (step: number) => void
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined)

export const tourSteps = [
  {
    path: '/dashboard',
    title: "Welcome to easybudget!",
    description: "Let's take a quick tour to get you started on the path to financial clarity.",
  },
  {
    path: '/dashboard',
    title: "This is your Dashboard",
    description: "Here you'll see a complete overview of your finances. Everything in one place.",
  },
  {
    path: '/dashboard/import',
    title: "Your First Step: Import Data",
    description: "The magic begins when you import your transactions. Click 'Import' in the sidebar to upload your first CSV file.",
  },
  {
    path: '/dashboard/expenses',
    title: "Track Your Expenses",
    description: "See a detailed list of all your expenses, with smart AI-powered categorization.",
  },
  {
    path: '/dashboard/categories',
    title: "Manage Your Categories",
    description: "Customize your spending categories to perfectly match your lifestyle.",
  },
  {
    path: '/dashboard/goals',
    title: "Set Your Financial Goals",
    description: "Whether it's a vacation or a new car, track your progress towards your biggest goals.",
  },
  {
    path: '/dashboard',
    title: "You're all set!",
    description: "You're ready to take control of your money. Enjoy the clarity!",
  }
]


export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [isTourOpen, setIsTourOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const { user } = useAuth()
  const router = useRouter()

  const startTour = () => {
    setCurrentStep(0)
    setIsTourOpen(true)
    router.push(tourSteps[0].path)
  }

  const goToStep = useCallback((stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < tourSteps.length) {
        setCurrentStep(stepIndex)
        router.push(tourSteps[stepIndex].path)
    }
  }, [router])

  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      goToStep(currentStep + 1)
    } else {
      endTour()
    }
  }

  const endTour = async () => {
    setIsTourOpen(false)
    if (!user) return
    try {
      await supabase
        .from('user_preferences')
        .update({ has_completed_onboarding: true })
        .eq('user_id', user.id)
    } catch (error) {
      console.error("Failed to update onboarding status:", error)
    }
  }

  const value = { isTourOpen, currentStep, startTour, nextStep, endTour, goToStep }

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  )
}

export function useOnboarding() {
  const context = useContext(OnboardingContext)
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider')
  }
  return context
} 