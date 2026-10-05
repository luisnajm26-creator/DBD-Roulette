// ══════════════════════════════════════════════════════════════════════════════
// INIT
// ══════════════════════════════════════════════════════════════════════════════
load();
if(_statsMigrated) save();   // guarda las estadísticas migradas a ids (la clave antigua queda de respaldo)
setLang(lang);
renderSurvivors();
renderKillers();

// Teclado: Enter / Espacio activan la tarjeta enfocada, Esc cierra las ventanas
document.addEventListener('keydown', e => {
  if((e.key==='Enter' || e.key===' ') && e.target.classList && e.target.classList.contains('kcard')){
    e.preventDefault();
    e.target.click();
  }
  if(e.key==='Escape'){
    if(document.getElementById('stats-overlay').classList.contains('show')) closeStats();
    else if(document.getElementById('killer-overlay').classList.contains('show')) closeOverlay();
  }
});
