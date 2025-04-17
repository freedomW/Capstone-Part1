"use client"

import React, { useState } from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { BarChart3, FileText, Home, LifeBuoy, Settings, Users, Menu } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerOverlay, DrawerTrigger } from "@/components/ui/drawer"

interface NavProps extends React.HTMLAttributes<HTMLElement> {
  items?: {
    href: string
    title: string
    icon: React.ReactNode
  }[]
}

export function DashboardNav({ className, items, ...props }: NavProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  
  // Base navigation items available to all authenticated users
  const baseItems = [
    {
      href: "/overview",
      title: "Overview",
      icon: <Home />,
    },
    {
      href: "/policies",
      title: "Policies",
      icon: <FileText />,
    },
    {
      href: "/policyholders",
      title: "Policy Holders",
      icon: <Users />,
    },
  ];
  
  // Administration link - only visible to users with SUPERVISOR role
  const adminItem = {
    href: "/administration",
    title: "Administration",
    icon: <Settings />,
  };
    // Add the admin item only if the user has SUPERVISOR or ADMIN role
  const defaultItems = (session?.user?.role === 'SUPERVISOR' || session?.user?.role === 'ADMIN')
    ? [...baseItems, adminItem]
    : baseItems;

  const navItems = items || defaultItems;

  return (
    <div>
      <div className="lg:hidden">
        <Drawer open={isOpen} onOpenChange={setIsOpen} direction="left">
          <DrawerTrigger asChild>
            <button
              className="fixed top-4 left-4 p-2 rounded-md bg-background/70 backdrop-blur-md text-foreground z-[1000]"
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6 text-foreground" />
            </button>
          </DrawerTrigger>
          <DrawerOverlay className="fixed inset-0 bg-overlay/50 z-[999] transition-opacity" />
          <DrawerContent
            className="fixed top-0 left-0 h-full bg-background shadow-lg z-[1000] flex flex-col space-y-4 p-4 overflow-y-auto"
          >
            <DrawerHeader>
              <DrawerTitle></DrawerTitle>
              <DrawerDescription />
            </DrawerHeader>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  pathname === item.href ? "bg-muted hover:bg-muted" : "hover:bg-muted/50",
                  "flex items-center space-x-4 p-4 rounded-md text-foreground text-lg font-medium"
                )}
              >
                {React.cloneElement(item.icon as React.ReactElement<{ className?: string }>, {
                  className: "h-6 w-6 text-foreground",
                })}
                <span>{item.title}</span>
              </Link>
            ))}
            <DrawerFooter className="flex-grow" />
          </DrawerContent>
        </Drawer>
      </div>
      {/* Sidebar for larger screens */}
      <div className="hidden lg:flex">
        <TooltipProvider>
          <nav
            className="fixed top-0 left-0 h-full w-22 bg-background shadow-md flex flex-col items-center justify-center"
            {...props}
          >
            {navItems.map((item) => (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      pathname === item.href ? "bg-muted hover:bg-muted" : "hover:bg-muted/50",
                      "flex items-center space-x-4 p-4 rounded-md text-foreground text-lg font-medium"
                    )}
                  >
                    {React.cloneElement(item.icon as React.ReactElement<{ className?: string }>, {
                      className: "h-6 w-6 text-foreground",
                    })}
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">{item.title}</TooltipContent>
              </Tooltip>
            ))}
          </nav>
        </TooltipProvider>
      </div>
    </div>
  );
}

