import { levelsWith } from '@acculturator/core/content'
import { getBranding, useBranding } from '@acculturator/core/parcours'

/** Niveaux du joueur, avec les titres propres au parcours en cours (`branding.levelTitles`). */
export const useLevels = () => levelsWith(useBranding().levelTitles)

/** Version hors composant de `useLevels`. */
export const getLevels = () => levelsWith(getBranding().levelTitles)
