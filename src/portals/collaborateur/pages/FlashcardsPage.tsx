import { Link } from 'react-router'
import { Layers, Play, Repeat, Sparkles } from 'lucide-react'
import { FLASHCARDS, THEMES } from '@/shared/content'
import { PageHeader } from '@/shared/components/PageHeader'
import { PillarTags } from '@/shared/components/PillarTag'
import { Mascot } from '@/shared/components/Mascot'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Progress } from '@/shared/ui'
import { cn, todayISO } from '@/shared/lib/utils'
import { collabPath } from '../paths'
import { LEITNER_INTERVALS, dueCards, useProgress } from '../store/progress'

const BOX_LABELS = ['Nouvelles', 'Boîte 1', 'Boîte 2', 'Boîte 3', 'Boîte 4', 'Boîte 5']

export default function FlashcardsPage() {
  const cards = useProgress((s) => s.cards)
  const { review, fresh } = dueCards(cards)
  const sessionSize = Math.min(12, review.length + fresh.length)
  const today = todayISO()
  const boxes = [0, 1, 2, 3, 4, 5].map((b) => FLASHCARDS.filter((c) => (cards[c.id]?.box ?? 0) === b).length)
  const mastered = boxes[4] + boxes[5]

  return (
    <div>
      <PageHeader
        eyebrow="Flashcards"
        title="Ancrer les bons réflexes"
        description="La répétition espacée fait revenir chaque carte juste avant que vous ne l’oubliiez. Quelques minutes par jour suffisent."
      />

      <div className="mb-6 grid gap-6 lg:grid-cols-3">
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-violet-600 to-indigo-800 text-white lg:col-span-2">
          <div aria-hidden className="bg-grid absolute inset-0 text-white opacity-40" />
          <CardContent className="relative flex flex-col gap-5 p-6 sm:flex-row sm:items-center">
            <div className="flex-1">
              <div className="mb-1 text-sm font-semibold text-violet-200">Révision du jour</div>
              <div className="mb-2 text-4xl font-extrabold tabular-nums">
                {review.length} <span className="text-xl font-bold text-violet-200">cartes à réviser</span>
              </div>
              <p className="mb-4 max-w-md text-sm text-violet-100">
                {sessionSize
                  ? `+ ${fresh.length} nouvelles à découvrir. Session de ${sessionSize} cartes, environ ${Math.max(1, Math.round(sessionSize * 0.25))} min. Les cartes « À revoir » reviennent dans la session.`
                  : 'Tout est à jour, bravo ! Vous pouvez tout de même vous entraîner sur un paquet.'}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button asChild variant="accent" size="lg">
                  <Link to={collabPath('flashcards/session')}>
                    <Play className="fill-current" /> Commencer
                  </Link>
                </Button>
                <Button asChild size="lg" variant="ghost" className="text-white hover:bg-white/10">
                  <Link to={collabPath('flashcards/session?mode=all')}>
                    <Repeat /> Mode libre
                  </Link>
                </Button>
              </div>
            </div>
            <Mascot mood="happy" className="hidden size-28 animate-float sm:block" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="size-5 text-primary" /> Mes boîtes de Leitner
            </CardTitle>
            <CardDescription>
              {mastered} carte{mastered > 1 ? 's' : ''} ancrée{mastered > 1 ? 's' : ''} sur {FLASHCARDS.length}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-28 items-end gap-2">
              {boxes.map((n, b) => (
                <div key={b} className="flex h-full flex-1 flex-col items-center justify-end gap-1" title={`${BOX_LABELS[b]} : ${n} carte(s)`}>
                  <span className="text-xs font-bold tabular-nums">{n}</span>
                  <div
                    className={cn('w-full rounded-t-[4px]', b === 0 ? 'bg-muted-foreground/30' : 'bg-xp')}
                    style={{ height: `${Math.min(100, Math.max(4, (n / FLASHCARDS.length) * 220))}%`, opacity: b === 0 ? 1 : 0.35 + b * 0.13 }}
                  />
                  <span className="text-[10px] font-semibold text-muted-foreground">{b === 0 ? 'New' : `B${b}`}</span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Une carte réussie monte d’une boîte et revient plus tard ({LEITNER_INTERVALS.slice(1).join(', ')} jours). Une carte ratée revient en boîte 1.
            </p>
          </CardContent>
        </Card>
      </div>

      <h2 className="mb-3 text-lg font-extrabold">Paquets par thématique</h2>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {THEMES.map((t) => {
          const deck = FLASHCARDS.filter((c) => c.themeId === t.id)
          const deckDue = deck.filter((c) => !cards[c.id] || cards[c.id].due <= today).length
          const solid = deck.filter((c) => (cards[c.id]?.box ?? 0) >= 3).length
          return (
            <Card key={t.id} className="group overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-md">
              <div className={cn('flex items-center gap-3 bg-gradient-to-r p-4 text-white', t.tone.gradient)}>
                <span className="text-3xl" aria-hidden>
                  {t.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-bold">{t.title}</div>
                  <div className="text-xs text-white/85">{deck.length} cartes</div>
                </div>
                {deckDue > 0 && <span className="rounded-full bg-white px-2 py-0.5 text-xs font-bold text-slate-900">{deckDue} à voir</span>}
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
                    <Link to={collabPath(`flashcards/session?theme=${t.id}&mode=all`)}>Tout le paquet</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <PillarTags pillars={['consolidation', 'engagement', 'feedback']} className="mt-6" />
    </div>
  )
}
