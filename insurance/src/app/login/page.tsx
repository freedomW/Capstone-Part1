"use client";

import { Card } from "@/components/ui/card";
import { LoginForm } from "@/components/login/login-form";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="flex h-screen items-center justify-center bg-secondary">
      <Card className="w-full max-w-sm p-6 shadow-lg rounded-lg border">
        <LoginForm />
      </Card>
    </div>
  );
}