import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { Toaster } from "@/components/ui/sonner";
import { OnboardingProvider } from "@/lib/onboarding-context";
import { DashboardProvider } from '@/lib/dashboard-context';
import { SubscriptionProvider } from '@/lib/subscription-context';
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "easybudget.ing | From Financial Chaos to Clarity in Seconds",
  description: "Stop guessing where your money goes. Easybudget turns your messy bank statements into a simple, beautiful dashboard. See everything, track goals, and finally feel in control.",
  icons: {
    icon: [
      { url: '/favicon1.png', type: 'image/png' },
      { url: '/favicon1.png', type: 'image/png', sizes: '32x32' },
      { url: '/favicon1.png', type: 'image/png', sizes: '16x16' },
    ],
    apple: '/favicon1.png',
  },
  openGraph: {
    title: 'easybudget.ing | From Financial Chaos to Clarity in Seconds',
    description: 'Stop guessing where your money goes. Easybudget turns your messy bank statements into a simple, beautiful dashboard.',
    url: 'https://easybudget.ing',
    siteName: 'easybudget.ing',
    images: [
      {
        url: 'https://easybudget.ing/og-image.png',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'easybudget.ing | From Financial Chaos to Clarity in Seconds',
    description: 'Stop guessing where your money goes. Easybudget turns your messy bank statements into a simple, beautiful dashboard.',
    images: ['https://easybudget.ing/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <AuthProvider>
            <DashboardProvider>
              <SubscriptionProvider>
                <OnboardingProvider>
                  {children}
                  <Toaster />
                </OnboardingProvider>
              </SubscriptionProvider>
            </DashboardProvider>
          </AuthProvider>
        </ThemeProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "easybudget.ing",
            "operatingSystem": "WEB",
            "applicationCategory": "FinanceApplication",
            "logo": "https://easybudget.ing/newicon1.png",
            "url": "https://easybudget.ing",
            "author": {
              "@type": "Organization",
              "name": "EasyBudget"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.9",
              "ratingCount": "88"
            },
            "offers": [
              {
                "@type": "Offer",
                "name": "Starter",
                "price": "14.00",
                "priceCurrency": "USD"
              },
              {
                "@type": "Offer",
                "name": "Pro",
                "price": "29.00",
                "priceCurrency": "USD"
              },
              {
                "@type": "Offer",
                "name": "Growth",
                "price": "49.00",
                "priceCurrency": "USD"
              }
            ]
          })}}
        />
      </body>
    </html>
  );
}
