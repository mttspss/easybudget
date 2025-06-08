"use client"

import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Linkedin, Twitter } from "lucide-react"

export default function TermsOfServicePage() {
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
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>
          
          <p className="text-gray-600 mb-8">
            <strong>Last updated:</strong> December 2024
          </p>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                By accessing and using EasyBudget services (easybudget.ing), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Description of Service</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                EasyBudget provides financial management software that helps users:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Connect and aggregate financial accounts</li>
                <li>Automatically categorize transactions</li>
                <li>Generate financial reports and insights</li>
                <li>Track budgets and financial goals</li>
                <li>Monitor cash flow and spending patterns</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Accounts</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Account Registration</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li>You must provide accurate and complete information</li>
                <li>You are responsible for maintaining account security</li>
                <li>You must be at least 18 years old to create an account</li>
                <li>One person or entity may maintain only one account</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">Account Responsibilities</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Keep your login credentials secure and confidential</li>
                <li>Notify us immediately of any unauthorized access</li>
                <li>You are liable for all activities that occur under your account</li>
                <li>Provide accurate financial account information</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Acceptable Use</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Permitted Use</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                You may use EasyBudget for legitimate personal or business financial management purposes only.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">Prohibited Activities</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Using the service for illegal activities</li>
                <li>Attempting to gain unauthorized access to our systems</li>
                <li>Interfering with or disrupting our services</li>
                <li>Sharing account access with unauthorized users</li>
                <li>Reverse engineering or copying our software</li>
                <li>Using automated scripts or bots</li>
                <li>Violating any applicable laws or regulations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Financial Data and Security</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Data Collection</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                We collect financial data solely to provide our services. This includes transaction history, account balances, and related financial information.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">Security Measures</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Bank-level 256-bit SSL encryption</li>
                <li>SOC 2 Type II compliance</li>
                <li>Regular security audits and monitoring</li>
                <li>Multi-factor authentication</li>
                <li>Read-only access to financial accounts</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Subscription and Billing</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Subscription Plans</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li>Professional Plan: $29/month</li>
                <li>Business Plan: $89/month</li>
                <li>Enterprise Plan: Custom pricing</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">Billing Terms</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Subscriptions are billed monthly in advance</li>
                <li>All fees are non-refundable except as required by law</li>
                <li>You can cancel your subscription at any time</li>
                <li>Service continues until the end of the current billing period</li>
                <li>We may change pricing with 30 days notice</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Intellectual Property</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                EasyBudget and all related intellectual property rights are owned by us or our licensors. This includes:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Software, algorithms, and technology</li>
                <li>Trademarks, logos, and branding</li>
                <li>Content, documentation, and materials</li>
                <li>Data processing and categorization methods</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Privacy and Data Protection</h2>
              <p className="text-gray-700 leading-relaxed">
                Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy, which is incorporated into these Terms by reference.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Service Availability</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>We strive for 99.9% uptime but cannot guarantee uninterrupted service</li>
                <li>Planned maintenance will be communicated in advance</li>
                <li>We are not liable for service interruptions beyond our control</li>
                <li>You are responsible for maintaining internet connectivity</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Disclaimer of Warranties</h2>
              <p className="text-gray-700 leading-relaxed">
                THE SERVICE IS PROVIDED ON AN AS-IS AND AS-AVAILABLE BASIS. WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Limitation of Liability</h2>
              <p className="text-gray-700 leading-relaxed">
                IN NO EVENT SHALL EASYBUDGET BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOST PROFITS, DATA, OR USE, INCURRED BY YOU OR ANY THIRD PARTY.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Termination</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Termination by User</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                You may terminate your account at any time by canceling your subscription or contacting support.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">Termination by EasyBudget</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                We may terminate or suspend your account for violations of these Terms or for any other reason with reasonable notice.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">Effect of Termination</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Access to the service will be discontinued</li>
                <li>You may export your data within 30 days</li>
                <li>Your data will be deleted after the grace period</li>
                <li>Outstanding fees remain due</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Governing Law</h2>
              <p className="text-gray-700 leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws of the United States and the state in which EasyBudget is incorporated, without regard to conflict of law principles.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Changes to Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to modify these Terms at any time. We will provide notice of material changes via email or through the service. Continued use after changes constitutes acceptance of the new Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">15. Contact Information</h2>
              <p className="text-gray-700 leading-relaxed">
                If you have questions about these Terms of Service, please contact us:
              </p>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700">
                  <strong>Email:</strong> legal@easybudget.ing<br />
                  <strong>Support:</strong> hello@easybudget.ing<br />
                  <strong>Address:</strong> EasyBudget Legal Department<br />
                  <strong>Response Time:</strong> We will respond to legal inquiries within 5 business days
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
                <li><a href="#" className="hover:text-slate-900 transition-colors">Integrations</a></li>
                <li><a href="#" className="hover:text-slate-900 transition-colors">API Documentation</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-bold text-slate-900 mb-6">Company</h4>
              <ul className="space-y-4 text-slate-600">
                <li><a href="#" className="hover:text-slate-900 transition-colors">About</a></li>
                <li><a href="#" className="hover:text-slate-900 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-slate-900 transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-slate-900 transition-colors">Contact</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-bold text-slate-900 mb-6">Legal</h4>
              <ul className="space-y-4 text-slate-600">
                <li><a href="/privacy" className="hover:text-slate-900 transition-colors">Privacy Policy</a></li>
                <li><a href="/terms" className="hover:text-slate-900 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-slate-900 transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-slate-900 transition-colors">Compliance</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-bold text-slate-900 mb-6">Contact Us</h4>
              <div className="space-y-4">
                <p className="text-slate-600">
                  Questions about our terms?
                </p>
                <div className="space-y-2 text-slate-600">
                  <p>
                    <strong>Legal:</strong> legal@easybudget.ing
                  </p>
                  <p>
                    <strong>Support:</strong> hello@easybudget.ing
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
                  hello@easybudget.ing
                </span>
              </div>
            </div>
            
            <div className="text-center mt-8">
              <p className="text-slate-500">
                © 2024 EasyBudget. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
} 