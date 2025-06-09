import { NextRequest, NextResponse } from 'next/server'
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

    console.log('Creating checkout session for:', { priceId, userId })

    // Create checkout session without user verification for now
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/#pricing`,
      metadata: {
        userId: userId,
        planType: getPlanType(priceId),
        billingInterval: getBillingInterval(priceId),
      },
      subscription_data: {
        metadata: {
          userId: userId,
          planType: getPlanType(priceId),
          billingInterval: getBillingInterval(priceId),
        },
      },
      allow_promotion_codes: true,
    })

    console.log('Checkout session created:', session.id)
    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 