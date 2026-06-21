#!/usr/bin/env node
/* Baut die eigenständige vorschau.html aus CSS, Daten und app.js. */
const fs = require('fs')
const path = require('path')
const root = path.join(__dirname, '..')

const css = fs.readFileSync(path.join(root, 'src/styles.css'), 'utf8')
const r32 = fs.readFileSync(path.join(root, 'src/r32-combinations.json'), 'utf8')
const wc = fs.readFileSync(path.join(root, 'src/data/wc2026.json'), 'utf8')
const app = fs.readFileSync(path.join(root, 'standalone/app.js'), 'utf8')

const html = `<!doctype html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>WM 2026 – Gegner-Rechner</title>
<style>
${css}
</style>
</head>
<body>
<div class="app">
  <header>
    <h1>⚽ WM 2026 – Gegner-Rechner</h1>
    <p class="sub">Echte Auslosung + Live-Ergebnisse. Tabellen, FIFA-Tiebreaker und mögliche Gegner. Live-Daten von TheSportsDB; bei fehlender Verbindung wird der gespeicherte Stand gezeigt. Ergebnisse lassen sich jederzeit manuell überschreiben.</p>
    <div class="toolbar">
      <label class="myteam">Mein Team: <select id="myTeam"></select></label>
      <label class="live"><input type="checkbox" id="liveToggle"> 🔴 Live</label>
      <button id="btnRefresh">Jetzt aktualisieren</button>
      <span id="liveStatus" class="hint"></span>
      <button id="btnClear">Ergebnisse leeren</button>
      <button id="btnReset">Auf echten Stand zurücksetzen</button>
    </div>
  </header>
  <div id="myteam"></div>
  <nav class="tabs" id="tabs"></nav>
  <section id="groupInputs"></section>
  <section id="standings"></section>
  <section id="thirds"></section>
  <section id="opponents"></section>
</div>
<script>
var R32_DATA = ${r32};
var WC2026 = ${wc};
</script>
<script>
${app}
</script>
</body>
</html>
`

fs.writeFileSync(path.join(root, 'vorschau.html'), html)
console.log('vorschau.html gebaut:', html.length, 'bytes')
