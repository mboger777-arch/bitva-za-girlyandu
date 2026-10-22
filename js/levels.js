'use strict';
// ===== Уровни 1–5: общий каркас + свои механики =====
let LV={};
const TOWERS=[[-7,-6.5],[7,-6.5],[-10,-2.5],[10,-2.5],[-3.6,-8.6]];
const GOALS={1:'Какой огонёк следующий?',2:'Какое число на последнем дроне?',3:'Найди ошибку в колонне!',4:'Какое число на последнем щите?',5:'Заполни таблицу-крепость!'};
function lvlScene(n,o){SC['l'+n]={
 enter(){GM.lvl=n;GM.stepN=0;GM.steps=o.steps;GM.kills=0;LV={n};world(o.world||{});GM.gt=0;
  cast=[hero('shustrik',LEFT(105),{base:'orb',h:215})];o.setup&&o.setup();musStart('game',o.bpm||132,1);
  CAMR.pos.set(0,15,24);CAMR.look.set(0,3,-8);camTo(CAM_GAME[0],CAM_GAME[1],1.4);
  run(async()=>{await wait(600);await o.run();await lvlWin(n,o.win)})},
 draw(){if(o.draw)o.draw();if(LV.done)winDraw();drawCast();trayDraw();flyDraw();garlandHUD()},
 ui(){if(LV.done)boardBtn('next',RIGHT(150),safeB()-70,280,'Дальше',()=>go(n<5?'map':'map'),{pulse:1})},
 hold:ARENA_IN.hold,move:ARENA_IN.move,up:ARENA_IN.up,
 onHero(h){if(h==='shustrik'&&GM.q&&GM.q.hint&&!talk){sayNow(GM.q.hint);return true}}}}
// шаг решён: огонёк на ёлку, прогресс, шишка после 2-го шага
function stepDone(){GM.stepN++;const t=TREE3.a;const b=GM.bur;if(t){for(let i=0;i<6;i++)GM.fx.push({home:1,x:b?b.x:0,y:2,z:b?b.z:0,tx:t.x+rnd(-1.5,1.5),ty:rnd(2,7),tz:t.z+.3,life:.9+i*.08,ml:.9+i*.08,c:[[1,.3,.3],[.3,1,.5],[.4,.6,1],[1,.85,.3]][i%4],s:.8})}
 setTimeout(()=>{TREE3.lit=GM.stepN/GM.steps;SFX.clink()},900);if(GM.stepN===2&&!SV.cones[GM.lvl-1])placeCone()}
async function lvlWin(n,key){GM.q=null;GM.tray=[];killAll();LV.done=1;TREE3.lit=1;SV.stars[n-1]=3;SV.open=Math.max(SV.open,Math.min(6,n+1));save();cheer();SFX.star();A3.flash=.5;GOAL='';
 for(let i=0;i<5;i++)setTimeout(()=>firework(rnd(-7,7),rnd(5,9),rnd(-9,-4)),i*350);await say(key);await say('win')}
