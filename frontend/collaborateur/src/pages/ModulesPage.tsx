import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { AnimatePresence, motion } from 'motion/react'
import {
  ArrowRight,
  Check,
  ChevronDown,
  ClipboardCheck,
  Clock,
  Crosshair,
  FileText,
  Flag,
  Layers,
  ListChecks,
  Lock,
  PlayCircle,
  type LucideIcon,
} from 'lucide-react'
import type { Catalog, ModuleStep } from '@acculturator/contracts'
import { getTheme, useCatalog } from '@acculturator/core/catalog'
import { RESOURCE_TYPE_LABEL } from '@acculturator/core/content'
import { PageHeader, Eyebrow } from '@acculturator/design-system/components'
import { EASE_OUT } from '@acculturator/design-system/motion'
import { Button, Card, CardContent, Progress } from '@acculturator/design-system/ui'
import { cn } from '@acculturator/design-system/lib'
import { ModuleStatusBadge } from '../components/ModuleStatusBadge'
import { ThemeBadge } from '../components/ThemeBadge'
import { collabPath } from '../paths'
import {
  currentModule,
  moduleStates,
  stepDone,
  stepLabel,
  stepPath,
  type ModuleState,
} from '../store/modules'
import { useProgress, type ProgressState } from '../store/progress'

const STEP_ICON: Record<ModuleStep['kind'], LucideIcon> = {
  resource: PlayCircle,
  flashcards: Layers,
  quiz: ClipboardCheck,
  hazard: Crosshair,
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })

/** Précision sous le titre d'une étape (durée, cartes revues, meilleur score…). */
function stepDetail(step: ModuleStep, moduleId: string, s: ProgressState, catalog: Catalog) {
  switch (step.kind) {
    case 'resource': {
      const r = catalog.resources.find((x) => x.id === step.resourceId)
      return r ? `${RESOURCE_TYPE_LABEL[r.type]} · ${r.durationMin} min` : ''
    }
    case 'flashcards': {
      const cards = catalog.flashcards.filter((c) => c.themeId === step.themeId)
      const seen = cards.filter((c) => s.cards[c.id]).length
      return `${seen}/${cards.length} cartes revues au moins une fois`
    }
    case 'quiz': {
      const best = s.quizHistory
        .filter((q) => q.mode === 'module' && q.moduleId === moduleId)
        .reduce((max, q) => Math.max(max, q.score / q.total), -1)
      const need = `${Math.round(step.passRatio * 100)} % de bonnes réponses pour valider`
      return best >= 0 ? `${need} · meilleur score ${Math.round(best * 100)} %` : need
    }
    case 'hazard': {
      const scene = catalog.hazardScenes.find((h) => h.id === step.sceneId)
      const found = s.hazardsFound[step.sceneId]?.length ?? 0
      return scene ? `${found}/${scene.hazards.length} dangers repérés` : ''
    }
  }
}

/**
 * Le parcours découpé en modules, dans l'ordre. Chaque module se déroule pour montrer
 * ses étapes ; le module en cours (ou celui demandé par `?module=`) est ouvert d'office.
 */
export default function ModulesPage() {
  const catalog = useCatalog()
  const s = useProgress()
  const [params, setParams] = useSearchParams()
  // Choix de l'utilisateur (ouvert / fermé) ; à défaut, seul le module ciblé est ouvert
  const [toggled, setToggled] = useState<Record<string, boolean>>({})
  const plan = catalog.modules
  const states = plan ? moduleStates(s, plan, catalog) : []
  const current = currentModule(states)
  const target = params.get('module') ?? current?.module.id

  // Arrivée sur un module précis (depuis une étape, le tableau de bord…) : on le montre
  const requested = params.get('module')
  useEffect(() => {
    if (requested)
      document.getElementById(`module-${requested}`)?.scrollIntoView({ block: 'start' })
  }, [requested])

  if (!plan) {
    return (
      <PageHeader
        eyebrow="Modules"
        title="Ce parcours n’est pas organisé en modules"
        description="Ses contenus sont accessibles librement depuis les autres rubriques."
      />
    )
  }

  const isOpen = (id: string) => toggled[id] ?? id === target
  const toggle = (id: string) => setToggled((t) => ({ ...t, [id]: !isOpen(id) }))
  const openModule = (id: string) => {
    setToggled((t) => ({ ...t, [id]: true }))
    setParams({ module: id }, { replace: true })
  }

  const doneCount = states.filter((m) => m.status === 'done').length
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
            <Button size="lg" className="shrink-0" onClick={() => openModule(current.module.id)}>
              {current.status === 'in-progress' ? 'Continuer' : 'Commencer'} le module{' '}
              {current.index} <ArrowRight />
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
          <ModuleItem
            key={m.module.id}
            state={m}
            current={m === current}
            last={i === states.length - 1}
            open={isOpen(m.module.id)}
            onToggle={() => toggle(m.module.id)}
            next={states[i + 1]}
            onOpenModule={openModule}
          />
        ))}
      </ol>
    </div>
  )
}

