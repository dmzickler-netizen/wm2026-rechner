import { useMemo, useState } from 'react'
import { useTournament } from './store'
import { rankGroup } from './fifa/standings'
import { possiblePositions } from './fifa/scenarios'
import { rankThirdPlaced, type ThirdPlaceEntry } from './fifa/thirdPlace'
import {
  resolveR32Bracket,
  buildTeamOf,
  opponentPath,
  ROUND_LABEL,
  type ResolvedMatch,
} from './fifa/bracket'
import { GROUP_IDS } from './fifa/types'
import type { GroupId, Match, RankedTeam, Team } from './fifa/types'

export default function App() {
  const t = useTournament()
  const [group, setGroup] = useState<GroupId>('A')
  const [myTeam, setMyTeam] = useState<string>('')

  const teamsById = useMemo(
    () => Object.fromEntries(t.teams.map((x) => [x.id, x] as const)),
    [t.teams],
  )
  const nameOf = (id: string) => teamsById[id]?.name || id

  // Tabellen aller Gruppen.
  const standings = useMemo(() => {
    const out: Record<GroupId, RankedTeam[]> = {} as Record<GroupId, RankedTeam[]>
    for (const g of GROUP_IDS) {
      const ids = t.teams.filter((x) => x.group === g).map((x) => x.id)
      const fp = Object.fromEntries(
        t.teams
          .filter((x) => x.group === g)
          .map((x) => [x.id, x.fairPlay] as const),
      )
      const ms = t.matches.filter((m) => m.group === g)
      out[g] = rankGroup(ids, ms, fp)
    }
    return out
  }, [t.teams, t.matches])

  // Dritten-Ranking (über alle 12 Gruppen).
  const thirdRanking = useMemo<ThirdPlaceEntry[]>(() => {
    const thirds = GROUP_IDS.map((g) => ({
      group: g,
      team: standings[g].find((r) => r.rank === 3)!,
    })).filter((x) => x.team)
    return rankThirdPlaced(thirds)
  }, [standings])

  return (
    <div className="app">
      <header>
        <h1>⚽ WM 2026 – Gegner-Rechner</h1>
        <p className="sub">
          Ergebnisse eingeben → Tabellen, Tiebreaker und mögliche Gegner.
          Alle FIFA-Regeln (Punkte, direkter Vergleich, Tordifferenz, Tore,
          Fair-Play, Los) werden berücksichtigt.
        </p>
        <div className="toolbar">
          <label className="myteam">
            Mein Team:
            <select value={myTeam} onChange={(e) => setMyTeam(e.target.value)}>
              <option value="">– wählen –</option>
              {GROUP_IDS.map((g) => (
                <optgroup key={g} label={`Gruppe ${g}`}>
                  {t.teams
                    .filter((x) => x.group === g)
                    .map((x) => (
                      <option key={x.id} value={x.id}>
                        {x.name}
                      </option>
                    ))}
                </optgroup>
              ))}
            </select>
          </label>
          <button onClick={t.clearResults}>Ergebnisse leeren</button>
          <button onClick={t.reset}>Alles zurücksetzen</button>
        </div>
      </header>

      {myTeam && (
        <MyTeamPanel
          team={teamsById[myTeam]}
          standings={standings}
          thirdRanking={thirdRanking}
          matches={t.matches}
          teams={t.teams}
          nameOf={nameOf}
        />
      )}

      <nav className="tabs">
        {GROUP_IDS.map((g) => (
          <button
            key={g}
            className={g === group ? 'active' : ''}
            onClick={() => setGroup(g)}
          >
            {g}
          </button>
        ))}
      </nav>

      <GroupView
        group={group}
        teams={t.teams.filter((x) => x.group === group)}
        matches={t.matches.filter((m) => m.group === group)}
        ranked={standings[group]}
        nameOf={nameOf}
        onName={t.setTeamName}
        onFairPlay={t.setFairPlay}
        onScore={t.setScore}
        myTeam={myTeam}
      />

      <ThirdPlacePanel ranking={thirdRanking} nameOf={nameOf} />

      <OpponentsPanel
        standings={standings}
        thirdRanking={thirdRanking}
        myTeam={myTeam}
        nameOf={nameOf}
      />
    </div>
  )
}

