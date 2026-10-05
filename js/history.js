// ══════════════════════════════════════════════════════════════════════════════
// HISTORIAL DE TIRADAS Y COPIAR BUILD
// ══════════════════════════════════════════════════════════════════════════════
const HISTORY_MAX = 40;    // tiradas guardadas
const HISTORY_SHOWN = 15;  // tiradas visibles por panel
const KILL_MOD_SHORT = ['4P','3P','2P','1P','0P'];

function pushHistory(entry){
  spinHistory.unshift(entry);
  if(spinHistory.length > HISTORY_MAX) spinHistory.length = HISTORY_MAX;
  return entry;
}

// finalPerks: las 4 ranuras; las vacías no tienen id y no se guardan
function recordSurvSpin(finalPerks){
  const entry = pushHistory({ ts: Date.now(), type: 'surv', perks: finalPerks.filter(p => p.id).map(p => p.id) });
  renderHistory();
  return entry;
}

function recordKillSpin(idx, modIdx){
  const entry = pushHistory({
    ts: Date.now(), type: 'kill', killer: killerKey(KILLERS[idx]),
    mod: useKillerMods ? modIdx : null, outcome: null
  });
  renderHistory();
  return entry;
}

function setKillOutcome(outcome){
  if(!_curKillEntry) return;
  _curKillEntry.outcome = outcome;
  _curKillEntry = null;
  save(); renderHistory();
}

function clearHistory(which){
  if(!confirm(t('confirm_history'))) return;
  spinHistory = spinHistory.filter(e => e.type !== which);
  save(); renderHistory();
}

// ── Nombres a partir de ids ──
let _perkMap = null;
function perkName(id){
  if(!_perkMap){ _perkMap = {}; buildFullPerkCatalog().forEach(p => { _perkMap[p.id] = p; }); }
  const p = _perkMap[id];
  return p ? (lang === 'es' ? p.nameEs : p.nameEn) : id;
}
function killerNameByKey(key){
  const k = KILLERS.find(x => killerKey(x) === key);
  return k ? kName(k) : key;
}

function fmtTime(ts){
  try{
    return new Date(ts).toLocaleString(lang === 'es' ? 'es-MX' : 'en-US',
      { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' });
  }catch(e){ return ''; }
}

// ── Render ──
function renderHistory(){
  ['surv','kill'].forEach(which => {
    const all = spinHistory.filter(e => e.type === which);
    const list = document.getElementById(which + '-history-list');
    const count = document.getElementById(which + '-history-count');
    if(!list) return;
    count.textContent = all.length ? '(' + all.length + ')' : '';
    if(!all.length){
      list.innerHTML = `<li class="hist-empty">${t('history_empty')}</li>`;
      return;
    }
    list.innerHTML = all.slice(0, HISTORY_SHOWN).map(e => which === 'surv' ? survRow(e) : killRow(e)).join('');
  });
}

function survRow(e){
  const names = e.perks.map(perkName).join(' · ');
  return `<li><span class="hist-time">${fmtTime(e.ts)}</span>
    <span class="hist-body">${names}</span>
    <button class="hist-copy" onclick="copyHistoryEntry(${e.ts},this)" title="${escAttr(t('copy_build'))}" aria-label="${escAttr(t('copy_build'))}">&#10697;</button></li>`;
}

function killRow(e){
  const mod = (e.mod === null || e.mod === undefined) ? '' : ' · ' + KILL_MOD_SHORT[e.mod];
  const out = e.outcome === 'win' ? '<span class="hist-out win">&#10003;</span>'
            : e.outcome === 'loss' ? '<span class="hist-out loss">&#10005;</span>'
            : '<span class="hist-out">—</span>';
  return `<li><span class="hist-time">${fmtTime(e.ts)}</span>
    <span class="hist-body">${killerNameByKey(e.killer)}${mod}</span>${out}</li>`;
}

// ── Copiar ──
async function copyText(text){
  try{
    if(navigator.clipboard && window.isSecureContext){ await navigator.clipboard.writeText(text); return true; }
  }catch(e){}
  try{ // respaldo para http o file:// donde navigator.clipboard puede no estar disponible
    const ta = document.createElement('textarea');
    ta.value = text; ta.setAttribute('readonly','');
    ta.style.cssText = 'position:fixed;top:-1000px;opacity:0';
    document.body.appendChild(ta); ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  }catch(e){ return false; }
}

function flashButton(btn, ok){
  if(!btn) return;
  const label = btn.querySelector('[data-i]');
  if(label){
    label.textContent = t(ok ? 'copied' : 'copy_failed');
    setTimeout(() => { label.textContent = t(label.dataset.i); }, 1500);
  } else {
    const orig = btn.innerHTML;
    btn.innerHTML = ok ? '&#10003;' : '&#10005;';
    setTimeout(() => { btn.innerHTML = orig; }, 1500);
  }
}

async function copyBuild(btn){
  const names = _survFinalPerks.filter(p => p.id).map(p => p.perk[lang]);
  flashButton(btn, await copyText(names.join(' · ')));
}

async function copyHistoryEntry(ts, btn){
  const e = spinHistory.find(x => x.ts === ts && x.type === 'surv');
  if(!e) return;
  flashButton(btn, await copyText(e.perks.map(perkName).join(' · ')));
}
