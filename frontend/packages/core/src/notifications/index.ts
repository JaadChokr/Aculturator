import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { AppNotification } from '@acculturator/contracts'
import { api } from '../api'

export const NOTIFICATIONS_QUERY_KEY = ['notifications'] as const

/** Notifications de l'utilisateur connecté, rafraîchies chaque minute. */
export function useNotifications() {
  const queryClient = useQueryClient()
  const { data: items = [] } = useQuery({
    queryKey: NOTIFICATIONS_QUERY_KEY,
    queryFn: api.notifications.list,
    refetchInterval: 60_000,
  })
  const { mutate: markRead } = useMutation({
    mutationFn: (ids: string[]) => api.notifications.markRead(ids),
    // Mise à jour optimiste : l'interface réagit immédiatement
    onMutate: (ids) =>
      queryClient.setQueryData<AppNotification[]>(NOTIFICATIONS_QUERY_KEY, (prev) =>
        prev?.map((n) => (ids.includes(n.id) ? { ...n, read: true } : n)),
      ),
    onSettled: () => queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY }),
  })
  return { items, markRead }
}
