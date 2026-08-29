import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-none border border-void-400/50 bg-void-100/80 px-4 py-2 text-sm text-gray-100 font-mono",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-cyber",
          "placeholder:text-gray-600",
          "focus:outline-none focus:border-cyber/50 focus:ring-1 focus:ring-cyber/20",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "transition-all duration-300",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
