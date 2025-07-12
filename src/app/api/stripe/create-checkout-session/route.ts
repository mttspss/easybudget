import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe, getPlanType, getBillingInterval } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const { priceId, userId } = await request.json()

    if (!priceId || !userId) {
      return NextResponse.json(
        { error: 'Price ID and User ID are required' },
        { status: 400 }
      )
    }

    // Determine base URL - PRIORITIZE PRODUCTION DOMAIN
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 
                   'https://easybudget.ing'  // Always fallback to production domain

    // Get plan details for metadata
    const planType = getPlanType(priceId)
    const billingInterval = getBillingInterval(priceId)

    // Determine mode based on billing interval
    const mode = billingInterval === 'lifetime' ? 'payment' : 'subscription'

    // Create checkout session configuration
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      mode: mode,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/#pricing`,
      metadata: {
        userId: userId,
        planType: planType,
        billingInterval: billingInterval,
      },
      allow_promotion_codes: true,
    }

    // Add subscription_data only for subscription mode
    if (mode === 'subscription') {
      sessionConfig.subscription_data = {
        metadata: {
          userId: userId,
          planType: planType,
          billingInterval: billingInterval,
        },
      }
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create(sessionConfig)
    
    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('=== CHECKOUT SESSION ERROR ===')
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 