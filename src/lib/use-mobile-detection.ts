"use client"

import { useState, useEffect } from 'react'

export function useMobileDetection() {
  const [isMobile, setIsMobile] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkIfMobile = () => {
      // Ottieni dimensioni schermo
      const screenWidth = window.innerWidth
      const screenHeight = window.innerHeight
      const isLandscape = screenWidth > screenHeight
      
      // Controlla user agent per dispositivi specifici
      const userAgent = navigator.userAgent
      const isIPhone = /iPhone/i.test(userAgent)
      const isAndroidPhone = /Android/i.test(userAgent) && /Mobile/i.test(userAgent)
      const isSmallTablet = /iPad/i.test(userAgent) || (/Android/i.test(userAgent) && !/Mobile/i.test(userAgent))
      
      // Controlla se è un touch device
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
      
      // Definisci le regole di blocco:
      
      // 1. Blocca sempre iPhone e Android phone
      if (isIPhone || isAndroidPhone) {
        setIsMobile(true)
        setIsLoading(false)
        return
      }
      
      // 2. Per tablet e dispositivi touch, controlla dimensioni schermo
      if (isTouchDevice || isSmallTablet) {
        // Blocca se schermo troppo piccolo
        if (screenWidth < 768) {
          setIsMobile(true)
          setIsLoading(false)
          return
        }
        
        // Per tablet in portrait con larghezza < 1024px, blocca
        if (!isLandscape && screenWidth < 1024) {
          setIsMobile(true)
          setIsLoading(false)
          return
        }
      }
      
      // 3. Blocca schermi molto piccoli indipendentemente dal device
      if (screenWidth < 640) {
        setIsMobile(true)
        setIsLoading(false)
        return
      }
      
      // Altrimenti permetti l'accesso
      setIsMobile(false)
      setIsLoading(false)
    }

    // Controlla immediatamente
    checkIfMobile()

    // Controlla al resize della finestra (per rotazione tablet)
    window.addEventListener('resize', checkIfMobile)
    
    return () => window.removeEventListener('resize', checkIfMobile)
  }, [])

  return { isMobile, isLoading }
} 