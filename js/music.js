'use strict';
// ===== Музыка: зимний экшн-трек (бочка, малый, бубенцы, бас, арпеджио, колокольчики, пэд). WebAudio, планирование по часам AudioContext =====
const midi=m=>440*Math.pow(2,(m-69)/12);
const MUS={on:false,step:0,next:0,bpm:132,mode:'',timer:null,bus:null,wet:null,duck:1,inten:1,nb:null};
function musInit(){const a=ac();if(!a)return null;if(MUS.bus)return a;
 MUS.master=a.createGain();MUS.master.gain.value=.85;const comp=a.createDynamicsCompressor();comp.threshold.value=-16;comp.ratio.value=4;MUS.master.connect(comp).connect(a.destination);
 MUS.bus=a.createGain();MUS.bus.gain.value=.8;MUS.bus.connect(MUS.master);
 const len=Math.floor(a.sampleRate*2.2),ir=a.createBuffer(2,len,a.sampleRate);for(let c=0;c<2;c++){const d=ir.getChannelData(c);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,3)}
 const cv=a.createConvolver();cv.buffer=ir;MUS.wet=a.createGain();MUS.wet.gain.value=.25;MUS.wet.connect(cv).connect(MUS.bus);
 MUS.nb=a.createBuffer(1,a.sampleRate*.5,a.sampleRate);const d=MUS.nb.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;return a}
