/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** browser (production), hash ou memory (builds de démo statiques) */
  readonly VITE_ROUTER_MODE?: 'browser' | 'hash' | 'memory'
  /** Affiche le sélecteur de profil de démonstration */
  readonly VITE_DEMO_ROLE_SWITCHER?: 'true' | 'false'
  /** true : l'API est servie dans le navigateur par le serveur de démo (mock-server) */
  readonly VITE_MOCK_SERVER?: 'true' | 'false'
  /** URL de base de l'API (défaut : /api) */
  readonly VITE_API_URL?: string
}
