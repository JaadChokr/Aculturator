import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { Role, User } from '@/shared/types/auth'
import { MOCK_USERS } from './mockUsers'

interface AuthContextValue {
  user: User
  /** Démo uniquement : change de profil pour visiter les autres portails */
  switchRole: (role: Role) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)
const STORAGE_KEY = 'acculturator.demo-role'

function readRole(): Role {
  try {
    const r = localStorage.getItem(STORAGE_KEY)
    if (r === 'collaborateur' || r === 'referent' || r === 'admin') return r
  } catch {
    /* stockage indisponible */
  }
  return 'collaborateur'
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>(readRole)

  const value = useMemo<AuthContextValue>(
    () => ({
      user: MOCK_USERS[role],
      switchRole: (r) => {
        setRole(r)
        try {
          localStorage.setItem(STORAGE_KEY, r)
        } catch {
          /* ignore */
        }
      },
    }),
    [role],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth doit être utilisé dans <AuthProvider>')
  return ctx
}
