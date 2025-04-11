import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma  from "@/lib/prisma"
import authConfig from "./auth.config"
 
export const { handlers, auth, signIn, signOut } = NextAuth({
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      // Perform any custom sign-in logic here if needed
      console.log({user});
      return true; // Return true to allow sign-in
    },
    async session({ token, session}) {
      // Add custom properties to the session object here if needed
      if(token.sub && session.user){
        session.user.id = token.sub;
      }
      return session
    },
    async jwt({ token, user }) {
      // Add custom properties to the JWT token here if needed
      return token
    },
  },
  adapter: PrismaAdapter(prisma.$extends({})),
  session: { strategy: "jwt" },
  ...authConfig
})