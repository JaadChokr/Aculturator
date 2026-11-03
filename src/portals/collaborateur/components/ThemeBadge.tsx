import { getTheme, type ThemeId } from '@/shared/content'
import { cn } from '@/shared/lib/utils'

export function ThemeBadge({ themeId, className }: { themeId: ThemeId; className?: string }) {
  const t = getTheme(themeId)
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold', t.tone.soft, className)}>
      <span aria-hidden>{t.emoji}</span>
      {t.short}
    </span>
  )
}
