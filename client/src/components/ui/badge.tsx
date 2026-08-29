import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-sm border px-2 py-0.5 text-xs font-mono font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-cyber/30 text-cyber bg-cyber/5",
        neon: "border-neon/30 text-neon bg-neon/5",
        matrix: "border-matrix/30 text-matrix bg-matrix/5",
        amber: "border-amber/30 text-amber bg-amber/5",
        muted: "border-void-400/50 text-gray-500 bg-void-300/50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
