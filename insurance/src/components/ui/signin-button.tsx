"use client";

import { 
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuItem, 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "./avatar";
import { useSession } from "next-auth/react";
import Link from "next/link";
const { signOut } = require("next-auth/react");

export default function SignInButton() {
    const { data: session } = useSession();
    if (session) {
        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    {session.user?.image ? (
                        <Avatar className="h-8 w-8 flex items-center justify-center">
                            <AvatarImage src={session.user.image} alt="Insurance Logo" />
                            <AvatarFallback>CI</AvatarFallback>
                        </Avatar>
                    ) : (
                        <Avatar className="h-8 w-8 flex items-center justify-center">
                            <AvatarImage src="/cat profile.png" alt="Insurance Logo" />
                            <AvatarFallback>CI</AvatarFallback>
                        </Avatar>
                    )}
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <Link href="#" onClick={(e) => {
                            e.preventDefault();
                            signOut();
                        }}>
                    <DropdownMenuItem>
                        Log Out
                    </DropdownMenuItem>
                    </Link>
                </DropdownMenuContent>
            </DropdownMenu>
        )
    }
    else{
        return (
            <Link href="/login" className="h-8 w-8 flex items-center justify-center rounded-md">
                <span>Login</span>
            </Link>
        )
    }
}