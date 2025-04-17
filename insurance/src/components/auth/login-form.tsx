"use client";
import { Button } from "@/components/ui/button"; // Ensure Button is imported
import { EyeIcon, EyeOffIcon } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTransition, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/schemas";
import { loginUser } from "@/actions/login";
import { FormError } from "@/components/ui/form-error";
import { FormSucess } from "../ui/form-success";
import Link from "next/link";
import { GithubSignInButton } from "@/components/auth/github-signin-button";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [isPending, startTransition] = useTransition();
  const [isView, setIsView] = useState(false);
  const [error, setError] = useState<string|undefined>("");
  const [success, setSuccess] = useState<string|undefined>("");
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(values: { email: string; password: string }) {
    setError("");
    setSuccess("");

    startTransition(() => {
      loginUser(values)
        .then((data) => {
          setError(data.error);
          setSuccess(data.success);
        })
        .finally(() => {
            setTimeout(() => {
              window.location.href = "/overview";
            }, 500); // Redirect after 0.5 second
        })
    });
  }


  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">🔒Login</CardTitle>
          <CardDescription>
            Enter your email and password to sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
            <div className="flex flex-col gap-6">
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
              <FormError message = {error}/>
              <FormSucess message = {success} />
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Loading..." : "Sign In"}
              </Button>
            </div>
            </form>
          </Form>
              <GithubSignInButton className="w-full mt-6" disabled={isPending} />
              <div className="w-full pt-6 pl-6 pr-6 flex items-center justify-between">
                <Link href="/auth/register" className="w-full text-sm text-blue-500 hover:underline">
                  Don't have an account? Register here
                </Link>
              </div>
        </CardContent>
      </Card>
    </div>
  );
}
