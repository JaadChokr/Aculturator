import { useState } from 'react'

const COLORS = ['#c8102e', '#e5484d', '#1f2328', '#9ca3af', '#ffffff', '#c8102e']

/** Petite pluie de confettis en CSS pur (respecte prefers-reduced-motion). */
function makePieces(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: 50 + (Math.random() - 0.5) * 20,
    dx: `${(Math.random() - 0.5) * 900}px`,
    dy: `${300 + Math.random() * 500}px`,
    rot: `${Math.random() * 720 - 360}deg`,
    delay: Math.random() * 0.25,
    color: COLORS[i % COLORS.length],
    w: 6 + Math.random() * 6,
  }))
}

export function Confetti({ count = 60 }: { count?: number }) {
  const [pieces] = useState(() => makePieces(count))
  return (
    <div aria-hidden className="pointer-events-none fixed inset-x-0 top-1/4 z-[70] h-0">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="absolute block animate-confetti rounded-sm"
          style={
            {
              left: `${p.left}%`,
              width: p.w,
              height: p.w * 0.45,
              background: p.color,
              animationDelay: `${p.delay}s`,
              '--dx': p.dx,
              '--dy': p.dy,
              '--rot': p.rot,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  )
}
