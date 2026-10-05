// ══════════════════════════════════════════════════════════════════════════════
// SURVIVOR SPIN 
// ══════════════════════════════════════════════════════════════════════════════

const ESCAPE_PERKS = new Set([
  "Sprint Burst", "Lithe", "Balanced Landing", "Dead Hard", "Overcome", 
  "Smash Hit", "Background Player", "Dramaturgy", "Adrenaline", "Hope", 
  "Finesse", "Lucky Break", "Quick & Quiet", "Dance With Me", "Lightweight",
  "Lightfooted", "Cut Loose", "Deception"
]);

function buildPerkPool(pool){
  const all=[], seen=new Set();

  function addPerk(perkEs, perkEn, charEs, charEn){
    if(seen.has(perkEn)) return;
    seen.add(perkEn);
    const clean = perkEn.toLowerCase().replace(/[^a-z0-9]/g,'');
    const baseWeight = ESCAPE_PERKS.has(perkEn) ? 2 : 1;
    const timesSeen = statsSurvPerks[perkEs] || 0;
    const allCounts = Object.values(statsSurvPerks);
    const maxSeen = allCounts.length > 0 ? Math.max(...allCounts) : 0;
    const rarityFactor = maxSeen > 0 ? (1 + 2 * (1 - timesSeen / maxSeen)) : 3.0;
    const finalWeight = baseWeight * rarityFactor;
    all.push({
      perk: { es: perkEs, en: perkEn },
      char: { es: charEs, en: charEn },
      img: `img/perks/${clean}.webp`,
      weight: finalWeight
    });
  }

  pool.forEach(idx=>{
    const s = SURVIVORS[idx];
    s.perks.en.forEach((pEn, pi) => {
      addPerk(s.perks.es[pi], pEn, s.name.es || s.name.en, s.name.en);
    });
  });

  if(useGeneralPerks){
    GENERAL_PERKS.forEach(gp => {
      addPerk(gp.es, gp.en, I18N.es.general_perks, I18N.en.general_perks);
    });
  }

  return all;
}

function finishSurvivorSpin(finalPerks, box){
  [0,1,2,3].forEach(i=>{
    const slot=document.getElementById('slot-'+i);
    if(!slot) return;
    slot.classList.remove('rolling'); slot.classList.add('done');
    slot.innerHTML=`
      <div class="perk-icon-box">
        <img src="${finalPerks[i].img}" onerror="this.style.display='none';this.parentElement.innerHTML='✨'">
      </div>
      <div class="perk-info">
        <div class="pname" data-perk-idx="${i}">${finalPerks[i].perk[lang]}</div>
        <div class="pchar" data-char-idx="${i}">${finalPerks[i].char[lang]}</div>
      </div>`;
  });
  const tw=document.getElementById('perk-timer');
  if(tw) tw.closest('.timer-bar-wrap').remove();
  box.insertAdjacentHTML('beforeend',`<span class="badge orange" data-i="perks_ready">${t('perks_ready')}</span>`);
  soundFinalFanfare();
  const sb=document.getElementById('skip-surv-btn'); if(sb) sb.style.display='none';
  setSpinning(false);
}

function skipSurvivor(){
  if(!spinning || !_survInterval) return;
  clearInterval(_survInterval); _survInterval=null;
  finishSurvivorSpin(_survFinalPerks, document.getElementById('surv-result'));
}

