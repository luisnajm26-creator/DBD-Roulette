// ══════════════════════════════════════════════════════════════════════════════
// STATE
// ══════════════════════════════════════════════════════════════════════════════
let selectedSurvivors = new Set();
let selectedKillers   = new Set();
let blockedKillers    = new Set();
let lastKillerResult  = null;
let spinning          = false;
let _survInterval     = null; 
let _killInterval     = null;
let _survFinalPerks   = [];
let _killFinalIdx     = null;
let _lastWinLossKiller = null; 
let _killFinalMod     = null; 

let blockedMods       = {}; 
let statsSurvPerks    = {}; 
let statsKillMods     = {0:0, 1:0, 2:0, 3:0, 4:0}; 

let useGeneralPerks   = true;
let useKillerMods     = true;

// Historial de tiradas (más reciente primero, máx. 40). Guarda ids, no textos, para que se traduzca al cambiar de idioma.
let spinHistory   = [];
let _curKillEntry = null;
let _statsMigrated = false;

// Id estable de una perk: nombre en inglés sin símbolos (es también el nombre de su imagen en img/perks)
function perkId(en){ return en.toLowerCase().replace(/[^a-z0-9]/g,''); }
// Id estable de un asesino: nombre de su imagen sin extensión
function killerKey(k){ return k.img.split('/').pop().replace(/\.\w+$/,''); }

// Preferencias de la interfaz. Si el sistema pide menos movimiento, las animaciones arrancan en modo rápido.
let soundOn   = true;
let speedFast = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
const FAST_FACTOR = 0.3;
function speedScale(){ return speedFast ? FAST_FACTOR : 1; }

let _killFinalModIdx  = null; 
let _overlaySpinning  = false;
let _overlayInt       = null;
let lastSpinPerks     = new Set(); 
const MODS_KEYS       = ['mod_4p', 'mod_3p', 'mod_2p', 'mod_1p', 'mod_0p'];
