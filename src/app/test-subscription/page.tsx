"use client"

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'

export default function TestSubscriptionPage() {
  const { user } = useAuth()
  const [result, setResult] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const testSubscriptionTable = async () => {
    if (!user) {
      setResult('❌ No user logged in')
      return
    }

    setLoading(true)
    setResult('🔄 Testing user_subscriptions table...')

    try {
      // Test 1: Try to read from user_subscriptions
      console.log('Testing SELECT from user_subscriptions...')
      const { data: existingData, error: selectError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)

      if (selectError) {
        console.error('SELECT Error:', selectError)
        setResult(`❌ SELECT failed: ${selectError.message}`)
        return
      }

      console.log('SELECT successful, data:', existingData)

      // Test 2: Try to insert a free subscription if none exists
      if (!existingData || existingData.length === 0) {
        console.log('No subscription found, testing INSERT...')
        
        const testSubscription = {
          user_id: user.id,
          subscription_id: null,
          status: 'active' as const,
          plan_type: 'free' as const,
          billing_interval: null,
          current_period_start: null,
          current_period_end: null,
          canceled_at: null,
        }

        const { data: insertData, error: insertError } = await supabase
          .from('user_subscriptions')
          .insert(testSubscription)
          .select()

        if (insertError) {
          console.error('INSERT Error:', insertError)
          setResult(`❌ INSERT failed: ${insertError.message}`)
          return
        }

        console.log('INSERT successful, data:', insertData)
        setResult(`✅ SUCCESS! Created subscription: ${JSON.stringify(insertData, null, 2)}`)
      } else {
        console.log('Subscription already exists:', existingData)
        setResult(`✅ SUCCESS! Found existing subscription: ${JSON.stringify(existingData, null, 2)}`)
      }

    } catch (error) {
      console.error('Test error:', error)
      setResult(`❌ Test failed: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test user_subscriptions Table</h1>
      
      <div className="space-y-4">
        <button
          onClick={testSubscriptionTable}
          disabled={loading || !user}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          {loading ? 'Testing...' : 'Test Subscription Table'}
        </button>

        <pre className="bg-gray-100 p-4 rounded whitespace-pre-wrap text-sm">
          {result || 'Click test button to start...'}
        </pre>

        <div className="text-sm text-gray-600">
          User: {user?.email || 'Not logged in'}
        </div>
      </div>
    </div>
  )
} 