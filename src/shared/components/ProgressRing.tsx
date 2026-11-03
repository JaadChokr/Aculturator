import { cn } from '@/shared/lib/utils'

export function ProgressRing({
  value,
  size = 64,
  stroke = 7,
  className,
  trackClassName = 'stroke-muted',
  indicatorClassName = 'stroke-primary',
  children,
  label,
}: {
  value: number
  size?: number
  stroke?: number
  className?: string
  trackClassName?: string
  indicatorClassName?: string
  children?: React.ReactNode
  label?: string
}) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const v = Math.max(0, Math.min(100, value))
  return (
    <div
      className={cn('relative inline-grid shrink-0 place-items-center', className)}
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuenow={Math.round(v)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className={trackClassName} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (v / 100) * c}
          className={cn('transition-[stroke-dashoffset] duration-700', indicatorClassName)}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  )
}
