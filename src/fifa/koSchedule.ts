// K.-o.-Spielplan der WM 2026 (Spiele 73–104, inkl. 103 = Spiel um Platz 3).
// Quelle: offizieller FIFA-Spielplan / Wikipedia '2026 FIFA World Cup knockout stage'.
// iso = Anstoß in UTC; formatKickoffBerlin() rechnet in Berliner Zeit um.
// Hinweis: Diese Daten spiegeln die Tabelle in standalone/app.js (KO_SCHEDULE).
// Bei Änderungen bitte beide Stellen pflegen.

export interface KoMatchInfo {
  iso: string
  venue: string
}

export const KO_SCHEDULE: Record<number, KoMatchInfo> = {
  73: { iso: '2026-06-28T19:00:00Z', venue: 'SoFi Stadium, Los Angeles' },
  74: { iso: '2026-06-29T20:30:00Z', venue: 'Gillette Stadium, Boston' },
  75: { iso: '2026-06-30T01:00:00Z', venue: 'Estadio BBVA, Monterrey' },
  76: { iso: '2026-06-29T17:00:00Z', venue: 'NRG Stadium, Houston' },
  77: { iso: '2026-06-30T21:00:00Z', venue: 'MetLife Stadium, New York/NJ' },
  78: { iso: '2026-06-30T17:00:00Z', venue: 'AT&T Stadium, Dallas' },
  79: { iso: '2026-07-01T01:00:00Z', venue: 'Estadio Azteca, Mexiko-Stadt' },
  80: { iso: '2026-07-01T16:00:00Z', venue: 'Mercedes-Benz Stadium, Atlanta' },
  81: { iso: '2026-07-02T00:00:00Z', venue: "Levi's Stadium, San Francisco" },
  82: { iso: '2026-07-01T20:00:00Z', venue: 'Lumen Field, Seattle' },
  83: { iso: '2026-07-02T23:00:00Z', venue: 'BMO Field, Toronto' },
  84: { iso: '2026-07-02T19:00:00Z', venue: 'SoFi Stadium, Los Angeles' },
  85: { iso: '2026-07-03T03:00:00Z', venue: 'BC Place, Vancouver' },
  86: { iso: '2026-07-03T22:00:00Z', venue: 'Hard Rock Stadium, Miami' },
  87: { iso: '2026-07-04T01:30:00Z', venue: 'Arrowhead Stadium, Kansas City' },
  88: { iso: '2026-07-03T18:00:00Z', venue: 'AT&T Stadium, Dallas' },
  89: { iso: '2026-07-04T21:00:00Z', venue: 'Lincoln Financial Field, Philadelphia' },
  90: { iso: '2026-07-04T17:00:00Z', venue: 'NRG Stadium, Houston' },
  91: { iso: '2026-07-05T20:00:00Z', venue: 'MetLife Stadium, New York/NJ' },
  92: { iso: '2026-07-06T00:00:00Z', venue: 'Estadio Azteca, Mexiko-Stadt' },
  93: { iso: '2026-07-06T19:00:00Z', venue: 'AT&T Stadium, Dallas' },
  94: { iso: '2026-07-07T00:00:00Z', venue: 'Lumen Field, Seattle' },
  95: { iso: '2026-07-07T16:00:00Z', venue: 'Mercedes-Benz Stadium, Atlanta' },
  96: { iso: '2026-07-07T20:00:00Z', venue: 'BC Place, Vancouver' },
  97: { iso: '2026-07-09T20:00:00Z', venue: 'Gillette Stadium, Boston' },
  98: { iso: '2026-07-10T19:00:00Z', venue: 'SoFi Stadium, Los Angeles' },
  99: { iso: '2026-07-11T21:00:00Z', venue: 'Hard Rock Stadium, Miami' },
  100: { iso: '2026-07-12T01:00:00Z', venue: 'Arrowhead Stadium, Kansas City' },
  101: { iso: '2026-07-14T19:00:00Z', venue: 'AT&T Stadium, Dallas' },
  102: { iso: '2026-07-15T19:00:00Z', venue: 'Mercedes-Benz Stadium, Atlanta' },
  103: { iso: '2026-07-18T21:00:00Z', venue: 'Hard Rock Stadium, Miami' },
  104: { iso: '2026-07-19T19:00:00Z', venue: 'MetLife Stadium, New York/NJ' },
}

// Erlaubte Herkunftsgruppen der Drittplatzierten je 'Sieger vs 3.'-Spiel
// (Fallback-Anzeige, falls die Tabelle den konkreten Dritten noch nicht hergibt).
export const THIRD_ALLOWED: Record<number, string> = {
  74: 'A/B/C/D/F',
  77: 'C/D/F/G/H',
  79: 'C/E/F/H/I',
  80: 'E/H/I/J/K',
  81: 'B/E/F/I/J',
  82: 'A/E/H/I/J',
  85: 'E/F/G/I/J',
  87: 'D/E/I/J/L',
}

/** Anstoß (UTC-ISO) -> Berliner Zeit, deutsch formatiert ("Mo., 29.06., 22:30 Uhr"). */
export function formatKickoffBerlin(iso: string | undefined): string {
  if (!iso) return ''
  try {
    const s = new Date(iso).toLocaleString('de-DE', {
      timeZone: 'Europe/Berlin',
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
    return s + ' Uhr'
  } catch {
    return ''
  }
}
