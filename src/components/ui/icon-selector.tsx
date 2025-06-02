"use client"

import { useState } from "react"
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
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

const transactionIcons = [
  { name: 'FileText', icon: FileText, label: 'General' },
  { name: 'Coffee', icon: Coffee, label: 'Food & Drink' },
  { name: 'Car', icon: Car, label: 'Transportation' },
  { name: 'Home', icon: Home, label: 'Home' },
  { name: 'ShoppingCart', icon: ShoppingCart, label: 'Shopping' },
  { name: 'Utensils', icon: Utensils, label: 'Restaurants' },
  { name: 'Plane', icon: Plane, label: 'Travel' },
  { name: 'Heart', icon: Heart, label: 'Health' },
  { name: 'Gamepad2', icon: Gamepad2, label: 'Entertainment' },
  { name: 'Book', icon: Book, label: 'Education' },
  { name: 'Music', icon: Music, label: 'Music' },
  { name: 'Monitor', icon: Monitor, label: 'Technology' },
  { name: 'Shirt', icon: Shirt, label: 'Clothing' },
  { name: 'Fuel', icon: Fuel, label: 'Gas' },
  { name: 'PiggyBank', icon: PiggyBank, label: 'Savings' },
  { name: 'CreditCard', icon: CreditCard, label: 'Payment' },
  { name: 'Banknote', icon: Banknote, label: 'Cash' },
  { name: 'TrendingUp', icon: TrendingUp, label: 'Investment' },
  { name: 'Building', icon: Building, label: 'Business' },
  { name: 'Stethoscope', icon: Stethoscope, label: 'Medical' },
  { name: 'GraduationCap', icon: GraduationCap, label: 'Education' },
  { name: 'Dumbbell', icon: Dumbbell, label: 'Fitness' },
  { name: 'Camera', icon: Camera, label: 'Photography' },
  { name: 'Phone', icon: Phone, label: 'Phone' },
  { name: 'Wifi', icon: Wifi, label: 'Internet' },
]

interface IconSelectorProps {
  value: string
  onValueChange: (value: string) => void
  className?: string
}

export function IconSelector({ value, onValueChange, className }: IconSelectorProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")

  const selectedIcon = transactionIcons.find(icon => icon.name === value) || transactionIcons[0]
  const SelectedIconComponent = selectedIcon.icon

  const filteredIcons = transactionIcons.filter(icon =>
    icon.label.toLowerCase().includes(search.toLowerCase()) ||
    icon.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start gap-2 h-10",
            className
          )}
        >
          <SelectedIconComponent className="h-4 w-4" />
          <span>{selectedIcon.label}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-3">
          <Input
            placeholder="Search icons..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-3"
          />
          <div className="grid grid-cols-6 gap-2 max-h-60 overflow-y-auto">
            {filteredIcons.map((iconItem) => {
              const IconComponent = iconItem.icon
              return (
                <Button
                  key={iconItem.name}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-10 w-10 p-0",
                    value === iconItem.name && "bg-blue-100 text-blue-600"
                  )}
                  onClick={() => {
                    onValueChange(iconItem.name)
                    setOpen(false)
                  }}
                  title={iconItem.label}
                >
                  <IconComponent className="h-4 w-4" />
                </Button>
              )
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
} 