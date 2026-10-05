// ══════════════════════════════════════════════════════════════════════════════
// STORAGE
// ══════════════════════════════════════════════════════════════════════════════
function save(){
  try{
    localStorage.setItem('dbd_surv',    JSON.stringify([...selectedSurvivors]));
    localStorage.setItem('dbd_killers', JSON.stringify([...selectedKillers]));
    localStorage.setItem('dbd_blocked', JSON.stringify([...blockedKillers]));
    localStorage.setItem('dbd_blocked_mods', JSON.stringify(blockedMods)); 
    localStorage.setItem('dbd_stats_surv_v2', JSON.stringify(statsSurvPerks));
    localStorage.setItem('dbd_history', JSON.stringify(spinHistory));
    localStorage.setItem('dbd_stats_kill', JSON.stringify(statsKillMods)); 
    localStorage.setItem('dbd_use_gen', useGeneralPerks); 
    localStorage.setItem('dbd_use_mod', useKillerMods);   
    localStorage.setItem('dbd_lang', lang);
    localStorage.setItem('dbd_sound', soundOn);
    localStorage.setItem('dbd_speed', speedFast ? 'fast' : 'normal');
  }catch(e){}
}
// Las estadísticas antiguas (clave 'dbd_stats_surv') se guardaban por nombre en español.
// Se pasan a ids estables y se guardan en 'dbd_stats_surv_v2'; la clave antigua no se toca (queda de respaldo).
function migrateStatsToIds(old){
  const byName={};
  buildFullPerkCatalog().forEach(p=>{ byName[p.nameEs]=p.id; byName[p.nameEn]=p.id; });
  const out={}; let lost=0;
  Object.entries(old||{}).forEach(([name,count])=>{
    const id=byName[name];
    if(id) out[id]=(out[id]||0)+count; else lost++;
  });
  if(lost) console.warn(`Migración de estadísticas: ${lost} perk(s) antiguas no se reconocieron y se omitieron.`);
  _statsMigrated=true;
  return out;
}

function load(){
  try{
    const s=localStorage.getItem('dbd_surv');
    const k=localStorage.getItem('dbd_killers');
    const b=localStorage.getItem('dbd_blocked');
    const bm=localStorage.getItem('dbd_blocked_mods'); 
    const stS=localStorage.getItem('dbd_stats_surv'); 
    const stK=localStorage.getItem('dbd_stats_kill'); 
    const l=localStorage.getItem('dbd_lang');
    if(s) selectedSurvivors=new Set(JSON.parse(s));
    if(k) selectedKillers=new Set(JSON.parse(k));
    if(b) blockedKillers=new Set(JSON.parse(b));
    if(bm) blockedMods=JSON.parse(bm); 
    const stS2=localStorage.getItem('dbd_stats_surv_v2');
    if(stS2) statsSurvPerks=JSON.parse(stS2);
    else if(stS) statsSurvPerks=migrateStatsToIds(JSON.parse(stS));
    const hs=localStorage.getItem('dbd_history');
    if(hs){ const h=JSON.parse(hs); if(Array.isArray(h)) spinHistory=h; }
    if(stK) statsKillMods=JSON.parse(stK);  
    if(l) lang=l;
    const ug=localStorage.getItem('dbd_use_gen'); if(ug!==null) useGeneralPerks=(ug==='true');
    const um=localStorage.getItem('dbd_use_mod'); if(um!==null) useKillerMods=(um==='true');
    const so=localStorage.getItem('dbd_sound'); if(so!==null) soundOn=(so==='true');
    const sp=localStorage.getItem('dbd_speed'); if(sp!==null) speedFast=(sp==='fast');
  }catch(e){}
}
