import { rankGroup } from './standings'
import type { Match, TeamId } from './types'

export interface PositionResult {
  /** Endplatzierungen (1..4), die das Team noch erreichen kann. */
  reachable: Set<number>
  /** Garantierte Mindest-/Höchstplatzierung über alle Szenarien. */
  best: number
  worst: number
  /** Gesamtzahl betrachteter Szenarien (Kombinationen offener Spiele). */
  scenarios: number
  /** true, wenn wegen zu vieler offener Spiele nur W/U/N statt Tore variiert wurde. */
  approximated: boolean
}

/**
 * Erzeugt alle Ergebnis-Kombinationen für die offenen Spiele einer Gruppe.
 * Bei wenigen offenen Spielen werden echte Torergebnisse (0..maxGoals) variiert,
 * sodass Tordifferenz-Tiebreaker exakt berücksichtigt werden. Werden es zu
 * viele Kombinationen, fällt die Funktion auf Sieg/Unentschieden/Niederlage
 * (mit 1:0 / 0:0 / 0:1) zurück – dann ist die Tordifferenz nur grob.
 */
export function* enumerateOutcomes(
  matches: Match[],
  maxGoals = 5,
  combinationLimit = 300_000,
): Generator<{ outcome: Match[]; approximated: boolean }> {
  const open = matches.filter((m) => m.homeGoals == null || m.awayGoals == null)
  const fixed = matches.filter((m) => m.homeGoals != null && m.awayGoals != null)

  if (open.length === 0) {
    yield { outcome: fixed, approximated: false }
    return
  }

  const perMatchScores = (maxGoals + 1) * (maxGoals + 1)
  const exactCombos = Math.pow(perMatchScores, open.length)
  const useExact = exactCombos <= combinationLimit

  // Mögliche Ergebnisse je offenem Spiel.
  const options: [number, number][][] = open.map(() => {
    if (useExact) {
      const list: [number, number][] = []
      for (let h = 0; h <= maxGoals; h++)
        for (let a = 0; a <= maxGoals; a++) list.push([h, a])
      return list
    }
    // Näherung: Heimsieg, Unentschieden, Auswärtssieg.
    return [
      [1, 0],
      [0, 0],
      [0, 1],
    ]
  })

  // Kartesisches Produkt iterativ.
  const idx = new Array(open.length).fill(0)
  while (true) {
    const outcome: Match[] = open.map((m, k) => ({
      ...m,
      homeGoals: options[k][idx[k]][0],
      awayGoals: options[k][idx[k]][1],
    }))
    yield { outcome: [...fixed, ...outcome], approximated: !useExact }

    // Inkrement.
    let p = open.length - 1
    while (p >= 0) {
      idx[p]++
      if (idx[p] < options[p].length) break
      idx[p] = 0
      p--
    }
    if (p < 0) break
  }
}

/**
 * Ermittelt, welche Endplatzierungen ein Team in seiner Gruppe noch erreichen
 * kann, über alle Ergebnis-Kombinationen der offenen Spiele.
 */
export function possiblePositions(
  team: TeamId,
  teamIds: TeamId[],
  matches: Match[],
  fairPlayByTeam: Record<TeamId, number> = {},
  maxGoals = 5,
): PositionResult {
  const reachable = new Set<number>()
  let scenarios = 0
  let approximated = false

  for (const { outcome, approximated: approx } of enumerateOutcomes(matches, maxGoals)) {
    approximated = approximated || approx
    const ranked = rankGroup(teamIds, outcome, fairPlayByTeam)
    const pos = ranked.find((r) => r.team === team)?.rank
    if (pos) reachable.add(pos)
    scenarios++
  }

  const arr = [...reachable]
  return {
    reachable,
    best: arr.length ? Math.min(...arr) : 0,
    worst: arr.length ? Math.max(...arr) : 0,
    scenarios,
    approximated,
  }
}
