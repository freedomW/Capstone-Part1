import { TriangleAlert } from "lucide-react";

interface FormErrorProps {
    message: string|undefined;
    className?: string;
};

export function FormError({ message, className }: FormErrorProps) {
    if (!message) return null; // Don't render if there's no message
    return (
        <div className={`bg-destructive/15 rounded-md flex p-3 items-center gap-x-2 text-destructive ${className}`}>
            <TriangleAlert className="mr-2" size={16} />
            <span>{message}</span>
        </div>
    );
}