import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// `--mode demo` produit un build statique autonome (HashRouter + chemins relatifs)
// pratique pour partager une maquette cliquable sans serveur.
export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss()],
  base: mode === 'demo' ? './' : '/',
  resolve: {
    alias: { '@': path.resolve(import.meta.dirname, './src') },
  },
  build: {
    outDir: mode === 'demo' ? 'dist-demo' : 'dist',
  },
}))
