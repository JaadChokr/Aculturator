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

/** Trois pastilles, remplies dans la teinte du niveau. */
export function DifficultyDots({ level, className }: { level: Difficulty; className?: string }) {
  return (
    <span aria-hidden className={cn('inline-flex items-center gap-1', className)}>
      {[1, 2, 3].map((i) => (
        <span
          key={i}
          className={cn(
            'size-2 rounded-full',
            i <= level ? DIFFICULTY_STYLE[level].dot : 'bg-muted-foreground/25',
          )}
        />
      ))}
    </span>
  )
}
