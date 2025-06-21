"use client"

import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Linkedin, Twitter } from "lucide-react"

export default function PrivacyPolicyPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <nav className="py-4 px-6 border-b border-gray-200">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg overflow-hidden">
              <Image src="/newicon1.png" alt="EasyBudget Logo" width={32} height={32} className="w-full h-full object-contain" />
            </div>
            <span className="text-xl font-semibold">
              <span className="text-black">easybudget</span>
              <span style={{color: '#60ea8b'}}>.ing</span>
            </span>
          </div>
          
          <Button 
            variant="ghost" 
            onClick={() => router.push('/')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </Button>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="prose prose-lg max-w-none">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
          
          <p className="text-gray-600 mb-8">
            <strong>Last updated:</strong> June 22, 2025
          </p>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
              <p className="text-gray-700 leading-relaxed">
                Welcome to EasyBudget (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our website, easybudget.ing, and its related services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">a. Information You Provide to Us</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Account Information:</strong> When you register, we collect your email address and name. If you sign up using Google, we receive your name, email, and profile picture as provided by your Google account.</li>
                <li><strong>Financial Data from CSV:</strong> You may choose to upload CSV files containing your financial transactions. We process this data to provide you with our services, but we do not store the CSV file itself after processing. The extracted transaction data (description, amount, date) is stored securely in our database.</li>
                <li><strong>Subscription Data:</strong> When you subscribe to a paid plan, our payment processor, Stripe, collects your payment information. We do not store your full credit card details, but we do store subscription-related information like your plan type and status.</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">b. Information We Collect Automatically</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Usage Data:</strong> We may collect data about how you interact with our service, such as features used and time spent on the platform, to help us improve our product.</li>
                <li><strong>Device Information:</strong> We may collect standard device information, such as IP address and browser type, for security and analytics purposes.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>To provide, operate, and maintain our services.</li>
                <li>To process and categorize the financial data you upload.</li>
                <li>To manage your account, including your subscription plan and its associated limits.</li>
                <li>To communicate with you, including sending welcome emails and important service updates.</li>
                <li>To improve our website and services based on user feedback and usage patterns.</li>
                <li>To ensure security, prevent fraud, and enforce our terms of service.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Data Security</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We take your data security seriously. Our platform is built on Supabase, which provides enterprise-grade security features. All data is encrypted at rest and in transit using industry-standard protocols. We do not have access to your raw payment details, as they are handled securely by Stripe.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Information Sharing</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We do not sell your personal data. We will not share your information with third parties, except in the following limited circumstances:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>With service providers like Supabase (database), Vercel (hosting), and Stripe (payments), who help us operate our platform.</li>
                <li>To comply with a legal obligation or a valid governmental request.</li>
                <li>To protect the security or integrity of our service.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Your Rights and Data Control</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                You are in control of your data. You have the right to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Access and review the personal information you have provided.</li>
                <li>Delete your account and all associated data at any time from your profile page.</li>
                <li>Export your transaction data.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Children&apos;s Privacy</h2>
              <p className="text-gray-700 leading-relaxed">
                Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Changes to This Policy</h2>
              <p className="text-gray-700 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the new policy on this page and updating the &quot;Last updated&quot; date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Contact Us</h2>
              <p className="text-gray-700 leading-relaxed">
                If you have any questions about this Privacy Policy, please contact us at:
              </p>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700">
                  <strong>Email:</strong> noreply@easybudget.ing
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative border-t border-gray-200 py-16">
        <div className="relative max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-4 gap-8 mb-12">
            {/* Product */}
            <div>
              <h4 className="font-bold text-slate-900 mb-6">Product</h4>
              <ul className="space-y-4 text-slate-600">
                <li><Link href="/#benefits" className="hover:text-slate-900 transition-colors">Features</Link></li>
                <li><Link href="/#pricing" className="hover:text-slate-900 transition-colors">Pricing</Link></li>
                <li><a href="#" className="hover:text-slate-900 transition-colors">Security</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-bold text-slate-900 mb-6">Company</h4>
              <ul className="space-y-4 text-slate-600">
                <li><a href="/changelog" className="hover:text-slate-900 transition-colors">Roadmap</a></li>
                <li><a href="#" className="hover:text-slate-900 transition-colors">Contact</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-bold text-slate-900 mb-6">Legal</h4>
              <ul className="space-y-4 text-slate-600">
                <li><a href="/privacy" className="hover:text-slate-900 transition-colors">Privacy Policy</a></li>
                <li><a href="/terms" className="hover:text-slate-900 transition-colors">Terms of Service</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-bold text-slate-900 mb-6">Contact Us</h4>
              <div className="space-y-4">
                <p className="text-slate-600">
                  Questions about our privacy practices?
                </p>
                <div className="space-y-2 text-slate-600">
                  <p>
                    <strong>Support:</strong> noreply@easybudget.ing
                  </p>
                </div>
                <Button 
                  onClick={() => router.push('/')} 
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium"
                >
                  Back to Homepage
                </Button>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg overflow-hidden">
                  <Image src="/newicon1.png" alt="EasyBudget Logo" width={32} height={32} className="w-full h-full object-contain" />
                </div>
                <span className="text-xl font-bold">
                  <span className="text-slate-900">easybudget</span>
                  <span style={{color: '#60ea8b'}}>.ing</span>
                </span>
              </div>
              
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-4">
                  <a href="#" className="text-slate-600 hover:text-slate-900 transition-colors">
                    <Linkedin className="w-5 h-5" />
                  </a>
                  <a href="#" className="text-slate-600 hover:text-slate-900 transition-colors">
                    <Twitter className="w-5 h-5" />
                  </a>
                </div>
                <span className="text-slate-600">
                  noreply@easybudget.ing
                </span>
              </div>
            </div>
            
            <div className="text-center mt-8">
              <p className="text-slate-500">
                © 2025 EasyBudget. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
} 