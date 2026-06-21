import { useCallback, useEffect, useState } from 'react'
import { buildSeedMatches, buildSeedTeams } from './data/seed'
import type { Match, Team, TeamId } from './fifa/types'

const STORAGE_KEY = 'wm2026-state-v2'

interface State {
  teams: Team[]
  matches: Match[]
}

function loadState(): State {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as State
  } catch {
    /* ignore */
  }
  const teams = buildSeedTeams()
  return { teams, matches: buildSeedMatches(teams) }
}

export function useTournament() {
  const [state, setState] = useState<State>(loadState)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      /* ignore */
    }
  }, [state])

  const setTeamName = useCallback((id: TeamId, name: string) => {
    setState((s) => ({
      ...s,
      teams: s.teams.map((t) => (t.id === id ? { ...t, name } : t)),
    }))
  }, [])

  const setFairPlay = useCallback((id: TeamId, fairPlay: number) => {
    setState((s) => ({
      ...s,
      teams: s.teams.map((t) => (t.id === id ? { ...t, fairPlay } : t)),
    }))
  }, [])

  const setScore = useCallback(
    (matchId: string, homeGoals: number | null, awayGoals: number | null) => {
      setState((s) => ({
        ...s,
        matches: s.matches.map((m) =>
          m.id === matchId ? { ...m, homeGoals, awayGoals } : m,
        ),
      }))
    },
    [],
  )

  const reset = useCallback(() => {
    const teams = buildSeedTeams()
    setState({ teams, matches: buildSeedMatches(teams) })
  }, [])

  const clearResults = useCallback(() => {
    setState((s) => ({
      ...s,
      matches: s.matches.map((m) => ({ ...m, homeGoals: null, awayGoals: null })),
    }))
  }, [])

  return { ...state, setTeamName, setFairPlay, setScore, reset, clearResults }
}
