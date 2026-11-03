import { cn } from '@/shared/lib/utils'
import { useToastStore, type ToastTone } from './toast-store'

const toneClass: Record<ToastTone, string> = {
  default: 'border-border',
  xp: 'border-xp/40 bg-gradient-to-r from-xp/10 to-card',
  badge: 'border-accent/60 bg-gradient-to-r from-accent/20 to-card',
  success: 'border-success/40',
  warning: 'border-warning/50',
}

export function Toaster() {
  const { toasts, dismiss } = useToastStore()
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed right-4 bottom-4 z-[60] flex w-[min(360px,calc(100vw-2rem))] flex-col gap-2"
    >
      {toasts.map((t) => (
        <button
          key={t.id}
          onClick={() => dismiss(t.id)}
          className={cn(
            'pointer-events-auto flex animate-pop items-center gap-3 rounded-xl border bg-card p-3 text-left shadow-lg',
            toneClass[t.tone],
          )}
        >
          {t.icon && <span className="text-2xl leading-none">{t.icon}</span>}
          <span className="min-w-0">
            <span className="block text-sm font-bold">{t.title}</span>
            {t.description && <span className="block text-xs text-muted-foreground">{t.description}</span>}
          </span>
        </button>
      ))}
    </div>
  )
}
