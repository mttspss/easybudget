'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Crown, 
  ArrowRight, 
  Check,
  X 
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface UpgradePromptProps {
  title: string
  description: string
  currentPlan: string
  limitType: 'dashboard' | 'transaction' | 'import' | 'goal'
  currentUsage: number
  limit: number
  onClose?: () => void
  showCloseButton?: boolean
}

export function UpgradePrompt({ 
  title, 
  description, 
  currentPlan, 
  limitType,
  currentUsage,
  limit,
  onClose,
  showCloseButton = true 
}: UpgradePromptProps) {
  const router = useRouter()

  const getLimitText = () => {
    switch (limitType) {
      case 'dashboard':
        return `${currentUsage}/${limit} dashboards used`
      case 'transaction':
        return `${currentUsage}/${limit} transactions this month`
      case 'import':
        return `${currentUsage}/${limit} imports this month`
      case 'goal':
        return `${currentUsage}/${limit} goals created`
      default:
        return `${currentUsage}/${limit} used`
    }
  }

  const getRecommendedPlan = () => {
    if (currentPlan === 'starter') {
      return {
        name: 'Pro',
        price: '$29',
        benefits: [
          'Unlimited transactions',
          '1 additional business dashboard',
          '3 CSV imports per month',
          'Priority support'
        ]
      }
    }
    if (currentPlan === 'pro') {
      return {
        name: 'Growth',
        price: '$49',
        benefits: [
          'Up to 5 business dashboards',
          'Unlimited CSV imports',
          'Full analytics suite',
          'Priority support'
        ]
      }
    }
    // Default fallback
    return {
      name: 'Pro',
      price: '$29',
      benefits: [
        'Unlimited transactions',
        '1 additional business dashboard',
        '3 CSV imports per month',
        'Priority support'
      ]
    }
  }

  const recommendedPlan = getRecommendedPlan()

  const handleUpgrade = () => {
    router.push('/#pricing')
  }

  return (
    <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
              <Crown className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <CardTitle className="text-lg text-gray-900">{title}</CardTitle>
              <p className="text-sm text-gray-600 mt-1">{description}</p>
            </div>
          </div>
          {showCloseButton && onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Current Usage */}
        <div className="bg-white/60 rounded-lg p-3 border border-amber-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-amber-700 border-amber-300">
                {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)} Plan
              </Badge>
              <span className="text-sm text-gray-600">{getLimitText()}</span>
            </div>
          </div>
        </div>

        {/* Recommended Plan */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-900">Upgrade to {recommendedPlan.name}</h4>
            <Badge className="bg-green-100 text-green-800 border-green-300">
              {recommendedPlan.price}/month
            </Badge>
          </div>
          
          <ul className="space-y-2 mb-4">
            {recommendedPlan.benefits.map((benefit, index) => (
              <li key={index} className="flex items-center gap-2 text-sm text-gray-700">
                <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                {benefit}
              </li>
            ))}
          </ul>
          
          <Button 
            onClick={handleUpgrade}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
          >
            Upgrade Now
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 