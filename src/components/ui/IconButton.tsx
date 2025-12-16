import React from "react"
import { cn } from "@/lib/utils"

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  "aria-label": string
  variant?: "default" | "ghost"
}

export function IconButton({
  variant = "default",
  className,
  children,
  ...props
}: IconButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md transition-all duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-0",
        "active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed",
        variant === "default" &&
          "border border-slate-300 bg-slate-100 px-2 py-1 text-xs text-slate-900 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:bg-slate-700/80",
        variant === "ghost" && "hover:bg-slate-200/80 dark:hover:bg-slate-800/80",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

