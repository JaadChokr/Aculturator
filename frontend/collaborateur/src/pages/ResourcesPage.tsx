import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useSearchParams } from 'react-router'
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  Check,
  CheckCircle2,
  Clock,
  FileText,
  Headphones,
  Image as ImageIcon,
  Maximize,
  Minimize,
  Pause,
  Play,
  Search,
  SearchX,
  Video,
} from 'lucide-react'
import type { Resource, ResourceType, ThemeId } from '@acculturator/contracts'
import { useCatalog, useTheme } from '@acculturator/core/catalog'
import { RESOURCE_TYPE_LABEL } from '@acculturator/core/content'
import { PageHeader } from '@acculturator/design-system/components'
import {
  Badge,
  Button,
  Card,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Input,
  Progress,
  Tabs,
  TabsList,
  TabsTrigger,
} from '@acculturator/design-system/ui'
import { cn } from '@acculturator/design-system/lib'
import { spring } from '@acculturator/design-system/motion'
import { CheckQuestionBlock } from '../components/CheckQuestionBlock'
import { ThemeBadge, ThemeGlyph } from '../components/ThemeBadge'
import { useProgress } from '../store/progress'
import { ModuleReturnLink } from '../components/ModuleReturnLink'
import { Eyebrow } from '@acculturator/design-system/components'

const TYPE_ICON: Record<ResourceType, typeof Video> = {
  video: Video,
  fiche: FileText,
  infographie: ImageIcon,
  podcast: Headphones,
}

type TypeFilter = ResourceType | 'all' | 'saved'

