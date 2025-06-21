import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import WelcomeEmail from '@/components/emails/welcome-email';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { to, subject, userName } = body;

    if (!to || !subject) {
      return NextResponse.json({ error: 'Missing required fields: to, subject' }, { status: 400 });
    }

    const { data, error } = await resend.emails.send({
      from: 'EasyBudget <noreply@easybudget.ing>',
      to: [to],
      subject: subject,
      react: WelcomeEmail({ userName }),
    });

    if (error) {
      console.error('Resend API Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Email sent successfully', data });
  } catch (error) {
    console.error('Internal Server Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 