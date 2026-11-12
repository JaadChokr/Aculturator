import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  CircleHelp,
  Dumbbell,
  Heart,
  MousePointerClick,
  RotateCcw,
  Timer,
  XCircle,
  type LucideIcon,
} from 'lucide-react'
import type { Difficulty, QuizQuestion, ThemeId } from '@acculturator/contracts'
import { getCatalog, getTheme, useCatalog } from '@acculturator/core/catalog'
import { DIFFICULTY_LABEL, DIFFICULTY_LEVELS, XP } from '@acculturator/core/content'
import {
  Confetti,
  Mascot,
  ProgressRing,
  DIFFICULTY_STYLE,
  DifficultyDots,
  DifficultyPicker,
} from '@acculturator/design-system/components'
import { Button, Card, CardContent, Progress } from '@acculturator/design-system/ui'
import { cn, shuffle } from '@acculturator/design-system/lib'
import {
  AnimatedNumber,
  EASE_OUT,
  Reveal,
  Stagger,
  spring,
  springBouncy,
} from '@acculturator/design-system/motion'
import { collabPath } from '../paths'
import { ThemeBadge } from '../components/ThemeBadge'
import { TutorialDialog, useTutorial, type TutorialStep } from '../components/TutorialDialog'
import { overallMastery, recommendedLevel, themeMastery } from '../store/insights'
import { useProgress, type QuizMode } from '../store/progress'
import { parseLevel, useQuizPrefs } from '../store/quizPrefs'
import { PAGE_WIDTH } from '@acculturator/design-system/layout'

const CHRONO_SECONDS = 15
const LIVES = 3
const LETTERS = ['A', 'B', 'C', 'D']

const MODE_TITLE: Record<Exclude<QuizMode, 'chasse'>, string> = {
  entrainement: 'Entraînement',
  chrono: 'Défi chrono',
  'defi-du-jour': 'Défi du jour',
  module: 'Quiz de validation',
}

/** Étape « quiz » d'un module (questions imposées, seuil de réussite). */
function moduleQuiz(moduleId: string | null) {
  const module = getCatalog().modules?.modules.find((m) => m.id === moduleId)
  const step = module?.steps.find((st) => st.kind === 'quiz')
  return module && step?.kind === 'quiz' ? { module, step } : null
}

/**
 * Questions du niveau choisi en priorité, complétées par le niveau voisin quand il en manque
 * (jamais par l'extrême opposé) : un quiz « expert » ne contient pas de questions de découverte.
 */
function byLevel(pool: QuizQuestion[], level: Difficulty, size: number, minSize: number) {
  const exact = shuffle(pool.filter((q) => q.difficulty === level))
  const near = shuffle(pool.filter((q) => Math.abs(q.difficulty - level) === 1))
  return shuffle([...exact, ...near].slice(0, levelCount(pool, level, size, minSize)))
}

/** Nombre de questions d'un quiz au niveau donné (sans tirage). */
function levelCount(pool: QuizQuestion[], level: Difficulty, size: number, minSize: number) {
  const exact = pool.filter((q) => q.difficulty === level).length
  const near = pool.filter((q) => Math.abs(q.difficulty - level) === 1).length
  return Math.min(Math.min(size, Math.max(minSize, exact)), exact + near)
}

/** Nombre de questions du défi chrono ou de l'entraînement, selon le niveau. */
function questionCount(
  mode: 'chrono' | 'entrainement',
  theme: ThemeId | null,
  level: Difficulty | null,
) {
  const pool = getCatalog().quizQuestions.filter(
    (q) => mode === 'chrono' || !theme || q.themeId === theme,
  )
  const [size, minSize] = mode === 'chrono' ? [12, 12] : [8, 4]
  return level ? levelCount(pool, level, size, minSize) : Math.min(size, pool.length)
}

