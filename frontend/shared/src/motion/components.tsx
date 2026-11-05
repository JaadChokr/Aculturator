import { useEffect, type ComponentProps } from 'react'
import { animate, motion, useMotionValue, useTransform } from 'motion/react'
import { fadeUp, popIn, staggerContainer } from './presets'

/** Conteneur en cascade : ses `<Reveal>` apparaissent les uns après les autres. */
export function Stagger({
  stagger = 0.06,
  delay = 0,
  ...props
}: ComponentProps<typeof motion.div> & { stagger?: number; delay?: number }) {
  return (
    <motion.div
      variants={staggerContainer(stagger, delay)}
      initial="hidden"
      animate="show"
      {...props}
    />
  )
}

/** Élément qui apparaît en glissant vers le haut (dans un `<Stagger>` ou seul). */
export function Reveal({
  variant = 'fadeUp',
  ...props
}: ComponentProps<typeof motion.div> & { variant?: 'fadeUp' | 'pop' }) {
  return <motion.div variants={variant === 'pop' ? popIn : fadeUp} {...props} />
}

/** Nombre qui « compte » jusqu'à sa valeur (XP, scores…). */
export function AnimatedNumber({
  value,
  format = (n: number) => new Intl.NumberFormat('fr-FR').format(Math.round(n)),
  duration = 0.8,
  from,
  className,
}: {
  value: number
  /** Valeur de départ au montage (ex. 0 pour un compte à rebours d'entrée) */
  from?: number
  format?: (n: number) => string
  duration?: number
  className?: string
}) {
  const mv = useMotionValue(from ?? value)
  const text = useTransform(mv, format)
  useEffect(() => {
    const controls = animate(mv, value, { duration, ease: [0.22, 1, 0.36, 1] })
    return () => controls.stop()
  }, [mv, value, duration])
  return <motion.span className={className}>{text}</motion.span>
}
