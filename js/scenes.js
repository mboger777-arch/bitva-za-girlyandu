'use strict';
// ===== Заставка, вступление, карта, медаль, бонус «Снежная битва» =====
function orbit(r,h,sp,cx,cz,ly){GM.extra=dt=>{const a=T*sp;CAMR.tp.set(cx+Math.sin(a)*r,h,cz+Math.cos(a)*r);CAMR.tl.set(cx,ly,cz)}}
SC.title={noHome:1,
 enter(){world({lit:1,bur:false});TREE3.lit=1;GM.bur=null;cast=[hero('kira',LEFT(150),{h:400}),hero('shustrik',RIGHT(130),{base:'cheer',h:250})];
  orbit(13,5.2,.12,0,-9,4.2);CAMR.k=1.2;camSnap();musMenu()},
 draw(){const v=vis();const t='Битва за гирлянду';textIn(t,640,safeT()+92,Math.min(900,v.w*.66),130,110,'#fff3d6',{f:FONT,st:'#0c2348',lw:12,id:'logo'});
  textIn('игра про закономерности',640,safeT()+188,Math.min(700,v.w*.5),60,46,'#9fe6ff',{f:FONT,st:'#0c2348',lw:7,id:'logo2'});drawCast()},
 ui(){boardBtn('play',640,safeB()-90,380,'Играть',()=>{if(!SV.intro)go('intro');else go('map')},{pulse:1})}};
// ---- вступление ----
SC.intro={noHome:1,
 enter(){world({lit:1,bur:false});TREE3.lit=1;GM.bur=null;cast=[];camTo([0,4.5,4],[0,4.4,-9],1);camSnap();LV={dr:[]};GM.extra=introUpd;musMenu();
  run(async()=>{await say('i1');camTo([3,5,6],[0,3.5,-9],.6);await say('i2');
   // дроны воруют огоньки
   const t=TREE3.a;camTo([0,7,12],[0,4,-9],.8);SFX3.rumble();for(let i=0;i<6;i++){const d={a:actor('drone',1.5,{x:rnd(-14,14),z:-20,y:9}),tx:t.x+rnd(-1.6,1.6),ty:rnd(2.5,7),tz:t.z+1.3,t0:T+i*.25,ph:0};LV.dr.push(d)}
   await wait(2200);SFX3.whoosh?SFX3.whoosh():SFX.whoosh();for(let i=12;i>=0;i--){setTimeout(()=>{TREE3.lit=i/12;SFX3.snap()},(12-i)*80)}LV.flee=T;await wait(1400);
   GM.put=actor('put_laugh',5.2,{x:6.5,z:-7,breath:.012});GM.put.flash=2;SFX3.boom();cshake(.8);await say('i3');
   camTo(CAM_GAME[0],CAM_GAME[1],1);cast=[hero('shustrik',RIGHT(130),{base:'think',h:260})];await say('i4');
   GM.bur=actor('ride',2.7,{x:-3,z:3.2,breath:.008});GM.bur.flash=2;SFX3.power();await say('i5');pose('shustrik','cheer',2);await say('i6');
   SV.intro=1;save();go('map')})},
 draw(){drawCast()},
 ui(){btn('skip','b_next',safeR()-60,safeB()-60,100,()=>{SV.intro=1;save();go('map')},{always:1})}};
function introUpd(dt){LV.dr.forEach((d,i)=>{const a=d.a;let k=ease(clamp((T-d.t0)/1.6,0,1));if(LV.flee){const f=clamp((T-LV.flee-i*.08)/1.2,0,1);a.x=lerp(d.tx,d.tx*3+(i%2?14:-14),f*f);a.y=lerp(d.ty,12,f*f);a.z=lerp(d.tz,-18,f*f);glow(a.x,a.y+.3,a.z+.3,[[1,.3,.3],[.3,1,.5],[.4,.6,1]][i%3],1.3)}
 else{a.x=lerp(a.x,d.tx,k*.1);a.y=lerp(a.y,d.ty,k*.1);a.z=lerp(a.z,d.tz,k*.1)}glow(a.x,a.y+.5,a.z+.1,CL.cy,.8)});if(GM.put)GM.put.lift=Math.sin(T*2)*.08}
