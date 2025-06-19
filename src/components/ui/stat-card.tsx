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
    <Card className={`border border-gray-200 bg-white ${className}`}>
      <CardContent className="p-3 flex flex-col">
        <div className="flex items-start justify-between text-[11px] font-medium text-gray-600">
          <span>{title}</span>
          {icon && <span className="text-gray-400">{icon}</span>}
        </div>
        <div className={`mt-1 text-xl font-semibold ${valueClassName}`}>
          {value}{unit && <span className="text-base font-medium text-gray-500">{unit}</span>}
        </div>
      </CardContent>
    </Card>
  )
} 