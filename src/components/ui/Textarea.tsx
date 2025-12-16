"use client"

import React, { useId } from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  helperText?: string
  error?: string
}

export function Textarea({ label, helperText, error, className, id, ...props }: TextareaProps) {
  const generatedId = useId()
  const textareaId = id || generatedId

  return (
    <div className="space-y-1">
      {label && (
        <label
          htmlFor={textareaId}
          className="block text-xs font-medium uppercase tracking-wide text-slate-600 dark:text-slate-300"
        >
          {label}
        </label>
      )}
      {helperText && (
        <p className="text-xs text-slate-500 dark:text-slate-500">{helperText}</p>
      )}
      <textarea
        id={textareaId}
        className={cn(
          "min-h-[220px] w-full rounded-md border px-3 py-2 font-mono text-sm",
          "bg-white text-slate-900 placeholder:text-slate-500",
          "outline-none transition-shadow resize-y",
          "border-slate-300 focus:border-sky-600 focus:ring-1 focus:ring-sky-600",
          "dark:border-slate-700 dark:bg-slate-950/80 dark:text-slate-100 dark:placeholder:text-slate-500",
          error && "border-red-500 focus:border-red-500 focus:ring-red-500",
          className
        )}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? `${textareaId}-error` : helperText ? `${textareaId}-helper` : undefined}
        {...props}
      />
      {error && (
        <p id={`${textareaId}-error`} className="text-xs text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

