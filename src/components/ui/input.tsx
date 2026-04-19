import * as React from 'react'
import { cn } from '@/lib/utils'

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <div className="relative group">
        <input
          type={type}
          className={cn(
            'w-full bg-surface-container-lowest border-none border-b-2 border-outline/30 text-on-surface placeholder:text-on-surface/20 font-mono tracking-widest py-4 px-0 text-sm transition-all focus:outline-none focus:ring-0 input-underline uppercase',
            className
          )}
          ref={ref}
          {...props}
        />
        <div className="absolute bottom-0 left-0 h-0.5 bg-secondary w-0 group-focus-within:w-full transition-all duration-500 blur-[2px]" />
      </div>
    )
  }
)
Input.displayName = 'Input'

export { Input }
