'use strict';
// ===== Игровые системы: Буран, враги, снаряды, снежки, опасные зоны, лоток зарядов, вопросы, секреты (шишки, сияние, луна) =====
const GM={lvl:0,bur:null,tgt:{x:0,z:3.5},steer:null,en:[],bolts:[],fx:[],sb:[],hz:[],sky:[],spawnQ:[],calm:1,fireT:0,frostT:0,streak:0,q:null,tray:[],fly:null,cone:null,moonUsed:false,said:{},towers:[],kills:0,gt:0,steps:0,stepN:0,run:0,dmg:1,score:0,qT:0};
const BND={x0:-10,x1:10,z0:-5.5,z1:6};
const CL={cy:[.35,.85,1],gold:[1,.8,.3],red:[1,.3,.35],grn:[.35,1,.5],blu:[.4,.6,1],wht:[1,1,1],pink:[1,.45,.9],ice:[.6,.9,1]};
const mul=(c,k)=>[c[0]*k,c[1]*k,c[2]*k];
function onScene(n){actorsClear();TREE3.a=null;L3UPD=null;A3.off=false;A3.aur=0;A3.slowT=0;A3.frost=0;Object.assign(GM,{put:null,bur:null,en:[],bolts:[],fx:[],sb:[],hz:[],sky:[],spawnQ:[],calm:1,q:null,tray:[],fly:null,cone:null,moonUsed:false,said:{},towers:[],steer:null,frostT:0,streak:0,extra:null,lab:null,boss:null,pickHL:null,qT:0});PADS.count=0}
// мир уровня: ёлка, Буран, камера
function world(o){o=o||{};if(o.tree!==false)treeAdd(o.tx||0,o.tz==null?-9:o.tz,8.6);TREE3.lit=o.lit||0;
 if(o.bur!==false){GM.bur=actor('ride',3.3,{x:-5.6,z:3.2,breath:.008,run:0});GM.tgt={x:-5.6,z:3.2}}
 L3UPD=gameUpd;camTo(CAM_GAME[0],CAM_GAME[1]);if(o.snap!==false)camSnap()}
// ---- точки сцены в координатах оверлея ----
function talkerAt(who){if(who==='kira'&&GM.bur)return projA(GM.bur,.8).x;if(who==='putanik'&&GM.put)return projA(GM.put,.8).x;return null}
// ---- Буран ----
const FACE=-1;// спрайт смотрит влево
function burUpd(dt,rdt){const b=GM.bur;if(!b)return;
 const kx=(KEYS.ArrowRight||KEYS.d?1:0)-(KEYS.ArrowLeft||KEYS.a?1:0),kz=(KEYS.ArrowDown||KEYS.s?1:0)-(KEYS.ArrowUp||KEYS.w?1:0);if(kx||kz){GM.tgt.x=b.x+kx*2;GM.tgt.z=b.z+kz*2}
 if(GM.steer){const g=groundAt(GM.steer.x,GM.steer.y-60);if(g){GM.tgt.x=g.x;GM.tgt.z=g.z}}
 GM.tgt.x=clamp(GM.tgt.x,BND.x0,BND.x1);GM.tgt.z=clamp(GM.tgt.z,BND.z0,BND.z1);
 GM.frostT=Math.max(0,GM.frostT-rdt);const sp=GM.frostT>0?2.2:9.5;const dx=GM.tgt.x-b.x,dz=GM.tgt.z-b.z,d=Math.hypot(dx,dz);let v=0;
 if(d>.06){const s=Math.min(d,sp*rdt);b.x+=dx/d*s;b.z+=dz/d*s;v=s/Math.max(rdt,1e-4);if(Math.abs(dx)>.25)b.flip=(dx<0)===(FACE>0)}
 b.run=lerp(b.run,clamp(v/8,0,1),.15);b.lift=Math.abs(Math.sin(T*13))*.22*b.run;b.tilt=(b.flip?1:-1)*b.run*.05+Math.sin(T*13)*.02*b.run;
 if(b.run>.3&&Math.random()<.5)GM.fx.push({x:b.x+rnd(-.5,.5),y:.1,z:b.z+rnd(-.2,.3),vx:rnd(-.5,.5),vy:rnd(.5,1.4),vz:rnd(-.2,.4),g:3,life:.5,ml:.5,c:[.5,.6,.75],s:.5});
 b.tint=GM.frostT>0?[.55,.8,1.3]:null;if(GM.frostT>0&&Math.random()<.4)glow(b.x+rnd(-.8,.8),rnd(.3,2.4),b.z+.3,CL.ice,.35);
 // кольцо под Бураном — видно, где он
 ring(b.x,b.z,1.15,mul(CL.cy,.45),1,T);
 // автоматическая стрельба по ближайшему врагу
 GM.fireT-=dt;if(GM.fireT<=0){const e=nearest(b.x,b.z,9.5);if(e){GM.fireT=GM.frostT>0?.7:.3;const hx=b.x+(b.flip?1:-1)*.9,hy=2.25+b.lift;GM.bolts.push({x:hx,y:hy,z:b.z,e,sp:26,c:CL.cy,dmg:1});glow(hx,hy,b.z,CL.cy,2);SFX3.zap()}else GM.fireT=.1}}
