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

    // Get some user initials (anonymized) for display
    const { data: usersData, error: usersError } = await supabaseAdmin
      .from('user_subscriptions')
      .select(`
        user_id
      `)
      .limit(20)

    let initials: string[] = []
    
    if (!usersError && usersData) {
      // Get user emails from auth.users table to extract initials
      const userIds = usersData.map(u => u.user_id)
      
      const { data: authUsers, error: authError } = await supabaseAdmin
        .from('auth.users')
        .select('email')
        .in('id', userIds)
        .limit(20)
      
      if (!authError && authUsers) {
        initials = authUsers
          .map(user => {
            if (user.email) {
              // Extract first letter of email (before @)
              const emailPart = user.email.split('@')[0]
              return emailPart.charAt(0).toUpperCase()
            }
            return null
          })
          .filter(Boolean)
          .slice(0, 8) // Take only 8 initials
      }
    }

    // Fallback initials if we can't get real ones
    if (initials.length < 8) {
      const fallbackInitials = ['M', 'A', 'S', 'L', 'E', 'R', 'C', 'D']
      initials = [...initials, ...fallbackInitials].slice(0, 8)
    }

    // Return the count with initials
    return NextResponse.json({
      totalUsers: count || 0,
      userInitials: initials,
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