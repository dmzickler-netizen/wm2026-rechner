import type { GroupId, RankedTeam, TeamStats } from './types'

/**
 * Eintrag in der Rangliste der Gruppendritten.
 * 8 der 12 Gruppendritten kommen ins Achtelfinale (Round of 32).
 */
export interface ThirdPlaceEntry extends TeamStats {
  group: GroupId
  rank: number // 1..12 über alle Gruppendritten
  qualifies: boolean // true für die besten 8
  decidedByLot: boolean
}

/**
 * Rangliste der 12 Gruppendritten nach FIFA-Kriterien (zwischen Gruppen):
 *   a) Punkte
 *   b) Tordifferenz
 *   c) erzielte Tore
 *   d) Fair-Play-Punkte
 *   e) Losentscheid
 * (Direkter Vergleich entfällt – die Teams haben nicht gegeneinander gespielt.)
 *
 * Erwartet je Gruppe den bereits ermittelten Drittplatzierten (rank === 3).
 */
export function rankThirdPlaced(
  thirds: { group: GroupId; team: RankedTeam }[],
): ThirdPlaceEntry[] {
  const decidedByLot = new Set<string>()

  const sorted = [...thirds].sort((p, q) => {
    const a = p.team
    const b = q.team
    if (b.points !== a.points) return b.points - a.points
    if (b.gd !== a.gd) return b.gd - a.gd
    if (b.gf !== a.gf) return b.gf - a.gf
    if (b.fairPlay !== a.fairPlay) return b.fairPlay - a.fairPlay
    // alles gleich → Los
    decidedByLot.add(p.group)
    decidedByLot.add(q.group)
    return p.group.localeCompare(q.group)
  })

  return sorted.map((entry, i) => ({
    ...entry.team,
    group: entry.group,
    rank: i + 1,
    qualifies: i < 8,
    decidedByLot: decidedByLot.has(entry.group),
  }))
}

/**
 * Liefert die sortierte Liste der Gruppen-Buchstaben, deren Dritter
 * qualifiziert ist (für die Auswahl der R32-Kombination relevant).
 */
export function qualifiedThirdGroups(ranked: ThirdPlaceEntry[]): GroupId[] {
  return ranked
    .filter((t) => t.qualifies)
    .map((t) => t.group)
    .sort()
}
