// ══════════════════════════════════════════════════════════════════════════════
// INIT
// ══════════════════════════════════════════════════════════════════════════════
load();
if(_statsMigrated) save();   // guarda las estadísticas migradas a ids (la clave antigua queda de respaldo)
setLang(lang);
renderSurvivors();
renderKillers();

// La cuadrícula se reajusta al cambiar el tamaño de la ventana y cuando terminan de cargar las fuentes
window.addEventListener('resize', scheduleFit);
window.addEventListener('load', scheduleFit);
if(document.fonts && document.fonts.ready) document.fonts.ready.then(scheduleFit);
scheduleFit();

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
