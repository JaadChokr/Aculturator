import { motion } from 'motion/react'
import { Link } from 'react-router'
import {
  ArrowRight,
  CalendarCheck,
  Check,
  Crosshair,
  Flame,
  Layers,
  Lightbulb,
  Medal,
  PlayCircle,
  Sparkles,
  Target,
} from 'lucide-react'
import { useAuth } from '@/app/auth/AuthProvider'
import { levelFromXp } from '@/shared/content'
import { ProgressRing } from '@/shared/components/ProgressRing'
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
import { addDays, cn, formatNumber, todayISO } from '@/shared/lib/utils'
import { AnimatedNumber, Reveal, Stagger, hoverLift } from '@/shared/motion'
import { collabPath } from '../paths'
import { BADGES } from '../store/badges'
import { allThemeMastery, nextSteps } from '../store/insights'
import { MISSIONS } from '../store/missions'
import { countDue, useProgress } from '../store/progress'

const TIPS = [
  'Les chutes de plain-pied (glissades, trébuchements) font partie des premières causes d’accidents du travail.',
  'Le 114 permet d’alerter les secours par SMS : utile si vous ne pouvez pas parler.',
  'Toutes les 20 minutes devant un écran, regardez au loin pendant 20 secondes.',
  'Un presqu’accident signalé, c’est peut-être un accident évité demain.',
  'On ne prend jamais l’ascenseur lors d’une évacuation incendie.',
  'Tout le monde peut utiliser un défibrillateur : il guide vocalement chaque étape.',
]

const TEAM = [
  { name: 'Inès R.', xp: 1240 },
  { name: 'Thomas G.', xp: 980 },
  { name: 'Léa M.', xp: 610 },
  { name: 'Hugo P.', xp: 455 },
]

function Hero() {
  const { user } = useAuth()
  const xp = useProgress((s) => s.xp)
  const streak = useProgress((s) => s.streak)
  const cards = useProgress((s) => s.cards)
  const { current, next, progress, toNext } = levelFromXp(xp)
  const due = countDue(cards)
  const hour = new Date().getHours()
  const hello = hour < 18 ? 'Bonjour' : 'Bonsoir'
  const LevelIcon = current.icon

  return (
    <Card className="overflow-hidden border-0 bg-primary text-primary-foreground shadow-md">
      <CardContent className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_340px] lg:items-center">
        <div className="min-w-0">
          <p className="mb-2 text-xs font-semibold tracking-[0.12em] text-primary-foreground/75 uppercase">
            Parcours Santé & Sécurité au travail
          </p>
          <h1 className="mb-2 text-2xl leading-tight font-bold text-balance sm:text-3xl">
            {hello} {user.firstName}
          </h1>
          <p className="mb-5 max-w-xl text-primary-foreground/85">
            {due > 0
              ? `${due} cartes sont à réviser aujourd’hui. Quelques minutes suffisent pour consolider vos réflexes de prévention.`
              : 'Vos révisions sont à jour. Poursuivez votre parcours avec une ressource ou un quiz.'}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              asChild
              size="lg"
              className="bg-white text-primary shadow-none hover:bg-white/90"
            >
              <Link to={collabPath('flashcards/session')}>
                Reprendre ma révision <ArrowRight />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/40 bg-transparent text-primary-foreground hover:bg-white/10"
            >
              <Link to={collabPath('ressources')}>Voir les ressources</Link>
            </Button>
          </div>
        </div>

        <div className="rounded-lg bg-card p-5 text-card-foreground shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-md bg-primary/10 text-primary">
              <LevelIcon className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium text-muted-foreground">
                Niveau {current.level}
              </div>
              <div className="font-semibold">{current.title}</div>
            </div>
            <div className="text-right">
              <div className="text-lg leading-none font-bold tabular-nums">
                <AnimatedNumber value={xp} />
              </div>
              <div className="text-xs text-muted-foreground">XP</div>
            </div>
          </div>
          <Progress value={progress} className="mb-2 h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{next ? `${toNext} XP avant « ${next.title} »` : 'Niveau maximum atteint'}</span>
          </div>
          <div className="mt-4 flex items-center gap-2 border-t pt-3 text-sm">
            <Flame className="size-4 text-streak" />
            <span>
              <span className="font-semibold tabular-nums">{streak.count} jours</span> d’activité
              consécutifs
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function StatTiles() {
  const s = useProgress()
  const due = countDue(s.cards)
  const missionsDone = s.missions.day === todayISO() ? s.missions.claimed.length : 0
  const badges = Object.keys(s.badges).length
  const mastery = Math.round(allThemeMastery(s).reduce((a, b) => a + b.mastery, 0) / 7)

  const tiles = [
    {
      label: 'Cartes à réviser',
      value: due,
      suffix: '',
      icon: Layers,
      to: 'flashcards',
      tone: 'text-primary bg-primary/8',
    },
    {
      label: 'Missions du jour',
      value: missionsDone,
      suffix: `/${MISSIONS.length}`,
      icon: Target,
      to: '',
      tone: 'text-primary bg-primary/8',
    },
    {
      label: 'Badges obtenus',
      value: badges,
      suffix: `/${BADGES.length}`,
      icon: Medal,
      to: 'trophees',
      tone: 'text-primary bg-primary/8',
    },
    {
      label: 'Maîtrise globale',
      value: mastery,
      suffix: ' %',
      icon: Sparkles,
      to: 'quiz',
      tone: 'text-primary bg-primary/8',
    },
  ]
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {tiles.map((t) => (
        <motion.div key={t.label} {...hoverLift}>
          <Link to={collabPath(t.to)} className="group block h-full">
            <Card className="h-full transition-shadow group-hover:shadow-md">
              <CardContent className="flex items-center gap-3 p-4">
                <span className={cn('grid size-10 shrink-0 place-items-center rounded-md', t.tone)}>
                  <t.icon className="size-5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-2xl leading-none font-bold tabular-nums">
                    <AnimatedNumber value={t.value} from={0} />
                    {t.suffix}
                  </span>
                  <span className="mt-1 block text-xs leading-tight font-medium text-muted-foreground">
                    {t.label}
                  </span>
                </span>
              </CardContent>
            </Card>
          </Link>
        </motion.div>
      ))}
    </div>
  )
}

