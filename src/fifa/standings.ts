import type { Match, RankedTeam, TeamId, TeamStats } from './types'

/**
 * Berechnet die Roh-Statistik (Punkte, Tore, …) für eine Menge Teams aus
 * den (gespielten) Spielen. Nicht gespielte Spiele (Tore = null) zählen nicht.
 */
export function computeStats(
  teamIds: TeamId[],
  matches: Match[],
  fairPlayByTeam: Record<TeamId, number> = {},
): Record<TeamId, TeamStats> {
  const table: Record<TeamId, TeamStats> = {}
  for (const id of teamIds) {
    table[id] = {
      team: id,
      played: 0, won: 0, drawn: 0, lost: 0,
      gf: 0, ga: 0, gd: 0, points: 0,
      fairPlay: fairPlayByTeam[id] ?? 0,
    }
  }

  for (const m of matches) {
    if (m.homeGoals == null || m.awayGoals == null) continue
    const h = table[m.home]
    const a = table[m.away]
    if (!h || !a) continue // Spiel betrifft Team außerhalb der betrachteten Menge

    h.played++; a.played++
    h.gf += m.homeGoals; h.ga += m.awayGoals
    a.gf += m.awayGoals; a.ga += m.homeGoals

    if (m.homeGoals > m.awayGoals) {
      h.won++; a.lost++; h.points += 3
    } else if (m.homeGoals < m.awayGoals) {
      a.won++; h.lost++; a.points += 3
    } else {
      h.drawn++; a.drawn++; h.points += 1; a.points += 1
    }
  }

  for (const id of teamIds) {
    table[id].gd = table[id].gf - table[id].ga
  }
  return table
}

/** Vergleich Punkte → Tordifferenz → Tore (für den direkten Vergleich). */
function compareOverall(x: TeamStats, y: TeamStats): number {
  if (y.points !== x.points) return y.points - x.points
  if (y.gd !== x.gd) return y.gd - x.gd
  if (y.gf !== x.gf) return y.gf - x.gf
  return 0
}

/** Nur Punkte (oberstes Kriterium). */
function comparePoints(x: TeamStats, y: TeamStats): number {
  return y.points - x.points
}

/** Gesamt-Tordifferenz → Gesamt-Tore (nach erschöpftem direkten Vergleich). */
function compareGoalDiff(x: TeamStats, y: TeamStats): number {
  if (y.gd !== x.gd) return y.gd - x.gd
  return y.gf - x.gf
}

/** Vergleich nach Fair-Play (weniger negative Punkte = besser). */
function compareFairPlay(x: TeamStats, y: TeamStats): number {
  return y.fairPlay - x.fairPlay
}

/**
 * Rangordnung einer Gruppe nach FIFA-Regelwerk **2026** (geändert: direkter
 * Vergleich VOR der Gesamt-Tordifferenz – wie bei der UEFA):
 *   a) Punkte (gesamt)
 *   — bei Gleichstand zwischen 2+ Teams, nur untereinander: —
 *   b) Punkte im direkten Vergleich
 *   c) Tordifferenz im direkten Vergleich
 *   d) erzielte Tore im direkten Vergleich
 *   — danach (falls weiter gleich): —
 *   e) Tordifferenz (gesamt)
 *   f) erzielte Tore (gesamt)
 *   g) Fair-Play-Wertung
 *   h) Losentscheid
 *
 * Rekursion: b–d gelten nur für die untereinander gleichen Teams. Trennt sich
 * eine Teilmenge ab, werden b–d auf die kleinere Restmenge erneut angewandt;
 * erst wenn sich gar nichts trennt, kommen e–h.
 */
export function rankGroup(
  teamIds: TeamId[],
  matches: Match[],
  fairPlayByTeam: Record<TeamId, number> = {},
): RankedTeam[] {
  const stats = computeStats(teamIds, matches, fairPlayByTeam)
  const decidedByLot = new Set<TeamId>()

  // Sortierfunktion mit voller Tiebreaker-Kette. Gibt <0, 0, >0 zurück;
  // markiert decidedByLot, wenn am Ende der Kette noch Gleichstand herrscht.
  const ordered = orderTeams(
    teamIds,
    stats,
    matches,
    fairPlayByTeam,
    decidedByLot,
  )

  return ordered.map((id, i) => ({
    ...stats[id],
    rank: i + 1,
    decidedByLot: decidedByLot.has(id),
  }))
}