function firework(x,y,z){const c=[[1,.4,.4],[.4,1,.6],[.5,.7,1],[1,.9,.4],[1,.5,1]][Math.floor(Math.random()*5)];for(let i=0;i<40;i++){const a=Math.random()*6.28,b=Math.random()*3.14,v=rnd(3,6);GM.fx.push({x,y,z,vx:Math.cos(a)*Math.sin(b)*v,vy:Math.cos(b)*v,vz:Math.sin(a)*Math.sin(b)*v,g:2,life:rnd(.8,1.3),ml:1.3,c,s:.45})}SFX3.chime(Math.floor(rnd(3,7)))}
function winDraw(){if(Math.random()<.02)firework(rnd(-8,8),rnd(5,9),rnd(-10,-4))}
function opts3(ans,cands){const o=[ans];for(const c of cands)if(!o.includes(c)&&o.length<3)o.push(c);return shuffle(o)}
function numOpts(ans,d){const L=[ans+1,ans-1,ans+d,ans-d,ans+2,ans+10,ans-2].filter(v=>v>0&&v!==ans);return opts3(ans,L)}
// ===== Уровень 1: гирлянда-башни (узор из огоньков) =====
const L1P=[['r','g','r','g','r','g'],['r','r','b','r','r','b'],['r','g','b','r','g','b'],['s','l','l','s','l','l'],['g','g','r','r','g','g','r']];
const ICOL={r:CL.red,g:CL.grn,b:CL.blu,s:CL.gold,l:[.85,.9,1]};
lvlScene(1,{steps:5,win:'a_win',
 setup(){LV.pads=[];LV.balls=[];GM.extra=l1Upd},
 async run(){await say('move');await say('a_in');
  for(let s=0;s<5;s++){const P=L1P[s],n=P.length,sp=Math.min(2.5,13/(n-1));LV.pads=P.map((c,i)=>({x:(i-(n-1)/2)*sp,z:-3.4,c}));LV.balls.forEach(b=>actorKill(b.a));LV.balls=[];
   for(let i=0;i<n-1;i++){l1Ball(i,P[i]);SFX3.chime(i);await wait(260)}
   wave(s<2?['drone']:['drone','bot'],1.4);GOAL=GOALS[1];
   if(s===0)say('a_how').catch(()=>{});
   const ans=P[n-1];const all=s===3?['l','s','r']:['r','g','b'];const opts=opts3(ans,shuffle(all.slice()).filter(c=>c!==ans)).map(c=>({icon:c}));
   await ask({opts,ans:opts.findIndex(o=>o.icon===ans),target:()=>[LV.pads[n-1].x,1.1,LV.pads[n-1].z],hint:'a_hint'});
   l1Ball(n-1,ans,true);GOAL='';stepDone();
   // огоньки пробегают по ряду, вырастает башня, залп
   LV.wave=T;const tw=TOWERS[s];tower(tw[0],tw[1],ICOL[ans]);
   setTimeout(()=>{GM.towers.forEach(t=>{GM.en.filter(e=>!e.dead).forEach((e,j)=>setTimeout(()=>{if(e.dead)return;GM.sky.push({a:[t.x,2.6,t.z],b:[e.x,e.y+1,e.z],life:.3,c:t.c,w:.3,zig:0});kill(e)},j*120))});SFX3.laser()},700);
   await say('a_ok'+(s+1));
   wave(s===4?['bot','drone','bot','drone']:['drone','bot','drone'].slice(0,2+(s>1?1:0)),1.1);await waveDone(2);if(s<4)say('clear').catch(()=>{})}},
 draw(){if(LV.pads)LV.pads.forEach((p,i)=>{if(i===LV.pads.length-1&&!LV.balls.find(b=>b.i===i)&&GM.q)qTag(p.x,1.1,p.z,{u:1.1})})}});
function l1Ball(i,c,last){const p=LV.pads[i];const a=actor(ICON[c],c==='s'||c==='l'?1.1:1.0,{x:p.x,z:p.z,y:last?.4:6,breath:0,sh:.7});LV.balls.push({i,a,vy:0,c,land:last?1:0})}
function l1Upd(dt){if(!LV.pads)return;LV.pads.forEach((p,i)=>{instAdd(PADS,p.x,.16,p.z,.8,1,.8);const b=LV.balls.find(b=>b.i===i);const on=b&&b.land;lightPool(p.x,p.z,1.4,on?mul(ICOL[b.c],.4):[.05,.12,.25],1);if(!b)ring(p.x,p.z,.95,mul(CL.gold,.6+.4*Math.sin(T*6)),1,T)});
 for(const b of LV.balls){const a=b.a;if(!b.land){b.vy-=30*dt;a.y+=b.vy*dt;if(a.y<=.38){a.y=.38;b.vy=0;b.land=1;SFX.pop();for(let k=0;k<8;k++)GM.fx.push({x:a.x,y:.4,z:a.z,vx:rnd(-2,2),vy:rnd(1,3),vz:rnd(-1,1),g:8,life:.4,ml:.4,c:ICOL[b.c],s:.35})}}
  const pulse=LV.wave&&T-LV.wave<1.5?Math.max(0,1-Math.abs((T-LV.wave)*6-b.i)):0;a.lift=pulse*.5;glow(a.x,a.y+.55+a.lift,a.z+.1,mul(ICOL[b.c],.55+pulse),1.6+pulse*2)}}
