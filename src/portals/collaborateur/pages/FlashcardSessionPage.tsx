import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion, useMotionValue, useTransform, type PanInfo } from 'motion/react'
import { Link, useSearchParams } from 'react-router'
import { ArrowLeft, Check, CircleHelp, Lightbulb, type LucideIcon, RotateCcw } from 'lucide-react'
import { FLASHCARDS, THEME_BY_ID, type Flashcard, type ThemeId } from '@/shared/content'
import { Confetti } from '@/shared/components/Confetti'
import { Mascot } from '@/shared/components/Mascot'
import {
  Button,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Progress,
} from '@/shared/ui'
import { cn, shuffle } from '@/shared/lib/utils'
import { AnimatedNumber, Reveal, Stagger, spring, springBouncy } from '@/shared/motion'
import { collabPath } from '../paths'
import { ThemeBadge } from '../components/ThemeBadge'
import { dueCards, useProgress, type CardGrade } from '../store/progress'

const GRADES: {
  grade: CardGrade
  label: string
  key: string
  className: string
  icon: LucideIcon
}[] = [
  {
    grade: 'again',
    label: 'À revoir',
    key: '1',
    icon: RotateCcw,
    className: 'border-destructive/40 hover:bg-destructive/10 text-destructive',
  },
  {
    grade: 'hard',
    label: 'Hésitant',
    key: '2',
    icon: CircleHelp,
    className: 'border-warning/60 hover:bg-warning/10 text-warning-foreground dark:text-warning',
  },
  {
    grade: 'good',
    label: 'Je sais',
    key: '3',
    icon: Check,
    className: 'border-success/50 hover:bg-success/10 text-success',
  },
]

function buildQueue(
  theme: ThemeId | null,
  mode: string | null,
  cards: ReturnType<typeof useProgress.getState>['cards'],
) {
  const max = theme || mode === 'all' ? 20 : 12
  if (mode === 'all')
    return shuffle(FLASHCARDS.filter((c) => !theme || c.themeId === theme)).slice(0, max)
  const { review, fresh } = dueCards(cards, theme ?? undefined)
  return [...shuffle(review), ...shuffle(fresh)].slice(0, max)
}

const SWIPE_THRESHOLD = 110

/** Direction de sortie : 1 = droite (Je sais), -1 = gauche (À revoir), 0 = haut (Hésitant). */
const exitVariants = {
  exit: (dir: number) =>
    dir === 0
      ? { y: -80, opacity: 0, scale: 0.9, transition: { duration: 0.3 } }
      : {
          x: dir * 640,
          rotate: dir * 22,
          opacity: 0,
          transition: { duration: 0.38, ease: 'easeIn' as const },
        },
}

