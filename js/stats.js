// ══════════════════════════════════════════════════════════════════════════════
// PANEL DE ESTADÍSTICAS — tabla completa de todas las perks
// ══════════════════════════════════════════════════════════════════════════════
let _statsSortMode = 'count'; 

function buildFullPerkCatalog(){
  const catalog = []; 
  const seen = new Set();
  SURVIVORS.forEach(s => {
    s.perks.en.forEach((pEn, pi) => {
      if(!seen.has(pEn)){
        seen.add(pEn);
        catalog.push({ nameEs: s.perks.es[pi], nameEn: pEn, charEs: s.name.es||s.name.en, charEn: s.name.en });
      }
    });
  });
  GENERAL_PERKS.forEach(gp => {
    if(!seen.has(gp.en)){
      seen.add(gp.en);
      catalog.push({ nameEs: gp.es, nameEn: gp.en, charEs: I18N.es.general_perks, charEn: I18N.en.general_perks });
    }
  });
  return catalog;
}

function setSortStats(mode){
  _statsSortMode = mode;
  document.querySelectorAll('.stats-sort-btn').forEach(b => b.classList.remove('active'));
  const btnMap = { count:'sort-count', zero:'sort-zero', alpha:'sort-alpha' };
  const btn = document.getElementById(btnMap[mode]);
  if(btn) btn.classList.add('active');
  renderStatsTable();
}

function renderStatsTable(){
  const catalog = buildFullPerkCatalog();
  const query = (document.getElementById('stats-search')?.value || '').toLowerCase().trim();
  const maxCount = Math.max(1, ...Object.values(statsSurvPerks));
  const totalSpins = Object.values(statsSurvPerks).reduce((a,b)=>a+b, 0);
  const totalPerks = catalog.length;
  const seenPerks = catalog.filter(p => (statsSurvPerks[p.nameEs] || 0) > 0).length;
  const zeroPerks = totalPerks - seenPerks;

  const summaryEl = document.getElementById('stats-summary-row');
  if(summaryEl) summaryEl.innerHTML = `
    <div>Total apariciones: <span>${totalSpins}</span></div>
    <div>Perks vistas: <span>${seenPerks} / ${totalPerks}</span></div>
    <div>Sin aparecer: <span style="color:var(--muted)">${zeroPerks}</span></div>`;

  let filtered = catalog.filter(p => {
    const name = lang === 'es' ? p.nameEs : p.nameEn;
    const char = lang === 'es' ? p.charEs : p.charEn;
    return !query || name.toLowerCase().includes(query) || char.toLowerCase().includes(query);
  });

  filtered.sort((a, b) => {
    const cA = statsSurvPerks[a.nameEs] || 0;
    const cB = statsSurvPerks[b.nameEs] || 0;
    if(_statsSortMode === 'count')  return cB - cA || a.nameEs.localeCompare(b.nameEs);
    if(_statsSortMode === 'zero')   return cA - cB || a.nameEs.localeCompare(b.nameEs);
    if(_statsSortMode === 'alpha')  return (lang==='es'?a.nameEs:a.nameEn).localeCompare(lang==='es'?b.nameEs:b.nameEn);
    return 0;
  });

  function countColor(c){
    if(c === 0)              return 'count-0';
    if(c <= maxCount * 0.25) return 'count-low';
    if(c <= maxCount * 0.5)  return 'count-mid';
    if(c <= maxCount * 0.75) return 'count-high';
    return 'count-top';
  }

  const tbody = document.getElementById('stats-tbody');
  if(!tbody) return;

  if(filtered.length === 0){
    tbody.innerHTML = `<tr><td colspan="2" style="color:var(--muted);text-align:center;padding:20px;">${t('stats_empty')}</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(p => {
    const count = statsSurvPerks[p.nameEs] || 0;
    const pct = maxCount > 0 ? (count / maxCount * 100).toFixed(0) : 0;
    const name = lang === 'es' ? p.nameEs : p.nameEn;
    const char = lang === 'es' ? p.charEs : p.charEn;
    const barColor = count === 0 ? 'var(--border)' :
                     count <= maxCount*0.25 ? 'var(--muted)' :
                     count <= maxCount*0.5  ? 'var(--cream)' :
                     count <= maxCount*0.75 ? 'var(--orange)' : 'var(--red2)';
    return `<tr>
      <td class="count-cell ${countColor(count)}">${count}</td>
      <td>
        <div>${name}</div>
        <div class="stats-perk-char">${char}</div>
        <div class="stats-bar"><div class="stats-bar-fill" style="width:${pct}%;background:${barColor};"></div></div>
      </td>
    </tr>`;
  }).join('');
}

function showStats(){
  if(!statsKillMods) statsKillMods = {0:0,1:0,2:0,3:0,4:0};
  if(!statsSurvPerks) statsSurvPerks = {};

  const killSummary = document.getElementById('stats-kill-summary');
  if(killSummary){
    const totalK = Object.values(statsKillMods).reduce((a,b)=>a+b,0);
    killSummary.innerHTML = `
      <div style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:var(--muted);margin-bottom:6px;font-family:'Oswald',sans-serif;">${t('stats_kill')}</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        ${[0,1,2,3,4].map(i=>{
          const colors=['var(--green2)','var(--cream)','var(--cream)','var(--orange)','var(--red2)'];
          const labels=['4P','3P','2P','1P','0P'];
          const v=statsKillMods[i]||0;
          return `<div style="background:var(--surf);border:1px solid var(--border);padding:5px 10px;font-family:'Oswald',sans-serif;font-size:11px;text-align:center;">
            <div style="color:${colors[i]};font-size:16px;font-weight:700;">${v}</div>
            <div style="color:var(--muted);font-size:9px;">${labels[i]}</div>
          </div>`;
        }).join('')}
        <div style="background:var(--surf);border:1px solid var(--border);padding:5px 10px;font-family:'Oswald',sans-serif;font-size:11px;text-align:center;">
          <div style="color:var(--muted);font-size:16px;font-weight:700;">${totalK}</div>
          <div style="color:var(--muted);font-size:9px;">TOTAL</div>
        </div>
      </div>`;
  }

  const searchEl = document.getElementById('stats-search');
  if(searchEl) searchEl.value = '';
  _statsSortMode = 'count';
  document.querySelectorAll('.stats-sort-btn').forEach(b=>b.classList.remove('active'));
  const sc = document.getElementById('sort-count'); if(sc) sc.classList.add('active');
  renderStatsTable();
  document.getElementById('stats-overlay').classList.add('show');
}

function closeStats(){
  document.getElementById('stats-overlay').classList.remove('show');
}

function resetStats(){
  if(!confirm(t('confirm_clear'))) return;
  statsSurvPerks = {};
  statsKillMods = {0:0,1:0,2:0,3:0,4:0};
  save();
  showStats();
}
