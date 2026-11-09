import type { Difficulty, ResourceType } from '@acculturator/contracts'

export const RESOURCE_TYPE_LABEL: Record<ResourceType, string> = {
  video: 'Vidéo',
  fiche: 'Fiche mémo',
  infographie: 'Infographie',
  podcast: 'Podcast',
}

/** Niveaux de difficulté proposés pour les quiz. */
export const DIFFICULTY_LEVELS: { value: Difficulty; label: string; description: string }[] = [
  { value: 1, label: 'Découverte', description: 'Les notions essentielles' },
  { value: 2, label: 'Confirmé', description: 'Des mises en situation' },
  { value: 3, label: 'Expert', description: 'Les cas les plus pointus' },
]

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  1: 'Découverte',
  2: 'Confirmé',
  3: 'Expert',
}