// ===== Уровень 2: строй дронов (числа растут) =====
const L2Q=[[3,4,5,6],[2,4,6,8],[1,3,5,7],[10,11,12,13],[6,8,10,12],[11,13,15,17]];
lvlScene(2,{steps:6,win:'b_win',
 setup(){LV.f=[];GM.extra=l2Upd},
 async run(){await say('b_in');
  for(let s=0;s<6;s++){const Q=L2Q[s];LV.f.forEach(d=>actorKill(d.a));LV.f=Q.map((v,i)=>({v,i,x:(i-1.5)*3.1,z:-5.6,y:2.6,a:actor('drone',1.6,{x:(i-1.5)*3.1,z:-17,y:5,breath:.01}),show:i<3,dead:0,t0:T+i*.12}));LV.shield=1;
   wave(['bot'],1);await wait(1400);GOAL=GOALS[2];await say('b_q'+(s+1));
   const d=Q[3]-Q[2];const opts=numOpts(Q[3],d).map(v=>({v}));
   await ask({opts,ans:opts.findIndex(o=>o.v===Q[3]),target:()=>{const f=LV.f[3];return[f.x,f.y+.8,f.z]},hint:'b_hint'});
   LV.f[3].show=1;LV.shield=0;GOAL='';stepDone();SFX3.thunder();
   // цепная молния: Буран → дрон 1 → 2 → 3 → 4
   const b=GM.bur;let prev=[b.x,2.3,b.z];for(let i=0;i<4;i++){const f=LV.f[i];const cur=[f.x,f.y+.8,f.z];const pv=prev;setTimeout(()=>{GM.sky.push({a:pv,b:cur,life:.5,c:[.6,.85,1],w:.4,zig:.45,seed:i*5});f.dead=1;f.a.flash=2;SFX3.boom();cshake(.6);for(let k=0;k<26;k++)GM.fx.push({x:f.x,y:f.y+.8,z:f.z,vx:rnd(-5,5),vy:rnd(-1,6),vz:rnd(-3,3),g:8,life:.8,ml:.8,c:[CL.cy,CL.wht,CL.gold][k%3],s:.5})},150+i*170);prev=cur}
   await say('b_ok'+(s+1));wave(['bot','bot','drone'].slice(0,2+(s%2)),1);await waveDone(1.5)}},
 draw(){if(!LV.f)return;LV.f.forEach(f=>{if(f.dead)return;const p=[f.x,f.y-.25,f.z];if(f.show)numTag(p[0],p[1],p[2],f.v,{u:.95,min:54});else if(GM.q)qTag(p[0],p[1]+.6,p[2],{u:1.1,min:60})})}});
function l2Upd(dt){if(!LV.f)return;LV.f.forEach((f,i)=>{const a=f.a;if(f.dead){a.alpha=Math.max(0,a.alpha-dt*4);a.y-=dt*4;return}const k=ease(clamp((T-f.t0)/1.3,0,1));a.x=f.x;a.z=lerp(-17,f.z,k);a.y=lerp(5,f.y,k)+Math.sin(T*2.5+i)*.15;f.y=2.6;
  glow(a.x,a.y+.8,a.z+.1,CL.cy,1.1);if(LV.shield&&k>.9){ring(a.x,a.z,1.3,mul(CL.cy,.4),1,T*2);if(i<3){const g=LV.f[i+1].a;GM.sky.push({a:[a.x,a.y+.8,a.z],b:[g.x,g.y+.8,g.z],life:.03,c:[.25,.55,1],w:.18,zig:.12,seed:i})}}})}
