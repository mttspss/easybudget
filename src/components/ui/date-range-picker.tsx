"use client"

import * as React from "react"
import { useState } from "react"
import { CalendarDays } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export interface DateRange {
  from: Date | undefined
  to: Date | undefined
}

interface DateRangePickerProps {
  value?: DateRange
  onValueChange?: (range: DateRange | undefined) => void
  className?: string
  placeholder?: string
}

const presetRanges = [
  {
    label: "Today",
    getValue: () => {
      const today = new Date()
      return { from: today, to: today }
    }
  },
  {
    label: "Yesterday", 
    getValue: () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      return { from: yesterday, to: yesterday }
    }
  },
  {
    label: "Last 7 days",
    getValue: () => {
      const today = new Date()
      const weekAgo = new Date()
      weekAgo.setDate(today.getDate() - 7)
      return { from: weekAgo, to: today }
    }
  },
  {
    label: "Last 30 days",
    getValue: () => {
      const today = new Date()
      const monthAgo = new Date()
      monthAgo.setDate(today.getDate() - 30)
      return { from: monthAgo, to: today }
    }
  },
  {
    label: "This month",
    getValue: () => {
      const today = new Date()
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
      return { from: firstDay, to: today }
    }
  },
  {
    label: "Last month",
    getValue: () => {
      const today = new Date()
      const firstDayLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
      const lastDayLastMonth = new Date(today.getFullYear(), today.getMonth(), 0)
      return { from: firstDayLastMonth, to: lastDayLastMonth }
    }
  },
  {
    label: "This year",
    getValue: () => {
      const today = new Date()
      const firstDay = new Date(today.getFullYear(), 0, 1)
      return { from: firstDay, to: today }
    }
  },
  {
    label: "Last year",
    getValue: () => {
      const today = new Date()
      const firstDayLastYear = new Date(today.getFullYear() - 1, 0, 1)
      const lastDayLastYear = new Date(today.getFullYear() - 1, 11, 31)
      return { from: firstDayLastYear, to: lastDayLastYear }
    }
  }
]

export function DateRangePicker({
  value,
  onValueChange,
  className,
  placeholder = "Select date range"
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false)
  const [tempRange, setTempRange] = useState<DateRange>(value || { from: undefined, to: undefined })

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0]
  }

  const handleApply = () => {
    onValueChange?.(tempRange)
    setOpen(false)
  }

  const handleReset = () => {
    const resetRange = { from: undefined, to: undefined }
    setTempRange(resetRange)
    onValueChange?.(resetRange)
    setOpen(false)
  }

  const handlePresetSelect = (preset: typeof presetRanges[0]) => {
    const range = preset.getValue()
    setTempRange(range)
    onValueChange?.(range)
    setOpen(false)
  }

  const displayText = value?.from && value?.to 
    ? `${formatDate(value.from)} - ${formatDate(value.to)}`
    : value?.from 
    ? `${formatDate(value.from)} - ...`
    : placeholder

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "justify-start text-left font-normal h-8 px-3",
            !value?.from && "text-muted-foreground",
            className
          )}
        >
          <CalendarDays className="mr-2 h-4 w-4" />
          <span className="truncate">{displayText}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-4">
          <div className="space-y-4">
            {/* Preset Ranges */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Quick Select</Label>
              <div className="grid grid-cols-2 gap-2">
                {presetRanges.map((preset) => (
                  <Button
                    key={preset.label}
                    variant="ghost"
                    size="sm"
                    className="h-8 justify-start"
                    onClick={() => handlePresetSelect(preset)}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Custom Range */}
            <div className="border-t pt-4">
              <Label className="text-sm font-medium text-gray-700 mb-3 block">Custom Range</Label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-gray-500 mb-1 block">From</Label>
                  <Input
                    type="date"
                    value={tempRange.from ? formatDateForInput(tempRange.from) : ""}
                    onChange={(e) => {
                      const date = e.target.value ? new Date(e.target.value) : undefined
                      setTempRange(prev => ({ ...prev, from: date }))
                    }}
                    className="h-8"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-500 mb-1 block">To</Label>
                  <Input
                    type="date"
                    value={tempRange.to ? formatDateForInput(tempRange.to) : ""}
                    onChange={(e) => {
                      const date = e.target.value ? new Date(e.target.value) : undefined
                      setTempRange(prev => ({ ...prev, to: date }))
                    }}
                    className="h-8"
                    min={tempRange.from ? formatDateForInput(tempRange.from) : undefined}
                  />
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex justify-between mt-4 pt-3 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  className="h-8"
                >
                  Clear
                </Button>
                <Button
                  size="sm"
                  onClick={handleApply}
                  disabled={!tempRange.from || !tempRange.to}
                  className="h-8"
                >
                  Apply
                </Button>
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
} 