import { Flag, Flame, Target, Zap } from 'lucide-react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { LearningEvent, ThemeId } from '@acculturator/contracts'
import { api } from '@acculturator/core/api'
import { getSelectedParcoursId, onParcoursChange } from '@acculturator/core/parcours'
import { getCatalog } from '@acculturator/core/catalog'
import { XP, levelFromXp } from '@acculturator/core/content'
import { toast } from '@acculturator/design-system/components'
import { addDays, todayISO } from '@acculturator/design-system/lib'
import { BADGES, type BadgeId } from './badges'
import { MISSIONS, type MissionId } from './missions'
import { moduleStates } from './modules'
import { useTips } from './tips'

/* ───────────── Répétition espacée (système de Leitner) ───────────── */
/** Intervalle (en jours) avant la prochaine révision, selon la boîte. */
export const LEITNER_INTERVALS = [0, 1, 3, 7, 14, 30] as const // index = boîte (1..5)
export type CardGrade = 'again' | 'hard' | 'good'

export interface CardState {
  box: 1 | 2 | 3 | 4 | 5
  due: string
  reviews: number
  lapses: number
}

export type QuizMode = 'entrainement' | 'chrono' | 'defi-du-jour' | 'chasse' | 'module'

export interface QuizRecord {
  id: string
  mode: QuizMode
  themeId?: ThemeId
  /** Quiz de validation d'un module */
  moduleId?: string
  score: number
  total: number
  xp: number
  date: string
}

export interface ProgressData {
  xp: number
  streak: { count: number; best: number; lastDay: string }
  activity: Record<string, number> // xp gagnée par jour
  viewedResources: string[]
  bookmarks: string[]
  cards: Record<string, CardState>
  answers: Partial<Record<ThemeId, { correct: number; total: number }>>
  quizHistory: QuizRecord[]
  bestChrono: number
  hazardsFound: Record<string, string[]>
  chatQuestions: number
  badges: Partial<Record<BadgeId, string>>
  missions: { day: string; progress: Partial<Record<MissionId, number>>; claimed: MissionId[] }
  /** Modules terminés (date de fin) */
  completedModules: Record<string, string>
}

interface ProgressActions {
  addXp: (amount: number, reason?: string, silent?: boolean) => void
  markResourceViewed: (id: string) => void
  resourceCheckPassed: () => void
  toggleBookmark: (id: string) => void
  reviewCard: (id: string, grade: CardGrade) => void
  recordAnswer: (themeId: ThemeId, correct: boolean) => void
  recordQuiz: (r: Omit<QuizRecord, 'id' | 'date'>) => void
  recordHazard: (sceneId: string, hazardId: string) => void
  recordChat: () => void
  resetDemo: () => void
}

export type ProgressState = ProgressData & ProgressActions

/** Envoi d'un événement d'apprentissage au backend (sans bloquer l'interface). */
const track = (event: LearningEvent) => {
  api.progress.track(event).catch(() => {
    /* la file d'envoi et les reprises seront gérées avec le backend */
  })
}

/** Cartes déjà travaillées dans le profil de démonstration */
const DEMO_CARD_IDS = [
  'f-duerp',
  'f-duerp-maj',
  'f-retrait',
  'f-at-delai',
  'f-9principes',
  'f-epc',
  'f-tms',
  'f-charge',
  'f-tms-signes',
  'f-202020',
  'f-ecran-hauteur',
  'f-ecran-fenetre',
  'f-pause',
  'f-rps',
  'f-rps-qui',
  'f-referent-harcelement',
  'f-deconnexion',
  'f-triangle',
]

/* ───────────── Données de départ ───────────── */
/** Progression vierge : premier accès à un parcours. */
function empty(): ProgressData {
  return {
    xp: 0,
    streak: { count: 0, best: 0, lastDay: '' },
    activity: {},
    viewedResources: [],
    bookmarks: [],
    cards: {},
    answers: {},
    quizHistory: [],
    bestChrono: 0,
    hazardsFound: {},
    chatQuestions: 0,
    badges: {},
    missions: { day: todayISO(), progress: {}, claimed: [] },
    completedModules: {},
  }
}

/** Parcours dont la démo montre un profil déjà engagé (les autres partent de zéro). */
const DEMO_PARCOURS = 'sst'

const initialData = (parcoursId: string | null): ProgressData =>
  parcoursId === DEMO_PARCOURS ? seed() : empty()

