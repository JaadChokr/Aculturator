import { Link, useParams } from 'react-router'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ClipboardCheck,
  Clock,
  Crosshair,
  FileText,
  Flag,
  Layers,
  Lock,
  PlayCircle,
  type LucideIcon,
} from 'lucide-react'
import type { Catalog, ModuleStep } from '@acculturator/contracts'
import { useCatalog } from '@acculturator/core/catalog'
import { RESOURCE_TYPE_LABEL } from '@acculturator/core/content'
import { PageHeader } from '@acculturator/design-system/components'
import { getTheme } from '@acculturator/design-system/themes'
import { Button, Card, CardContent, Progress } from '@acculturator/design-system/ui'
import { cn } from '@acculturator/design-system/lib'
import { ModuleStatusBadge } from '../components/ModuleStatusBadge'
import { ThemeBadge } from '../components/ThemeBadge'
import { collabPath } from '../paths'
import { moduleStates, stepDone, stepLabel, stepPath } from '../store/modules'
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

/** Un module : ses étapes dans l'ordre, ce qui est fait et la suite. */
export default function ModulePage() {
  const { moduleId } = useParams()
  const catalog = useCatalog()
  const s = useProgress()
  const plan = catalog.modules
  const states = plan ? moduleStates(s, plan, catalog) : []
  const state = states.find((m) => m.module.id === moduleId)

  const back = (
    <Button asChild variant="ghost" size="sm" className="mb-4">
      <Link to={collabPath('modules')}>
        <ArrowLeft /> Tous les modules
      </Link>
    </Button>
  )

  if (!state) {
    return (
      <div>
        {back}
        <PageHeader title="Module introuvable" />
      </div>
    )
  }

  const { module, status, done, total, index } = state
  const next = states.find((m) => m.index === index + 1)
  const completedOn = s.completedModules[module.id]
  const resourceType = (step: ModuleStep) =>
    step.kind === 'resource'
      ? catalog.resources.find((r) => r.id === step.resourceId)?.type
      : undefined

  return (
    <div className="mx-auto max-w-4xl">
      {back}
      <PageHeader
        eyebrow={`Module ${index} sur ${states.length}`}
        title={module.title}
        description={module.description}
        actions={<ModuleStatusBadge status={status} />}
      />

      <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Clock className="size-4" /> {module.durationMin} min
        </span>
        {module.themeIds.map((t) => (
          <ThemeBadge key={t} themeId={t} />
        ))}
      </div>

      {status === 'locked' ? (
        <Card>
          <CardContent className="flex flex-col items-start gap-4 p-6">
            <p className="flex items-center gap-2 font-semibold">
              <Lock className="size-5 text-muted-foreground" /> Ce module n’est pas encore débloqué.
            </p>
            <p className="text-muted-foreground">
              Terminez d’abord le module « {state.lockedBy?.title} ».
            </p>
            {state.lockedBy && (
              <Button asChild>
                <Link to={collabPath(`modules/${state.lockedBy.id}`)}>
                  Aller au module {index - 1} <ArrowRight />
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          {status === 'done' ? (
            <Card className="mb-6 border-success/40 bg-success/5">
              <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="flex items-center gap-2 font-semibold">
                  <Flag className="size-5 text-success" />
                  Module terminé{completedOn ? ` le ${formatDate(completedOn)}` : ''}
                </p>
                {next && (
                  <Button asChild>
                    <Link to={collabPath(`modules/${next.module.id}`)}>
                      Module suivant : {next.module.title} <ArrowRight />
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="mb-6 flex items-center gap-3">
              <Progress value={(done / total) * 100} aria-label="Étapes terminées" />
              <span className="shrink-0 text-sm font-semibold text-muted-foreground tabular-nums">
                {done}/{total} étapes
              </span>
            </div>
          )}

          <ol className="flex flex-col gap-3">
            {module.steps.map((step, i) => {
              const isDone = stepDone(s, step, module.id, catalog)
              const isNext = step === state.nextStep
              const Icon =
                resourceType(step) && resourceType(step) !== 'video'
                  ? FileText
                  : STEP_ICON[step.kind]
              return (
                <li key={i}>
                  <Card className={cn(isNext && 'ring-2 ring-primary/30')}>
                    <CardContent className="flex items-center gap-4 p-4">
                      <span
                        className={cn(
                          'grid size-10 shrink-0 place-items-center rounded-md',
                          isDone ? 'bg-success/15 text-success' : 'bg-muted text-foreground',
                        )}
                      >
                        {isDone ? <Check className="size-5" /> : <Icon className="size-5" />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-muted-foreground">Étape {i + 1}</p>
                        <p className="font-semibold">
                          {stepLabel(step, catalog, (t) => getTheme(t).title)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {stepDetail(step, module.id, s, catalog)}
                        </p>
                      </div>
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
                    </CardContent>
                  </Card>
                </li>
              )
            })}
          </ol>
        </>
      )}
    </div>
  )
}
