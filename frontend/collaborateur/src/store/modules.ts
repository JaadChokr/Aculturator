import type {
  Catalog,
  LearningModule,
  ModuleStep,
  ModulesPlan,
  ThemeId,
} from '@acculturator/contracts'
import type { ProgressData } from './progress'

type ProgressView = Pick<
  ProgressData,
  'viewedResources' | 'cards' | 'quizHistory' | 'hazardsFound' | 'completedModules'
>

export type ModuleStatus = 'done' | 'in-progress' | 'todo' | 'locked'

export interface ModuleState {
  module: LearningModule
  /** Position dans le parcours (1, 2, 3…) */
  index: number
  status: ModuleStatus
  done: number
  total: number
  /** Première étape à faire (absente si le module est terminé) */
  nextStep?: ModuleStep
  /** Module à terminer avant (s'il est verrouillé) */
  lockedBy?: LearningModule
}

/** Une étape est-elle faite ? */
export function stepDone(
  s: ProgressView,
  step: ModuleStep,
  moduleId: string,
  catalog: Catalog,
): boolean {
  switch (step.kind) {
    case 'resource':
      return s.viewedResources.includes(step.resourceId)
    case 'flashcards': {
      const cards = catalog.flashcards.filter((c) => c.themeId === step.themeId)
      return cards.length > 0 && cards.every((c) => s.cards[c.id])
    }
    case 'quiz':
      return s.quizHistory.some(
        (q) =>
          q.mode === 'module' && q.moduleId === moduleId && q.score / q.total >= step.passRatio,
      )
    case 'hazard': {
      const scene = catalog.hazardScenes.find((h) => h.id === step.sceneId)
      return !!scene && (s.hazardsFound[scene.id]?.length ?? 0) >= scene.hazards.length
    }
  }
}

/** État de chaque module, dans l'ordre du parcours. */
export function moduleStates(s: ProgressView, plan: ModulesPlan, catalog: Catalog): ModuleState[] {
  let previous: ModuleState | null = null
  return plan.modules.map((module, i) => {
    const steps = module.steps.map((step) => ({
      step,
      done: stepDone(s, step, module.id, catalog),
    }))
    const done = steps.filter((x) => x.done).length
    const locked = plan.ordering === 'sequential' && previous !== null && previous.status !== 'done'
    const complete = !locked && (!!s.completedModules[module.id] || done === steps.length)
    const state: ModuleState = {
      module,
      index: i + 1,
      status: complete ? 'done' : locked ? 'locked' : done > 0 ? 'in-progress' : 'todo',
      done: complete ? steps.length : done,
      total: steps.length,
      nextStep: complete ? undefined : steps.find((x) => !x.done)?.step,
      lockedBy: locked ? previous!.module : undefined,
    }
    previous = state
    return state
  })
}

/** Module sur lequel avancer maintenant (le premier ni terminé ni verrouillé). */
export function currentModule(states: ModuleState[]): ModuleState | undefined {
  return states.find((m) => m.status === 'in-progress' || m.status === 'todo')
}

/** Libellé d'une étape (titre de la ressource, thématique des cartes…). */
export function stepLabel(
  step: ModuleStep,
  catalog: Catalog,
  themeTitle: (id: ThemeId) => string,
): string {
  switch (step.kind) {
    case 'resource':
      return catalog.resources.find((r) => r.id === step.resourceId)?.title ?? 'Ressource'
    case 'flashcards':
      return `Flashcards : ${themeTitle(step.themeId)}`
    case 'quiz':
      return `Quiz de validation (${step.questionIds.length} questions)`
    case 'hazard':
      return catalog.hazardScenes.find((h) => h.id === step.sceneId)?.title ?? 'Chasse aux risques'
  }
}

/** Lien vers l'étape ; `module=` affiche « Retour au module » sur la page d'arrivée. */
export function stepPath(step: ModuleStep, moduleId: string): string {
  const back = `module=${moduleId}`
  switch (step.kind) {
    case 'resource':
      return `ressources?r=${step.resourceId}&${back}`
    case 'flashcards':
      return `flashcards/session?mode=all&theme=${step.themeId}&${back}`
    case 'quiz':
      return `quiz/jouer?mode=module&${back}`
    case 'hazard':
      return `quiz/chasse-aux-risques?${back}`
  }
}
