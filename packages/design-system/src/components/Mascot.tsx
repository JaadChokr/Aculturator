import { cn } from '../lib'

type Mood = 'happy' | 'thinking' | 'cheer' | 'oops'

/**
 * La mascotte de la plateforme : un bouclier casqué bienveillant. Elle prête son visage à
 * l'assistant de chaque parcours (`label` : son nom).
 */
export function Mascot({
  mood = 'happy',
  label = 'La mascotte',
  className,
}: {
  mood?: Mood
  label?: string
  className?: string
}) {
  return (
    <svg viewBox="0 0 120 130" className={cn('size-20', className)} role="img" aria-label={label}>
      <defs>
        <linearGradient id="prevBody" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#e03a45" />
          <stop offset="1" stopColor="#b0101c" />
        </linearGradient>
      </defs>
      {/* corps bouclier */}
      <path
        d="M60 22 L100 36 V68 C100 94 82 114 60 124 C38 114 20 94 20 68 V36 Z"
        fill="url(#prevBody)"
      />
      <path
        d="M60 30 L92 41 V68 C92 89 78 105 60 114 C42 105 28 89 28 68 V41 Z"
        fill="#ffffff"
        opacity="0.12"
      />
      {/* casque */}
      <path d="M30 34 C32 14 88 14 90 34 Z" fill="#ffffff" stroke="#d4d4d8" strokeWidth="2" />
      <rect x="24" y="32" width="72" height="8" rx="4" fill="#e4e4e7" />
      <rect x="56" y="12" width="8" height="18" rx="4" fill="#e4e4e7" />
      {/* yeux */}
      {mood === 'oops' ? (
        <g stroke="#ffffff" strokeWidth="4" strokeLinecap="round">
          <path d="M42 62 L50 70 M50 62 L42 70" />
          <path d="M70 62 L78 70 M78 62 L70 70" />
        </g>
      ) : mood === 'cheer' ? (
        <g stroke="#ffffff" strokeWidth="4" strokeLinecap="round" fill="none">
          <path d="M40 68 Q46 60 52 68" />
          <path d="M68 68 Q74 60 80 68" />
        </g>
      ) : (
        <g fill="#ffffff">
          <ellipse cx="46" cy="66" rx="5" ry="6" />
          <ellipse cx="74" cy="66" rx="5" ry="6" />
          <circle cx="48" cy="64" r="1.8" fill="#b0101c" />
          <circle cx="76" cy="64" r="1.8" fill="#b0101c" />
        </g>
      )}
      {/* joues */}
      {/* bouche */}
      {mood === 'thinking' ? (
        <path d="M52 88 H68" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
      ) : mood === 'oops' ? (
        <ellipse cx="60" cy="90" rx="6" ry="5" fill="#ffffff" />
      ) : (
        <path
          d="M48 84 Q60 98 72 84"
          stroke="#ffffff"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
      )}
      {/* croix santé */}
      <path
        d="M57.5 98 h5 v4.5 h4.5 v5 h-4.5 v4.5 h-5 v-4.5 h-4.5 v-5 h4.5 z"
        fill="#fff"
        opacity="0.9"
      />
    </svg>
  )
}