function ModuleItem({
  state,
  current,
  last,
  open,
  onToggle,
  next,
  onOpenModule,
}: {
  state: ModuleState
  current: boolean
  last: boolean
  open: boolean
  onToggle: () => void
  next?: ModuleState
  onOpenModule: (id: string) => void
}) {
  const catalog = useCatalog()
  const s = useProgress()
  const { module, status, done, total, index } = state
  const locked = status === 'locked'
  const panelId = `module-${module.id}-etapes`
  const titleId = `module-${module.id}-titre`
  const completedOn = s.completedModules[module.id]

  return (
    <li id={`module-${module.id}`} className="flex scroll-mt-24 gap-4">
      {/* Repère du module et trait vers le suivant (masqué sur mobile, faute de place) */}
      <div className="hidden flex-col items-center sm:flex">
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
        <Card
          className={cn(
            'overflow-hidden transition-shadow',
            locked ? 'bg-muted/40' : 'hover:shadow-md',
            current && 'ring-2 ring-primary/30',
          )}
        >
          {/* En-tête : cliquer pour dérouler les étapes */}
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={open}
            aria-controls={panelId}
            aria-labelledby={titleId}
            className="block w-full text-left focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none focus-visible:ring-inset"
          >
            <CardContent className="flex flex-col gap-3 p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Eyebrow tone="muted">Module {index}</Eyebrow>
                  <h2
                    id={titleId}
                    className={cn('font-bold sm:text-lg', locked && 'text-muted-foreground')}
                  >
                    {module.title}
                  </h2>
                  <p className="text-sm text-muted-foreground">{module.description}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <ModuleStatusBadge status={status} />
                  <ChevronDown
                    aria-hidden
                    className={cn(
                      'size-5 text-muted-foreground transition-transform',
                      open && 'rotate-180',
                    )}
                  />
                </div>
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
          </button>

          <AnimatePresence initial={false}>
            {open && (
              <motion.div
                id={panelId}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: EASE_OUT }}
                className="overflow-hidden"
              >
                <div className="flex flex-col gap-3 border-t bg-muted/30 p-3 sm:p-5">
                  {status === 'done' && (
                    <div className="flex flex-col gap-3 rounded-md border border-success/40 bg-success/5 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <p className="flex items-center gap-2 text-sm font-semibold">
                        <Flag className="size-4 text-success" />
                        Module terminé{completedOn ? ` le ${formatDate(completedOn)}` : ''}
                      </p>
                      {next && next.status !== 'locked' && (
                        <Button size="sm" onClick={() => onOpenModule(next.module.id)}>
                          Module suivant : {next.module.title} <ArrowRight />
                        </Button>
                      )}
                    </div>
                  )}

                  <ol className="flex flex-col gap-2">
                    {module.steps.map((step, i) => {
                      const isDone = stepDone(s, step, module.id, catalog)
                      const isNext = !locked && step === state.nextStep
                      const type =
                        step.kind === 'resource'
                          ? catalog.resources.find((r) => r.id === step.resourceId)?.type
                          : undefined
                      const Icon =
                        type && type !== 'video' && type !== 'podcast'
                          ? FileText
                          : STEP_ICON[step.kind]
                      return (
                        <li
                          key={i}
                          className={cn(
                            'flex items-center gap-3 rounded-md border bg-card p-3',
                            isNext && 'ring-2 ring-primary/30',
                          )}
                        >
                          <span
                            className={cn(
                              'grid size-9 shrink-0 place-items-center rounded-md',
                              isDone ? 'bg-success/15 text-success' : 'bg-muted text-foreground',
                            )}
                          >
                            {isDone ? <Check className="size-4" /> : <Icon className="size-4" />}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold">
                              <span className="text-muted-foreground">{i + 1}. </span>
                              {stepLabel(step, catalog, (t) => getTheme(t).title)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {stepDetail(step, module.id, s, catalog)}
                            </p>
                          </div>
                          {locked ? (
                            <Lock
                              aria-label="Étape verrouillée"
                              className="size-4 shrink-0 text-muted-foreground"
                            />
                          ) : (
                            <Button
                              asChild
                              size="sm"
                              variant={isNext ? 'default' : 'outline'}
                              className="shrink-0"
                            >
                              <Link to={collabPath(stepPath(step, module.id))}>
                                {isDone ? 'Revoir' : 'Commencer'}
                              </Link>
                            </Button>
                          )}
                        </li>
                      )
                    })}
                  </ol>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </div>
    </li>
  )
}
