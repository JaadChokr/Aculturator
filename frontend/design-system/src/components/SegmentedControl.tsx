import type { ReactNode } from 'react'
import { cn } from '../lib'

export interface SegmentedOption<T extends string> {
  value: T
  label: ReactNode
  /** Nombre affiché à côté du libellé (ex. éléments filtrés) */
  count?: number
}

/** Choix exclusif dans une barre segmentée (filtres, apparence…). */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
  fullWidth = false,
  size = 'md',
  className,
}: {
  options: SegmentedOption<T>[]
  value: T
  onChange: (value: T) => void
  /** Nom du groupe pour les lecteurs d'écran */
  label: string
  /** Segments de largeur égale sur toute la largeur disponible */
  fullWidth?: boolean
  size?: 'sm' | 'md'
  className?: string
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn(
        'gap-1 rounded-md bg-muted p-1',
        fullWidth ? 'grid auto-cols-fr grid-flow-col' : 'inline-flex',
        className,
      )}
    >
      {options.map((o) => {
        const active = o.value === value
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={cn(
              'flex items-center justify-center gap-1.5 rounded-sm font-medium transition-colors [&_svg]:size-3.5',
              size === 'sm' ? 'px-2 py-1.5 text-xs' : 'px-3 py-1.5 text-sm',
              active
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {o.label}
            {o.count !== undefined && (
              <span className="text-xs text-muted-foreground tabular-nums">{o.count}</span>
            )}
          </button>
        )
      })}
    </div>
  )
}
