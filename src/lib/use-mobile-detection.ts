"use client"

import { useState, useEffect } from 'react'

interface MobileDetectionResult {
  isMobile: boolean
  isLoading: boolean
}

export function useMobileDetection(): MobileDetectionResult {
  const [isMobile, setIsMobile] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkMobile = () => {
      // Check screen width
      const isSmallScreen = window.innerWidth < 768
      
      // Check user agent for mobile devices
      const userAgent = navigator.userAgent.toLowerCase()
      const mobileKeywords = [
        'mobile',
        'android',
        'iphone',
        'ipod',
        'blackberry',
        'windows phone',
        'webos'
      ]
      
      const isMobileDevice = mobileKeywords.some(keyword => 
        userAgent.includes(keyword)
      )
      
      // Consider it mobile if either condition is true
      const mobile = isSmallScreen || isMobileDevice
      
      setIsMobile(mobile)
      setIsLoading(false)
    }

    // Initial check
    checkMobile()

    // Listen for window resize
    const handleResize = () => {
      checkMobile()
    }

    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return { isMobile, isLoading }
} 