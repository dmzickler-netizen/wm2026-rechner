// Kern-Datentypen für die WM-2026-Gruppenphase und K.-o.-Logik.

export type GroupId =
  | 'A' | 'B' | 'C' | 'D' | 'E' | 'F'
  | 'G' | 'H' | 'I' | 'J' | 'K' | 'L'

export const GROUP_IDS: GroupId[] = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L',
]

export type TeamId = string

export interface Team {
  id: TeamId
  name: string
  group: GroupId
  /**
   * Fair-Play-Punkte (negativ) über alle Gruppenspiele.
   * FIFA-Formel je Spieler:
   *   gelbe Karte           = -1
   *   indirekte rote (2. gelb) = -3
   *   direkte rote          = -4
   *   gelb + direkte rote   = -5
   * Wir lassen das als manuell editierbaren Aggregatwert zu, weil
   * Kartenerfassung pro Spiel die UI sprengen würde. 0 = neutral.
   */
  fairPlay: number
}

export interface Match {
  id: string
  group: GroupId
  home: TeamId
  away: TeamId
  /** null = noch nicht gespielt / hypothetisch offen */
  homeGoals: number | null
  awayGoals: number | null
}

/** Aggregierte Tabellenwerte eines Teams (nur gespielte Partien). */
export interface TeamStats {
  team: TeamId
  played: number
  won: number
  drawn: number
  lost: number
  gf: number // goals for
  ga: number // goals against
  gd: number // goal difference
  points: number
  fairPlay: number
}

/** Ein Tabelleneintrag inklusive endgültigem Rang nach Tiebreakern. */
export interface RankedTeam extends TeamStats {
  rank: number // 1-basiert innerhalb der Gruppe
  /** true, wenn der Rang nur durch Losentscheid bestimmt werden konnte. */
  decidedByLot: boolean
}
