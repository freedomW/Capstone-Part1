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
} satisfies NextAuthConfig;