function nearest(x,z,r){let best=null,bd=r;for(const e of GM.en){if(e.dead||e.spawn>0)continue;const d=Math.hypot(e.x-x,e.z-z);if(d<bd){bd=d;best=e}}return best}
// ---- враги ----
const EK={bot:{h:2.1,hp:3,sp:1.5,fly:0},drone:{h:1.6,hp:2,sp:2.1,fly:1.9},thief:{h:2.1,hp:3,sp:1.8,fly:0}};
function spawn(k,x,z,o){o=o||{};const K=EK[k];const e=Object.assign({k,x,z,y:K.fly,hp:G.fast?1:K.hp,max:K.hp,sp:K.sp,dead:false,throwT:rnd(2.5,4.5),ph:rnd(0,6),spawn:.6},o);e.a=actor(k,K.h,{x,z,y:e.y,breath:.015});e.a.alpha=0;GM.en.push(e);return e}
function edgeSpawn(k){const side=Math.random()<.5?-1:1;const r=Math.random();if(k==='drone'&&r<.5)return spawn(k,rnd(-9,9),-15);return spawn(k,side*13.5,rnd(-8,1))}
function wave(list,gap){list.forEach((k,i)=>GM.spawnQ.push({k,t:GM.gt+.3+i*(gap||1)}))}
async function waveDone(min){const t0=GM.gt;while(GM.spawnQ.length||GM.en.some(e=>!e.dead)||GM.gt-t0<(min||0))await wait(150)}
function enUpd(dt){for(let i=GM.spawnQ.length-1;i>=0;i--)if(GM.gt>=GM.spawnQ[i].t){edgeSpawn(GM.spawnQ[i].k);GM.spawnQ.splice(i,1)}
 const tr=TREE3.a,b=GM.bur;
 for(const e of GM.en){if(e.dead)continue;const a=e.a;if(e.spawn>0){e.spawn-=dt;a.alpha=clamp(1-e.spawn/.6,0,1)}
  // цель: ёлка (или своя точка)
  let tx=e.tx!=null?e.tx:(tr?tr.x:0),tz=e.tz!=null?e.tz:(tr?tr.z+1.5:-7);const dx=tx-e.x,dz=tz-e.z,d=Math.hypot(dx,dz);
  const sp=e.sp*GM.calm*(e.slow||1);if(d>.1){e.x+=(dx/d*sp+Math.sin(GM.gt*1.3+e.ph)*.5)*dt;e.z+=dz/d*sp*dt;if(Math.abs(dx)>.3)a.flip=dx<0}
  e.y=EK[e.k].fly?EK[e.k].fly+Math.sin(GM.gt*3+e.ph)*.25:0;a.x=e.x;a.z=e.z;a.y=e.y;a.lift=EK[e.k].fly?0:Math.abs(Math.sin(GM.gt*6+e.ph))*.12;a.tilt=EK[e.k].fly?Math.sin(GM.gt*2+e.ph)*.08:Math.sin(GM.gt*6+e.ph)*.04;
  if(e.k==='thief')glow(e.x+(a.flip?-.3:.3),1.1+a.lift,e.z+.2,[1,.5,.3],.9);
  if(e.k==='drone')glow(e.x,e.y+.75,e.z+.1,mul(CL.cy,.8),.7);
  // ёлка защищается сама: молния со звезды
  if(tr&&e.tx==null&&Math.hypot(e.x-tr.x,e.z-tr.z-1.5)<1.6){GM.sky.push({a:[tr.x,tr.h*.98,tr.z],b:[e.x,e.y+1,e.z],life:.35,c:[1,.9,.5],w:.35});kill(e,true);TREE3.flick=1.2;SFX3.thunder();continue}
  // снежки в Бурана
  if(b&&!e.noThrow){e.throwT-=dt*(GM.calm<1?.6:1);if(e.throwT<=0&&Math.hypot(b.x-e.x,b.z-e.z)<11){e.throwT=rnd(3.2,5.5);throwAt(e.x,e.y+1.2,e.z,b.x,b.z)}}}
 GM.en=GM.en.filter(e=>!e.dead||e.dt>0);for(const e of GM.en)if(e.dead){e.dt-=dt;e.a.alpha=Math.max(0,e.dt/.3);e.a.y-=dt*3;if(e.dt<=0)actorKill(e.a)}}