// ---- карта ----
const MAPN=[[276,620,'Огоньки'],[440,566,'Дроны'],[616,526,'Колонна'],[800,500,'Лавина'],[912,410,'Таблица']],CASTLE=[980,262];
SC.map={
 enter(){A3.off=true;cast=[hero('kira',LEFT(110),{h:300})];GOAL='';musMenu();
  run(async()=>{await wait(300);const all=SV.cones.every(v=>v);if(all&&!SV.sec.bonusSaid){SV.sec.bonusSaid=1;save();await say('m_bonus')}else if(SV.fin)await say('m_all');else if(SV.open>=6)await say('m_boss');else await say('m1')})},
 draw(){bgDraw('map');drawCast()},
 ui(){const s=bgScale();MAPN.forEach((n,i)=>{const[x,y]=bgXY(n[0],n[1]);const open=SV.open>i,done=SV.stars[i];const d=104,bob=Math.sin(T*2+i)*4;
   mapNode('z'+(i+1),x,y+bob-10,d,String(i+1),open,()=>{if(!open){sayNow('m_lock');SFX.bad();return}go('l'+(i+1))},open&&!done);
   if(done)spr('star',x+40,y+bob-58,54,{rot:Math.sin(T*2)*.1});if(SV.cones[i])spr('cone',x-44,y+bob-54,44);
   plankLabel(n[2],x,y+bob+d/2+12,170,52)});
  const[cx,cy]=bgXY(CASTLE[0],CASTLE[1]);const bo=SV.open>=6;mapNode('z6',cx,cy+Math.sin(T*2.2)*5,120,'★',bo,()=>{if(!bo){sayNow('m_lock');SFX.bad();return}go('boss')},bo&&!SV.fin);if(SV.fin)spr('medal',cx+56,cy-56,78);plankLabel('Крепость',cx,cy+88,190,56);
  // шишки
  const n=SV.cones.filter(Boolean).length;const x0=safeR()-200,y0=safeB()-44;X.fillStyle='rgba(8,22,56,.82)';X.strokeStyle='rgba(200,235,255,.9)';X.lineWidth=3;X.beginPath();X.roundRect(x0-26,y0-34,224,68,34);X.fill();X.stroke();for(let i=0;i<5;i++){const cx=x0+i*43;if(!SV.cones[i]){X.fillStyle='rgba(120,160,220,.35)';X.beginPath();X.arc(cx,y0,17,0,7);X.fill()}spr('cone',cx,y0,SV.cones[i]?50:40,{a:SV.cones[i]?1:.45})}
  if(n>=5)btn('bonus','b_snow',safeR()-90,safeB()-150,130,()=>go('bonus'),{pulse:1,noPlate:1})}};
function mapNode(id,x,y,d,t,open,fn,pulse){UI.push({id,x,y,w:d,h:d,fn});const k=1+(pulse?Math.sin(T*5)*.06:0);X.save();X.translate(x,y);X.scale(k,k);
 const g=X.createRadialGradient(0,0,d*.1,0,0,d*.5);g.addColorStop(0,open?'#3e8fe0':'#3a4660');g.addColorStop(1,open?'#123a7a':'#1d2436');X.fillStyle=g;X.strokeStyle=open?'#bff3ff':'#7a8aa0';X.lineWidth=6;X.beginPath();X.arc(0,0,d/2,0,7);X.fill();X.stroke();
 if(pulse){X.strokeStyle='rgba(160,240,255,'+(.4+.3*Math.sin(T*5))+')';X.lineWidth=4;X.beginPath();X.arc(0,0,d/2+9,0,7);X.stroke()}X.restore();
 txt(t,x,y+3,d*.62,open?'#fff6dc':'#9aa8bc',{f:NUM,st:'#0a1a4a',lw:8,box:[x-d*.42,y-d*.42,x+d*.42,y+d*.42],id:'zn'})}
