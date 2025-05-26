import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "EasyBudget - Personal Finance & Budgeting App",
  description: "Take control of your finances with EasyBudget. Track expenses, manage budgets, and achieve your financial goals.",
  keywords: ["budgeting", "finance", "expense tracking", "personal finance", "money management"],
  authors: [{ name: "EasyBudget Team" }],
  creator: "EasyBudget",
  publisher: "EasyBudget",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
