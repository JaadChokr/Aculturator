import { Flame, Layers, Lock, RotateCcw, Trophy, Zap } from 'lucide-react'
import { LEVELS, levelFromXp } from '@/shared/content'
import { PageHeader } from '@/shared/components/PageHeader'
import { ProgressRing } from '@/shared/components/ProgressRing'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui'
import { cn, formatNumber } from '@/shared/lib/utils'
import { BADGES } from '../store/badges'
import { useProgress } from '../store/progress'

export default function TrophiesPage() {
  const s = useProgress()
  const { current, next, progress, toNext } = levelFromXp(s.xp)
  const reviews = Object.values(s.cards).reduce((a, c) => a + c.reviews, 0)
  const unlocked = BADGES.filter((b) => s.badges[b.id]).length

  const stats = [
    { label: 'XP totale', value: formatNumber(s.xp), icon: Zap, tone: 'text-xp bg-xp/10' },
    { label: 'Meilleure série', value: `${s.streak.best} j`, icon: Flame, tone: 'text-streak bg-streak/12' },
    { label: 'Parties jouées', value: s.quizHistory.length, icon: Trophy, tone: 'text-primary bg-primary/10' },
    { label: 'Cartes révisées', value: reviews, icon: Layers, tone: 'text-success bg-success/12' },
  ]

  return (
    <div>
      <PageHeader
        eyebrow="Ma progression"
        title="Trophées & niveaux"
        description="Chaque action compte : regardez, révisez, jouez… et devenez ambassadeur·rice de la prévention."
        actions={
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (confirm('Réinitialiser les données de démonstration ?')) s.resetDemo()
            }}
          >
            <RotateCcw /> Réinitialiser la démo
          </Button>
        }
      />

      <div className="mb-6 grid gap-6 lg:grid-cols-3">
        <Card className="flex flex-col items-center justify-center gap-3 p-6 text-center">
          <ProgressRing value={progress} size={150} stroke={12} indicatorClassName="stroke-xp" label="Progression vers le niveau suivant">
            <div>
              <div className="text-4xl" aria-hidden>
                {current.emoji}
              </div>
              <div className="text-sm font-extrabold">Niveau {current.level}</div>
            </div>
          </ProgressRing>
          <div>
            <div className="text-xl font-extrabold">{current.title}</div>
            <div className="text-sm text-muted-foreground">{next ? `${toNext} XP avant « ${next.title} »` : 'Niveau maximum atteint 🎉'}</div>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Le parcours des niveaux</CardTitle>
            <CardDescription>Un palier = un nouveau statut… et la reconnaissance de votre engagement.</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="relative flex flex-col gap-3 sm:flex-row sm:gap-0">
              {LEVELS.map((l, i) => {
                const reached = s.xp >= l.minXp
                const isCurrent = l.level === current.level
                return (
                  <li key={l.level} className="relative flex flex-1 items-center gap-3 sm:flex-col sm:text-center">
                    {i > 0 && (
                      <span aria-hidden className={cn('absolute top-6 right-1/2 hidden h-1 w-full -translate-y-1/2 sm:block', reached ? 'bg-xp' : 'bg-muted')} />
                    )}
                    <span
                      className={cn(
                        'relative z-10 grid size-12 shrink-0 place-items-center rounded-full border-4 text-xl',
                        reached ? 'border-xp bg-card' : 'border-muted bg-muted grayscale',
                        isCurrent && 'ring-4 ring-xp/25',
                      )}
                    >
                      {l.emoji}
                    </span>
                    <span>
                      <span className={cn('block text-sm font-bold', !reached && 'text-muted-foreground')}>{l.title}</span>
                      <span className="block text-xs text-muted-foreground tabular-nums">{formatNumber(l.minXp)} XP</span>
                    </span>
                  </li>
                )
              })}
            </ol>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((st) => (
          <Card key={st.label}>
            <CardContent className="flex items-center gap-3 p-4">
              <span className={cn('grid size-11 place-items-center rounded-xl', st.tone)}>
                <st.icon className="size-5" />
              </span>
              <span>
                <span className="block text-2xl leading-none font-extrabold tabular-nums">{st.value}</span>
                <span className="text-xs font-semibold text-muted-foreground">{st.label}</span>
              </span>
            </CardContent>
          </Card>
        ))}
      </div>

      <h2 className="mb-3 text-lg font-extrabold">
        Badges <span className="text-muted-foreground">· {unlocked}/{BADGES.length}</span>
      </h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {BADGES.map((b) => {
          const date = s.badges[b.id]
          return (
            <Card
              key={b.id}
              className={cn(
                'relative flex flex-col items-center gap-2 p-5 text-center transition-all',
                date ? 'border-accent/60 bg-gradient-to-b from-accent/15 to-card hover:-translate-y-1 hover:shadow-lg' : 'opacity-70',
              )}
            >
              <span className={cn('text-5xl', !date && 'opacity-40 grayscale')} aria-hidden>
                {b.emoji}
              </span>
              {!date && <Lock className="absolute top-3 right-3 size-4 text-muted-foreground" />}
              <span className="font-bold">{b.name}</span>
              <span className="text-xs text-muted-foreground">{b.description}</span>
              {date && (
                <span className="text-[11px] font-semibold text-accent-foreground dark:text-accent">
                  Obtenu le {new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                </span>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
