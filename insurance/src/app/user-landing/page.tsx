'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

export default function UserLandingPage() {
  const { data: session } = useSession();

  return (
      <div className="flex items-center justify-center min-h-screen">
      <Card className="mx-auto max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Account Verification Pending</CardTitle>
          <CardDescription>
            Thank you for registering with our insurance platform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <div className="mx-auto my-4 flex h-20 w-20 items-center justify-center rounded-full bg-yellow-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-10 w-10 text-yellow-600"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          
          <p className="text-muted-foreground">
            Your account is currently pending verification by our administrators.
          </p>
          
          <div className="rounded-md bg-blue-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-5 w-5 text-blue-400"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  If you have any questions about your account status, please contact our admin team at{" "}
                  <a
                    href="mailto:admin@insurance.com"
                    className="font-medium text-blue-700 underline hover:text-blue-600"
                  >
                    admin@insurance.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
