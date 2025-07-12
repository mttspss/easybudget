import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe, getPlanType, getBillingInterval } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

// Service role client for webhook - bypasses RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    console.log('✅ Webhook received:', event.type, 'ID:', event.id)
  } catch (error) {
    console.error('❌ Webhook signature verification failed:', error)
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    )
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        console.log('💰 Processing checkout completion for session:', session.id)
        await handleCheckoutCompleted(session)
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        console.log('📋 Processing subscription update:', subscription.id, 'Status:', subscription.status)
        await handleSubscriptionUpdated(subscription)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        console.log('🗑️ Processing subscription deletion:', subscription.id)
        await handleSubscriptionDeleted(subscription)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        console.log('💳 Processing payment success for invoice:', invoice.id)
        await handlePaymentSucceeded(invoice)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        console.log('💳 Processing payment failure for invoice:', invoice.id)
        await handlePaymentFailed(invoice)
        break
      }

      default:
        console.log('ℹ️ Unhandled event type:', event.type)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('❌ ERROR processing webhook:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId
  
  if (!userId) {
    console.error('❌ ERROR: No userId in session metadata!')
    return
  }

  console.log('💰 Processing checkout completion for session mode:', session.mode)

  if (session.subscription) {
    // Handle subscription-based plans (monthly/yearly)
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    )
    await upsertSubscription(subscription, userId)
    console.log('✅ Subscription checkout completed successfully for user:', userId)
  } else if (session.mode === 'payment') {
    // Handle one-time payments (lifetime plans)
    console.log('💰 Processing lifetime payment for user:', userId)
    
    // Get plan details from session metadata
    const planType = session.metadata?.planType as string
    const billingInterval = session.metadata?.billingInterval as string
    
    if (planType && billingInterval === 'lifetime') {
      // Create lifetime subscription record
      const dataToUpsert = {
        user_id: userId,
        subscription_id: null, // No subscription for lifetime
        status: 'active',
        plan_type: planType,
        billing_interval: billingInterval,
        current_period_start: new Date().toISOString(),
        current_period_end: null, // Lifetime never expires
        canceled_at: null,
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabaseAdmin
        .from('user_subscriptions')
        .upsert(dataToUpsert, { onConflict: 'user_id' })

      if (error) {
        console.error('❌ ERROR upserting lifetime subscription:', error)
        throw error
      }

      console.log('✅ Lifetime payment processed successfully for user:', userId, 'Plan:', planType)
    } else {
      console.error('❌ ERROR: Invalid lifetime payment metadata:', { planType, billingInterval })
    }
  } else {
    console.error('❌ ERROR: Unknown session mode:', session.mode)
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId
  
  if (!userId) {
    console.error('❌ ERROR: No userId in subscription metadata!')
    return
  }

  await upsertSubscription(subscription, userId)
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId
  if (!userId) return

  const { error } = await supabaseAdmin
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
    console.error('❌ Error updating canceled subscription:', error)
  } else {
    console.log('✅ Successfully canceled subscription for user:', userId)
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
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
  const invoiceWithSubscription = invoice as any
  if (invoiceWithSubscription.subscription && typeof invoiceWithSubscription.subscription === 'string') {
    const subscription = await stripe.subscriptions.retrieve(invoiceWithSubscription.subscription)
    const userId = subscription.metadata?.userId
    
    if (userId) {
      const { error } = await supabaseAdmin
        .from('user_subscriptions')
        .update({
          status: 'past_due',
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('subscription_id', subscription.id)

      if (error) {
        console.error('❌ Error updating past due subscription:', error)
      }
    }
  }
}

async function upsertSubscription(subscription: Stripe.Subscription, userId: string) {
  const subscriptionData = subscription as any
  const firstItem = subscriptionData.items?.data?.[0]
  
  const priceId = subscription.items.data[0]?.price?.id
  if (!priceId) {
    console.error('❌ ERROR: No price ID found in subscription!')
    return
  }

  const planType = getPlanType(priceId)
  const billingInterval = getBillingInterval(priceId)
  
  // Convert timestamps from subscription item
  const toDateOrNull = (timestamp?: number | null) => 
    typeof timestamp === 'number' ? new Date(timestamp * 1000).toISOString() : null

  const currentPeriodStart = toDateOrNull(firstItem?.current_period_start)
  const currentPeriodEnd = toDateOrNull(firstItem?.current_period_end)

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

  const { error } = await supabaseAdmin
    .from('user_subscriptions')
    .upsert(dataToUpsert, { onConflict: 'user_id' })

  if (error) {
    console.error('❌ ERROR upserting subscription:', error)
    throw error
  }

  console.log('✅ Subscription updated successfully for user:', userId, 'Plan:', planType)
} 