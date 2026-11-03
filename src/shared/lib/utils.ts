import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const todayISO = () => new Date().toISOString().slice(0, 10)

export function daysBetween(fromISO: string, toISO: string) {
  const ms = new Date(toISO).getTime() - new Date(fromISO).getTime()
  return Math.round(ms / 86_400_000)
}

export function addDays(iso: string, days: number) {
  const d = new Date(iso)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export function shuffle<T>(items: readonly T[]): T[] {
  const a = [...items]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export const formatNumber = (n: number) => new Intl.NumberFormat('fr-FR').format(n)
