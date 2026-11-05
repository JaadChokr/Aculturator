import { motion } from 'motion/react'
import { Link } from 'react-router'
import { Brain, Layers, Play, Repeat, Sparkles } from 'lucide-react'
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
import { dueCards, useProgress } from '../store/progress'

export default function FlashcardsPage() {
  const cards = useProgress((s) => s.cards)
  const { review, fresh } = dueCards(cards)
  const sessionSize = Math.min(12, review.length + fresh.length)
  const today = todayISO()
  // Mémorisation exprimée sans jargon : la mécanique de répétition reste interne.
  // « Ancrée » = même seuil que la barre « Ancrage » des paquets et le tableau de bord.
  const boxOf = (id: string): number => cards[id]?.box ?? 0
  const memory = [
    {
      id: 'new',
      label: 'À découvrir',
      hint: 'Pas encore vues',
      count: FLASHCARDS.filter((c) => boxOf(c.id) === 0).length,
      bar: 'bg-muted-foreground/35',
    },
    {
      id: 'learning',
      label: 'En cours d’apprentissage',
      hint: 'Elles reviendront bientôt pour se consolider',
      count: FLASHCARDS.filter((c) => boxOf(c.id) >= 1 && boxOf(c.id) <= 2).length,
      bar: 'bg-primary/40 dark:bg-primary/60',
    },
    {
      id: 'anchored',
      label: 'Ancrées',
      hint: 'Réussies plusieurs fois, à quelques jours d’intervalle',
      count: FLASHCARDS.filter((c) => boxOf(c.id) >= 3).length,
      bar: 'bg-primary',
    },
  ]

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
              <Brain className="size-5 text-primary" /> Ma mémorisation
            </CardTitle>
            <CardDescription>
              <span className="font-semibold text-foreground tabular-nums">
                {memory[2].count} / {FLASHCARDS.length}
              </span>{' '}
              cartes ancrées
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className="flex h-3 gap-0.5 overflow-hidden rounded-full bg-muted"
              role="img"
              aria-label={memory.map((m) => `${m.label} : ${m.count}`).join(', ')}
            >
              {[...memory]
                .reverse()
                .map((m, i) =>
                  m.count > 0 ? (
                    <motion.div
                      key={m.id}
                      className={m.bar}
                      initial={{ width: 0 }}
                      animate={{ width: `${(m.count / FLASHCARDS.length) * 100}%` }}
                      transition={{
                        type: 'spring',
                        stiffness: 120,
                        damping: 20,
                        delay: 0.2 + i * 0.08,
                      }}
                    />
                  ) : null,
                )}
            </div>
            <ul className="mt-4 flex flex-col gap-2.5">
              {[...memory].reverse().map((m) => (
                <li key={m.id} className="flex items-center gap-3 text-sm">
                  <span aria-hidden className={cn('size-2.5 shrink-0 rounded-full', m.bar)} />
                  <span className="flex-1">
                    <span className="font-medium">{m.label}</span>
                    <span className="block text-xs text-muted-foreground">{m.hint}</span>
                  </span>
                  <span className="font-semibold tabular-nums">{m.count}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <h2 className="mb-3 text-lg font-bold">Paquets par thématique</h2>
      <Stagger
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
        stagger={0.05}
        delay={0.15}
      >
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
