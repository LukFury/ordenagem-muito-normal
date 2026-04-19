import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500',
  {
    variants: {
      variant: {
        default:
          'bg-purple-700 text-white hover:bg-purple-600 shadow-[0_0_12px_rgba(147,51,234,0.4)] hover:shadow-[0_0_20px_rgba(147,51,234,0.6)]',
        outline:
          'border border-purple-800 bg-transparent text-purple-300 hover:bg-purple-950 hover:text-purple-100',
        ghost:
          'text-purple-300 hover:bg-purple-950 hover:text-purple-100',
        destructive:
          'bg-red-900 text-red-100 hover:bg-red-800',
        secondary:
          'bg-zinc-800 text-zinc-200 hover:bg-zinc-700',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-7 px-3 text-xs',
        lg: 'h-11 px-8 text-base',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
