/**
 * Configuration de l'accès aux données.
 * - VITE_API_MODE=mock (défaut) : données de démonstration, aucun serveur requis.
 * - VITE_API_MODE=http : appels au backend sur VITE_API_URL (défaut « /api », relayé par Vite en dev).
 */
export const API_MODE: 'mock' | 'http' = import.meta.env.VITE_API_MODE === 'http' ? 'http' : 'mock'
export const API_URL = import.meta.env.VITE_API_URL ?? '/api'
