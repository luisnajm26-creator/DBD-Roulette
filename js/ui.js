// ══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════════════════════════
function kName(k){ return (k.name[lang]||k.name.en); }
function kAlias(k){ return (k.alias[lang]||k.alias.en); }
function sName(s){ return (s.name[lang]||s.name.en); }
function sPerks(s){ return (s.perks[lang]||s.perks.en); }

function escAttr(s){ return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;'); }

function switchTab(tab){
  if(spinning) return;
  document.querySelectorAll('.tab').forEach(b=>{ b.classList.remove('active'); b.setAttribute('aria-selected','false'); });
  document.querySelectorAll('.panel').forEach(p=>p.classList.remove('active'));
  const btn=document.getElementById('tab-'+(tab==='survivor'?'surv':'killer'));
  btn.classList.add('active'); btn.setAttribute('aria-selected','true');
  document.getElementById('panel-'+tab).classList.add('active');
  scheduleFit();
}

function setSpinning(val){
  spinning=val;
  ['tab-surv','tab-killer','spin-surv-btn','spin-killer-btn'].forEach(id=>{
    const el=document.getElementById(id); if(el) el.disabled=val;
  });
}

// En pantallas angostas el resultado queda debajo de la cuadrícula: al girar se lleva a la vista.
function revealResult(id){
  if(!window.matchMedia || !matchMedia('(max-width: 949px)').matches) return;
  const el=document.getElementById(id);
  if(el) el.scrollIntoView({behavior: speedFast ? 'auto' : 'smooth', block:'start'});
}

// ══════════════════════════════════════════════════════════════════════════════
// BÚSQUEDA (oculta tarjetas sin cambiar sus ids)
// ══════════════════════════════════════════════════════════════════════════════
function norm(s){ return String(s).normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().trim(); }

const FILTERS = {
  surv: { input:'surv-search', none:'surv-noresults', prefix:'scard-',
          list:()=>SURVIVORS, hay:s=>[s.name.es,s.name.en,...s.perks.es,...s.perks.en].join('|') },
  kill: { input:'kill-search', none:'kill-noresults', prefix:'kcard-',
          list:()=>KILLERS,   hay:k=>[k.name.es,k.name.en,k.alias.es,k.alias.en].join('|') }
};
const _hayCache = {};

function matchesFilter(which, i){
  const f=FILTERS[which];
  const q=norm(document.getElementById(f.input).value);
  if(!q) return true;
  const cache=_hayCache[which]||(_hayCache[which]=f.list().map(x=>norm(f.hay(x))));
  return cache[i].includes(q);
}

function applyFilter(which){
  const f=FILTERS[which];
  let visible=0;
  f.list().forEach((_,i)=>{
    const card=document.getElementById(f.prefix+i);
    if(!card) return;
    const ok=matchesFilter(which,i);
    card.classList.toggle('hide',!ok);
    if(ok) visible++;
  });
  document.getElementById(f.none).hidden = visible>0;
  scheduleFit();
}

function visibleIdx(which){
  return FILTERS[which].list().map((_,i)=>i).filter(i=>matchesFilter(which,i));
}

// ══════════════════════════════════════════════════════════════════════════════
// AJUSTE AL ALTO DE LA VENTANA
// Elige cuántas columnas usar para que TODA la cuadrícula quepa sin hacer scroll,
// con las fotos lo más grandes posible (entre minW y maxW px de ancho). Si ni
// con el tamaño mínimo cabe (p. ej. en un teléfono), usa el mínimo y hace scroll.
// ══════════════════════════════════════════════════════════════════════════════
const FIT = { gap:6, ratio:4/3, minW:50, maxW:120, bottomPad:12 };

function fitGrid(){
  const panel=document.querySelector('.panel.active'); if(!panel) return;
  const g=panel.querySelector('.char-grid, .killer-card-grid'); if(!g) return;
  const n=[...g.children].filter(c=>c.classList.contains('kcard') && !c.classList.contains('hide')).length;
  const W=g.clientWidth;
  if(!n || !W) return;

  const label=g.querySelector('.kcard-label');
  const extra=(label ? label.offsetHeight : 22) + 2;             // etiqueta + bordes de la tarjeta
  const bar=panel.querySelector('.spin-bar');
  const barH=(bar && getComputedStyle(bar).position==='sticky') ? bar.offsetHeight : 0;
  const top=g.getBoundingClientRect().top + window.scrollY;
  const H=window.innerHeight - top - barH - FIT.bottomPad;

  let cols=null, smallest=null;
  for(let c=1; c<=n; c++){
    const w=(W-(c-1)*FIT.gap)/c;
    if(w>FIT.maxW) continue;
    if(w<FIT.minW) break;
    smallest=c;
    const rows=Math.ceil(n/c);
    if(rows*(w*FIT.ratio+extra)+(rows-1)*FIT.gap <= H){ cols=c; break; }
  }
  if(cols===null) cols=smallest || Math.max(1, Math.floor((W+FIT.gap)/(FIT.minW+FIT.gap)));
  g.style.setProperty('--cols', cols);
}

let _fitQueued=false;
function scheduleFit(){
  if(_fitQueued) return;
  _fitQueued=true;
  requestAnimationFrame(()=>{ _fitQueued=false; fitGrid(); });
}

// ══════════════════════════════════════════════════════════════════════════════
// RENDER
// ══════════════════════════════════════════════════════════════════════════════
function updateSurvCount(){
  document.getElementById('surv-count').innerHTML=
    selectedSurvivors.size+' <span data-i="selected">'+t('selected')+'</span>';
}
function updateKillerCount(){
  const active=[...selectedKillers].filter(i=>!blockedKillers.has(i)).length;
  document.getElementById('killer-count').innerHTML=
    active+' <span data-i="available">'+t('available')+'</span>';
}

function renderSurvivors(){
  const grid=document.getElementById('surv-grid');
  grid.innerHTML=SURVIVORS.map((s,i)=>{
    const selected=selectedSurvivors.has(i);
    const cleanName = s.name.en.toLowerCase().replace(/[^a-z0-9]/g, '');
    const imgSrc = s.img || `img/survivors/${cleanName}.webp`;
    const name = sName(s);

    return `<div class="kcard${selected?' selected':''}" id="scard-${i}" role="button" tabindex="0" aria-pressed="${selected}" title="${escAttr(name)}" onclick="toggleSurv(${i})">
      ${imgTag(imgSrc, 'kcard-img', escAttr(name))}
      <div class="kcard-label"><span>${name}</span></div>
    </div>`;
  }).join('');
  updateSurvCount();
  applyFilter('surv');
}

// img/killers/x.png -> img/thumbs/killers/x.webp (las miniaturas las genera tools/make_thumbs.py)
function thumbOf(src){
  return src.replace(/^img\/(killers|survivors)\/(.+?)\.\w+$/, 'img/thumbs/$1/$2.webp');
}

// Miniatura de cuadrícula: carga diferida; si la miniatura falta, cae a la imagen original.
function imgTag(src, cls, alt){
  if(!src) return `<div class="kcard-img-placeholder">☠</div>`;
  const thumb = thumbOf(src);
  return `<img class="${cls}" src="${thumb}" alt="${alt}" width="256" height="256" loading="lazy" decoding="async"
      onerror="if(this.src.indexOf('/thumbs/')>-1){this.onerror=null;this.src='${src}';}else{this.style.display='none';this.nextElementSibling.style.display='flex';}">
    <div class="kcard-img-placeholder" style="display:none">☠</div>`;
}

function renderKillers(){
  const grid=document.getElementById('killer-grid');
  grid.innerHTML=KILLERS.map((k,i)=>{
    const blocked=blockedKillers.has(i);
    const selected=selectedKillers.has(i);
    let cls='kcard';
    if(blocked) cls+=' blocked';
    else if(selected) cls+=' selected';
    const name = kName(k);
    const attrs = blocked
      ? ` aria-disabled="true"`
      : ` role="button" tabindex="0" aria-pressed="${selected}" onclick="toggleKiller(${i})"`;
    const overlay=blocked?'<div class="kcard-win-overlay"></div>':'';
    const modBadge = (blocked && blockedMods[i]) ? `<div class="kcard-mod">${blockedMods[i]}</div>` : '';

    return `<div class="${cls}" id="kcard-${i}" title="${escAttr(name)}"${attrs}>
      ${imgTag(k.img,'kcard-img',escAttr(name))}
      ${overlay}
      ${modBadge}
      <div class="kcard-label"><span>${name}</span></div>
    </div>`;
  }).join('');
  updateKillerCount();
  applyFilter('kill');
}

// ══════════════════════════════════════════════════════════════════════════════
// TOGGLE (actualiza solo la tarjeta tocada para no perder el foco del teclado)
// ══════════════════════════════════════════════════════════════════════════════
function toggleSurv(i){
  if(spinning) return;
  const on=!selectedSurvivors.has(i);
  on ? selectedSurvivors.add(i) : selectedSurvivors.delete(i);
  save();
  const c=document.getElementById('scard-'+i);
  if(c){ c.classList.toggle('selected',on); c.setAttribute('aria-pressed',on); }
  updateSurvCount();
}
function toggleKiller(i){
  if(spinning) return;
  const on=!selectedKillers.has(i);
  on ? selectedKillers.add(i) : selectedKillers.delete(i);
  save();
  const c=document.getElementById('kcard-'+i);
  if(c){ c.classList.toggle('selected',on); c.setAttribute('aria-pressed',on); }
  updateKillerCount();
}
// "Seleccionar todos" actúa sobre lo que muestra el buscador (sin búsqueda = todos)
function selectAllSurv(){
  if(spinning) return;
  const vis=visibleIdx('surv');
  const allOn=vis.length>0 && vis.every(i=>selectedSurvivors.has(i));
  vis.forEach(i=> allOn ? selectedSurvivors.delete(i) : selectedSurvivors.add(i));
  save(); renderSurvivors();
}
function clearSurv(){
  if(spinning) return;
  selectedSurvivors.clear();
  save(); renderSurvivors();
}
function selectAllKillers(){
  if(spinning) return;
  const vis=visibleIdx('kill').filter(i=>!blockedKillers.has(i));
  const allOn=vis.length>0 && vis.every(i=>selectedKillers.has(i));
  vis.forEach(i=> allOn ? selectedKillers.delete(i) : selectedKillers.add(i));
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
function toggleSound(){
  soundOn = !soundOn;
  save(); updateSettingButtons();
  if(soundOn) playTone(660,'triangle',.12,.12);
}
function toggleSpeed(){
  speedFast = !speedFast;
  save(); updateSettingButtons();
}
function updateToggleButtons(){
  const bg = document.getElementById('btn-toggle-gen');
  if(bg) {
     bg.textContent = useGeneralPerks ? t('gen_on') : t('gen_off');
     bg.style.borderColor = useGeneralPerks ? "var(--purple)" : "var(--muted)";
     bg.style.color = useGeneralPerks ? "var(--purple)" : "var(--muted)";
     bg.setAttribute('aria-pressed', useGeneralPerks);
  }
  const bm = document.getElementById('btn-toggle-mod');
  if(bm) {
     bm.textContent = useKillerMods ? t('mod_on') : t('mod_off');
     bm.style.borderColor = useKillerMods ? "var(--orange)" : "var(--muted)";
     bm.style.color = useKillerMods ? "var(--orange)" : "var(--muted)";
     bm.setAttribute('aria-pressed', useKillerMods);
  }
}
function updateSettingButtons(){
  const bs=document.getElementById('btn-sound');
  if(bs){
    bs.classList.toggle('on', soundOn);
    bs.setAttribute('aria-pressed', soundOn);
    bs.title=t(soundOn?'sound_on_title':'sound_off_title');
    document.getElementById('sound-ic').textContent = soundOn ? '🔊' : '🔇';
    document.getElementById('sound-lbl').textContent = t(soundOn?'sound_on':'sound_off');
  }
  const bv=document.getElementById('btn-speed');
  if(bv){
    bv.classList.toggle('on', speedFast);
    bv.setAttribute('aria-pressed', speedFast);
    bv.title=t(speedFast?'speed_fast_title':'speed_normal_title');
    document.getElementById('speed-lbl').textContent = t(speedFast?'speed_fast':'speed_normal');
  }
}