/** Profil de démonstration déjà engagé dans le parcours SST. */
function seed(): ProgressData {
  const today = todayISO()
  const activity: Record<string, number> = {}
  const pattern = [0, 40, 25, 0, 60, 35, 0, 15, 80, 45, 30, 0, 55, 20]
  pattern.forEach((v, i) => {
    if (v) activity[addDays(today, -(pattern.length - i))] = v
  })
  const cards: Record<string, CardState> = {}
  DEMO_CARD_IDS.forEach((id, i) => {
    const box = ((i % 5) + 1) as CardState['box']
    cards[id] = {
      box,
      due: addDays(today, i % 3 === 0 ? -1 : LEITNER_INTERVALS[box] - 1),
      reviews: box + 1,
      lapses: i % 4 === 0 ? 1 : 0,
    }
  })
  return {
    xp: 640,
    streak: { count: 4, best: 9, lastDay: addDays(today, -1) },
    activity,
    viewedResources: [
      'r-acteurs',
      'r-droit-retrait',
      'r-at',
      'r-charges',
      'r-tms',
      'r-poste',
      'r-pas',
    ],
    bookmarks: ['r-numeros'],
    cards,
    answers: {
      fondamentaux: { correct: 9, total: 12 },
      postures: { correct: 7, total: 8 },
      ecran: { correct: 5, total: 6 },
      rps: { correct: 2, total: 5 },
      incendie: { correct: 4, total: 7 },
      secours: { correct: 6, total: 7 },
    },
    quizHistory: [
      {
        id: 'demo-module-1',
        mode: 'module',
        moduleId: 'm-fondamentaux',
        score: 5,
        total: 5,
        xp: 80,
        date: addDays(today, -3),
      },
      {
        id: 'h1',
        mode: 'entrainement',
        themeId: 'postures',
        score: 4,
        total: 4,
        xp: 70,
        date: addDays(today, -6),
      },
      { id: 'h2', mode: 'chrono', score: 7, total: 10, xp: 95, date: addDays(today, -3) },
      {
        id: 'h3',
        mode: 'entrainement',
        themeId: 'rps',
        score: 2,
        total: 5,
        xp: 20,
        date: addDays(today, -1),
      },
    ],
    bestChrono: 7,
    hazardsFound: {},
    chatQuestions: 2,
    badges: {
      'premiers-pas': addDays(today, -12),
      'sans-faute': addDays(today, -6),
      cinephile: addDays(today, -2),
    },
    missions: { day: today, progress: {}, claimed: [] },
    // Module 1 terminé, module 2 en cours, les suivants se débloqueront ensuite
    completedModules: { 'm-fondamentaux': addDays(today, -3) },
  }
}

const DATA_KEYS = Object.keys(empty()) as (keyof ProgressData)[]

/* ───────────── Store ───────────── */
const STORAGE_KEY = 'acculturator.collaborateur.progress'
const storageKeyFor = (parcoursId: string) => `${STORAGE_KEY}.${parcoursId}`
/** Parcours dont la progression est actuellement chargée */
let boundTo: string | null = null

