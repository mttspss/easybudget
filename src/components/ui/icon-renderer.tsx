"use client"

import { 
  FileText, 
  Coffee, 
  Car, 
  Home, 
  ShoppingCart, 
  Utensils, 
  Plane, 
  Heart, 
  Gamepad2, 
  Book, 
  Music, 
  Monitor, 
  Shirt, 
  Fuel, 
  PiggyBank, 
  CreditCard, 
  Banknote, 
  TrendingUp,
  Building,
  Stethoscope,
  GraduationCap,
  Dumbbell,
  Camera,
  Phone,
  Wifi
} from "lucide-react"
import { cn } from "@/lib/utils"

const iconMap = {
  FileText,
  Coffee,
  Car,
  Home,
  ShoppingCart,
  Utensils,
  Plane,
  Heart,
  Gamepad2,
  Book,
  Music,
  Monitor,
  Shirt,
  Fuel,
  PiggyBank,
  CreditCard,
  Banknote,
  TrendingUp,
  Building,
  Stethoscope,
  GraduationCap,
  Dumbbell,
  Camera,
  Phone,
  Wifi
}

interface IconRendererProps {
  iconName: string | null | undefined
  className?: string
  fallbackColor?: string
}

export function IconRenderer({ iconName, className = "h-4 w-4", fallbackColor }: IconRendererProps) {
  if (!iconName || !iconMap[iconName as keyof typeof iconMap]) {
    if (fallbackColor) {
      return (
        <div 
          className={cn("w-3 h-3 rounded-full", className)} 
          style={{ backgroundColor: fallbackColor }}
        />
      )
    }
    // Default to FileText if no icon name or fallback
    const DefaultIcon = iconMap.FileText
    return <DefaultIcon className={className} />
  }
  
  const IconComponent = iconMap[iconName as keyof typeof iconMap]
  return <IconComponent className={className} />
} 