/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ROUTER_MODE?: 'browser' | 'hash'
  readonly VITE_DEMO_ROLE_SWITCHER?: 'true' | 'false'
}
