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
import { useSession, signOut } from "next-auth/react"; // Import signOut directly
import Link from "next/link";
// const { signOut } = require("next-auth/react"); // Remove require

// Basic Skeleton Placeholder
function AuthSkeleton() {
    return <div className="h-8 w-14 bg-gray-200 rounded-md animate-pulse"></div>;
}


export default function SignInButton() {
    const { data: session, status } = useSession(); // Get status

    // Loading state
    if (status === "loading") {
        return <AuthSkeleton />;
    }

    // Authenticated state
    if (status === "authenticated" && session) {
        // Determine the avatar source, fallback to default if no image
        const avatarSrc = session.user?.image || "/cat profile.png";
        const avatarAlt = session.user?.name ? `${session.user.name}'s Avatar` : "User Avatar";
        // Generate fallback initials from name or email, default to 'U'
        const fallbackText = session.user?.name?.substring(0, 2).toUpperCase() || session.user?.email?.substring(0, 2).toUpperCase() || 'U';

        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                     <Avatar className="h-8 w-8 cursor-pointer"> {/* Added cursor-pointer */}
                        <AvatarImage src={avatarSrc} alt={avatarAlt} />
                        <AvatarFallback>{fallbackText}</AvatarFallback>
                    </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end"> {/* Align dropdown */}
                    <DropdownMenuLabel>{session.user?.name || session.user?.email || "My Account"}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {/* Removed Link wrapper, added onSelect to DropdownMenuItem */}
                    <DropdownMenuItem onSelect={() => signOut()} className="cursor-pointer"> {/* Added cursor-pointer */}
                        Log Out
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        );
    }

    // Unauthenticated state
    // Use a Button component for better semantics if available, otherwise Link is fine
    // Assuming Button component exists at "@/components/ui/button"
    // If not, revert to Link or create/import a Button
    // For now, keeping the Link as Button wasn't explicitly imported/used before
    return (
         <Link href="/auth/login" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90"> {/* Using Button-like styling */}
            Login
        </Link>
    );
}