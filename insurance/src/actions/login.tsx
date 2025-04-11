"use server";

import { z } from "zod";
import { loginSchema } from "@/schemas";
import { signIn } from "@/auth";
import { defaultRoute } from "@/routes";
import { AuthError } from "next-auth";

export const loginUser = async (values: z.infer<typeof loginSchema>) => {
    const validateFields = loginSchema.safeParse(values);
    if (!validateFields.success) {
        return { error: "Invalid fields!"};
    }

    const { email, password } = validateFields.data;
    try {
        const result = await signIn("credentials", {
            email,
            password,
            redirect: false, // Prevent automatic redirection
            redirectTo: defaultRoute, // Specify the redirect URL after successful login
        });
        return { success: "Login Success" };
    }
    catch (error) {
        if(error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return { error: "Invalid email or password!" };
                default:
                    return { error: "Unknown error occurred!" };
            }            
        }
        console.error("Error during sign-in:", error);
        return { error: "Unknown error occurred!" };
    }
}