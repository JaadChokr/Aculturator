import { AnimatePresence, motion } from 'motion/react'
import { cn } from '@/shared/lib/utils'
import { spring } from '@/shared/motion'
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
      className="pointer-events-none fixed right-4 bottom-20 z-[60] flex w-[min(360px,calc(100vw-2rem))] flex-col gap-2 lg:bottom-4"
    >
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <motion.button
            key={t.id}
            layout
            initial={{ opacity: 0, x: 60, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 80, transition: { duration: 0.2 } }}
            transition={spring}
            onClick={() => dismiss(t.id)}
            className={cn(
              'pointer-events-auto flex items-center gap-3 rounded-xl border bg-card p-3 text-left shadow-lg',
              toneClass[t.tone],
            )}
          >
            {t.icon && (
              <motion.span
                className="text-2xl leading-none"
                initial={{ rotate: -30, scale: 0.4 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 12, delay: 0.08 }}
              >
                {t.icon}
              </motion.span>
            )}
            <span className="min-w-0">
              <span className="block text-sm font-bold">{t.title}</span>
              {t.description && (
                <span className="block text-xs text-muted-foreground">{t.description}</span>
              )}
            </span>
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  )
}