function DailyMissions() {
  const missions = useProgress((s) => s.missions)
  const progress = missions.day === todayISO() ? missions.progress : {}
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarCheck className="size-5 text-success" /> Missions du jour
        </CardTitle>
        <CardDescription>+25 XP par mission accomplie. Renouvelées chaque jour.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {MISSIONS.map((m) => {
          const v = progress[m.id] ?? 0
          const done = v >= m.target
          return (
            <Link
              key={m.id}
              to={collabPath(m.to)}
              className={cn(
                'flex items-center gap-3 rounded-md border p-3 transition-colors hover:bg-muted/60',
                done && 'border-success/40 bg-success/5',
              )}
            >
              <span
                aria-hidden
                className={cn(
                  'grid size-9 shrink-0 place-items-center rounded-md',
                  done ? 'bg-success text-success-foreground' : 'bg-muted text-foreground',
                )}
              >
                {done ? <Check className="size-4" /> : <m.icon className="size-4" />}
              </span>
              <span className="min-w-0 flex-1">
                <span
                  className={cn(
                    'block text-sm font-semibold',
                    done && 'text-muted-foreground line-through',
                  )}
                >
                  {m.label}
                </span>
                <Progress
                  value={(v / m.target) * 100}
                  className="mt-1.5 h-1.5"
                  indicatorClassName={done ? 'bg-success' : undefined}
                />
              </span>
              <span className="text-xs font-bold text-muted-foreground tabular-nums">
                {v}/{m.target}
              </span>
            </Link>
          )
        })}
      </CardContent>
    </Card>
  )
}

const STEP_ICON = { review: Layers, watch: PlayCircle, practice: Target, hunt: Crosshair }

function NextSteps() {
  const s = useProgress()
  const steps = nextSteps(s, countDue(s.cards))
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recommandé pour vous</CardTitle>
        <CardDescription>Vos prochaines étapes, selon votre progression.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {steps.map((step, i) => {
          const Icon = STEP_ICON[step.kind]
          return (
            <Link
              key={step.id}
              to={collabPath(step.to)}
              className={cn(
                'group flex items-center gap-4 rounded-md border p-4 transition-colors hover:border-primary/40 hover:bg-muted/40',
                i === 0 && 'border-primary/30 bg-primary/[0.03]',
              )}
            >
              <span
                className={cn(
                  'grid size-10 shrink-0 place-items-center rounded-md',
                  i === 0 ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground',
                )}
              >
                <Icon className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2">
                  {step.mandatory && <Badge>Obligatoire</Badge>}
                  <span className="font-semibold">{step.title}</span>
                </span>
                <span className="block text-sm text-muted-foreground">{step.detail}</span>
              </span>
              <span className="hidden items-center gap-1 text-sm font-semibold text-primary sm:inline-flex">
                {step.cta}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          )
        })}
      </CardContent>
    </Card>
  )
}

function ThemesProgress() {
  const s = useProgress()
  const rows = allThemeMastery(s)
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <div>
          <CardTitle>Ma maîtrise par thématique</CardTitle>
          <CardDescription>Quiz, flashcards et ressources consultées.</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
        {rows.map(({ theme, mastery }) => (
          <Link
            key={theme.id}
            to={collabPath(`quiz/jouer?mode=entrainement&theme=${theme.id}`)}
            className="group flex items-center gap-3 rounded-md border p-3 transition-colors hover:border-primary/40 hover:bg-muted/40"
          >
            <ProgressRing
              value={mastery}
              size={52}
              stroke={5}
              indicatorClassName="stroke-primary"
              label={`Maîtrise ${theme.title}`}
            >
              <theme.icon className="size-5 text-foreground" strokeWidth={1.75} aria-hidden />
            </ProgressRing>
            <span className="min-w-0 flex-1">
              <span className="block text-sm leading-tight font-semibold">{theme.title}</span>
              <span className="text-xs text-muted-foreground">
                <span className="font-bold text-foreground tabular-nums">{mastery}%</span> maîtrisé
              </span>
            </span>
            <ArrowRight className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
          </Link>
        ))}
      </CardContent>
    </Card>
  )
}

