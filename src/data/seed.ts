import { makeGroupSchedule } from '../fifa/schedule'
import { GROUP_IDS } from '../fifa/types'
import type { GroupId, Match, Team } from '../fifa/types'

/**
 * Seed-Datensatz: 12 Gruppen (A–L) mit je 4 Platzhalter-Teams.
 * Teamnamen sind in der UI frei editierbar – hier nur Platzhalter,
 * weil die offizielle Auslosung jederzeit ersetzt werden kann.
 */
export function buildSeedTeams(): Team[] {
  const teams: Team[] = []
  for (const g of GROUP_IDS) {
    for (let i = 1; i <= 4; i++) {
      teams.push({
        id: `${g}${i}`,
        name: `${g}${i}`,
        group: g as GroupId,
        fairPlay: 0,
      })
    }
  }
  return teams
}

export function buildSeedMatches(teams: Team[]): Match[] {
  const matches: Match[] = []
  for (const g of GROUP_IDS) {
    const ids = teams.filter((t) => t.group === g).map((t) => t.id)
    matches.push(...makeGroupSchedule(g as GroupId, ids))
  }
  return matches
}
