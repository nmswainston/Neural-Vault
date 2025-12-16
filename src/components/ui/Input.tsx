"use client"

import React, { useId } from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  helperText?: string
  error?: string
}

export function Input({ label, helperText, error, className, id, ...props }: InputProps) {
  const generatedId = useId()
  const inputId = id || generatedId

  return (
    <div className="space-y-1">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-medium uppercase tracking-wide text-slate-600 dark:text-slate-300"
        >
          {label}
        </label>
      )}
      {helperText && (
        <p className="text-xs text-slate-500 dark:text-slate-500">{helperText}</p>
      )}
      <input
        id={inputId}
        className={cn(
          "w-full rounded-md border px-3 py-2 text-sm",
          "bg-white text-slate-900 placeholder:text-slate-500",
          "outline-none transition-shadow",
          "border-slate-300 focus-visible:border-sky-600 focus-visible:ring-1 focus-visible:ring-sky-600",
          "dark:border-slate-700 dark:bg-slate-950/80 dark:text-slate-100 dark:placeholder:text-slate-500",
          error && "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500",
          className
        )}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} className="text-xs text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

