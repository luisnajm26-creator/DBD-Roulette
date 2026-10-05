// ══════════════════════════════════════════════════════════════════════════════
// AUDIO
// ══════════════════════════════════════════════════════════════════════════════
let audioCtx = null;
function getCtx(){
  if(!audioCtx) audioCtx = new (window.AudioContext||window.webkitAudioContext)();
  return audioCtx;
}
function playTone(freq, type, duration, vol){
  try{
    const ctx = getCtx();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.type = type||'sine'; o.frequency.value = freq;
    g.gain.setValueAtTime(vol||0.18, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime+duration);
    o.start(); o.stop(ctx.currentTime+duration);
  }catch(e){}
}
function soundPerkLock()  { playTone(880,'square',.12,.12); setTimeout(()=>playTone(1100,'square',.1,.1),80); }
function soundFinalFanfare(){
  [440,554,659,880].forEach((f,i)=>setTimeout(()=>playTone(f,'triangle',.3,.15),i*100));
}
function soundKillerReveal(){
  playTone(220,'sawtooth',.4,.18);
  setTimeout(()=>playTone(330,'sawtooth',.3,.15),200);
  setTimeout(()=>playTone(440,'square',.5,.2),450);
}
function soundRollTick(){
  try{
    const ctx=getCtx();
    const buf=ctx.createBuffer(1,Math.floor(ctx.sampleRate*0.03),ctx.sampleRate);
    const d=buf.getChannelData(0);
    for(let i=0;i<d.length;i++) d[i]=(Math.random()*2-1)*0.07;
    const src=ctx.createBufferSource(); src.buffer=buf;
    const f=ctx.createBiquadFilter(); f.type='bandpass'; f.frequency.value=1400; f.Q.value=1.2;
    src.connect(f); f.connect(ctx.destination);
    src.start(); src.stop(ctx.currentTime+0.03);
  }catch(e){}
}