function GroupView(props: {
  group: GroupId
  teams: Team[]
  matches: Match[]
  ranked: RankedTeam[]
  nameOf: (id: string) => string
  onName: (id: string, name: string) => void
  onFairPlay: (id: string, fp: number) => void
  onScore: (id: string, h: number | null, a: number | null) => void
  myTeam: string
}) {
  const { ranked, nameOf, myTeam } = props
  return (
    <section className="group">
      <div className="cols">
        <div>
          <h2>Gruppe {props.group} – Tabelle</h2>
          <table className="standings">
            <thead>
              <tr>
                <th>#</th>
                <th className="l">Team</th>
                <th>Sp</th>
                <th>S</th>
                <th>U</th>
                <th>N</th>
                <th>Tore</th>
                <th>TD</th>
                <th>Pkt</th>
              </tr>
            </thead>
            <tbody>
              {ranked.map((r) => (
                <tr
                  key={r.team}
                  className={[
                    r.rank <= 2 ? 'adv' : r.rank === 3 ? 'maybe' : 'out',
                    r.team === myTeam ? 'mine' : '',
                  ].join(' ')}
                >
                  <td>
                    {r.rank}
                    {r.decidedByLot ? ' 🎲' : ''}
                  </td>
                  <td className="l">{nameOf(r.team)}</td>
                  <td>{r.played}</td>
                  <td>{r.won}</td>
                  <td>{r.drawn}</td>
                  <td>{r.lost}</td>
                  <td>
                    {r.gf}:{r.ga}
                  </td>
                  <td>{r.gd > 0 ? `+${r.gd}` : r.gd}</td>
                  <td>
                    <b>{r.points}</b>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="legend">
            <span className="dot adv" /> 1./2. → weiter &nbsp;
            <span className="dot maybe" /> 3. → evtl. weiter &nbsp;
            <span className="dot out" /> raus &nbsp; 🎲 = Losentscheid
          </p>

          <h3>Teams &amp; Fair-Play</h3>
          <table className="teamedit">
            <tbody>
              {props.teams.map((tm) => (
                <tr key={tm.id}>
                  <td>
                    <input
                      value={tm.name}
                      onChange={(e) => props.onName(tm.id, e.target.value)}
                    />
                  </td>
                  <td className="fp">
                    Fair-Play:
                    <input
                      type="number"
                      value={tm.fairPlay}
                      onChange={(e) =>
                        props.onFairPlay(tm.id, Number(e.target.value) || 0)
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <h2>Ergebnisse</h2>
          <div className="matches">
            {props.matches.map((m) => (
              <div className="match" key={m.id}>
                <span className="tn r">{nameOf(m.home)}</span>
                <input
                  type="number"
                  min={0}
                  value={m.homeGoals ?? ''}
                  onChange={(e) =>
                    props.onScore(
                      m.id,
                      e.target.value === '' ? null : Number(e.target.value),
                      m.awayGoals,
                    )
                  }
                />
                <span className="colon">:</span>
                <input
                  type="number"
                  min={0}
                  value={m.awayGoals ?? ''}
                  onChange={(e) =>
                    props.onScore(
                      m.id,
                      m.homeGoals,
                      e.target.value === '' ? null : Number(e.target.value),
                    )
                  }
                />
                <span className="tn">{nameOf(m.away)}</span>
              </div>
            ))}
          </div>
          <p className="hint">
            Leeres Feld = Spiel noch offen. Offene Spiele werden in der
            „Kommt weiter?"-Analyse durchgerechnet.
          </p>
        </div>
      </div>
    </section>
  )
}

function MyTeamPanel(props: {
  team: Team
  standings: Record<GroupId, RankedTeam[]>
  thirdRanking: ThirdPlaceEntry[]
  matches: Match[]
  teams: Team[]
  nameOf: (id: string) => string
}) {
  const { team, matches, teams } = props
  const analysis = useMemo(() => {
    const ids = teams.filter((x) => x.group === team.group).map((x) => x.id)
    const fp = Object.fromEntries(
      teams
        .filter((x) => x.group === team.group)
        .map((x) => [x.id, x.fairPlay] as const),
    )
    const ms = matches.filter((m) => m.group === team.group)
    return possiblePositions(team.id, ids, ms, fp)
  }, [team, matches, teams])

  const pos = props.standings[team.group].find((r) => r.team === team.id)
  const reach = [...analysis.reachable].sort((a, b) => a - b)

  // Status für direkte Quali (Platz 1/2).
  let verdict: { cls: string; text: string }
  if (reach.length === 0) {
    verdict = { cls: 'out', text: 'Keine Daten' }
  } else if (analysis.worst <= 2) {
    verdict = { cls: 'adv', text: 'Sicher weiter (mind. Platz 2)' }
  } else if (analysis.best >= 4) {
    verdict = { cls: 'out', text: 'Ausgeschieden' }
  } else if (analysis.best <= 2) {
    verdict = {
      cls: 'maybe',
      text: `Weiterkommen möglich (Plätze ${reach.join('/')})`,
    }
  } else {
    verdict = {
      cls: 'maybe',
      text: `Nur als Gruppendritter möglich (Plätze ${reach.join('/')})`,
    }
  }

  // Position des Dritten im Cross-Gruppen-Ranking, falls relevant.
  const thirdEntry = props.thirdRanking.find((e) => e.team === team.id)

  return (
    <section className={`myteam-panel ${verdict.cls}`}>
      <h2>
        {team.name} <span className="grp">(Gruppe {team.group})</span>
      </h2>
      <div className="verdict">{verdict.text}</div>
      <ul className="facts">
        <li>
          Aktueller Platz: <b>{pos?.rank ?? '–'}</b> mit {pos?.points ?? 0} Pkt
          (TD {pos && pos.gd > 0 ? '+' : ''}
          {pos?.gd ?? 0})
        </li>
        <li>
          Erreichbare Endplätze: <b>{reach.join(', ') || '–'}</b>
        </li>
        <li>
          Durchgerechnete Szenarien: {analysis.scenarios.toLocaleString('de')}
          {analysis.approximated && ' (genähert: nur S/U/N statt aller Tore)'}
        </li>
        {reach.includes(3) && (
          <li>
            Als Gruppendritter aktuell Rang{' '}
            <b>{thirdEntry?.rank ?? '–'}/12</b> der Dritten →{' '}
            {thirdEntry?.qualifies
              ? 'aktuell unter den besten 8 ✅'
              : 'aktuell NICHT unter den besten 8 ❌'}{' '}
            (nur die 8 besten Dritten kommen weiter)
          </li>
        )}
      </ul>
    </section>
  )
}

function ThirdPlacePanel(props: {
  ranking: ThirdPlaceEntry[]
  nameOf: (id: string) => string
}) {
  return (
    <section className="thirds">
      <h2>Rangliste der Gruppendritten (8 von 12 kommen weiter)</h2>
      <table className="standings">
        <thead>
          <tr>
            <th>#</th>
            <th className="l">Team</th>
            <th>Gr.</th>
            <th>Pkt</th>
            <th>TD</th>
            <th>Tore</th>
            <th>FP</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {props.ranking.map((e) => (
            <tr key={e.team} className={e.qualifies ? 'adv' : 'out'}>
              <td>
                {e.rank}
                {e.decidedByLot ? ' 🎲' : ''}
              </td>
              <td className="l">{props.nameOf(e.team)}</td>
              <td>{e.group}</td>
              <td>
                <b>{e.points}</b>
              </td>
              <td>{e.gd > 0 ? `+${e.gd}` : e.gd}</td>
              <td>{e.gf}</td>
              <td>{e.fairPlay}</td>
              <td>{e.qualifies ? '✅' : '❌'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}

function OpponentsPanel(props: {
  standings: Record<GroupId, RankedTeam[]>
  thirdRanking: ThirdPlaceEntry[]
  myTeam: string
  nameOf: (id: string) => string
}) {
  const { standings, thirdRanking, myTeam, nameOf } = props

  const resolved = useMemo<ResolvedMatch[] | null>(() => {
    const thirdGroups = thirdRanking
      .filter((e) => e.qualifies)
      .map((e) => e.group)
    if (thirdGroups.length !== 8) return null
    const teamOf = buildTeamOf(standings, nameOf)
    return resolveR32Bracket(thirdGroups, teamOf)
  }, [standings, thirdRanking, nameOf])

  const myName = myTeam ? nameOf(myTeam) : ''
  const path = useMemo(
    () => (resolved && myName ? opponentPath(myName, resolved) : null),
    [resolved, myName],
  )

  if (!resolved) {
    return (
      <section className="opponents">
        <h2>Mögliche Gegner (K.-o.-Phase)</h2>
        <div className="notice">Bracket konnte nicht aufgelöst werden.</div>
      </section>
    )
  }

  return (
    <section className="opponents">
      <h2>Mögliche Gegner (K.-o.-Phase)</h2>
      <p className="hint">
        Basierend auf der <b>aktuellen Tabellensituation</b> (1./2. je Gruppe +
        die 8 besten Dritten). Ändert sich live mit den Ergebnissen. Der
        R32-Gegner steht fest; ab Achtelfinale sind es die möglichen Gegner
        (Sieger des jeweiligen Bracket-Asts).
      </p>

      {myTeam && (
        <div className="mypath">
          <h3>Weg von {myName}</h3>
          {path ? (
            <ol className="path">
              <li>
                <span className="r">Sechzehntelfinale (R32)</span>
                <span className="opp">vs {path.r32Opponent}</span>
              </li>
              {path.rounds.map((r) => (
                <li key={r.round}>
                  <span className="r">{ROUND_LABEL[r.round]}</span>
                  <span className="opp">
                    {r.opponents.length === 1 ? 'vs ' : 'mögl. Gegner: '}
                    {r.opponents.join(', ')}
                  </span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="notice">
              {myName} ist nach aktueller Tabelle <b>nicht im Achtelfinale</b>{' '}
              (nicht unter Top 2 der Gruppe und nicht unter den 8 besten
              Dritten).
            </p>
          )}
        </div>
      )}

      <h3>Komplettes Sechzehntelfinale (R32)</h3>
      <table className="bracket">
        <tbody>
          {resolved.map((m) => (
            <tr
              key={m.matchNo}
              className={
                m.home === myName || m.away === myName ? 'mine' : ''
              }
            >
              <td className="mno">#{m.matchNo}</td>
              <td className="r">{m.home}</td>
              <td className="vs">–</td>
              <td className="l">{m.away}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
