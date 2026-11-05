import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { ShieldAlert } from 'lucide-react'
import type { Role } from '@acculturator/contracts'
import { Button } from '@acculturator/design-system/ui'
import { useAuth } from '@acculturator/core/auth'

export function RequireRole({ roles, children }: { roles: Role[]; children: ReactNode }) {
  const { user } = useAuth()
  if (roles.includes(user.role)) return <>{children}</>
  return (
    <div className="grid min-h-dvh place-items-center bg-background p-6">
      <div className="max-w-md text-center">
        <ShieldAlert className="mx-auto mb-4 size-12 text-destructive" />
        <h1 className="mb-2 text-xl font-bold">Accès restreint</h1>
        <p className="mb-6 text-muted-foreground">
          Votre profil ne vous donne pas accès à ce portail. Contactez votre administrateur si vous
          pensez qu’il s’agit d’une erreur.
        </p>
        <Button asChild>
          <Link to="/">Retour à mon espace</Link>
        </Button>
      </div>
    </div>
  )
}
