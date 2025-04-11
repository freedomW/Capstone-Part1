import type React from "react"
import clsx from "clsx"

interface DashboardShellProps extends React.HTMLAttributes<HTMLDivElement> {}

export function DashboardShell({ children, className, ...props }: DashboardShellProps) {
  return (
    <div
      className={clsx(
        "flex justify-center items-center min-h-screen bg-secondary",
        className
      )}
      {...props}
    >
      <div
        className="w-full max-w-4xl p-6 shadow-lg rounded-lg border bg-card"
        style={{ boxShadow: `0 4px 6px var(--shadow-color)` }}
      >
        {children}
      </div>
    </div>
  )
}

