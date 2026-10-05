let lang = 'es';
function t(key){ return (I18N[lang]||I18N.es)[key] || key; }

function setLang(l){
  if(!I18N[l]) return; 
  lang = l;
  document.querySelectorAll('.lang-btn').forEach(b => b.classList.toggle('active', b.textContent.trim()===l.toUpperCase()));
  
  const titleEl = document.getElementById('header-title');
  if(titleEl) titleEl.textContent = t('title');
  document.getElementById('header-sub').textContent = t('header_sub');
  
  document.querySelectorAll('[data-i]').forEach(el => { el.textContent = t(el.dataset.i); });
  document.querySelectorAll('[data-i-title]').forEach(el => { el.title = t(el.dataset.iTitle); });
  document.querySelectorAll('[data-i-ph]').forEach(el => { el.placeholder = t(el.dataset.iPh); });
  document.querySelectorAll('[data-i-label]').forEach(el => { el.setAttribute('aria-label', t(el.dataset.iLabel)); });
  document.documentElement.lang = l;

  renderSurvivors();
  renderKillers();
  if(typeof renderHistory === 'function') renderHistory();

  if (typeof _survFinalPerks !== 'undefined' && _survFinalPerks.length === 4) {
     _survFinalPerks.forEach((p, i) => {
        const nameEl = document.querySelector(`.pname[data-perk-idx="${i}"]`);
        if(nameEl && p.perk) nameEl.textContent = p.perk[lang];
        const charEl = document.querySelector(`.pchar[data-char-idx="${i}"]`);
        if(charEl && p.char) charEl.textContent = p.char[lang];
     });
  }
  
  if (typeof _killFinalIdx !== 'undefined' && _killFinalIdx !== null) {
     const k = KILLERS[_killFinalIdx];
     const kn = document.querySelector('.killer-spin-name');
     if(kn) kn.textContent = kName(k);
     const ka = document.querySelector('.killer-spin-alias');
     if(ka) ka.textContent = kAlias(k);
     
     const overlayName = document.getElementById('overlay-name');
     if (overlayName) {
        overlayName.textContent = kName(k);
        document.getElementById('overlay-alias').textContent = kAlias(k);
     }
  }
  
  const wlName = document.getElementById('win-loss-kname');
  if (wlName && typeof _lastWinLossKiller !== 'undefined' && _lastWinLossKiller !== null) {
     wlName.textContent = kName(KILLERS[_lastWinLossKiller]);
  }

  const modBadge = document.getElementById('killer-mod-badge');
  if (modBadge && typeof _killFinalMod !== 'undefined' && _killFinalMod) {
     modBadge.textContent = t(_killFinalMod);
  }

  // Traduce los botones ON/OFF y los de sonido/velocidad
  if(typeof updateToggleButtons === 'function') {
     updateToggleButtons();
     updateSettingButtons();
  }

  try{ localStorage.setItem('dbd_lang', l); }catch(e){}
}
