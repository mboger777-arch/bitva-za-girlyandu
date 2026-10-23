'use strict';
// ===== Финал: крепость Путаника, щит-таблица 3×3, три фазы =====
const BQ=[{p:1,g:[['s','r','s'],['r','s','r'],['s','r',null]],ans:'s',o:['s','r','b']},{p:1,g:[['g','g','b'],['g','g','b'],['g','g',null]],ans:'b',o:['g','b','r']},
 {p:2,g:[[2,4,6],[5,10,15],[1,2,null]],ans:3,o:[3,4,2]},{p:2,g:[[3,4,5],[6,8,10],[10,15,null]],ans:20,o:[20,16,25]},
 {p:3,g:[[1,2,3],[2,4,6],[5,10,null]],ans:15,o:[15,11,20]},{p:3,g:[[1,2,3],[2,4,null],[5,10,15]],ans:6,o:[6,5,8]}];
const BPX=-1.2,BPZ=-5.2,bpPos=(r,c)=>[BPX+(c-1)*2.35,1.45+(2-r)*2.15,BPZ];
const CAM_BOSS=[[0,8.2,16.5],[0,2.9,-4]];
SC.boss={
 enter(){GM.lvl=6;GM.stepN=0;GM.steps=6;LV={hp:1,shown:1,panel:null,crack:0};world({tx:-9.2,tz:-8.4});GM.put=actor('put_angry',7,{x:6.3,z:-9.4,breath:.01,flip:false});
  cast=[hero('shustrik',LEFT(105),{base:'orb',h:215})];GM.extra=bossUpd;musStart('boss',148,1);CAMR.pos.set(0,4,24);CAMR.look.set(4,5,-9);camTo(CAM_BOSS[0],CAM_BOSS[1],1.1);
  run(async()=>{await wait(500);await say('f_in');await say('f_how');
   for(let i=0;i<6;i++){const Q=BQ[i];if(i%2===0){LV.panel=null;await say('f_p'+Q.p)}
    LV.panel={g:Q.g,t0:T,miss:Q.g.flatMap((row,r)=>row.map((v,c)=>v==null?[r,c]:null)).find(Boolean)};GOAL='Что пропало на щите?';
    const opts=shuffle(Q.o.slice()).map(v=>typeof v==='string'?{icon:v}:{v});const mr=LV.panel.miss;
    await ask({opts,ans:opts.findIndex(o=>(o.icon||o.v)===Q.ans),target:()=>bpPos(mr[0],mr[1]),hint:'f_hint'});
    LV.panel.g=Q.g.map(r=>r.slice());LV.panel.g[mr[0]][mr[1]]=Q.ans;LV.panel.fl=T;GOAL='';stepDone();await say('ok'+(1+i%3));
    if(i%2===0){LV.crack=1;await bossAttack(i)}else{await shatter();if(i<5){await say('f_hit');await bossAttack(i)}}}
   await finale()})},
 draw(){const P=LV.panel;if(P){const k=ease(clamp((T-P.t0)/.6,0,1));if(k>.5)P.g.forEach((row,r)=>row.forEach((v,c)=>{const p=bpPos(r,c);if(v==null){if(GM.q)qTag(p[0],p[1],p[2]+.2,{u:1,min:56});return}
   if(typeof v==='string'){const pp=proj(p[0],p[1],p[2]+.2);const d=Math.max(56,pxPerUnit(p[0],p[1],p[2])*1.45);spr(ICON[v],pp.x,pp.y,d)}else numTag(p[0],p[1],p[2]+.2,v,{u:.85,min:50,bg:'rgba(40,10,70,.82)',rim:'#d9a6ff'})}))}
  if(GM.put&&LV.hp>0){const p=projA(GM.put,1.04);const w=230,h=26,x=clamp(p.x,safeL()+w/2+10,safeR()-w/2-10),y=Math.max(safeT()+110,p.y-20);X.fillStyle='rgba(10,10,30,.75)';X.beginPath();X.roundRect(x-w/2-5,y-h/2-5,w+10,h+10,(h+10)/2);X.fill();LV.shown=lerp(LV.shown,LV.hp,.08);
   const g=X.createLinearGradient(x-w/2,0,x+w/2,0);g.addColorStop(0,'#b04bff');g.addColorStop(1,'#ff5fa8');X.fillStyle=g;X.beginPath();X.roundRect(x-w/2,y-h/2,Math.max(h,w*LV.shown),h,h/2);X.fill()}
  drawCast();trayDraw();flyDraw();garlandHUD()},
 hold:ARENA_IN.hold,move:ARENA_IN.move,up:ARENA_IN.up,onHero(h){if(h==='shustrik'&&GM.q&&!talk){sayNow('f_hint');return true}}};
