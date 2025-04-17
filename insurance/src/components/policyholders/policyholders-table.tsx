"use client"

import { useState, useEffect } from "react"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

type PolicyHolder = {
  id: string
  policyholderId: string
  firstName: string
  lastName: string
  email: string
  policiesHeld: string[] // List of policy names
}

const fetchPolicyHolders = async (): Promise<PolicyHolder[]> => {
  const response = await fetch("/api/policyholders");
  if (!response.ok) {
    throw new Error("Failed to fetch policyholders");
  }
  return response.json();
};

export const columns: ColumnDef<PolicyHolder>[] = [
  {
    accessorKey: "policyHolderId",
    header: "Policy Holder ID",
    cell: ({ row }) => <div>{row.getValue("policyHolderId")}</div>,
  },
  {
    accessorKey: "firstName",
    header: "First Name",
    cell: ({ row }) => <div>{row.getValue("firstName")}</div>,
  },
  {
    accessorKey: "lastName",
    header: "Last Name",
    cell: ({ row }) => <div>{row.getValue("lastName")}</div>,
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => <div>{row.getValue("email")}</div>,
  },
  {
    accessorKey: "policiesHeld",
    header: "Policies Held",
    cell: ({ row }) => {
      const policies = row.getValue("policiesHeld") as string[]
      const displayedPolicies = policies.slice(0, 3)
      const remainingCount = policies.length - displayedPolicies.length

      return (
        <div>
          {displayedPolicies.map((policy, index) => (
            <Badge key={index} className="mr-1">
              {policy}
            </Badge>
          ))}
          {remainingCount > 0 && <span>... ({remainingCount} more)</span>}
        </div>
      )
    },
  },
]

export function PolicyHoldersTable() {
  const [data, setData] = useState<PolicyHolder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = useState({})

  useEffect(() => {
    fetchPolicyHolders()
      .then((policyHolders) => {
        setData(policyHolders)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      rowSelection,
    },
    globalFilterFn: (row, _columnId, filterValue) => {
      // Check all columns for the filter value
      const {policyholderId, firstName, lastName, email, policiesHeld } = row.original;

      // Check if the filter value matches firstName, lastName, or email
      const matchesBasicFields = [policyholderId, firstName, lastName, email]
        .some((field) => field.toLowerCase().includes(filterValue.toLowerCase()));

      // Check if the filter value matches any policy in policiesHeld
      const matchesPolicies = policiesHeld.some((policy) =>
        policy.toLowerCase().includes(filterValue.toLowerCase())
      );

      // Return true if the filter value matches any of the fields or policies
      return matchesBasicFields || matchesPolicies;
    },
  })

  const handleFilterChange = (value: string) => {
    table.setGlobalFilter(value)
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter by name or policies held..."
          onChange={(event) => handleFilterChange(event.target.value)}
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <span>
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}