import { Link } from 'react-router'
import { ArrowRight, Check, Clock, ListChecks, Lock } from 'lucide-react'
import { useCatalog } from '@acculturator/core/catalog'
import { PageHeader } from '@acculturator/design-system/components'
import { Button, Card, CardContent, Progress } from '@acculturator/design-system/ui'
import { cn } from '@acculturator/design-system/lib'
import { ModuleStatusBadge } from '../components/ModuleStatusBadge'
import { ThemeBadge } from '../components/ThemeBadge'
import { collabPath } from '../paths'
import { currentModule, moduleStates, type ModuleState } from '../store/modules'
import { useProgress } from '../store/progress'

/** Le parcours découpé en modules, dans l'ordre, avec l'avancement de chacun. */
export default function ModulesPage() {
  const catalog = useCatalog()
  const s = useProgress()
  const plan = catalog.modules

  if (!plan) {
    return (
      <PageHeader
        eyebrow="Modules"
        title="Ce parcours n’est pas organisé en modules"
        description="Ses contenus sont accessibles librement depuis les autres rubriques."
      />
    )
  }

  const states = moduleStates(s, plan, catalog)
  const doneCount = states.filter((m) => m.status === 'done').length
  const current = currentModule(states)
  const sequential = plan.ordering === 'sequential'

  return (
    <div>
      <PageHeader
        eyebrow="Modules"
        title={sequential ? 'Avancer module par module' : 'Les modules du parcours'}
        description={
          sequential
            ? 'Le parcours se suit dans l’ordre : chaque module se débloque quand le précédent est terminé.'
            : 'Les modules sont présentés dans l’ordre conseillé ; vous pouvez les suivre selon vos priorités.'
        }
      />

      <Card className="mb-8">
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:gap-8 sm:p-6">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-baseline justify-between gap-3">
              <span className="font-semibold">
                {doneCount} module{doneCount > 1 ? 's' : ''} terminé{doneCount > 1 ? 's' : ''} sur{' '}
                {states.length}
              </span>
              <span className="text-sm font-semibold text-muted-foreground tabular-nums">
                {Math.round((doneCount / states.length) * 100)} %
              </span>
            </div>
            <Progress
              value={(doneCount / states.length) * 100}
              aria-label="Modules terminés"
              className="h-2.5"
            />
          </div>
          {current ? (
            <Button asChild size="lg" className="shrink-0">
              <Link to={collabPath(`modules/${current.module.id}`)}>
                {current.status === 'in-progress' ? 'Continuer' : 'Commencer'} le module{' '}
                {current.index} <ArrowRight />
              </Link>
            </Button>
          ) : (
            <p className="flex shrink-0 items-center gap-2 font-semibold text-success">
              <Check className="size-5" /> Parcours terminé, bravo !
            </p>
          )}
        </CardContent>
      </Card>

      <ol className="flex flex-col">
        {states.map((m, i) => (
          <ModuleRow
            key={m.module.id}
            state={m}
            current={m === current}
            last={i === states.length - 1}
          />
        ))}
      </ol>
    </div>
  )
}

function ModuleRow({
  state,
  current,
  last,
}: {
  state: ModuleState
  current: boolean
  last: boolean
}) {
  const { module, status, done, total, index } = state
  const locked = status === 'locked'

  const body = (
    <Card
      className={cn(
        'transition-shadow',
        locked ? 'bg-muted/40' : 'hover:shadow-md',
        current && 'ring-2 ring-primary/30',
      )}
    >
      <CardContent className="flex flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className={cn('font-bold sm:text-lg', locked && 'text-muted-foreground')}>
              {module.title}
            </h2>
            <p className="text-sm text-muted-foreground">{module.description}</p>
          </div>
          <ModuleStatusBadge status={status} />
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Clock className="size-3.5" /> {module.durationMin} min
          </span>
          <span className="flex items-center gap-1.5">
            <ListChecks className="size-3.5" /> {total} étapes
          </span>
          {module.themeIds.map((t) => (
            <ThemeBadge key={t} themeId={t} />
          ))}
        </div>

        {locked ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Lock className="size-4 shrink-0" />
            Terminez « {state.lockedBy?.title} » pour débloquer ce module.
          </p>
        ) : (
          <div className="flex items-center gap-3">
            <Progress
              value={(done / total) * 100}
              aria-label={`Étapes terminées : ${done} sur ${total}`}
              indicatorClassName={status === 'done' ? 'bg-success' : undefined}
            />
            <span className="shrink-0 text-xs font-semibold text-muted-foreground tabular-nums">
              {done}/{total} étapes
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )

  return (
    <li className="flex gap-4">
      {/* Repère de l'étape et trait vers le module suivant */}
      <div className="flex flex-col items-center">
        <span
          className={cn(
            'grid size-10 shrink-0 place-items-center rounded-full border-2 text-sm font-bold',
            status === 'done' && 'border-success bg-success text-white',
            status === 'in-progress' && 'border-primary bg-primary text-primary-foreground',
            status === 'todo' && 'border-primary text-primary',
            locked && 'border-border bg-muted text-muted-foreground',
          )}
          aria-hidden
        >
          {status === 'done' ? (
            <Check className="size-5" />
          ) : locked ? (
            <Lock className="size-4" />
          ) : (
            index
          )}
        </span>
        {!last && (
          <span
            aria-hidden
            className={cn('my-1 w-0.5 flex-1', status === 'done' ? 'bg-success' : 'bg-border')}
          />
        )}
      </div>
      <div className="min-w-0 flex-1 pb-5">
        <p className="sr-only">Module {index}</p>
        {locked ? (
          body
        ) : (
          <Link
            to={collabPath(`modules/${module.id}`)}
            className="block rounded-lg focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            {body}
          </Link>
        )}
      </div>
    </li>
  )
}
