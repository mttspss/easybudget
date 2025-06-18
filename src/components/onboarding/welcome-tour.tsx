"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { AnimatePresence, motion } from 'framer-motion'
import { Rocket, BarChart3, Wallet, Upload, PartyPopper } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface WelcomeTourProps {
  isOpen: boolean
  onClose: () => void
}

const tourSteps = [
  {
    icon: Rocket,
    title: "Welcome to easybudget!",
    description: "Let's take a quick tour to get you started on the path to financial clarity.",
    buttonText: "Let's go!",
  },
  {
    icon: Wallet,
    title: "This is your Dashboard",
    description: "Here you'll see a complete overview of your finances: balance, income, expenses, and savings. Everything in one place.",
    buttonText: "Next",
  },
  {
    icon: Upload,
    title: "Your First Step: Import Data",
    description: "The magic begins when you import your transactions. Click 'Import' in the sidebar to upload your first CSV file.",
    buttonText: "Got it, next",
    action: 'highlight-import'
  },
  {
    icon: BarChart3,
    title: "Watch Your Finances Come to Life",
    description: "Once imported, our AI will automatically categorize your transactions and generate beautiful, insightful charts.",
    buttonText: "Let's do this!",
  },
  {
    icon: PartyPopper,
    title: "You're all set!",
    description: "You're ready to take control of your money. Enjoy the clarity!",
    buttonText: "Finish Tour",
  }
]

export function WelcomeTour({ isOpen, onClose }: WelcomeTourProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const { user } = useAuth()
  const router = useRouter()
  
  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleFinish()
    }
  }
  
  const handleFinish = async () => {
    if (!user) return
    try {
      await supabase
        .from('user_preferences')
        .update({ has_completed_onboarding: true })
        .eq('user_id', user.id)
      onClose()
      // Optional: redirect to import page after tour
      router.push('/dashboard/import')
    } catch (error) {
      console.error("Failed to update onboarding status:", error)
      onClose() // Still close the modal on error
    }
  }

  // Reset step if dialog is reopened
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0)
    }
  }, [isOpen])

  const step = tourSteps[currentStep]
  const Icon = step.icon

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <Icon className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold mb-2">{step.title}</DialogTitle>
                <DialogDescription className="text-gray-600">
                  {step.description}
                </DialogDescription>
              </DialogHeader>
            </div>
            <DialogFooter className="bg-gray-50 p-4">
                <Button onClick={handleNext} className="w-full bg-green-500 hover:bg-green-600">
                    {step.buttonText}
                </Button>
            </DialogFooter>
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
} 