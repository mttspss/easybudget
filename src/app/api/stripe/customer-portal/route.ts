import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    console.log('=== CUSTOMER PORTAL REQUEST ===')
    console.log('User ID:', userId)

    // Get user's subscription from database
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('subscription_id')
      .eq('user_id', userId)
      .single()

    if (!subscription?.subscription_id) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      )
    }

    console.log('Subscription ID:', subscription.subscription_id)

    // Get customer ID from Stripe subscription
    const stripeSubscription = await stripe.subscriptions.retrieve(subscription.subscription_id)
    const customerId = stripeSubscription.customer as string

    console.log('Customer ID:', customerId)

    // Determine base URL for return
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 
                   process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 
                   'https://easybudget.ing'

    // Create customer portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${baseUrl}/dashboard/billing`,
    })

    console.log('=== CUSTOMER PORTAL CREATED ===')
    console.log('Portal URL:', portalSession.url)

    return NextResponse.json({ url: portalSession.url })
  } catch (error) {
    console.error('=== CUSTOMER PORTAL ERROR ===')
    console.error('Error creating customer portal session:', error)
    return NextResponse.json(
      { error: 'Failed to create customer portal session', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 