import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./prisma"

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    session: async ({ session, token }: any) => {
      if (session?.user && token?.sub) {
        session.user.id = token.sub
      }
      return session
    },
    jwt: async ({ user, token }: any) => {
      if (user) {
        token.sub = user.id
      }
      return token
    },
  },
  session: {
    strategy: "jwt" as const,
  },
  events: {
    signIn: async (message: any) => {
      console.log('✅ User signed in successfully:', message);
    },
    error: async (message: any) => {
      console.error('❌ Auth error occurred:', message);
    },
    createUser: async (message: any) => {
      console.log('👤 New user created:', message);
    },
  },
  logger: {
    error(code: any, metadata: any) {
      console.error('🚨 NextAuth Error:', code, metadata);
    },
    warn(code: any) {
      console.warn('⚠️ NextAuth Warning:', code);
    },
    debug(code: any, metadata: any) {
      console.log('🔍 NextAuth Debug:', code, metadata);
    },
  },
  debug: true,
  secret: process.env.NEXTAUTH_SECRET,
} 