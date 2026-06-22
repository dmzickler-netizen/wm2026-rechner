# WM 2026 – Gegner-Rechner

Web-App zum Durchrechnen der WM-2026-Gruppenphase (48 Teams, 12 Gruppen) und
der möglichen K.-o.-Gegner. Berücksichtigt das vollständige FIFA-Regelwerk für
die Rangfolge.

## Features

- **Gruppen-Tabellen A–L** mit allen FIFA-Tiebreakern:
  Punkte → Tordifferenz → Tore → direkter Vergleich (Punkte/TD/Tore) →
  Fair-Play → Los (markiert mit 🎲).
- **Editierbare Ergebnisse & Teamnamen** (lokal im Browser gespeichert).
- **„Kommt mein Team weiter?"** – rechnet alle Ergebnis-Kombinationen der
  offenen Spiele durch und zeigt erreichbare Endplätze, garantierte
  Quali / Aus / „nur als Gruppendritter möglich".
- **Rangliste der Gruppendritten** (die besten 8 von 12 kommen weiter).
- **Mögliche Gegner (K.-o.-Phase)** – löst aus der aktuellen Tabellensituation
  das komplette Sechzehntelfinale (R32) auf (offizielle FIFA-Tabelle, Annex C,
  495 Konstellationen) und zeigt für dein Team den **festen R32-Gegner** sowie
  die **möglichen Gegner** in Achtel-, Viertel-, Halbfinale und Finale
  (Sieger des jeweiligen Bracket-Asts).

## Schnellstart ohne Installation (empfohlen)

Doppelklick auf **`vorschau.html`** – öffnet die komplette App im Browser,
**ohne npm/Node/Server**.

### Live-Ergebnisse

Die App holt beim Öffnen und danach alle 45 s die aktuellen WM-Ergebnisse von
mehreren kostenlosen Quellen (kein API-Key) und trägt sie automatisch ein:
- **ESPN** (Primär, Echtzeit – erfasst auch US-Nachtspiele sofort)
- **OpenLigaDB** + **TheSportsDB** (Backup – falls ESPN mal nicht erreichbar ist)

Die Ergebnisse aller Quellen werden zusammengeführt (ESPN gewinnt bei
Konflikten, da am aktuellsten), Zuordnung über die Teamnamen. Status oben in
der Leiste („🔴 Live · aktualisiert …").

- **Kein Internet / Quelle weg:** es wird der zuletzt gespeicherte Stand gezeigt
  (Hinweis „⚠ keine Verbindung").
- **Live aus-Haken:** stoppt das automatische Aktualisieren.
- **Manuell überschreiben:** sobald du ein Ergebnis selbst eintippst, lässt Live
  dieses Spiel in Ruhe (für Was-wäre-wenn-Szenarien). „Auf echten Stand
  zurücksetzen" hebt das wieder auf.
- Hinweis: Der kostenlose Zugang liefert beendete Spiele (near-live), keinen
  Sekunden-Ticker. Für echten In-Game-Live bräuchte es einen Premium-API-Key.

### Sprache

Oben rechts umschaltbar: **Deutsch / English / Español** – übersetzt die ganze
Oberfläche inkl. Ländernamen, Spaltenköpfe und Rundenbezeichnungen. Die Wahl
wird im Browser gemerkt.

### Hypothetische Ergebnisse

Jedes Ergebnis lässt sich manuell eintippen/überschreiben (z. B. „Was wäre,
wenn …"). Manuell gesetzte Spiele werden von der Live-Aktualisierung **nicht**
überschrieben; „Auf echten Stand zurücksetzen" hebt das wieder auf.

### Neu bauen nach Änderungen

`vorschau.html` wird aus `src/styles.css`, `src/r32-combinations.json`,
`src/data/wc2026.json` und `standalone/app.js` erzeugt:

```bash
node scripts/build-standalone.cjs
```

## Setup (Vite-Variante, für Weiterentwicklung)

> ⚠️ Auf diesem Rechner ist `npm` aktuell kaputt
> (`Cannot find module .../npm-cli.js`). Erst Node/npm sauber neu installieren
> (z.B. von <https://nodejs.org> oder `brew install node`), dann:

```bash
cd ~/Documents/wm2026-rechner
npm install
npm run dev
```

Danach im Browser auf die angezeigte Vite-URL (meist http://localhost:5173).

## Datenquelle Bracket

Die R32-Zuordnung der 8 Gruppendritten kommt aus `src/r32Bracket.ts`
(offizielle FIFA-Tabelle, Annex C; `src/r32-combinations.json` ist die Rohform).
Der Turnierbaum ab Achtelfinale ist in [`src/fifa/bracket.ts`](src/fifa/bracket.ts)
fest verdrahtet (`FEEDERS`) und gegen die offizielle Bracket-Struktur geprüft.

> Hinweis: Die Gegner-Analyse basiert auf der **aktuell eingegebenen
> Tabellensituation**. Sie aktualisiert sich live mit den Ergebnissen.

## Architektur

```
src/fifa/types.ts       Datentypen (Team, Match, TeamStats, …)
src/fifa/standings.ts   FIFA-Tiebreaker-Engine (Gruppen-Ranking)
src/fifa/thirdPlace.ts  Rangliste der Gruppendritten (8 von 12)
src/fifa/scenarios.ts   Szenario-Enumeration über offene Spiele
src/fifa/schedule.ts    Round-Robin-Spielplan je Gruppe
src/fifa/bracket.ts     R32-Auflösung + Turnierbaum + Gegner-Pfad
src/r32Bracket.ts       Offizielle FIFA-Tabelle (Annex C, 495 Konstellationen)
src/data/wc2026.json    Echte Auslosung + aktueller Spielstand (Wikipedia)
src/data/seed.ts        Baut Teams/Spiele aus wc2026.json
src/store.ts            State + localStorage-Persistenz
src/App.tsx             UI
```
