"use client"

import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import PoliciesForm from "@/components/policies/policies-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function AddPolicyPage() {
  const handleFormSubmit = async (formData: any) => {
    try {
      const response = await fetch("/api/policies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("Policy added successfully!");
      } else {
        alert("Failed to add policy.");
      }
    } catch (error) {
      console.error("Error adding policy:", error);
      alert("An error occurred.");
    }
  };

  return (
    <DashboardShell>
      <DashboardHeader heading="Add Insurance Policies">
        <Button variant="ghost" className="mb-4" asChild>
          <Link href="/policies">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Policies
          </Link>
        </Button>
      </DashboardHeader>
        <PoliciesForm onSubmit={handleFormSubmit} />
    </DashboardShell>
  );
}