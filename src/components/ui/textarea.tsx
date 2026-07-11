import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded-[var(--radius-input)] border border-[var(--line)] bg-transparent px-3 py-2 text-base text-[var(--text)] shadow-xs transition-[color,box-shadow] outline-none placeholder:text-[var(--text-muted)] focus-visible:border-[var(--accent)] focus-visible:ring-[3px] focus-visible:ring-[color-mix(in_srgb,var(--accent)_35%,transparent)] disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-red-500 aria-invalid:ring-red-500/20 md:text-sm dark:bg-[var(--surface-soft)]",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
