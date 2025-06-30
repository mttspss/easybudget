"use client"

import { useMobileDetection } from "@/lib/use-mobile-detection"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Monitor, Smartphone, X, Laptop, Download, Clock } from "lucide-react"
import Image from "next/image"
import { useState, useEffect } from "react"

interface MobileBlockProps {
  children: React.ReactNode
}

export function MobileBlock({ children }: MobileBlockProps) {
  const { isMobile, isLoading } = useMobileDetection()
  const [forceDesktop, setForceDesktop] = useState(false)

  // Controlla se l'utente ha già forzato la modalità desktop
  useEffect(() => {
    const forced = localStorage.getItem('easybudget_force_desktop') === 'true'
    setForceDesktop(forced)
  }, [])

  // Funzione per forzare la modalità desktop
  const handleForceDesktop = () => {
    localStorage.setItem('easybudget_force_desktop', 'true')
    setForceDesktop(true)
  }

  // Mostra loading durante il controllo
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Se non è mobile o se ha forzato la modalità desktop, mostra il contenuto normale
  if (!isMobile || forceDesktop) {
    return <>{children}</>
  }

  // Se è mobile, mostra il messaggio di blocco
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#7aff01]/8 via-white to-[#7aff01]/4 relative overflow-hidden">
      {/* Subtle patterns */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(122,255,1,0.1),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.8),transparent_50%)]"></div>
      
      <div className="relative min-h-screen flex items-center justify-center p-6">
        <Card className="w-full max-w-md mx-auto shadow-xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            {/* Logo */}
            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Image 
                src="/newicon1.png" 
                alt="EasyBudget Logo" 
                width={64} 
                height={64} 
                className="w-full h-full object-contain" 
              />
            </div>
            
            <CardTitle className="text-xl font-bold text-gray-900 mb-2">
              Desktop Dashboard Only
            </CardTitle>
          </CardHeader>
          
          <CardContent className="text-center space-y-6">
            {/* Icons */}
            <div className="flex items-center justify-center space-x-8">
              <div className="text-green-500">
                <Monitor className="w-12 h-12 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-700">Web App</p>
                <p className="text-xs text-green-600">✓ Available</p>
              </div>
              
              <X className="w-6 h-6 text-gray-400" />
              
              <div className="text-orange-500">
                <Smartphone className="w-12 h-12 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-700">Mobile App</p>
                <p className="text-xs text-orange-600">🚧 Coming Soon</p>
              </div>
            </div>
            
            {/* Message */}
            <div className="space-y-4">
              <p className="text-gray-600 text-sm leading-relaxed">
                EasyBudget is currently available as a <strong>web application</strong> optimized for desktop and tablet use.
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-blue-800 text-sm font-medium">
                  🌐 Access from a computer or tablet to manage your finances
                </p>
              </div>
              
              {/* Mobile App Development Notice */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-3">
                <div className="flex items-center justify-center mb-2">
                  <Clock className="w-4 h-4 text-purple-600 mr-2" />
                  <p className="text-purple-800 text-sm font-semibold">Mobile Apps Coming Soon!</p>
                </div>
                <p className="text-purple-700 text-xs leading-relaxed">
                  We&apos;re working hard on native mobile apps for iOS and Android. 
                  Join our waitlist to be notified when they&apos;re available on the App Store and Google Play!
                </p>
              </div>
            </div>
            
            {/* Actions */}
            <div className="space-y-3">
              <Button 
                onClick={() => window.location.href = '/'} 
                className="w-full bg-gray-900 hover:bg-gray-800 text-white"
              >
                Back to Home
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleForceDesktop}
                className="w-full border-orange-300 text-orange-700 hover:bg-orange-50"
              >
                <Laptop className="w-4 h-4 mr-2" />
                Continue Anyway (Desktop Mode)
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => window.location.href = 'mailto:support@easybudget.ing?subject=Mobile%20App%20Waitlist&body=Hi!%20Please%20add%20me%20to%20the%20mobile%20app%20waitlist.%0A%0AThanks!'}
                className="w-full border-purple-300 text-purple-700 hover:bg-purple-50"
              >
                <Download className="w-4 h-4 mr-2" />
                Join Mobile App Waitlist
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => window.location.href = 'mailto:support@easybudget.ing?subject=Support%20Request'}
                className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Contact Support
              </Button>
            </div>
            
            {/* Warning for force desktop */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <p className="text-orange-800 text-xs leading-relaxed">
                ⚠️ <strong>Desktop Mode:</strong> Some features may not work properly on small screens. 
                For the best experience, use a computer or tablet.
              </p>
            </div>
            
            {/* Footer */}
            <div className="pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Using a tablet? Rotate to landscape mode for automatic access.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 