function hit(e,dmg,c){if(e.dead||e.spawn>0)return;e.hp-=dmg;e.a.flash=1;for(let i=0;i<5;i++)GM.fx.push({x:e.x,y:e.y+1,z:e.z+.3,vx:rnd(-3,3),vy:rnd(1,4),vz:rnd(-1,2),g:8,life:.35,ml:.35,c:c||CL.cy,s:.35});SFX3.hit();if(e.hp<=0)kill(e)}
function kill(e,quiet){if(e.dead)return;e.dead=true;e.dt=.3;e.a.flash=2;GM.kills++;GM.score+=10;
 for(let i=0;i<22;i++){const c=[CL.cy,CL.wht,CL.ice,CL.gold][i%4];GM.fx.push({x:e.x,y:e.y+1,z:e.z,vx:rnd(-5,5),vy:rnd(1,7),vz:rnd(-3,4),g:9,life:rnd(.4,.8),ml:.8,c,s:rnd(.3,.6)})}
 GM.fx.push({ring:1,x:e.x,z:e.z,life:.45,ml:.45,r:2.6,c:CL.ice});if(!quiet){SFX3.boom();cshake(.5)}
 if(e.k==='thief'&&TREE3.a){const t=TREE3.a;GM.fx.push({home:1,x:e.x,y:1,z:e.z,tx:t.x+rnd(-1,1),ty:rnd(2,6),tz:t.z+.3,life:.9,ml:.9,c:[1,.6,.4],s:.8})}}
function killAll(){GM.spawnQ.length=0;GM.en.forEach(e=>kill(e,true))}
// ---- снаряды, частицы, лучи с неба ----
function boltUpd(dt){for(const p of GM.bolts){const e=p.e;if(!e||e.dead){p.dead=true;continue}const tx=e.x,ty=e.y+1,tz=e.z;const dx=tx-p.x,dy=ty-p.y,dz=tz-p.z,d=Math.hypot(dx,dy,dz);const s=p.sp*dt;
  const ox=p.x,oy=p.y,oz=p.z;if(d<=s){hit(e,p.dmg,p.c);p.dead=true}else{p.x+=dx/d*s;p.y+=dy/d*s;p.z+=dz/d*s}glow(p.x,p.y,p.z,p.c,1.1);beam([ox-(p.x-ox)*1.5,oy-(p.y-oy)*1.5,oz-(p.z-oz)*1.5],[p.x,p.y,p.z],.18,mul(p.c,.8))}
 GM.bolts=GM.bolts.filter(p=>!p.dead)}
function fxUpd(dt){for(const p of GM.fx){p.life-=dt;if(p.ring){const f=1-p.life/p.ml;ring(p.x,p.z,p.r*(.3+f),mul(p.c,1-f),1);continue}
  if(p.home){const f=1-p.life/p.ml;const x=lerp(p.x,p.tx,f),z=lerp(p.z,p.tz,f),y=lerp(p.y,p.ty,f)+Math.sin(f*Math.PI)*3;glow(x,y,z,p.c,p.s);continue}
  p.vy-=(p.g||0)*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;if(p.y<0){p.y=0;p.vy*=-.3;p.vx*=.6;p.vz*=.6}glow(p.x,p.y,p.z,mul(p.c,clamp(p.life/p.ml*1.5,0,1)),p.s)}
 GM.fx=GM.fx.filter(p=>p.life>0);if(GM.fx.length>600)GM.fx.splice(0,GM.fx.length-600);
 for(const s of GM.sky){s.life-=dt;const k=clamp(s.life/.2,0,1);beam(s.a,s.b,s.w*(.6+k),mul(s.c,k),s.zig==null?.35:s.zig,s.seed||1)}GM.sky=GM.sky.filter(s=>s.life>0)}