function env(g,t,at,peak,d){g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(peak,t+at);g.gain.exponentialRampToValueAtTime(.0006,t+at+d)}
function osc(type,f,t,at,v,d,out,wet){const a=AC,o=a.createOscillator(),g=a.createGain();o.type=type;o.frequency.value=f;env(g,t,at,v,d);o.connect(g);g.connect(out||MUS.bus);if(wet)g.connect(MUS.wet);o.start(t);o.stop(t+at+d+.05);return o}
function kick(t,v){const a=musInit();if(!a||G.mute)return;const o=a.createOscillator(),g=a.createGain();o.frequency.setValueAtTime(150,t);o.frequency.exponentialRampToValueAtTime(40,t+.18);env(g,t,.003,v||.4,.22);o.connect(g).connect(MUS.bus);o.start(t);o.stop(t+.3)}
function nz(t,v,type,fq,d,q){const a=AC,s=a.createBufferSource();s.buffer=MUS.nb;const f=a.createBiquadFilter();f.type=type;f.frequency.value=fq;if(q)f.Q.value=q;const g=a.createGain();env(g,t,.002,v,d);s.connect(f).connect(g).connect(MUS.bus);s.start(t,Math.random()*.3);s.stop(t+d+.05)}
function snare(t,v){nz(t,v||.16,'bandpass',1900,.16,.7);osc('triangle',190,t,.002,(v||.16)*.5,.08)}
function bells(t,v){nz(t,v||.05,'highpass',7500,.06);nz(t+.012,(v||.05)*.6,'highpass',9000,.05)}
function bass(m,t,d,v){const a=AC,o=a.createOscillator(),o2=a.createOscillator(),f=a.createBiquadFilter(),g=a.createGain();o.type='sawtooth';o2.type='square';o.frequency.value=midi(m);o2.frequency.value=midi(m-12);f.type='lowpass';f.frequency.setValueAtTime(900,t);f.frequency.exponentialRampToValueAtTime(220,t+d);f.Q.value=6;env(g,t,.005,v||.11,d);o.connect(f);o2.connect(f);f.connect(g).connect(MUS.bus);o.start(t);o2.start(t);o.stop(t+d+.05);o2.stop(t+d+.05)}
function arp(m,t,v){const a=AC,o=a.createOscillator(),f=a.createBiquadFilter(),g=a.createGain();o.type='square';o.frequency.value=midi(m);f.type='lowpass';f.frequency.value=2600;env(g,t,.003,v||.03,.12);o.connect(f).connect(g);g.connect(MUS.bus);g.connect(MUS.wet);o.start(t);o.stop(t+.2)}
function bellNote(m,t,v,d){const f=midi(m);v=v||.07;d=d||1.2;[[1,1],[2.76,.3],[5.4,.12],[2,.25]].forEach(([k,w])=>osc('sine',f*k,t,.003,v*w,d/(k>1?k*.5:1),null,true))}
function padCh(ch,t,d,v){const a=AC;ch.forEach(m=>{[-6,6].forEach(dt=>{const o=a.createOscillator(),f=a.createBiquadFilter(),g=a.createGain();o.type='sawtooth';o.frequency.value=midi(m);o.detune.value=dt;f.type='lowpass';f.frequency.value=1100;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v||.012,t+.4);g.gain.setValueAtTime(v||.012,t+d-.3);g.gain.linearRampToValueAtTime(0,t+d);o.connect(f).connect(g);g.connect(MUS.bus);g.connect(MUS.wet);o.start(t);o.stop(t+d+.05)})})}
function pluck(f,when,vol){const a=musInit();if(!a||G.mute)return;const t=a.currentTime+(when||0);osc('triangle',f,t,.004,vol||.08,.5,null,true);osc('sine',f*2,t,.004,(vol||.08)*.3,.3)}
// гармония: Am F C G (героический минор), мелодия-колокольчики — свой мотив
const PROG=[[57,60,64],[53,57,60],[48,52,55],[55,59,62]],ROOT=[45,41,48,43];
const MEL=[76,null,74,76,79,null,76,74,72,null,74,null,76,null,null,null, 77,null,76,74,72,null,74,72,71,null,72,null,74,null,null,null, 76,null,74,76,79,null,81,79,76,null,74,null,72,null,74,null, 71,null,72,74,76,null,74,72,69,null,null,null,null,null,null,null];
const MENU=[76,null,null,79,null,null,81,null,79,null,76,null,74,null,null,null, 72,null,null,74,null,null,76,null,74,null,72,null,69,null,null,null];
function musTick(){const a=AC;if(!a||!MUS.on||a.state!=='running')return;const sd=60/MUS.bpm/4;
 while(MUS.next<a.currentTime+.12){const s=MUS.step,t=MUS.next,bar=Math.floor(s/16)%4,st=s%16,ch=PROG[bar],I=MUS.inten;
  if(!G.mute){if(MUS.mode==='menu'){if(st===0)padCh(ch,t,sd*16,.01);const m=MENU[s%32];if(m)bellNote(m,t,.06,1.6);if(st%4===0)bells(t,.025);if(st===0||st===8)osc('sine',midi(ROOT[bar]),t,.01,.06,.9)}
   else{const boss=MUS.mode==='boss';
    if(st%4===0)kick(t,.36);if(boss&&st%4===2&&I>1)kick(t,.18);if(st===4||st===12)snare(t,.15);if(st===15&&bar===3)snare(t,.09);
    bells(t,st%2?.025:.045);
    if(st%2===0)bass(ROOT[bar]+(st%4===2?12:0),t,sd*1.8,.1);
    if(I>0){const n=ch[[0,1,2,1][st%4]]+12+(st>=8?12:0);arp(n+(boss?0:0),t,.022)}
    if(st===0)padCh(ch,t,sd*16,.009);
    if(I>1){const m=MEL[s%64];if(m)bellNote(m+(boss?-12:0),t,.05,.9)}}}
  MUS.step++;MUS.next+=sd}}
