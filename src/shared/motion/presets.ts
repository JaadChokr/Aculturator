import type { Transition, Variants } from 'motion/react'

/**
 * Identité de mouvement d'Acculturator — à réutiliser dans tous les portails.
 * Règle : des animations courtes (≤ 450 ms), des ressorts pour les interactions,
 * et toujours une signification (apparition, feedback, récompense).
 * `MotionConfig reducedMotion="user"` (App.tsx) respecte la préférence système.
 */
export const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1]

export const spring: Transition = { type: 'spring', stiffness: 380, damping: 30 }
export const springSoft: Transition = { type: 'spring', stiffness: 220, damping: 26 }
export const springBouncy: Transition = { type: 'spring', stiffness: 420, damping: 24 }

/** Conteneur qui déclenche ses enfants en cascade. */
export const staggerContainer = (stagger = 0.06, delay = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: stagger, delayChildren: delay } },
})

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.42, ease: EASE_OUT } },
}

export const popIn: Variants = {
  hidden: { opacity: 0, scale: 0.85 },
  show: { opacity: 1, scale: 1, transition: springBouncy },
}

/** Micro-interaction standard des cartes cliquables. */
export const hoverLift = {
  whileHover: { y: -3, transition: spring },
  whileTap: { scale: 0.98 },
}
