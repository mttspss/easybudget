import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center px-4">
      <h1 className="text-6xl font-bold text-gray-900">404</h1>
      <p className="text-2xl font-medium text-gray-700 mt-2">Page Not Found</p>
      <p className="text-gray-500 mt-4 max-w-sm">
        Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been moved, deleted, or maybe you just mistyped the URL.
      </p>
      <Link href="/" passHref>
        <Button className="mt-8 bg-green-500 hover:bg-green-600 text-white">
          Go back home
        </Button>
      </Link>
    </div>
  )
} 