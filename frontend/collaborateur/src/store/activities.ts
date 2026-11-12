import type { ActivityId } from '@acculturator/contracts'
import { getCatalog } from '@acculturator/core/catalog'
import type { Parcours } from '@acculturator/contracts'
import { getCurrentParcours, useCurrentParcours } from '@acculturator/core/parcours'

/** Le contenu nécessaire à une activité est-il présent dans le catalogue ? */
function hasContent(activity: ActivityId): boolean {
  let catalog
  try {
    catalog = getCatalog()
  } catch {
    return true // catalogue pas encore chargé : on ne masque rien
  }
  switch (activity) {
    case 'resources':
      return catalog.resources.length > 0
    case 'flashcards':
      return catalog.flashcards.length > 0
    case 'quiz':
      return catalog.quizQuestions.length > 0
    case 'hazard-hunt':
      return catalog.hazardScenes.length > 0
    case 'assistant':
      return true
  }
}

/**
 * Le parcours en cours propose-t-il cette activité (`Parcours.activities`) et a-t-il de quoi
 * l'alimenter ? Hors composant (navigation, recommandations, missions, badges).
 */
export function offers(activity: ActivityId): boolean {
  return offeredBy(getCurrentParcours(), activity)
}

/** Parcours pas encore connu : rien n'est masqué. */
const offeredBy = (parcours: Parcours | null, activity: ActivityId) =>
  (!parcours || parcours.activities.includes(activity)) && hasContent(activity)

/** Version réactive de `offers`, pour les composants. */
export function useOffers(): (activity: ActivityId) => boolean {
  const parcours = useCurrentParcours()
  return (activity) => offeredBy(parcours, activity)
}
