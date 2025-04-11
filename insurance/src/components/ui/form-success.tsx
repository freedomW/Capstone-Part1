import { CheckCircle } from "lucide-react";

interface FormSucessProps {
    message: string|undefined;
    className?: string;
};

export function FormSucess({ message, className }: FormSucessProps) {
    if (!message) return null; // Don't render if there's no message
    return (
        <div className={`bg-success/15 rounded-md flex p-3 items-center gap-x-2 text-success ${className}`}>
            <CheckCircle className="mr-2" size={16} />
            <span>{message}</span>
        </div>
    );
}