import NextAuth from "next-auth/next"
import { authOptions } from "@/lib/auth"

// Debug environment variables
console.log('🔍 Environment check:');
console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL);
console.log('NEXTAUTH_SECRET exists:', !!process.env.NEXTAUTH_SECRET);
console.log('GOOGLE_CLIENT_ID exists:', !!process.env.GOOGLE_CLIENT_ID);
console.log('GOOGLE_CLIENT_SECRET exists:', !!process.env.GOOGLE_CLIENT_SECRET);
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }

// Test with new MongoDB database - 2024-05-27 