function musStart(mode,bpm,inten){const a=musInit();if(!a)return;if(MUS.on&&MUS.mode===mode){if(bpm)MUS.bpm=bpm;if(inten!=null)MUS.inten=inten;return}musStop();MUS.mode=mode;MUS.bpm=bpm||(mode==='menu'?96:mode==='boss'?148:132);MUS.inten=inten==null?2:inten;MUS.step=0;MUS.next=a.currentTime+.1;MUS.on=true;MUS.timer=setInterval(musTick,25);musTick()}
function musStop(){MUS.on=false;if(MUS.timer)clearInterval(MUS.timer);MUS.timer=null}
function musTempo(b){MUS.bpm=b}
function musMenu(){musStart('menu')}
function musDuck(){if(!MUS.bus||!AC)return;const want=G.mute?0:(talk&&!G.fast?.42:.8);if(Math.abs(want-MUS.duck)>.01){MUS.duck=want;MUS.bus.gain.setTargetAtTime(want,AC.currentTime,.15)}}
// игровые звуки поверх музыки
const SFX3={
 zap(){const a=musInit();if(!a||G.mute)return;const t=a.currentTime;osc('sawtooth',1800,t,.002,.04,.09).frequency.exponentialRampToValueAtTime(300,t+.09)},
 laser(){const a=musInit();if(!a||G.mute)return;const t=a.currentTime;const o=osc('square',2400,t,.003,.05,.35);o.frequency.exponentialRampToValueAtTime(180,t+.35);nz(t,.06,'highpass',3000,.2)},
 thunder(){const a=musInit();if(!a||G.mute)return;const t=a.currentTime;nz(t,.35,'lowpass',500,.9);const o=osc('sawtooth',90,t,.005,.12,.6);o.frequency.exponentialRampToValueAtTime(35,t+.6);for(let i=0;i<6;i++)nz(t+i*.05,.12,'bandpass',2000+i*500,.06,2)},
 boom(){const a=musInit();if(!a||G.mute)return;const t=a.currentTime;kick(t,.6);nz(t,.3,'lowpass',900,.5)},
 hit(){const a=musInit();if(!a||G.mute)return;const t=a.currentTime;nz(t,.18,'bandpass',1200,.1,1.5);osc('square',320,t,.002,.04,.08)},
 frost(){const a=musInit();if(!a||G.mute)return;const t=a.currentTime;[2600,3300,4200].forEach((f,i)=>osc('sine',f,t+i*.03,.002,.04,.4));nz(t,.1,'highpass',6000,.4)},
 throw(){const a=musInit();if(!a||G.mute)return;const t=a.currentTime;nz(t,.12,'bandpass',800,.18,1)},
 snap(){const a=musInit();if(!a||G.mute)return;const t=a.currentTime;osc('triangle',880,t,.002,.08,.1);osc('triangle',1320,t+.05,.002,.07,.15)},
 sneeze(){const a=musInit();if(!a||G.mute)return;const t=a.currentTime;nz(t,.15,'bandpass',2500,.08,2);nz(t+.12,.25,'bandpass',1400,.25,1);osc('sine',600,t+.12,.005,.05,.2).frequency.exponentialRampToValueAtTime(250,t+.32)},
 power(){const a=musInit();if(!a||G.mute)return;const t=a.currentTime;const o=osc('sawtooth',200,t,.01,.05,.8);o.frequency.exponentialRampToValueAtTime(1600,t+.8);nz(t,.08,'highpass',4000,.8)},
 shield(){const a=musInit();if(!a||G.mute)return;const t=a.currentTime;nz(t,.3,'bandpass',3200,.5,3);[1200,1500,1900,2500].forEach((f,i)=>osc('triangle',f,t+i*.04,.002,.05,.4))},
 rumble(){const a=musInit();if(!a||G.mute)return;const t=a.currentTime;nz(t,.3,'lowpass',180,1.6);kick(t,.3)},
 chime(i){const a=musInit();if(!a||G.mute)return;bellNote([72,74,76,79,81,84,86,88][Math.min(7,i||0)],a.currentTime,.08,1.1)},
 stars(){const a=musInit();if(!a||G.mute)return;const t=a.currentTime;[84,88,91,96,91,96,100].forEach((m,i)=>bellNote(m,t+i*.07,.04,.7))}};