function pickQuestions(
  mode: QuizMode,
  theme: ThemeId | null,
  moduleId: string | null = null,
  level: Difficulty | null = null,
): QuizQuestion[] {
  const { quizQuestions } = getCatalog()
  if (mode === 'module') {
    const ids = moduleQuiz(moduleId)?.step.questionIds ?? []
    return shuffle(quizQuestions.filter((q) => ids.includes(q.id)))
  }
  if (mode === 'chrono')
    return level ? byLevel(quizQuestions, level, 12, 12) : shuffle(quizQuestions).slice(0, 12)
  if (mode === 'defi-du-jour') {
    // Cible les thématiques les moins maîtrisées (apprentissage adaptatif)
    const s = useProgress.getState()
    const weakest = [...getCatalog().themes]
      .sort((a, b) => themeMastery(s, a.id) - themeMastery(s, b.id))
      .slice(0, 3)
      .map((t) => t.id)
    return shuffle(quizQuestions.filter((q) => weakest.includes(q.themeId))).slice(0, 5)
  }
  const pool = quizQuestions.filter((q) => !theme || q.themeId === theme)
  return level ? byLevel(pool, level, 8, 4) : shuffle(pool).slice(0, 8)
}

interface AnswerLog {
  q: QuizQuestion
  picked: number | null
  correct: boolean
}

const QUIZ_TUTORIAL: TutorialStep[] = [
  {
    icon: CircleHelp,
    title: 'Lisez la question',
    text: 'Une seule bonne réponse par question. Prenez le temps de lire toutes les propositions.',
  },
  {
    icon: MousePointerClick,
    title: 'Choisissez votre réponse',
    text: 'Cliquez ou touchez une proposition. En défi chrono, vous avez 15 secondes et 3 vies.',
    keys: ['1–4', 'A–D'],
  },
  {
    icon: BookOpen,
    title: 'Lisez la correction',
    text: 'Chaque réponse est expliquée, avec un lien vers la ressource si besoin. Puis passez à la question suivante.',
    keys: ['Entrée'],
  },
]

/** Remonte le jeu à chaque changement de paramètres (mode / thématique). */
/** Valeur de `niveau` quand l'utilisateur choisit « tous niveaux ». */
const ALL_LEVELS = 'tous'

export default function QuizPlayPage() {
  const [params] = useSearchParams()
  const mode = params.get('mode') ?? 'entrainement'
  // Défi chrono et entraînement : on choisit d'abord son niveau, puis le quiz commence
  if ((mode === 'chrono' || mode === 'entrainement') && !params.get('niveau'))
    return <LevelChooser mode={mode} theme={params.get('theme') as ThemeId | null} />
  return <QuizGame key={params.toString()} />
}

const MODE_INTRO: Record<'chrono' | 'entrainement', { icon: LucideIcon; text: string }> = {
  chrono: {
    icon: Timer,
    text: '15 secondes par question, 3 vies, des combos pour multiplier les points.',
  },
  entrainement: {
    icon: Dumbbell,
    text: 'Sans chrono ni pression : chaque réponse est corrigée et expliquée.',
  },
}

