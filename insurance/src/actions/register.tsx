"use server";
import { z } from "zod";
import { registerSchema } from "@/schemas";
import prisma from "@/lib/prisma";
import { hash } from "@uswriting/bcrypt";
import { getUserByEmail } from "@/actions/user";

export const registerUser = async (values: z.infer<typeof registerSchema>) => {
    const validateFields = registerSchema.safeParse(values);
    if (!validateFields.success) {
        return { error: "Invalid fields!" };
    }

    const { name, email, password } = validateFields.data;
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
        return { error: "Email already exists!" };
    }

    const hashedPassword = await hash(password, 10);
    const newUser = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
        },
    });
    if (!newUser) {
        return { error: "Failed to create user!" };
    }

    // Optionally, you can send a verification email here
    // await sendVerificationEmail(newUser.email, newUser.verificationToken);

    return { success: "Register Success" };
}