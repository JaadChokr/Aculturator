import { useNavigate } from 'react-router'
import { ArrowRight, GraduationCap, ShieldPlus, Sparkles, type LucideIcon } from 'lucide-react'
import type { Parcours } from '@acculturator/contracts'
import { Badge, Button, Card, CardContent } from '@acculturator/design-system/ui'
import { Brand, ThemeToggle, UserMenu } from '@acculturator/design-system/layout'
import { FullPageLoader, LoadError } from '@acculturator/design-system/components'
import { Reveal, Stagger } from '@acculturator/design-system/motion'
import { cn } from '@acculturator/design-system/lib'
import { useAuth } from '@acculturator/core/auth'
import { useCurrentParcours, useParcoursList, useSelectParcours } from '@acculturator/core/parcours'
import { homePortalFor, usePortalRegistry } from '@acculturator/core/portal'
import { useUserMenu } from './useUserMenu'

/** Icône de chaque parcours (les nouveaux parcours prennent l'icône par défaut). */
const PARCOURS_ICON: Record<string, LucideIcon> = { sst: ShieldPlus }

const STATS: { key: keyof Parcours['stats']; label: string }[] = [
  { key: 'themes', label: 'thématiques' },
  { key: 'resources', label: 'ressources' },
  { key: 'flashcards', label: 'flashcards' },
  { key: 'quizQuestions', label: 'questions de quiz' },
]

/**
 * Point d'entrée de la plateforme : l'utilisateur choisit le parcours d'acculturation
 * à suivre, puis arrive sur le portail d'accueil de son profil.
 */
export function ParcoursPage() {
  const { user } = useAuth()
  const portals = usePortalRegistry()
  const list = useParcoursList()
  const current = useCurrentParcours()
  const select = useSelectParcours()
  const navigate = useNavigate()
  const userMenu = useUserMenu()

  if (list.isError)
    return (
      <LoadError message="Les parcours n’ont pas pu être chargés." onRetry={() => list.refetch()} />
    )
  if (!list.data) return <FullPageLoader label="Chargement des parcours…" />

  const open = (p: Parcours) => {
    select(p.id)
    navigate(homePortalFor(portals, user.role)?.basePath ?? '/')
  }

  return (
    <div className="min-h-dvh overflow-x-clip bg-background">
      <header className="sticky top-0 z-20 border-b bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-3 px-4 sm:px-6">
          <Brand />
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden sm:contents">
              <ThemeToggle />
            </span>
            <span aria-hidden className="mx-1 hidden h-6 w-px bg-border sm:block" />
            <UserMenu {...userMenu} />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:py-16">
        <Stagger className="flex flex-col gap-10">
          <Reveal className="max-w-3xl">
            <p className="mb-2 text-xs font-semibold tracking-[0.12em] text-primary uppercase">
              Vos parcours d’acculturation
            </p>
            <h1 className="mb-3 text-3xl leading-tight font-bold text-balance sm:text-4xl">
              Bonjour {user.firstName}, quel parcours souhaitez-vous suivre ?
            </h1>
            <p className="text-muted-foreground">
              Chaque parcours réunit des contenus courts, des révisions et des défis sur une
              thématique. Vous pourrez en changer à tout moment depuis votre menu.
            </p>
          </Reveal>

          <div className="grid gap-6 md:grid-cols-2">
            {list.data.map((p) => (
              <Reveal key={p.id} className="h-full">
                <ParcoursCard parcours={p} current={current?.id === p.id} onOpen={() => open(p)} />
              </Reveal>
            ))}
            <Reveal className="h-full">
              <UpcomingCard />
            </Reveal>
          </div>
        </Stagger>
      </main>
    </div>
  )
}

function ParcoursCard({
  parcours,
  current,
  onOpen,
}: {
  parcours: Parcours
  current: boolean
  onOpen: () => void
}) {
  const Icon = PARCOURS_ICON[parcours.id] ?? GraduationCap
  const available = parcours.status === 'available'
  return (
    <Card
      className={cn(
        'h-full transition-shadow',
        available ? 'hover:shadow-md' : 'opacity-70',
        current && 'ring-2 ring-primary/30',
      )}
    >
      <CardContent className="flex h-full flex-col gap-5 p-6 sm:p-7">
        <div className="flex items-start justify-between gap-3">
          <span
            className={cn(
              'grid size-12 shrink-0 place-items-center rounded-md',
              available ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
            )}
          >
            <Icon className="size-6" />
          </span>
          {current && <Badge>En cours</Badge>}
          {!available && <Badge variant="accent">Bientôt disponible</Badge>}
        </div>

        <div>
          <h2 className="mb-1.5 text-xl font-bold">{parcours.title}</h2>
          <p className="text-sm text-muted-foreground">{parcours.description}</p>
        </div>

        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.key} className="rounded-md bg-muted/60 px-3 py-2">
              <dt className="sr-only">{s.label}</dt>
              <dd className="text-lg leading-tight font-bold tabular-nums">
                {parcours.stats[s.key]}
              </dd>
              <dd aria-hidden className="text-xs text-muted-foreground">
                {s.label}
              </dd>
            </div>
          ))}
        </dl>

        {available && (
          <Button size="lg" className="mt-auto self-start" onClick={onOpen}>
            {current ? 'Reprendre le parcours' : 'Accéder au parcours'} <ArrowRight />
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

/** Emplacement des parcours à venir : la plateforme est prévue pour en accueillir d'autres. */
function UpcomingCard() {
  return (
    <div className="flex h-full min-h-56 flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-8 text-center">
      <span className="grid size-12 place-items-center rounded-full bg-muted text-muted-foreground">
        <Sparkles className="size-6" />
      </span>
      <h2 className="font-semibold">D’autres parcours arrivent</h2>
      <p className="max-w-xs text-sm text-muted-foreground">
        De nouvelles thématiques d’acculturation rejoindront la plateforme.
      </p>
    </div>
  )
}
