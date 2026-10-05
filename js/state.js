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

let _killFinalModIdx  = null; 
let _overlaySpinning  = false;
let _overlayInt       = null;
let lastSpinPerks     = new Set(); 
const MODS_KEYS       = ['mod_4p', 'mod_3p', 'mod_2p', 'mod_1p', 'mod_0p'];