// ---- снежки: метка на земле, дуга, заморозка ----
function throwAt(x,y,z,tx,tz){const b=GM.bur;const lead=b?[(GM.tgt.x-b.x),(GM.tgt.z-b.z)]:[0,0];const L=Math.hypot(lead[0],lead[1]);const k=L>.1?Math.min(1.2,L)/L:0;GM.sb.push({x,y,z,tx:clamp(tx+lead[0]*k*.6,BND.x0,BND.x1),tz:clamp(tz+lead[1]*k*.6,BND.z0,BND.z1),t:0,dur:1.25});SFX3.throw()}
function frostBuran(){if(!GM.bur||GM.frostT>0)return;GM.frostT=1.1;A3.frost=1;SFX3.frost();vib([30,30,30]);if(!GM.said.frost){GM.said.frost=1;say('frost').catch(()=>{})}}
function sbUpd(dt){const b=GM.bur;for(const s of GM.sb){s.t+=dt*(GM.calm<1?.75:1);const f=Math.min(1,s.t/s.dur);
  ring(s.tx,s.tz,1.25*(1.2-f*.4),[1*(.4+f*.6),.35,.4],1,-T*2);lightPool(s.tx,s.tz,1.2,[.25*f,.05,.08],.8);
  const x=lerp(s.x,s.tx,f),z=lerp(s.z,s.tz,f),y=lerp(s.y,.4,f)+Math.sin(f*Math.PI)*3.2;glow(x,y,z,[.9,.95,1],.9);shadow(x,z,.35,.4);
  if(f>=1){s.dead=true;for(let i=0;i<14;i++)GM.fx.push({x:s.tx,y:.3,z:s.tz,vx:rnd(-3,3),vy:rnd(1,4),vz:rnd(-2,2),g:9,life:.5,ml:.5,c:[.85,.9,1],s:.45});if(b&&Math.hypot(b.x-s.tx,b.z-s.tz)<1.25)frostBuran();else if(b&&!GM.said.dodgeok&&Math.hypot(b.x-s.tx,b.z-s.tz)<3){GM.said.dodgeok=1}}}
 GM.sb=GM.sb.filter(s=>!s.dead)}
// ---- опасные зоны (ледяные волны, кулак): предупреждение → удар ----
function hazard(o){GM.hz.push(Object.assign({t:0,warn:1.4,act:.6},o))}
function hzUpd(dt){const b=GM.bur;let si=0;for(const h of GM.hz){h.t+=dt;const warn=h.t<h.warn,f=clamp(h.t/h.warn,0,1);
  if(h.kind==='stripe'){const a=warn?.25+.35*f+.2*Math.sin(T*18):.9;stripe(h.x,h.z,h.len,h.w,h.rot||0,mul([.3,.6,1],a),1);
   if(!warn){const g=clamp((h.t-h.warn)/.18,0,1)*(1-clamp((h.t-h.warn-h.act+.15)/.15,0,1));const n=Math.round(h.len/1.1);const cs=Math.cos(h.rot||0),sn=Math.sin(h.rot||0);
    for(let i=0;i<n;i++){const u=(i/(n-1)-.5)*h.len;const px=h.x+u*cs,pz=h.z+u*sn;instAdd(SPIK,px+Math.sin(i*7.3)*.2,.75*g-.4*(1-g),pz+Math.cos(i*3.1)*.2,1,g*(1+Math.sin(i*5.1)*.3),1)}
    if(!h.hitDone&&b){const lx=(b.x-h.x)*cs+(b.z-h.z)*sn,lz=-(b.x-h.x)*sn+(b.z-h.z)*cs;if(Math.abs(lx)<h.len/2&&Math.abs(lz)<h.w/2+.3){h.hitDone=1;frostBuran()}}
    if(!h.snd){h.snd=1;SFX3.shield();cshake(.4)}}}
  else if(h.kind==='circle'){const r=h.r;ring(h.x,h.z,r*(warn?1.4-.4*f:1),mul([1,.5,.4],warn?.5+.5*f:1),1,T*3);lightPool(h.x,h.z,r,[.35*f,.1,.1],.8);
   if(!warn&&!h.snd){h.snd=1;SFX3.boom();cshake(1.2);for(let i=0;i<26;i++)GM.fx.push({x:h.x,y:.3,z:h.z,vx:rnd(-6,6),vy:rnd(2,6),vz:rnd(-4,4),g:10,life:.6,ml:.6,c:CL.ice,s:.6});GM.fx.push({ring:1,x:h.x,z:h.z,life:.5,ml:.5,r:r*1.6,c:CL.ice});if(b&&Math.hypot(b.x-h.x,b.z-h.z)<r)frostBuran()}
   if(!warn&&h.fist){const g=clamp((h.t-h.warn)/.12,0,1);instAdd(BALLS,h.x,lerp(8,.6,g),h.z,.9,.9,.9)}}}
 GM.hz=GM.hz.filter(h=>h.t<h.warn+h.act)}
