import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

/**
 * Règles d'architecture (frontières entre modules) :
 *   contracts  ←  shared  ←  portails  ←  shell
 *   contracts  ←  mock-server (faux backend, installé par le shell en démo uniquement)
 * - un portail n'importe jamais un autre portail ni l'application hôte ;
 * - le socle partagé n'importe aucun portail ;
 * - le frontend (hors shell) ne dépend jamais du serveur de démo : il ne parle qu'HTTP ;
 * - les contrats ne dépendent de rien (types purs, réutilisables par le backend).
 */
const PORTALS = ['collaborateur', 'referent', 'admin']

const restrict = (patterns) => ({
  'no-restricted-imports': ['error', { patterns }],
})

export default tseslint.config(
  { ignores: ['**/dist', '**/dist-demo', '**/node_modules'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: { ecmaVersion: 2022, globals: globals.browser },
    plugins: { 'react-hooks': reactHooks, 'react-refresh': reactRefresh },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': 'off',
    },
  },
  // Portails : autonomes les uns des autres
  ...PORTALS.map((portal) => ({
    files: [`frontend/${portal}/src/**/*.{ts,tsx}`],
    rules: restrict([
      {
        group: ['@acculturator/portal-*', '@acculturator/shell', '@acculturator/mock-server*'],
        message:
          'Un portail ne dépend ni des autres portails, ni de l’application hôte, ni du serveur de démo : passer par @acculturator/shared.',
      },
      {
        group: ['../../*/src/*', '**/frontend/**'],
        message:
          'Importer les autres modules par leur nom de paquet (@acculturator/…), pas par chemin relatif.',
      },
      {
        group: ['@acculturator/shared/src/*', '@acculturator/shared/*/*'],
        message:
          'Utiliser uniquement les points d’entrée publics de @acculturator/shared (ui, api, catalog…).',
      },
    ]),
  })),
  // Socle partagé : ne connaît aucun portail
  {
    files: ['frontend/shared/src/**/*.{ts,tsx}'],
    rules: restrict([
      {
        group: [
          '@acculturator/portal-*',
          '@acculturator/shell',
          '@acculturator/shared/*',
          '@acculturator/mock-server*',
        ],
        message:
          'Le socle partagé ne dépend d’aucun portail ni du serveur de démo (et s’importe lui-même en relatif).',
      },
    ]),
  },
  // Serveur de démo : un « backend » qui ne connaît que les contrats
  {
    files: ['mock-server/src/**/*.ts'],
    rules: restrict([
      {
        regex: '^(?!\\.|node:|@acculturator/contracts$)',
        message:
          'Le serveur de démo ne dépend que de @acculturator/contracts (et de node:* en local).',
      },
    ]),
  },
  { files: ['mock-server/src/node.ts'], languageOptions: { globals: globals.node } },
  // Contrats : types purs, sans dépendance
  {
    files: ['packages/contracts/src/**/*.ts'],
    rules: restrict([
      {
        regex: '^[^.]',
        message: 'Les contrats ne dépendent d’aucune bibliothèque (imports relatifs uniquement).',
      },
    ]),
  },
)
