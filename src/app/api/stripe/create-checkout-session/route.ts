import { NextRequest, NextResponse } from 'next/server'
import { stripe, getPlanType, getBillingInterval } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const { priceId, userId } = await request.json()

    console.log('=== CHECKOUT SESSION REQUEST ===')
    console.log('Price ID:', priceId)
    console.log('User ID:', userId)
    console.log('Plan Type:', getPlanType(priceId))
    console.log('Billing Interval:', getBillingInterval(priceId))

    if (!priceId || !userId) {
      return NextResponse.json(
        { error: 'Price ID and User ID are required' },
        { status: 400 }
      )
    }

    console.log('Creating checkout session for:', { priceId, userId })

    // Determine base URL - use multiple fallbacks
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 
                   process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 
                   'https://easybudget.ing'

    console.log('Base URL:', baseUrl)

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
      success_url: `${baseUrl}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/#pricing`,
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

    console.log('=== CHECKOUT SESSION CREATED ===')
    console.log('Session ID:', session.id)
    console.log('Checkout URL:', session.url)
    console.log('Success URL:', session.success_url)
    console.log('Cancel URL:', session.cancel_url)
    console.log('Metadata:', session.metadata)
    
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