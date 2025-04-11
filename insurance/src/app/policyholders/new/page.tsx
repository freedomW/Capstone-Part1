"use client";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import PolicyHolderForm from "@/components/policyholders/policyholder-form";

export default function AddPolicyHolderPage() {
  const handleFormSubmit = async (formData: any) => {
    try {
      const response = await fetch("/api/policyholders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("Policy holder added successfully!");
      }else {
        alert("Failed to add policy holder.");
      }
    } catch (error) {
      console.error("Error adding policy holder:", error);
      alert("An error occurred.");
    }
  };

  return (
    <DashboardShell>
      <DashboardHeader heading="Add Policy Holder">
        <Button variant="ghost" className="mb-4" asChild>
          <Link href="/policyholders">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Policy Holders
          </Link>
        </Button>
      </DashboardHeader>
      <PolicyHolderForm onSubmit={handleFormSubmit} />
    </DashboardShell>
  );
}