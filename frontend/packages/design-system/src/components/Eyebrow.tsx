import type { ReactNode } from 'react'
import { cn } from '../lib'

const TONE = {
  primary: 'text-primary',
  muted: 'text-muted-foreground',
  /** Sur un fond rouge (bandeau d'accueil) */
  'on-primary': 'text-primary-foreground/75',
  /** Sur un fond graphite */
  'on-inverse': 'text-inverse-foreground/70',
  /** Couleur du texte environnant (ex. sur une image ou une vidéo) */
  current: '',
} as const

/** Sur-titre en petites capitales, au-dessus d'un titre ou d'un bloc. */
export function Eyebrow({
  tone = 'primary',
  as: Tag = 'p',
  className,
  children,
}: {
  tone?: keyof typeof TONE
  as?: 'p' | 'div' | 'span'
  className?: string
  children: ReactNode
}) {
  return (
    <Tag className={cn('text-xs font-semibold tracking-[0.12em] uppercase', TONE[tone], className)}>
      {children}
    </Tag>
  )
}
