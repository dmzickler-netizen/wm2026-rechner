import type { GroupId, Match, TeamId } from './types'

/**
 * Standard-Round-Robin für eine 4er-Gruppe (3 Spieltage, 6 Spiele).
 * Reihenfolge je Spieltag entspricht dem üblichen WM-Schema:
 *   MD1: T1–T2, T3–T4
 *   MD2: T1–T3, T2–T4
 *   MD3: T4–T1, T2–T3   (letzter Spieltag zeitgleich)
 */
const PAIRS: [number, number][] = [
  [0, 1], [2, 3],
  [0, 2], [3, 1],
  [3, 0], [1, 2],
]

export function makeGroupSchedule(group: GroupId, teams: TeamId[]): Match[] {
  return PAIRS.map(([h, a], i) => ({
    id: `${group}${i + 1}`,
    group,
    home: teams[h],
    away: teams[a],
    homeGoals: null,
    awayGoals: null,
  }))
}

/** Spieltag (1–3) eines Spiels im 6er-Schema. */
export function matchdayOf(match: Match): number {
  const idx = Number(match.id.replace(/^[A-L]/, '')) - 1
  return Math.floor(idx / 2) + 1
}
