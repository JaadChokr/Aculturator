import { Brain, Eye, MessageSquareReply, Repeat } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui'
import { cn } from '@/shared/lib/utils'

export type Pillar = 'attention' | 'engagement' | 'feedback' | 'consolidation'

export const PILLAR_META: Record<Pillar, { label: string; icon: typeof Eye; hint: string }> = {
  attention: { label: 'Attention', icon: Eye, hint: 'Formats courts, un message clé à la fois.' },
  engagement: { label: 'Engagement actif', icon: Brain, hint: 'Vous agissez : répondre, chercher, questionner.' },
  feedback: { label: 'Retour d’information', icon: MessageSquareReply, hint: 'Correction immédiate et expliquée.' },
  consolidation: { label: 'Consolidation', icon: Repeat, hint: 'Répétition espacée pour ancrer durablement.' },
}

/** Indique quel(s) pilier(s) de l'apprentissage une activité mobilise. */
export function PillarTags({ pillars, className }: { pillars: Pillar[]; className?: string }) {
  return (
    <div className={cn('flex flex-wrap gap-1.5', className)}>
      {pillars.map((p) => {
        const m = PILLAR_META[p]
        return (
          <Tooltip key={p}>
            <TooltipTrigger asChild>
              <span className="inline-flex items-center gap-1 rounded-full border border-dashed px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                <m.icon className="size-3" />
                {m.label}
              </span>
            </TooltipTrigger>
            <TooltipContent>{m.hint}</TooltipContent>
          </Tooltip>
        )
      })}
    </div>
  )
}
