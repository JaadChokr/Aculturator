import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { Role, User } from '@acculturator/contracts'
import { api } from '../api'
import { LoadError } from '../components/LoadState'

interface AuthContextValue {
  user: User
  /** Démo uniquement : change de profil pour visiter les autres portails */
  switchRole?: (role: Role) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export const ME_QUERY_KEY = ['me'] as const

/** Charge l'utilisateur connecté via l'API (SSO en production, profil de démo sinon). */
export function AuthProvider({ children, fallback }: { children: ReactNode; fallback: ReactNode }) {
  const queryClient = useQueryClient()
  const query = useQuery({
    queryKey: ME_QUERY_KEY,
    queryFn: api.auth.getCurrentUser,
    staleTime: Infinity,
  })

  const value = useMemo<AuthContextValue | null>(() => {
    if (!query.data) return null
    const switchDemoRole = api.auth.switchDemoRole
    return {
      user: query.data,
      switchRole: switchDemoRole
        ? async (role) => {
            await switchDemoRole(role)
            // Données liées à l'utilisateur rechargées (le catalogue, commun, est conservé)
            await queryClient.invalidateQueries({ predicate: (q) => q.queryKey[0] !== 'catalog' })
          }
        : undefined,
    }
  }, [query.data, queryClient])

  if (query.isError)
    return <LoadError message="Impossible de vous identifier." onRetry={() => query.refetch()} />
  if (!value) return <>{fallback}</>
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth doit être utilisé dans <AuthProvider>')
  return ctx
}