function spinSurvivor(){
  if(spinning) return;
  const pool=[...selectedSurvivors];
  const allPerks=buildPerkPool(pool);
  if(!allPerks.length){
    document.getElementById('surv-result').innerHTML=`<p class="empty-msg">${t('surv_empty')}</p>`;
    return;
  }

  let numPerks = 4;
  const rnd = Math.random() * 100;
  if(rnd <= 5) {
    numPerks = 2; 
  } else if(rnd <= 20) {
    numPerks = 3; 
  }

  let availablePool = allPerks;
  if(lastSpinPerks.size > 0){
    const filtered = allPerks.filter(p => !lastSpinPerks.has(p.perk.en));
    if(filtered.length >= numPerks) {
      availablePool = filtered; 
    }
  }

  function weightedPick(pool){
    let totalWeight = pool.reduce((sum, p) => sum + p.weight, 0);
    let r = Math.random() * totalWeight;
    let running = 0;
    for(let j = 0; j < pool.length; j++){
      running += pool[j].weight;
      if(r <= running) return j;
    }
    return pool.length - 1; 
  }

  const finalPerks = [];
  let tempPool = [...availablePool];

  for(let i = 0; i < numPerks; i++){
    if(tempPool.length === 0) break;
    const idx = weightedPick(tempPool);
    finalPerks.push(tempPool[idx]);
    tempPool.splice(idx, 1); 
  }

  while(finalPerks.length < 4){
    finalPerks.push({
      perk: {es: I18N.es.empty_slot, en: I18N.en.empty_slot},
      char: {es: "—", en: "—"},
      img: "",
      weight: 0
    });
  }

  _survFinalPerks = finalPerks.sort(() => Math.random() - 0.5);
  lastSpinPerks = new Set(finalPerks.map(p => p.perk.en).filter(en => en !== I18N.en.empty_slot));

  finalPerks.forEach(p => {
    if(p.perk.en !== I18N.en.empty_slot){
      statsSurvPerks[p.perk.es] = (statsSurvPerks[p.perk.es] || 0) + 1;
    }
  });
  save();

  setSpinning(true);
  const sb=document.getElementById('skip-surv-btn'); if(sb) sb.style.display='block';

  const box=document.getElementById('surv-result');
  box.innerHTML=`
    <div class="perks-rolling" id="perks-rolling">
      ${[0,1,2,3].map(i=>`
        <div class="perk-slot rolling" id="slot-${i}">
          <div class="perk-icon-box" id="slot-icon-${i}">❓</div>
          <div class="perk-info"><div class="ptxt" id="slot-txt-${i}">...</div></div>
        </div>`).join('')}
    </div>
    <div class="timer-bar-wrap"><div class="timer-bar" id="perk-timer" style="width:100%"></div></div>`;

  const k=speedScale();
  const TOTAL=16000*k, PER=4000*k, TICK=110, start=Date.now();
  revealResult('surv-result');
  const locked=new Set();

  _survInterval=setInterval(()=>{
    const el=Date.now()-start;
    const prog=Math.min(el/TOTAL,1);
    const bar=document.getElementById('perk-timer');
    if(bar) bar.style.width=(100-prog*100)+'%';

    let anyRolling=false;
    [0,1,2,3].forEach(i=>{
      if(locked.has(i)) return;
      anyRolling=true;
      const rand=allPerks[Math.floor(Math.random()*allPerks.length)];
      const txtEl=document.getElementById('slot-txt-'+i);
      const iconEl=document.getElementById('slot-icon-'+i);
      if(txtEl) txtEl.textContent=rand?rand.perk[lang]:'...';
      if(iconEl&&rand) iconEl.innerHTML=`<img src="${rand.img}" onerror="this.style.display='none';this.parentElement.innerHTML='❓'">`;
    });
    if(anyRolling) soundRollTick();

    [0,1,2,3].forEach(i=>{
      if(locked.has(i)) return;
      if(el>=PER*(i+1)){
        locked.add(i);
        const slot=document.getElementById('slot-'+i);
        if(slot){
          slot.classList.remove('rolling'); slot.classList.add('done');
          slot.innerHTML=`
            <div class="perk-icon-box">
              <img src="${finalPerks[i].img}" onerror="this.style.display='none';this.parentElement.innerHTML='✨'">
            </div>
            <div class="perk-info">
              <div class="pname" data-perk-idx="${i}">${finalPerks[i].perk[lang]}</div>
              <div class="pchar" data-char-idx="${i}">${finalPerks[i].char[lang]}</div>
            </div>`;
        }
        soundPerkLock();
      }
    });

    if(el>=TOTAL){
      clearInterval(_survInterval); _survInterval=null;
      finishSurvivorSpin(finalPerks, box);
    }
  },TICK);
}
