/* WM 2026 Gegner-Rechner – eigenständige Version (kein Build nötig).
   Erwartet globale R32_DATA + WC2026 (vom Build injiziert). */
(function () {
  'use strict'

  // ---------- Konstanten ----------
  var GROUPS = ['A','B','C','D','E','F','G','H','I','J','K','L']

  // ---------- i18n ----------
  var LANGKEY = 'wm2026-lang'
  var T = {
    de: {
      appTitle: '⚽ WM 2026 – Gegner-Rechner',
      subtitle: 'Echte Auslosung + Live-Ergebnisse. Tabellen, FIFA-Tiebreaker und mögliche Gegner. Ergebnisse jederzeit manuell überschreibbar.',
      lblMyTeam: 'Mein Team:', selectPlaceholder: '– wählen –', lblLang: 'Sprache:', lblLive: 'Live',
      refreshNow: 'Jetzt aktualisieren', clearResults: 'Ergebnisse leeren', resetLive: 'Auf echten Stand zurücksetzen',
      liveDisclaimer: '⏱ Ergebnisse werden automatisch geladen (alle ~60 s) und spiegeln beendete Spiele wider – kein offizieller Sekunden-Ticker, kurze Verzögerung möglich.',
      liveOff: 'Live aus', liveUpdated: 'aktualisiert', liveLoading: 'lädt…', liveNoConn: '⚠ keine Verbindung – gespeicherter Stand',
      group: 'Gruppe', resultsHeading: 'Ergebnisse', openHint: 'Leeres Feld = Spiel offen.', matchday: 'Spieltag',
      manualHint: 'Tipp: Eigene/hypothetische Ergebnisse eintippen – diese werden von der Live-Aktualisierung nicht überschrieben.',
      teamsFairplay: 'Teams & Fair-Play', fairplay: 'Fair-Play:', tableWord: 'Tabelle',
      col_team: 'Team', col_mp: 'Sp', col_w: 'S', col_d: 'U', col_l: 'N', col_goals: 'Tore', col_gd: 'TD', col_pts: 'Pkt', col_grp: 'Gr.', col_fp: 'FP',
      legAdv: '1./2. → weiter', legMaybe: '3. → evtl.', legOut: 'raus', legLot: '🎲 = Los',
      thirdsHeading: 'Rangliste der Gruppendritten (8 von 12 weiter)',
      verdictWinner: 'Sicher Gruppensieger (Platz 1)', verdictSafe: 'Sicher weiter (mind. Platz 2)', verdictOut: 'Ausgeschieden', verdictNoData: 'Keine Daten',
      verdictMaybeP: 'Weiterkommen möglich (Plätze {x})', verdictThirdOnlyP: 'Nur als Gruppendritter möglich (Plätze {x})',
      lblPosition: 'Platz', factReachable: 'Erreichbare Endplätze', factScenarios: 'Durchgerechnete Szenarien',
      approxNote: '(genähert: nur S/U/N)', asThird: 'Als Gruppendritter aktuell Rang',
      top8yes: 'unter den besten 8 ✅', top8no: 'NICHT unter den besten 8 ❌',
      oppHeading: 'Mögliche Gegner (K.-o.-Phase)',
      oppHint: 'Basierend auf der aktuellen Tabelle (1./2. + die 8 besten Dritten). R32-Gegner steht fest; ab Achtelfinale = mögliche Gegner.',
      wayOf: 'Weg von', vsWord: 'vs', possOpp: 'mögl. Gegner:',
      notInR16: 'ist nach aktueller Tabelle nicht im Achtelfinale.', fullR32: 'Komplettes Sechzehntelfinale (R32)',
      bracketUnresolved: 'Bracket konnte nicht aufgelöst werden.',
      round_R32: 'Sechzehntelfinale', round_R16: 'Achtelfinale', round_QF: 'Viertelfinale', round_SF: 'Halbfinale', round_F: 'Finale',
      treeHeading: '🏆 Turnierbaum (K.-o.-Phase)',
      treeHint: 'Wer, wann (Berliner Zeit) und wo – ab Sechzehntelfinale. Die R32-Paarungen ergeben sich aus der aktuellen Tabelle und ändern sich live; ab Achtelfinale steht der Gegner noch nicht fest (Sieger des jeweiligen Spiels, mögliche Teams als Hinweis darunter). Tabelle horizontal scrollbar.',
      winnerShort: 'Sieger Sp. {n}', loserShort: 'Verlierer Sp. {n}', bestThird: 'Bester Dritter', thirdPlaceHeading: 'Spiel um Platz 3',
    },
    en: {
      appTitle: '⚽ World Cup 2026 – Opponent Finder',
      subtitle: 'Real draw + live results. Tables, FIFA tiebreakers and possible opponents. You can override any result manually.',
      lblMyTeam: 'My team:', selectPlaceholder: '– select –', lblLang: 'Language:', lblLive: 'Live',
      refreshNow: 'Refresh now', clearResults: 'Clear results', resetLive: 'Reset to live data',
      liveDisclaimer: '⏱ Results load automatically (every ~60 s) and reflect finished matches – not an official live ticker, short delay possible.',
      liveOff: 'Live off', liveUpdated: 'updated', liveLoading: 'loading…', liveNoConn: '⚠ no connection – saved data',
      group: 'Group', resultsHeading: 'Results', openHint: 'Empty field = match not played.', matchday: 'Matchday',
      manualHint: 'Tip: type your own/hypothetical results – live updates will not overwrite them.',
      teamsFairplay: 'Teams & fair play', fairplay: 'Fair play:', tableWord: 'Table',
      col_team: 'Team', col_mp: 'MP', col_w: 'W', col_d: 'D', col_l: 'L', col_goals: 'Goals', col_gd: 'GD', col_pts: 'Pts', col_grp: 'Grp', col_fp: 'FP',
      legAdv: '1st/2nd → advance', legMaybe: '3rd → maybe', legOut: 'out', legLot: '🎲 = drawing of lots',
      thirdsHeading: 'Ranking of third-placed teams (8 of 12 advance)',
      verdictWinner: 'Group winner for sure (1st)', verdictSafe: 'Through for sure (at least 2nd)', verdictOut: 'Eliminated', verdictNoData: 'No data',
      verdictMaybeP: 'Advancing possible (positions {x})', verdictThirdOnlyP: 'Only as third place possible (positions {x})',
      lblPosition: 'Position', factReachable: 'Reachable final positions', factScenarios: 'Scenarios computed',
      approxNote: '(approx.: only W/D/L)', asThird: 'As third currently ranked',
      top8yes: 'in the top 8 ✅', top8no: 'NOT in the top 8 ❌',
      oppHeading: 'Possible opponents (knockout)',
      oppHint: 'Based on the current table (1st/2nd + the 8 best third-placed). The Round-of-32 opponent is fixed; from the Round of 16 on, these are possible opponents.',
      wayOf: 'Path of', vsWord: 'vs', possOpp: 'poss. opponents:',
      notInR16: 'is not in the Round of 16 based on the current table.', fullR32: 'Full Round of 32',
      bracketUnresolved: 'Bracket could not be resolved.',
      round_R32: 'Round of 32', round_R16: 'Round of 16', round_QF: 'Quarter-finals', round_SF: 'Semi-finals', round_F: 'Final',
      treeHeading: '🏆 Bracket (knockout)',
      treeHint: 'Who, when (Berlin time) and where – from the Round of 32 on. R32 pairings come from the current table and update live; from the Round of 16 the opponent is not yet fixed (winner of the respective match, possible teams shown below as a hint). Table scrolls horizontally.',
      winnerShort: 'Winner M{n}', loserShort: 'Loser M{n}', bestThird: 'Best 3rd', thirdPlaceHeading: 'Third-place play-off',
    },
    es: {
      appTitle: '⚽ Mundial 2026 – Buscador de rivales',
      subtitle: 'Sorteo real + resultados en vivo. Tablas, criterios de desempate FIFA y posibles rivales. Puedes sobrescribir cualquier resultado manualmente.',
      lblMyTeam: 'Mi equipo:', selectPlaceholder: '– elegir –', lblLang: 'Idioma:', lblLive: 'En vivo',
      refreshNow: 'Actualizar ahora', clearResults: 'Borrar resultados', resetLive: 'Restablecer datos reales',
      liveDisclaimer: '⏱ Los resultados se cargan automáticamente (cada ~60 s) y reflejan partidos finalizados – no es un marcador oficial en vivo, puede haber un pequeño retraso.',
      liveOff: 'En vivo: apagado', liveUpdated: 'actualizado', liveLoading: 'cargando…', liveNoConn: '⚠ sin conexión – datos guardados',
      group: 'Grupo', resultsHeading: 'Resultados', openHint: 'Campo vacío = partido pendiente.', matchday: 'Jornada',
      manualHint: 'Consejo: escribe tus propios resultados/hipotéticos – la actualización en vivo no los sobrescribe.',
      teamsFairplay: 'Equipos y juego limpio', fairplay: 'Juego limpio:', tableWord: 'Tabla',
      col_team: 'Equipo', col_mp: 'PJ', col_w: 'G', col_d: 'E', col_l: 'P', col_goals: 'Goles', col_gd: 'DG', col_pts: 'Pts', col_grp: 'Gr.', col_fp: 'JL',
      legAdv: '1.º/2.º → avanzan', legMaybe: '3.º → quizá', legOut: 'fuera', legLot: '🎲 = sorteo',
      thirdsHeading: 'Clasificación de terceros (8 de 12 avanzan)',
      verdictWinner: 'Primero de grupo asegurado (1.º)', verdictSafe: 'Clasificado seguro (mín. 2.º)', verdictOut: 'Eliminado', verdictNoData: 'Sin datos',
      verdictMaybeP: 'Avance posible (posiciones {x})', verdictThirdOnlyP: 'Solo como tercero posible (posiciones {x})',
      lblPosition: 'Posición', factReachable: 'Posiciones finales alcanzables', factScenarios: 'Escenarios calculados',
      approxNote: '(aprox.: solo G/E/P)', asThird: 'Como tercero, actualmente puesto',
      top8yes: 'entre los 8 mejores ✅', top8no: 'NO entre los 8 mejores ❌',
      oppHeading: 'Posibles rivales (eliminatorias)',
      oppHint: 'Según la tabla actual (1.º/2.º + los 8 mejores terceros). El rival de dieciseisavos es fijo; desde octavos son posibles rivales.',
      wayOf: 'Camino de', vsWord: 'vs', possOpp: 'posibles rivales:',
      notInR16: 'no está en octavos según la tabla actual.', fullR32: 'Dieciseisavos completos (R32)',
      bracketUnresolved: 'No se pudo resolver el cuadro.',
      round_R32: 'Dieciseisavos', round_R16: 'Octavos', round_QF: 'Cuartos', round_SF: 'Semifinales', round_F: 'Final',
      treeHeading: '🏆 Cuadro (eliminatorias)',
      treeHint: 'Quién, cuándo (hora de Berlín) y dónde – desde dieciseisavos. Los cruces de R32 salen de la tabla actual y se actualizan en vivo; desde octavos el rival aún no está fijo (ganador del partido correspondiente, posibles equipos como pista abajo). La tabla se desplaza horizontalmente.',
      winnerShort: 'Ganador P{n}', loserShort: 'Perdedor P{n}', bestThird: 'Mejor 3.º', thirdPlaceHeading: 'Tercer puesto',
    },
  }
  function t(k){ var d=T[ui.lang]||T.de; return d[k]!=null?d[k]:(T.de[k]!=null?T.de[k]:k) }
  function roundLabel(key){ return t('round_'+key) }

  // ---------- Flaggen + lokalisierte Namen ----------
  var FLAGS = (WC2026 && WC2026.flags) || {}
  var I18N = (WC2026 && WC2026.i18nNames) || {}
  var FLAG_BY_ANY = {} // jeder bekannte Namens-String (de/en/es) -> Emoji
  Object.keys(FLAGS).forEach(function(de){
    FLAG_BY_ANY[de] = FLAGS[de]
    var e = I18N[de]; if(e){ if(e.en)FLAG_BY_ANY[e.en]=FLAGS[de]; if(e.es)FLAG_BY_ANY[e.es]=FLAGS[de] }
  })
  function flag(name){ return FLAG_BY_ANY[name] ? FLAG_BY_ANY[name] + ' ' : '' }
  function locName(canonical){
    if(ui.lang==='de') return canonical
    var e=I18N[canonical]; return (e && e[ui.lang]) || canonical
  }

  // ---------- Live-Daten (TheSportsDB, kostenlos, CORS offen) ----------
  var API_BASE = 'https://www.thesportsdb.com/api/v1/json/3/'
  var WC_LEAGUE = (WC2026 && WC2026.apiLeagueId) || '4429'
  var ALIASES = (WC2026 && WC2026.aliases) || {}
  function norm(s){ return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]/g,'') }
  var ALIAS_TO_ID = {}
  GROUPS.forEach(function(g){
    WC2026.groups[g].teams.forEach(function(nm,i){
      var id = g+(i+1)
      ALIAS_TO_ID[norm(nm)] = id
      ;(ALIASES[nm]||[]).forEach(function(a){ ALIAS_TO_ID[norm(a)] = id })
    })
  })

  // 16 R32-Spiele (73–88)
  var R32_MATCHES = [
    {n:73,h:{t:'r',g:'A'},a:{t:'r',g:'B'}}, {n:74,h:{t:'w',g:'E'},a:{t:'3'}},
    {n:75,h:{t:'w',g:'F'},a:{t:'r',g:'C'}}, {n:76,h:{t:'w',g:'C'},a:{t:'r',g:'F'}},
    {n:77,h:{t:'w',g:'I'},a:{t:'3'}}, {n:78,h:{t:'r',g:'E'},a:{t:'r',g:'I'}},
    {n:79,h:{t:'w',g:'A'},a:{t:'3'}}, {n:80,h:{t:'w',g:'L'},a:{t:'3'}},
    {n:81,h:{t:'w',g:'D'},a:{t:'3'}}, {n:82,h:{t:'w',g:'G'},a:{t:'3'}},
    {n:83,h:{t:'r',g:'K'},a:{t:'r',g:'L'}}, {n:84,h:{t:'w',g:'H'},a:{t:'r',g:'J'}},
    {n:85,h:{t:'w',g:'B'},a:{t:'3'}}, {n:86,h:{t:'w',g:'J'},a:{t:'r',g:'H'}},
    {n:87,h:{t:'w',g:'K'},a:{t:'3'}}, {n:88,h:{t:'r',g:'D'},a:{t:'r',g:'G'}},
  ]
  var WINNER_TO_THIRD_MATCH = R32_DATA.winnerToMatch
  var MATCH_TO_WINNER = {}
  Object.keys(WINNER_TO_THIRD_MATCH).forEach(function (g) { MATCH_TO_WINNER[WINNER_TO_THIRD_MATCH[g]] = g })
  var FEEDERS = {
    89:[74,77],90:[73,75],91:[76,78],92:[79,80], 93:[83,84],94:[81,82],95:[86,88],96:[85,87],
    97:[89,90],98:[93,94],99:[91,92],100:[95,96], 101:[97,98],102:[99,100],104:[101,102],
  }
  var PARENT = {}
  Object.keys(FEEDERS).forEach(function (p) { FEEDERS[p].forEach(function (k) { PARENT[k] = +p }) })
  function roundOf(n){ if(n<=88)return'R32'; if(n<=96)return'R16'; if(n<=100)return'QF'; if(n<=102)return'SF'; return'F' }

  // K.-o.-Spielplan (Spiele 73–104, inkl. 103 = Platz 3). Quelle: offizieller FIFA-Spielplan
  // / Wikipedia '2026 FIFA World Cup knockout stage'. iso = Anstoß in UTC; fmtKickoff() rechnet
  // in Berliner Zeit um. v = 'Stadion, Stadt'. Statisch (nicht aus Live-Quelle), da die K.-o.-Spiele
  // noch keine Teams haben.
  var KO_SCHEDULE = {
    73:{iso:'2026-06-28T19:00:00Z',v:'SoFi Stadium, Los Angeles'},
    74:{iso:'2026-06-29T20:30:00Z',v:'Gillette Stadium, Boston'},
    75:{iso:'2026-06-30T01:00:00Z',v:'Estadio BBVA, Monterrey'},
    76:{iso:'2026-06-29T17:00:00Z',v:'NRG Stadium, Houston'},
    77:{iso:'2026-06-30T21:00:00Z',v:'MetLife Stadium, New York/NJ'},
    78:{iso:'2026-06-30T17:00:00Z',v:'AT&T Stadium, Dallas'},
    79:{iso:'2026-07-01T01:00:00Z',v:'Estadio Azteca, Mexiko-Stadt'},
    80:{iso:'2026-07-01T16:00:00Z',v:'Mercedes-Benz Stadium, Atlanta'},
    81:{iso:'2026-07-02T00:00:00Z',v:"Levi's Stadium, San Francisco"},
    82:{iso:'2026-07-01T20:00:00Z',v:'Lumen Field, Seattle'},
    83:{iso:'2026-07-02T23:00:00Z',v:'BMO Field, Toronto'},
    84:{iso:'2026-07-02T19:00:00Z',v:'SoFi Stadium, Los Angeles'},
    85:{iso:'2026-07-03T03:00:00Z',v:'BC Place, Vancouver'},
    86:{iso:'2026-07-03T22:00:00Z',v:'Hard Rock Stadium, Miami'},
    87:{iso:'2026-07-04T01:30:00Z',v:'Arrowhead Stadium, Kansas City'},
    88:{iso:'2026-07-03T18:00:00Z',v:'AT&T Stadium, Dallas'},
    89:{iso:'2026-07-04T21:00:00Z',v:'Lincoln Financial Field, Philadelphia'},
    90:{iso:'2026-07-04T17:00:00Z',v:'NRG Stadium, Houston'},
    91:{iso:'2026-07-05T20:00:00Z',v:'MetLife Stadium, New York/NJ'},
    92:{iso:'2026-07-06T00:00:00Z',v:'Estadio Azteca, Mexiko-Stadt'},
    93:{iso:'2026-07-06T19:00:00Z',v:'AT&T Stadium, Dallas'},
    94:{iso:'2026-07-07T00:00:00Z',v:'Lumen Field, Seattle'},
    95:{iso:'2026-07-07T16:00:00Z',v:'Mercedes-Benz Stadium, Atlanta'},
    96:{iso:'2026-07-07T20:00:00Z',v:'BC Place, Vancouver'},
    97:{iso:'2026-07-09T20:00:00Z',v:'Gillette Stadium, Boston'},
    98:{iso:'2026-07-10T19:00:00Z',v:'SoFi Stadium, Los Angeles'},
    99:{iso:'2026-07-11T21:00:00Z',v:'Hard Rock Stadium, Miami'},
    100:{iso:'2026-07-12T01:00:00Z',v:'Arrowhead Stadium, Kansas City'},
    101:{iso:'2026-07-14T19:00:00Z',v:'AT&T Stadium, Dallas'},
    102:{iso:'2026-07-15T19:00:00Z',v:'Mercedes-Benz Stadium, Atlanta'},
    103:{iso:'2026-07-18T21:00:00Z',v:'Hard Rock Stadium, Miami'},
    104:{iso:'2026-07-19T19:00:00Z',v:'MetLife Stadium, New York/NJ'},
  }
  // Erlaubte Herkunftsgruppen der Drittplatzierten je 'Sieger vs 3.'-Spiel (für den Fallback,
  // falls die Tabelle den konkreten Dritten noch nicht hergibt).
  var THIRD_ALLOWED = {74:'A/B/C/D/F',77:'C/D/F/G/H',79:'C/E/F/H/I',80:'E/H/I/J/K',81:'B/E/F/I/J',82:'A/E/H/I/J',85:'E/F/G/I/J',87:'D/E/I/J/L'}

  // ---------- State ----------
  var KEY = 'wm2026-standalone-v2'
  var state = load()
  var ui = { group:'A', myTeam:'', live:true, lastUpdate:'', liveError:false, lang: loadLang() }
  function loadLang(){ try{ return localStorage.getItem(LANGKEY)||'de' }catch(e){ return 'de' } }
  function saveLang(){ try{ localStorage.setItem(LANGKEY, ui.lang) }catch(e){} }

  function seed(){
    var teams=[], matches=[]
    GROUPS.forEach(function(g){
      var data=WC2026.groups[g], idByName={}
      data.teams.forEach(function(name,i){ teams.push({id:g+(i+1),name:name,group:g,fairPlay:0}); idByName[name]=g+(i+1) })
      data.matches.forEach(function(m,i){ matches.push({id:g+(i+1),group:g,home:idByName[m[0]],away:idByName[m[1]],hg:m[2],ag:m[3]}) })
    })
    return {teams:teams,matches:matches,manual:{}}
  }
  function load(){ try{var r=localStorage.getItem(KEY); if(r){var s=JSON.parse(r); if(!s.manual)s.manual={}; return s}}catch(e){} return seed() }
  function save(){ try{localStorage.setItem(KEY,JSON.stringify(state))}catch(e){} }

  function teamsOfGroup(g){ return state.teams.filter(function(t){return t.group===g}) }
  // Anzeige-Name: lokalisiert (oder editierter Name, falls vom Nutzer geändert)
  function nameOf(id){ var x=state.teams.find(function(t){return t.id===id}); return x?locName(x.name):id }
  function fairPlayMap(g){ var m={}; teamsOfGroup(g).forEach(function(t){m[t.id]=t.fairPlay}); return m }

  // ---------- FIFA-Tabellen-Logik ----------
  function computeStats(ids, matches, fp){
    var t={}; ids.forEach(function(id){ t[id]={team:id,played:0,won:0,drawn:0,lost:0,gf:0,ga:0,gd:0,points:0,fairPlay:(fp&&fp[id])||0} })
    matches.forEach(function(m){
      if(m.hg==null||m.ag==null)return
      var h=t[m.home],a=t[m.away]; if(!h||!a)return
      h.played++;a.played++; h.gf+=m.hg;h.ga+=m.ag; a.gf+=m.ag;a.ga+=m.hg
      if(m.hg>m.ag){h.won++;a.lost++;h.points+=3}
      else if(m.hg<m.ag){a.won++;h.lost++;a.points+=3}
      else{h.drawn++;a.drawn++;h.points++;a.points++}
    })
    ids.forEach(function(id){ t[id].gd=t[id].gf-t[id].ga })
    return t
  }
  // FIFA-2026-Tiebreaker: Punkte -> DIREKTER VERGLEICH (Punkte/TD/Tore untereinander)
  // -> dann erst Gesamt-TD -> Gesamt-Tore -> Fair-Play -> Los.
  // Teams, die untereinander noch gleich sind, lösen die direkten Kriterien erneut auf.
  function resolveByOverall(sub, st, lot){
    var sorted=sub.slice().sort(function(p,q){ return (st[q].gd-st[p].gd)||(st[q].gf-st[p].gf)||(st[q].fairPlay-st[p].fairPlay) })
    var res=[],i=0
    while(i<sorted.length){
      var j=i+1
      while(j<sorted.length && st[sorted[i]].gd===st[sorted[j]].gd && st[sorted[i]].gf===st[sorted[j]].gf && st[sorted[i]].fairPlay===st[sorted[j]].fairPlay) j++
      var s2=sorted.slice(i,j)
      if(s2.length===1) res.push(s2[0])
      else { s2.forEach(function(id){lot[id]=true}); res.push.apply(res, s2.slice().sort()) } // Los
      i=j
    }
    return res
  }
  // block = Teams gleich auf Punkte. Erst direkter Vergleich (rekursiv), dann Gesamt.
  function resolveBlock(block, matches, fp, st, lot){
    var h2h=matches.filter(function(m){return block.indexOf(m.home)>=0&&block.indexOf(m.away)>=0})
    var hs=computeStats(block,h2h,fp)
    var sorted=block.slice().sort(function(p,q){ return (hs[q].points-hs[p].points)||(hs[q].gd-hs[p].gd)||(hs[q].gf-hs[p].gf) })
    var res=[],i=0
    while(i<sorted.length){
      var j=i+1
      while(j<sorted.length && hs[sorted[i]].points===hs[sorted[j]].points && hs[sorted[i]].gd===hs[sorted[j]].gd && hs[sorted[i]].gf===hs[sorted[j]].gf) j++
      var sub=sorted.slice(i,j)
      if(sub.length===1) res.push(sub[0])
      else if(sub.length<block.length) res.push.apply(res, resolveBlock(sub,matches,fp,st,lot)) // Teilmenge getrennt -> direkten Vergleich erneut
      else res.push.apply(res, resolveByOverall(sub, st, lot)) // nichts getrennt -> Gesamt-Kriterien
      i=j
    }
    return res
  }
  function rankGroup(ids, matches, fp){
    var st=computeStats(ids,matches,fp), lot={}
    var sorted=ids.slice().sort(function(p,q){ return st[q].points-st[p].points }) // 1) nur nach Punkten
    var order=[],i=0
    while(i<sorted.length){
      var j=i+1
      while(j<sorted.length && st[sorted[j]].points===st[sorted[i]].points) j++ // Block gleicher Punkte
      var b=sorted.slice(i,j)
      if(b.length===1) order.push(b[0]); else order.push.apply(order, resolveBlock(b,matches,fp,st,lot))
      i=j
    }
    return order.map(function(id,k){ var s=st[id]; return {team:id,rank:k+1,played:s.played,won:s.won,drawn:s.drawn,lost:s.lost,gf:s.gf,ga:s.ga,gd:s.gd,points:s.points,fairPlay:s.fairPlay,lot:!!lot[id]} })
  }
  function allStandings(){
    var out={}
    GROUPS.forEach(function(g){ out[g]=rankGroup([g+1,g+2,g+3,g+4], state.matches.filter(function(m){return m.group===g}), fairPlayMap(g)) })
    return out
  }
  function rankThirds(standings){
    var lot={}
    var thirds=GROUPS.map(function(g){ var r=standings[g].find(function(x){return x.rank===3}); return {group:g,team:r} }).filter(function(x){return x.team})
    thirds.sort(function(p,q){
      var a=p.team,b=q.team
      if(b.points!==a.points)return b.points-a.points
      if(b.gd!==a.gd)return b.gd-a.gd
      if(b.gf!==a.gf)return b.gf-a.gf
      if(b.fairPlay!==a.fairPlay)return b.fairPlay-a.fairPlay
      lot[p.group]=true; lot[q.group]=true
      return p.group<q.group?-1:1
    })
    return thirds.map(function(e,i){ return {team:e.team.team,group:e.group,rank:i+1,played:e.team.played,points:e.team.points,gd:e.team.gd,gf:e.team.gf,fairPlay:e.team.fairPlay,qualifies:i<8,lot:!!lot[e.group]} })
  }

  // ---------- Szenarien ----------
  function* outcomes(matches, maxGoals, limit){
    var open=matches.filter(function(m){return m.hg==null||m.ag==null})
    var fixed=matches.filter(function(m){return m.hg!=null&&m.ag!=null})
    if(open.length===0){ yield {out:fixed,approx:false}; return }
    var per=(maxGoals+1)*(maxGoals+1)
    var exact=Math.pow(per,open.length)<=limit
    var opts=open.map(function(){
      if(exact){ var l=[]; for(var h=0;h<=maxGoals;h++)for(var a=0;a<=maxGoals;a++)l.push([h,a]); return l }
      return [[1,0],[0,0],[0,1]]
    })
    var idx=open.map(function(){return 0})
    while(true){
      var out=open.map(function(m,k){ return {id:m.id,group:m.group,home:m.home,away:m.away,hg:opts[k][idx[k]][0],ag:opts[k][idx[k]][1]} })
      yield {out:fixed.concat(out),approx:!exact}
      var p=open.length-1
      while(p>=0){ idx[p]++; if(idx[p]<opts[p].length)break; idx[p]=0; p-- }
      if(p<0)break
    }
  }
  function possiblePositions(team, ids, matches, fp){
    var reach={}, scenarios=0, approx=false
    var it=outcomes(matches,5,300000), r
    while(!(r=it.next()).done){
      approx=approx||r.value.approx
      var ranked=rankGroup(ids,r.value.out,fp)
      var pos=ranked.find(function(x){return x.team===team})
      if(pos)reach[pos.rank]=true
      scenarios++
    }
    var arr=Object.keys(reach).map(Number).sort(function(a,b){return a-b})
    return {reach:arr,best:arr[0]||0,worst:arr[arr.length-1]||0,scenarios:scenarios,approx:approx}
  }

  // ---------- Bracket ----------
  function thirdAssignment(qualGroups){
    if(qualGroups.length!==8)return null
    return R32_DATA.combinations[qualGroups.slice().sort().join('')]||null
  }
  function buildTeamOf(standings){
    return function(label){
      var pos=+label[0], g=label.slice(1)
      var row=standings[g]&&standings[g].find(function(r){return r.rank===pos})
      return row?nameOf(row.team):label
    }
  }
  function resolveR32(qualGroups, teamOf){
    var assign=thirdAssignment(qualGroups); if(!assign)return null
    function lab(s,n){
      if(s.t==='w')return teamOf('1'+s.g)
      if(s.t==='r')return teamOf('2'+s.g)
      var wg=MATCH_TO_WINNER[n], third=wg?assign['1'+wg]:null
      return third?teamOf(third):'3.?'
    }
    return R32_MATCHES.map(function(m){ return {n:m.n,round:'R32',home:lab(m.h,m.n),away:lab(m.a,m.n)} })
  }
  function leaves(n){ if(roundOf(n)==='R32')return[n]; return leaves(FEEDERS[n][0]).concat(leaves(FEEDERS[n][1])) }
  function teamsInLeaf(n,res){ var m=res.find(function(r){return r.n===n}); return m?[m.home,m.away]:[] }
  function opponentPath(team,res){
    var my=res.find(function(r){return r.home===team||r.away===team}); if(!my)return null
    var r32opp=my.home===team?my.away:my.home
    var rounds=[],cur=my.n
    while(PARENT[cur]!=null){
      var par=PARENT[cur], f=FEEDERS[par], sib=f[0]===cur?f[1]:f[0]
      var opps=leaves(sib).reduce(function(acc,mn){return acc.concat(teamsInLeaf(mn,res))},[]).filter(Boolean)
      rounds.push({round:roundOf(par),opponents:opps})
      cur=par
    }
    return {r32Opponent:r32opp,rounds:rounds}
  }

  // ---------- Rendering ----------
  function esc(s){ return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]}) }
  function el(id){ return document.getElementById(id) }
  function teamCell(id){ return flag(nameOf(id))+esc(nameOf(id)) } // Flagge (per kanon. Name) + lokalisierter Name
  function teamCellName(name){ return flag(name)+esc(name) }

  function renderTabs(){
    el('tabs').innerHTML = GROUPS.map(function(g){ return '<button data-tab="'+g+'" class="'+(g===ui.group?'active':'')+'">'+g+'</button>' }).join('')
    el('tabs').querySelectorAll('button').forEach(function(b){
      b.addEventListener('click',function(){ ui.group=b.getAttribute('data-tab'); renderTabs(); renderGroupInputs(); renderDerived() })
    })
  }

  function renderMyTeamSelect(){
    var sel=el('myTeam'); if(!sel)return
    var h='<option value="">'+esc(t('selectPlaceholder'))+'</option>'
    GROUPS.forEach(function(g){
      h+='<optgroup label="'+esc(t('group')+' '+g)+'">'
      teamsOfGroup(g).forEach(function(tm){ h+='<option value="'+tm.id+'">'+flag(nameOf(tm.id))+esc(nameOf(tm.id))+'</option>' })
      h+='</optgroup>'
    })
    sel.innerHTML=h; sel.value=ui.myTeam
  }

  function renderGroupInputs(){
    var g=ui.group, teams=teamsOfGroup(g), matches=state.matches.filter(function(m){return m.group===g})
    var h='<h2>'+esc(t('resultsHeading')+' – '+t('group')+' '+g)+'</h2><div class="matches">'
    matches.forEach(function(m){
      var md=Math.ceil((+m.id.slice(1))/2) // Spieltag aus der Reihenfolge
      var meta=[t('matchday')+' '+md]
      var kt=fmtKickoff(m.kickoff); if(kt) meta.push(kt)
      if(m.venue) meta.push('📍 '+m.venue)
      h+='<div class="matchrow"><div class="match">'
        +'<span class="tn r">'+teamCell(m.home)+'</span>'
        +'<input type="number" min="0" data-score="'+m.id+'" data-side="h" value="'+(m.hg==null?'':m.hg)+'">'
        +'<span class="colon">:</span>'
        +'<input type="number" min="0" data-score="'+m.id+'" data-side="a" value="'+(m.ag==null?'':m.ag)+'">'
        +'<span class="tn">'+teamCell(m.away)+'</span></div>'
        +'<div class="mmeta">'+esc(meta.join(' · '))+'</div></div>'
    })
    h+='</div><p class="hint">'+esc(t('openHint'))+'</p><p class="hint">'+esc(t('manualHint'))+'</p>'
    h+='<h3>'+esc(t('teamsFairplay'))+'</h3><table class="teamedit"><tbody>'
    teams.forEach(function(tm){
      h+='<tr><td><input data-name="'+tm.id+'" value="'+esc(tm.name)+'"></td>'
        +'<td class="fp">'+esc(t('fairplay'))+'<input type="number" data-fp="'+tm.id+'" value="'+tm.fairPlay+'"></td></tr>'
    })
    h+='</tbody></table>'
    el('groupInputs').innerHTML=h

    el('groupInputs').querySelectorAll('[data-score]').forEach(function(inp){
      inp.addEventListener('input',function(){
        var m=state.matches.find(function(x){return x.id===inp.getAttribute('data-score')})
        var v=inp.value===''?null:Number(inp.value)
        if(inp.getAttribute('data-side')==='h')m.hg=v; else m.ag=v
        state.manual[m.id]=true
        save(); renderDerived()
      })
    })
    el('groupInputs').querySelectorAll('[data-name]').forEach(function(inp){
      inp.addEventListener('input',function(){
        var tm=state.teams.find(function(x){return x.id===inp.getAttribute('data-name')})
        tm.name=inp.value; save(); renderMatchLabels(); renderDerived()
      })
    })
    el('groupInputs').querySelectorAll('[data-fp]').forEach(function(inp){
      inp.addEventListener('input',function(){
        var tm=state.teams.find(function(x){return x.id===inp.getAttribute('data-fp')})
        tm.fairPlay=Number(inp.value)||0; save(); renderDerived()
      })
    })
  }

  function renderMatchLabels(){
    var matches=state.matches.filter(function(m){return m.group===ui.group})
    el('groupInputs').querySelectorAll('.match').forEach(function(row,i){
      var m=matches[i]; if(!m)return
      var spans=row.querySelectorAll('.tn')
      spans[0].textContent=flag(nameOf(m.home))+nameOf(m.home); spans[1].textContent=flag(nameOf(m.away))+nameOf(m.away)
    })
    renderMyTeamSelect()
  }

  function renderDerived(){
    var standings=allStandings(), thirds=rankThirds(standings)
    renderStandings(standings); renderThirds(thirds); renderMyTeam(standings,thirds); renderOpponents(standings,thirds); renderBracketTree(standings,thirds)
  }
  function rowClass(rank,team){ var c=rank<=2?'adv':rank===3?'maybe':'out'; if(ui.myTeam&&team===ui.myTeam)c+=' mine'; return c }

  function renderStandings(standings){
    var g=ui.group, rows=standings[g]
    var h='<h2>'+esc(t('group')+' '+g+' – '+t('tableWord'))+'</h2><table class="standings"><thead><tr>'
      +'<th>#</th><th class="l">'+esc(t('col_team'))+'</th><th>'+esc(t('col_mp'))+'</th><th>'+esc(t('col_w'))+'</th><th>'+esc(t('col_d'))+'</th><th>'+esc(t('col_l'))+'</th><th>'+esc(t('col_goals'))+'</th><th>'+esc(t('col_gd'))+'</th><th>'+esc(t('col_pts'))+'</th></tr></thead><tbody>'
    rows.forEach(function(r){
      h+='<tr class="'+rowClass(r.rank,r.team)+'"><td>'+r.rank+(r.lot?' 🎲':'')+'</td><td class="l">'+teamCell(r.team)+'</td>'
        +'<td>'+r.played+'</td><td>'+r.won+'</td><td>'+r.drawn+'</td><td>'+r.lost+'</td>'
        +'<td>'+r.gf+':'+r.ga+'</td><td>'+(r.gd>0?'+'+r.gd:r.gd)+'</td><td><b>'+r.points+'</b></td></tr>'
    })
    h+='</tbody></table><p class="legend"><span class="dot adv"></span> '+esc(t('legAdv'))+' &nbsp;'
      +'<span class="dot maybe"></span> '+esc(t('legMaybe'))+' &nbsp;<span class="dot out"></span> '+esc(t('legOut'))+' &nbsp; '+esc(t('legLot'))+'</p>'
    el('standings').innerHTML=h
  }

  function renderThirds(thirds){
    var h='<h2>'+esc(t('thirdsHeading'))+'</h2><table class="standings"><thead><tr>'
      +'<th>#</th><th class="l">'+esc(t('col_team'))+'</th><th>'+esc(t('col_grp'))+'</th><th>'+esc(t('col_mp'))+'</th><th>'+esc(t('col_pts'))+'</th><th>'+esc(t('col_gd'))+'</th><th>'+esc(t('col_goals'))+'</th><th>'+esc(t('col_fp'))+'</th><th></th></tr></thead><tbody>'
    thirds.forEach(function(e){
      h+='<tr class="'+(e.qualifies?'adv':'out')+'"><td>'+e.rank+(e.lot?' 🎲':'')+'</td><td class="l">'+teamCell(e.team)+'</td>'
        +'<td>'+e.group+'</td><td>'+e.played+'</td><td><b>'+e.points+'</b></td><td>'+(e.gd>0?'+'+e.gd:e.gd)+'</td><td>'+e.gf+'</td><td>'+e.fairPlay+'</td><td>'+(e.qualifies?'✅':'❌')+'</td></tr>'
    })
    h+='</tbody></table>'
    el('thirds').innerHTML=h
  }

  function renderMyTeam(standings,thirds){
    var box=el('myteam')
    if(!ui.myTeam){ box.innerHTML=''; return }
    var team=state.teams.find(function(x){return x.id===ui.myTeam})
    var ids=[team.group+1,team.group+2,team.group+3,team.group+4]
    var ms=state.matches.filter(function(m){return m.group===team.group})
    var an=possiblePositions(team.id,ids,ms,fairPlayMap(team.group))
    var pos=standings[team.group].find(function(r){return r.team===team.id})
    var reach=an.reach, v
    if(reach.length===0)v={c:'out',t:t('verdictNoData')}
    else if(an.worst===1)v={c:'adv',t:t('verdictWinner')}
    else if(an.worst<=2)v={c:'adv',t:t('verdictSafe')}
    else if(an.best>=4)v={c:'out',t:t('verdictOut')}
    else if(an.best<=2)v={c:'maybe',t:t('verdictMaybeP').replace('{x}',reach.join('/'))}
    else v={c:'maybe',t:t('verdictThirdOnlyP').replace('{x}',reach.join('/'))}
    var te=thirds.find(function(e){return e.team===team.id})
    var gdv=(pos&&pos.gd>0?'+':'')+(pos?pos.gd:0)
    var h='<section class="myteam-panel '+v.c+'"><h2>'+teamCellName(nameOf(team.id))+' <span class="grp">('+esc(t('group')+' '+team.group)+')</span></h2>'
      +'<div class="verdict">'+esc(v.t)+'</div><ul class="facts">'
      +'<li>'+esc(t('lblPosition'))+' <b>'+(pos?pos.rank:'–')+'</b> · '+(pos?pos.points:0)+' '+esc(t('col_pts'))+' · '+esc(t('col_gd'))+' '+gdv+'</li>'
      +'<li>'+esc(t('factReachable'))+': <b>'+(reach.join(', ')||'–')+'</b></li>'
      +'<li>'+esc(t('factScenarios'))+': '+an.scenarios.toLocaleString(ui.lang)+(an.approx?' '+esc(t('approxNote')):'')+'</li>'
    if(reach.indexOf(3)>=0){
      h+='<li>'+esc(t('asThird'))+' <b>'+(te?te.rank:'–')+'/12</b> → '+esc(te&&te.qualifies?t('top8yes'):t('top8no'))+'</li>'
    }
    h+='</ul></section>'
    box.innerHTML=h
  }

  function renderOpponents(standings,thirds){
    var qual=thirds.filter(function(e){return e.qualifies}).map(function(e){return e.group})
    var resolved=null
    if(qual.length===8) resolved=resolveR32(qual,buildTeamOf(standings))
    var h='<h2>'+esc(t('oppHeading'))+'</h2>'
    if(!resolved){ h+='<div class="notice">'+esc(t('bracketUnresolved'))+'</div>'; el('opponents').innerHTML=h; return }
    h+='<p class="hint">'+esc(t('oppHint'))+'</p>'
    var myName=ui.myTeam?nameOf(ui.myTeam):''
    if(ui.myTeam){
      var path=opponentPath(myName,resolved)
      h+='<div class="mypath"><h3>'+esc(t('wayOf'))+' '+teamCellName(myName)+'</h3>'
      if(path){
        h+='<ol class="path"><li><span class="r">'+esc(roundLabel('R32')+' (R32)')+'</span><span class="opp">'+esc(t('vsWord'))+' '+teamCellName(path.r32Opponent)+'</span></li>'
        path.rounds.forEach(function(r){
          h+='<li><span class="r">'+esc(roundLabel(r.round))+'</span><span class="opp">'+(r.opponents.length===1?esc(t('vsWord'))+' ':esc(t('possOpp'))+' ')+r.opponents.map(teamCellName).join(', ')+'</span></li>'
        })
        h+='</ol>'
      } else {
        h+='<p class="notice">'+teamCellName(myName)+' '+esc(t('notInR16'))+'</p>'
      }
      h+='</div>'
    }
    h+='<h3>'+esc(t('fullR32'))+'</h3><table class="bracket"><tbody>'
    resolved.forEach(function(m){
      var mine=(m.home===myName||m.away===myName)?' class="mine"':''
      h+='<tr'+mine+'><td class="mno">#'+m.n+'</td><td class="r">'+teamCellName(m.home)+'</td><td class="vs">–</td><td class="l">'+teamCellName(m.away)+'</td></tr>'
    })
    h+='</tbody></table>'
    el('opponents').innerHTML=h
  }

  // ---------- Turnierbaum (visuelles Bracket) ----------
  function teamShort(name){ return flag(name)+esc(name) }
  function koMeta(n){ var s=KO_SCHEDULE[n]; return s?{time:fmtKickoff(s.iso),ven:s.v}:{time:'',ven:''} }

  function renderBracketTree(standings, thirds){
    var sec=el('bracketTree'); if(!sec) return
    var qual=thirds.filter(function(e){return e.qualifies}).map(function(e){return e.group})
    var resolved = qual.length===8 ? resolveR32(qual, buildTeamOf(standings)) : null
    var byNo={}; if(resolved) resolved.forEach(function(m){ byNo[m.n]=m })
    var myName=ui.myTeam?nameOf(ui.myTeam):''
    var pathSet={}
    if(resolved && myName){
      var lm=resolved.find(function(r){return r.home===myName||r.away===myName})
      if(lm){ var cur=lm.n; while(cur!=null){ pathSet[cur]=true; cur=PARENT[cur] } }
    }

    function teamSide(name){
      var mineCls=(name && name===myName)?' mineteam':''
      return '<div class="side win'+mineCls+'"><span class="nm">'+teamShort(name)+'</span></div>'
    }
    function slotSide(slot,n){
      var label
      if(slot.t==='w') label=t('group')+' '+slot.g+' · 1.'
      else if(slot.t==='r') label=t('group')+' '+slot.g+' · 2.'
      else label=t('bestThird')+(THIRD_ALLOWED[n]?' ('+THIRD_ALLOWED[n]+')':'')
      return '<div class="side"><span class="nm dim">'+esc(label)+'</span></div>'
    }
    function feederSide(n,word){
      var label=t(word).replace('{n}',n), sub=''
      if(roundOf(n)==='R32' && byNo[n]) sub=teamShort(byNo[n].home)+' · '+teamShort(byNo[n].away)
      var mineCls=(word==='winnerShort' && pathSet[n])?' mineteam':''
      return '<div class="side'+mineCls+'"><span class="nm dim">'+esc(label)+'</span>'+(sub?'<span class="sub">'+sub+'</span>':'')+'</div>'
    }
    function sidesOf(n){
      if(n===103) return feederSide(101,'loserShort')+feederSide(102,'loserShort')
      if(roundOf(n)==='R32'){
        if(byNo[n]) return teamSide(byNo[n].home)+teamSide(byNo[n].away)
        var def=null; for(var i=0;i<R32_MATCHES.length;i++){ if(R32_MATCHES[i].n===n){ def=R32_MATCHES[i]; break } }
        return def?(slotSide(def.h,n)+slotSide(def.a,n)):''
      }
      var f=FEEDERS[n]
      return feederSide(f[0],'winnerShort')+feederSide(f[1],'winnerShort')
    }
    function node(n,extra){
      var mt=koMeta(n), cls='tnode'+(pathSet[n]?' mine':'')+(extra?' '+extra:'')
      return '<div class="'+cls+'">'
        +'<div class="nh"><span class="no">#'+n+'</span><span class="kt">'+esc(mt.time)+'</span></div>'
        +(mt.ven?'<div class="ven">📍 '+esc(mt.ven)+'</div>':'')
        +sidesOf(n)+'</div>'
    }

    var COLS=[['R32',[74,77,73,75,83,84,81,82,76,78,79,80,86,88,85,87]],
              ['R16',[89,90,93,94,91,92,95,96]],
              ['QF',[97,98,99,100]],['SF',[101,102]],['F',[104]]]
    var h='<h2>'+esc(t('treeHeading'))+'</h2><p class="hint">'+esc(t('treeHint'))+'</p>'
    h+='<div class="tree-wrap"><div class="tree">'
    COLS.forEach(function(c){
      h+='<div class="tcol"><div class="ch">'+esc(roundLabel(c[0]))+'</div><div class="body">'
      c[1].forEach(function(n){ h+='<div class="tcell">'+node(n)+'</div>' })
      h+='</div></div>'
    })
    h+='</div></div>'
    h+='<h3>'+esc(t('thirdPlaceHeading'))+'</h3><div class="tree-wrap">'+node(103,'solo')+'</div>'
    sec.innerHTML=h
  }

  // ---------- Live ----------
  function findMatch(g, idA, idB){
    return state.matches.find(function(m){ return m.group===g && ((m.home===idA&&m.away===idB)||(m.home===idB&&m.away===idA)) })
  }
  function nowStr(){ var d=new Date(); function p(n){return(n<10?'0':'')+n} return p(d.getHours())+':'+p(d.getMinutes())+':'+p(d.getSeconds()) }
  // ESPN-Anstoß (UTC) -> Berliner Zeit, lokalisiert.
  function fmtKickoff(iso){
    if(!iso) return ''
    try{
      var loc = ui.lang==='en'?'en-GB':ui.lang==='es'?'es-ES':'de-DE'
      var s = new Date(iso).toLocaleString(loc,{ timeZone:'Europe/Berlin', weekday:'short', day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' })
      return s + (ui.lang==='de'?' Uhr':'')
    }catch(e){ return '' }
  }
  function updateScoreInputs(){
    el('groupInputs').querySelectorAll('[data-score]').forEach(function(inp){
      if(inp===document.activeElement) return
      var m=state.matches.find(function(x){return x.id===inp.getAttribute('data-score')}); if(!m)return
      var v=inp.getAttribute('data-side')==='h'?m.hg:m.ag
      inp.value=(v==null?'':v)
    })
  }
  function renderLiveStatus(){
    var s=el('liveStatus'); if(!s)return
    if(!ui.live){ s.textContent=t('liveOff'); return }
    var u=ui.lastUpdate?(t('liveUpdated')+' '+ui.lastUpdate):t('liveLoading')
    s.textContent=(ui.liveError?t('liveNoConn')+' · ':'🔴 Live · ')+u
  }
  // Überträgt eine Liste API-Events ins Modell. Gibt true zurück, wenn sich etwas geändert hat.
  function applyEvents(list){
    var changed=false
    list.forEach(function(e){
      if(!e) return
      if(String(e.idLeague)!==String(WC_LEAGUE)) return
      if(e.intHomeScore==null||e.intAwayScore==null||e.intHomeScore===''||e.intAwayScore==='') return
      var hid=ALIAS_TO_ID[norm(e.strHomeTeam)], aid=ALIAS_TO_ID[norm(e.strAwayTeam)]
      if(!hid||!aid||hid.charAt(0)!==aid.charAt(0)) return
      var m=findMatch(hid.charAt(0),hid,aid); if(!m||state.manual[m.id]) return
      var hg,ag
      if(m.home===hid){ hg=+e.intHomeScore; ag=+e.intAwayScore } else { hg=+e.intAwayScore; ag=+e.intHomeScore }
      if(m.hg!==hg||m.ag!==ag){ m.hg=hg; m.ag=ag; changed=true }
    })
    return changed
  }
  // Spielplan-Infos (Anstoß + Ort) auf die Spiele übertragen. Gibt true bei Änderung.
  function applySchedule(list){
    var changed=false
    list.forEach(function(e){
      var hid=ALIAS_TO_ID[norm(e.strHomeTeam)], aid=ALIAS_TO_ID[norm(e.strAwayTeam)]
      if(!hid||!aid||hid.charAt(0)!==aid.charAt(0)) return
      var m=findMatch(hid.charAt(0),hid,aid); if(!m) return
      if(e.kickoff && m.kickoff!==e.kickoff){ m.kickoff=e.kickoff; changed=true }
      if(e.venue && m.venue!==e.venue){ m.venue=e.venue; changed=true }
    })
    return changed
  }
  // Endergebnis eines OpenLigaDB-Spiels (resultTypeID 2 = Endergebnis, sonst letztes).
  function finalResult(m){
    var rs=m.matchResults||[]; if(!rs.length) return null
    return rs.filter(function(r){return r.resultTypeID===2})[0] || rs[rs.length-1]
  }
  // Primärquelle: ESPN (Echtzeit, kostenlos, kein Key). Pro Tag eine Abfrage; deckt US-Nachtspiele sofort ab.
  var ESPN_BASE = 'https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates='
  function pad2(n){ return (n<10?'0':'')+n }
  function compact(d){ return ''+d.getFullYear()+pad2(d.getMonth()+1)+pad2(d.getDate()) }
  function espnRange(a,b){ var out=[],d=new Date(a),e=new Date(b); while(d<=e){ out.push(compact(d)); d.setDate(d.getDate()+1) } return out }
  var ESPN_DATES = espnRange('2026-06-11T00:00:00','2026-06-27T00:00:00')
  function recentEspn(){ var t=new Date(),arr=[]; for(var i=2;i>=0;i--){ var x=new Date(t); x.setDate(x.getDate()-i); arr.push(compact(x)) } return arr }
  function fetchESPN(dates){
    return Promise.all(dates.map(function(d){
      return fetch(ESPN_BASE+d).then(function(r){ return r.json() }).then(function(j){ return (j&&j.events)||[] }).catch(function(){ return null })
    })).then(function(lists){
      var ok=lists.some(function(x){ return x!==null }), evs=[], sched=[]
      lists.forEach(function(list){ if(!list) return; list.forEach(function(ev){
        var comp=ev.competitions&&ev.competitions[0]; if(!comp) return
        var cs=comp.competitors||[]; if(cs.length!==2) return
        var home=cs.filter(function(c){return c.homeAway==='home'})[0]||cs[0]
        var away=cs.filter(function(c){return c.homeAway==='away'})[0]||cs[1]
        var hn=(home.team&&(home.team.displayName||home.team.name||home.team.shortDisplayName))||''
        var an=(away.team&&(away.team.displayName||away.team.name||away.team.shortDisplayName))||''
        // Spielplan-Infos (auch für noch nicht gespielte Spiele): Anstoß + Ort.
        var ven=comp.venue||{}, addr=ven.address||{}
        var venue=[ven.fullName, addr.city].filter(Boolean).join(', ')
        sched.push({ strHomeTeam:hn, strAwayTeam:an, kickoff:ev.date||'', venue:venue })
        // Ergebnis nur bei beendeten Spielen.
        var st=(ev.status||comp.status), done=st&&st.type&&st.type.completed
        if(!done || home.score==null || away.score==null) return
        evs.push({ idLeague:WC_LEAGUE, strHomeTeam:hn, strAwayTeam:an, intHomeScore:+home.score, intAwayScore:+away.score })
      })})
      return { ok:ok, evs:evs, sched:sched }
    })
  }

  // Backup-Quelle: OpenLigaDB (vollständig, aber teils verzögert). Eine Abfrage = ALLE Spiele.
  var OLDB_URL = 'https://api.openligadb.de/getmatchdata/wm2026/2026'
  function fetchOLDB(){
    return fetch(OLDB_URL).then(function(r){ return r.json() }).then(function(data){
      if(!Array.isArray(data)) return null
      var evs=[]
      data.forEach(function(m){
        var fin=finalResult(m); if(!fin||fin.pointsTeam1==null||fin.pointsTeam2==null) return
        // Übernehmen, sobald ein ENDERGEBNIS vorliegt (auch wenn das "beendet"-Flag noch hinterherhinkt).
        if(!(m.matchIsFinished || fin.resultTypeID===2)) return
        evs.push({ idLeague:WC_LEAGUE,
          strHomeTeam:(m.team1&&m.team1.teamName)||'', strAwayTeam:(m.team2&&m.team2.teamName)||'',
          intHomeScore:fin.pointsTeam1, intAwayScore:fin.pointsTeam2 })
      })
      return evs
    }).catch(function(){ return null })
  }
  // Zweitquelle (Fallback): TheSportsDB – letzte beendete Spiele. Was eine Quelle früher hat, füllt die App.
  function fetchTSDB(){
    return fetch(API_BASE+'eventspast.php?id='+WC_LEAGUE).then(function(r){ return r.json() })
      .then(function(d){
        return ((d&&d.events)||[]).map(function(e){ return {
          idLeague:e.idLeague, strHomeTeam:e.strHomeTeam, strAwayTeam:e.strAwayTeam,
          intHomeScore:e.intHomeScore, intAwayScore:e.intAwayScore } })
      }).catch(function(){ return null })
  }
  // full=true: ganzes Turnierfenster (Start/Manuell). full=false: nur letzte Tage (Intervall).
  function applyLive(full){
    if(!ui.live) return Promise.resolve(false)
    var espnDates = full ? ESPN_DATES : recentEspn()
    return Promise.all([ fetchESPN(espnDates), fetchOLDB(), fetchTSDB() ]).then(function(res){
      var espn=res[0], oldb=res[1], tsdb=res[2]
      var ok = (espn && espn.ok) || oldb!==null || tsdb!==null
      // Reihenfolge: Backups zuerst, ESPN zuletzt -> ESPN (am aktuellsten) gewinnt bei Konflikten.
      var all = (oldb||[]).concat(tsdb||[]).concat((espn&&espn.evs)||[])
      var changedScores = applyEvents(all)
      var changedSched = applySchedule((espn&&espn.sched)||[])
      var changed = changedScores || changedSched
      if(ok){ ui.liveError=false; ui.lastUpdate=nowStr() } else { ui.liveError=true }
      if(changed){ save(); updateScoreInputs(); if(changedSched) renderGroupInputs(); renderDerived() }
      renderLiveStatus()
      return changed
    })
  }

  // ---------- Header / Init ----------
  function renderHeader(){
    el('hdr').innerHTML =
      '<h1>'+esc(t('appTitle'))+'</h1>'
      +'<p class="sub">'+esc(t('subtitle'))+'</p>'
      +'<div class="toolbar">'
      +  '<label class="myteam">'+esc(t('lblMyTeam'))+' <select id="myTeam"></select></label>'
      +  '<label class="lang">'+esc(t('lblLang'))+' <select id="langSel"><option value="de">Deutsch</option><option value="en">English</option><option value="es">Español</option></select></label>'
      +  '<label class="live"><input type="checkbox" id="liveToggle"> 🔴 '+esc(t('lblLive'))+'</label>'
      +  '<button id="btnRefresh">'+esc(t('refreshNow'))+'</button>'
      +  '<span id="liveStatus" class="hint"></span>'
      +  '<button id="btnClear">'+esc(t('clearResults'))+'</button>'
      +  '<button id="btnReset">'+esc(t('resetLive'))+'</button>'
      +'</div>'
      +'<p class="hint disclaimer">'+esc(t('liveDisclaimer'))+'</p>'
    document.title = t('appTitle').replace(/^[^A-Za-z0-9]+/,'')

    el('myTeam').addEventListener('change',function(){
      ui.myTeam=this.value
      if(this.value){ ui.group=this.value.charAt(0); renderTabs(); renderGroupInputs() } // Gruppe des Teams aufschlagen
      renderDerived()
    })
    var ls=el('langSel'); ls.value=ui.lang
    ls.addEventListener('change',function(){ ui.lang=this.value; saveLang(); renderAll() })
    var tg=el('liveToggle'); tg.checked=ui.live
    tg.addEventListener('change',function(){ ui.live=tg.checked; renderLiveStatus(); if(ui.live)applyLive(true) })
    el('btnRefresh').addEventListener('click',function(){ applyLive(true) })
    el('btnClear').addEventListener('click',function(){
      state.matches.forEach(function(m){ m.hg=null; m.ag=null; state.manual[m.id]=true })
      save(); renderGroupInputs(); renderDerived()
    })
    el('btnReset').addEventListener('click',function(){
      state=seed(); save(); ui.myTeam=''; renderMyTeamSelect(); renderGroupInputs(); renderDerived(); applyLive(true)
    })
    renderMyTeamSelect(); renderLiveStatus()
  }

  function renderAll(){ renderHeader(); renderTabs(); renderGroupInputs(); renderDerived() }

  function init(){
    renderAll()
    applyLive(true)            // Start: alle Spieltage (vollständig)
    setInterval(function(){ applyLive(false) }, 60000) // Intervall: nur letzte Tage
  }
  init()
})()
