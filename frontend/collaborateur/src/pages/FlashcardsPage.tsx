import { motion } from 'motion/react'
import { Link } from 'react-router'
import { Layers, Play, Repeat, Sparkles } from 'lucide-react'
import { useCatalog } from '@acculturator/core/catalog'
import { PageHeader, Eyebrow } from '@acculturator/design-system/components'
import { Badge, Button, Card, CardContent, Progress } from '@acculturator/design-system/ui'
import { todayISO } from '@acculturator/design-system/lib'
import { Reveal, Stagger } from '@acculturator/design-system/motion'
import { collabPath } from '../paths'
import { ThemeIcon } from '../components/ThemeBadge'
import { dueCards, useProgress } from '../store/progress'

export default function FlashcardsPage() {
  const { flashcards, themes } = useCatalog()
  const cards = useProgress((s) => s.cards)
  const { review, fresh } = dueCards(cards)
  const sessionSize = Math.min(12, review.length + fresh.length)
  const today = todayISO()
  // Cartes ancrées : même seuil que la barre « Ancrage » des paquets et le tableau de bord
  const anchored = flashcards.filter((c) => (cards[c.id]?.box ?? 0) >= 3).length

  return (
    <div>
      <PageHeader
        eyebrow="Flashcards"
        title="Ancrer les bons réflexes"
        description="La répétition espacée fait revenir chaque carte juste avant que vous ne l’oubliiez. Quelques minutes par jour suffisent."
      />

      <div className="mb-6">
        <Card className="relative overflow-hidden border-0 border-l-4 border-l-primary bg-inverse text-inverse-foreground">
          <CardContent className="relative flex flex-col gap-5 p-6 sm:flex-row sm:items-center">
            <div className="flex-1">
              <Eyebrow as="div" tone="on-inverse" className="mb-1">
                Révision du jour
              </Eyebrow>
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
              <p className="mt-4 text-sm text-inverse-foreground/70">
                <span className="font-semibold text-inverse-foreground tabular-nums">
                  {anchored} / {flashcards.length}
                </span>{' '}
                cartes ancrées au total
              </p>
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
      </div>

      <h2 className="mb-3 text-lg font-bold">Paquets par thématique</h2>
      <Stagger
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
        stagger={0.05}
        delay={0.15}
      >
        {themes.map((t) => {
          const deck = flashcards.filter((c) => c.themeId === t.id)
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
