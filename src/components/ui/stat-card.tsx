import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <span className="text-muted-foreground">{icon}</span>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${valueClassName}`}>
          {value}
          {unit && <span className="text-sm font-medium text-gray-500">{unit}</span>}
        </div>
      </CardContent>
    </Card>
  )
} 