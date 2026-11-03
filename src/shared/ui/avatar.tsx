import { cn } from '@/shared/lib/utils'

export function Avatar({ name, className }: { name: string; className?: string }) {
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
  return (
    <span
      aria-hidden
      className={cn(
        'inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary',
        className,
      )}
    >
      {initials}
    </span>
  )
}
