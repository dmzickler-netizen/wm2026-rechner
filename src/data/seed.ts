import { GROUP_IDS } from '../fifa/types'
import type { GroupId, Match, Team } from '../fifa/types'
import wc2026 from './wc2026.json'

/**
 * Seed-Datensatz: echte WM-2026-Auslosung + aktueller Spielstand
 * (siehe data/wc2026.json, Quelle Wikipedia, Stand 2026-06-21).
 * Teamnamen bleiben in der UI editierbar.
 */

type GroupData = { teams: string[]; matches: [string, string, number | null, number | null][] }
const GROUPS = (wc2026 as { groups: Record<string, GroupData> }).groups

export function buildSeedTeams(): Team[] {
  const teams: Team[] = []
  for (const g of GROUP_IDS) {
    const data = GROUPS[g]
    data.teams.forEach((name, i) => {
      teams.push({ id: `${g}${i + 1}`, name, group: g as GroupId, fairPlay: 0 })
    })
  }
  return teams
}

export function buildSeedMatches(teams: Team[]): Match[] {
  const matches: Match[] = []
  for (const g of GROUP_IDS) {
    const data = GROUPS[g]
    const idByName: Record<string, string> = {}
    teams
      .filter((t) => t.group === g)
      .forEach((t) => {
        idByName[t.name] = t.id
      })
    data.matches.forEach((m, i) => {
      const [home, away, hg, ag] = m
      matches.push({
        id: `${g}${i + 1}`,
        group: g as GroupId,
        home: idByName[home],
        away: idByName[away],
        homeGoals: hg,
        awayGoals: ag,
      })
    })
  }
  return matches
}
