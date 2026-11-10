import { useState } from 'react'
import { useNavigate } from 'react-router'
import {
  ArrowRight,
  GraduationCap,
  Search,
  SearchX,
  ShieldPlus,
  Sparkles,
  type LucideIcon,
} from 'lucide-react'
import type { Parcours, ParcoursProgress } from '@acculturator/contracts'
import { Badge, Button, Card, CardContent, Input, Progress } from '@acculturator/design-system/ui'
import { StandaloneShell, ThemeToggle, UserMenu } from '@acculturator/design-system/layout'
import {
  FullPageLoader,
  LoadError,
  NotificationsMenu,
  PageHeader,
  SegmentedControl,
} from '@acculturator/design-system/components'
import { Reveal, Stagger } from '@acculturator/design-system/motion'
import { cn, daysBetween, todayISO } from '@acculturator/design-system/lib'
import { useAuth } from '@acculturator/core/auth'
import { useNotifications } from '@acculturator/core/notifications'
import { useCurrentParcours, useParcoursList, useSelectParcours } from '@acculturator/core/parcours'
import { homePortalFor, portalsForRole, usePortalRegistry } from '@acculturator/core/portal'
import { useUserMenu } from './useUserMenu'

/** Icône de chaque parcours (les nouveaux parcours prennent l'icône par défaut). */
const PARCOURS_ICON: Record<string, LucideIcon> = { sst: ShieldPlus }

const STATS: { key: keyof Parcours['stats']; label: string }[] = [
  { key: 'themes', label: 'thématiques' },
  { key: 'resources', label: 'ressources' },
  { key: 'flashcards', label: 'flashcards' },
  { key: 'quizQuestions', label: 'questions de quiz' },
]

type Filter = 'all' | 'started' | 'new'
const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'Tous' },
  { id: 'started', label: 'Commencés' },
  { id: 'new', label: 'À découvrir' },
]

/** Recherche insensible à la casse et aux accents. */
const normalize = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

function lastActivityLabel(iso?: string) {
  if (!iso) return null
  const days = daysBetween(iso, todayISO())
  if (days <= 0) return 'aujourd’hui'
  if (days === 1) return 'hier'
  return `le ${new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}`
}

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
  const notifications = useNotifications()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('all')

  if (list.isError)
    return (
      <LoadError message="Les parcours n’ont pas pu être chargés." onRetry={() => list.refetch()} />
    )
  if (!list.data) return <FullPageLoader label="Chargement des parcours…" />

  // Avancement : fourni par le backend, sinon calculé par le portail qui le sait (collaborateur)
  const provider = portalsForRole(portals, user.role).find((p) => p.parcoursProgress)
  const progressOf = (p: Parcours) => p.progress ?? provider?.parcoursProgress?.(p) ?? null
  const items = list.data.map((p) => ({ parcours: p, progress: progressOf(p) }))

  const matchesFilter = (f: Filter, progress: ParcoursProgress | null) =>
    f === 'all' || (f === 'started' ? progress !== null : progress === null)
  const q = normalize(query.trim())
  const visible = items.filter(
    ({ parcours, progress }) =>
      matchesFilter(filter, progress) &&
      (!q || normalize(`${parcours.title} ${parcours.description}`).includes(q)),
  )
  const filtered = filter !== 'all' || q !== ''

  const open = (p: Parcours) => {
    select(p.id)
    navigate(homePortalFor(portals, user.role)?.basePath ?? '/')
  }
  const reset = () => {
    setQuery('')
    setFilter('all')
  }

  return (
    <StandaloneShell
      actions={
        <>
          <NotificationsMenu items={notifications.items} onMarkRead={notifications.markRead} />
          <span className="hidden sm:contents">
            <ThemeToggle />
          </span>
          <span aria-hidden className="mx-1 hidden h-6 w-px bg-border sm:block" />
          <UserMenu {...userMenu} />
        </>
      }
    >
      <PageHeader
        eyebrow="Vos parcours d’acculturation"
        title={`Bonjour ${user.firstName}, quel parcours souhaitez-vous suivre ?`}
        description="Chaque parcours réunit des contenus courts, des révisions et des défis sur une thématique. Vous pourrez en changer à tout moment depuis votre menu."
      />
      <Stagger className="flex flex-col gap-6">
        <Reveal className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un parcours…"
              aria-label="Rechercher un parcours"
              className="bg-card pl-9"
            />
          </div>
          <SegmentedControl
            label="Filtrer les parcours"
            value={filter}
            onChange={setFilter}
            className="self-start sm:self-auto"
            options={FILTERS.map((f) => ({
              value: f.id,
              label: f.label,
              count: items.filter((i) => matchesFilter(f.id, i.progress)).length,
            }))}
          />
        </Reveal>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {visible.map(({ parcours, progress }) => (
            <Reveal key={parcours.id} className="h-full">
              <ParcoursCard
                parcours={parcours}
                progress={progress}
                current={current?.id === parcours.id}
                onOpen={() => open(parcours)}
              />
            </Reveal>
          ))}
          {!filtered && (
            <Reveal className="h-full">
              <UpcomingCard />
            </Reveal>
          )}
          {visible.length === 0 && (
            <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed p-10 text-center md:col-span-2">
              <SearchX className="size-8 text-muted-foreground" />
              <p className="font-semibold">Aucun parcours ne correspond à votre recherche.</p>
              <Button variant="outline" onClick={reset}>
                Réinitialiser les filtres
              </Button>
            </div>
          )}
        </div>
      </Stagger>
    </StandaloneShell>
  )
}

