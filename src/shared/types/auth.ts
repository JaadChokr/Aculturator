export type Role = 'collaborateur' | 'referent' | 'admin'

export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role: Role
  site: string
  team: string
  jobTitle: string
}

export const ROLE_LABELS: Record<Role, string> = {
  collaborateur: 'Collaborateur',
  referent: 'Référent SST',
  admin: 'Administrateur',
}
