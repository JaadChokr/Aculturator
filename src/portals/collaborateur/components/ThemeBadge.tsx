import { getTheme, type ThemeId } from '@/shared/content'
import { cn } from '@/shared/lib/utils'

/** Étiquette de thématique : repère couleur discret + libellé, sur fond neutre. */
export function ThemeBadge({ themeId, className }: { themeId: ThemeId; className?: string }) {
  const t = getTheme(themeId)
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-sm border bg-card px-2 py-0.5 text-xs font-medium text-muted-foreground',
        className,
      )}
    >
      <span aria-hidden className={cn('size-1.5 rounded-full', t.dot)} />
      {t.short}
    </span>
  )
}

/** Pastille d'icône de thématique (fond neutre, icône graphite). */
export function ThemeIcon({ themeId, className }: { themeId: ThemeId; className?: string }) {
  const t = getTheme(themeId)
  return (
    <span
      aria-hidden
      className={cn(
        'relative grid size-10 shrink-0 place-items-center rounded-md bg-muted text-foreground',
        className,
      )}
    >
      <t.icon className="size-5" strokeWidth={1.75} />
      <span className={cn('absolute right-1 bottom-1 size-1.5 rounded-full', t.dot)} />
    </span>
  )
}
