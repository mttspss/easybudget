"use client"

import { useOnboarding, tourSteps } from '@/lib/onboarding-context'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AnimatePresence, motion } from 'framer-motion'
import { Rocket, BarChart3, Wallet, Upload, PartyPopper } from 'lucide-react'

const icons = [Rocket, Wallet, Upload, BarChart3, PartyPopper, PartyPopper, PartyPopper]

export function WelcomeTour() {
  const { isTourOpen, currentStep, nextStep, endTour, goToStep } = useOnboarding()

  if (!isTourOpen) {
    return null
  }
  
  const stepData = tourSteps[currentStep]
  const Icon = icons[currentStep] || Rocket
  const isLastStep = currentStep === tourSteps.length - 1

  return (
    <Dialog open={isTourOpen} onOpenChange={(open) => !open && endTour()}>
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
                <DialogTitle className="text-2xl font-bold mb-2">{stepData.title}</DialogTitle>
                <DialogDescription className="text-gray-600">
                  {stepData.description}
                </DialogDescription>
              </DialogHeader>
            </div>
            
            {/* Progress Dots */}
            <div className="flex justify-center items-center gap-2 mb-4">
              {tourSteps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToStep(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    currentStep === index ? 'w-4 bg-green-500' : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to step ${index + 1}`}
                />
              ))}
            </div>

            <DialogFooter className="bg-gray-50 p-4 flex justify-between">
                <Button onClick={endTour} variant="ghost">
                    Skip Tour
                </Button>
                <Button onClick={nextStep} className="bg-green-500 hover:bg-green-600">
                    {isLastStep ? 'Finish Tour' : 'Next'}
                    {!isLastStep && <motion.div animate={{ x: [0, 3, 0] }} transition={{ repeat: Infinity, duration: 1}} className="ml-2">→ </motion.div>}
                </Button>
            </DialogFooter>
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
} 