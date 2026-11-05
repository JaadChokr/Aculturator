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
import { useCatalog } from '@acculturator/shared/catalog'
import { THEMES } from '@acculturator/shared/content'
import { PageHeader } from '@acculturator/shared/components'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@acculturator/shared/ui'
import { cn, todayISO } from '@acculturator/shared/lib'
import { Reveal, Stagger, spring } from '@acculturator/shared/motion'
import { collabPath } from '../paths'
import { ThemeIcon } from '../components/ThemeBadge'
import { themeMastery } from '../store/insights'
import { useProgress } from '../store/progress'

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

  return (
    <div>
      <PageHeader
        eyebrow="Quiz & défis"
        title="S’entraîner, se défier, progresser"
        description="Chaque réponse est corrigée et expliquée immédiatement. Ici, se tromper fait partie de l’apprentissage !"
      />

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
          to={collabPath('quiz/jouer?mode=chrono')}
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
          to={collabPath('quiz/jouer?mode=entrainement')}
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
                to={collabPath(`quiz/jouer?mode=entrainement&theme=${t.id}`)}
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
