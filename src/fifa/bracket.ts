import {
  R32_MATCHES,
  getThirdPlaceAssignment,
  WINNER_TO_THIRD_MATCH,
} from '../r32Bracket'
import type { R32Slot } from '../r32Bracket'
import type { GroupId, RankedTeam } from './types'

/**
 * K.-o.-Phase der WM 2026 (48 Teams): 32 Mannschaften, Spiele 73–104.
 *
 * Die R32-Paarungen (73–88) kommen aus der offiziellen FIFA-Tabelle
 * (src/r32Bracket.ts, Annex C). Die Zuordnung der 8 Gruppendritten hängt davon
 * ab, aus welchen Gruppen sie kommen – das löst `getThirdPlaceAssignment`.
 *
 * Der Turnierbaum ab dem Achtelfinale (Round of 16) ist fest verdrahtet
 * (verifiziert gegen die offizielle Bracket-Struktur).
 */

export interface ResolvedMatch {
  matchNo: number
  round: RoundKey
  home: string
  away: string
}

export type RoundKey = 'R32' | 'R16' | 'QF' | 'SF' | 'F'

export const ROUND_LABEL: Record<RoundKey, string> = {
  R32: 'Sechzehntelfinale',
  R16: 'Achtelfinale',
  QF: 'Viertelfinale',
  SF: 'Halbfinale',
  F: 'Finale',
}

/** Welche zwei Vorrunden-Sieger in ein K.-o.-Spiel ab R16 einlaufen. */
export const FEEDERS: Record<number, [number, number]> = {
  89: [74, 77], 90: [73, 75], 91: [76, 78], 92: [79, 80],
  93: [83, 84], 94: [81, 82], 95: [86, 88], 96: [85, 87],
  97: [89, 90], 98: [93, 94], 99: [91, 92], 100: [95, 96],
  101: [97, 98], 102: [99, 100],
  104: [101, 102],
}

/** Kind-Match -> Eltern-Match (invertierte FEEDERS). */
export const PARENT: Record<number, number> = (() => {
  const p: Record<number, number> = {}
  for (const [parent, kids] of Object.entries(FEEDERS)) {
    for (const k of kids) p[k] = Number(parent)
  }
  return p
})()

export function roundOf(matchNo: number): RoundKey {
  if (matchNo >= 73 && matchNo <= 88) return 'R32'
  if (matchNo >= 89 && matchNo <= 96) return 'R16'
  if (matchNo >= 97 && matchNo <= 100) return 'QF'
  if (matchNo >= 101 && matchNo <= 102) return 'SF'
  return 'F'
}

/**
 * Baut die teamOf-Funktion: Slot-Label ('1A','2B','3E') -> Teamname,
 * basierend auf der aktuellen (ggf. vorläufigen) Tabellensituation.
 */
export function buildTeamOf(
  standings: Record<GroupId, RankedTeam[]>,
  nameOf: (id: string) => string,
): (label: string) => string {
  return (label: string) => {
    const pos = Number(label[0]) // 1,2,3
    const group = label.slice(1) as GroupId
    const row = standings[group]?.find((r) => r.rank === pos)
    return row ? nameOf(row.team) : label
  }
}

/**
 * Löst alle 16 R32-Paarungen auf. `qualifiedThirdGroups` = die 8 Gruppen,
 * deren Dritte weiterkommen. Liefert null, wenn die Kombination ungültig ist
 * (z.B. nicht exakt 8 Gruppen).
 */
export function resolveR32Bracket(
  qualifiedThirdGroups: GroupId[],
  teamOf: (label: string) => string,
): ResolvedMatch[] | null {
  const assign = getThirdPlaceAssignment(qualifiedThirdGroups)
  if (!assign) return null

  const label = (s: R32Slot, matchNo: number): string => {
    if (s.type === 'winner') return teamOf('1' + s.group)
    if (s.type === 'runnerUp') return teamOf('2' + s.group)
    // third: Siegergruppe dieses Matches finden -> zugewiesene Dritt-Gruppe
    const winnerGroup = (Object.keys(WINNER_TO_THIRD_MATCH) as GroupId[]).find(
      (g) => WINNER_TO_THIRD_MATCH[g] === matchNo,
    )
    const thirdGroup = winnerGroup
      ? assign[('1' + winnerGroup) as keyof typeof assign]
      : undefined
    return thirdGroup ? teamOf('3' + thirdGroup) : '3.?'
  }

  return R32_MATCHES.map((m) => ({
    matchNo: m.matchNo,
    round: 'R32' as RoundKey,
    home: label(m.home, m.matchNo),
    away: label(m.away, m.matchNo),
  }))
}

/** Alle R32-Match-Nummern (Blätter) unterhalb eines Match-Knotens. */
function leafMatches(matchNo: number): number[] {
  if (roundOf(matchNo) === 'R32') return [matchNo]
  const [a, b] = FEEDERS[matchNo]
  return [...leafMatches(a), ...leafMatches(b)]
}

/** Beide Teams eines R32-Spiels. */
function teamsInLeaf(matchNo: number, resolved: ResolvedMatch[]): string[] {
  const m = resolved.find((r) => r.matchNo === matchNo)
  return m ? [m.home, m.away] : []
}

export interface RoundOpponents {
  round: RoundKey
  /** Mögliche Gegner in dieser Runde (alle Teams, die ins Gegner-Teilbaum-Finale kommen könnten). */
  opponents: string[]
}

export interface OpponentPath {
  r32MatchNo: number
  r32Opponent: string
  /** Mögliche Gegner pro Runde ab Achtelfinale (Gegner = Sieger des Schwester-Teilbaums). */
  rounds: RoundOpponents[]
}

/**
 * Ermittelt für ein Team den Gegner-Pfad durchs Bracket:
 *   - fester R32-Gegner (andere Seite des eigenen R32-Spiels)
 *   - pro Folgerunde die Menge der möglichen Gegner
 *     (= alle Teams im Schwester-Teilbaum des jeweiligen Knotens).
 */
export function opponentPath(
  team: string,
  resolved: ResolvedMatch[],
): OpponentPath | null {
  const myLeaf = resolved.find((r) => r.home === team || r.away === team)
  if (!myLeaf) return null

  const r32Opponent = myLeaf.home === team ? myLeaf.away : myLeaf.home

  const rounds: RoundOpponents[] = []
  let current = myLeaf.matchNo
  while (PARENT[current] != null) {
    const parent = PARENT[current]
    const [a, b] = FEEDERS[parent]
    const sibling = a === current ? b : a
    const opponents = leafMatches(sibling)
      .flatMap((mn) => teamsInLeaf(mn, resolved))
      .filter(Boolean)
    rounds.push({ round: roundOf(parent), opponents })
    current = parent
  }

  return { r32MatchNo: myLeaf.matchNo, r32Opponent, rounds }
}
