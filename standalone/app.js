/* WM 2026 Gegner-Rechner – eigenständige Version (kein Build nötig).
   Erwartet globales R32_DATA (aus der offiziellen FIFA-Tabelle). */
(function () {
  'use strict'

  // ---------- Konstanten / Spielplan ----------
  var GROUPS = ['A','B','C','D','E','F','G','H','I','J','K','L']
  var FLAGS = (typeof WC2026 !== 'undefined' && WC2026.flags) || {}
  function flag(name){ return FLAGS[name] ? FLAGS[name] + ' ' : '' }

  // ---------- Live-Daten (TheSportsDB, kostenlos, CORS offen) ----------
  var API_BASE = 'https://www.thesportsdb.com/api/v1/json/3/'
  var WC_LEAGUE = (WC2026 && WC2026.apiLeagueId) || '4429'
  var ALIASES = (WC2026 && WC2026.aliases) || {}
  function norm(s){ return String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/g,'') }
  // Normalisierter Team-Name -> interne Team-ID (group+pos), unabhängig von editierten Namen.
  var ALIAS_TO_ID = {}
  GROUPS.forEach(function(g){
    var data = WC2026.groups[g]
    data.teams.forEach(function(nm,i){
      var id = g+(i+1)
      ALIAS_TO_ID[norm(nm)] = id
      ;(ALIASES[nm]||[]).forEach(function(a){ ALIAS_TO_ID[norm(a)] = id })
    })
  })

  // 16 R32-Spiele (73–88) aus r32Bracket.ts
  var R32_MATCHES = [
    {n:73,h:{t:'r',g:'A'},a:{t:'r',g:'B'}},
    {n:74,h:{t:'w',g:'E'},a:{t:'3'}},
    {n:75,h:{t:'w',g:'F'},a:{t:'r',g:'C'}},
    {n:76,h:{t:'w',g:'C'},a:{t:'r',g:'F'}},
    {n:77,h:{t:'w',g:'I'},a:{t:'3'}},
    {n:78,h:{t:'r',g:'E'},a:{t:'r',g:'I'}},
    {n:79,h:{t:'w',g:'A'},a:{t:'3'}},
    {n:80,h:{t:'w',g:'L'},a:{t:'3'}},
    {n:81,h:{t:'w',g:'D'},a:{t:'3'}},
    {n:82,h:{t:'w',g:'G'},a:{t:'3'}},
    {n:83,h:{t:'r',g:'K'},a:{t:'r',g:'L'}},
    {n:84,h:{t:'w',g:'H'},a:{t:'r',g:'J'}},
    {n:85,h:{t:'w',g:'B'},a:{t:'3'}},
    {n:86,h:{t:'w',g:'J'},a:{t:'r',g:'H'}},
    {n:87,h:{t:'w',g:'K'},a:{t:'3'}},
    {n:88,h:{t:'r',g:'D'},a:{t:'r',g:'G'}},
  ]
  var WINNER_TO_THIRD_MATCH = R32_DATA.winnerToMatch // {A:79,...}
  var MATCH_TO_WINNER = {}
  Object.keys(WINNER_TO_THIRD_MATCH).forEach(function (g) {
    MATCH_TO_WINNER[WINNER_TO_THIRD_MATCH[g]] = g
  })
  var FEEDERS = {
    89:[74,77],90:[73,75],91:[76,78],92:[79,80],
    93:[83,84],94:[81,82],95:[86,88],96:[85,87],
    97:[89,90],98:[93,94],99:[91,92],100:[95,96],
    101:[97,98],102:[99,100],104:[101,102],
  }
  var PARENT = {}
  Object.keys(FEEDERS).forEach(function (p) {
    FEEDERS[p].forEach(function (k) { PARENT[k] = +p })
  })
  var ROUND_LABEL = { R32:'Sechzehntelfinale', R16:'Achtelfinale', QF:'Viertelfinale', SF:'Halbfinale', F:'Finale' }
  function roundOf(n){ if(n<=88)return'R32'; if(n<=96)return'R16'; if(n<=100)return'QF'; if(n<=102)return'SF'; return'F' }

  // ---------- State ----------
  var KEY = 'wm2026-standalone-v2'
  var state = load()
  var ui = { group:'A', myTeam:'', live:true, lastUpdate:'', liveError:false }

  // Echte WM-2026-Auslosung + aktueller Spielstand (aus WC2026, vom Build injiziert).
  function seed(){
    var teams=[], matches=[]
    GROUPS.forEach(function(g){
      var data=WC2026.groups[g]
      var idByName={}
      data.teams.forEach(function(name,i){ teams.push({id:g+(i+1),name:name,group:g,fairPlay:0}); idByName[name]=g+(i+1) })
      data.matches.forEach(function(m,i){ matches.push({id:g+(i+1),group:g,home:idByName[m[0]],away:idByName[m[1]],hg:m[2],ag:m[3]}) })
    })
    return {teams:teams,matches:matches,manual:{}}
  }
  function load(){ try{var r=localStorage.getItem(KEY); if(r){var s=JSON.parse(r); if(!s.manual)s.manual={}; return s}}catch(e){} return seed() }
  function save(){ try{localStorage.setItem(KEY,JSON.stringify(state))}catch(e){} }

  function teamsOfGroup(g){ return state.teams.filter(function(t){return t.group===g}) }
  function nameOf(id){ var t=state.teams.find(function(x){return x.id===id}); return t?t.name:id }
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
  function cmpOverall(x,y){ return (y.points-x.points)||(y.gd-x.gd)||(y.gf-x.gf) }
  function cmpFair(x,y){ return y.fairPlay-x.fairPlay }

  function breakTie(block, matches, fp, lot){
    var h2h=matches.filter(function(m){return block.indexOf(m.home)>=0&&block.indexOf(m.away)>=0})
    var hs=computeStats(block,h2h,fp)
    var sorted=block.slice().sort(function(p,q){return cmpOverall(hs[p],hs[q])||cmpFair(hs[p],hs[q])})
    var res=[],i=0
    while(i<sorted.length){
      var j=i+1
      while(j<sorted.length&&cmpOverall(hs[sorted[i]],hs[sorted[j]])===0&&cmpFair(hs[sorted[i]],hs[sorted[j]])===0)j++
      var sub=sorted.slice(i,j)
      if(sub.length===1)res.push(sub[0])
      else if(sub.length<block.length)res.push.apply(res,breakTie(sub,matches,fp,lot))
      else{ sub.forEach(function(id){lot[id]=true}); res.push.apply(res,sub.slice().sort()) }
      i=j
    }
    return res
  }
  function rankGroup(ids, matches, fp){
    var st=computeStats(ids,matches,fp), lot={}
    var sorted=ids.slice().sort(function(p,q){return cmpOverall(st[p],st[q])})
    var order=[],i=0
    while(i<sorted.length){
      var j=i+1
      while(j<sorted.length&&cmpOverall(st[sorted[i]],st[sorted[j]])===0)j++
      var b=sorted.slice(i,j)
      if(b.length===1)order.push(b[0]); else order.push.apply(order,breakTie(b,matches,fp,lot))
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

  // ---------- Szenarien: erreichbare Plätze ----------
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
    var key=qualGroups.slice().sort().join('')
    return R32_DATA.combinations[key]||null // values like "3E"
  }
  function buildTeamOf(standings){
    return function(label){ // '1A','2B','3E'
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
      var wg=MATCH_TO_WINNER[n]
      var third=wg?assign['1'+wg]:null // "3X"
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

  function renderTabs(){
    var h=GROUPS.map(function(g){ return '<button data-tab="'+g+'" class="'+(g===ui.group?'active':'')+'">'+g+'</button>' }).join('')
    el('tabs').innerHTML=h
    el('tabs').querySelectorAll('button').forEach(function(b){
      b.addEventListener('click',function(){ ui.group=b.getAttribute('data-tab'); renderTabs(); renderGroupInputs(); renderDerived() })
    })
  }

  function renderMyTeamSelect(){
    var sel=el('myTeam'); var cur=ui.myTeam
    var h='<option value="">– wählen –</option>'
    GROUPS.forEach(function(g){
      h+='<optgroup label="Gruppe '+g+'">'
      teamsOfGroup(g).forEach(function(t){ h+='<option value="'+t.id+'">'+flag(t.name)+esc(t.name)+'</option>' })
      h+='</optgroup>'
    })
    sel.innerHTML=h; sel.value=cur
  }

  function renderGroupInputs(){
    var g=ui.group, teams=teamsOfGroup(g), matches=state.matches.filter(function(m){return m.group===g})
    var h='<h2>Ergebnisse – Gruppe '+g+'</h2><div class="matches">'
    matches.forEach(function(m){
      h+='<div class="match">'
        +'<span class="tn r">'+flag(nameOf(m.home))+esc(nameOf(m.home))+'</span>'
        +'<input type="number" min="0" data-score="'+m.id+'" data-side="h" value="'+(m.hg==null?'':m.hg)+'">'
        +'<span class="colon">:</span>'
        +'<input type="number" min="0" data-score="'+m.id+'" data-side="a" value="'+(m.ag==null?'':m.ag)+'">'
        +'<span class="tn">'+flag(nameOf(m.away))+esc(nameOf(m.away))+'</span>'
        +'</div>'
    })
    h+='</div><p class="hint">Leeres Feld = Spiel offen.</p>'
    h+='<h3>Teams &amp; Fair-Play</h3><table class="teamedit"><tbody>'
    teams.forEach(function(t){
      h+='<tr><td><input data-name="'+t.id+'" value="'+esc(t.name)+'"></td>'
        +'<td class="fp">Fair-Play:<input type="number" data-fp="'+t.id+'" value="'+t.fairPlay+'"></td></tr>'
    })
    h+='</tbody></table>'
    el('groupInputs').innerHTML=h

    el('groupInputs').querySelectorAll('[data-score]').forEach(function(inp){
      inp.addEventListener('input',function(){
        var id=inp.getAttribute('data-score'), side=inp.getAttribute('data-side')
        var m=state.matches.find(function(x){return x.id===id})
        var v=inp.value===''?null:Number(inp.value)
        if(side==='h')m.hg=v; else m.ag=v
        state.manual[m.id]=true // manuell -> Live überschreibt nicht mehr
        save(); renderDerived()
      })
    })
    el('groupInputs').querySelectorAll('[data-name]').forEach(function(inp){
      inp.addEventListener('input',function(){
        var t=state.teams.find(function(x){return x.id===inp.getAttribute('data-name')})
        t.name=inp.value; save(); renderDerived()
        // Gegnernamen in den Match-Zeilen aktualisieren:
        renderMatchLabels()
      })
    })
    el('groupInputs').querySelectorAll('[data-fp]').forEach(function(inp){
      inp.addEventListener('input',function(){
        var t=state.teams.find(function(x){return x.id===inp.getAttribute('data-fp')})
        t.fairPlay=Number(inp.value)||0; save(); renderDerived()
      })
    })
  }

  // Aktualisiert nur die Teamnamen-Labels in den Match-Zeilen (ohne Inputs neu zu bauen)
  function renderMatchLabels(){
    var matches=state.matches.filter(function(m){return m.group===ui.group})
    var rows=el('groupInputs').querySelectorAll('.match')
    rows.forEach(function(row,i){
      var m=matches[i]; if(!m)return
      var spans=row.querySelectorAll('.tn')
      spans[0].textContent=flag(nameOf(m.home))+nameOf(m.home); spans[1].textContent=flag(nameOf(m.away))+nameOf(m.away)
    })
    renderMyTeamSelect()
  }

  function renderDerived(){
    var standings=allStandings()
    var thirds=rankThirds(standings)
    renderStandings(standings)
    renderThirds(thirds)
    renderMyTeam(standings,thirds)
    renderOpponents(standings,thirds)
  }

  function rowClass(rank,team){ var c=rank<=2?'adv':rank===3?'maybe':'out'; if(ui.myTeam&&team===ui.myTeam)c+=' mine'; return c }

  function renderStandings(standings){
    var g=ui.group, rows=standings[g]
    var h='<h2>Gruppe '+g+' – Tabelle</h2><table class="standings"><thead><tr>'
      +'<th>#</th><th class="l">Team</th><th>Sp</th><th>S</th><th>U</th><th>N</th><th>Tore</th><th>TD</th><th>Pkt</th></tr></thead><tbody>'
    rows.forEach(function(r){
      h+='<tr class="'+rowClass(r.rank,r.team)+'"><td>'+r.rank+(r.lot?' 🎲':'')+'</td><td class="l">'+flag(nameOf(r.team))+esc(nameOf(r.team))+'</td>'
        +'<td>'+r.played+'</td><td>'+r.won+'</td><td>'+r.drawn+'</td><td>'+r.lost+'</td>'
        +'<td>'+r.gf+':'+r.ga+'</td><td>'+(r.gd>0?'+'+r.gd:r.gd)+'</td><td><b>'+r.points+'</b></td></tr>'
    })
    h+='</tbody></table><p class="legend"><span class="dot adv"></span> 1./2. → weiter &nbsp;'
      +'<span class="dot maybe"></span> 3. → evtl. &nbsp;<span class="dot out"></span> raus &nbsp; 🎲 = Los</p>'
    el('standings').innerHTML=h
  }

  function renderThirds(thirds){
    var h='<h2>Rangliste der Gruppendritten (8 von 12 weiter)</h2><table class="standings"><thead><tr>'
      +'<th>#</th><th class="l">Team</th><th>Gr.</th><th>Sp</th><th>Pkt</th><th>TD</th><th>Tore</th><th>FP</th><th></th></tr></thead><tbody>'
    thirds.forEach(function(e){
      h+='<tr class="'+(e.qualifies?'adv':'out')+'"><td>'+e.rank+(e.lot?' 🎲':'')+'</td><td class="l">'+flag(nameOf(e.team))+esc(nameOf(e.team))+'</td>'
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
    var reach=an.reach
    var v
    if(reach.length===0)v={c:'out',t:'Keine Daten'}
    else if(an.worst<=2)v={c:'adv',t:'Sicher weiter (mind. Platz 2)'}
    else if(an.best>=4)v={c:'out',t:'Ausgeschieden'}
    else if(an.best<=2)v={c:'maybe',t:'Weiterkommen möglich (Plätze '+reach.join('/')+')'}
    else v={c:'maybe',t:'Nur als Gruppendritter möglich (Plätze '+reach.join('/')+')'}
    var te=thirds.find(function(e){return e.team===team.id})
    var h='<section class="myteam-panel '+v.c+'"><h2>'+flag(team.name)+esc(team.name)+' <span class="grp">(Gruppe '+team.group+')</span></h2>'
      +'<div class="verdict">'+v.t+'</div><ul class="facts">'
      +'<li>Aktueller Platz: <b>'+(pos?pos.rank:'–')+'</b> mit '+(pos?pos.points:0)+' Pkt (TD '+(pos&&pos.gd>0?'+':'')+(pos?pos.gd:0)+')</li>'
      +'<li>Erreichbare Endplätze: <b>'+(reach.join(', ')||'–')+'</b></li>'
      +'<li>Durchgerechnete Szenarien: '+an.scenarios.toLocaleString('de')+(an.approx?' (genähert: nur S/U/N)':'')+'</li>'
    if(reach.indexOf(3)>=0){
      h+='<li>Als Dritter aktuell Rang <b>'+(te?te.rank:'–')+'/12</b> → '+(te&&te.qualifies?'unter den besten 8 ✅':'NICHT unter den besten 8 ❌')+'</li>'
    }
    h+='</ul></section>'
    box.innerHTML=h
  }

  function renderOpponents(standings,thirds){
    var qual=thirds.filter(function(e){return e.qualifies}).map(function(e){return e.group})
    var resolved=null
    if(qual.length===8) resolved=resolveR32(qual,buildTeamOf(standings))
    var h='<h2>Mögliche Gegner (K.-o.-Phase)</h2>'
    if(!resolved){ h+='<div class="notice">Bracket konnte nicht aufgelöst werden.</div>'; el('opponents').innerHTML=h; return }
    h+='<p class="hint">Basierend auf der <b>aktuellen Tabelle</b> (1./2. + die 8 besten Dritten). R32-Gegner steht fest; ab Achtelfinale = mögliche Gegner.</p>'
    var myName=ui.myTeam?nameOf(ui.myTeam):''
    if(ui.myTeam){
      var path=opponentPath(myName,resolved)
      h+='<div class="mypath"><h3>Weg von '+flag(myName)+esc(myName)+'</h3>'
      if(path){
        h+='<ol class="path"><li><span class="r">Sechzehntelfinale (R32)</span><span class="opp">vs '+flag(path.r32Opponent)+esc(path.r32Opponent)+'</span></li>'
        path.rounds.forEach(function(r){
          h+='<li><span class="r">'+ROUND_LABEL[r.round]+'</span><span class="opp">'+(r.opponents.length===1?'vs ':'mögl. Gegner: ')+r.opponents.map(function(o){return flag(o)+esc(o)}).join(', ')+'</span></li>'
        })
        h+='</ol>'
      } else {
        h+='<p class="notice">'+flag(myName)+esc(myName)+' ist nach aktueller Tabelle <b>nicht im Achtelfinale</b>.</p>'
      }
      h+='</div>'
    }
    h+='<h3>Komplettes Sechzehntelfinale (R32)</h3><table class="bracket"><tbody>'
    resolved.forEach(function(m){
      var mine=(m.home===myName||m.away===myName)?' class="mine"':''
      h+='<tr'+mine+'><td class="mno">#'+m.n+'</td><td class="r">'+flag(m.home)+esc(m.home)+'</td><td class="vs">–</td><td class="l">'+flag(m.away)+esc(m.away)+'</td></tr>'
    })
    h+='</tbody></table>'
    el('opponents').innerHTML=h
  }

  // ---------- Live-Abruf ----------
  function findMatch(g, idA, idB){
    return state.matches.find(function(m){
      return m.group===g && ((m.home===idA&&m.away===idB)||(m.home===idB&&m.away===idA))
    })
  }
  function nowStr(){ var d=new Date(); function p(n){return(n<10?'0':'')+n} return p(d.getHours())+':'+p(d.getMinutes())+':'+p(d.getSeconds()) }

  // Setzt die Score-Inputs der aktuellen Gruppe auf den State-Wert (ohne Inputs neu zu bauen).
  function updateScoreInputs(){
    el('groupInputs').querySelectorAll('[data-score]').forEach(function(inp){
      if(inp===document.activeElement) return // nicht überschreiben, während getippt wird
      var m=state.matches.find(function(x){return x.id===inp.getAttribute('data-score')})
      if(!m)return
      var v=inp.getAttribute('data-side')==='h'?m.hg:m.ag
      inp.value=(v==null?'':v)
    })
  }
  function renderLiveStatus(){
    var s=el('liveStatus'); if(!s)return
    if(!ui.live){ s.textContent='Live aus'; return }
    var t=ui.lastUpdate?('aktualisiert '+ui.lastUpdate):'lade…'
    s.textContent=(ui.liveError?'⚠ keine Verbindung – gespeicherter Stand · ':'🔴 Live · ')+t
  }

  // Holt die letzten beendeten WM-Spiele und überträgt Ergebnisse ins Modell.
  function applyLive(){
    if(!ui.live) return Promise.resolve(false)
    return fetch(API_BASE+'eventspast.php?id='+WC_LEAGUE)
      .then(function(r){ return r.json() })
      .then(function(d){
        var ev=(d&&d.events)||[]; var changed=false
        ev.forEach(function(e){
          if(String(e.idLeague)!==String(WC_LEAGUE)) return
          if(e.intHomeScore==null||e.intAwayScore==null||e.intHomeScore===''||e.intAwayScore==='') return
          var hid=ALIAS_TO_ID[norm(e.strHomeTeam)], aid=ALIAS_TO_ID[norm(e.strAwayTeam)]
          if(!hid||!aid) return
          if(hid.charAt(0)!==aid.charAt(0)) return // unterschiedliche Gruppen -> K.o.-Spiel, ignorieren
          var g=hid.charAt(0)
          var m=findMatch(g,hid,aid); if(!m) return
          if(state.manual[m.id]) return // manuelle Eingabe hat Vorrang
          var hg,ag
          if(m.home===hid){ hg=+e.intHomeScore; ag=+e.intAwayScore } else { hg=+e.intAwayScore; ag=+e.intHomeScore }
          if(m.hg!==hg||m.ag!==ag){ m.hg=hg; m.ag=ag; changed=true }
        })
        ui.liveError=false; ui.lastUpdate=nowStr()
        if(changed){ save(); updateScoreInputs(); renderDerived() }
        renderLiveStatus()
        return changed
      })
      .catch(function(){ ui.liveError=true; renderLiveStatus(); return false })
  }

  // ---------- Init ----------
  function init(){
    renderMyTeamSelect()
    el('myTeam').addEventListener('change',function(){ ui.myTeam=this.value; renderDerived(); renderStandings(allStandings()) })
    el('btnClear').addEventListener('click',function(){
      state.matches.forEach(function(m){ m.hg=null; m.ag=null; state.manual[m.id]=true })
      save(); renderGroupInputs(); renderDerived()
    })
    el('btnReset').addEventListener('click',function(){
      state=seed(); save(); ui.myTeam=''; renderMyTeamSelect(); renderGroupInputs(); renderDerived(); applyLive()
    })
    var tg=el('liveToggle')
    if(tg){ tg.checked=ui.live; tg.addEventListener('change',function(){ ui.live=tg.checked; renderLiveStatus(); if(ui.live)applyLive() }) }
    var rf=el('btnRefresh'); if(rf)rf.addEventListener('click',function(){ applyLive() })

    renderTabs(); renderGroupInputs(); renderDerived(); renderLiveStatus()
    // Live: sofort + alle 45s
    applyLive()
    setInterval(applyLive, 45000)
  }
  init()
})()
