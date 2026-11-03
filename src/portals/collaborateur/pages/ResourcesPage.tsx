import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router'
import {
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  Clock,
  FileText,
  Headphones,
  Image as ImageIcon,
  Pause,
  Play,
  Search,
  SearchX,
  Video,
} from 'lucide-react'
import {
  RESOURCES,
  RESOURCE_BY_ID,
  RESOURCE_TYPE_LABEL,
  THEMES,
  getTheme,
  type Resource,
  type ResourceType,
  type ThemeId,
} from '@/shared/content'
import { PageHeader } from '@/shared/components/PageHeader'
import { PillarTags } from '@/shared/components/PillarTag'
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
} from '@/shared/ui'
import { cn } from '@/shared/lib/utils'
import { CheckQuestionBlock } from '../components/CheckQuestionBlock'
import { ThemeBadge } from '../components/ThemeBadge'
import { useProgress } from '../store/progress'

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
  const theme = getTheme(r.themeId)
  const Icon = TYPE_ICON[r.type]

  return (
    <Card className="group flex flex-col overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-lg">
      <button onClick={onOpen} className="relative block aspect-video w-full overflow-hidden text-left" aria-label={`Ouvrir ${r.title}`}>
        <div className={cn('absolute inset-0 bg-gradient-to-br', theme.tone.gradient)} />
        <div aria-hidden className="bg-grid absolute inset-0 text-white opacity-50" />
        <span aria-hidden className="absolute -right-4 -bottom-6 text-8xl opacity-30 transition-transform group-hover:scale-110">
          {theme.emoji}
        </span>
        <span className="absolute inset-0 grid place-items-center">
          <span className="grid size-14 place-items-center rounded-full bg-white/90 text-slate-900 shadow-lg transition-transform group-hover:scale-110">
            {r.type === 'video' || r.type === 'podcast' ? <Play className="ml-0.5 size-6 fill-current" /> : <Icon className="size-6" />}
          </span>
        </span>
        <span className="absolute top-3 left-3 flex gap-1.5">
          <Badge className="bg-black/40 text-white backdrop-blur">
            <Icon /> {RESOURCE_TYPE_LABEL[r.type]}
          </Badge>
          {r.mandatory && <Badge className="bg-red-600 text-white">Obligatoire</Badge>}
          {r.isNew && <Badge className="bg-amber-400 text-amber-950">Nouveau</Badge>}
        </span>
        <span className="absolute right-3 bottom-3 inline-flex items-center gap-1 rounded-md bg-black/50 px-2 py-0.5 text-xs font-semibold text-white">
          <Clock className="size-3" /> {r.durationMin} min
        </span>
        {viewed && (
          <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-xs font-bold text-emerald-700">
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
          <h3 className="leading-snug font-bold group-hover:text-primary">{r.title}</h3>
        </button>
        <p className="line-clamp-2 text-sm text-muted-foreground">{r.summary}</p>
      </div>
    </Card>
  )
}

/** Lecteur : utilise le média réel si `mediaUrl` est fourni, sinon une lecture simulée (démo). */
function MediaPlayer({ r, onComplete }: { r: Resource; onComplete: () => void }) {
  const [playing, setPlaying] = useState(false)
  const [pct, setPct] = useState(0)
  const done = useRef(false)
  const theme = getTheme(r.themeId)

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

  if (r.mediaUrl && r.type === 'video') {
    return <video src={r.mediaUrl} controls className="aspect-video w-full rounded-xl bg-black" onEnded={onComplete} />
  }

  const step = Math.min(r.keyPoints.length - 1, Math.floor((pct / 100) * r.keyPoints.length))
  return (
    <div className={cn('relative overflow-hidden rounded-xl bg-gradient-to-br text-white', theme.tone.gradient)}>
      <div aria-hidden className="bg-grid absolute inset-0 text-white opacity-40" />
      <div className="relative flex aspect-video flex-col justify-between p-5">
        <div className="text-xs font-bold tracking-wider uppercase opacity-80">
          {r.type === 'podcast' ? '🎧 Podcast' : '🎬 Vidéo'} · aperçu de démonstration
        </div>
        <p key={step} className="max-w-lg animate-pop text-lg leading-snug font-bold sm:text-xl">
          {pct === 0 ? r.summary : r.keyPoints[step]}
        </p>
        <div className="flex items-center gap-3">
          <Button
            size="icon"
            onClick={() => setPlaying((p) => !p)}
            className="rounded-full bg-white text-slate-900 hover:bg-white/90"
            aria-label={playing ? 'Pause' : 'Lecture'}
          >
            {playing ? <Pause className="fill-current" /> : <Play className="ml-0.5 fill-current" />}
          </Button>
          <Progress value={pct} className="h-1.5 flex-1 bg-white/25" indicatorClassName="bg-white" />
          <span className="text-xs font-semibold tabular-nums">{r.durationMin}:00</span>
        </div>
      </div>
    </div>
  )
}

function ResourceDialog({ r, onClose }: { r: Resource | null; onClose: () => void }) {
  const markViewed = useProgress((s) => s.markResourceViewed)
  const checkPassed = useProgress((s) => s.resourceCheckPassed)
  const viewed = useProgress((s) => (r ? s.viewedResources.includes(r.id) : false))
  const [unlocked, setUnlocked] = useState(false)
  const isMedia = r?.type === 'video' || r?.type === 'podcast'
  const showContent = viewed || unlocked || !isMedia

  return (
    <Dialog open={!!r} onOpenChange={(o) => !o && onClose()}>
      {r && (
        <DialogContent className="max-w-3xl">
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

          {isMedia && (
            <MediaPlayer
              r={r}
              onComplete={() => {
                setUnlocked(true)
                markViewed(r.id)
              }}
            />
          )}

          <div className={cn('transition-opacity', !showContent && 'pointer-events-none opacity-40 blur-[2px]')}>
            <h4 className="mb-2 text-sm font-bold">{isMedia ? 'À retenir' : 'L’essentiel'}</h4>
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
          {!showContent && <p className="-mt-2 text-center text-xs text-muted-foreground">Lancez la lecture pour débloquer le résumé.</p>}

          {!isMedia && !viewed && (
            <Button onClick={() => markViewed(r.id)} className="justify-self-start">
              <CheckCircle2 /> J’ai pris connaissance de cette fiche
            </Button>
          )}

          {r.check && (viewed || unlocked) && <CheckQuestionBlock key={r.id} check={r.check} onAnswered={(ok) => ok && checkPassed()} />}

          <PillarTags pillars={r.check ? ['attention', 'engagement', 'feedback'] : ['attention']} />
        </DialogContent>
      )}
    </Dialog>
  )
}

export default function ResourcesPage() {
  const [params, setParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const [theme, setTheme] = useState<ThemeId | 'all'>((params.get('theme') as ThemeId) ?? 'all')
  const [type, setType] = useState<TypeFilter>('all')
  const [unseenOnly, setUnseenOnly] = useState(false)
  const viewed = useProgress((s) => s.viewedResources)
  const bookmarks = useProgress((s) => s.bookmarks)

  const open = params.get('r') ? (RESOURCE_BY_ID[params.get('r')!] ?? null) : null
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
    return RESOURCES.filter(
      (r) =>
        (theme === 'all' || r.themeId === theme) &&
        (type === 'all' || (type === 'saved' ? bookmarks.includes(r.id) : r.type === type)) &&
        (!unseenOnly || !viewed.includes(r.id)) &&
        (!q || `${r.title} ${r.summary} ${r.keyPoints.join(' ')}`.toLowerCase().includes(q)),
    )
  }, [query, theme, type, unseenOnly, viewed, bookmarks])

  const pct = Math.round((viewed.length / RESOURCES.length) * 100)

  return (
    <div>
      <PageHeader
        eyebrow="Vidéos & ressources"
        title="Apprendre en quelques minutes"
        description="Des formats courts pour capter l’essentiel, suivis d’un check express pour vérifier que c’est acquis."
        actions={
          <div className="flex items-center gap-3 rounded-xl border bg-card px-4 py-2">
            <div className="text-right">
              <div className="text-xs font-semibold text-muted-foreground">Ressources consultées</div>
              <div className="font-extrabold tabular-nums">
                {viewed.length}/{RESOURCES.length}
              </div>
            </div>
            <Progress value={pct} className="w-24" />
          </div>
        }
      />

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher : extincteur, écran, stress…" className="pl-9" />
        </div>
        <Tabs value={type} onValueChange={(v) => setType(v as TypeFilter)} className="max-w-full overflow-x-auto">
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
            'rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors',
            theme === 'all' ? 'border-foreground bg-foreground text-background' : 'bg-card hover:bg-muted',
          )}
        >
          Toutes les thématiques
        </button>
        {THEMES.map((t) => (
          <button
            key={t.id}
            onClick={() => setTheme(t.id)}
            className={cn(
              'rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors',
              theme === t.id ? 'border-foreground bg-foreground text-background' : 'bg-card hover:bg-muted',
            )}
          >
            <span aria-hidden>{t.emoji}</span> {t.short}
          </button>
        ))}
        <label className="ml-auto inline-flex cursor-pointer items-center gap-2 text-sm font-semibold">
          <input type="checkbox" checked={unseenOnly} onChange={(e) => setUnseenOnly(e.target.checked)} className="size-4 accent-[var(--primary)]" />
          Non consultées uniquement
        </label>
      </div>

      {list.length ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((r) => (
            <ResourceCard key={r.id} r={r} onOpen={() => setOpen(r.id)} />
          ))}
        </div>
      ) : (
        <Card className="grid place-items-center gap-2 p-12 text-center">
          <SearchX className="size-10 text-muted-foreground" />
          <p className="font-bold">Aucune ressource ne correspond</p>
          <p className="text-sm text-muted-foreground">Essayez d’autres mots-clés ou retirez un filtre.</p>
        </Card>
      )}

      <ResourceDialog key={open?.id ?? 'none'} r={open} onClose={() => setOpen(null)} />
    </div>
  )
}