export const useProgress = create<ProgressState>()(
  persist(
    (set, get) => {
      /** Met à jour série + missions du jour à chaque activité. */
      const touch = () => {
        const today = todayISO()
        const { streak, missions } = get()
        let nextStreak = streak
        if (streak.lastDay !== today) {
          const count = streak.lastDay === addDays(today, -1) ? streak.count + 1 : 1
          nextStreak = { count, best: Math.max(streak.best, count), lastDay: today }
          if (count > 1)
            toast({
              title: `Série de ${count} jours`,
              description: 'Revenez demain pour la prolonger.',
              icon: Flame,
              tone: 'xp',
            })
        }
        set({
          streak: nextStreak,
          missions: missions.day === today ? missions : { day: today, progress: {}, claimed: [] },
        })
      }

      const progressMission = (id: MissionId, inc = 1) => {
        const { missions } = get()
        const def = MISSIONS.find((m) => m.id === id)!
        const value = Math.min(def.target, (missions.progress[id] ?? 0) + inc)
        const claimed = missions.claimed.includes(id)
        set({ missions: { ...missions, progress: { ...missions.progress, [id]: value } } })
        if (!claimed && value >= def.target) {
          set({ missions: { ...get().missions, claimed: [...get().missions.claimed, id] } })
          toast({
            title: 'Mission du jour accomplie',
            description: def.label,
            icon: Target,
            tone: 'success',
          })
          get().addXp(XP.dailyMission, undefined, true)
        }
      }

      /** Modules qui viennent d'être terminés : date, XP, événement, message. */
      const checkModules = () => {
        let catalog
        try {
          catalog = getCatalog()
        } catch {
          return // catalogue pas encore chargé
        }
        if (!catalog.modules) return
        const s = get()
        const finished = moduleStates(s, catalog.modules, catalog).filter(
          (m) => m.status === 'done' && !s.completedModules[m.module.id],
        )
        if (!finished.length) return
        const date = todayISO()
        set({
          completedModules: {
            ...s.completedModules,
            ...Object.fromEntries(finished.map((m) => [m.module.id, date])),
          },
        })
        finished.forEach((m) => {
          track({ type: 'module_completed', moduleId: m.module.id })
          toast({
            title: `Module terminé : ${m.module.title}`,
            description: 'Bravo ! Le module suivant vous attend.',
            icon: Flag,
            tone: 'badge',
          })
          get().addXp(XP.moduleCompleted, undefined, true)
        })
      }

      const checkBadges = () => {
        checkModules()
        const s = get()
        const unlocked = BADGES.filter((b) => !s.badges[b.id] && b.isUnlocked(s))
        if (!unlocked.length) return
        const date = todayISO()
        set({ badges: { ...s.badges, ...Object.fromEntries(unlocked.map((b) => [b.id, date])) } })
        unlocked.forEach((b) =>
          toast({
            title: `Badge débloqué : ${b.name}`,
            description: b.description,
            icon: b.icon,
            tone: 'badge',
          }),
        )
      }

      return {
        ...empty(),

        addXp: (amount, reason, silent) => {
          const before = levelFromXp(get().xp).current.level
          const today = todayISO()
          set((s) => ({
            xp: s.xp + amount,
            activity: { ...s.activity, [today]: (s.activity[today] ?? 0) + amount },
          }))
          if (!silent && reason)
            toast({ title: `+${amount} XP`, description: reason, icon: Zap, tone: 'xp' })
          const after = levelFromXp(get().xp).current
          if (after.level > before)
            toast({
              title: `Niveau ${after.level} : ${after.title}`,
              description: 'Nouveau palier atteint.',
              icon: after.icon,
              tone: 'badge',
            })
        },

        markResourceViewed: (id) => {
          track({ type: 'resource_viewed', resourceId: id })
          touch()
          if (get().viewedResources.includes(id)) return
          set((s) => ({ viewedResources: [...s.viewedResources, id] }))
          get().addXp(XP.resourceViewed, 'Ressource consultée')
          progressMission('resource')
          checkBadges()
        },

        resourceCheckPassed: () => get().addXp(XP.resourceCheckOk, 'Bonne réponse !'),

        toggleBookmark: (id) =>
          set((s) => ({
            bookmarks: s.bookmarks.includes(id)
              ? s.bookmarks.filter((b) => b !== id)
              : [...s.bookmarks, id],
          })),

        reviewCard: (id, grade) => {
          track({ type: 'card_reviewed', cardId: id, grade })
          touch()
          const prev = get().cards[id] ?? { box: 1, due: todayISO(), reviews: 0, lapses: 0 }
          const box = (
            grade === 'good' ? Math.min(5, prev.box + 1) : grade === 'hard' ? prev.box : 1
          ) as CardState['box']
          const next: CardState = {
            box,
            due: addDays(todayISO(), grade === 'again' ? 0 : LEITNER_INTERVALS[box]),
            reviews: prev.reviews + 1,
            lapses: prev.lapses + (grade === 'again' ? 1 : 0),
          }
          set((s) => ({ cards: { ...s.cards, [id]: next } }))
          get().addXp(
            grade === 'good' && box === 5 ? XP.cardMastered : XP.cardReviewed,
            undefined,
            true,
          )
          progressMission('cards')
          checkBadges()
        },

        recordAnswer: (themeId, correct) => {
          track({ type: 'question_answered', themeId, correct })
          touch()
          set((s) => {
            const a = s.answers[themeId] ?? { correct: 0, total: 0 }
            return {
              answers: {
                ...s.answers,
                [themeId]: { correct: a.correct + (correct ? 1 : 0), total: a.total + 1 },
              },
            }
          })
        },

        recordQuiz: (r) => {
          track({
            type: 'quiz_completed',
            mode: r.mode,
            themeId: r.themeId,
            moduleId: r.moduleId,
            score: r.score,
            total: r.total,
          })
          touch()
          set((s) => ({
            quizHistory: [
              { ...r, id: crypto.randomUUID(), date: todayISO() },
              ...s.quizHistory,
            ].slice(0, 50),
            bestChrono: r.mode === 'chrono' ? Math.max(s.bestChrono, r.score) : s.bestChrono,
          }))
          if (r.xp > 0) get().addXp(r.xp, 'Quiz terminé')
          if (r.score / r.total >= 0.7) progressMission('quiz')
          checkBadges()
        },

        recordHazard: (sceneId, hazardId) => {
          track({ type: 'hazard_found', sceneId, hazardId })
          touch()
          const found = get().hazardsFound[sceneId] ?? []
          if (found.includes(hazardId)) return
          set((s) => ({ hazardsFound: { ...s.hazardsFound, [sceneId]: [...found, hazardId] } }))
          checkBadges()
        },

        recordChat: () => {
          track({ type: 'chat_question_asked' })
          touch()
          set((s) => ({ chatQuestions: s.chatQuestions + 1 }))
          get().addXp(XP.chatQuestion, undefined, true)
          checkBadges()
        },

        resetDemo: () => set(initialData(boundTo)),
      }
    },
    {
      // Une sauvegarde par parcours : le nom est fixé par bindToParcours(), ci-dessous
      name: STORAGE_KEY,
      skipHydration: true,
      version: 1,
      // Données manquantes d'une ancienne sauvegarde : valeurs de départ (jamais celles d'un autre parcours)
      merge: (persisted, current) => ({
        ...current,
        ...empty(),
        ...(persisted as Partial<ProgressData>),
      }),
      // On ne persiste que les données (jamais les actions)
      partialize: (s) =>
        Object.fromEntries(DATA_KEYS.map((k) => [k, s[k]])) as unknown as ProgressData,
    },
  ),
)

