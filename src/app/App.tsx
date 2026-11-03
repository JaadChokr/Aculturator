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
        <TooltipProvider delayDuration={200}>
          <RouterProvider router={router} />
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
