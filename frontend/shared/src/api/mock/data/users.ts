import type { Role, User } from '@acculturator/contracts'

// ⚠️ Données de démonstration — à remplacer par l'API d'authentification (SSO / Azure AD…)
export const MOCK_USERS: Record<Role, User> = {
  collaborateur: {
    id: 'u-001',
    firstName: 'Camille',
    lastName: 'Martin',
    email: 'camille.martin@entreprise.fr',
    role: 'collaborateur',
    site: 'Lyon – Part-Dieu',
    team: 'Logistique',
    jobTitle: 'Chargée d’exploitation',
  },
  referent: {
    id: 'u-014',
    firstName: 'Karim',
    lastName: 'Benali',
    email: 'karim.benali@entreprise.fr',
    role: 'referent',
    site: 'Lyon – Part-Dieu',
    team: 'Logistique',
    jobTitle: 'Référent Santé & Sécurité',
  },
  admin: {
    id: 'u-100',
    firstName: 'Sophie',
    lastName: 'Lefèvre',
    email: 'sophie.lefevre@entreprise.fr',
    role: 'admin',
    site: 'Siège – Paris',
    team: 'RH & QHSE',
    jobTitle: 'Responsable QHSE',
  },
}
