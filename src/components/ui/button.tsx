import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-body font-bold tracking-widest uppercase transition-all disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none cursor-crosshair',
  {
    variants: {
      variant: {
        default:
          'bg-primary-container text-on-primary-container hover:bg-on-primary-fixed-variant active:-translate-y-px',
        secondary:
          'bg-transparent border border-outline-variant/20 text-secondary hover:border-secondary/40 hover:text-secondary',
        ghost:
          'text-on-surface/60 hover:text-on-surface hover:bg-surface-container-high',
        destructive:
          'bg-error-container text-on-error-container hover:brightness-110',
        outline:
          'border border-outline-variant/30 text-on-surface hover:bg-on-surface hover:text-background',
      },
      size: {
        default: 'h-10 px-6 py-2 text-[10px]',
        sm: 'h-8 px-4 text-[9px]',
        lg: 'h-12 px-8 text-xs',
        icon: 'h-10 w-10',
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
