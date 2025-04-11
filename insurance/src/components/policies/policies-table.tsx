"use client"

import { useState, useEffect, useMemo } from "react"
import {useDebounce} from "use-debounce"; // prevent filtering on every keystroke
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type InsurancePolicy = {
  insurancepolicyid: string
  name: string
  typeOfPolicy: string
  basePriceSgd: string
}

export const columns: ColumnDef<InsurancePolicy>[] = [
    {
        accessorKey: "insurancePolicyId",
        header: "Insurance Policy ID",
        cell: ({ row }) => <div>{row.getValue("insurancePolicyId")}</div>,
    },
    {
        accessorKey: "name",
        header: "Policy Name",
        cell: ({ row }) => <div>{row.getValue("name")}</div>,
    },
    {
        accessorKey: "typeOfPolicy",
        header: "Policy Type",
        cell: ({ row }) => <div>{row.getValue("typeOfPolicy")}</div>,
    },
    {
        accessorKey: "basePriceSgd",
        header: "Base Price (SGD)",
        cell: ({ row }) => <div>{row.getValue("basePriceSgd")}</div>,
    },
]

export function PoliciesTable() {
  const [data, setData] = useState<InsurancePolicy[]>([]);
  const [filterValue, setFilterValue] = useState("");
  const [debouncedFilterValue] = useDebounce(filterValue, 300); // Debounce filter input

  useEffect(() => {
    
    async function fetchData() {
      const response = await fetch("/api/policies");
      const data = await response.json();
      setData(data);
    }

    fetchData();
  }, []);

  const filteredData = useMemo(() => {
    return data.filter((policy) =>
      Object.values(policy).some((value) =>
        value.toString().toLowerCase().includes(debouncedFilterValue.toLowerCase())
      )
    );
  }, [data, debouncedFilterValue]);

  useEffect(() => {
    console.log("Total data size:", data.length);
    console.log("Filtered data size:", filteredData.length);
  }, [data, filteredData]);

  useEffect(() => {
    console.log("Rendering PoliciesTable...");
    console.log("Filter value:", filterValue);
    console.log("Filtered data size:", filteredData.length);
  }, [filterValue, filteredData]);

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = useState({})

  const table = useReactTable({
    data: filteredData, // pass full filtered data to the table
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
  })

  const dropdownContent = useMemo(() => {
    return table
      .getAllColumns()
      .filter((column) => column.getCanHide())
      .map((column) => (
        <DropdownMenuCheckboxItem
          key={column.id}
          className="capitalize"
          checked={column.getIsVisible()}
          onCheckedChange={(value) => column.toggleVisibility(!!value)}
        >
          {column.id}
        </DropdownMenuCheckboxItem>
      ));
  }, [table]);

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter by policy name..."
          value={filterValue}
          onChange={(event) => setFilterValue(event.target.value)} // Update the filter value
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">{dropdownContent}</DropdownMenuContent>
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
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
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

