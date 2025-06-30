import { NextResponse } from 'next/server'
import { getPlanType, getBillingInterval } from '@/lib/stripe'

export async function GET() {
  try {
    // Get all price IDs from environment
    const priceIds = {
      STARTER_MONTH: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER_MONTH,
      STARTER_YEAR: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER_YEAR,
      PRO_MONTH: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTH,
      PRO_YEAR: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_YEAR,
      GROWTH_MONTH: process.env.NEXT_PUBLIC_STRIPE_PRICE_GROWTH_MONTH,
      GROWTH_YEAR: process.env.NEXT_PUBLIC_STRIPE_PRICE_GROWTH_YEAR,
    }

    // Test the problematic Price ID from the log
    const problemPriceId = 'price_1RY709BdceERPtve6yxRtZUb'
    
    // Create mapping test
    const mappingTest = Object.entries(priceIds).map(([name, priceId]) => ({
      name,
      priceId,
      planType: priceId ? getPlanType(priceId) : 'N/A',
      billingInterval: priceId ? getBillingInterval(priceId) : 'N/A',
      isProblematicPrice: priceId === problemPriceId
    }))

    // Test the problematic price specifically
    const problemPriceTest = {
      priceId: problemPriceId,
      planType: getPlanType(problemPriceId),
      billingInterval: getBillingInterval(problemPriceId),
      shouldBe: 'starter (according to Stripe log)'
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      priceIds,
      mappingTest,
      problemPriceTest,
      debug: {
        message: 'Check if problemPriceId matches any of the environment variables',
        issue: 'If problemPriceTest.planType is "free", the Price ID is not in the environment variables'
      }
    })
  } catch (error) {
    console.error('Debug API error:', error)
    return NextResponse.json(
      { error: 'Debug API failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 