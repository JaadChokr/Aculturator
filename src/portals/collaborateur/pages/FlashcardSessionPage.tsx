import { useCallback, useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { ArrowLeft, Lightbulb, RotateCcw } from 'lucide-react'
import { FLASHCARDS, THEME_BY_ID, type Flashcard, type ThemeId } from '@/shared/content'
import { Confetti } from '@/shared/components/Confetti'
import { Mascot } from '@/shared/components/Mascot'
import { Button, Card, CardContent, Progress } from '@/shared/ui'
import { cn, shuffle } from '@/shared/lib/utils'
import { collabPath } from '../paths'
import { ThemeBadge } from '../components/ThemeBadge'
import { dueCards, useProgress, type CardGrade } from '../store/progress'

const GRADES: { grade: CardGrade; label: string; key: string; className: string; emoji: string }[] = [
  { grade: 'again', label: 'À revoir', key: '1', emoji: '😕', className: 'border-destructive/40 hover:bg-destructive/10 text-destructive' },
  { grade: 'hard', label: 'Hésitant', key: '2', emoji: '🤔', className: 'border-warning/60 hover:bg-warning/10 text-warning-foreground dark:text-warning' },
  { grade: 'good', label: 'Je sais !', key: '3', emoji: '😎', className: 'border-success/50 hover:bg-success/10 text-success' },
]

function buildQueue(theme: ThemeId | null, mode: string | null, cards: ReturnType<typeof useProgress.getState>['cards']) {
  const max = theme || mode === 'all' ? 20 : 12
  if (mode === 'all') return shuffle(FLASHCARDS.filter((c) => !theme || c.themeId === theme)).slice(0, max)
  const { review, fresh } = dueCards(cards, theme ?? undefined)
  return [...shuffle(review), ...shuffle(fresh)].slice(0, max)
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

  const [queue, setQueue] = useState<Flashcard[]>(() => buildQueue(theme, mode, useProgress.getState().cards))
  const [initialSize] = useState(queue.length)
  const [flipped, setFlipped] = useState(false)
  const [hint, setHint] = useState(false)
  const [stats, setStats] = useState({ again: 0, hard: 0, good: 0 })
  const [combo, setCombo] = useState(0)

  const card = queue[0]
  const doneCount = initialSize - queue.filter((c, i) => queue.findIndex((x) => x.id === c.id) === i).length

  const grade = useCallback(
    (g: CardGrade) => {
      if (!card || !flipped) return
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

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === 'Enter') {
        e.preventDefault()
        setFlipped((f) => !f)
      }
      const g = GRADES.find((x) => x.key === e.key)
      if (g) grade(g.grade)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [grade])

  const backLink = (
    <Button asChild variant="ghost" size="sm">
      <Link to={collabPath('flashcards')}>
        <ArrowLeft /> Flashcards
      </Link>
    </Button>
  )

  if (!initialSize) {
    return (
      <div className="mx-auto max-w-xl text-center">
        {backLink}
        <Mascot mood="cheer" className="mx-auto my-6 size-28" />
        <h1 className="mb-2 text-2xl font-extrabold">Rien à réviser pour le moment 🎉</h1>
        <p className="mb-6 text-muted-foreground">Vos cartes reviendront au bon moment. Envie de continuer ? Passez en mode libre.</p>
        <Button asChild>
          <Link to={collabPath(`flashcards/session?mode=all${theme ? `&theme=${theme}` : ''}`)}>Mode libre</Link>
        </Button>
      </div>
    )
  }

  if (!card) {
    const total = stats.again + stats.hard + stats.good
    return (
      <div className="mx-auto max-w-xl text-center">
        <Confetti />
        <Mascot mood="cheer" className="mx-auto mb-4 size-32 animate-float" />
        <h1 className="mb-2 text-3xl font-extrabold">Session terminée !</h1>
        <p className="mb-6 text-muted-foreground">
          {total} révisions · votre mémoire vous dit merci. Revenez demain pour consolider.
        </p>
        <div className="mb-8 grid grid-cols-3 gap-3">
          {GRADES.map((g) => (
            <Card key={g.grade}>
              <CardContent className="p-4">
                <div className="text-2xl">{g.emoji}</div>
                <div className="text-2xl font-extrabold tabular-nums">{stats[g.grade]}</div>
                <div className="text-xs font-semibold text-muted-foreground">{g.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
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

  const t = THEME_BY_ID[card.themeId]

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 flex items-center gap-3">
        {backLink}
        <Progress value={(doneCount / initialSize) * 100} className="h-2.5 flex-1" indicatorClassName="bg-xp" />
        <span className="text-sm font-bold tabular-nums">
          {doneCount}/{initialSize}
        </span>
      </div>

      <div className="mb-3 flex h-7 items-center justify-between">
        <ThemeBadge themeId={card.themeId} />
        {combo >= 2 && <span className="animate-pop text-sm font-extrabold text-streak">🔥 Combo x{combo}</span>}
      </div>

      <button
        onClick={() => setFlipped((f) => !f)}
        className="perspective block h-80 w-full text-left sm:h-96"
        aria-label={flipped ? 'Voir la question' : 'Voir la réponse'}
      >
        <div className={cn('preserve-3d relative h-full w-full transition-transform duration-500', flipped && 'rotate-y-180')}>
          <Card className={'backface-hidden absolute inset-0 flex flex-col overflow-hidden border-2 shadow-xl'}>
            <div className={cn('h-2 bg-gradient-to-r', t.tone.gradient)} />
            <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
              <span className="text-5xl" aria-hidden>
                {t.emoji}
              </span>
              <p className="text-xl leading-snug font-bold sm:text-2xl">{card.front}</p>
              {hint && card.hint && <p className="animate-pop text-sm text-muted-foreground italic">💡 {card.hint}</p>}
            </div>
            <div className="pb-4 text-center text-xs font-semibold text-muted-foreground">Touchez la carte ou appuyez sur Espace pour retourner</div>
          </Card>
          <Card className="backface-hidden rotate-y-180 absolute inset-0 flex flex-col overflow-hidden border-2 border-primary/40 bg-gradient-to-br from-primary/5 to-card shadow-xl">
            <div className="h-2 bg-primary" />
            <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
              <span className="text-xs font-bold tracking-wider text-primary uppercase">Réponse</span>
              <p className="text-lg leading-relaxed font-semibold whitespace-pre-line sm:text-xl">{card.back}</p>
            </div>
          </Card>
        </div>
      </button>

      <div className="mt-5 min-h-24">
        {flipped ? (
          <div className="grid animate-pop grid-cols-3 gap-2 sm:gap-3">
            {GRADES.map((g) => (
              <Button key={g.grade} variant="outline" onClick={() => grade(g.grade)} className={cn('h-auto flex-col gap-0.5 border-2 py-3', g.className)}>
                <span className="text-xl">{g.emoji}</span>
                <span>{g.label}</span>
                <span className="hidden text-[10px] font-medium opacity-60 sm:block">touche {g.key}</span>
              </Button>
            ))}
          </div>
        ) : (
          <div className="flex justify-center gap-2">
            {card.hint && !hint && (
              <Button variant="ghost" onClick={() => setHint(true)}>
                <Lightbulb /> Un indice ?
              </Button>
            )}
            <Button size="lg" onClick={() => setFlipped(true)}>
              <RotateCcw /> Retourner la carte
            </Button>
          </div>
        )}
      </div>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        Essayez de formuler la réponse dans votre tête avant de retourner : c’est l’effort de rappel qui fait mémoriser.
      </p>
    </div>
  )
}
