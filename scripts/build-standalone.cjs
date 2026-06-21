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
  <header id="hdr"></header>
  <div id="myteam"></div>
  <section id="opponents"></section>
  <nav class="tabs" id="tabs"></nav>
  <section id="groupInputs"></section>
  <section id="standings"></section>
  <section id="thirds"></section>
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
// Für GitHub Pages: gleiche Seite als docs/index.html (Start-URL zeigt die App).
fs.mkdirSync(path.join(root, 'docs'), { recursive: true })
fs.writeFileSync(path.join(root, 'docs/index.html'), html)
console.log('vorschau.html + docs/index.html gebaut:', html.length, 'bytes')
