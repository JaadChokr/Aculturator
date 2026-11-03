import { motion } from 'motion/react'
import { Link } from 'react-router'
import { Layers, Play, Repeat, Sparkles } from 'lucide-react'
import { FLASHCARDS, THEMES } from '@/shared/content'
import { PageHeader } from '@/shared/components/PageHeader'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Progress,
} from '@/shared/ui'
import { cn, todayISO } from '@/shared/lib/utils'
import { Reveal, Stagger } from '@/shared/motion'
import { collabPath } from '../paths'
import { ThemeIcon } from '../components/ThemeBadge'
import { LEITNER_INTERVALS, dueCards, useProgress } from '../store/progress'

const BOX_LABELS = ['Nouvelles', 'Boîte 1', 'Boîte 2', 'Boîte 3', 'Boîte 4', 'Boîte 5']

export default function FlashcardsPage() {
  const cards = useProgress((s) => s.cards)
  const { review, fresh } = dueCards(cards)
  const sessionSize = Math.min(12, review.length + fresh.length)
  const today = todayISO()
  const boxes = [0, 1, 2, 3, 4, 5].map(
    (b) => FLASHCARDS.filter((c) => (cards[c.id]?.box ?? 0) === b).length,
  )
  const mastered = boxes[4] + boxes[5]

  return (
    <div>
      <PageHeader
        eyebrow="Flashcards"
        title="Ancrer les bons réflexes"
        description="La répétition espacée fait revenir chaque carte juste avant que vous ne l’oubliiez. Quelques minutes par jour suffisent."
      />

      <div className="mb-6 grid gap-6 lg:grid-cols-3">
        <Card className="relative overflow-hidden border-0 border-l-4 border-l-primary bg-inverse text-inverse-foreground lg:col-span-2">
          <CardContent className="relative flex flex-col gap-5 p-6 sm:flex-row sm:items-center">
            <div className="flex-1">
              <div className="mb-1 text-xs font-semibold tracking-[0.12em] text-inverse-foreground/70 uppercase">
                Révision du jour
              </div>
              <div className="mb-2 text-4xl font-bold tabular-nums">
                {review.length}{' '}
                <span className="text-lg font-medium text-inverse-foreground/70">
                  cartes à réviser
                </span>
              </div>
              <p className="mb-4 max-w-md text-sm text-inverse-foreground/80">
                {sessionSize
                  ? `+ ${fresh.length} nouvelles à découvrir. Session de ${sessionSize} cartes, environ ${Math.max(1, Math.round(sessionSize * 0.25))} min. Les cartes « À revoir » reviennent dans la session.`
                  : 'Vos révisions sont à jour. Vous pouvez vous entraîner librement sur un paquet.'}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button asChild size="lg">
                  <Link to={collabPath('flashcards/session')}>
                    <Play className="fill-current" /> Commencer
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-white/30 bg-transparent text-inverse-foreground hover:bg-white/10"
                >
                  <Link to={collabPath('flashcards/session?mode=all')}>
                    <Repeat /> Mode libre
                  </Link>
                </Button>
              </div>
            </div>
            <motion.div
              aria-hidden
              className="hidden sm:block"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Layers className="size-28 text-inverse-foreground/15" strokeWidth={1} />
            </motion.div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="size-5 text-primary" /> Mes boîtes de Leitner
            </CardTitle>
            <CardDescription>
              {mastered} carte{mastered > 1 ? 's' : ''} ancrée{mastered > 1 ? 's' : ''} sur{' '}
              {FLASHCARDS.length}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-28 items-end gap-2">
              {boxes.map((n, b) => (
                <div
                  key={b}
                  className="flex h-full flex-1 flex-col items-center justify-end gap-1"
                  title={`${BOX_LABELS[b]} : ${n} carte(s)`}
                >
                  <span className="text-xs font-bold tabular-nums">{n}</span>
                  <motion.div
                    className={cn(
                      'w-full rounded-t-[4px]',
                      b === 0 ? 'bg-muted-foreground/30' : 'bg-xp',
                    )}
                    style={{ opacity: b === 0 ? 1 : 0.35 + b * 0.13 }}
                    initial={{ height: '0%' }}
                    animate={{
                      height: `${Math.min(100, Math.max(4, (n / FLASHCARDS.length) * 220))}%`,
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 140,
                      damping: 16,
                      delay: 0.2 + b * 0.06,
                    }}
                  />
                  <span className="text-[10px] font-semibold text-muted-foreground">
                    {b === 0 ? 'New' : `B${b}`}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Une carte réussie monte d’une boîte et revient plus tard (
              {LEITNER_INTERVALS.slice(1).join(', ')} jours). Une carte ratée revient en boîte 1.
            </p>
          </CardContent>
        </Card>
      </div>

      <h2 className="mb-3 text-lg font-bold">Paquets par thématique</h2>
      <Stagger className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" stagger={0.05} delay={0.15}>
        {THEMES.map((t) => {
          const deck = FLASHCARDS.filter((c) => c.themeId === t.id)
          const deckDue = deck.filter((c) => !cards[c.id] || cards[c.id].due <= today).length
          const solid = deck.filter((c) => (cards[c.id]?.box ?? 0) >= 3).length
          return (
            <Reveal key={t.id} whileHover={{ y: -4 }}>
              <Card className="group overflow-hidden transition-shadow hover:shadow-md">
                <div className="flex items-center gap-3 border-b p-4">
                  <ThemeIcon themeId={t.id} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold">{t.title}</div>
                    <div className="text-xs text-muted-foreground">{deck.length} cartes</div>
                  </div>
                  {deckDue > 0 && <Badge>{deckDue} à voir</Badge>}
                </div>
                <CardContent className="p-4">
                  <div className="mb-1 flex justify-between text-xs font-semibold text-muted-foreground">
                    <span>Ancrage</span>
                    <span className="tabular-nums">
                      {solid}/{deck.length}
                    </span>
                  </div>
                  <Progress value={(solid / deck.length) * 100} className="mb-4" />
                  <div className="flex gap-2">
                    <Button asChild size="sm" className="flex-1">
                      <Link to={collabPath(`flashcards/session?theme=${t.id}`)}>
                        <Sparkles /> Réviser
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline">
                      <Link to={collabPath(`flashcards/session?theme=${t.id}&mode=all`)}>
                        Tout le paquet
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Reveal>
          )
        })}
      </Stagger>
    </div>
  )
}
