import { motion } from 'motion/react'
import { Link } from 'react-router'
import { Flame, Zap } from 'lucide-react'
import { levelFromXp } from '@/shared/content'
import { ProgressRing } from '@/shared/components/ProgressRing'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui'
import { AnimatedNumber, springBouncy } from '@/shared/motion'
import { useProgress } from '../store/progress'

export function HeaderStats() {
  const xp = useProgress((s) => s.xp)
  const streak = useProgress((s) => s.streak.count)
  const { current, progress, toNext, next } = levelFromXp(xp)

  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center gap-1 rounded-full bg-streak/12 px-2.5 py-1 text-sm font-bold text-streak">
            <motion.span
              key={streak}
              initial={{ scale: 1.8, rotate: -15 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={springBouncy}
            >
              <Flame className="size-4 fill-current" />
            </motion.span>
            {streak}
          </span>
        </TooltipTrigger>
        <TooltipContent>Série de {streak} jour(s) d’activité consécutifs</TooltipContent>
      </Tooltip>
      <Link
        to="/collaborateur/trophees"
        className="inline-flex items-center gap-2 rounded-full bg-xp/10 py-1 pr-3 pl-1 text-sm font-bold text-xp transition-colors hover:bg-xp/15"
        title={next ? `${toNext} XP avant le niveau ${next.level}` : 'Niveau maximum'}
      >
        <ProgressRing
          value={progress}
          size={26}
          stroke={3.5}
          indicatorClassName="stroke-xp"
          trackClassName="stroke-xp/20"
          label="Progression du niveau"
        >
          <span className="text-[10px] font-extrabold">{current.level}</span>
        </ProgressRing>
        <motion.span
          key={xp}
          className="hidden sm:block"
          initial={{ scale: 1.6, rotate: 20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={springBouncy}
        >
          <Zap className="size-3.5 fill-current" />
        </motion.span>
        <AnimatedNumber value={xp} className="tabular-nums" />
        <span className="hidden text-xs font-semibold opacity-80 md:inline">XP</span>
      </Link>
    </div>
  )
}
