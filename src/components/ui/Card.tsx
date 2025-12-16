import React from "react"
import { cn } from "@/lib/utils"

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "outlined"
}

export function Card({ variant = "default", className, children, ...props }: CardProps) {
  const variantStyles = {
    default:
      "rounded-xl border border-slate-300 bg-white dark:border-slate-800 dark:bg-slate-950/80",
    elevated:
      "rounded-xl border border-slate-300 bg-white shadow-2xl shadow-black/20 dark:border-slate-800 dark:bg-slate-950/80 dark:shadow-black/60",
    outlined:
      "rounded-xl border border-slate-300 bg-white dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-xl dark:shadow-black/40 dark:ring-1 dark:ring-slate-800",
  }

  return (
    <div className={cn(variantStyles[variant], className)} {...props}>
      {children}
    </div>
  )
}

