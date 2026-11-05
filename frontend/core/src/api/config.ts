/**
 * Adresse de l'API. Défaut « /api » : en développement, ces appels sont servis par le serveur de
 * démo (mock-server) ou relayés par Vite vers le backend local ; en production, par le backend.
 */
export const API_URL = import.meta.env.VITE_API_URL ?? '/api'
