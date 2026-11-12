import { createElement } from 'react'
import type { LucideProps } from 'lucide-react'
import type { Theme, ThemeId } from '@acculturator/contracts'
import { useTheme } from '@acculturator/core/catalog'
import { themeDot, themeIcon } from '@acculturator/design-system/themes'
import { cn } from '@acculturator/design-system/lib'

/** Icône d'une thématique (clé `Theme.icon` résolue dans la palette du design system). */
export function ThemeGlyph({ theme, ...props }: { theme: Theme } & LucideProps) {
  // Icône issue d'une palette statique : rien n'est recréé d'un rendu à l'autre
  return createElement(themeIcon(theme.icon), props)
}

/** Étiquette de thématique : repère couleur discret + libellé, sur fond neutre. */
export function ThemeBadge({ themeId, className }: { themeId: ThemeId; className?: string }) {
  const t = useTheme(themeId)
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-sm border bg-card px-2 py-0.5 text-xs font-medium text-muted-foreground',
        className,
      )}
    >
      <span aria-hidden className={cn('size-1.5 rounded-full', themeDot(t.color))} />
      {t.short}
    </span>
  )
}

/** Pastille d'icône de thématique (fond neutre, icône graphite). */
export function ThemeIcon({ themeId, className }: { themeId: ThemeId; className?: string }) {
  const t = useTheme(themeId)
  return (
    <span
      aria-hidden
      className={cn(
        'relative grid size-10 shrink-0 place-items-center rounded-md bg-muted text-foreground',
        className,
      )}
    >
      <ThemeGlyph theme={t} className="size-5" strokeWidth={1.75} />
      <span className={cn('absolute right-1 bottom-1 size-1.5 rounded-full', themeDot(t.color))} />
    </span>
  )
}
