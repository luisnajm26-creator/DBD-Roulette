// ══════════════════════════════════════════════════════════════════════════════
// KILLER SPIN 
// ══════════════════════════════════════════════════════════════════════════════
function finishKillerSpin(finalIdx, available, box){
  available.forEach(i=>{ const c=document.getElementById('kcard-'+i); if(c) c.classList.remove('highlight'); });
  const wc=document.getElementById('kcard-'+finalIdx); if(wc) wc.classList.add('winner');
  const k=KILLERS[finalIdx];
  
  const modBadgeHtml = useKillerMods ? `<span class="badge orange" id="killer-mod-badge">...</span>` : ``;

  box.innerHTML=`
    <div class="killer-spin-wrap">
      ${k.img ? `<div class="killer-spin-img-box"><img src="${k.img}" alt="${kName(k)}"></div>` : `<div class="killer-spin-img-placeholder">☠</div>`}
      <div class="killer-spin-text">
        <div class="killer-spin-name" style="color:var(--cream)">${kName(k)}</div>
        <div class="killer-spin-alias">${kAlias(k)}</div>
      </div>
    </div>
    <div style="margin-top:12px; display:flex; gap:6px; justify-content:center;">
      <span class="badge red" data-i="your_killer">${t('your_killer')}</span>
      ${modBadgeHtml}
    </div>`;
  soundKillerReveal();
  
  if (useKillerMods) {
    setTimeout(()=>showOverlay(finalIdx), 400);
  }
  
  document.getElementById('killer-actions').style.display='flex';
  const sb=document.getElementById('skip-killer-btn'); if(sb) sb.style.display='none';
  setSpinning(false);
}

function skipKiller(){
  if(!spinning||!_killInterval) return;
  clearInterval(_killInterval); _killInterval=null;
  const box=document.getElementById('killer-result');
  const tw=document.getElementById('killer-timer'); if(tw) tw.closest('.timer-bar-wrap').remove();
  const available=[...selectedKillers].filter(i=>!blockedKillers.has(i));
  finishKillerSpin(_killFinalIdx, available, box);
}

function spinKiller(){
  if(spinning) return;
  const available=[...selectedKillers].filter(i=>!blockedKillers.has(i));
  if(!available.length){
    document.getElementById('killer-result').innerHTML=`<p class="empty-msg">${t('kill_empty')}</p>`;
    document.getElementById('killer-actions').style.display='none';
    return;
  }
  const finalIdx=available[Math.floor(Math.random()*available.length)];
  lastKillerResult=finalIdx; _killFinalIdx=finalIdx;

  if (useKillerMods) {
    const modalidades = [
      { idx: 0, weight: 45 }, { idx: 1, weight: 25 },
      { idx: 2, weight: 15 }, { idx: 3, weight: 10 }, { idx: 4, weight: 5 }
    ];
    let rnd = Math.random() * 100;
    let chosenIdx = 0;
    for(let m of modalidades) { if(rnd < m.weight) { chosenIdx = m.idx; break; } rnd -= m.weight; }
    _killFinalModIdx = chosenIdx; 
    _killFinalMod = MODS_KEYS[chosenIdx];
    
    statsKillMods[chosenIdx] = (statsKillMods[chosenIdx] || 0) + 1;
  } else {
    _killFinalModIdx = 0; 
    _killFinalMod = "mod_4p"; 
  }
  save();

  setSpinning(true);
  document.getElementById('killer-actions').style.display='none';
  const sb=document.getElementById('skip-killer-btn'); if(sb) sb.style.display='block';

  const box=document.getElementById('killer-result');
  box.innerHTML=`
    <div class="killer-spin-wrap">
      <div class="killer-spin-img-placeholder" id="kspin-img">☠</div>
      <div class="killer-spin-text">
        <div class="killer-spin-name" id="kspin-name">...</div>
        <div class="killer-spin-alias" id="kspin-alias">${t('spinning')}</div>
      </div>
    </div>
    <div class="timer-bar-wrap"><div class="timer-bar" id="killer-timer" style="width:100%"></div></div>`;

  const TOTAL=10000, TICK=80, start=Date.now();
  let lastSwap=0;

  function updateSpinImg(idx){
    const k=KILLERS[idx];
    const el2=document.getElementById('kspin-img');
    if(!el2||!k.img) return;
    el2.outerHTML=`<div class="killer-spin-img-box" id="kspin-img"><img src="${k.img}" alt="${kName(k)}" onerror="this.parentElement.innerHTML='☠';this.parentElement.className='killer-spin-img-placeholder';"></div>`;
  }

  available.forEach(i=>{ const c=document.getElementById('kcard-'+i); if(c) c.classList.add('highlight'); });

  _killInterval=setInterval(()=>{
    const el=Date.now()-start;
    const prog=Math.min(el/TOTAL,1);
    const bar=document.getElementById('killer-timer');
    if(bar) bar.style.width=(100-prog*100)+'%';

    const swapEvery=80+Math.pow(prog,2.2)*520;
    if(el-lastSwap>swapEvery){
      lastSwap=el;
      const rand=available[Math.floor(Math.random()*available.length)];
      const k=KILLERS[rand];
      const ne=document.getElementById('kspin-name'); if(ne) ne.textContent=kName(k);
      const ae=document.getElementById('kspin-alias'); if(ae) ae.textContent=kAlias(k);
      available.forEach(i=>{ const c=document.getElementById('kcard-'+i); if(c) c.classList.toggle('highlight',i===rand); });
      updateSpinImg(rand);
      soundRollTick();
    }

    if(el>=TOTAL){
      clearInterval(_killInterval); _killInterval=null;
      const tw=document.getElementById('killer-timer'); if(tw) tw.closest('.timer-bar-wrap').remove();
      finishKillerSpin(finalIdx, available, box);
    }
  },TICK);
}

