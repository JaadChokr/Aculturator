import { AnimatePresence, motion } from 'motion/react'
import { AlertTriangle, Award, CheckCircle2, Info, Zap, type LucideIcon } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { spring } from '@/shared/motion'
import { useToastStore, type ToastTone } from './toast-store'

const TONE: Record<ToastTone, { icon: LucideIcon; className: string }> = {
  default: { icon: Info, className: 'bg-muted text-foreground' },
  xp: { icon: Zap, className: 'bg-primary/10 text-primary' },
  badge: { icon: Award, className: 'bg-primary text-primary-foreground' },
  success: { icon: CheckCircle2, className: 'bg-success/12 text-success' },
  warning: {
    icon: AlertTriangle,
    className: 'bg-warning/20 text-warning-foreground dark:text-warning',
  },
}

export function Toaster() {
  const { toasts, dismiss } = useToastStore()
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed right-4 bottom-20 z-[60] flex w-[min(360px,calc(100vw-2rem))] flex-col gap-2 lg:bottom-4"
    >
      <AnimatePresence initial={false}>
        {toasts.map((t) => {
          const tone = TONE[t.tone]
          const Icon = t.icon ?? tone.icon
          return (
            <motion.button
              key={t.id}
              layout
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 60, transition: { duration: 0.18 } }}
              transition={spring}
              onClick={() => dismiss(t.id)}
              className="pointer-events-auto flex items-center gap-3 rounded-lg border border-l-4 border-l-primary bg-card p-3 text-left shadow-lg"
            >
              <span
                className={cn('grid size-9 shrink-0 place-items-center rounded-md', tone.className)}
              >
                <Icon className="size-[18px]" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold">{t.title}</span>
                {t.description && (
                  <span className="block text-xs text-muted-foreground">{t.description}</span>
                )}
              </span>
            </motion.button>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