function plankLabel(t,x,y,w,h){slice3('plank',x,y,w,h,{cap:1.3});textIn(t,x,y+1,w-h*.7,h*.66,34,'#fff6dc',{f:FONT,st:'#0c2348',lw:5,id:'zname',min:20})}
// ---- медаль ----
SC.medal={
 enter(){world({lit:1,bur:false});TREE3.lit=1;GM.bur=null;GM.put=actor('put_kind',4.6,{x:4.5,z:-6.5,breath:.012});const b=actor('ride',2.8,{x:-4.4,z:-5.6,breath:.01});b.flip=true;orbit(14,6,.1,0,-8,4);camSnap();cast=[hero('shustrik',RIGHT(120),{base:'cheer',h:240})];musMenu();
  LV={t0:T};run(async()=>{SFX.star();for(let i=0;i<6;i++)setTimeout(()=>firework(rnd(-7,7),rnd(6,10),rnd(-12,-5)),i*400);await say('f_medal');await say('f_end')});const ex=GM.extra;GM.extra=dt=>{ex(dt);if(Math.random()<.02)firework(rnd(-8,8),rnd(6,10),rnd(-12,-5))}},
 draw(){const k=ease(clamp((T-LV.t0)/.8,0,1));const v=vis();const h=Math.min(330,v.h*.48)*k;spr('medal',640,safeT()+40+h/2+Math.sin(T*2)*5,h,{rot:Math.sin(T*1.5)*.05});
  textIn('Мастер закономерностей',640,safeT()+h+100,Math.min(820,v.w*.62),90,72,'#ffe9a8',{f:FONT,st:'#3a1d00',lw:10,id:'mtitle'});drawCast()},
 ui(){boardBtn('tomap',640,safeB()-70,320,'На карту',()=>go('map'),{pulse:1})}};
// ---- бонус: Снежная битва ----
SC.bonus={
 enter(){GM.lvl=0;GM.steps=0;LV={f:[],sc:0,best:SV.sec.best||0};world({lit:1});TREE3.lit=1;cast=[hero('shustrik',LEFT(105),{base:'orb',h:215})];musStart('game',150,1);GM.extra=l2Upd;GM.score=0;
  run(async()=>{await say('x_in');let r=0;for(;;){r++;wave(Array.from({length:3+Math.min(6,r)},(_,i)=>['bot','drone','thief'][i%3]),Math.max(.45,1.1-r*.06));await wait(G.fast?200:14000);
   const a=Math.floor(rnd(1,8)),d=[1,2,5,10][Math.floor(rnd(0,4))];const Q=[a,a+d,a+2*d,a+3*d];LV.f.forEach(f=>actorKill(f.a));LV.f=Q.map((v,i)=>({v,i,x:(i-1.5)*3.1,z:-5.6,y:2.6,a:actor('drone',1.6,{x:(i-1.5)*3.1,z:-17,y:5}),show:i<3,dead:0,t0:T+i*.12}));LV.shield=1;
   await say('x_q');const opts=numOpts(Q[3],d).map(v=>({v}));await ask({opts,ans:opts.findIndex(o=>o.v===Q[3]),target:()=>{const f=LV.f[3];return[f.x,f.y+.8,f.z]}});LV.f[3].show=1;LV.shield=0;GM.score+=50;
   const b=GM.bur;let prev=[b.x,2.3,b.z];LV.f.forEach((f,i)=>{const cur=[f.x,f.y+.8,f.z],pv=prev;setTimeout(()=>{GM.sky.push({a:pv,b:cur,life:.5,c:[.6,.85,1],w:.4,zig:.45,seed:i});f.dead=1;boom3(cur[0],cur[1],cur[2])},150+i*170);prev=cur});killAll();
   if(GM.score>=500&&!LV.endSaid){LV.endSaid=1;say('x_end').catch(()=>{})}}})},
 draw(){LV.f.forEach(f=>{if(f.dead)return;if(f.show)numTag(f.x,f.y-.25,f.z,f.v,{u:.95,min:54});else if(GM.q)qTag(f.x,f.y+.35,f.z,{u:1.1,min:60})});
  const s=GM.score;if(s>LV.best){LV.best=s;SV.sec.best=s;save()}const x=safeR()-130,y=safeT()+44;X.fillStyle='rgba(8,22,56,.75)';X.beginPath();X.roundRect(x-110,y-34,220,68,34);X.fill();spr('star',x-70,y,52);txt(String(s),x+20,y+3,50,'#fff',{f:NUM,st:'#04142e',lw:7,box:[x-40,y-32,x+105,y+32],id:'score'});
  drawCast();trayDraw();flyDraw()},
 hold:ARENA_IN.hold,move:ARENA_IN.move,up:ARENA_IN.up};
