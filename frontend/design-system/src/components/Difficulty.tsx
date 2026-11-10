import type { ReactNode } from 'react'
import { Check } from 'lucide-react'
import type { Difficulty } from '@acculturator/contracts'
import { cn } from '../lib'

/**
 * Teintes des niveaux de difficulté : du rouge clair (découverte) au bordeaux (expert).
 * Les couleurs sont les jetons --level-1/2/3 (styles/index.css) ; noms de classes écrits en
 * entier pour que Tailwind les génère.
 */
export const DIFFICULTY_STYLE: Record<
  Difficulty,
  { solid: string; dot: string; border: string; tint: string; bar: string }
> = {
  1: {
    solid: 'bg-level-1 text-level-1-foreground',
    dot: 'bg-level-1',
    border: 'border-level-1',
    tint: 'bg-level-1/10',
    bar: 'bg-level-1',
  },
  2: {
    solid: 'bg-level-2 text-level-2-foreground',
    dot: 'bg-level-2',
    border: 'border-level-2',
    tint: 'bg-level-2/10',
    bar: 'bg-level-2',
  },
  3: {
    solid: 'bg-level-3 text-level-3-foreground',
    dot: 'bg-level-3',
    border: 'border-level-3',
    tint: 'bg-level-3/10',
    bar: 'bg-level-3',
  },
}

/** Bande « tous niveaux » : dégradé du plus facile au plus difficile. */
export const ALL_LEVELS_BAND = 'bg-gradient-to-b from-level-1 via-level-2 to-level-3'

/** Trois pastilles, remplies dans la teinte du niveau (`inverted` : sur un fond bordeaux plein). */
export function DifficultyDots({
  level,
  inverted = false,
  className,
}: {
  level: Difficulty
  inverted?: boolean
  className?: string
}) {
  return (
    <span aria-hidden className={cn('inline-flex items-center gap-1', className)}>
      {[1, 2, 3].map((i) => (
        <span
          key={i}
          className={cn(
            'size-2 rounded-full',
            inverted
              ? i <= level
                ? 'bg-level-3-foreground'
                : 'bg-level-3-foreground/30'
              : i <= level
                ? DIFFICULTY_STYLE[level].dot
                : 'bg-muted-foreground/25',
          )}
        />
      ))}
    </span>
  )
}

/**
 * Marches du sélecteur : plus le niveau est difficile, plus la carte est haute et foncée
 * (du rouge clair au bordeaux plein). Sur mobile, les cartes s'empilent et seule l'intensité varie.
 */
const STEP: Record<
  Difficulty,
  { card: string; ring: string; height: string; muted: string; inverted: boolean }
> = {
  1: {
    card: 'border-level-1/60 bg-level-1/10 text-foreground',
    ring: 'ring-level-1',
    height: 'sm:min-h-36',
    muted: 'text-muted-foreground',
    inverted: false,
  },
  2: {
    card: 'border-level-2/70 bg-level-2/25 text-foreground',
    ring: 'ring-level-2',
    height: 'sm:min-h-44',
    muted: 'text-foreground/70',
    inverted: false,
  },
  3: {
    card: 'border-level-3 bg-level-3 text-level-3-foreground',
    ring: 'ring-level-3',
    height: 'sm:min-h-52',
    muted: 'text-level-3-foreground/80',
    inverted: true,
  },
}

export interface DifficultyOption {
  /** null : tous niveaux */
  value: Difficulty | null
  label: string
  description?: ReactNode
  /** Ex. « 12 questions » */
  meta?: ReactNode
}

/**
 * Choix du niveau de difficulté, présenté comme un escalier : « tous niveaux » à part, puis
 * trois marches de plus en plus hautes et foncées, au-dessus d'un axe de difficulté croissante.
 */
export function DifficultyPicker({
  options,
  value,
  onChange,
  onConfirm,
  recommended,
  recommendedLabel = 'Conseillé',
  label = 'Niveau de difficulté',
  scale = ['Plus accessible', 'Plus exigeant'],
}: {
  options: DifficultyOption[]
  value: Difficulty | null
  onChange: (value: Difficulty | null) => void
  /** Double-clic : choisir et valider */
  onConfirm?: () => void
  /** Niveau conseillé (étiquette sur sa carte) */
  recommended?: Difficulty | null
  recommendedLabel?: string
  label?: string
  /** Libellés des deux extrémités de l'axe */
  scale?: [string, string]
}) {
  const all = options.find((o) => o.value === null)
  const tag = (inverted: boolean) => (
    <span
      className={cn(
        'rounded-sm px-1.5 py-0.5 text-[11px] font-semibold',
        inverted
          ? 'bg-level-3-foreground/20 text-level-3-foreground'
          : 'bg-primary/10 text-primary',
      )}
    >
      {recommendedLabel}
    </span>
  )
  const levels = options.filter(
    (o): o is DifficultyOption & { value: Difficulty } => o.value !== null,
  )

  return (
    <div role="radiogroup" aria-label={label} className="flex flex-col gap-3">
      {all && (
        <button
          type="button"
          role="radio"
          aria-checked={value === null}
          onClick={() => onChange(null)}
          onDoubleClick={onConfirm}
          className={cn(
            'relative flex items-center gap-4 overflow-hidden rounded-lg border-2 py-3 pr-4 pl-6 text-left transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none',
            value === null ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/40',
          )}
        >
          <span aria-hidden className={cn('absolute inset-y-0 left-0 w-2', ALL_LEVELS_BAND)} />
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-2 font-semibold">
              {all.label}
              {recommended === null && tag(false)}
            </span>
            {all.description && (
              <span className="block text-sm text-muted-foreground">{all.description}</span>
            )}
          </span>
          {all.meta && (
            <span className="shrink-0 text-xs text-muted-foreground tabular-nums">{all.meta}</span>
          )}
          {value === null && <Check aria-hidden className="size-5 shrink-0 text-primary" />}
        </button>
      )}

      <div className="grid gap-3 sm:grid-cols-3 sm:items-end">
        {levels.map((o) => {
          const step = STEP[o.value]
          const selected = value === o.value
          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(o.value)}
              onDoubleClick={onConfirm}
              className={cn(
                'relative flex flex-col justify-between gap-3 rounded-lg border-2 p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none',
                step.card,
                step.height,
                selected
                  ? cn('shadow-md ring-4 ring-offset-2 ring-offset-card', step.ring)
                  : 'focus-visible:ring-[3px] focus-visible:ring-ring/50',
              )}
            >
              <span className="flex flex-col gap-1">
                <span className="flex items-start justify-between gap-2">
                  <span className="text-base font-bold sm:text-lg">{o.label}</span>
                  {selected && <Check aria-hidden className="size-5 shrink-0" />}
                </span>
                <DifficultyDots level={o.value} inverted={step.inverted} />
                {o.description && (
                  <span className={cn('text-sm', step.muted)}>{o.description}</span>
                )}
              </span>
              <span className="flex flex-wrap items-center justify-between gap-2">
                {o.meta && <span className={cn('text-xs tabular-nums', step.muted)}>{o.meta}</span>}
                {recommended === o.value && tag(step.inverted)}
              </span>
            </button>
          )
        })}
      </div>

      {/* Axe : la difficulté augmente de gauche à droite (de haut en bas sur mobile) */}
      <div
        aria-hidden
        className="flex items-center gap-2 text-xs font-medium text-muted-foreground"
      >
        <span>{scale[0]}</span>
        <span className="h-1.5 flex-1 rounded-full bg-gradient-to-r from-level-1 via-level-2 to-level-3" />
        <span>{scale[1]}</span>
      </div>
    </div>
  )
}
