// ══════════════════════════════════════════════════════════════════════════════
// STORAGE
// ══════════════════════════════════════════════════════════════════════════════
function save(){
  try{
    localStorage.setItem('dbd_surv',    JSON.stringify([...selectedSurvivors]));
    localStorage.setItem('dbd_killers', JSON.stringify([...selectedKillers]));
    localStorage.setItem('dbd_blocked', JSON.stringify([...blockedKillers]));
    localStorage.setItem('dbd_blocked_mods', JSON.stringify(blockedMods)); 
    localStorage.setItem('dbd_stats_surv', JSON.stringify(statsSurvPerks)); 
    localStorage.setItem('dbd_stats_kill', JSON.stringify(statsKillMods)); 
    localStorage.setItem('dbd_use_gen', useGeneralPerks); 
    localStorage.setItem('dbd_use_mod', useKillerMods);   
    localStorage.setItem('dbd_lang', lang);
    localStorage.setItem('dbd_sound', soundOn);
    localStorage.setItem('dbd_speed', speedFast ? 'fast' : 'normal');
  }catch(e){}
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
    if(stS) statsSurvPerks=JSON.parse(stS); 
    if(stK) statsKillMods=JSON.parse(stK);  
    if(l) lang=l;
    const ug=localStorage.getItem('dbd_use_gen'); if(ug!==null) useGeneralPerks=(ug==='true');
    const um=localStorage.getItem('dbd_use_mod'); if(um!==null) useKillerMods=(um==='true');
    const so=localStorage.getItem('dbd_sound'); if(so!==null) soundOn=(so==='true');
    const sp=localStorage.getItem('dbd_speed'); if(sp!==null) speedFast=(sp==='fast');
  }catch(e){}
}