// ══════════════════════════════════════════════════════════════════════════════
// FULLSCREEN OVERLAY Y RULETA DE MODALIDAD
// ══════════════════════════════════════════════════════════════════════════════
function showOverlay(idx){
  const k=KILLERS[idx];
  const imgWrap=document.getElementById('overlay-img-wrap');
  if(k.img){
    imgWrap.innerHTML=`<img class="killer-overlay-img" src="${k.img}" alt="${kName(k)}" onerror="this.style.display='none'">`;
  } else {
    imgWrap.innerHTML=`<div class="killer-overlay-placeholder">☠</div>`;
  }
  document.getElementById('overlay-name').textContent=kName(k);
  document.getElementById('overlay-alias').textContent=kAlias(k);

  for(let i=0; i<5; i++){
    const b = document.getElementById('mod-box-'+i);
    if(b){
       b.className = 'mod-box'; 
       b.textContent = t(MODS_KEYS[i]);
    }
  }

  document.getElementById('overlay-hint').style.display = 'none'; 
  
  const skipBtn = document.getElementById('skip-overlay-btn');
  if(skipBtn) skipBtn.style.display = 'block'; 

  document.getElementById('killer-overlay').classList.add('show');
  
  _overlaySpinning = true;
  const TOTAL_MOD = 9000; 
  const TICK_MOD = 120;
  const startMod = Date.now();
  let lastModTick = 0;

  _overlayInt = setInterval(()=>{
    const el = Date.now() - startMod;
    if(el - lastModTick > TICK_MOD) {
       lastModTick = el;
       for(let i=0; i<5; i++) document.getElementById('mod-box-'+i).classList.remove('rolling');
       const r = Math.floor(Math.random()*5);
       document.getElementById('mod-box-'+r).classList.add('rolling');
       soundRollTick();
    }

    if(el >= TOTAL_MOD) {
       finishOverlaySpin();
    }
  }, TICK_MOD);
}

