import { useState } from 'react'
import { Flame, Layers, Lock, RotateCcw, Trophy, Zap } from 'lucide-react'
import { LEVELS, levelFromXp } from '@acculturator/shared/content'
import { PageHeader, ProgressRing } from '@acculturator/shared/components'
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@acculturator/shared/ui'
import { cn, formatNumber } from '@acculturator/shared/lib'
import { AnimatedNumber, Reveal, Stagger } from '@acculturator/shared/motion'
import { BADGES } from '../store/badges'
import { useProgress } from '../store/progress'

export default function TrophiesPage() {
  const s = useProgress()
  const [confirmReset, setConfirmReset] = useState(false)
  const { current, next, progress, toNext } = levelFromXp(s.xp)
  const reviews = Object.values(s.cards).reduce((a, c) => a + c.reviews, 0)
  const unlocked = BADGES.filter((b) => s.badges[b.id]).length

  const stats = [
    { label: 'XP totale', value: s.xp, suffix: '', icon: Zap, tone: 'text-xp bg-xp/10' },
    {
      label: 'Meilleure série',
      value: s.streak.best,
      suffix: ' j',
      icon: Flame,
      tone: 'text-streak bg-streak/12',
    },
    {
      label: 'Parties jouées',
      value: s.quizHistory.length,
      suffix: '',
      icon: Trophy,
      tone: 'text-primary bg-primary/10',
    },
    {
      label: 'Cartes révisées',
      value: reviews,
      suffix: '',
      icon: Layers,
      tone: 'text-success bg-success/12',
    },
  ]

  return (
    <div>
      <PageHeader
        eyebrow="Ma progression"
        title="Trophées & niveaux"
        description="Chaque action compte : regardez, révisez, jouez… et devenez ambassadeur·rice de la prévention."
        actions={
          confirmReset ? (
            <div className="flex items-center gap-2 text-sm">
              <span className="font-semibold">Effacer votre progression de démo ?</span>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => {
                  s.resetDemo()
                  setConfirmReset(false)
                }}
              >
                Réinitialiser
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setConfirmReset(false)}>
                Annuler
              </Button>
            </div>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => setConfirmReset(true)}>
              <RotateCcw /> Réinitialiser la démo
            </Button>
          )
        }
      />

      <div className="mb-6 grid gap-6 lg:grid-cols-3">
        <Card className="flex flex-col items-center justify-center gap-3 p-6 text-center">
          <ProgressRing
            value={progress}
            size={150}
            stroke={12}
            indicatorClassName="stroke-primary"
            label="Progression vers le niveau suivant"
          >
            <div>
              <current.icon
                className="mx-auto mb-1 size-8 text-primary"
                strokeWidth={1.75}
                aria-hidden
              />
              <div className="text-sm font-bold">Niveau {current.level}</div>
            </div>
          </ProgressRing>
          <div>
            <div className="text-xl font-bold">{current.title}</div>
            <div className="text-sm text-muted-foreground">
              {next ? `${toNext} XP avant « ${next.title} »` : 'Niveau maximum atteint'}
            </div>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Le parcours des niveaux</CardTitle>
            <CardDescription>
              Un palier = un nouveau statut… et la reconnaissance de votre engagement.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="relative flex flex-col gap-3 sm:flex-row sm:gap-0">
              {LEVELS.map((l, i) => {
                const reached = s.xp >= l.minXp
                const isCurrent = l.level === current.level
                return (
                  <li
                    key={l.level}
                    className="relative flex flex-1 items-center gap-3 sm:flex-col sm:text-center"
                  >
                    {i > 0 && (
                      <span
                        aria-hidden
                        className={cn(
                          'absolute top-6 right-1/2 hidden h-1 w-full -translate-y-1/2 sm:block',
                          reached ? 'bg-primary' : 'bg-border',
                        )}
                      />
                    )}
                    <span
                      className={cn(
                        'relative z-10 grid size-12 shrink-0 place-items-center rounded-full border-2',
                        reached
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-card text-muted-foreground',
                        isCurrent && 'ring-4 ring-primary/20',
                      )}
                    >
                      <l.icon className="size-5" strokeWidth={1.75} />
                    </span>
                    <span>
                      <span
                        className={cn(
                          'block text-sm font-semibold',
                          !reached && 'text-muted-foreground',
                        )}
                      >
                        {l.title}
                      </span>
                      <span className="block text-xs text-muted-foreground tabular-nums">
                        {formatNumber(l.minXp)} XP
                      </span>
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
              <span className={cn('grid size-11 place-items-center rounded-md', st.tone)}>
                <st.icon className="size-5" />
              </span>
              <span>
                <span className="block text-2xl leading-none font-bold tabular-nums">
                  <AnimatedNumber value={st.value} from={0} />
                  {st.suffix}
                </span>
                <span className="text-xs font-semibold text-muted-foreground">{st.label}</span>
              </span>
            </CardContent>
          </Card>
        ))}
      </div>

      <h2 className="mb-3 text-lg font-bold">
        Badges{' '}
        <span className="text-muted-foreground">
          · {unlocked}/{BADGES.length}
        </span>
      </h2>
      <Stagger
        className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5"
        stagger={0.05}
        delay={0.2}
      >
        {BADGES.map((b) => {
          const date = s.badges[b.id]
          return (
            <Reveal key={b.id} variant="pop" whileHover={date ? { y: -3 } : undefined}>
              <Card
                className={cn(
                  'relative flex h-full flex-col items-center gap-2 p-5 text-center transition-shadow',
                  date ? 'border-t-4 border-t-primary hover:shadow-md' : 'bg-muted/40',
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    'grid size-14 place-items-center rounded-full',
                    date ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground/60',
                  )}
                >
                  <b.icon className="size-7" strokeWidth={1.75} />
                </span>
                {!date && <Lock className="absolute top-3 right-3 size-4 text-muted-foreground" />}
                <span className={cn('font-semibold', !date && 'text-muted-foreground')}>
                  {b.name}
                </span>
                <span className="text-xs text-muted-foreground">{b.description}</span>
                {date && (
                  <span className="text-[11px] font-medium text-primary">
                    Obtenu le{' '}
                    {new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                  </span>
                )}
              </Card>
            </Reveal>
          )
        })}
      </Stagger>
    </div>
  )
}
