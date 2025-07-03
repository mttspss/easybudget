import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use service role key to access user count without RLS restrictions
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    // Count users from user_subscriptions table (includes free users)
    const { count, error } = await supabaseAdmin
      .from('user_subscriptions')
      .select('*', { count: 'exact', head: true })

    if (error) {
      console.error('Error counting users:', error)
      return NextResponse.json(
        { error: 'Failed to fetch user count' },
        { status: 500 }
      )
    }

    // Return the count with some additional stats
    return NextResponse.json({
      totalUsers: count || 0,
      lastUpdated: new Date().toISOString()
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 