// ===== Уровень 3: колонна роботов (самозванец и пропуск) =====
const L3Q=[{k:'imp',v:[2,4,6,7,10],a:3,fix:8},{k:'gap',v:[5,10,null,20,25],a:2,ans:15},{k:'imp',v:[10,20,30,35,50],a:3,fix:40},{k:'gap',v:[2,4,6,null,10],a:3,ans:8},{k:'imp',v:[1,2,3,4,6],a:4,fix:5},{k:'gap',v:[10,20,null,40,50],a:2,ans:30}];
lvlScene(3,{steps:6,win:'c_win',
 setup(){LV.c=[];GM.extra=l3Upd},
 async run(){await say('c_in');
  for(let s=0;s<6;s++){const Q=L3Q[s];LV.c.forEach(c=>c.a&&actorKill(c.a));LV.c=Q.v.map((v,i)=>({v,i,x:(i-2)*2.9,z:-3.9,a:v==null?null:actor('bot',2.1,{x:-20,z:-3.9,breath:.012}),t0:T+i*.15,wob:0}));
   wave(['thief'],1);await wait(1600);GOAL=Q.k==='imp'?'Нажми на робота-самозванца!':'Какое число пропало?';
   await say(Q.k==='imp'?'c_imp':'c_gap');
   if(Q.k==='imp'){await ask({pick:LV.c.map(c=>({id:c.i,box:()=>{const a=c.a,f=projA(a,0),t=projA(a,1.05);const w=(f.y-t.y)*.55;return[f.x-w/2,t.y,f.x+w/2,f.y]},c3:()=>[c.a.x,1.2,c.a.z],get wob(){return 0},set wob(v){c.wob=v}})),ans:Q.a,target:()=>[0,1,-4],hint:'c_hint'});
    const c=LV.c[Q.a];const b=GM.bur;GM.sky.push({a:[b.x,2.3,b.z],b:[c.a.x,1.2,c.a.z],life:.4,c:CL.cy,w:.45,zig:0});SFX3.laser();boom3(c.a.x,1.2,c.a.z);actorKill(c.a);c.a=actor('bot',2.1,{x:c.x,z:c.z,y:7,breath:.012});c.drop=1;c.v=Q.fix;c.fixed=1}
   else{const opts=numOpts(Q.ans,Q.v[1]-Q.v[0]).map(v=>({v}));await ask({opts,ans:opts.findIndex(o=>o.v===Q.ans),target:()=>[LV.c[Q.a].x,1.2,LV.c[Q.a].z],hint:'c_hint'});
    const c=LV.c[Q.a];c.v=Q.ans;c.a=actor('bot',2.1,{x:c.x,z:c.z,breath:.012});c.a.flash=2;c.holo=T;c.fixed=1}
   GOAL='';stepDone();await wait(500);
   // колонна по правилу — цепной разлом
   for(const c of LV.c){setTimeout(()=>{if(!c.a)return;boom3(c.a.x,1.2,c.a.z);SFX3.chime(c.i+2);actorKill(c.a);c.a=null},c.i*200)}
   await say('c_ok'+(s+1));wave(['thief','bot','thief'].slice(0,2+(s%2)),1.1);await waveDone(1.5)}},
 draw(){if(!LV.c)return;LV.c.forEach(c=>{if(c.a){const k=clamp((T-c.t0)/1.2,0,1);if(k>.9)numTag(c.a.x,c.a.y+1.05+c.a.lift,c.a.z+.1,c.v,{u:.9,min:52,wob:c.wob&&T-c.wob<.6?1:0,bg:c.fixed?'rgba(20,90,50,.85)':null})}else if(c.v==null&&GM.q)qTag(c.x,1.2,c.z,{u:1.1,min:60})})}});
function boom3(x,y,z){SFX3.boom();cshake(.5);for(let k=0;k<24;k++)GM.fx.push({x,y,z,vx:rnd(-5,5),vy:rnd(0,6),vz:rnd(-3,3),g:9,life:.7,ml:.7,c:[CL.cy,CL.wht,CL.gold][k%3],s:.5});GM.fx.push({ring:1,x,z,life:.5,ml:.5,r:2.5,c:CL.ice})}
function l3Upd(dt){if(!LV.c)return;LV.c.forEach(c=>{if(!c.a){if(c.v==null)ring(c.x,c.z,1,mul(CL.gold,.5+.4*Math.sin(T*6)),1,T);return}const a=c.a;const k=ease(clamp((T-c.t0)/1.2,0,1));
  if(c.drop){a.y=Math.max(0,a.y-dt*14);if(a.y===0){c.drop=0;SFX.thump();cshake(.3)}}else{a.x=lerp(-20,c.x,k);a.lift=Math.abs(Math.sin(T*6+c.i))*.12}a.z=c.z;a.flip=false;
  if(c.wob&&T-c.wob<.6)a.tilt=Math.sin((T-c.wob)*30)*.08;else a.tilt=0;if(c.holo&&T-c.holo<1)a.tint=[.6,1.2,1.5];else a.tint=null;
  lightPool(a.x,a.z,1.2,c.fixed?[.1,.35,.15]:[.05,.15,.3],1)})}
