"use client";

import { Card } from "@/components/ui/card";
import { RegisterForm } from "@/components/register/register-form";

export default function LoginPage() {
  return (
    <div className="flex h-screen items-center justify-center bg-secondary">
      <Card className="w-full max-w-sm p-6 shadow-lg rounded-lg border">
        <RegisterForm />
      </Card>
    </div>
  );
}