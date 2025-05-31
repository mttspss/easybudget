import Link from "next/link"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <Link href="/" className="text-gray-600 hover:text-gray-900 text-sm">
            ← Back to Home
          </Link>
        </div>
        
        <div className="prose prose-gray max-w-none">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
            <p className="text-yellow-800 font-medium">
              🚧 This page is under construction. Terms of Service will be available soon.
            </p>
          </div>
          
          <p className="text-gray-600 text-lg">
            We are working on comprehensive terms of service that will outline 
            the rules and guidelines for using our platform.
          </p>
          
          <div className="mt-8 p-6 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">In the meantime:</h3>
            <ul className="space-y-2 text-gray-600">
              <li>• Use the platform responsibly</li>
              <li>• Don&apos;t share account credentials</li>
              <li>• Report any issues or bugs</li>
              <li>• Questions? Contact us at hello@easybudget.ing</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
} 