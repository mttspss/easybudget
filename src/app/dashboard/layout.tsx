// Force full dashboard rebuild: 2024-07-18 18:32:00
"use client"

import { AuthProvider } from "@/lib/auth-context"
import { DashboardProvider } from "@/lib/dashboard-context"
import { OnboardingProvider } from "@/lib/onboarding-context"
import { Toaster } from "@/components/ui/sonner"
import { WelcomeTour } from "@/components/onboarding/welcome-tour"
import { MobileBlock } from "@/components/mobile-block"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <DashboardProvider>
        <OnboardingProvider>
          <MobileBlock>
            {children}
            <WelcomeTour />
            <Toaster />
          </MobileBlock>
        </OnboardingProvider>
      </DashboardProvider>
    </AuthProvider>
  )
} 