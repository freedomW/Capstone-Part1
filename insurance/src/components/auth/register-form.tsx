"use client";
import { EyeIcon, EyeOffIcon } from "lucide-react"
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useTransition, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerUser } from "@/actions/register";
import { z } from "zod";
import { registerSchema } from "@/schemas";
import { FormError } from "@/components/ui/form-error";
import { FormSucess } from "@/components/ui/form-success";
import { GithubSignInButton } from "@/components/auth/github-signin-button";

import Link from "next/link";

export function RegisterForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
    const [isPending, startTransition] = useTransition();
    const [isView, setIsView] = useState(false);
    const [error, setError] = useState<string|undefined>("");
    const [success, setSuccess] = useState<string|undefined>("");
  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  function onSubmit(values: z.infer<typeof registerSchema>) {
    setError("");
    setSuccess("");
    startTransition(() => {
        registerUser(values)
            .then((data) => {
                setError(data.error);
                setSuccess(data.success);
            })
            .finally(() => {
              setTimeout(() => {
                window.location.href = "/auth/login";
              }, 500); // Redirect after 0.5 second
          })
    });
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">🔒 Register</CardTitle>
          <CardDescription>
            Enter your details to create a new account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
              <div className="flex flex-col gap-6">
                <FormField
                  name="name"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input
                          id="name"
                          type="text"
                          disabled={isPending}
                          placeholder="John Doe"
                          required
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="email"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          id="email"
                          type="email"
                          disabled={isPending}
                          placeholder="m@example.com"
                          required
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="password"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                      <div className="relative">
                        <Input
                          id="password"
                          type={isView ? "text" : "password"}
                          disabled={isPending}
                          required
                          {...field}
                        />
                        {isView ? (
                          <EyeIcon
                            className="absolute right-1.5 top-1.5 z-10 cursor-pointer text-gray-500"
                            onClick={() => {
                              setIsView(!isView), console.log(isView);
                            }}
                          />
                        ) : (
                          <EyeOffIcon
                            className="absolute right-1.5 top-1.5 z-10 cursor-pointer text-gray-500"
                            onClick={() => setIsView(!isView)}
                          />
                        )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="confirmPassword"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input
                          id="confirmPassword"
                          type="password"
                          disabled={isPending}
                          required
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormError message={error} />
                <FormSucess message={success} />
                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending ? "Registering..." : "Register"}
                </Button>
              </div>
            </form>
          </Form>

          <GithubSignInButton className="w-full mt-6" disabled={isPending} />
          
          <div className="w-full pt-6 pl-6 pr-6 flex items-center justify-between">
              <Link href="/auth/login" className="w-full text-sm text-blue-500 hover:underline">
                  Already have an account? Login here
              </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}