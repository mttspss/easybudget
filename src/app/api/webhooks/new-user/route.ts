import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();

    // Basic validation
    if (payload.type !== 'INSERT' || !payload.record) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const { email, raw_user_meta_data } = payload.record;
    const userName = raw_user_meta_data?.full_name || email.split('@')[0];

    // Internal fetch to our send-email API
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://easybudget.ing';
    await fetch(`${baseUrl}/api/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: email,
        subject: 'Welcome to EasyBudget!',
        userName: userName,
      }),
    });

    return NextResponse.json({ message: 'Webhook processed successfully' });
  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 