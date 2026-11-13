/** Rôles applicatifs : ils déterminent les portails accessibles. */
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