// ---- главное обновление ----
function gameUpd(dt,rdt){GM.gt+=dt;burUpd(dt,rdt);enUpd(dt);boltUpd(dt);sbUpd(dt);hzUpd(dt);fxUpd(dt);coneUpd(dt);towersUpd(dt);flyUpd(rdt);if(GM.extra)GM.extra(dt,rdt);if(GM.q){GM.qT+=rdt;if(GM.qT>9&&!GM.said.slow&&!talk){GM.said.slow=1;say('slow').catch(()=>{})}}}
// ---- башни-кристаллы (стреляют по врагам) ----
function tower(x,z,c){const t={x,z,c,h:0,fireT:rnd(.5,1.5)};GM.towers.push(t);return t}
function towersUpd(dt){GM.towers.forEach((t,i)=>{t.h=Math.min(1,t.h+dt*1.5);const e=ease(t.h);instAdd(PADS,t.x,.16,t.z,1,1,1);instAdd(XTAL,t.x,.4+1.1*e,t.z,.75*e,2.2*e,.75*e,null,mul(t.c,1.4));lightPool(t.x,t.z,2.2,mul(t.c,.35),.9);glow(t.x,.5+2.2*e,t.z,t.c,1.4+Math.sin(T*4+i)*.3);
 t.fireT-=dt;if(t.fireT<=0&&e>.9){const en=nearest(t.x,t.z,11);t.fireT=en?1.5:.3;if(en){GM.sky.push({a:[t.x,2.6,t.z],b:[en.x,en.y+1,en.z],life:.22,c:t.c,w:.22,zig:0});hit(en,1,t.c);SFX3.laser()}}})}
// ---- секреты: золотая шишка, луна, северное сияние ----
function placeCone(){if(GM.cone)return;const b=GM.bur;let x,z;do{x=rnd(-8.5,8.5);z=rnd(-4,4.5)}while(b&&Math.hypot(x-b.x,z-b.z)<4);GM.cone={x,z,a:actor('cone',.95,{x,z,tint:[1.5,1.15,.45],breath:0,sh:.8})}}
function coneUpd(dt){const c=GM.cone;if(!c||c.got)return;c.a.lift=.25+Math.sin(T*3)*.15;c.a.tilt=Math.sin(T*2)*.15;glow(c.x,.7+c.a.lift,c.z-.05,mul(CL.gold,.9),2.2);if(Math.random()<.25)glow(c.x+rnd(-.5,.5),rnd(.3,1.6),c.z,CL.gold,.3);lightPool(c.x,c.z,1.3,[.4,.3,.08],1);
 const b=GM.bur;if(b&&Math.hypot(b.x-c.x,b.z-c.z)<1.2){c.got=1;actorKill(c.a);SV.cones[GM.lvl-1]=1;save();SFX.coin();SFX3.stars();vib(40);for(let i=0;i<30;i++)GM.fx.push({x:c.x,y:1,z:c.z,vx:rnd(-4,4),vy:rnd(2,7),vz:rnd(-3,3),g:7,life:.9,ml:.9,c:CL.gold,s:.5});say('cone').catch(()=>{})}}
function moonTap(x,y){if(GM.moonUsed||!GM.bur)return false;const p=proj(MOON.position.x,MOON.position.y,MOON.position.z);const r=pxPerUnit(MOON.position.x,MOON.position.y,MOON.position.z)*2.6;if(Math.hypot(x-p.x,y-p.y)>Math.max(r,50))return false;
 GM.moonUsed=true;SV.sec.moon=1;save();SFX3.stars();say('moon').catch(()=>{});
 for(let i=0;i<26;i++){setTimeout(()=>{if(!GM.bur)return;const e=GM.en.filter(e=>!e.dead)[i%Math.max(1,GM.en.length)];const tx=e?e.x:rnd(-9,9),tz=e?e.z:rnd(-6,4);GM.sky.push({a:[tx-6,22,tz-14],b:[tx,e?e.y+1:0,tz],life:.4,c:[1,.95,.6],w:.25,zig:.2,seed:i});if(e)hit(e,2,CL.gold);for(let k=0;k<6;k++)GM.fx.push({x:tx,y:.4,z:tz,vx:rnd(-3,3),vy:rnd(2,5),vz:rnd(-2,2),g:8,life:.6,ml:.6,c:CL.gold,s:.45})},i*90)}return true}
function superVolley(){A3.aur=2.2;SV.sec.aur=1;save();SFX3.thunder();SFX3.power();say('aur').catch(()=>{});
 const ens=GM.en.filter(e=>!e.dead);ens.forEach((e,i)=>setTimeout(()=>{if(e.dead)return;GM.sky.push({a:[e.x*.5+rnd(-4,4),21,-30],b:[e.x,e.y+1,e.z],life:.5,c:[.4,1,.7],w:.6,zig:.5,seed:i*3});kill(e);cshake(.6)},250+i*140));
 for(let i=0;i<8;i++)setTimeout(()=>{GM.sky.push({a:[rnd(-20,20),21,-30],b:[rnd(-9,9),0,rnd(-6,3)],life:.4,c:[.5,.6,1],w:.45,zig:.6,seed:i*7})},i*110)}
