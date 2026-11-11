import type { ReactNode } from 'react'
import { cn } from '../lib'

/**
 * Carte à sélectionner dans une liste de choix (role="radio", à placer dans un
 * conteneur role="radiogroup"). Une bande de couleur à gauche peut en marquer l'intensité.
 */
export function ChoiceCard({
  selected,
  onSelect,
  onConfirm,
  title,
  badge,
  description,
  meta,
  band,
  selectedClassName = 'border-primary bg-primary/5',
}: {
  selected: boolean
  onSelect: () => void
  /** Double-clic : choisir et valider */
  onConfirm?: () => void
  title: ReactNode
  /** Étiquette en haut à droite (ex. « Conseillé ») */
  badge?: ReactNode
  description?: ReactNode
  meta?: ReactNode
  /** Classe de fond de la bande de gauche (ex. `bg-level-2`) */
  band?: string
  /** Bordure et fond une fois sélectionnée */
  selectedClassName?: string
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      onDoubleClick={onConfirm}
      className={cn(
        'relative flex flex-col gap-1 overflow-hidden rounded-lg border-2 p-4 text-left transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none',
        band && 'pl-6',
        selected ? selectedClassName : 'border-border hover:bg-muted/40',
      )}
    >
      {band && <span aria-hidden className={cn('absolute inset-y-0 left-0 w-2', band)} />}
      <span className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-2 font-semibold">{title}</span>
        {badge}
      </span>
      {description && <span className="text-sm text-muted-foreground">{description}</span>}
      {meta && <span className="text-xs text-muted-foreground tabular-nums">{meta}</span>}
    </button>
  )
}

/** Groupe de `ChoiceCard` (choix exclusif), en grille. */
export function ChoiceGroup({
  label,
  className,
  children,
}: {
  /** Nom du groupe pour les lecteurs d'écran */
  label: string
  className?: string
  children: ReactNode
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn('grid gap-3 sm:grid-cols-2', className)}
    >
      {children}
    </div>
  )
}
