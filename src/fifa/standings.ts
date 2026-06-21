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

/** Vergleich nach den Gesamtkriterien a) Punkte b) Tordifferenz c) Tore. */
function compareOverall(x: TeamStats, y: TeamStats): number {
  if (y.points !== x.points) return y.points - x.points
  if (y.gd !== x.gd) return y.gd - x.gd
  if (y.gf !== x.gf) return y.gf - x.gf
  return 0
}

/** Vergleich nach Fair-Play (weniger negative Punkte = besser). */
function compareFairPlay(x: TeamStats, y: TeamStats): number {
  return y.fairPlay - x.fairPlay
}

/**
 * Rangordnung einer Gruppe nach offiziellem FIFA-Regelwerk:
 *   a) Punkte (gesamt)
 *   b) Tordifferenz (gesamt)
 *   c) erzielte Tore (gesamt)
 *   — bei Gleichstand zwischen 2+ Teams, nur untereinander: —
 *   d) Punkte im direkten Vergleich
 *   e) Tordifferenz im direkten Vergleich
 *   f) erzielte Tore im direkten Vergleich
 *   g) Fair-Play-Wertung (gesamt)
 *   h) Losentscheid
 *
 * Hinweis zur Rekursion: Die Kriterien d–f werden ausschließlich auf die
 * untereinander noch gleichen Teams angewandt. Trennt sich dort eine
 * Teilmenge ab, bleibt die kleinere gleiche Restmenge übrig und d–f werden
 * darauf erneut angewandt; erst danach g) und h).
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
  // 1. Nach Gesamtkriterien sortieren.
  const sorted = [...ids].sort((p, q) => compareOverall(stats[p], stats[q]))

  // 2. Blöcke gleicher Teams (nach a–c) finden und intern per H2H auflösen.
  const result: TeamId[] = []
  let i = 0
  while (i < sorted.length) {
    let j = i + 1
    while (
      j < sorted.length &&
      compareOverall(stats[sorted[i]], stats[sorted[j]]) === 0
    ) {
      j++
    }
    const block = sorted.slice(i, j)
    if (block.length === 1) {
      result.push(block[0])
    } else {
      result.push(
        ...breakTie(block, matches, fairPlayByTeam, decidedByLot),
      )
    }
    i = j
  }
  return result
}

/**
 * Löst einen Block von Teams auf, die nach a–c gleich sind.
 * Wendet d–f (direkter Vergleich) an, danach g (Fair-Play), dann h (Los).
 */
function breakTie(
  block: TeamId[],
  matches: Match[],
  fairPlayByTeam: Record<TeamId, number>,
  decidedByLot: Set<TeamId>,
): TeamId[] {
  // Direkter Vergleich: Mini-Tabelle nur aus Spielen zwischen den Block-Teams.
  const h2hMatches = matches.filter(
    (m) => block.includes(m.home) && block.includes(m.away),
  )
  const h2hStats = computeStats(block, h2hMatches, fairPlayByTeam)

  const sorted = [...block].sort((p, q) => {
    const c = compareOverall(h2hStats[p], h2hStats[q])
    if (c !== 0) return c
    return compareFairPlay(h2hStats[p], h2hStats[q])
  })

  // Erneut Blöcke bilden: Teams, die auch nach d–f + g noch gleich sind.
  const result: TeamId[] = []
  let i = 0
  while (i < sorted.length) {
    let j = i + 1
    while (
      j < sorted.length &&
      compareOverall(h2hStats[sorted[i]], h2hStats[sorted[j]]) === 0 &&
      compareFairPlay(h2hStats[sorted[i]], h2hStats[sorted[j]]) === 0
    ) {
      j++
    }
    const sub = sorted.slice(i, j)
    if (sub.length === 1) {
      result.push(sub[0])
    } else if (sub.length < block.length) {
      // Echte Teilmenge hat sich nicht getrennt → d–f erneut auf sie anwenden.
      result.push(...breakTie(sub, matches, fairPlayByTeam, decidedByLot))
    } else {
      // Nichts hat sich getrennt → Losentscheid (deterministisch, markiert).
      for (const id of sub) decidedByLot.add(id)
      result.push(...[...sub].sort((p, q) => p.localeCompare(q)))
    }
    i = j
  }
  return result
}
