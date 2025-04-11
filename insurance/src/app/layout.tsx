import React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider"
import { ModeToggle } from "@/components/ui/themetoggle";
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import SignInButton from "@/components/ui/signin-button";
import { SessionProvider } from "next-auth/react";
import {auth} from "@/auth";
import Link from "next/link";
import { Home } from "lucide-react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Insurance company dashboard",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider>
          <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              
          <div className="w-full grid flex-1 min-h-screen">
            {session ? (
              <DashboardNav />
            ) : 
            <Link href="/" className="fixed top-5 left-4 z-[1000] flex items-center justify-center h-16 w-16 rounded-md bg-background/70 backdrop-blur-md text-foreground">
              <Home className="h-8 w-8" />
            </Link>
            }
            <main className="flex w-full flex-1 flex-col overflow-hidden">
              
              {children}
            </main>
          </div>
          <div className="fixed top-5 right-4 z-[1000] flex">
            <ModeToggle className="h-8 w-8 mr-2 flex items-center justify-center rounded-md" />
            <SignInButton />
          </div>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
