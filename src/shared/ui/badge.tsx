import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/shared/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap [&_svg]:size-3',
  {
    variants: {
      variant: {
        default: 'bg-primary/12 text-primary',
        accent: 'bg-accent/25 text-accent-foreground dark:text-accent',
        secondary: 'bg-secondary text-secondary-foreground',
        success: 'bg-success/15 text-success',
        warning: 'bg-warning/20 text-warning-foreground dark:text-warning',
        destructive: 'bg-destructive/12 text-destructive',
        xp: 'bg-xp/12 text-xp',
        outline: 'border text-foreground',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