// ---- вопросы и лоток зарядов ----
// q: {opts:[{v}|{icon}], ans, target()->[x,y,z], hint, miss[]} или {pick:[{id,box()}], ans:id}
function ask(q){GM.q=q;q.tries=0;GM.qT=0;GM.calm=.35;GM.tray=(q.opts||[]).map((o,i)=>({o,i,dim:0,t0:T+i*.08}));return new Promise(r=>q.res=r)}
function trayXY(i){const n=GM.tray.length,d=trayD();return{x:640+(i-(n-1)/2)*(d+30),y:safeB()-d/2-10}}
function trayD(){return 138}
function chooseOpt(i){const q=GM.q;if(!q||GM.fly||!q.opts)return;const s=GM.tray[i];if(!s)return;const p=trayXY(i);GM.fly={i,x0:p.x,y0:p.y,t:0,dur:.42,back:0};SFX3.throw();vib(15)}
function flyUpd(rdt){const f=GM.fly;if(!f)return;f.t+=rdt;const q=GM.q;if(!q){GM.fly=null;return}
 if(f.back){if(f.t>=f.dur){GM.fly=null}return}
 if(f.t>=f.dur){const ok=f.i===q.ans;if(ok){GM.fly=null;answer(true,f.i)}else{f.back=1;f.t=0;f.dur=.5;answer(false,f.i)}}}
function flyDraw(){const f=GM.fly,q=GM.q;if(!f||!q)return;const tp=q.target();const pt=proj(tp[0],tp[1],tp[2]);const p0=trayXY(f.i);let u=clamp(f.t/f.dur,0,1),x,y,s;
 if(!f.back){u=u*u*(3-2*u);x=lerp(f.x0,pt.x,u);y=lerp(f.y0,pt.y,u)-Math.sin(u*Math.PI)*120;s=lerp(1,.55,u)}else{u=ease(u);x=lerp(pt.x,p0.x,u);y=lerp(pt.y,p0.y,u)-Math.sin(u*Math.PI)*160;s=lerp(.55,1,u)}
 coreDraw(GM.tray[f.i].o,x,y,trayD()*s,f.back?(1-u)*6:f.t*14)}
function answer(ok,i){const q=GM.q;const tp=q.target();if(!ok)GM.mist=(GM.mist||0)+1;
 if(ok){q.done=true;GM.q=null;GM.tray=[];GM.calm=1;GM.qT=0;slowmo(1.05);punch(.55);vib(45);SFX.ok();SFX3.chime(GM.stepN);A3.flash=.35;
  for(let k=0;k<40;k++)GM.fx.push({x:tp[0],y:tp[1],z:tp[2],vx:rnd(-6,6),vy:rnd(-1,7),vz:rnd(-4,4),g:6,life:rnd(.5,1),ml:1,c:[CL.gold,CL.cy,CL.wht][k%3],s:rnd(.3,.7)});GM.fx.push({ring:1,x:tp[0],z:tp[2],life:.6,ml:.6,r:3.5,c:CL.gold});
  pose('shustrik','cheer',1.4);hop('shustrik');
  if(q.tries===0){GM.streak++;if(GM.streak>=3){GM.streak=0;setTimeout(superVolley,700)}}else GM.streak=0;
  q.res(true)}
 else{q.tries++;GM.streak=0;GM.tray[i].dim=1;SFX3.sneeze();vib(20);pose('shustrik','think',3);oops('shustrik');for(let k=0;k<16;k++)GM.fx.push({x:tp[0],y:tp[1],z:tp[2],vx:rnd(-3,3),vy:rnd(0,4),vz:rnd(-2,2),g:6,life:.5,ml:.5,c:[.8,.85,1],s:.45});
  const ml=['miss1','miss2','miss3'][(q.tries-1)%3];sayNow(q.tries>=2&&q.hint?q.hint:ml);if(q.onMiss)q.onMiss(i)}}
