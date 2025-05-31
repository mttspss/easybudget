import Link from "next/link"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <Link href="/" className="text-gray-600 hover:text-gray-900 text-sm">
            ← Back to Home
          </Link>
        </div>
        
        <div className="prose prose-gray max-w-none">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
            <p className="text-yellow-800 font-medium">
              🚧 This page is under construction. Privacy Policy will be available soon.
            </p>
          </div>
          
          <p className="text-gray-600 text-lg">
            We take your privacy seriously and are working on a comprehensive privacy policy 
            that will outline how we collect, use, and protect your personal information.
          </p>
          
          <div className="mt-8 p-6 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">In the meantime:</h3>
            <ul className="space-y-2 text-gray-600">
              <li>• Your data is encrypted and secure</li>
              <li>• We never sell your personal information</li>
              <li>• You can delete your account anytime</li>
              <li>• Questions? Contact us at hello@easybudget.ing</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
} 