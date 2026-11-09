import { Link, useSearchParams } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { useCatalog } from '@acculturator/core/catalog'
import { Button } from '@acculturator/design-system/ui'
import { cn } from '@acculturator/design-system/lib'
import { collabPath } from '../paths'

/** Module d'où l'on vient (paramètre `module=` dans l'adresse), s'il existe. */
export function useReturnModule() {
  const [params] = useSearchParams()
  const { modules } = useCatalog()
  const id = params.get('module')
  return id ? modules?.modules.find((m) => m.id === id) : undefined
}

/**
 * « Retour au module » : affiché quand on arrive sur une page depuis une étape de module
 * (paramètre `module=` dans l'adresse).
 */
export function ModuleReturnLink({ className }: { className?: string }) {
  const module = useReturnModule()
  if (!module) return null
  return (
    <Button variant="outline" size="sm" asChild className={cn('mb-4 max-w-full', className)}>
      <Link to={collabPath(`modules?module=${module.id}`)}>
        <ArrowLeft />
        <span className="truncate">Retour au module : {module.title}</span>
      </Link>
    </Button>
  )
}