/* ───────────── Une progression par parcours ───────────── */
const storage = {
  get: (key: string) => {
    try {
      return localStorage.getItem(key)
    } catch {
      return null
    }
  },
  move: (from: string, to: string) => {
    try {
      const value = localStorage.getItem(from)
      if (value !== null && localStorage.getItem(to) === null) localStorage.setItem(to, value)
      localStorage.removeItem(from)
    } catch {
      /* stockage indisponible : rien à reprendre */
    }
  },
}

/**
 * Reprise de l'ancienne sauvegarde unique (avant la séparation par parcours) :
 * elle appartenait au seul parcours qui existait, SST. Les didacticiels vus passent
 * dans leur propre sauvegarde, commune à tous les parcours.
 */
function migrateLegacySave() {
  const legacy = storage.get(STORAGE_KEY)
  if (legacy === null) return
  try {
    const seen = (JSON.parse(legacy) as { state?: { seenTips?: string[] } }).state?.seenTips ?? []
    seen.forEach((id) => useTips.getState().markSeen(id))
  } catch {
    /* sauvegarde illisible : ignorée */
  }
  storage.move(STORAGE_KEY, storageKeyFor(DEMO_PARCOURS))
}

/** Charge la progression du parcours (ou ses données de départ s'il est nouveau). */
function bindToParcours(parcoursId: string | null) {
  if (!parcoursId || parcoursId === boundTo) return
  boundTo = parcoursId
  const key = storageKeyFor(parcoursId)
  useProgress.persist.setOptions({ name: key })
  if (storage.get(key) !== null) void useProgress.persist.rehydrate()
  else useProgress.setState(initialData(parcoursId))
}

/**
 * Progression enregistrée pour un parcours, sans le charger (page de choix du parcours) :
 * null si l'utilisateur ne l'a jamais commencé.
 */
export function savedProgress(parcoursId: string): ProgressData | null {
  if (parcoursId === boundTo) return useProgress.getState()
  const saved = storage.get(storageKeyFor(parcoursId))
  if (saved !== null) {
    try {
      return { ...empty(), ...(JSON.parse(saved) as { state: Partial<ProgressData> }).state }
    } catch {
      return null
    }
  }
  return parcoursId === DEMO_PARCOURS ? seed() : null
}

migrateLegacySave()
bindToParcours(getSelectedParcoursId())
onParcoursChange(bindToParcours)

/* ───────────── Sélecteurs dérivés ───────────── */
/** Cartes à travailler : d'abord les révisions échues, puis les nouvelles cartes. */
export function dueCards(cards: Record<string, CardState>, themeId?: ThemeId) {
  const today = todayISO()
  const inTheme = getCatalog().flashcards.filter((c) => !themeId || c.themeId === themeId)
  return {
    review: inTheme.filter((c) => cards[c.id] && cards[c.id].due <= today),
    fresh: inTheme.filter((c) => !cards[c.id]),
  }
}

export function countDue(cards: Record<string, CardState>) {
  const today = todayISO()
  return getCatalog().flashcards.filter((c) => cards[c.id] && cards[c.id].due <= today).length
}
