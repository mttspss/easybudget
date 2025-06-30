import { NextRequest, NextResponse } from 'next/server'
import { stripe, getPlanType, getBillingInterval } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'

// Service role client - bypasses RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { confirm } = await request.json()
    
    if (!confirm) {
      return NextResponse.json({
        error: 'This endpoint requires confirmation',
        usage: 'POST /api/debug/fix-subscriptions with {"confirm": true} to run',
        warning: 'This will update subscription plan types based on Stripe data'
      }, { status: 400 })
    }

    console.log('🔧 Starting subscription fix process...')

    // Get all subscriptions that have a subscription_id but plan_type = 'free'
    const { data: brokenSubscriptions, error: queryError } = await supabaseAdmin
      .from('user_subscriptions')
      .select('*')
      .not('subscription_id', 'is', null)
      .eq('plan_type', 'free')

    if (queryError) {
      throw queryError
    }

    console.log(`Found ${brokenSubscriptions?.length || 0} potentially broken subscriptions`)

    const results = []

    for (const sub of brokenSubscriptions || []) {
      try {
        console.log(`Checking subscription ${sub.subscription_id} for user ${sub.user_id}`)
        
        // Get subscription from Stripe
        const stripeSubscription = await stripe.subscriptions.retrieve(sub.subscription_id)
        
        const priceId = stripeSubscription.items.data[0]?.price?.id
        if (!priceId) {
          console.warn(`No price ID found for subscription ${sub.subscription_id}`)
          results.push({
            subscription_id: sub.subscription_id,
            user_id: sub.user_id,
            status: 'skipped',
            reason: 'No price ID found'
          })
          continue
        }

        const correctPlanType = getPlanType(priceId)
        const correctBillingInterval = getBillingInterval(priceId)

        console.log(`Subscription ${sub.subscription_id}:`)
        console.log(`  Current plan_type: ${sub.plan_type}`)
        console.log(`  Correct plan_type: ${correctPlanType}`)
        console.log(`  Price ID: ${priceId}`)

        if (correctPlanType === 'free') {
          console.log(`  ℹ️ Plan type is correctly 'free', skipping`)
          results.push({
            subscription_id: sub.subscription_id,
            user_id: sub.user_id,
            status: 'skipped',
            reason: 'Plan type is correctly free'
          })
          continue
        }

        // Update the subscription
        const { error: updateError } = await supabaseAdmin
          .from('user_subscriptions')
          .update({
            plan_type: correctPlanType,
            billing_interval: correctBillingInterval,
            status: stripeSubscription.status,
            updated_at: new Date().toISOString()
          })
          .eq('subscription_id', sub.subscription_id)

        if (updateError) {
          console.error(`❌ Error updating subscription ${sub.subscription_id}:`, updateError)
          results.push({
            subscription_id: sub.subscription_id,
            user_id: sub.user_id,
            status: 'error',
            error: updateError.message,
            old_plan_type: sub.plan_type,
            new_plan_type: correctPlanType
          })
        } else {
          console.log(`✅ Updated subscription ${sub.subscription_id}: ${sub.plan_type} → ${correctPlanType}`)
          results.push({
            subscription_id: sub.subscription_id,
            user_id: sub.user_id,
            status: 'updated',
            old_plan_type: sub.plan_type,
            new_plan_type: correctPlanType,
            billing_interval: correctBillingInterval
          })
        }

      } catch (error) {
        console.error(`❌ Error processing subscription ${sub.subscription_id}:`, error)
        results.push({
          subscription_id: sub.subscription_id,
          user_id: sub.user_id,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    const summary = {
      total: results.length,
      updated: results.filter(r => r.status === 'updated').length,
      skipped: results.filter(r => r.status === 'skipped').length,
      errors: results.filter(r => r.status === 'error').length
    }

    console.log('🎯 Fix process completed:', summary)

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      summary,
      results
    })

  } catch (error) {
    console.error('Fix API error:', error)
    return NextResponse.json(
      { error: 'Fix API failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 