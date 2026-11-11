import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

/**
 * Règles d'architecture (frontières entre modules) :
 *   contracts  ←  design-system  ←  core  ←  portails  ←  shell
 *   contracts  ←  mock-server (faux backend, installé par le shell en démo uniquement)
 * - le design system est purement visuel : aucun accès aux données, aucun autre paquet maison ;
 * - core (données, auth, portails) ne connaît aucun portail ;
 * - un portail n'importe jamais un autre portail ni l'application hôte ;
 * - le frontend (hors shell) ne dépend jamais du serveur de démo : il ne parle qu'HTTP ;
 * - les contrats ne dépendent de rien (types purs, réutilisables par le backend).
 */
const PORTALS = ['collaborateur', 'referent', 'admin']

const restrict = (patterns) => ({
  'no-restricted-imports': ['error', { patterns }],
})

const PUBLIC_ENTRY_POINTS = {
  group: ['@acculturator/*/src/*', '@acculturator/*/*/*'],
  message:
    'Utiliser uniquement les points d’entrée publics des paquets (ex. @acculturator/design-system/ui, @acculturator/core/api).',
}
/**
 * Style partagé : les pages utilisent les briques du design system plutôt que de recopier
 * leurs classes (largeurs de page, sur-titres, choix exclusifs, teintes de difficulté).
 */
const SHARED_STYLE_RULES = {
  'no-restricted-syntax': [
    'error',
    ...['Literal', 'TemplateElement'].flatMap((node) => {
      const value = node === 'Literal' ? 'value' : 'value.raw'
      return [
        {
          selector: `${node}[${value}=/mx-auto[^'"]*max-w-|max-w-[^'"]*mx-auto/]`,
          message:
            'Largeur de page : utiliser <Page width> ou PAGE_WIDTH de @acculturator/design-system/layout.',
        },
        {
          selector: `${node}[${value}=/tracking-\\[0\\.12em\\]|tracking-wider[^'"]*uppercase|uppercase[^'"]*tracking-wider/]`,
          message: 'Sur-titre : utiliser <Eyebrow> de @acculturator/design-system/components.',
        },
        {
          selector: `${node}[${value}=/(bg|text|border|from|via|to)-level-[123]/]`,
          message:
            'Teintes de difficulté : utiliser DIFFICULTY_STYLE / DifficultyDots de @acculturator/design-system/components.',
        },
      ]
    }),
    {
      selector: "JSXAttribute[name.name='role'][value.value='radiogroup']",
      message:
        'Choix exclusif : utiliser SegmentedControl ou ChoiceGroup + ChoiceCard de @acculturator/design-system/components.',
    },
  ],
}

const NO_RELATIVE_ESCAPE = {
  group: ['../../*/src/*', '**/frontend/**', '**/packages/**'],
  message:
    'Importer les autres modules par leur nom de paquet (@acculturator/…), pas par chemin relatif.',
}

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
  // Design system : identité visuelle uniquement
  {
    files: ['packages/design-system/src/**/*.{ts,tsx}'],
    rules: restrict([
      {
        regex: '^@acculturator/(?!contracts$)',
        message:
          'Le design system est autonome et purement visuel : il ne dépend que de @acculturator/contracts (types) et s’importe lui-même en relatif.',
      },
      {
        group: ['@tanstack/*'],
        message:
          'Le design system n’accède pas aux données : il reçoit ce qu’il affiche en props (le chargement se fait dans core).',
      },
      NO_RELATIVE_ESCAPE,
    ]),
  },
  // Core : données, authentification, contrat des portails
  {
    files: ['packages/core/src/**/*.{ts,tsx}'],
    rules: restrict([
      {
        group: [
          '@acculturator/portal-*',
          '@acculturator/shell',
          '@acculturator/mock-server*',
          '@acculturator/core/*',
        ],
        message:
          'Core ne dépend d’aucun portail, ni du shell, ni du serveur de démo (et s’importe lui-même en relatif).',
      },
      PUBLIC_ENTRY_POINTS,
      NO_RELATIVE_ESCAPE,
    ]),
  },
  // Portails et application hôte : style partagé du design system
  {
    files: [...PORTALS.map((p) => `frontend/${p}/src/**/*.tsx`), 'frontend/shell/src/**/*.tsx'],
    rules: SHARED_STYLE_RULES,
  },
  // Portails : autonomes les uns des autres
  ...PORTALS.map((portal) => ({
    files: [`frontend/${portal}/src/**/*.{ts,tsx}`],
    rules: restrict([
      {
        group: ['@acculturator/portal-*', '@acculturator/shell', '@acculturator/mock-server*'],
        message:
          'Un portail ne dépend ni des autres portails, ni de l’application hôte, ni du serveur de démo : passer par @acculturator/design-system ou @acculturator/core.',
      },
      PUBLIC_ENTRY_POINTS,
      NO_RELATIVE_ESCAPE,
    ]),
  })),
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
