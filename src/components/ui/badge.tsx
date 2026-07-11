import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-[var(--radius-input)] border border-transparent bg-[var(--surface-soft)] px-2 py-0.5 text-xs font-medium whitespace-nowrap text-[var(--text-muted)] transition-[color,box-shadow] focus-visible:border-[var(--accent)] focus-visible:ring-[3px] focus-visible:ring-[color-mix(in_srgb,var(--accent)_35%,transparent)] aria-invalid:border-red-500 aria-invalid:ring-red-500/20 [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        default: "[a&]:hover:brightness-95",
        secondary:
          "border-[var(--line)] [a&]:hover:brightness-95",
        destructive:
          "bg-destructive text-white focus-visible:ring-destructive/20 dark:bg-destructive/60 dark:focus-visible:ring-destructive/40 [a&]:hover:bg-destructive/90",
        outline:
          "border-[var(--line)] bg-transparent text-[var(--text-muted)] [a&]:hover:bg-[var(--surface-soft)]",
        ghost: "bg-transparent [a&]:hover:bg-[var(--surface-soft)]",
        link: "bg-transparent text-[var(--accent)] underline-offset-4 [a&]:hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