function ParcoursCard({
  parcours,
  progress,
  current,
  onOpen,
}: {
  parcours: Parcours
  progress: ParcoursProgress | null
  current: boolean
  onOpen: () => void
}) {
  const Icon = PARCOURS_ICON[parcours.id] ?? GraduationCap
  const available = parcours.status === 'available'
  const last = lastActivityLabel(progress?.lastActivity)
  return (
    <Card
      className={cn(
        'h-full transition-shadow',
        available ? 'hover:shadow-md' : 'opacity-70',
        current && 'ring-2 ring-primary/30',
      )}
    >
      <CardContent className="@container flex h-full flex-col gap-5 p-6 sm:p-7">
        <div className="flex items-start justify-between gap-3">
          <span
            className={cn(
              'grid size-12 shrink-0 place-items-center rounded-md',
              available ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
            )}
          >
            <Icon className="size-6" />
          </span>
          {current && <Badge>Parcours actuel</Badge>}
          {!available && <Badge variant="accent">Bientôt disponible</Badge>}
        </div>

        <div>
          <h2 className="mb-1.5 text-xl font-bold">{parcours.title}</h2>
          <p className="text-sm text-muted-foreground">{parcours.description}</p>
        </div>

        <dl className="grid grid-cols-2 gap-3 @md:grid-cols-4">
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
          <div className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="font-medium">Maîtrise du parcours</span>
              <span className="font-semibold tabular-nums">
                {progress ? `${progress.mastery} %` : 'Pas encore commencé'}
              </span>
            </div>
            <Progress value={progress?.mastery ?? 0} aria-label="Maîtrise du parcours" />
            {progress && (
              <p className="text-xs text-muted-foreground">
                {progress.resourcesViewed}/{parcours.stats.resources} ressources consultées ·{' '}
                {progress.cardsAnchored}/{parcours.stats.flashcards} cartes ancrées
                {last && ` · dernière activité ${last}`}
              </p>
            )}
          </div>
        )}

        {available && (
          <Button size="lg" className="mt-auto self-start" onClick={onOpen}>
            {progress ? 'Reprendre le parcours' : 'Commencer le parcours'} <ArrowRight />
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
