import { AlertTriangle } from 'lucide-react'
import { Button } from '../ui'

/** Écran de chargement plein écran (démarrage de l'application). */
export function FullPageLoader({ label = 'Chargement…' }: { label?: string }) {
  return (
    <div className="grid min-h-dvh place-items-center bg-background" aria-busy role="status">
      <div className="flex flex-col items-center gap-3 text-sm text-muted-foreground">
        <span className="size-8 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
        {label}
      </div>
    </div>
  )
}

/** Erreur de chargement avec possibilité de réessayer. */
export function LoadError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="grid min-h-dvh place-items-center bg-background p-6 text-center">
      <div className="max-w-sm">
        <AlertTriangle className="mx-auto mb-3 size-8 text-warning" />
        <p className="mb-4 font-semibold">{message}</p>
        {onRetry && <Button onClick={onRetry}>Réessayer</Button>}
      </div>
    </div>
  )
}