function bossUpd(dt){const P=LV.panel,put=GM.put;if(put){put.lift=Math.sin(T*1.6)*.06;lightPool(put.x,put.z+1,3.6,[.25,.1,.35],1);if(LV.stun&&T-LV.stun<1.6){put.tilt=Math.sin((T-LV.stun)*25)*.08;if(Math.random()<.3)glow(put.x+rnd(-1,1),6.6,put.z+.5,CL.gold,.6)}else put.tilt=0}
 if(P){const k=ease(clamp((T-P.t0)/.6,0,1));for(let r=0;r<3;r++)for(let c=0;c<3;c++){const p=bpPos(r,c);const miss=P.g[r][c]==null;const fl=P.fl&&T-P.fl<.8?1-(T-P.fl)/.8:0;
   const col=miss?mul([1,.85,.4],.35+.25*Math.sin(T*6)):mul(LV.crack?[1,.45,.8]:[.7,.45,1],.55+fl+(LV.crack?.15*Math.sin(T*20+r+c):0));instAdd(SHLD,p[0],p[1],p[2],1.12*k,1.12*k,1.12*k,_qf,col)}
  if(Math.random()<.15){const r=Math.floor(rnd(0,3)),c=Math.floor(rnd(0,3)),p=bpPos(r,c);glow(p[0]+rnd(-1,1),p[1]+rnd(-1,1),p[2]+.2,[.7,.4,1],.5)}
  // Буран без врагов бьёт по щиту — искры
  const b=GM.bur;if(b&&!GM.en.some(e=>!e.dead)&&Math.random()<dt*3){const t=bpPos(Math.floor(rnd(0,3)),Math.floor(rnd(0,3)));GM.sky.push({a:[b.x,2.3,b.z],b:t,life:.12,c:CL.cy,w:.18,zig:0});for(let i=0;i<5;i++)GM.fx.push({x:t[0],y:t[1],z:t[2]+.3,vx:rnd(-3,3),vy:rnd(-1,3),vz:rnd(0,3),g:6,life:.35,ml:.35,c:[.8,.6,1],s:.35})}}}
async function bossAttack(i){GM.put.key='put_angry';wave(i<2?['drone','bot']:['drone','drone','bot'],1);const n=G.fast?1:2+Math.min(2,i>>1);
 for(let k=0;k<n;k++){const b=GM.bur;hazard({kind:'circle',x:b.x,z:b.z,r:1.9,fist:1,warn:1.25,act:.3});if(i>=2)hazard({kind:'circle',x:clamp(b.x+rnd(-5,5),-9,9),z:clamp(b.z+rnd(-3,3),-5,5),r:1.9,fist:1,warn:1.5,act:.3});await wait(1700)}
 if(i>=3){for(let r=0;r<2;r++){hazard({kind:'stripe',x:GM.bur.x,z:0,len:14,w:2.2,rot:Math.PI/2});await wait(1500)}}await waveDone(.3)}
async function shatter(){const P=LV.panel;LV.panel=null;LV.crack=0;SFX3.boom();SFX3.thunder();cshake(1.6);punch(.8);slowmo(1.3);A3.flash=.7;vib([60,40,80]);
 for(let r=0;r<3;r++)for(let c=0;c<3;c++){const p=bpPos(r,c);for(let k=0;k<14;k++)GM.fx.push({x:p[0],y:p[1],z:p[2],vx:rnd(-6,6),vy:rnd(-2,7),vz:rnd(0,7),g:9,life:rnd(.6,1.1),ml:1.1,c:[[.75,.5,1],CL.wht,CL.ice][k%3],s:rnd(.4,.8)})}
 const b=GM.bur;GM.sky.push({a:[b.x,2.3,b.z],b:[GM.put.x,4,GM.put.z],life:.6,c:CL.cy,w:.9,zig:.3});LV.hp=Math.max(0,LV.hp-1/3);LV.stun=T;GM.put.flash=2;GM.put.key='put_laugh';{const P=GM.put;setTimeout(()=>{if(GM.put===P&&P.key==='put_laugh')P.key='put_angry'},1600)};SFX.grumble();await wait(900)}
async function finale(){GM.q=null;killAll();LV.panel=null;musStart('menu');const P=GM.put;P.key='put_kind';P.tint=[1.3,1.1,.9];camTo([2,5.5,7],[5,3.5,-9],1.2);
 for(let i=0;i<30;i++)GM.fx.push({x:P.x+rnd(-2,2),y:rnd(0,7),z:P.z+.5,vx:rnd(-1,1),vy:rnd(1,3),vz:0,g:0,life:1.5,ml:1.5,c:[1,.8,.5],s:.6});
 await say('f_melt');P.tint=null;await say('f_kind');camTo([-2,6,13],[-6,4,-8],1);await say('f_yes');
 // каскад гирлянды
 TREE3.lit=0;for(let i=1;i<=12;i++){setTimeout(()=>{TREE3.lit=i/12;SFX3.chime(i%8)},i*140)}await wait(1900);for(let i=0;i<6;i++)setTimeout(()=>firework(rnd(-9,3),rnd(6,10),rnd(-12,-6)),i*300);
 SV.fin=1;SV.stars[5]=3;save();await wait(1800);go('medal')}
