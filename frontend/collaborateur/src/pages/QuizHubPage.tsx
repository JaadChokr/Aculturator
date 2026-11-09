import { Link } from 'react-router'
import {
  ArrowRight,
  CalendarHeart,
  Check,
  Crosshair,
  Dumbbell,
  Heart,
  Timer,
  Zap,
} from 'lucide-react'
import type { Difficulty } from '@acculturator/contracts'
import { useCatalog } from '@acculturator/core/catalog'
import { DIFFICULTY_LEVELS } from '@acculturator/core/content'
import { THEMES } from '@acculturator/design-system/themes'
import { PageHeader } from '@acculturator/design-system/components'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@acculturator/design-system/ui'
import { cn, todayISO } from '@acculturator/design-system/lib'
import { Reveal, Stagger, spring } from '@acculturator/design-system/motion'
import { collabPath } from '../paths'
import { ThemeIcon } from '../components/ThemeBadge'
import { overallMastery, recommendedLevel, themeMastery } from '../store/insights'
import { useProgress } from '../store/progress'
import { useQuizPrefs } from '../store/quizPrefs'

/** Choix du niveau de difficulté (« tous niveaux » par défaut), avec le niveau conseillé. */
function LevelPicker({
  value,
  recommended,
  onChange,
}: {
  value: Difficulty | null
  recommended: Difficulty
  onChange: (level: Difficulty | null) => void
}) {
  const options: { value: Difficulty | null; label: string; hint: string }[] = [
    { value: null, label: 'Tous niveaux', hint: 'Un mélange de questions' },
    ...DIFFICULTY_LEVELS.map((l) => ({ value: l.value, label: l.label, hint: l.description })),
  ]
  return (
    <div
      role="radiogroup"
      aria-label="Niveau de difficulté"
      className="grid grid-cols-2 gap-1 rounded-md bg-muted p-1 sm:grid-cols-4"
    >
      {options.map((o) => {
        const active = value === o.value
        return (
          <button
            key={o.label}
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            title={o.hint}
            className={cn(
              'flex flex-col items-center gap-0.5 rounded-sm px-3 py-2 text-sm font-semibold transition-colors',
              active
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <span className="flex items-center gap-1.5">
              {o.label}
              {o.value && (
                <span aria-hidden className="text-[10px] tracking-tight text-primary">
                  {'●'.repeat(o.value)}
                  <span className="text-muted-foreground/50">{'●'.repeat(3 - o.value)}</span>
                </span>
              )}
            </span>
            <span className="text-[11px] font-medium text-muted-foreground">
              {o.value === recommended ? 'Conseillé pour vous' : o.hint}
            </span>
          </button>
        )
      })}
    </div>
  )
}

function ModeCard({
  title,
  description,
  icon: Icon,
  featured,
  meta,
  to,
  cta,
  done,
}: {
  title: string
  description: string
  icon: typeof Zap
  featured?: boolean
  meta: React.ReactNode
  to: string
  cta: string
  done?: boolean
}) {
  return (
    <Reveal className="h-full" whileHover={{ y: -3, transition: spring }}>
      <Card
        className={cn(
          'group flex h-full flex-col overflow-hidden transition-shadow hover:shadow-md',
          featured && 'border-primary/40',
        )}
      >
        <div
          className={cn(
            'relative flex items-center gap-3 border-b p-5',
            featured ? 'bg-primary text-primary-foreground' : 'bg-muted/50',
          )}
        >
          <span
            className={cn(
              'grid size-10 shrink-0 place-items-center rounded-md',
              featured ? 'bg-white/15' : 'bg-primary text-primary-foreground',
            )}
          >
            <Icon className="size-5" />
          </span>
          <h3 className="text-lg font-semibold">{title}</h3>
          {done && (
            <Badge className="ml-auto bg-white text-success">
              <Check /> Fait
            </Badge>
          )}
        </div>
        <CardContent className="flex flex-1 flex-col gap-3 p-5">
          <p className="text-sm text-muted-foreground">{description}</p>
          <div className="flex flex-wrap gap-2 text-xs font-semibold">{meta}</div>
          <Button asChild className="mt-auto">
            <Link to={to}>
              {cta} <ArrowRight />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </Reveal>
  )
}

export default function QuizHubPage() {
  const scene = useCatalog().hazardScenes[0]
  const s = useProgress()
  const dailyDone = s.quizHistory.some((q) => q.mode === 'defi-du-jour' && q.date === todayISO())
  const hazardsFound = s.hazardsFound[scene.id]?.length ?? 0
  const catalog = useCatalog()
  const level = useQuizPrefs((p) => p.level)
  const setLevel = useQuizPrefs((p) => p.setLevel)
  const recommended = recommendedLevel(
    overallMastery(s, {
      themes: THEMES.length,
      resources: catalog.resources.length,
      flashcards: catalog.flashcards.length,
    }),
  )
  const lvl = level ? `&niveau=${level}` : ''

  return (
    <div>
      <PageHeader
        eyebrow="Quiz & défis"
        title="S’entraîner, se défier, progresser"
        description="Chaque réponse est corrigée et expliquée immédiatement. Ici, se tromper fait partie de l’apprentissage !"
      />

      <Card className="mb-6">
        <CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-md">
            <h2 className="font-semibold">Niveau de difficulté</h2>
            <p className="text-sm text-muted-foreground">
              Pour le défi chrono et l’entraînement. Le défi du jour, lui, s’adapte à vos
              thématiques à renforcer.
            </p>
          </div>
          <LevelPicker value={level} recommended={recommended} onChange={setLevel} />
        </CardContent>
      </Card>

      <Stagger className="mb-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4" stagger={0.08}>
        <ModeCard
          title="Défi du jour"
          description="5 questions choisies sur vos thématiques à renforcer. XP doublée !"
          icon={CalendarHeart}
          featured
          meta={
            <>
              <Badge variant="accent">×2 XP</Badge>
              <Badge variant="secondary">5 questions</Badge>
            </>
          }
          to={collabPath('quiz/jouer?mode=defi-du-jour')}
          cta={dailyDone ? 'Rejouer' : 'Relever le défi'}
          done={dailyDone}
        />
        <ModeCard
          title="Défi chrono"
          description="15 secondes par question, 3 vies, des combos pour multiplier les points. Prêt·e ?"
          icon={Timer}
          meta={
            <>
              <Badge variant="destructive">
                <Heart className="fill-current" /> 3 vies
              </Badge>
              <Badge variant="secondary">Record : {s.bestChrono}</Badge>
            </>
          }
          to={collabPath(`quiz/jouer?mode=chrono${lvl}`)}
          cta="Lancer le chrono"
        />
        <ModeCard
          title="Chasse aux risques"
          description="Une scène de bureau, six dangers cachés. Ouvrez l’œil et cliquez sur chaque situation à risque."
          icon={Crosshair}
          meta={
            <>
              <Badge variant="secondary">
                {hazardsFound}/{scene.hazards.length} trouvés
              </Badge>
              <Badge variant="accent">Nouveau</Badge>
            </>
          }
          to={collabPath('quiz/chasse-aux-risques')}
          cta="Commencer la chasse"
        />
        <ModeCard
          title="Entraînement libre"
          description="Sans chrono ni pression : choisissez une thématique et apprenez de chaque explication."
          icon={Dumbbell}
          meta={<Badge variant="secondary">8 questions · sans limite de temps</Badge>}
          to={collabPath(`quiz/jouer?mode=entrainement${lvl}`)}
          cta="Toutes thématiques"
        />
      </Stagger>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Dumbbell className="size-5 text-primary" /> S’entraîner par thématique
          </CardTitle>
          <CardDescription>Le pourcentage indique votre maîtrise actuelle.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {THEMES.map((t) => {
            const m = themeMastery(s, t.id)
            return (
              <Link
                key={t.id}
                to={collabPath(`quiz/jouer?mode=entrainement&theme=${t.id}${lvl}`)}
                className="group flex items-center gap-3 rounded-md border p-3 transition-colors hover:border-primary/40 hover:bg-muted/40"
              >
                <ThemeIcon themeId={t.id} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{t.title}</span>
                  <span className="mt-1 flex items-center gap-2">
                    <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                      <span
                        className="block h-full rounded-full bg-primary"
                        style={{ width: `${m}%` }}
                      />
                    </span>
                    <span className="text-xs font-bold tabular-nums">{m}%</span>
                  </span>
                </span>
                <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </Link>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
