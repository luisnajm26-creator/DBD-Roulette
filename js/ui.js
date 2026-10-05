// ══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════════════════════════
function kName(k){ return (k.name[lang]||k.name.en); }
function kAlias(k){ return (k.alias[lang]||k.alias.en); }
function sName(s){ return (s.name[lang]||s.name.en); }
function sPerks(s){ return (s.perks[lang]||s.perks.en); }

function switchTab(tab){
  if(spinning) return;
  document.querySelectorAll('.tab').forEach(b=>b.classList.remove('active'));
  document.querySelectorAll('.panel').forEach(p=>p.classList.remove('active'));
  document.getElementById('tab-'+(tab==='survivor'?'surv':'killer')).classList.add('active');
  document.getElementById('panel-'+tab).classList.add('active');
}

function setSpinning(val){
  spinning=val;
  ['tab-surv','tab-killer','spin-surv-btn','spin-killer-btn'].forEach(id=>{
    const el=document.getElementById(id); if(el) el.disabled=val;
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// RENDER
// ══════════════════════════════════════════════════════════════════════════════
function renderSurvivors(){
  const grid=document.getElementById('surv-grid');
  grid.innerHTML=SURVIVORS.map((s,i)=>{
    const selected=selectedSurvivors.has(i);
    let cls='kcard'; 
    if(selected) cls+=' selected';
    const cleanName = s.name.en.toLowerCase().replace(/[^a-z0-9]/g, '');
    const imgSrc = s.img || `img/survivors/${cleanName}.webp`;

    return `<div class="${cls}" id="scard-${i}" onclick="toggleSurv(${i})">
      ${imgTag(imgSrc, 'kcard-img', sName(s))}
      <div class="kcard-label">${sName(s)}</div>
    </div>`;
  }).join('');
  
  document.getElementById('surv-count').innerHTML=
    selectedSurvivors.size+' <span data-i="selected">'+t('selected')+'</span>';
}

function imgTag(src, cls, alt){
  if(src) return `<img class="${cls}" src="${src}" alt="${alt}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">
    <div class="kcard-img-placeholder" style="display:none">☠</div>`;
  return `<div class="kcard-img-placeholder">☠</div>`;
}

function renderKillers(){
  const grid=document.getElementById('killer-grid');
  grid.innerHTML=KILLERS.map((k,i)=>{
    const blocked=blockedKillers.has(i);
    const selected=selectedKillers.has(i);
    let cls='kcard';
    if(blocked) cls+=' blocked';
    else if(selected) cls+=' selected';
    const click=blocked?'':` onclick="toggleKiller(${i})"`;
    const overlay=blocked?'<div class="kcard-win-overlay"></div>':'';
    
    let modBadge = '';
    if(blocked && blockedMods[i]) {
      modBadge = `<div style="position:absolute; top:4px; right:4px; background:rgba(0,0,0,0.9); color:var(--orange); font-size:9.5px; font-weight:bold; font-family:'Oswald',sans-serif; padding:3px 6px; border:1px solid var(--orange); border-radius:3px; z-index:10; letter-spacing:1px; box-shadow: 0 0 8px rgba(0,0,0,0.8);">${blockedMods[i]}</div>`;
    }

    return `<div class="${cls}" id="kcard-${i}"${click}>
      ${imgTag(k.img,'kcard-img',kName(k))}
      ${overlay}
      ${modBadge}
      <div class="kcard-label">${kName(k)}</div>
    </div>`;
  }).join('');
  const active=[...selectedKillers].filter(i=>!blockedKillers.has(i)).length;
  document.getElementById('killer-count').innerHTML=
    active+' <span data-i="available">'+t('available')+'</span>';
} 

// ══════════════════════════════════════════════════════════════════════════════
// TOGGLE
// ══════════════════════════════════════════════════════════════════════════════
function toggleSurv(i){
  if(spinning) return;
  selectedSurvivors.has(i) ? selectedSurvivors.delete(i) : selectedSurvivors.add(i);
  save(); renderSurvivors();
}
function toggleKiller(i){
  if(spinning) return;
  selectedKillers.has(i) ? selectedKillers.delete(i) : selectedKillers.add(i);
  save(); renderKillers();
}
function selectAllSurv(){ 
  if(spinning) return; 
  if(selectedSurvivors.size === SURVIVORS.length) {
    selectedSurvivors.clear();
  } else {
    SURVIVORS.forEach((_,i) => selectedSurvivors.add(i)); 
  }
  save(); renderSurvivors(); 
}
function clearSurv(){ 
  if(spinning) return; 
  selectedSurvivors.clear(); 
  save(); renderSurvivors(); 
}
function selectAllKillers(){ 
  if(spinning) return; 
  const activeSelected = [...selectedKillers].filter(i => !blockedKillers.has(i)).length;
  const totalAvailable = KILLERS.length - blockedKillers.size;
  
  if(activeSelected === totalAvailable && totalAvailable > 0) {
    selectedKillers.clear();
  } else {
    KILLERS.forEach((_,i) => { if(!blockedKillers.has(i)) selectedKillers.add(i); }); 
  }
  save(); renderKillers(); 
}

function clearKillers(){ 
  if(spinning) return; 
  selectedKillers.clear(); 
  save(); renderKillers(); 
}

// ══════════════════════════════════════════════════════════════════════════════
// INTERRUPTORES DE CONFIGURACIÓN
// ══════════════════════════════════════════════════════════════════════════════
function toggleGeneralPerks(){
  useGeneralPerks = !useGeneralPerks;
  save(); updateToggleButtons();
}
function toggleKillerMods(){
  useKillerMods = !useKillerMods;
  save(); updateToggleButtons();
}
function updateToggleButtons(){
  const bg = document.getElementById('btn-toggle-gen');
  if(bg) {
     bg.textContent = useGeneralPerks ? t('gen_on') : t('gen_off');
     bg.style.borderColor = useGeneralPerks ? "var(--purple)" : "var(--muted)";
     bg.style.color = useGeneralPerks ? "var(--purple)" : "var(--muted)";
  }
  const bm = document.getElementById('btn-toggle-mod');
  if(bm) {
     bm.textContent = useKillerMods ? t('mod_on') : t('mod_off');
     bm.style.borderColor = useKillerMods ? "var(--orange)" : "var(--muted)";
     bm.style.color = useKillerMods ? "var(--orange)" : "var(--muted)";
  }
}