function Activity() {
  const activity = useProgress((s) => s.activity)
  const today = todayISO()
  const days = Array.from({ length: 14 }, (_, i) => addDays(today, i - 13))
  const max = Math.max(50, ...days.map((d) => activity[d] ?? 0))
  const total = days.reduce((a, d) => a + (activity[d] ?? 0), 0)
  const fmt = new Intl.DateTimeFormat('fr-FR', { weekday: 'narrow' })
  const fmtLong = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  })
  return (
    <Card>
      <CardHeader>
        <CardTitle>XP gagnée — 14 derniers jours</CardTitle>
        <CardDescription>
          <span className="font-bold text-foreground tabular-nums">{formatNumber(total)} XP</span>{' '}
          sur la période · la régularité compte plus que l’intensité.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex h-32 items-end gap-1.5" role="list" aria-label="XP par jour">
          {days.map((d, i) => {
            const v = activity[d] ?? 0
            const align = i < 3 ? 'left-0' : i > 10 ? 'right-0' : 'left-1/2 -translate-x-1/2'
            return (
              <div
                key={d}
                role="listitem"
                className="group relative flex h-full flex-1 flex-col items-center justify-end gap-1"
              >
                <span
                  className={cn(
                    'pointer-events-none absolute -top-1 z-10 -translate-y-full rounded-md',
                    align,
                    ' bg-foreground px-2 py-1 text-[11px] font-semibold whitespace-nowrap text-background opacity-0 shadow transition-opacity group-hover:opacity-100',
                  )}
                >
                  {fmtLong.format(new Date(d))} : {v} XP
                </span>
                <motion.div
                  className={cn(
                    'w-full max-w-6 rounded-t-[4px] transition-colors',
                    v ? 'bg-primary group-hover:bg-primary/80' : 'bg-muted',
                  )}
                  initial={{ height: '0%' }}
                  animate={{ height: `${Math.max(4, (v / max) * 100)}%` }}
                  transition={{
                    type: 'spring',
                    stiffness: 140,
                    damping: 18,
                    delay: 0.3 + i * 0.035,
                  }}
                  aria-label={`${fmtLong.format(new Date(d))} : ${v} XP`}
                />
                <span
                  className={cn(
                    'text-[10px] font-semibold text-muted-foreground uppercase',
                    d === today && 'text-primary',
                  )}
                >
                  {fmt.format(new Date(d))}
                </span>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

function Leaderboard() {
  const { user } = useAuth()
  const xp = useProgress((s) => s.xp)
  const rows = [...TEAM, { name: `${user.firstName} ${user.lastName[0]}.`, xp, me: true }].sort(
    (a, b) => b.xp - a.xp,
  )
  return (
    <Card>
      <CardHeader>
        <CardTitle>Défi d’équipe · {user.team}</CardTitle>
        <CardDescription>Classement de la semaine (participation volontaire).</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        {rows.map((r, i) => (
          <motion.div
            layout
            key={r.name}
            className={cn(
              'flex items-center gap-3 rounded-md px-2 py-1.5 text-sm',
              'me' in r && 'bg-primary/8 font-semibold text-primary',
            )}
          >
            <span
              className={cn(
                'grid size-6 place-items-center rounded-sm text-xs font-semibold tabular-nums',
                i === 0 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
              )}
            >
              {i + 1}
            </span>
            <span className="flex-1 truncate">
              {r.name}
              {'me' in r && ' (vous)'}
            </span>
            <span className="font-semibold tabular-nums">{formatNumber(r.xp)} XP</span>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  )
}

function DidYouKnow() {
  const tip = TIPS[new Date().getDate() % TIPS.length]
  return (
    <Card className="border-l-4 border-l-primary">
      <CardContent className="flex gap-3 p-5">
        <Lightbulb className="mt-0.5 size-5 shrink-0 text-primary" />
        <div>
          <div className="mb-1 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            Repère prévention
          </div>
          <p className="text-sm font-medium">{tip}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  return (
    <Stagger className="flex flex-col gap-6" stagger={0.07}>
      <Reveal>
        <Hero />
      </Reveal>
      <Reveal>
        <StatTiles />
      </Reveal>
      <div className="grid gap-6 lg:grid-cols-3">
        <Stagger className="flex flex-col gap-6 lg:col-span-2" stagger={0.08} delay={0.15}>
          <Reveal>
            <NextSteps />
          </Reveal>
          <Reveal>
            <ThemesProgress />
          </Reveal>
          <Reveal>
            <Activity />
          </Reveal>
        </Stagger>
        <Stagger className="flex flex-col gap-6" stagger={0.08} delay={0.25}>
          <Reveal>
            <DailyMissions />
          </Reveal>
          <Reveal>
            <Leaderboard />
          </Reveal>
          <Reveal>
            <DidYouKnow />
          </Reveal>
        </Stagger>
      </div>
    </Stagger>
  )
}