function ResourceCard({ r, onOpen }: { r: Resource; onOpen: () => void }) {
  const viewed = useProgress((s) => s.viewedResources.includes(r.id))
  const saved = useProgress((s) => s.bookmarks.includes(r.id))
  const toggleBookmark = useProgress((s) => s.toggleBookmark)
  const theme = useTheme(r.themeId)
  const Icon = TYPE_ICON[r.type]

  return (
    <Card className="group flex h-full flex-col overflow-hidden transition-shadow hover:shadow-md">
      <button
        onClick={onOpen}
        className="relative block aspect-video w-full overflow-hidden text-left"
        aria-label={`Ouvrir ${r.title}`}
      >
        <div className="absolute inset-0 bg-inverse" />
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-1 bg-primary" />
        <ThemeGlyph
          theme={theme}
          aria-hidden
          strokeWidth={1.25}
          className="absolute -right-3 -bottom-4 size-32 text-inverse-foreground/10 transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute inset-0 grid place-items-center">
          <span className="grid size-12 place-items-center rounded-full bg-primary text-primary-foreground shadow-md transition-transform group-hover:scale-105">
            {r.type === 'video' || r.type === 'podcast' ? (
              <Play className="ml-0.5 size-6 fill-current" />
            ) : (
              <Icon className="size-6" />
            )}
          </span>
        </span>
        <span className="absolute top-3 left-3 flex gap-1.5">
          <Badge className="bg-white/12 text-white">
            <Icon /> {RESOURCE_TYPE_LABEL[r.type]}
          </Badge>
          {r.mandatory && <Badge className="bg-primary text-primary-foreground">Obligatoire</Badge>}
          {r.isNew && <Badge className="bg-white text-inverse">Nouveau</Badge>}
        </span>
        <span className="absolute right-3 bottom-3 inline-flex items-center gap-1 rounded-sm bg-black/40 px-2 py-0.5 text-xs font-medium text-white">
          <Clock className="size-3" /> {r.durationMin} min
        </span>
        {viewed && (
          <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-sm bg-success px-2 py-0.5 text-xs font-semibold text-success-foreground">
            <CheckCircle2 className="size-3.5" /> Vu
          </span>
        )}
      </button>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <ThemeBadge themeId={r.themeId} />
          <Button
            variant="ghost"
            size="icon-sm"
            className="-mt-1 -mr-2"
            onClick={() => toggleBookmark(r.id)}
            aria-pressed={saved}
            aria-label={saved ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          >
            {saved ? <BookmarkCheck className="text-primary" /> : <Bookmark />}
          </Button>
        </div>
        <button onClick={onOpen} className="text-left">
          <h3 className="leading-snug font-semibold group-hover:text-primary">{r.title}</h3>
        </button>
        <p className="line-clamp-2 text-sm text-muted-foreground">{r.summary}</p>
      </div>
    </Card>
  )
}

/** Lecteur : utilise le média réel si `mediaUrl` est fourni, sinon une lecture simulée (démo). */
type FullscreenMode = 'none' | 'native' | 'fallback'

/**
 * Lecteur : utilise le média réel si `mediaUrl` est fourni, sinon une lecture simulée (démo).
 * Plein écran : API native du navigateur, avec repli sur une vue plein écran
 * (fenêtre modale pleine page) si le navigateur ou le cadre d'intégration le refuse.
 */
function MediaPlayer({ r, onComplete }: { r: Resource; onComplete: () => void }) {
  const [playing, setPlaying] = useState(false)
  const [pct, setPct] = useState(0)
  const [fs, setFs] = useState<FullscreenMode>('none')
  const done = useRef(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const theme = useTheme(r.themeId)

  useEffect(() => {
    if (!playing) return
    const id = setInterval(() => {
      setPct((p) => {
        const n = Math.min(100, p + 4)
        if (n >= 100) {
          setPlaying(false)
          if (!done.current) {
            done.current = true
            onComplete()
          }
        }
        return n
      })
    }, 120)
    return () => clearInterval(id)
  }, [playing, onComplete])

  // Sortie du plein écran natif (touche Échap, geste système…)
  useEffect(() => {
    const onChange = () => {
      if (!document.fullscreenElement) setFs((m) => (m === 'native' ? 'none' : m))
    }
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  const toggleFullscreen = () => {
    if (fs === 'native') {
      document.exitFullscreen?.().catch(() => setFs('none'))
      return
    }
    if (fs === 'fallback') return setFs('none')
    const el = containerRef.current
    if (el?.requestFullscreen) {
      el.requestFullscreen()
        .then(() => setFs('native'))
        .catch(() => setFs('fallback'))
    } else setFs('fallback')
  }

  if (r.mediaUrl && r.type === 'video') {
    // Le lecteur natif propose déjà son propre bouton plein écran
    return (
      <video
        src={r.mediaUrl}
        controls
        className="aspect-video w-full rounded-md bg-black"
        onEnded={onComplete}
      />
    )
  }

  const step = Math.min(r.keyPoints.length - 1, Math.floor((pct / 100) * r.keyPoints.length))
  const isFull = fs !== 'none'

  const screen = (big: boolean) => (
    <div
      className={cn(
        'relative overflow-hidden bg-inverse text-inverse-foreground',
        big ? 'flex h-full w-full items-center justify-center' : 'rounded-md',
      )}
      onDoubleClick={toggleFullscreen}
    >
      <ThemeGlyph
        theme={theme}
        aria-hidden
        strokeWidth={1}
        className={cn(
          'absolute text-inverse-foreground/[0.06]',
          big ? '-right-10 -bottom-16 size-[28rem]' : '-right-6 -bottom-8 size-56',
        )}
      />
      <div
        className={cn(
          'relative flex flex-col justify-between',
          big
            ? 'aspect-video max-h-full w-full max-w-[min(100%,calc(100dvh*16/9))] p-8 sm:p-12'
            : 'aspect-video p-5',
        )}
      >
        <Eyebrow as="div" tone="current" className="flex items-center gap-2 opacity-80">
          <span className="h-3 w-1 bg-primary" />
          {r.type === 'podcast' ? 'Podcast' : 'Vidéo'} · aperçu de démonstration
        </Eyebrow>
        <p
          key={step}
          className={cn(
            'animate-in leading-snug font-semibold fade-in',
            big ? 'max-w-4xl text-2xl sm:text-4xl' : 'max-w-lg text-lg sm:text-xl',
          )}
        >
          {pct === 0 ? r.summary : r.keyPoints[step]}
        </p>
        <div className="flex items-center gap-3">
          <Button
            size="icon"
            onClick={() => setPlaying((p) => !p)}
            className="rounded-full"
            aria-label={playing ? 'Pause' : 'Lecture'}
          >
            {playing ? (
              <Pause className="fill-current" />
            ) : (
              <Play className="ml-0.5 fill-current" />
            )}
          </Button>
          <Progress
            value={pct}
            className="h-1.5 flex-1 bg-white/25"
            indicatorClassName="bg-primary"
          />
          <span className="text-xs font-semibold tabular-nums">{r.durationMin}:00</span>
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={toggleFullscreen}
            className="text-inverse-foreground hover:bg-white/10 hover:text-inverse-foreground"
            aria-label={isFull ? 'Quitter le plein écran' : 'Plein écran'}
            title={isFull ? 'Quitter le plein écran' : 'Plein écran'}
          >
            {isFull ? <Minimize /> : <Maximize />}
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <div ref={containerRef} className={cn(fs === 'native' && 'bg-inverse')}>
        {screen(fs === 'native')}
      </div>
      {/* Repli : vue plein écran dans une fenêtre pleine page */}
      <Dialog open={fs === 'fallback'} onOpenChange={(o) => !o && setFs('none')}>
        <DialogContent className="top-0 left-0 h-dvh max-h-none w-screen max-w-none translate-x-0 translate-y-0 rounded-none border-0 bg-inverse p-0 text-inverse-foreground">
          <DialogTitle className="sr-only">{r.title} — plein écran</DialogTitle>
          <DialogDescription className="sr-only">
            Appuyez sur Échap pour quitter le plein écran.
          </DialogDescription>
          {screen(true)}
        </DialogContent>
      </Dialog>
    </>
  )
}

type StepId = 'watch' | 'read' | 'keypoints' | 'check'

/** Une ressource se parcourt par étapes : consulter, retenir l'essentiel, vérifier. */
function resourceSteps(r: Resource): StepId[] {
  const isMedia = r.type === 'video' || r.type === 'podcast'
  return [
    ...(isMedia ? (['watch', 'keypoints'] as const) : (['read'] as const)),
    ...(r.check ? (['check'] as const) : []),
  ]
}

const STEP_LABEL = (r: Resource): Record<StepId, string> => ({
  watch: r.type === 'podcast' ? 'Écouter' : 'Regarder',
  read: 'Lire',
  keypoints: 'À retenir',
  check: 'Check express',
})

function ResourceDialog({ r, onClose }: { r: Resource | null; onClose: () => void }) {
  return (
    <Dialog open={!!r} onOpenChange={(o) => !o && onClose()}>
      {r && (
        <DialogContent className="max-w-3xl">
          <ResourceSteps key={r.id} r={r} onClose={onClose} />
        </DialogContent>
      )}
    </Dialog>
  )
}

function ResourceSteps({ r, onClose }: { r: Resource; onClose: () => void }) {
  const markViewed = useProgress((s) => s.markResourceViewed)
  const checkPassed = useProgress((s) => s.resourceCheckPassed)
  const viewed = useProgress((s) => s.viewedResources.includes(r.id))
  const [unlocked, setUnlocked] = useState(false)
  const steps = resourceSteps(r)
  const labels = STEP_LABEL(r)
  const [index, setIndex] = useState(0)
  const step = steps[index]
  const last = index === steps.length - 1
  const nextLabel = last ? 'Terminer' : `Suivant : ${labels[steps[index + 1]]}`

  // Une vidéo ou un podcast doit être lu jusqu'au bout avant de passer à la suite
  const locked = step === 'watch' && !viewed && !unlocked

  const next = () => {
    if (step === 'read' && !viewed) markViewed(r.id)
    if (last) onClose()
    else setIndex((i) => i + 1)
  }

  return (
    <>
      <DialogHeader>
        <div className="flex flex-wrap items-center gap-2">
          <ThemeBadge themeId={r.themeId} />
          <Badge variant="secondary">
            <Clock /> {r.durationMin} min
          </Badge>
          {viewed && (
            <Badge variant="success">
              <CheckCircle2 /> Consulté
            </Badge>
          )}
        </div>
        <DialogTitle className="text-xl">{r.title}</DialogTitle>
        <DialogDescription>{r.summary}</DialogDescription>
      </DialogHeader>

      {steps.length > 1 && (
        <ol
          className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold"
          aria-label="Étapes"
        >
          {steps.map((s, i) => (
            <li key={s} className="flex items-center gap-2">
              {i > 0 && <span aria-hidden className="h-px w-4 bg-border sm:w-8" />}
              <span
                aria-current={i === index ? 'step' : undefined}
                className={cn(
                  'flex items-center gap-1.5',
                  i === index
                    ? 'text-primary'
                    : i < index
                      ? 'text-foreground'
                      : 'text-muted-foreground',
                )}
              >
                <span
                  className={cn(
                    'grid size-5 place-items-center rounded-full text-[11px]',
                    i === index
                      ? 'bg-primary text-primary-foreground'
                      : i < index
                        ? 'bg-success text-white'
                        : 'bg-muted text-muted-foreground',
                  )}
                >
                  {i < index ? <Check className="size-3" /> : i + 1}
                </span>
                {labels[s]}
              </span>
            </li>
          ))}
        </ol>
      )}

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.2 }}
          className="min-w-0"
        >
          {step === 'watch' && (
            <MediaPlayer
              r={r}
              onComplete={() => {
                setUnlocked(true)
                markViewed(r.id)
              }}
            />
          )}

          {(step === 'keypoints' || step === 'read') && (
            <div>
              <h4 className="mb-2 text-sm font-bold">
                {step === 'read' ? 'L’essentiel' : 'À retenir'}
              </h4>
              <ul className="flex flex-col gap-2">
                {r.keyPoints.map((k, i) => (
                  <li key={k} className="flex gap-3 rounded-lg bg-muted/60 p-3 text-sm">
                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                      {i + 1}
                    </span>
                    {k}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {step === 'check' && r.check && (
            <CheckQuestionBlock check={r.check} onAnswered={(ok) => ok && checkPassed()} />
          )}
        </motion.div>
      </AnimatePresence>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
        {index > 0 ? (
          <Button variant="ghost" onClick={() => setIndex((i) => i - 1)}>
            <ArrowLeft /> Précédent
          </Button>
        ) : (
          <span className="text-xs text-muted-foreground">
            {locked ? 'Terminez la lecture pour passer à la suite.' : ''}
          </span>
        )}
        <Button onClick={next} disabled={locked} className="ml-auto">
          {step === 'read' && !viewed ? (
            <>
              <CheckCircle2 /> J’ai pris connaissance de cette fiche
            </>
          ) : (
            <>
              {nextLabel} {!last && <ArrowRight />}
            </>
          )}
        </Button>
      </div>
    </>
  )
}

export default function ResourcesPage() {
  const { resources, themes } = useCatalog()
  const [params, setParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const [theme, setTheme] = useState<ThemeId | 'all'>((params.get('theme') as ThemeId) ?? 'all')
  const [type, setType] = useState<TypeFilter>('all')
  const [unseenOnly, setUnseenOnly] = useState(false)
  const viewed = useProgress((s) => s.viewedResources)
  const bookmarks = useProgress((s) => s.bookmarks)

  const open = params.get('r') ? (resources.find((r) => r.id === params.get('r')) ?? null) : null
  const setOpen = (id: string | null) =>
    setParams(
      (p) => {
        if (id) p.set('r', id)
        else p.delete('r')
        return p
      },
      { replace: true },
    )

  const list = useMemo(() => {
    const q = query.trim().toLowerCase()
    return resources.filter(
      (r) =>
        (theme === 'all' || r.themeId === theme) &&
        (type === 'all' || (type === 'saved' ? bookmarks.includes(r.id) : r.type === type)) &&
        (!unseenOnly || !viewed.includes(r.id)) &&
        (!q || `${r.title} ${r.summary} ${r.keyPoints.join(' ')}`.toLowerCase().includes(q)),
    )
  }, [resources, query, theme, type, unseenOnly, viewed, bookmarks])

  const pct = Math.round((viewed.length / resources.length) * 100)

  return (
    <div>
      <ModuleReturnLink />
      <PageHeader
        eyebrow="Vidéos & ressources"
        title="Apprendre en quelques minutes"
        description="Des formats courts pour capter l’essentiel, suivis d’un check express pour vérifier que c’est acquis."
        actions={
          <div className="w-full rounded-md border bg-card px-4 py-3 sm:w-64">
            <div className="mb-2 flex items-baseline justify-between gap-4">
              <span className="text-xs font-medium text-muted-foreground">
                Ressources consultées
              </span>
              <span className="text-sm font-bold tabular-nums">
                {viewed.length} / {resources.length}
              </span>
            </div>
            <Progress value={pct} className="h-1.5" />
          </div>
        }
      />

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher : extincteur, écran, stress…"
            className="pl-9"
          />
        </div>
        <Tabs
          value={type}
          onValueChange={(v) => setType(v as TypeFilter)}
          className="max-w-full overflow-x-auto"
        >
          <TabsList>
            <TabsTrigger value="all">Tout</TabsTrigger>
            <TabsTrigger value="video">
              <Video /> Vidéos
            </TabsTrigger>
            <TabsTrigger value="fiche">
              <FileText /> Fiches
            </TabsTrigger>
            <TabsTrigger value="infographie">
              <ImageIcon /> Infographies
            </TabsTrigger>
            <TabsTrigger value="podcast">
              <Headphones /> Podcasts
            </TabsTrigger>
            <TabsTrigger value="saved">
              <Bookmark /> Favoris
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setTheme('all')}
          className={cn(
            'relative rounded-md border bg-card px-3 py-1.5 text-sm font-medium transition-colors',
            theme === 'all' ? 'border-foreground text-background' : 'hover:bg-muted',
          )}
        >
          {theme === 'all' && (
            <motion.span
              layoutId="theme-chip"
              className="absolute inset-0 rounded-md bg-foreground"
              transition={spring}
            />
          )}
          <span className="relative">Toutes les thématiques</span>
        </button>
        {themes.map((t) => (
          <button
            key={t.id}
            onClick={() => setTheme(t.id)}
            className={cn(
              'relative rounded-md border bg-card px-3 py-1.5 text-sm font-medium transition-colors',
              theme === t.id ? 'border-foreground text-background' : 'hover:bg-muted',
            )}
          >
            {theme === t.id && (
              <motion.span
                layoutId="theme-chip"
                className="absolute inset-0 rounded-md bg-foreground"
                transition={spring}
              />
            )}
            <span className="relative">
              <ThemeGlyph theme={t} aria-hidden className="mr-1 inline size-3.5 align-[-2px]" />{' '}
              {t.short}
            </span>
          </button>
        ))}
        <label className="ml-auto inline-flex cursor-pointer items-center gap-2 text-sm font-semibold">
          <input
            type="checkbox"
            checked={unseenOnly}
            onChange={(e) => setUnseenOnly(e.target.checked)}
            className="size-4 accent-[var(--primary)]"
          />
          Non consultées uniquement
        </label>
      </div>

      {list.length ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          <AnimatePresence mode="popLayout" initial={false}>
            {list.map((r, i) => (
              <motion.div
                key={r.id}
                layout
                initial={{ opacity: 0, scale: 0.92, y: 12 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: 0,
                  transition: { ...spring, delay: Math.min(i, 8) * 0.03 },
                }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
                transition={spring}
              >
                <ResourceCard r={r} onOpen={() => setOpen(r.id)} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <Card className="grid place-items-center gap-2 p-12 text-center">
          <SearchX className="size-10 text-muted-foreground" />
          <p className="font-bold">Aucune ressource ne correspond</p>
          <p className="text-sm text-muted-foreground">
            Essayez d’autres mots-clés ou retirez un filtre.
          </p>
        </Card>
      )}

      <ResourceDialog key={open?.id ?? 'none'} r={open} onClose={() => setOpen(null)} />
    </div>
  )
}
