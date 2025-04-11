"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import Link from "next/link"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ModeToggle({ className }: { className?: string }) {
  const { setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            buttonVariants({ variant: "ghost", size: "icon" }),
            "h-12 w-12 flex items-center justify-center rounded-md",
            className
          )}
          aria-label="Toggle theme"
        >
          <Sun className="h-[1.75rem] w-[1.75rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 navicon" />
          <Moon className="absolute h-[1.75rem] w-[1.75rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 navicon" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="right">
        <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
