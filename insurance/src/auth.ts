import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma  from "@/lib/prisma"
import authConfig from "./auth.config"
 
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma.$extends({})),
  session: { 
    strategy: "jwt", 
    maxAge: 60*60*12, // 12 hours
    updateAge: 60*60*6, // 12 hours
  },
  ...authConfig
})