import { forwardRef, type ReactNode } from 'react'

/**
 * Illustration vectorielle de l'open space (viewBox 0 0 1000 600).
 * Les coordonnées des dangers sont définies dans `shared/content/hazards.ts`.
 */
export const OfficeScene = forwardRef<SVGSVGElement, { children?: ReactNode; onClick?: React.MouseEventHandler<SVGSVGElement> }>(
  function OfficeScene({ children, onClick }, ref) {
    return (
      <svg
        ref={ref}
        viewBox="0 0 1000 600"
        className="block h-auto w-full cursor-crosshair select-none"
        onClick={onClick}
        role="img"
        aria-label="Illustration d’un open space contenant des situations dangereuses"
      >
        <defs>
          <linearGradient id="sky" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#7dd3fc" />
            <stop offset="1" stopColor="#e0f2fe" />
          </linearGradient>
          <linearGradient id="floor" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#d9c3a0" />
            <stop offset="1" stopColor="#c8a97e" />
          </linearGradient>
          <linearGradient id="screen" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#1e3a8a" />
            <stop offset="1" stopColor="#0ea5e9" />
          </linearGradient>
        </defs>

        {/* Mur & sol */}
        <rect width="1000" height="420" fill="#eef4f3" />
        <rect y="420" width="1000" height="180" fill="url(#floor)" />
        {[460, 505, 555].map((y) => (
          <line key={y} x1="0" x2="1000" y1={y} y2={y} stroke="#b8956a" strokeWidth="1.5" opacity="0.5" />
        ))}
        <rect y="412" width="1000" height="10" fill="#cbd5d4" />

        {/* Fenêtre */}
        <rect x="45" y="55" width="190" height="210" rx="6" fill="#94a3b8" />
        <rect x="55" y="65" width="170" height="190" fill="url(#sky)" />
        <circle cx="190" cy="105" r="18" fill="#fde68a" />
        <path d="M60 220 Q100 190 140 215 T225 205 V255 H55 Z" fill="#86efac" opacity="0.8" />
        <line x1="140" x2="140" y1="65" y2="255" stroke="#94a3b8" strokeWidth="6" />
        <line x1="55" x2="225" y1="160" y2="160" stroke="#94a3b8" strokeWidth="6" />

        {/* Affiche plan d'évacuation */}
        <rect x="285" y="70" width="110" height="80" rx="4" fill="#fff" stroke="#16a34a" strokeWidth="4" />
        <rect x="295" y="80" width="90" height="10" rx="2" fill="#16a34a" />
        <path d="M300 100 h40 v20 h-25 v15 h55" stroke="#64748b" strokeWidth="3" fill="none" />
        <circle cx="372" cy="135" r="5" fill="#16a34a" />

        {/* Horloge */}
        <circle cx="560" cy="95" r="26" fill="#fff" stroke="#334155" strokeWidth="5" />
        <path d="M560 95 V78 M560 95 L572 102" stroke="#334155" strokeWidth="4" strokeLinecap="round" />

        {/* Étagère haute + classeurs */}
        <rect x="630" y="122" width="200" height="12" rx="3" fill="#8b5e34" />
        {[0, 1, 2, 3, 4].map((i) => (
          <rect key={i} x={645 + i * 22} y={72} width="18" height="50" rx="2" fill={['#0ea5e9', '#f97316', '#22c55e', '#8b5cf6', '#ef4444'][i]} />
        ))}
        <rect x="760" y="88" width="55" height="34" rx="2" fill="#d4a373" />

        {/* Extincteur (leurre : tout va bien) */}
        <g transform="translate(25 0)">
          <rect x="770" y="262" width="40" height="24" rx="3" fill="#dc2626" />
          <text x="790" y="279" textAnchor="middle" fontSize="11" fontWeight="700" fill="#fff">
            🧯
          </text>
          <rect x="778" y="300" width="24" height="62" rx="10" fill="#dc2626" />
          <rect x="783" y="292" width="14" height="12" rx="2" fill="#1f2937" />
          <path d="M797 298 q16 4 10 30" stroke="#1f2937" strokeWidth="4" fill="none" />
        </g>

        {/* Issue de secours */}
        <rect x="858" y="122" width="96" height="30" rx="4" fill="#16a34a" />
        <text x="906" y="143" textAnchor="middle" fontSize="15" fontWeight="800" fill="#fff" letterSpacing="1">
          SORTIE
        </text>
        <rect x="860" y="165" width="96" height="250" fill="#e5e7eb" stroke="#64748b" strokeWidth="5" />
        <rect x="872" y="285" width="72" height="9" rx="3" fill="#475569" />
        {/* Cartons qui bloquent la porte */}
        <g>
          <rect x="842" y="372" width="130" height="80" fill="#c2884f" stroke="#8b5e34" strokeWidth="3" />
          <path d="M842 392 H972" stroke="#8b5e34" strokeWidth="3" />
          <rect x="855" y="312" width="100" height="62" fill="#d4a373" stroke="#8b5e34" strokeWidth="3" />
          <path d="M905 312 V374" stroke="#e9c46a" strokeWidth="6" />
          <rect x="878" y="268" width="62" height="46" fill="#c2884f" stroke="#8b5e34" strokeWidth="3" />
        </g>

        {/* Armoire de classement avec tiroir bas ouvert */}
        <rect x="70" y="290" width="100" height="130" rx="4" fill="#94a3b8" stroke="#64748b" strokeWidth="3" />
        <rect x="80" y="300" width="80" height="34" rx="2" fill="#cbd5e1" />
        <rect x="80" y="342" width="80" height="34" rx="2" fill="#cbd5e1" />
        <rect x="108" y="313" width="24" height="6" rx="3" fill="#475569" />
        <rect x="108" y="355" width="24" height="6" rx="3" fill="#475569" />
        <rect x="80" y="384" width="80" height="30" fill="#475569" />
        <polygon points="62,405 178,405 190,470 50,470" fill="#cbd5e1" stroke="#64748b" strokeWidth="3" />
        <rect x="104" y="440" width="34" height="7" rx="3" fill="#475569" />
        <rect x="80" y="392" width="20" height="16" fill="#f8fafc" />
        <rect x="104" y="390" width="22" height="18" fill="#fef3c7" />

        {/* Liquide renversé */}
        <ellipse cx="248" cy="545" rx="62" ry="16" fill="#38bdf8" opacity="0.65" />
        <ellipse cx="236" cy="541" rx="22" ry="5" fill="#fff" opacity="0.5" />
        <g transform="rotate(-80 196 532)">
          <path d="M184 522 h26 l-3 26 h-20 z" fill="#f8fafc" stroke="#94a3b8" strokeWidth="2" />
          <path d="M210 528 q10 2 8 12 l-9 -2" fill="none" stroke="#94a3b8" strokeWidth="2" />
        </g>

        {/* Bureau + écran */}
        <rect x="300" y="330" width="340" height="16" rx="4" fill="#a16207" />
        <rect x="312" y="346" width="12" height="134" fill="#78350f" />
        <rect x="616" y="346" width="12" height="134" fill="#78350f" />
        <rect x="455" y="298" width="16" height="32" fill="#334155" />
        <rect x="430" y="322" width="66" height="8" rx="3" fill="#334155" />
        <rect x="390" y="208" width="146" height="94" rx="6" fill="#1f2937" />
        <rect x="398" y="216" width="130" height="78" rx="3" fill="url(#screen)" />
        <path d="M410 270 l20 -20 l18 14 l26 -30 l30 26" stroke="#bae6fd" strokeWidth="4" fill="none" />
        <rect x="540" y="318" width="70" height="10" rx="2" fill="#475569" />
        <rect x="330" y="300" width="22" height="30" rx="4" fill="#f97316" />
        <path d="M352 308 q12 2 8 14" stroke="#f97316" strokeWidth="4" fill="none" />
        {/* Plante */}
        <rect x="580" y="282" width="34" height="36" rx="4" fill="#b45309" />
        <path d="M597 284 q-24 -30 -6 -54 q4 24 6 54 q4 -34 24 -46 q-6 26 -24 46" fill="#22c55e" />

        {/* Multiprises en cascade + étincelles */}
        <path d="M463 330 C 460 380, 450 420, 448 448" stroke="#1f2937" strokeWidth="4" fill="none" />
        <rect x="415" y="446" width="86" height="16" rx="4" fill="#f8fafc" stroke="#64748b" strokeWidth="2.5" />
        {[425, 445, 465, 485].map((x) => (
          <rect key={x} x={x} y="440" width="10" height="12" rx="2" fill="#1f2937" />
        ))}
        <rect x="455" y="466" width="70" height="14" rx="4" fill="#f8fafc" stroke="#64748b" strokeWidth="2.5" />
        {[465, 485, 505].map((x) => (
          <rect key={x} x={x} y="461" width="10" height="11" rx="2" fill="#1f2937" />
        ))}
        <path d="M495 454 C 520 455, 520 468, 525 470" stroke="#1f2937" strokeWidth="3" fill="none" />
        <g stroke="#f59e0b" strokeWidth="3" strokeLinecap="round">
          <path d="M505 438 l8 -10" />
          <path d="M512 446 l12 -4" />
          <path d="M498 432 l2 -12" />
        </g>
        <path d="M515 430 l-5 8 h6 l-5 8" stroke="#ef4444" strokeWidth="2.5" fill="none" />

        {/* Câble en travers du passage */}
        <path d="M520 474 C 540 540, 600 562, 650 546 S 760 520, 830 572 L 1000 590" stroke="#111827" strokeWidth="6" fill="none" strokeLinecap="round" />

        {/* Chaise à roulettes utilisée comme escabeau + personne */}
        <g>
          <rect x="682" y="378" width="86" height="16" rx="6" fill="#334155" />
          <rect x="748" y="318" width="18" height="64" rx="6" fill="#334155" />
          <rect x="719" y="394" width="10" height="40" fill="#64748b" />
          <path d="M684 446 L724 432 L764 446 M724 432 V448" stroke="#475569" strokeWidth="7" strokeLinecap="round" fill="none" />
          {[684, 724, 764].map((x) => (
            <circle key={x} cx={x} cy="452" r="7" fill="#111827" />
          ))}
          {/* personne */}
          <path d="M712 378 L716 310 M738 378 L734 310" stroke="#1e3a8a" strokeWidth="13" strokeLinecap="round" />
          <rect x="702" y="238" width="46" height="78" rx="16" fill="#0d9488" />
          <path d="M742 252 L770 196 L782 138" stroke="#0d9488" strokeWidth="11" strokeLinecap="round" fill="none" />
          <path d="M708 252 L690 290" stroke="#0d9488" strokeWidth="11" strokeLinecap="round" fill="none" />
          <circle cx="782" cy="134" r="7" fill="#f2c7a5" />
          <circle cx="725" cy="216" r="21" fill="#f2c7a5" />
          <path d="M704 212 q4 -26 26 -24 q20 2 18 22 q-10 -12 -44 2" fill="#3f2a1d" />
        </g>

        {children}
      </svg>
    )
  },
)
