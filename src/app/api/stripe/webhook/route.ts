import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe, getPlanType, getBillingInterval } from '@/lib/stripe'
import { supabase } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

// Service role client for webhook - bypasses RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  console.log('🔥 ==> STRIPE WEBHOOK RECEIVED')
  
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')!

  console.log('🔥 Webhook body length:', body.length)
  console.log('🔥 Webhook signature present:', !!signature)

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    console.log('🔥 Webhook signature verified successfully')
    console.log('🔥 Event type:', event.type)
    console.log('🔥 Event ID:', event.id)
  } catch (error) {
    console.error('🔥 Webhook signature verification failed:', error)
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    )
  }

  try {
    console.log('🔥 Processing event type:', event.type)
    
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        console.log('🔥 Processing checkout.session.completed')
        console.log('🔥 Session ID:', session.id)
        console.log('🔥 Session metadata:', session.metadata)
        await handleCheckoutCompleted(session)
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        console.log('🔥 Processing subscription event:', event.type)
        console.log('🔥 Subscription ID:', subscription.id)
        console.log('🔥 Subscription metadata:', subscription.metadata)
        console.log('🔥 Subscription status:', subscription.status)
        await handleSubscriptionUpdated(subscription)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        console.log('🔥 Processing subscription.deleted')
        console.log('🔥 Subscription ID:', subscription.id)
        await handleSubscriptionDeleted(subscription)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        console.log('🔥 Processing payment succeeded')
        console.log('🔥 Invoice ID:', invoice.id)
        await handlePaymentSucceeded(invoice)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        console.log('🔥 Processing payment failed')
        console.log('🔥 Invoice ID:', invoice.id)
        await handlePaymentFailed(invoice)
        break
      }

      default:
        console.log('🔥 Unhandled event type:', event.type)
    }

    console.log('🔥 Webhook processed successfully')
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('🔥 ERROR processing webhook:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId
  console.log('🔥 handleCheckoutCompleted - userId from metadata:', userId)
  
  if (!userId) {
    console.error('🔥 ERROR: No userId in session metadata!')
    return
  }

  console.log('🔥 Checkout completed for user:', userId)
  
  // Get subscription details
  if (session.subscription) {
    console.log('🔥 Session has subscription:', session.subscription)
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    )
    console.log('🔥 Retrieved subscription from Stripe:', subscription.id)
    console.log('🔥 Subscription status:', subscription.status)
    console.log('🔥 Subscription metadata:', subscription.metadata)
    
    await upsertSubscription(subscription, userId)
  } else {
    console.log('🔥 WARNING: Session has no subscription!')
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId
  console.log('🔥 handleSubscriptionUpdated - userId from metadata:', userId)
  
  if (!userId) {
    console.error('🔥 ERROR: No userId in subscription metadata!')
    return
  }

  await upsertSubscription(subscription, userId)
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId
  if (!userId) return

  console.log('🔥 Subscription deleted for user:', userId)

  // Update user subscription to free plan
  const { error } = await supabase
    .from('user_subscriptions')
    .upsert({
      user_id: userId,
      subscription_id: subscription.id,
      status: 'canceled',
      plan_type: 'free',
      billing_interval: null,
      current_period_start: null,
      current_period_end: null,
      canceled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

  if (error) {
    console.error('🔥 Error updating canceled subscription:', error)
  } else {
    console.log('🔥 Successfully updated subscription to canceled')
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('🔥 Payment succeeded for invoice:', invoice.id)
  
  const invoiceWithSubscription = invoice as any
  if (invoiceWithSubscription.subscription && typeof invoiceWithSubscription.subscription === 'string') {
    const subscription = await stripe.subscriptions.retrieve(invoiceWithSubscription.subscription)
    const userId = subscription.metadata?.userId
    if (userId) {
      await upsertSubscription(subscription, userId)
    }
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  console.log('🔥 Payment failed for invoice:', invoice.id)
  
  const invoiceWithSubscription = invoice as any
  if (invoiceWithSubscription.subscription && typeof invoiceWithSubscription.subscription === 'string') {
    const subscription = await stripe.subscriptions.retrieve(invoiceWithSubscription.subscription)
    const userId = subscription.metadata?.userId
    
    if (userId) {
      // Mark subscription as past_due
      const { error } = await supabase
        .from('user_subscriptions')
        .update({
          status: 'past_due',
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('subscription_id', subscription.id)

      if (error) {
        console.error('🔥 Error updating past due subscription:', error)
      }
    }
  }
}

async function upsertSubscription(subscription: Stripe.Subscription, userId: string) {
  console.log('🔥 ==> UPSERTING SUBSCRIPTION WITH SERVICE ROLE')
  console.log('🔥 User ID:', userId)
  console.log('🔥 Subscription ID:', subscription.id)
  console.log('🔥 Subscription status:', subscription.status)
  
  // Cast to any to access timestamp properties
  const subscriptionData = subscription as any
  
  // DEBUG: Log the raw subscription object to see timestamp structure
  console.log('🔥 RAW SUBSCRIPTION OBJECT:', JSON.stringify(subscriptionData, null, 2))
  
  // The timestamps are in the subscription items, not at the root level!
  const firstItem = subscriptionData.items?.data?.[0]
  console.log('🔥 First subscription item:', JSON.stringify(firstItem, null, 2))
  console.log('🔥 Current period start RAW:', firstItem?.current_period_start)
  console.log('🔥 Current period end RAW:', firstItem?.current_period_end)
  console.log('🔥 Typeof current_period_start:', typeof firstItem?.current_period_start)
  console.log('🔥 Typeof current_period_end:', typeof firstItem?.current_period_end)
  
  const priceId = subscription.items.data[0]?.price?.id
  console.log('🔥 Price ID:', priceId)
  
  if (!priceId) {
    console.error('🔥 ERROR: No price ID found in subscription!')
    return
  }

  const planType = getPlanType(priceId)
  const billingInterval = getBillingInterval(priceId)
  
  console.log('🔥 Plan type:', planType)
  console.log('🔥 Billing interval:', billingInterval)

  // Safe timestamp conversion with enhanced logging
  const toDateOrNull = (timestamp?: number | null) => {
    console.log('🔥 Converting timestamp:', timestamp, 'typeof:', typeof timestamp)
    if (typeof timestamp === 'number') {
      const converted = new Date(timestamp * 1000).toISOString()
      console.log('🔥 Converted to:', converted)
      return converted
    }
    console.log('🔥 Timestamp is null/undefined, returning null')
    return null
  }

  const currentPeriodStart = toDateOrNull(firstItem?.current_period_start)
  const currentPeriodEnd = toDateOrNull(firstItem?.current_period_end)
  
  console.log('🔥 FINAL TIMESTAMPS:')
  console.log('🔥 - current_period_start:', currentPeriodStart)
  console.log('🔥 - current_period_end:', currentPeriodEnd)

  const dataToUpsert = {
    user_id: userId,
    subscription_id: subscription.id,
    status: subscription.status,
    plan_type: planType,
    billing_interval: billingInterval,
    current_period_start: currentPeriodStart,
    current_period_end: currentPeriodEnd,
    canceled_at: subscription.canceled_at ? toDateOrNull(subscription.canceled_at) : null,
    updated_at: new Date().toISOString(),
  }

  console.log('🔥 Subscription data to upsert:', JSON.stringify(dataToUpsert, null, 2))

  // Use service role client with conflict resolution
  const { error } = await supabaseAdmin
    .from('user_subscriptions')
    .upsert(dataToUpsert, { onConflict: 'user_id' })

  if (error) {
    console.error('🔥 ERROR upserting subscription:', error)
    console.error('🔥 Error details:', JSON.stringify(error, null, 2))
    throw error
  }

  console.log('🔥 ✅ SUCCESS! Subscription updated for user:', userId)
  console.log('🔥 Plan type set to:', planType)
}

// TEMP: Manual trigger to test subscription sync
async function manualSyncSubscription(subscriptionId: string) {
  console.log('🔥 MANUAL SYNC TRIGGERED for subscription:', subscriptionId)
  
  try {
    // Get subscription from Stripe
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    console.log('🔥 Retrieved subscription from Stripe:', subscription.id)
    
    const userId = subscription.metadata?.userId
    if (!userId) {
      console.error('🔥 ERROR: No userId in subscription metadata!')
      return { success: false, error: 'No userId in metadata' }
    }
    
    // Force upsert
    await upsertSubscription(subscription, userId)
    
    return { success: true, message: 'Subscription synced successfully' }
  } catch (error) {
    console.error('🔥 ERROR in manual sync:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Add GET endpoint for manual testing
export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const subscriptionId = url.searchParams.get('subscription_id')
  
  if (!subscriptionId) {
    return NextResponse.json({ error: 'subscription_id parameter required' }, { status: 400 })
  }
  
  const result = await manualSyncSubscription(subscriptionId)
  return NextResponse.json(result)
} 