/** Carte glissable : à droite « Je sais », à gauche « À revoir » (une fois retournée). */
function SwipeCard({
  card,
  flipped,
  hint,
  onFlip,
  onSwipe,
}: {
  card: Flashcard
  flipped: boolean
  hint: boolean
  onFlip: () => void
  onSwipe: (g: CardGrade) => void
}) {
  const t = THEME_BY_ID[card.themeId]
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-260, 260], [-14, 14])
  const goodOpacity = useTransform(x, [25, SWIPE_THRESHOLD], [0, 1])
  const againOpacity = useTransform(x, [-SWIPE_THRESHOLD, -25], [1, 0])

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x > SWIPE_THRESHOLD || info.velocity.x > 700) onSwipe('good')
    else if (info.offset.x < -SWIPE_THRESHOLD || info.velocity.x < -700) onSwipe('again')
  }

  return (
    <motion.div
      className="perspective absolute inset-0 touch-pan-y"
      style={{ x, rotate }}
      drag={flipped ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.85}
      onDragEnd={onDragEnd}
      onTap={onFlip}
      variants={exitVariants}
      initial={{ opacity: 0, scale: 0.94, y: 18 }}
      animate={{ opacity: 1, scale: 1, y: 0, transition: spring }}
      exit="exit"
      whileDrag={{ scale: 1.03, cursor: 'grabbing' }}
      role="button"
      tabIndex={0}
      aria-label={
        flipped ? 'Réponse affichée : glissez ou choisissez une évaluation' : 'Retourner la carte'
      }
    >
      <motion.div
        className="preserve-3d relative h-full w-full"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
      >
        <Card className="backface-hidden absolute inset-0 flex flex-col overflow-hidden shadow-lg">
          <div className="h-1 bg-primary" />
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
            <span
              className="grid size-12 place-items-center rounded-md bg-muted text-foreground"
              aria-hidden
            >
              <t.icon className="size-6" strokeWidth={1.75} />
            </span>
            <p className="text-xl leading-snug font-semibold text-balance sm:text-2xl lg:text-3xl">
              {card.front}
            </p>
            <AnimatePresence>
              {hint && card.hint && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="text-sm text-muted-foreground italic"
                >
                  Indice : {card.hint}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
          <div className="pb-4 text-center text-xs font-semibold text-muted-foreground">
            Touchez la carte ou appuyez sur Espace pour retourner
          </div>
        </Card>
        <Card className="backface-hidden rotate-y-180 absolute inset-0 flex flex-col overflow-hidden border-primary/30 bg-card shadow-lg">
          <div className="h-1 bg-primary" />
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
            <span className="text-xs font-bold tracking-wider text-primary uppercase">Réponse</span>
            <p className="text-lg leading-relaxed font-semibold whitespace-pre-line sm:text-xl lg:text-2xl">
              {card.back}
            </p>
          </div>
          <div className="pb-4 text-center text-xs font-semibold text-muted-foreground">
            ← Glissez à gauche : à revoir · à droite : je sais →
          </div>
        </Card>
      </motion.div>

      {/* Tampons qui apparaissent pendant le glissement */}
      <motion.span
        style={{ opacity: goodOpacity }}
        className="pointer-events-none absolute top-6 left-6 -rotate-6 rounded-md border-2 border-success bg-card px-3 py-1 text-base font-semibold tracking-wide text-success uppercase"
      >
        Je sais !
      </motion.span>
      <motion.span
        style={{ opacity: againOpacity }}
        className="pointer-events-none absolute top-6 right-6 rotate-6 rounded-md border-2 border-destructive bg-card px-3 py-1 text-base font-semibold tracking-wide text-destructive uppercase"
      >
        À revoir
      </motion.span>
    </motion.div>
  )
}