function pickAt(x,y){const q=GM.q;if(!q||!q.pick)return false;let best=null,bd=1e9;for(const it of q.pick){const b=it.box();const pad=Math.max(0,30-(b[2]-b[0])/2);if(x>b[0]-pad&&x<b[2]+pad&&y>b[1]-pad&&y<b[3]+pad){const d=Math.hypot((x-(b[0]+b[2])/2)/(b[2]-b[0]+1),(y-(b[1]+b[3])/2)/(b[3]-b[1]+1));if(d<bd){bd=d;best=it}}}if(best){pickRes(best);return true}return false}
function pickRes(it){const q=GM.q;const c=it.c3?it.c3():[0,1,0];if(it.id===q.ans){q.target=()=>c;answer(true,0)}else{GM.mist=(GM.mist||0)+1;q.target=()=>c;q.tries++;GM.streak=0;SFX3.sneeze();vib(20);pose('shustrik','think',3);oops('shustrik');it.wob=T;sayNow(q.tries>=2&&q.hint?q.hint:['miss1','miss2','miss3'][(q.tries-1)%3]);if(q.onMiss)q.onMiss(it.id)}}
// ---- отрисовка оверлея: заряды, таблички с числами, гирлянда прогресса ----
const ICON={r:'ball_r',g:'ball_g',b:'ball_b',s:'star',l:'bell'};
function coreDraw(o,x,y,d,rot,a){X.save();X.translate(x,y);if(a!=null)X.globalAlpha=a;const g=X.createRadialGradient(0,0,d*.2,0,0,d*.62);g.addColorStop(0,'rgba(120,220,255,.55)');g.addColorStop(1,'rgba(120,220,255,0)');X.fillStyle=g;X.beginPath();X.arc(0,0,d*.62,0,7);X.fill();
 X.rotate(rot||0);sprW('core',0,0,d);X.rotate(-(rot||0));
 if(o.icon)spr(ICON[o.icon],0,o.icon==='s'||o.icon==='l'?0:d*.03,d*.6);else{const s=String(o.v).length>1?d*.44:d*.5;txt(String(o.v),0,d*.02,s,'#fff',{f:NUM,st:'#0a2a5a',lw:s*.2,box:[-d*.4,-d*.4,d*.4,d*.4],id:'core'})}X.restore()}
function trayDraw(){if(!GM.q||!GM.q.opts)return;const d=trayD();
 GM.tray.forEach((s,i)=>{if(GM.fly&&GM.fly.i===i)return;const p=trayXY(i);const k=ease(clamp((T-s.t0)/.3,0,1));const drag=GM.drag&&GM.drag.i===i&&GM.drag.moved;const x=drag?GM.drag.x:p.x,y=drag?GM.drag.y:p.y+Math.sin(T*3+i)*4;
  X.globalAlpha=.5;X.fillStyle='#071a3a';X.beginPath();X.ellipse(p.x,p.y+d*.46,d*.42,d*.1,0,0,7);X.fill();X.globalAlpha=1;
  coreDraw(s.o,x,y,d*k,Math.sin(T*1.5+i)*.08,s.dim?.55:1);UI.push({id:'opt'+i,x:p.x,y:p.y,w:d,h:d,fn:()=>{},tray:1})})}
// табличка с числом над объектом в мире
function numTag(x,y,z,t,o){o=o||{};const p=proj(x,y,z);if(!p.ok)return null;const size=Math.max(o.min||46,(o.k||1)*pxPerUnit(x,y,z)*(o.u||.9));const s=String(t);X.font=size+'px '+NUM;const w=Math.max(size*.95,X.measureText(s).width+size*.55),h=size*1.12;
 X.save();X.translate(p.x,p.y);if(o.wob)X.rotate(Math.sin(T*25)*.1*o.wob);X.fillStyle=o.bg||'rgba(8,26,64,.82)';X.strokeStyle=o.rim||'#9fe6ff';X.lineWidth=Math.max(3,size*.08);X.beginPath();X.roundRect(-w/2,-h/2,w,h,h*.3);X.fill();X.stroke();
 txt(s,0,size*.04,size,o.col||'#fff',{f:NUM,st:o.st||'#04142e',lw:size*.14,box:[-w/2,-h/2,w/2,h/2],id:o.id||'num'});X.restore();return{x:p.x,y:p.y,w,h}}
function qTag(x,y,z,o){o=o||{};const p=proj(x,y,z);const size=Math.max(o.min||50,pxPerUnit(x,y,z)*(o.u||1));X.save();X.translate(p.x,p.y);const k=1+Math.sin(T*6)*.08;X.scale(k,k);const g=X.createRadialGradient(0,0,0,0,0,size);g.addColorStop(0,'rgba(255,230,120,.75)');g.addColorStop(1,'rgba(255,200,80,0)');X.fillStyle=g;X.beginPath();X.arc(0,0,size,0,7);X.fill();
 txt('?',0,size*.04,size,'#fff3b0',{f:NUM,st:'#5a3000',lw:size*.15,box:[-size*.6,-size*.6,size*.6,size*.6],id:'q'});X.restore()}
