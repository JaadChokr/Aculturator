import type { LucideIcon } from 'lucide-react'
import { create } from 'zustand'

export type ToastTone = 'default' | 'xp' | 'badge' | 'success' | 'warning'

export interface Toast {
  id: number
  title: string
  description?: string
  tone: ToastTone
  icon?: LucideIcon
}

interface ToastState {
  toasts: Toast[]
  push: (t: Omit<Toast, 'id' | 'tone'> & { tone?: ToastTone }) => void
  dismiss: (id: number) => void
}

let seq = 0

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (t) => {
    const id = ++seq
    set((s) => ({ toasts: [...s.toasts.slice(-3), { tone: 'default', ...t, id }] }))
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })), 3800)
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
}))

export const toast = (t: Parameters<ToastState['push']>[0]) => useToastStore.getState().push(t)