/** Didacticiel des flashcards : gestes et raccourcis, affiché une seule fois. */
function FlashcardTutorial({ open, onClose }: { open: boolean; onClose: () => void }) {
  const steps = [
    {
      icon: Lightbulb,
      title: 'Lisez la question',
      text: 'Formulez la réponse dans votre tête avant de retourner la carte : c’est cet effort qui fait mémoriser.',
    },
    {
      icon: RotateCcw,
      title: 'Retournez la carte',
      text: 'Touchez ou cliquez sur la carte.',
      keys: ['Espace'],
    },
    {
      icon: Check,
      title: 'Évaluez-vous',
      text: 'À revoir, Hésitant ou Je sais. Vous pouvez aussi glisser la carte : à gauche pour « À revoir », à droite pour « Je sais ».',
      keys: ['1', '2', '3'],
    },
  ]
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Réviser avec les flashcards</DialogTitle>
          <DialogDescription>
            Les cartes reviennent au bon moment pour s’ancrer durablement. Une carte « À revoir »
            repasse dans la même session.
          </DialogDescription>
        </DialogHeader>
        <ol className="flex flex-col gap-3">
          {steps.map((step, i) => (
            <li key={step.title} className="flex gap-3 rounded-md border p-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
                <step.icon className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold">
                  {i + 1}. {step.title}
                </div>
                <p className="text-sm text-muted-foreground">{step.text}</p>
                {step.keys && (
                  <p className="mt-1.5 hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex">
                    Au clavier :
                    {step.keys.map((k) => (
                      <kbd
                        key={k}
                        className="rounded border bg-muted px-1.5 py-0.5 font-mono text-[11px] text-foreground"
                      >
                        {k}
                      </kbd>
                    ))}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ol>
        <div className="flex justify-end">
          <Button onClick={onClose}>C’est parti</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function FlashcardSessionPage() {
  const [params] = useSearchParams()
  return <Session key={params.toString()} />
}

function Session() {
  const [params] = useSearchParams()
  const theme = params.get('theme') as ThemeId | null
  const mode = params.get('mode')
  const reviewCard = useProgress((s) => s.reviewCard)

  const [queue, setQueue] = useState<Flashcard[]>(() =>
    buildQueue(theme, mode, useProgress.getState().cards),
  )
  const [initialSize] = useState(queue.length)
  const [flipped, setFlipped] = useState(false)
  const [hint, setHint] = useState(false)
  const [stats, setStats] = useState({ again: 0, hard: 0, good: 0 })
  const [combo, setCombo] = useState(0)
  const [turn, setTurn] = useState(0)
  const [exitDir, setExitDir] = useState(0)

  const card = queue[0]
  const doneCount =
    initialSize - queue.filter((c, i) => queue.findIndex((x) => x.id === c.id) === i).length

  const grade = useCallback(
    (g: CardGrade) => {
      if (!card || !flipped) return
      setExitDir(g === 'good' ? 1 : g === 'again' ? -1 : 0)
      setTurn((n) => n + 1)
      reviewCard(card.id, g)
      setStats((s) => ({ ...s, [g]: s[g] + 1 }))
      setCombo((c) => (g === 'good' ? c + 1 : 0))
      setFlipped(false)
      setHint(false)
      // Les cartes « À revoir » reviennent en fin de session (retour immédiat + nouvelle tentative)
      setQueue((q) => (g === 'again' ? [...q.slice(1), q[0]] : q.slice(1)))
    },
    [card, flipped, reviewCard],
  )

  // Didacticiel : affiché automatiquement à la première visite, puis à la demande
  const seenTutorial = useProgress((s) => s.seenTips.includes('flashcards'))
  const markTipSeen = useProgress((s) => s.markTipSeen)
  const [tutorialOpen, setTutorialOpen] = useState(!seenTutorial)
  const closeTutorial = () => {
    setTutorialOpen(false)
    markTipSeen('flashcards')
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (tutorialOpen) return
      if (e.code === 'Space' || e.key === 'Enter') {
        e.preventDefault()
        setFlipped((f) => !f)
      }
      const g = GRADES.find((x) => x.key === e.key)
      if (g) grade(g.grade)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [grade, tutorialOpen])

  const backLink = (
    <Button asChild variant="ghost" size="sm">
      <Link to={collabPath('flashcards')}>
        <ArrowLeft /> Flashcards
      </Link>
    </Button>
  )

  if (!initialSize) {
    return (
      <div className="mx-auto max-w-3xl text-center">
        {backLink}
        <Mascot mood="cheer" className="mx-auto my-6 size-28" />
        <h1 className="mb-2 text-2xl font-bold">Aucune révision en attente</h1>
        <p className="mb-6 text-muted-foreground">
          Vos cartes reviendront au bon moment. Envie de continuer ? Passez en mode libre.
        </p>
        <Button asChild>
          <Link to={collabPath(`flashcards/session?mode=all${theme ? `&theme=${theme}` : ''}`)}>
            Mode libre
          </Link>
        </Button>
      </div>
    )
  }

  if (!card) {
    const total = stats.again + stats.hard + stats.good
    return (
      <div className="mx-auto max-w-3xl text-center">
        <Confetti />
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={springBouncy}
        >
          <Mascot mood="cheer" className="mx-auto mb-4 size-32" />
        </motion.div>
        <h1 className="mb-2 text-3xl font-bold">Session terminée !</h1>
        <p className="mb-6 text-muted-foreground">
          {total} révisions · votre mémoire vous dit merci. Revenez demain pour consolider.
        </p>
        <Stagger className="mb-8 grid grid-cols-3 gap-3" delay={0.2} stagger={0.1}>
          {GRADES.map((g) => (
            <Reveal key={g.grade} variant="pop">
              <Card>
                <CardContent className="p-4">
                  <g.icon className="mx-auto mb-1 size-5 text-muted-foreground" />
                  <AnimatedNumber
                    value={stats[g.grade]}
                    from={0}
                    className="block text-2xl font-bold tabular-nums"
                  />
                  <div className="text-xs font-semibold text-muted-foreground">{g.label}</div>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </Stagger>
        <div className="flex justify-center gap-2">
          <Button asChild variant="outline">
            <Link to={collabPath('flashcards')}>Retour aux paquets</Link>
          </Button>
          <Button asChild>
            <Link to={collabPath('quiz')}>Me tester en quiz</Link>
          </Button>
        </div>
      </div>
    )
  }

  const remaining = queue.length

  return (
    <div className="mx-auto max-w-4xl">
      <FlashcardTutorial open={tutorialOpen} onClose={closeTutorial} />
      <div>
        <div className="mb-4 flex items-center gap-3">
          {backLink}
          <Progress
            value={(doneCount / initialSize) * 100}
            className="h-2.5 flex-1"
            indicatorClassName="bg-xp"
          />
          <span className="text-sm font-bold tabular-nums">
            {doneCount}/{initialSize}
          </span>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setTutorialOpen(true)}
            aria-label="Comment ça marche ?"
            title="Comment ça marche ?"
          >
            <CircleHelp />
          </Button>
        </div>

        <div className="mb-3 flex h-7 items-center justify-between">
          <ThemeBadge themeId={card.themeId} />
          <AnimatePresence mode="popLayout">
            {combo >= 2 && (
              <motion.span
                key={combo}
                initial={{ scale: 0.4, opacity: 0, rotate: -12 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ scale: 0.6, opacity: 0 }}
                transition={springBouncy}
                className="text-sm font-bold text-streak"
              >
                Série de {combo} bonnes réponses
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Paquet : les cartes suivantes sont visibles derrière la carte active */}
        <div className="relative h-80 sm:h-96 lg:h-[28rem]">
          {remaining > 2 && (
            <div className="absolute inset-x-6 top-5 bottom-0 translate-y-3 rounded-lg border bg-card/60 shadow-sm" />
          )}
          {remaining > 1 && (
            <div className="absolute inset-x-3 top-2.5 bottom-0 translate-y-1.5 rounded-lg border bg-card/80 shadow-md" />
          )}
          <AnimatePresence custom={exitDir} initial={false}>
            <SwipeCard
              key={`${card.id}-${turn}`}
              card={card}
              flipped={flipped}
              hint={hint}
              onFlip={() => setFlipped((f) => !f)}
              onSwipe={grade}
            />
          </AnimatePresence>
        </div>

        <div className="mt-6 min-h-24">
          <AnimatePresence mode="wait" initial={false}>
            {flipped ? (
              <Stagger key="grades" className="grid grid-cols-3 gap-2 sm:gap-3" stagger={0.05}>
                {GRADES.map((g) => (
                  <Reveal key={g.grade} variant="pop">
                    <Button
                      variant="outline"
                      onClick={() => grade(g.grade)}
                      className={cn('h-auto w-full flex-col gap-0.5 border-2 py-3', g.className)}
                    >
                      <g.icon className="size-5" />
                      <span>{g.label}</span>
                      <span className="hidden text-[10px] font-medium opacity-60 sm:block">
                        touche {g.key}
                      </span>
                    </Button>
                  </Reveal>
                ))}
              </Stagger>
            ) : (
              <motion.div
                key="actions"
                className="flex justify-center gap-2"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8, transition: { duration: 0.12 } }}
              >
                {card.hint && !hint && (
                  <Button variant="ghost" onClick={() => setHint(true)}>
                    <Lightbulb /> Un indice ?
                  </Button>
                )}
                <Button size="lg" onClick={() => setFlipped(true)}>
                  <RotateCcw /> Retourner la carte
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Essayez de formuler la réponse dans votre tête avant de retourner : c’est l’effort de
          rappel qui fait mémoriser.
        </p>
      </div>
    </div>
  )
}
