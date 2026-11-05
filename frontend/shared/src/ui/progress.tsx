import * as React from 'react'
import * as ProgressPrimitive from '@radix-ui/react-progress'
import { motion } from 'motion/react'
import { cn } from '../lib'

function Progress({
  className,
  value = 0,
  indicatorClassName,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root> & { indicatorClassName?: string }) {
  const v = Math.max(0, Math.min(100, value ?? 0))
  return (
    <ProgressPrimitive.Root
      className={cn('relative h-2 w-full overflow-hidden rounded-full bg-muted', className)}
      value={v}
      {...props}
    >
      <ProgressPrimitive.Indicator asChild>
        <motion.div
          className={cn('h-full w-full flex-1 rounded-full bg-primary', indicatorClassName)}
          initial={{ x: '-100%' }}
          animate={{ x: `-${100 - v}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 22 }}
        />
      </ProgressPrimitive.Indicator>
    </ProgressPrimitive.Root>
  )
}

export { Progress }