/** Étape entre le choix du défi et le quiz : le niveau de difficulté. */
function LevelChooser({ mode, theme }: { mode: 'chrono' | 'entrainement'; theme: ThemeId | null }) {
  const [params, setParams] = useSearchParams()
  const catalog = useCatalog()
  const s = useProgress()
  const remembered = useQuizPrefs((p) => p.level)
  const setLevel = useQuizPrefs((p) => p.setLevel)
  const [choice, setChoice] = useState<Difficulty | null>(remembered)
  const recommended = recommendedLevel(
    theme
      ? themeMastery(s, theme)
      : overallMastery(s, {
          themes: catalog.themes.length,
          resources: catalog.resources.length,
          flashcards: catalog.flashcards.length,
        }),
  )
  const intro = MODE_INTRO[mode]
  const options: { value: Difficulty | null; label: string; description: string }[] = [
    { value: null, label: 'Tous niveaux', description: 'Un mélange de questions' },
    ...DIFFICULTY_LEVELS,
  ]

  const start = () => {
    setLevel(choice)
    const next = new URLSearchParams(params)
    next.set('niveau', choice ? String(choice) : ALL_LEVELS)
    setParams(next, { replace: true })
  }

  return (
    <div className={PAGE_WIDTH.focus}>
      <Button asChild variant="ghost" size="sm" className="mb-4">
        <Link to={collabPath('quiz')}>
          <ArrowLeft /> Quiz & défis
        </Link>
      </Button>
      <Card>
        <CardContent className="flex flex-col gap-6 p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground">
              <intro.icon className="size-6" />
            </span>
            <div>
              <h1 className="text-xl font-bold sm:text-2xl">
                {MODE_TITLE[mode]}
                {theme ? ` · ${getTheme(theme).title}` : ''}
              </h1>
              <p className="text-muted-foreground">{intro.text}</p>
            </div>
          </div>

          <div>
            <h2 className="mb-3 font-semibold">Choisissez votre niveau</h2>
            <DifficultyPicker
              value={choice}
              onChange={setChoice}
              onConfirm={start}
              recommended={recommended}
              options={options.map((o) => ({
                ...o,
                meta: `${questionCount(mode, theme, o.value)} questions`,
              }))}
            />
          </div>

          <Button size="lg" className="self-start" onClick={start}>
            Commencer <ArrowRight />
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

function QuizGame() {
  const { resources } = useCatalog()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const mode = (params.get('mode') ?? 'entrainement') as Exclude<QuizMode, 'chasse'>
  const theme = params.get('theme') as ThemeId | null
  const moduleId = mode === 'module' ? params.get('module') : null
  const validation = moduleQuiz(moduleId)
  // Niveau de difficulté : entraînement et défi chrono (le défi du jour s'adapte seul)
  const level =
    mode === 'chrono' || mode === 'entrainement' ? parseLevel(params.get('niveau')) : null
  const setLevel = useQuizPrefs((s) => s.setLevel)
  const [questions, setQuestions] = useState(() => pickQuestions(mode, theme, moduleId, level))

  const recordAnswer = useProgress((s) => s.recordAnswer)
  const recordQuiz = useProgress((s) => s.recordQuiz)
  const tutorial = useTutorial('quiz')

  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [log, setLog] = useState<AnswerLog[]>([])
  const [lives, setLives] = useState(LIVES)
  const [combo, setCombo] = useState(0)
  const [bonus, setBonus] = useState(0)
  const [timeLeft, setTimeLeft] = useState(CHRONO_SECONDS)
  const [finished, setFinished] = useState(false)
  const saved = useRef(false)

  const q = questions[index]
  const isChrono = mode === 'chrono'

  const answer = useCallback(
    (choice: number | null) => {
      if (revealed || !q) return
      const correct = choice === q.answer
      setPicked(choice)
      setRevealed(true)
      setLog((l) => [...l, { q, picked: choice, correct }])
      recordAnswer(q.themeId, correct)
      if (correct) {
        setCombo((c) => {
          const n = c + 1
          if (isChrono && n >= 3) setBonus((b) => b + XP.challengeCombo)
          return n
        })
      } else {
        setCombo(0)
        if (isChrono) setLives((l) => l - 1)
      }
    },
    [revealed, q, recordAnswer, isChrono],
  )

  const next = useCallback(() => {
    if (isChrono && lives <= 0) return setFinished(true)
    if (index + 1 >= questions.length) return setFinished(true)
    setIndex((i) => i + 1)
    setPicked(null)
    setRevealed(false)
    setTimeLeft(CHRONO_SECONDS)
  }, [index, questions.length, isChrono, lives])

  // Minuteur du défi chrono (en pause pendant le didacticiel)
  useEffect(() => {
    if (!isChrono || revealed || finished || tutorial.open) return
    const id = setTimeout(() => {
      if (timeLeft <= 1) {
        setTimeLeft(0)
        answer(null)
      } else setTimeLeft((t) => t - 1)
    }, 1000)
    return () => clearTimeout(id)
  }, [isChrono, revealed, finished, timeLeft, answer, tutorial.open])

  // Raccourcis clavier : 1-4 / A-D pour répondre, Entrée pour continuer
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (finished || !q || tutorial.open) return
      if (!revealed) {
        const i =
          ['1', '2', '3', '4'].indexOf(e.key) >= 0
            ? Number(e.key) - 1
            : LETTERS.indexOf(e.key.toUpperCase())
        if (i >= 0 && i < q.options.length) answer(i)
      } else if (e.key === 'Enter') next()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [finished, revealed, q, answer, next, tutorial.open])

  // Calcul de l'XP gagnée (valeur dérivée) puis enregistrement unique du résultat
  const score = log.filter((l) => l.correct).length
  const total = log.length || 1
  // Une bonne réponse rapporte davantage quand la question est plus difficile
  let earned =
    log
      .filter((l) => l.correct)
      .reduce((xp, l) => xp + XP.quizCorrect + (l.q.difficulty - 1) * XP.quizDifficultyStep, 0) +
    bonus
  if (score === total && total >= 4) earned += XP.quizPerfectBonus
  if (mode === 'defi-du-jour') earned *= 2

  useEffect(() => {
    if (!finished || saved.current) return
    saved.current = true
    recordQuiz({
      mode,
      themeId: theme ?? undefined,
      moduleId: moduleId ?? undefined,
      difficulty: level ?? undefined,
      score,
      total,
      xp: earned,
    })
  }, [finished, score, total, earned, mode, theme, moduleId, level, recordQuiz])

  const restart = () => {
    saved.current = false
    setQuestions(pickQuestions(mode, theme, moduleId, level))
    setIndex(0)
    setPicked(null)
    setRevealed(false)
    setLog([])
    setLives(LIVES)
    setCombo(0)
    setBonus(0)
    setTimeLeft(CHRONO_SECONDS)
    setFinished(false)
  }

  const title = validation
    ? `${MODE_TITLE[mode]} · ${validation.module.title}`
    : `${MODE_TITLE[mode]}${theme ? ` · ${getTheme(theme).title}` : ''}`

  if (!questions.length) {
    return (
      <div className="text-center">
        <p className="mb-4">Aucune question disponible pour cette sélection.</p>
        <Button onClick={() => navigate(collabPath('quiz'))}>Retour</Button>
      </div>
    )
  }

  /* ───────── Écran de résultats ───────── */
  if (finished) {
    const pct = Math.round((score / total) * 100)
    const mistakes = log.filter((l) => !l.correct)
    const mood = pct >= 70 ? 'cheer' : pct >= 40 ? 'happy' : 'thinking'
    // Très bon score : on propose le niveau au-dessus (la difficulté suit les progrès)
    const nextLevel = level && level < 3 && pct >= 80 ? ((level + 1) as Difficulty) : null
    const withoutLevel = () => {
      const p = new URLSearchParams(params)
      p.delete('niveau')
      return p.toString()
    }
    const levelParams = (l: Difficulty) => {
      const p = new URLSearchParams(params)
      p.set('niveau', String(l))
      return p.toString()
    }
    const passed = validation ? score / total >= validation.step.passRatio : false
    const message = validation
      ? passed
        ? 'Quiz validé !'
        : `Encore un effort : ${Math.round(validation.step.passRatio * 100)} % de bonnes réponses sont nécessaires.`
      : pct === 100
        ? 'Sans faute, impressionnant !'
        : pct >= 70
          ? 'Très beau résultat !'
          : pct >= 40
            ? 'Bien joué, vous progressez.'
            : 'Chaque erreur est une occasion d’apprendre.'
    return (
      <div className={PAGE_WIDTH.focus}>
        {pct >= 70 && <Confetti />}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={spring}
        >
          <Card className="mb-6 overflow-hidden">
            <div className="flex flex-col items-center gap-6 border-t-4 border-t-primary p-8 text-center sm:flex-row sm:text-left">
              <ProgressRing
                value={pct}
                size={128}
                stroke={12}
                indicatorClassName={pct >= 70 ? 'stroke-success' : 'stroke-warning'}
                label="Score"
              >
                <div>
                  <AnimatedNumber
                    value={pct}
                    from={0}
                    duration={1.1}
                    format={(n) => `${Math.round(n)}%`}
                    className="block text-3xl font-bold tabular-nums"
                  />
                  <div className="text-xs font-semibold text-muted-foreground tabular-nums">
                    {score}/{total}
                  </div>
                </div>
              </ProgressRing>
              <div className="flex-1">
                <div className="text-sm font-bold text-primary">{title}</div>
                <h1 className="mb-2 text-2xl font-bold">{message}</h1>
                <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
                  <span className="rounded-full bg-xp/12 px-3 py-1 text-sm font-bold text-xp">
                    +{earned} XP
                  </span>
                  {mode === 'defi-du-jour' && (
                    <span className="rounded-full bg-accent/25 px-3 py-1 text-sm font-bold">
                      Bonus ×2
                    </span>
                  )}
                  {isChrono && lives <= 0 && (
                    <span className="rounded-full bg-destructive/12 px-3 py-1 text-sm font-bold text-destructive">
                      Plus de vies
                    </span>
                  )}
                </div>
              </div>
              <motion.div
                initial={{ scale: 0, rotate: -25 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ ...springBouncy, delay: 0.5 }}
              >
                <Mascot mood={mood} className="size-24" />
              </motion.div>
            </div>
          </Card>
        </motion.div>

        {mistakes.length > 0 && (
          <Card className="mb-6">
            <CardContent className="p-5">
              <h2 className="mb-1 font-bold">Revoir mes erreurs</h2>
              <p className="mb-4 text-sm text-muted-foreground">
                Relire la correction maintenant renforce la mémorisation.
              </p>
              <Stagger className="grid gap-3 lg:grid-cols-2" delay={0.6} stagger={0.08}>
                {mistakes.map(({ q: mq, picked: p }) => (
                  <Reveal key={mq.id} className="rounded-xl border p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <ThemeBadge themeId={mq.themeId} />
                    </div>
                    <p className="mb-2 font-semibold">{mq.question}</p>
                    {p !== null && (
                      <p className="flex items-center gap-2 text-sm text-destructive">
                        <XCircle className="size-4 shrink-0" /> Votre réponse : {mq.options[p]}
                      </p>
                    )}
                    {p === null && (
                      <p className="flex items-center gap-2 text-sm text-destructive">
                        <Timer className="size-4" /> Temps écoulé
                      </p>
                    )}
                    <p className="flex items-center gap-2 text-sm font-semibold text-success">
                      <CheckCircle2 className="size-4 shrink-0" /> {mq.options[mq.answer]}
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">{mq.explanation}</p>
                  </Reveal>
                ))}
              </Stagger>
            </CardContent>
          </Card>
        )}

        <div className="flex flex-wrap justify-center gap-2">
          {validation ? (
            <Button variant="outline" asChild>
              <Link to={collabPath(`modules?module=${validation.module.id}`)}>
                <ArrowLeft /> Retour au module
              </Link>
            </Button>
          ) : (
            <Button variant="outline" asChild>
              <Link to={collabPath('quiz')}>
                <ArrowLeft /> Tous les quiz
              </Link>
            </Button>
          )}
          {mistakes.length > 0 && (
            <Button variant="outline" asChild>
              <Link to={collabPath(`flashcards/session?mode=all&theme=${mistakes[0].q.themeId}`)}>
                Réviser en flashcards
              </Link>
            </Button>
          )}
          <Button variant={nextLevel ? 'outline' : 'default'} onClick={restart}>
            <RotateCcw /> Rejouer
          </Button>
          {(mode === 'chrono' || mode === 'entrainement') && (
            <Button variant="ghost" asChild>
              <Link to={collabPath(`quiz/jouer?${withoutLevel()}`)}>Changer de niveau</Link>
            </Button>
          )}
          {nextLevel && (
            <Button asChild onClick={() => setLevel(nextLevel)}>
              <Link to={collabPath(`quiz/jouer?${levelParams(nextLevel)}`)}>
                Passer au niveau {DIFFICULTY_LABEL[nextLevel]} <ArrowRight />
              </Link>
            </Button>
          )}
        </div>
      </div>
    )
  }

  /* ───────── Question en cours ───────── */
  const correctNow = revealed && picked === q.answer
  const resource = q.resourceId ? (resources.find((r) => r.id === q.resourceId) ?? null) : null

  return (
    <div className={PAGE_WIDTH.focus}>
      <TutorialDialog
        open={tutorial.open}
        onClose={tutorial.close}
        title="Comment fonctionnent les quiz"
        description="Ici, se tromper fait partie de l’apprentissage : chaque réponse est corrigée et expliquée immédiatement."
        steps={QUIZ_TUTORIAL}
      />
      <div>
        <div className="mb-4 flex items-center gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link to={collabPath(validation ? `modules?module=${validation.module.id}` : 'quiz')}>
              <ArrowLeft /> Quitter
            </Link>
          </Button>
          <Progress value={(index / questions.length) * 100} className="h-2.5 flex-1" />
          <span className="text-sm font-bold tabular-nums">
            {index + 1}/{questions.length}
          </span>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={tutorial.show}
            aria-label="Comment ça marche ?"
            title="Comment ça marche ?"
          >
            <CircleHelp />
          </Button>
        </div>

        <div className="mb-4 flex min-h-9 flex-wrap items-center gap-3">
          <span className="text-sm font-bold text-primary">{title}</span>
          {level && (
            <span
              className={cn(
                'rounded-sm px-2 py-0.5 text-xs font-semibold',
                DIFFICULTY_STYLE[level].solid,
              )}
            >
              Niveau {DIFFICULTY_LABEL[level]}
            </span>
          )}
          <ThemeBadge themeId={q.themeId} />
          <span className="ml-auto flex items-center gap-3">
            <AnimatePresence mode="popLayout">
              {combo >= 2 && (
                <motion.span
                  key={combo}
                  initial={{ scale: 0.3, opacity: 0, rotate: -15 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={springBouncy}
                  className="text-sm font-bold text-streak"
                >
                  Série ×{combo}
                </motion.span>
              )}
            </AnimatePresence>
            {isChrono && (
              <span className="flex gap-0.5" aria-label={`${lives} vies restantes`}>
                {Array.from({ length: LIVES }, (_, i) => (
                  <motion.span
                    key={i}
                    animate={
                      i < lives
                        ? { scale: 1, opacity: 1, y: 0 }
                        : { scale: [1.5, 0.8], opacity: 0.5, y: [0, -6, 0] }
                    }
                    transition={springBouncy}
                  >
                    <Heart
                      className={cn(
                        'size-5',
                        i < lives ? 'fill-red-500 text-red-500' : 'text-muted-foreground/40',
                      )}
                    />
                  </motion.span>
                ))}
              </span>
            )}
          </span>
        </div>

        {isChrono && (
          <div className="mb-4 flex items-center gap-2">
            <Timer
              className={cn('size-4', timeLeft <= 5 ? 'text-destructive' : 'text-muted-foreground')}
            />
            <Progress
              value={(timeLeft / CHRONO_SECONDS) * 100}
              className="h-2 flex-1"
              indicatorClassName={cn(
                'transition-transform duration-1000 ease-linear',
                timeLeft <= 5 ? 'bg-destructive' : 'bg-warning',
              )}
            />
            <span
              className={cn(
                'w-8 text-right text-sm font-bold tabular-nums',
                timeLeft <= 5 && 'text-destructive',
              )}
            >
              {timeLeft}s
            </span>
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={q.id}
            initial={{ opacity: 0, x: 48 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -48 }}
            transition={{ duration: 0.3, ease: EASE_OUT }}
          >
            <Card className="mb-4">
              <CardContent className="p-6 sm:p-8">
                <div className="mb-1 flex items-center gap-2 text-xs font-bold text-muted-foreground">
                  Difficulté <DifficultyDots level={q.difficulty} />
                  <span className="sr-only">{DIFFICULTY_LABEL[q.difficulty]}</span>
                </div>
                <h2 className="mb-6 text-xl leading-snug font-bold sm:text-2xl lg:text-[1.75rem]">
                  {q.question}
                </h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {q.options.map((opt, i) => {
                    const isAnswer = i === q.answer
                    const isPicked = i === picked
                    return (
                      <motion.button
                        key={opt}
                        disabled={revealed}
                        onClick={() => answer(i)}
                        initial={{ opacity: 0, y: 12 }}
                        animate={
                          revealed && isAnswer
                            ? { opacity: 1, y: 0, scale: [1, 1.05, 1] }
                            : { opacity: 1, y: 0, scale: 1 }
                        }
                        transition={{ delay: revealed ? 0 : 0.12 + i * 0.06, ...spring }}
                        whileHover={revealed ? undefined : { y: -2 }}
                        whileTap={revealed ? undefined : { scale: 0.97 }}
                        className={cn(
                          'flex items-center gap-3 rounded-xl border-2 bg-card p-4 text-left font-semibold transition-colors lg:p-5 lg:text-[15px] hover:border-primary/60 hover:shadow-md disabled:cursor-default disabled:shadow-none',
                          revealed && isAnswer && 'border-success bg-success/10',
                          revealed &&
                            isPicked &&
                            !isAnswer &&
                            'animate-shake border-destructive bg-destructive/10',
                          revealed && !isAnswer && !isPicked && 'opacity-50',
                        )}
                      >
                        <span
                          className={cn(
                            'grid size-8 shrink-0 place-items-center rounded-lg bg-muted text-sm font-bold',
                            revealed && isAnswer && 'bg-success text-success-foreground',
                            revealed && isPicked && !isAnswer && 'bg-destructive text-white',
                          )}
                        >
                          {revealed && isAnswer ? '✓' : revealed && isPicked ? '✗' : LETTERS[i]}
                        </span>
                        {opt}
                      </motion.button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        <AnimatePresence>
          {revealed && (
            <motion.div
              key={`fb-${q.id}`}
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.1 } }}
              transition={spring}
            >
              <Card
                className={cn(
                  'border-2',
                  correctNow
                    ? 'border-success/50 bg-success/5'
                    : 'border-destructive/40 bg-destructive/5',
                )}
              >
                <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                  <motion.div
                    className="shrink-0"
                    initial={{ scale: 0.4, rotate: correctNow ? -20 : 0 }}
                    animate={
                      correctNow ? { scale: 1, rotate: 0 } : { scale: 1, x: [0, -6, 6, -4, 0] }
                    }
                    transition={correctNow ? springBouncy : { duration: 0.45 }}
                  >
                    <Mascot mood={correctNow ? 'cheer' : 'oops'} className="size-16" />
                  </motion.div>
                  <div className="flex-1">
                    <p className="mb-1 font-bold">
                      {correctNow
                        ? 'Bonne réponse !'
                        : picked === null
                          ? 'Temps écoulé…'
                          : 'Pas tout à fait…'}
                      {correctNow && (
                        <motion.span
                          className="ml-2 inline-block text-sm text-xp"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ ...springBouncy, delay: 0.15 }}
                        >
                          +{XP.quizCorrect} XP
                        </motion.span>
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">{q.explanation}</p>
                    {resource && !correctNow && (
                      <Link
                        to={collabPath(`ressources?r=${resource.id}`)}
                        className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
                      >
                        <BookOpen className="size-4" /> Revoir : {resource.title}
                      </Link>
                    )}
                  </div>
                  <Button onClick={next} size="lg" className="shrink-0">
                    {index + 1 >= questions.length || (isChrono && lives <= 0)
                      ? 'Voir mon score'
                      : 'Suivante'}{' '}
                    <ArrowRight />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
