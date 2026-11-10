/**
 * Cadre commun à toutes les pages : barre d'en-tête et zone de contenu.
 * Utilisé par AppShell (pages des portails) et StandaloneShell (pages hors portail, ex. choix
 * du parcours) : toutes les pages occupent l'espace de la même façon.
 */
export const HEADER_BAR =
  'sticky top-0 z-20 flex h-16 items-center gap-3 border-b bg-background/85 px-4 backdrop-blur-md sm:px-6'

export const CONTENT_AREA = 'mx-auto w-full max-w-[1760px] px-4 py-6 sm:px-6 lg:px-8'
