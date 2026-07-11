import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-9 w-full min-w-0 rounded-[var(--radius-input)] border border-[var(--line)] bg-transparent px-3 py-1 text-base text-[var(--text)] shadow-xs transition-[color,box-shadow] outline-none selection:bg-[var(--accent)] selection:text-[var(--accent-ink)] file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-[var(--text)] placeholder:text-[var(--text-muted)] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-[var(--surface-soft)]",
        "focus-visible:border-[var(--accent)] focus-visible:ring-[3px] focus-visible:ring-[color-mix(in_srgb,var(--accent)_35%,transparent)]",
        "aria-invalid:border-red-500 aria-invalid:ring-red-500/20",
        className
      )}
      {...props}
    />
  )
}

export { Input }