// ===== Уровень 4: лавина и обратный отсчёт =====
const L4Q=[[10,8,6,4],[5,4,3,2],[20,15,10,5],[9,7,5,3],[18,16,14,12]];
const _qx=new T3.Quaternion(),_qf=new T3.Quaternion().setFromAxisAngle(new T3.Vector3(1,0,0),Math.PI/2);
lvlScene(4,{steps:5,win:'d_win',world:{tx:-8.6,tz:-7.2},bpm:138,
 setup(){LV.av=null;LV.sh=null;GM.put=actor('put_angry',4.3,{x:9.2,z:-8.6,y:1.15,breath:.012,flip:true});GM.extra=l4Upd},
 async run(){await say('d_in');await say('d_how');
  for(let s=0;s<5;s++){const Q=L4Q[s];
   LV.av={z:-18,tz:-7.4,b:Array.from({length:17},(_,i)=>({x:-7.5+i*.95+rnd(-.3,.3),dz:rnd(-1.6,.6),r:rnd(.9,1.45),rot:rnd(0,6)})),burst:0};SFX3.rumble();GM.put.key='put_laugh';setTimeout(()=>{if(GM.put)GM.put.key='put_angry'},1600);
   LV.sh=Q.map((v,i)=>({v,i,x:(i-1.5)*3.1,z:-4.3,y:1.6,on:i<3,t0:T+.8+i*.15}));
   await wait(1800);GOAL=GOALS[4];const d=Q[2]-Q[3];const opts=numOpts(Q[3],d).map(v=>({v}));
   await ask({opts,ans:opts.findIndex(o=>o.v===Q[3]),target:()=>[LV.sh[3].x,1.6,LV.sh[3].z],hint:'d_hint'});
   LV.sh[3].on=1;LV.sh.forEach(h=>h.fl=T);GOAL='';stepDone();SFX3.shield();
   // щиты бьют лучами в лавину — шары рассыпаются
   LV.av.b.forEach((b,i)=>setTimeout(()=>{if(!LV.av)return;b.dead=1;const x=b.x,z=LV.av.z+b.dz;const h=LV.sh[i%4];GM.sky.push({a:[h.x,1.6,h.z],b:[x,b.r,z],life:.25,c:CL.ice,w:.35,zig:.1});for(let k=0;k<12;k++)GM.fx.push({x,y:b.r,z,vx:rnd(-4,4),vy:rnd(1,6),vz:rnd(-3,3),g:9,life:.7,ml:.7,c:[.9,.95,1],s:.6});if(i%3===0){SFX3.boom();cshake(.4)}},200+i*70));
   await say('d_ok'+(s+1));LV.sh=null;LV.av=null;
   if(s<4){if(!GM.said.dd){GM.said.dd=1;await say('d_dodge')}GM.put.key='put_laugh';wave(['bot','bot'],1.5);
    for(let r=0;r<3;r++){const b=GM.bur;const xs=[b?b.x:0,rnd(-8,8)];xs.forEach(x=>hazard({kind:'stripe',x:clamp(x,-9,9),z:0,len:14,w:2.2,rot:Math.PI/2}));SFX3.frost();await wait(G.fast?60:2300)}
    GM.put.key='put_angry';await waveDone(.5)}}},
 draw(){if(LV.sh)LV.sh.forEach(h=>{if(T<h.t0+.3)return;if(h.on)numTag(h.x,h.y,h.z+.2,h.v,{u:.95,min:56,bg:'rgba(10,50,100,.85)'});else if(GM.q)qTag(h.x,h.y,h.z+.2,{u:1.1,min:60})})}});
