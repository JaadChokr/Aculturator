import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { ArrowLeft, Clock, Crosshair, Lightbulb, RotateCcw, Target } from 'lucide-react'
import { DECOY_SPOTS, HAZARD_SCENES, XP } from '@/shared/content'
import { Confetti } from '@/shared/components/Confetti'
import { Mascot } from '@/shared/components/Mascot'
import { PillarTags } from '@/shared/components/PillarTag'
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Progress } from '@/shared/ui'
import { cn } from '@/shared/lib/utils'
import { collabPath } from '../paths'
import { OfficeScene } from '../components/OfficeScene'
import { ThemeBadge } from '../components/ThemeBadge'
import { useProgress } from '../store/progress'

const scene = HAZARD_SCENES[0]

interface Miss {
  id: number
  x: number
  y: number
  text?: string
}

export default function HazardHuntPage() {
  const svgRef = useRef<SVGSVGElement>(null)
  const recordHazard = useProgress((s) => s.recordHazard)
  const recordQuiz = useProgress((s) => s.recordQuiz)
  const addXp = useProgress((s) => s.addXp)

  const [found, setFound] = useState<string[]>([])
  const [last, setLast] = useState<string | null>(null)
  const [misses, setMisses] = useState<Miss[]>([])
  const [missCount, setMissCount] = useState(0)
  const [hintId, setHintId] = useState<string | null>(null)
  const [hintsUsed, setHintsUsed] = useState(0)
  const [seconds, setSeconds] = useState(0)
  const [message, setMessage] = useState<string | null>(null)
  const done = found.length === scene.hazards.length
  const saved = useRef(false)

  useEffect(() => {
    if (done) return
    const id = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(id)
  }, [done])

  useEffect(() => {
    if (!done || saved.current) return
    saved.current = true
    const bonus = Math.max(0, XP.hazardAllBonus - hintsUsed * 10 - missCount * 2)
    recordQuiz({ mode: 'chasse', score: found.length, total: scene.hazards.length, xp: bonus })
  }, [done, found.length, hintsUsed, missCount, recordQuiz])

  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current
    if (!svg || done) return
    const pt = svg.createSVGPoint()
    pt.x = e.clientX
    pt.y = e.clientY
    const p = pt.matrixTransform(svg.getScreenCTM()!.inverse())
    const hit = scene.hazards.find((h) => Math.hypot(h.x - p.x, h.y - p.y) <= h.r)
    if (hit) {
      if (found.includes(hit.id)) {
        setLast(hit.id)
        return
      }
      setFound((f) => [...f, hit.id])
      setLast(hit.id)
      setHintId(null)
      setMessage(null)
      recordHazard(scene.id, hit.id)
      addXp(XP.hazardFound, hit.label)
      return
    }
    const decoy = DECOY_SPOTS.find((d) => Math.hypot(d.x - p.x, d.y - p.y) <= d.r)
    const miss: Miss = { id: Date.now(), x: p.x, y: p.y }
    setMisses((m) => [...m.slice(-4), miss])
    setTimeout(() => setMisses((m) => m.filter((x) => x.id !== miss.id)), 900)
    if (decoy) {
      setMessage(`${decoy.label} — ${decoy.explanation}`)
    } else {
      setMissCount((c) => c + 1)
      setMessage('Rien de dangereux ici… regardez ailleurs !')
    }
  }

  const showHint = () => {
    const remaining = scene.hazards.filter((h) => !found.includes(h.id))
    if (!remaining.length) return
    setHintId(remaining[0].id)
    setHintsUsed((n) => n + 1)
    setTimeout(() => setHintId(null), 2500)
  }

  const restart = () => {
    saved.current = false
    setFound([])
    setLast(null)
    setMissCount(0)
    setHintsUsed(0)
    setSeconds(0)
    setMessage(null)
  }

  const lastHazard = scene.hazards.find((h) => h.id === last)
  const hint = scene.hazards.find((h) => h.id === hintId)
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0')
  const ss = String(seconds % 60).padStart(2, '0')

  return (
    <div>
      {done && <Confetti count={80} />}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link to={collabPath('quiz')}>
            <ArrowLeft /> Quiz & défis
          </Link>
        </Button>
        <h1 className="flex items-center gap-2 text-xl font-extrabold sm:text-2xl">
          <Crosshair className="size-6 text-primary" /> Chasse aux risques
        </h1>
        <Badge variant="secondary" className="ml-auto">
          <Clock /> {mm}:{ss}
        </Badge>
        <Badge variant={done ? 'success' : 'default'}>
          <Target /> {found.length}/{scene.hazards.length}
        </Badge>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div>
          <Card className="overflow-hidden p-0">
            <div className="relative">
              <OfficeScene ref={svgRef} onClick={handleClick}>
                {scene.hazards
                  .filter((h) => found.includes(h.id))
                  .map((h) => (
                    <g key={h.id} className="pointer-events-none">
                      <circle cx={h.x} cy={h.y} r={h.r} fill="#22c55e" fillOpacity="0.12" stroke="#16a34a" strokeWidth="5" strokeDasharray="10 8" />
                      <circle cx={h.x + h.r * 0.7} cy={h.y - h.r * 0.7} r="20" fill="#16a34a" />
                      <text x={h.x + h.r * 0.7} y={h.y - h.r * 0.7 + 7} textAnchor="middle" fontSize="20" fontWeight="800" fill="#fff">
                        {found.indexOf(h.id) + 1}
                      </text>
                    </g>
                  ))}
                {hint && (
                  <circle cx={hint.x} cy={hint.y} r={hint.r + 30} fill="#facc15" fillOpacity="0.18" stroke="#eab308" strokeWidth="5" className="pointer-events-none animate-pulse" />
                )}
                {misses.map((m) => (
                  <g key={m.id} className="pointer-events-none animate-out fade-out duration-900" stroke="#ef4444" strokeWidth="6" strokeLinecap="round">
                    <path d={`M${m.x - 14} ${m.y - 14} L${m.x + 14} ${m.y + 14} M${m.x + 14} ${m.y - 14} L${m.x - 14} ${m.y + 14}`} />
                  </g>
                ))}
              </OfficeScene>
              {done && (
                <div className="absolute inset-0 grid place-items-center bg-black/40 p-4 backdrop-blur-[2px]">
                  <Card className="max-w-sm animate-pop text-center">
                    <CardContent className="p-6">
                      <Mascot mood="cheer" className="mx-auto mb-2 size-24" />
                      <h2 className="mb-1 text-2xl font-extrabold">Œil de lynx ! 🦉</h2>
                      <p className="mb-4 text-sm text-muted-foreground">
                        Les 6 dangers repérés en {mm}:{ss} avec {missCount} clic(s) dans le vide et {hintsUsed} indice(s).
                      </p>
                      <div className="flex justify-center gap-2">
                        <Button variant="outline" onClick={restart}>
                          <RotateCcw /> Rejouer
                        </Button>
                        <Button asChild>
                          <Link to={collabPath('quiz')}>Autres défis</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </Card>
          <div className="mt-3 flex min-h-12 flex-wrap items-center gap-3">
            <p className={cn('flex-1 text-sm', message ? 'font-semibold' : 'text-muted-foreground')} role="status">
              {message ?? scene.description}
            </p>
            <Button variant="outline" size="sm" onClick={showHint} disabled={done}>
              <Lightbulb /> Indice (−10 XP bonus)
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {lastHazard && (
            <Card key={lastHazard.id} className="animate-pop border-2 border-success/50 bg-success/5">
              <CardContent className="p-5">
                <div className="mb-2 flex items-center gap-2">
                  <Badge variant="success">Danger n°{found.indexOf(lastHazard.id) + 1}</Badge>
                  <ThemeBadge themeId={lastHazard.themeId} />
                </div>
                <h3 className="mb-1 font-extrabold">{lastHazard.label}</h3>
                <p className="text-sm text-muted-foreground">{lastHazard.explanation}</p>
              </CardContent>
            </Card>
          )}
          <Card>
            <CardHeader>
              <CardTitle>Dangers repérés</CardTitle>
              <CardDescription>+{XP.hazardFound} XP par danger, bonus si tout est trouvé sans indice.</CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={(found.length / scene.hazards.length) * 100} className="mb-4" indicatorClassName="bg-success" />
              <ol className="flex flex-col gap-2">
                {scene.hazards.map((h, i) => {
                  const f = found.includes(h.id)
                  return (
                    <li key={h.id}>
                      <button
                        disabled={!f}
                        onClick={() => setLast(h.id)}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-lg border p-2.5 text-left text-sm',
                          f ? 'hover:bg-muted' : 'border-dashed text-muted-foreground',
                        )}
                      >
                        <span
                          className={cn(
                            'grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold',
                            f ? 'bg-success text-success-foreground' : 'bg-muted',
                          )}
                        >
                          {f ? found.indexOf(h.id) + 1 : '?'}
                        </span>
                        <span className={cn('font-semibold', !f && 'italic')}>{f ? h.label : `Danger caché n°${i + 1}`}</span>
                      </button>
                    </li>
                  )
                })}
              </ol>
            </CardContent>
          </Card>
          <PillarTags pillars={['attention', 'engagement', 'feedback']} />
        </div>
      </div>
    </div>
  )
}
