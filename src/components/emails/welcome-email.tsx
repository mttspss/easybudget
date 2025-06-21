import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface WelcomeEmailProps {
  userName?: string;
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://easybudget.ing';

export const WelcomeEmail = ({ userName }: WelcomeEmailProps) => (
  <Html>
    <Head />
    <Preview>Welcome to EasyBudget! Take control of your finances.</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img
          src={`${baseUrl}/newicon1.png`}
          width="48"
          height="48"
          alt="EasyBudget"
        />
        <Heading style={h1}>Welcome to EasyBudget, {userName || 'there'}!</Heading>
        <Text style={text}>
          Thank you for signing up. We&apos;re excited to help you take control of your finances and achieve your goals.
        </Text>
        <Text style={text}>
          To get started, simply head to your dashboard and begin by importing your transactions or adding your first income/expense.
        </Text>
        <Button
          style={button}
          href={`${baseUrl}/dashboard`}
        >
          Go to Your Dashboard
        </Button>
        <Text style={text}>
          If you have any questions, feel free to reply to this email. We&apos;re here to help!
        </Text>
        <Text style={text}>
          Best,
          <br />
          The EasyBudget Team
        </Text>
      </Container>
    </Body>
  </Html>
);

export default WelcomeEmail;

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0',
};

const text = {
  color: '#555',
  fontSize: '16px',
  lineHeight: '26px',
};

const button = {
  backgroundColor: '#22c55e',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  width: '100%',
  padding: '12px',
}; 