function garlandHUD(){const n=GM.steps;if(!n)return;DOTSN=n;const r=dotR(n),y=safeT()+44;const x1=safeR()-8;X.strokeStyle='#2e5a2a';X.lineWidth=4;X.beginPath();for(let i=0;i<n;i++){const x=x1-(n-i-.5)*r*2.3;const yy=y+Math.sin(i*1.3)*3;i?X.lineTo(x,yy-r*.9):X.moveTo(x-r,yy-r*.9)}X.stroke();
 const cols=['#ff4a5a','#4aff7a','#4aa8ff','#ffd84a','#ff7ae8'];for(let i=0;i<n;i++){const x=x1-(n-i-.5)*r*2.3,yy=y+Math.sin(i*1.3)*3;const on=i<GM.stepN;if(on){const g=X.createRadialGradient(x,yy,0,x,yy,r*1.8);g.addColorStop(0,cols[i%5]);g.addColorStop(1,'rgba(0,0,0,0)');X.globalAlpha=.6+.3*Math.sin(T*4+i);X.fillStyle=g;X.beginPath();X.arc(x,yy,r*1.8,0,7);X.fill();X.globalAlpha=1}
  X.fillStyle=on?cols[i%5]:'#24324e';X.strokeStyle=on?'#fff':'#5a6a8a';X.lineWidth=2;X.beginPath();X.ellipse(x,yy,r*.7,r*.85,0,0,7);X.fill();X.stroke();X.fillStyle='#8a8f9a';X.fillRect(x-r*.3,yy-r*1.05,r*.6,r*.3)}}
// ---- ввод на арене: тянуть Бурана, бросать заряд, тап по луне/целям ----
function uiHit(x,y){for(const b of UI){if(b.tray)continue;if(Math.abs(x-b.x)<b.w/2+6&&Math.abs(y-b.y)<b.h/2+6)return true}return false}
function trayHit(x,y){if(!GM.q||!GM.q.opts)return -1;const d=trayD();for(let i=0;i<GM.tray.length;i++){const p=trayXY(i);if(Math.hypot(x-p.x,y-p.y)<d*.55)return i}return -1}
const ARENA_IN={
 hold(id,x,y){if(uiHit(x,y))return;if(talk&&talk.box){const[bx,by,bw,bh]=talk.box;if(x>bx&&x<bx+bw&&y>by&&y<by+bh)return}
  const ti=trayHit(x,y);if(ti>=0&&!GM.fly){GM.drag={id,i:ti,x,y,x0:x,y0:y,moved:false};return}
  if(pickAt(x,y))return;if(moonTap(x,y))return;if(GM.bur&&!GM.steer)GM.steer={id,x,y}},
 move(id,x,y){if(GM.drag&&GM.drag.id===id){GM.drag.x=x;GM.drag.y=y;if(Math.hypot(x-GM.drag.x0,y-GM.drag.y0)>18)GM.drag.moved=true}if(GM.steer&&GM.steer.id===id){GM.steer.x=x;GM.steer.y=y}},
 up(id){if(GM.drag&&GM.drag.id===id){const d=GM.drag;GM.drag=null;const p=trayXY(d.i);if(!d.moved||d.y<p.y-trayD()*.6){chooseOpt(d.i);if(d.moved&&GM.fly){GM.fly.x0=d.x;GM.fly.y0=d.y}}}if(GM.steer&&GM.steer.id===id)GM.steer=null}};
// тестовый интерфейс
G.mist=()=>GM.mist||0;G.lv=()=>({done:!!LV.done});G.moon=()=>{const p=proj(MOON.position.x,MOON.position.y,MOON.position.z);return{p,pg:G.pg(p.x,p.y),used:!!GM.moonUsed}};G.q=()=>GM.q&&{tries:GM.q.tries,opts:GM.q.opts,ans:GM.q.ans,pick:GM.q.pick&&GM.q.pick.map(p=>({id:p.id,b:p.box()}))};
G.trayPg=i=>{const p=trayXY(i);return G.pg(p.x,p.y)};G.killAll=()=>killAll();G.gm=()=>({en:GM.en.length,stepN:GM.stepN,steps:GM.steps,cones:SV.cones,bur:GM.bur&&{x:GM.bur.x,z:GM.bur.z},q:!!GM.q,fly:!!GM.fly});
G.burTo=(x,z)=>{if(GM.bur){GM.bur.x=x;GM.bur.z=z;GM.tgt={x,z}}};G.coneAt=()=>GM.cone&&!GM.cone.got&&{x:GM.cone.x,z:GM.cone.z};
G.actors=()=>ACT.filter(a=>a.m.visible).map(a=>{const im=IM[a.key];const ar=okI(im)?im.naturalWidth/im.naturalHeight:0;const s=a.m.scale;return{k:a.key,y:a.y+a.lift,ar,sar:Math.abs(s.x)/s.y,foot:proj(a.x,a.y+a.lift,a.z),top:proj(a.x,a.y+a.lift+s.y,a.z)}});
