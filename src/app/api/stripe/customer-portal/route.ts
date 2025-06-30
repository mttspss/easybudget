import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'

// Service role client for customer portal - bypasses RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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

    // Get user's subscription from database with detailed logging - USING SERVICE ROLE
    console.log('Querying user_subscriptions table for user_id:', userId)
    
    const { data: subscription, error: dbError } = await supabaseAdmin
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single()

    console.log('Database query result:')
    console.log('- subscription data:', subscription)
    console.log('- database error:', dbError)

    // Also check if there are ANY subscriptions for this user
    const { data: allSubscriptions, error: allSubsError } = await supabaseAdmin
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)

    console.log('All subscriptions for user:')
    console.log('- all subscriptions:', allSubscriptions)
    console.log('- all subscriptions error:', allSubsError)

    if (!subscription?.subscription_id) {
      return NextResponse.json(
        { 
          error: 'No active subscription found',
          debug: {
            userId,
            subscription,
            allSubscriptions,
            dbError,
            allSubsError
          }
        },
        { status: 404 }
      )
    }

    console.log('Subscription ID:', subscription.subscription_id)

    // Get customer ID from Stripe subscription
    const stripeSubscription = await stripe.subscriptions.retrieve(subscription.subscription_id)
    const customerId = stripeSubscription.customer as string

    console.log('Customer ID:', customerId)

    // Determine base URL for return - PRIORITIZE PRODUCTION DOMAIN
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 
                   'https://easybudget.ing'  // Always fallback to production domain

    console.log('Customer Portal Base URL:', baseUrl)

    // Create customer portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${baseUrl}/dashboard/billing`,
    })

    console.log('=== CUSTOMER PORTAL CREATED ===')
    console.log('Portal URL:', portalSession.url)
    console.log('Return URL:', `${baseUrl}/dashboard/billing`)

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