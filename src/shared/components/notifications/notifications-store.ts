import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface NotificationsState {
  /** Identifiants lus, par utilisateur */
  readByUser: Record<string, string[]>
  markRead: (userId: string, ids: string[]) => void
}

export const useNotificationsStore = create<NotificationsState>()(
  persist(
    (set) => ({
      readByUser: {},
      markRead: (userId, ids) =>
        set((s) => {
          const current = new Set(s.readByUser[userId] ?? [])
          ids.forEach((id) => current.add(id))
          return { readByUser: { ...s.readByUser, [userId]: [...current] } }
        }),
    }),
    { name: 'acculturator.notifications', version: 1 },
  ),
)
