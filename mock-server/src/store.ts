/**
 * Stockage clé/valeur de l'état du serveur de démo (profil courant, notifications lues).
 * Navigateur : localStorage (l'état survit au rechargement). Node : mémoire.
 */
export interface KeyValueStore {
  get(key: string): string | null
  set(key: string, value: string): void
}

export function memoryStore(): KeyValueStore {
  const map = new Map<string, string>()
  return {
    get: (key) => map.get(key) ?? null,
    set: (key, value) => void map.set(key, value),
  }
}

export function browserStore(): KeyValueStore {
  const fallback = memoryStore()
  return {
    get(key) {
      try {
        return localStorage.getItem(key)
      } catch {
        return fallback.get(key)
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, value)
      } catch {
        fallback.set(key, value)
      }
    },
  }
}
