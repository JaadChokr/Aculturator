import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  CircleHelp,
  Heart,
  MousePointerClick,
  RotateCcw,
  Timer,
  XCircle,
} from 'lucide-react'
import {
  QUIZ_QUESTIONS,
  RESOURCE_BY_ID,
  THEMES,
  XP,
  getTheme,
  type QuizQuestion,
  type ThemeId,
} from '@/shared/content'
import { Confetti } from '@/shared/components/Confetti'
import { Mascot } from '@/shared/components/Mascot'
import { ProgressRing } from '@/shared/components/ProgressRing'
import { Button, Card, CardContent, Progress } from '@/shared/ui'
import { cn, shuffle } from '@/shared/lib/utils'
import { AnimatedNumber, EASE_OUT, Reveal, Stagger, spring, springBouncy } from '@/shared/motion'
import { collabPath } from '../paths'
import { ThemeBadge } from '../components/ThemeBadge'
import { TutorialDialog, useTutorial, type TutorialStep } from '../components/TutorialDialog'
import { themeMastery } from '../store/insights'
import { useProgress, type QuizMode } from '../store/progress'

const CHRONO_SECONDS = 15
const LIVES = 3
const LETTERS = ['A', 'B', 'C', 'D']

const MODE_TITLE: Record<Exclude<QuizMode, 'chasse'>, string> = {
  entrainement: 'Entraînement',
  chrono: 'Défi chrono',
  'defi-du-jour': 'Défi du jour',
}

function pickQuestions(mode: QuizMode, theme: ThemeId | null): QuizQuestion[] {
  if (mode === 'chrono') return shuffle(QUIZ_QUESTIONS).slice(0, 12)
  if (mode === 'defi-du-jour') {
    // Cible les thématiques les moins maîtrisées (apprentissage adaptatif)
    const s = useProgress.getState()
    const weakest = [...THEMES]
      .sort((a, b) => themeMastery(s, a.id) - themeMastery(s, b.id))
      .slice(0, 3)
      .map((t) => t.id)
    return shuffle(QUIZ_QUESTIONS.filter((q) => weakest.includes(q.themeId))).slice(0, 5)
  }
  return shuffle(QUIZ_QUESTIONS.filter((q) => !theme || q.themeId === theme)).slice(0, 8)
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
export default function QuizPlayPage() {
  const [params] = useSearchParams()
  return <QuizGame key={params.toString()} />
}

function QuizGame() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const mode = (params.get('mode') ?? 'entrainement') as Exclude<QuizMode, 'chasse'>
  const theme = params.get('theme') as ThemeId | null
  const [questions, setQuestions] = useState(() => pickQuestions(mode, theme))

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
  let earned = score * XP.quizCorrect + bonus
  if (score === total && total >= 4) earned += XP.quizPerfectBonus
  if (mode === 'defi-du-jour') earned *= 2

  useEffect(() => {
    if (!finished || saved.current) return
    saved.current = true
    recordQuiz({ mode, themeId: theme ?? undefined, score, total, xp: earned })
  }, [finished, score, total, earned, mode, theme, recordQuiz])

  const restart = () => {
    saved.current = false
    setQuestions(pickQuestions(mode, theme))
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

  const title = `${MODE_TITLE[mode]}${theme ? ` · ${getTheme(theme).title}` : ''}`

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
    const message =
      pct === 100
        ? 'Sans faute, impressionnant !'
        : pct >= 70
          ? 'Très beau résultat !'
          : pct >= 40
            ? 'Bien joué, vous progressez.'
            : 'Chaque erreur est une occasion d’apprendre.'
    return (
      <div className="mx-auto max-w-6xl">
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
          <Button variant="outline" asChild>
            <Link to={collabPath('quiz')}>
              <ArrowLeft /> Tous les quiz
            </Link>
          </Button>
          {mistakes.length > 0 && (
            <Button variant="outline" asChild>
              <Link to={collabPath(`flashcards/session?mode=all&theme=${mistakes[0].q.themeId}`)}>
                Réviser en flashcards
              </Link>
            </Button>
          )}
          <Button onClick={restart}>
            <RotateCcw /> Rejouer
          </Button>
        </div>
      </div>
    )
  }

  /* ───────── Question en cours ───────── */
  const correctNow = revealed && picked === q.answer
  const resource = q.resourceId ? RESOURCE_BY_ID[q.resourceId] : null

  return (
    <div className="mx-auto max-w-5xl">
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
            <Link to={collabPath('quiz')}>
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
                <div className="mb-1 text-xs font-bold text-muted-foreground">
                  Difficulté {'●'.repeat(q.difficulty)}
                  {'○'.repeat(3 - q.difficulty)}
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