function orderTeams(
  ids: TeamId[],
  stats: Record<TeamId, TeamStats>,
  matches: Match[],
  fairPlayByTeam: Record<TeamId, number>,
  decidedByLot: Set<TeamId>,
): TeamId[] {
  // 1. Nur nach Punkten sortieren.
  const sorted = [...ids].sort((p, q) => comparePoints(stats[p], stats[q]))

  // 2. Blöcke gleicher Punkte über den direkten Vergleich auflösen.
  const result: TeamId[] = []
  let i = 0
  while (i < sorted.length) {
    let j = i + 1
    while (j < sorted.length && stats[sorted[i]].points === stats[sorted[j]].points) j++
    const block = sorted.slice(i, j)
    if (block.length === 1) result.push(block[0])
    else result.push(...breakTie(block, stats, matches, fairPlayByTeam, decidedByLot))
    i = j
  }
  return result
}

/**
 * Teams gleich auf Punkte: erst direkter Vergleich (b–d, rekursiv), dann
 * Gesamt-Kriterien (e–f), Fair-Play (g), Los (h).
 */
function breakTie(
  block: TeamId[],
  stats: Record<TeamId, TeamStats>,
  matches: Match[],
  fairPlayByTeam: Record<TeamId, number>,
  decidedByLot: Set<TeamId>,
): TeamId[] {
  // Direkter Vergleich: Mini-Tabelle nur aus Spielen zwischen den Block-Teams.
  const h2hMatches = matches.filter(
    (m) => block.includes(m.home) && block.includes(m.away),
  )
  const h2hStats = computeStats(block, h2hMatches, fairPlayByTeam)
  const sorted = [...block].sort((p, q) => compareOverall(h2hStats[p], h2hStats[q]))

  const result: TeamId[] = []
  let i = 0
  while (i < sorted.length) {
    let j = i + 1
    while (j < sorted.length && compareOverall(h2hStats[sorted[i]], h2hStats[sorted[j]]) === 0) j++
    const sub = sorted.slice(i, j)
    if (sub.length === 1) {
      result.push(sub[0])
    } else if (sub.length < block.length) {
      // Teilmenge hat sich getrennt → direkten Vergleich auf sie erneut anwenden.
      result.push(...breakTie(sub, stats, matches, fairPlayByTeam, decidedByLot))
    } else {
      // Direkter Vergleich trennt nicht → Gesamt-Kriterien, dann Los.
      result.push(...byOverall(sub, stats, decidedByLot))
    }
    i = j
  }
  return result
}

/** Gesamt-Tordifferenz → Gesamt-Tore → Fair-Play → Los. */
function byOverall(
  sub: TeamId[],
  stats: Record<TeamId, TeamStats>,
  decidedByLot: Set<TeamId>,
): TeamId[] {
  const sorted = [...sub].sort((p, q) => {
    const c = compareGoalDiff(stats[p], stats[q])
    if (c !== 0) return c
    return compareFairPlay(stats[p], stats[q])
  })
  const result: TeamId[] = []
  let i = 0
  while (i < sorted.length) {
    let j = i + 1
    while (
      j < sorted.length &&
      compareGoalDiff(stats[sorted[i]], stats[sorted[j]]) === 0 &&
      compareFairPlay(stats[sorted[i]], stats[sorted[j]]) === 0
    ) {
      j++
    }
    const s2 = sorted.slice(i, j)
    if (s2.length === 1) {
      result.push(s2[0])
    } else {
      for (const id of s2) decidedByLot.add(id)
      result.push(...[...s2].sort((p, q) => p.localeCompare(q)))
    }
    i = j
  }
  return result
}
