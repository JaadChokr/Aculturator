import { useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@acculturator/shared/ui'
import { useProgress } from '../store/progress'

export interface TutorialStep {
  icon: LucideIcon
  title: string
  text: string
  /** Raccourcis clavier associés (masqués sur mobile) */
  keys?: string[]
}

/**
 * Didacticiel affiché automatiquement la première fois qu'un utilisateur ouvre
 * une rubrique, puis à la demande (bouton « ? »). L'état « vu » est mémorisé.
 */
export function useTutorial(id: string) {
  const seen = useProgress((s) => s.seenTips.includes(id))
  const markTipSeen = useProgress((s) => s.markTipSeen)
  const [open, setOpen] = useState(!seen)
  return {
    open,
    show: () => setOpen(true),
    close: () => {
      setOpen(false)
      markTipSeen(id)
    },
  }
}

export function TutorialDialog({
  open,
  onClose,
  title,
  description,
  steps,
  cta = 'C’est parti',
}: {
  open: boolean
  onClose: () => void
  title: string
  description: string
  steps: TutorialStep[]
  cta?: string
}) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <ol className="flex flex-col gap-3">
          {steps.map((step, i) => (
            <li key={step.title} className="flex gap-3 rounded-md border p-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
                <step.icon className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold">
                  {i + 1}. {step.title}
                </div>
                <p className="text-sm text-muted-foreground">{step.text}</p>
                {step.keys && (
                  <p className="mt-1.5 hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex">
                    Au clavier :
                    {step.keys.map((k) => (
                      <kbd
                        key={k}
                        className="rounded border bg-muted px-1.5 py-0.5 font-mono text-[11px] text-foreground"
                      >
                        {k}
                      </kbd>
                    ))}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ol>
        <div className="flex justify-end">
          <Button onClick={onClose}>{cta}</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
