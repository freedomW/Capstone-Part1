import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { PolicyHoldersTable } from "@/components/policyholders/policyholders-table";

export default function PolicyHoldersPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Policy Holders" text="Manage all policy holders.">
        <Button asChild>
          <Link href="/policyholders/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Policy Holder
          </Link>
        </Button>
      </DashboardHeader>
      <PolicyHoldersTable />
    </DashboardShell>
  );
}