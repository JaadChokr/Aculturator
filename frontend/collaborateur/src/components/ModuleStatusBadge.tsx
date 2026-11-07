import { Check, Lock } from 'lucide-react'
import { Badge } from '@acculturator/design-system/ui'
import type { ModuleStatus } from '../store/modules'

const STATUS: Record<
  ModuleStatus,
  { label: string; variant: 'success' | 'default' | 'outline' | 'accent' }
> = {
  done: { label: 'Terminé', variant: 'success' },
  'in-progress': { label: 'En cours', variant: 'default' },
  todo: { label: 'À faire', variant: 'outline' },
  locked: { label: 'Verrouillé', variant: 'accent' },
}

export function ModuleStatusBadge({ status }: { status: ModuleStatus }) {
  const s = STATUS[status]
  return (
    <Badge variant={s.variant} className="shrink-0">
      {status === 'done' && <Check className="size-3" />}
      {status === 'locked' && <Lock className="size-3" />}
      {s.label}
    </Badge>
  )
}