function finishOverlaySpin() {
  if(_overlayInt) {
     clearInterval(_overlayInt);
     _overlayInt = null;
  }
  _overlaySpinning = false;
  
  for(let i=0; i<5; i++) document.getElementById('mod-box-'+i).classList.remove('rolling');
  
  document.getElementById('mod-box-'+_killFinalModIdx).classList.add('winner');
  document.getElementById('overlay-hint').textContent=t('overlay_hint');
  document.getElementById('overlay-hint').style.display = 'block';
  
  const skipBtn = document.getElementById('skip-overlay-btn');
  if(skipBtn) skipBtn.style.display = 'none';
  
  const badge = document.getElementById('killer-mod-badge');
  if(badge) badge.textContent = t(MODS_KEYS[_killFinalModIdx]);
  
  soundFinalFanfare();
}

function skipOverlay(event){
  if(event) event.stopPropagation(); 
  if(!_overlaySpinning) return;
  finishOverlaySpin();
}

function closeOverlay(){
  if(_overlaySpinning) return; 
  document.getElementById('killer-overlay').classList.remove('show');
}

// ══════════════════════════════════════════════════════════════════════════════
// WIN / LOSS
// ══════════════════════════════════════════════════════════════════════════════
function markWin(){
  if(lastKillerResult===null) return;
  blockedKillers.add(lastKillerResult); 
  
  if (useKillerMods) {
    let shortMod = "4 PERKS";
    if(_killFinalModIdx === 1) shortMod = "3 PERKS";
    if(_killFinalModIdx === 2) shortMod = "2 PERKS";
    if(_killFinalModIdx === 3) shortMod = "1 PERK";
    if(_killFinalModIdx === 4) shortMod = "0 PERKS";
    blockedMods[lastKillerResult] = shortMod;
  }
  
  save(); renderKillers();
  
  const k=KILLERS[lastKillerResult];
  _lastWinLossKiller = lastKillerResult; 
  document.getElementById('killer-result').innerHTML=`
    <div style="font-family:'Oswald',sans-serif;text-align:center">
      <div id="win-loss-kname" style="font-size:26px;letter-spacing:3px;text-transform:uppercase;color:var(--green2)">${kName(k)}</div>
      <div style="font-size:11px;color:var(--muted);letter-spacing:2px;margin-top:4px" data-i="blocked_until">${t('blocked_until')}</div>
    </div>
    <span class="badge green" style="margin-top:10px">&#10003; <span data-i="victory">${t('victory')}</span></span>`;
  document.getElementById('killer-actions').style.display='none';
  lastKillerResult=null;
}
function markLoss(){
  if(lastKillerResult===null) return;
  const k=KILLERS[lastKillerResult];
  _lastWinLossKiller = lastKillerResult; 
  const wc=document.getElementById('kcard-'+lastKillerResult);
  if(wc) wc.classList.remove('winner');
  document.getElementById('killer-result').innerHTML=`
    <div style="font-family:'Oswald',sans-serif;text-align:center">
      <div id="win-loss-kname" style="font-size:26px;letter-spacing:3px;text-transform:uppercase;color:var(--muted)">${kName(k)}</div>
      <div style="font-size:11px;color:var(--muted);letter-spacing:2px;margin-top:4px" data-i="still_free">${t('still_free')}</div>
    </div>
    <span class="badge red" style="margin-top:10px">&#10005; <span data-i="defeat">${t('defeat')}</span></span>`;
  document.getElementById('killer-actions').style.display='none';
  lastKillerResult=null;
  _killFinalModIdx=null; _killFinalMod=null;
}

// ══════════════════════════════════════════════════════════════════════════════
// RESET ACECHES
// ══════════════════════════════════════════════════════════════════════════════
function resetAceches(){
  if(spinning) return;
  if(!confirm(t('confirm_reset'))) return;
  
  blockedKillers.clear(); 
  blockedMods = {}; 
  lastKillerResult=null; _lastWinLossKiller=null; 
  _killFinalModIdx=null; _killFinalMod=null; 
  save(); renderKillers();
  
  document.getElementById('killer-result').innerHTML=`<p class="empty-msg" data-i="week_reset">${t('week_reset')}</p>`;
  document.getElementById('killer-actions').style.display='none';
  KILLERS.forEach((_,i)=>{ const c=document.getElementById('kcard-'+i); if(c) c.classList.remove('winner','highlight'); });
}