function l4Upd(dt){// холм Путаника
 instAdd(BALLS,9.2,-.55,-8.8,3.4,1.7,2.4);const P=GM.put;if(P){P.lift=Math.sin(T*2)*.05;lightPool(P.x,P.z+1,3,[.1,.2,.4],1)}
 const av=LV.av;if(av){const was=av.z;av.z=lerp(av.z,av.tz,1-Math.exp(-dt*(GM.calm<1?.9:1.3)));const v=(av.z-was)/Math.max(dt,1e-4);
  for(const b of av.b){if(b.dead)continue;b.rot+=v*dt/b.r;_qx.setFromAxisAngle(new T3.Vector3(1,0,0),b.rot);instAdd(BALLS,b.x,b.r*.95,av.z+b.dz,b.r,b.r,b.r,_qx);shadow(b.x,av.z+b.dz+.3,b.r*1.1,.45);if(v>.5&&Math.random()<.3)GM.fx.push({x:b.x+rnd(-.5,.5),y:.2,z:av.z+b.dz+b.r,vx:rnd(-1,1),vy:rnd(1,3),vz:rnd(0,2),g:5,life:.6,ml:.6,c:[.7,.75,.85],s:.6})}
  if(v>.5&&Math.random()<.1)cshake(.25)}
 if(LV.sh)LV.sh.forEach(h=>{const k=ease(clamp((T-h.t0)/.5,0,1));if(k<=0)return;const fl=h.fl&&T-h.fl<.6?1-(T-h.fl)/.6:0;const c=h.on?mul([.45,.8,1],.7+fl):mul([1,.85,.4],.3+.25*Math.sin(T*6));
  instAdd(SHLD,h.x,h.y*k,h.z,1.25*k,1.25*k,1.25*k,_qf,c);lightPool(h.x,h.z+.4,1.8,mul(c,.35),1);if(!h.on)ring(h.x,h.z+.5,1,mul(CL.gold,.5),1,T)})}
// ===== Уровень 5: таблица-крепость =====
const TBL=[[1,2,3,4],[2,4,6,8],[5,10,15,20]];const TX5=[-4.8,-1.6,1.6,4.8],TZ5=[-6.7,-4.5,-2.3];
lvlScene(5,{steps:6,win:'e_win',
 setup(){LV.hid={'0,2':1,'1,3':1,'2,1':1,'2,3':1};LV.rows=[0,0,0];LV.rowT=[0,0,0];GM.extra=l5Upd},
 async run(){await say('e_in');await say('e_fill');
  const F=[[0,2,'e_ok1'],[1,3,'e_ok2'],[2,1,'e_ok3'],[2,3,'e_ok4']];
  for(let s=0;s<4;s++){const[r,c,k]=F[s];LV.cur=[r,c];wave(['thief','bot'].slice(0,1+(s>1?1:0)),1.2);GOAL='Какое число в пустой клетке?';
   const ans=TBL[r][c],d=TBL[r][1]-TBL[r][0];const opts=numOpts(ans,d).map(v=>({v}));
   await ask({opts,ans:opts.findIndex(o=>o.v===ans),target:()=>[TX5[c],.6,TZ5[r]],hint:'e_hint'});
   delete LV.hid[r+','+c];LV.cur=null;LV.cellFl=[r,c,T];GOAL='';stepDone();
   if(!Object.keys(LV.hid).some(h=>+h[0]===r))rowFire(r);await say(k);await waveDone(1)}
  wave(['thief','thief'],1.5);GOAL='Найди строку с правилом «+5»';await say('e_row');
  await ask({pick:[0,1,2].map(r=>({id:r,box:()=>rowBox(r),c3:()=>[0,.6,TZ5[r]]})),ans:2,target:()=>[0,.6,TZ5[2]],hint:'e_hint'});LV.rowHL=[2,T];GOAL='';stepDone();rowFire(2);await say('e_ok5');await waveDone(1);
  wave(['bot','thief'],1.5);GOAL='Строка 2, столбец 3: какое число?';await say('e_cell');
  const cells=[];for(let r=0;r<3;r++)for(let c=0;c<4;c++)cells.push({id:r*4+c,box:()=>cellBox(r,c),c3:()=>[TX5[c],.6,TZ5[r]]});
  await ask({pick:cells,ans:6,target:()=>[TX5[2],.6,TZ5[1]],hint:'e_hint'});LV.cellFl=[1,2,T];GOAL='';stepDone();rowFire(1);rowFire(0);await say('e_ok6');await waveDone(.5)},
 draw(){for(let c=0;c<4;c++)numTag(TX5[c],.2,TZ5[0]-2,c+1,{u:.6,min:34,bg:'rgba(70,40,0,.8)',rim:'#ffd36a',col:'#ffe9a8',id:'colh'});
  for(let r=0;r<3;r++){numTag(TX5[0]-2.6,.2,TZ5[r],r+1,{u:.6,min:34,bg:'rgba(70,40,0,.8)',rim:'#ffd36a',col:'#ffe9a8',id:'rowh'});
   for(let c=0;c<4;c++){if(LV.hid[r+','+c]){if(LV.cur&&LV.cur[0]===r&&LV.cur[1]===c&&GM.q)qTag(TX5[c],.9,TZ5[r],{u:1,min:56});continue}
    const fl=LV.cellFl&&LV.cellFl[0]===r&&LV.cellFl[1]===c&&T-LV.cellFl[2]<1.2;numTag(TX5[c],.65,TZ5[r],TBL[r][c],{u:.82,min:48,bg:fl?'rgba(30,120,60,.9)':LV.rows[r]?'rgba(20,70,110,.85)':null})}}}});
