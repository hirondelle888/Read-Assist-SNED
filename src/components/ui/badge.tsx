import * as React from "react"
import { cn } from "@/src/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning"
  children?: React.ReactNode
  className?: string
  key?: React.Key
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "border-transparent bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/70",
    secondary: "border-transparent bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700",
    destructive: "border-transparent bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/70",
    success: "border-transparent bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/70",
    warning: "border-transparent bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-400 hover:bg-yellow-200 dark:hover:bg-yellow-900/70",
    outline: "text-slate-950 dark:text-slate-50 border-slate-200 dark:border-slate-800",
  }
  
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2",
        variants[variant],
        className
      )}
      {...props}
    />
  )
}

export { Badge }
