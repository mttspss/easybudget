import { Card, CardContent } from "@/components/ui/card"
import React from "react"

interface StatCardProps {
  title: string
  value: React.ReactNode
  unit?: string
  icon?: React.ReactNode
  valueClassName?: string
  className?: string
}

export function StatCard({ title, value, unit, icon, valueClassName = "", className = "" }: StatCardProps) {
  return (
    <Card className={`border border-gray-100 bg-white rounded-lg shadow-sm ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          {icon && <span className="text-gray-400">{icon}</span>}
        </div>
        <p className={`text-3xl font-bold text-gray-800 truncate ${valueClassName}`}>
          {value}
          {unit && <span className="ml-1 text-xl font-medium text-gray-500">{unit}</span>}
        </p>
      </CardContent>
    </Card>
  )
} 