function rowBox(r){const a=proj(TX5[0]-1.4,.6,TZ5[r]),b=proj(TX5[3]+1.4,.6,TZ5[r]);const h=pxPerUnit(0,.6,TZ5[r])*1.6;return[a.x,a.y-h/2,b.x,b.y+h/2]}
function cellBox(r,c){const p=proj(TX5[c],.6,TZ5[r]);const w=pxPerUnit(TX5[c],.6,TZ5[r])*2.6;return[p.x-w/2,p.y-w*.35,p.x+w/2,p.y+w*.35]}
function rowFire(r){if(LV.rows[r])return;LV.rows[r]=1;LV.rowT[r]=T;SFX3.laser();SFX3.power();GM.sky.push({a:[-8,.8,TZ5[r]],b:[8,.8,TZ5[r]],life:.6,c:[1,.85,.4],w:.7,zig:0});GM.en.filter(e=>!e.dead&&Math.abs(e.z-TZ5[r])<2.2).forEach(e=>kill(e))}
function l5Upd(dt){for(let r=0;r<3;r++)for(let c=0;c<4;c++){const x=TX5[c],z=TZ5[r];instAdd(PADS,x,.16,z,1.2,1,1.05);const on=LV.rows[r];
  if(on){const k=ease(clamp((T-LV.rowT[r]-c*.12)/.5,0,1));instAdd(XTAL,x+1.05,.3+.5*k,z-.6,.3*k,.9*k,.3*k,null,[.6,1.1,1.4])}
  const hl=LV.rowHL&&LV.rowHL[0]===r&&T-LV.rowHL[1]<1.5;lightPool(x,z,1.5,hl?[.4,.35,.1]:on?[.08,.22,.35]:[.04,.08,.16],1);if(LV.hid[r+','+c]&&LV.cur&&LV.cur[0]===r&&LV.cur[1]===c)ring(x,z,1.05,mul(CL.gold,.6+.4*Math.sin(T*6)),1,T)}
 // готовые строки периодически стреляют вдоль себя
 for(let r=0;r<3;r++)if(LV.rows[r]&&Math.floor((T-LV.rowT[r])/3.2)!==Math.floor((T-dt-LV.rowT[r])/3.2)){const hit1=GM.en.filter(e=>!e.dead&&e.spawn<=0&&Math.abs(e.z-TZ5[r])<1.4);if(hit1.length){GM.sky.push({a:[-8,.8,TZ5[r]],b:[8,.8,TZ5[r]],life:.35,c:[1,.85,.4],w:.45,zig:0});hit1.forEach(e=>hit(e,2,CL.gold));SFX3.laser()}}}
