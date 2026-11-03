import { MotionConfig } from 'motion/react'
import { RouterProvider } from 'react-router'
import { TooltipProvider } from '@/shared/ui'
import { Toaster } from '@/shared/components/toast/Toaster'
import { AuthProvider } from './auth/AuthProvider'
import { ThemeProvider } from './theme/ThemeProvider'
import { router } from './router'

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MotionConfig reducedMotion="user">
          <TooltipProvider delayDuration={200}>
            <RouterProvider router={router} />
            <Toaster />
          </TooltipProvider>
        </MotionConfig>
      </AuthProvider>
    </ThemeProvider>
  )
}
