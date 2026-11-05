import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// `--mode demo` produit un build statique autonome (routeur en mémoire + chemins relatifs)
// pratique pour partager une maquette cliquable sans serveur.
export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss()],
  base: mode === 'demo' ? './' : '/',
  resolve: {
    // Les portails et le socle partagé sont des paquets du monorepo :
    // une seule instance de chaque bibliothèque à état (React, routeur, cache de données…).
    dedupe: ['react', 'react-dom', 'react-router', '@tanstack/react-query', 'zustand', 'motion'],
  },
  server: {
    // Préparé pour le backend : les appels /api sont relayés vers le serveur local
    proxy: { '/api': { target: process.env.VITE_API_PROXY_TARGET ?? 'http://localhost:3000', changeOrigin: true } },
  },
  build: {
    outDir: mode === 'demo' ? 'dist-demo' : 'dist',
  },
}))
