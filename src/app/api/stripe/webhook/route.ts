import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe, getPlanType, getBillingInterval } from '@/lib/stripe'
import { supabase } from '@/lib/supabase'
import Stripe from 'stripe'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    )
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutCompleted(session)
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdated(subscription)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(subscription)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentSucceeded(invoice)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentFailed(invoice)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId
  if (!userId) return

  console.log('Checkout completed for user:', userId)
  
  // Get subscription details
  if (session.subscription) {
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    )
    await upsertSubscription(subscription, userId)
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId
  if (!userId) return

  await upsertSubscription(subscription, userId)
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId
  if (!userId) return

  console.log('Subscription deleted for user:', userId)

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
    console.error('Error updating canceled subscription:', error)
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('Payment succeeded for invoice:', invoice.id)
  
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
  console.log('Payment failed for invoice:', invoice.id)
  
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
        console.error('Error updating past due subscription:', error)
      }
    }
  }
}

async function upsertSubscription(subscription: Stripe.Subscription, userId: string) {
  const priceId = subscription.items.data[0]?.price?.id
  if (!priceId) return

  const planType = getPlanType(priceId)
  const billingInterval = getBillingInterval(priceId)

  const subscriptionData = {
    user_id: userId,
    subscription_id: subscription.id,
    status: subscription.status,
    plan_type: planType,
    billing_interval: billingInterval,
    current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
    current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
    canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
    created_at: new Date(subscription.created * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase
    .from('user_subscriptions')
    .upsert(subscriptionData)

  if (error) {
    console.error('Error upserting subscription:', error)
    throw error
  }

  console.log(`Subscription ${subscription.id} updated for user ${userId}`)
} 