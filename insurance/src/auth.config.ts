import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { compare } from "@uswriting/bcrypt"

import { loginSchema } from "./schemas"
import { getUserByEmail } from "./actions/user"

import Github from "next-auth/providers/github"
 
export default {
     providers: [
        Github({
            clientId: process.env.GITHUB_ID,
            clientSecret: process.env.GITHUB_SECRET,
        }),
        Credentials({
            async authorize(credentials, req){
                const validatedFields = loginSchema.safeParse(credentials);
                if (!validatedFields.success) {
                    return null;
                }
                const { email, password } = validatedFields.data;
                const user = await getUserByEmail(email);
                if (!user || !user.password) {
                    return null;
                }
                
                const isPasswordValid = await compare(password, user.password);
                if (!isPasswordValid) {
                    return null;
                }
                if(isPasswordValid){
                    user.password = "" // Remove password from user object before returning
                    return user;
                }
                
                return null; 
            }
        })
     ],
     callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.email = user.email;
                token.role = user.role; // Assuming you have a role field in your user object
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id as string;
                session.user.role = token.role as string; // Assuming you have a role field in your user object
            }
            return session;
        },
        // This is the key callback for middleware
        authorized({ auth, request: { nextUrl } }) {
            // Add role to auth object for middleware
            if (auth?.user) {
                // Explicitly include role from JWT in the auth object for middleware
                auth.user.role = auth.user?.role as string;
            }
            return true; // Continue with default authorization
        },
    },
} satisfies NextAuthConfig;