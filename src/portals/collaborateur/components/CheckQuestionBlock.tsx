import { useState } from 'react'
import { CheckCircle2, XCircle } from 'lucide-react'
import type { CheckQuestion } from '@/shared/content'
import { cn } from '@/shared/lib/utils'

/** Question de vérification avec retour immédiat et expliqué (pilier « retour d'information »). */
export function CheckQuestionBlock({ check, onAnswered }: { check: CheckQuestion; onAnswered?: (correct: boolean) => void }) {
  const [picked, setPicked] = useState<number | null>(null)
  const answered = picked !== null
  const correct = picked === check.answer

  return (
    <div className="rounded-xl border bg-muted/40 p-4">
      <div className="mb-1 text-xs font-bold tracking-wider text-primary uppercase">Check express</div>
      <p className="mb-3 font-semibold">{check.question}</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {check.options.map((opt, i) => {
          const isAnswer = i === check.answer
          const isPicked = i === picked
          return (
            <button
              key={opt}
              disabled={answered}
              onClick={() => {
                setPicked(i)
                onAnswered?.(i === check.answer)
              }}
              className={cn(
                'rounded-lg border bg-card px-3 py-2.5 text-left text-sm font-medium transition-all hover:border-primary/50 disabled:cursor-default',
                answered && isAnswer && 'border-success bg-success/10 text-foreground',
                answered && isPicked && !isAnswer && 'animate-shake border-destructive bg-destructive/10',
                answered && !isAnswer && !isPicked && 'opacity-60',
              )}
            >
              {opt}
            </button>
          )
        })}
      </div>
      {answered && (
        <div
          className={cn(
            'mt-3 flex animate-pop gap-2 rounded-lg p-3 text-sm',
            correct ? 'bg-success/10 text-foreground' : 'bg-destructive/10 text-foreground',
          )}
          role="status"
        >
          {correct ? <CheckCircle2 className="size-5 shrink-0 text-success" /> : <XCircle className="size-5 shrink-0 text-destructive" />}
          <p>
            <span className="font-bold">{correct ? 'Exact ! ' : 'Pas tout à fait. '}</span>
            {check.explanation}
          </p>
        </div>
      )}
    </div>
  )
}
