import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { PoliciesTable } from "@/components/policies/policies-table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default function PoliciesPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Insurance Policies" text="Manage all insurance policies.">
        <Button asChild>
          <Link href="/policies/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Policy
          </Link>
        </Button>
      </DashboardHeader>
      <PoliciesTable />
    </DashboardShell>
  )
}

