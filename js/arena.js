'use strict';
// ===== 3D-арена (three.js r160): земля, лес, ёлка, билборды героев, батчи свечения/лучей/декалей, снег, северное сияние, выборочный bloom =====
const A3={ready:false,n:0,ok:0,q:1,bloom:true,TS:1,slowT:0,shake:0,punch:0,frost:0,aur:0,flash:0,info:{calls:0,tris:0}};
const T3=window.THREE;const GLC=document.getElementById('g');
const R3=new T3.WebGLRenderer({canvas:GLC,antialias:false,powerPreference:'high-performance',alpha:false,stencil:false});
R3.outputColorSpace=T3.SRGBColorSpace;R3.autoClear=false;R3.info.autoReset=false;
const S3=new T3.Scene();S3.background=new T3.Color(0x0f2350);S3.fog=new T3.Fog(0x1a3266,26,62);
const CAM=new T3.PerspectiveCamera(50,16/9,.1,300);
const CAMR={pos:new T3.Vector3(0,7.2,15),look:new T3.Vector3(0,1.6,-3),tp:new T3.Vector3(0,7.2,15),tl:new T3.Vector3(0,1.6,-3),k:3};
function camTo(p,l,k){CAMR.tp.set(p[0],p[1],p[2]);CAMR.tl.set(l[0],l[1],l[2]);CAMR.k=k||3}
function camSnap(){CAMR.pos.copy(CAMR.tp);CAMR.look.copy(CAMR.tl)}
const CAM_GAME=[[0,6.3,12.2],[0,1.5,-3.6]];
// --- текстуры из общего загрузчика картинок (IM), чтобы работал прогресс и ?v=
const TX={};
function tx3(n,o){if(TX[n])return TX[n];const im=IM[n];const t=new T3.Texture(im);t.colorSpace=T3.SRGBColorSpace;t.generateMipmaps=true;t.minFilter=T3.LinearMipmapLinearFilter;t.anisotropy=4;if(o&&o.rep){t.wrapS=t.wrapT=T3.MirroredRepeatWrapping;t.repeat.set(o.rep[0],o.rep[1])}if(o&&o.mir){t.wrapS=T3.MirroredRepeatWrapping;t.repeat.set(o.mir,1)}TX[n]=t;A3.n++;const done=()=>{t.needsUpdate=true;A3.ok++};if(okI(im))done();else im.addEventListener('load',done,{once:true});return t}
['tex_snow','bg_pan','fir','tree','ride','ride_run','bot','drone','thief','moon'].forEach(n=>{if(!IM[n]){const p={tex_snow:'assets/tex/snow.jpg',bg_pan:'assets/bg/panorama.jpg',moon:'assets/ui/moon.png'}[n]||('assets/sprites/'+n+'.png');img(n,p)}});

// --- атлас мягких форм (диск, кольцо, полоса, снежинка) — рисуется кодом
const ATL=(()=>{const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');
 let g=x.createRadialGradient(64,64,0,64,64,62);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.35,'rgba(255,255,255,.75)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,128,128);
 x.strokeStyle='#fff';x.lineWidth=9;x.shadowColor='#fff';x.shadowBlur=10;x.beginPath();x.arc(192,64,50,0,7);x.stroke();x.lineWidth=4;x.beginPath();x.arc(192,64,36,0,7);x.stroke();x.shadowBlur=0;
 g=x.createLinearGradient(0,128,0,256);g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(.5,'rgba(255,255,255,1)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(4,132,120,120);
 x.save();x.translate(192,192);x.strokeStyle='#fff';x.lineWidth=7;x.lineCap='round';for(let i=0;i<6;i++){x.rotate(Math.PI/3);x.beginPath();x.moveTo(0,0);x.lineTo(0,-52);x.moveTo(0,-30);x.lineTo(-14,-42);x.moveTo(0,-30);x.lineTo(14,-42);x.stroke()}x.restore();
 const t=new T3.CanvasTexture(c);t.colorSpace=T3.SRGBColorSpace;return t})();
const CELL={disc:[0,.5],ring:[.5,.5],bar:[0,0],flake:[.5,0]};
// --- земля: подразделённая плоскость с вершинными цветами (дешёвое «освещение»: тёплое пятно у ёлки, тень по краям)
const GROUND3=(()=>{const g=new T3.PlaneGeometry(120,90,30,24);g.rotateX(-Math.PI/2);const p=g.attributes.position,col=new Float32Array(p.count*3);
 for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i);const d=Math.hypot(x/16,(z+1)/12);let k=clamp(1.08-d*.45,.42,1.08);const w=Math.max(0,1-Math.hypot(x,z+8)/9);col[i*3]=k*(.86+w*.25);col[i*3+1]=k*(.92+w*.12);col[i*3+2]=k*(1.06-w*.1)}
 g.setAttribute('color',new T3.BufferAttribute(col,3));const m=new T3.Mesh(g,new T3.MeshBasicMaterial({map:tx3('tex_snow',{rep:[14,10]}),vertexColors:true}));m.position.z=-8;S3.add(m);return m})();
// --- задник: панорама леса (зеркальный повтор по ширине), без тумана
const PAN=(()=>{const h=34,w=h*16/9*3;const m=new T3.Mesh(new T3.PlaneGeometry(w,h),new T3.MeshBasicMaterial({map:tx3('bg_pan',{mir:3}),fog:false,depthWrite:false}));m.position.set(0,h/2-3.2,-44);m.renderOrder=-10;S3.add(m);return m})();
const MOON=(()=>{const m=new T3.Mesh(new T3.PlaneGeometry(1,1),new T3.MeshBasicMaterial({map:tx3('moon'),transparent:true,fog:false,depthWrite:false}));m.position.set(-17,11.6,-42);m.scale.set(5,5,1);m.renderOrder=-9;S3.add(m);return m})();
// --- северное сияние (шейдер, аддитивно, в слое bloom)
const AUR=(()=>{const mat=new T3.ShaderMaterial({transparent:true,depthWrite:false,blending:T3.AdditiveBlending,fog:false,uniforms:{t:{value:0},a:{value:0}},
 vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
 fragmentShader:`varying vec2 vUv;uniform float t,a;
 float n(float x){return sin(x)*.5+sin(x*2.3+1.7)*.3+sin(x*4.1+.3)*.2;}
 void main(){float x=vUv.x*7.;float c=0.;vec3 col=vec3(0.);
 for(int i=0;i<3;i++){float fi=float(i);float y=.35+.18*n(x*.6+t*.35+fi*2.1)+fi*.08;float d=vUv.y-y;float band=exp(-d*d*90.)*(.6+.4*sin(x*3.+t*1.3+fi));float curtain=smoothstep(.0,.25,-d)*exp(d*6.)*.35*(.5+.5*sin(x*9.+t*2.+fi*4.));float v=(band+curtain)*(1.-fi*.25);
 col+=v*mix(vec3(.1,1.,.55),vec3(.55,.3,1.),fi*.5+.25*sin(t*.5+x*.3));}
 float e=smoothstep(0.,.15,vUv.x)*smoothstep(1.,.85,vUv.x)*smoothstep(0.,.2,vUv.y)*smoothstep(1.,.7,vUv.y);gl_FragColor=vec4(col*e*a,1.);}`});
 const m=new T3.Mesh(new T3.PlaneGeometry(110,24),mat);m.position.set(0,19,-40);m.renderOrder=-8;m.layers.enable(1);m.visible=false;S3.add(m);return m})();
// --- ёлки по краям: один InstancedMesh, билборд (поворот к камере)
const FIRS=(()=>{const g=new T3.PlaneGeometry(1,1);g.translate(0,.5,0);const m=new T3.InstancedMesh(g,new T3.MeshBasicMaterial({map:tx3('fir'),transparent:true,alphaTest:.3,side:T3.DoubleSide}),40);
 const P=[];let s=7;const r=()=>(s=(s*16807)%2147483647)/2147483647;
 for(let i=0;i<14;i++){const side=i%2?1:-1;P.push([side*(12.5+r()*7),-16+i*1.6+r(),3.5+r()*3])}
 for(let i=0;i<12;i++)P.push([-22+i*4+r()*2,-19-r()*4,5+r()*3]);
 P.sort((a,b)=>a[1]-b[1]);m.count=P.length;m.userData.P=P;m.frustumCulled=false;S3.add(m);return m})();
const _m4=new T3.Matrix4(),_v3=new T3.Vector3(),_v3b=new T3.Vector3(),_q=new T3.Quaternion(),_s3=new T3.Vector3();
function firsUpd(){const P=FIRS.userData.P;P.forEach((p,i)=>{_v3.set(p[0],0,p[1]);_s3.set(p[2]*.62,p[2],1);_m4.compose(_v3,CAM.quaternion,_s3);FIRS.setMatrixAt(i,_m4)});FIRS.instanceMatrix.needsUpdate=true}
// --- освещённые низкополигональные объекты (пьедесталы, кристаллы, снежные шары, щиты)
S3.add(new T3.HemisphereLight(0xbfd8ff,0x31407a,1.6));const DL=new T3.DirectionalLight(0xfff0d8,1.4);DL.position.set(-4,10,6);S3.add(DL);
function inst(geo,mat,n,bloom){const m=new T3.InstancedMesh(geo,mat,n);m.count=0;m.frustumCulled=false;if(bloom)m.layers.enable(1);S3.add(m);m.L=[];return m}
const PADS=inst(new T3.CylinderGeometry(.95,1.1,.32,10),new T3.MeshLambertMaterial({color:0x9fd2ff,emissive:0x16306a}),40);
const XTAL=inst(new T3.OctahedronGeometry(.5,0),new T3.MeshBasicMaterial({color:0xffffff}),60,true);
const BALLS=inst(new T3.IcosahedronGeometry(1,1),new T3.MeshLambertMaterial({color:0xf2f8ff,emissive:0x2a3f70,flatShading:true}),40);
const SHLD=inst(new T3.CylinderGeometry(1,1,.16,6),new T3.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.8,depthWrite:false}),16,true);
const SPIK=inst(new T3.ConeGeometry(.45,1.6,5),new T3.MeshLambertMaterial({color:0xbfe8ff,emissive:0x2a6ab0,flatShading:true}),60);
[XTAL,SHLD].forEach(m=>{m.instanceColor=new T3.InstancedBufferAttribute(new Float32Array(m.instanceMatrix.count*3),3)});
function instAdd(m,x,y,z,sx,sy,sz,q,col){if(m.count>=m.instanceMatrix.count)return;instPut(m,m.count,x,y,z,sx,sy,sz,q,col)}
function instPut(m,i,x,y,z,sx,sy,sz,q,col){_v3.set(x,y,z);_s3.set(sx,sy,sz);_m4.compose(_v3,q||_q.identity(),_s3);m.setMatrixAt(i,_m4);if(col&&m.instanceColor)m.instanceColor.setXYZ(i,col[0],col[1],col[2]);m.count=Math.max(m.count,i+1)}
function instReset(){[PADS,XTAL,BALLS,SHLD,SPIK].forEach(m=>m.count=0)}
function instDone(){[PADS,XTAL,BALLS,SHLD,SPIK].forEach(m=>{m.instanceMatrix.needsUpdate=true;if(m.instanceColor)m.instanceColor.needsUpdate=true})}
// --- батч свечения: одна Points-система (снаряды, искры, лампочки, ореолы)
const GLOWN=3000;
const GLOW=(()=>{const g=new T3.BufferGeometry();g.setAttribute('position',new T3.BufferAttribute(new Float32Array(GLOWN*3),3).setUsage(T3.DynamicDrawUsage));g.setAttribute('color',new T3.BufferAttribute(new Float32Array(GLOWN*3),3).setUsage(T3.DynamicDrawUsage));g.setAttribute('sz',new T3.BufferAttribute(new Float32Array(GLOWN),1).setUsage(T3.DynamicDrawUsage));
 const mat=new T3.ShaderMaterial({transparent:true,depthWrite:false,blending:T3.AdditiveBlending,uniforms:{ps:{value:400}},vertexColors:true,
 vertexShader:'attribute float sz;varying vec3 vC;uniform float ps;void main(){vC=color;vec4 mv=modelViewMatrix*vec4(position,1.);gl_PointSize=sz*ps/-mv.z;gl_Position=projectionMatrix*mv;}',
 fragmentShader:'varying vec3 vC;void main(){vec2 p=gl_PointCoord-.5;float d=length(p)*2.;float a=exp(-d*d*4.)+.6*exp(-d*d*28.);gl_FragColor=vec4(vC*a,1.);}'});
 const m=new T3.Points(g,mat);m.frustumCulled=false;m.renderOrder=20;m.layers.enable(1);S3.add(m);m.n=0;return m})();
function glow(x,y,z,c,s){if(GLOW.n>=GLOWN)return;const i=GLOW.n++,P=GLOW.geometry.attributes;P.position.array.set([x,y,z],i*3);P.color.array.set(c,i*3);P.sz.array[i]=s}
// --- батч лучей/молний: квадраты, развёрнутые к камере
const BEAMN=600;
const BEAM=(()=>{const g=new T3.BufferGeometry();const N=BEAMN;g.setAttribute('position',new T3.BufferAttribute(new Float32Array(N*12),3).setUsage(T3.DynamicDrawUsage));g.setAttribute('color',new T3.BufferAttribute(new Float32Array(N*12),3).setUsage(T3.DynamicDrawUsage));const uv=new Float32Array(N*8),idx=[];for(let i=0;i<N;i++){uv.set([0,0,0,1,1,1,1,0],i*8);const b=i*4;idx.push(b,b+1,b+2,b,b+2,b+3)}g.setAttribute('uv',new T3.BufferAttribute(uv,2));g.setIndex(idx);
 const mat=new T3.ShaderMaterial({transparent:true,depthWrite:false,blending:T3.AdditiveBlending,vertexColors:true,side:T3.DoubleSide,
 vertexShader:'varying vec3 vC;varying vec2 vU;void main(){vC=color;vU=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
 fragmentShader:'varying vec3 vC;varying vec2 vU;void main(){float d=abs(vU.y-.5)*2.;float a=exp(-d*d*5.)+1.2*exp(-d*d*60.);gl_FragColor=vec4(vC*a+vec3(1.)*exp(-d*d*80.)*.6*length(vC),1.);}'});
 const m=new T3.Mesh(g,mat);m.frustumCulled=false;m.renderOrder=21;m.layers.enable(1);S3.add(m);m.n=0;return m})();
const _a=new T3.Vector3(),_b=new T3.Vector3(),_d=new T3.Vector3(),_side=new T3.Vector3(),_toC=new T3.Vector3();
function beamSeg(ax,ay,az,bx,by,bz,w,c){if(BEAM.n>=BEAMN)return;_a.set(ax,ay,az);_b.set(bx,by,bz);_d.subVectors(_b,_a);_toC.subVectors(CAM.position,_a);_side.crossVectors(_d,_toC).normalize().multiplyScalar(w/2);const i=BEAM.n++,P=BEAM.geometry.attributes.position.array,C=BEAM.geometry.attributes.color.array;
 P.set([_a.x-_side.x,_a.y-_side.y,_a.z-_side.z,_a.x+_side.x,_a.y+_side.y,_a.z+_side.z,_b.x+_side.x,_b.y+_side.y,_b.z+_side.z,_b.x-_side.x,_b.y-_side.y,_b.z-_side.z],i*12);for(let k=0;k<4;k++)C.set(c,i*12+k*3)}
function beam(a,b,w,c,zig,seed){if(!zig){beamSeg(a[0],a[1],a[2],b[0],b[1],b[2],w,c);return}const n=7;let p=a;for(let i=1;i<=n;i++){const f=i/n;const j=i<n?zig:0;const s=(seed||0)+i*12.9898;const q=[lerp(a[0],b[0],f)+Math.sin(s*7.1+T*40)*j,lerp(a[1],b[1],f)+Math.sin(s*3.3+T*53)*j,lerp(a[2],b[2],f)+Math.sin(s*5.7+T*47)*j*.5];beamSeg(p[0],p[1],p[2],q[0],q[1],q[2],w,c);p=q}}
// --- батчи декалей на земле: тени (обычное смешивание) и световые пятна/кольца (аддитивно)
function decalBatch(add,N){const g=new T3.BufferGeometry();g.setAttribute('position',new T3.BufferAttribute(new Float32Array(N*12),3).setUsage(T3.DynamicDrawUsage));g.setAttribute('color',new T3.BufferAttribute(new Float32Array(N*16),4).setUsage(T3.DynamicDrawUsage));g.setAttribute('uv',new T3.BufferAttribute(new Float32Array(N*8),2).setUsage(T3.DynamicDrawUsage));const idx=[];for(let i=0;i<N;i++){const b=i*4;idx.push(b,b+1,b+2,b,b+2,b+3)}g.setIndex(idx);
 const mat=new T3.MeshBasicMaterial({map:ATL,vertexColors:true,transparent:true,depthWrite:false,blending:add?T3.AdditiveBlending:T3.NormalBlending,polygonOffset:true,polygonOffsetFactor:-2});
 const m=new T3.Mesh(g,mat);m.frustumCulled=false;m.renderOrder=add?2:1;if(add)m.layers.enable(1);S3.add(m);m.n=0;m.N=N;return m}
const DSH=decalBatch(false,80),DLT=decalBatch(true,200);
function decal(B,cell,x,z,rx,rz,c,a,rot,y){if(B.n>=B.N)return;const i=B.n++,P=B.geometry.attributes.position.array,C=B.geometry.attributes.color.array,U=B.geometry.attributes.uv.array;const cs=Math.cos(rot||0),sn=Math.sin(rot||0);const yy=(y||0)+.02;const pts=[[-1,-1],[-1,1],[1,1],[1,-1]];pts.forEach((p,k)=>{const lx=p[0]*rx,lz=p[1]*rz;P[i*12+k*3]=x+lx*cs-lz*sn;P[i*12+k*3+1]=yy;P[i*12+k*3+2]=z+lx*sn+lz*cs;C.set([c[0],c[1],c[2],a],i*16+k*4)});const o=CELL[cell];U.set([o[0],o[1],o[0],o[1]+.5,o[0]+.5,o[1]+.5,o[0]+.5,o[1]],i*8)}
function shadow(x,z,r,a){decal(DSH,'disc',x,z,r,r*.42,[.04,.08,.2],a==null?.55:a)}
function lightPool(x,z,r,c,a){decal(DLT,'disc',x,z,r,r,c,a==null?.6:a)}
function ring(x,z,r,c,a,rot){decal(DLT,'ring',x,z,r,r,c,a==null?1:a,rot)}
function stripe(x,z,len,w,rot,c,a){decal(DLT,'bar',x,z,len/2,w/2,c,a,rot)}
// --- снег: GPU-анимированные точки
const SNOW=(()=>{const N=1400,g=new T3.BufferGeometry(),p=new Float32Array(N*3),ph=new Float32Array(N);for(let i=0;i<N;i++){p[i*3]=rnd(-26,26);p[i*3+1]=rnd(0,22);p[i*3+2]=rnd(-30,14);ph[i]=Math.random()*6.28}g.setAttribute('position',new T3.BufferAttribute(p,3));g.setAttribute('ph',new T3.BufferAttribute(ph,1));
 const mat=new T3.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{t:{value:0},ps:{value:400},wind:{value:0}},
 vertexShader:'attribute float ph;uniform float t,ps,wind;varying float vA;void main(){vec3 p=position;p.y=mod(p.y-t*(1.1+ph*.12),22.)-.5;p.x+=sin(t*.7+ph*3.)*.7+wind*mod(t*3.+ph*9.,22.);p.z+=cos(t*.5+ph*2.)*.5;vec4 mv=modelViewMatrix*vec4(p,1.);gl_PointSize=(1.3+ph*.12)*ps/-mv.z*.09;vA=clamp(-mv.z/6.,0.,1.);gl_Position=projectionMatrix*mv;}',
 fragmentShader:'varying float vA;void main(){vec2 c=gl_PointCoord-.5;float a=smoothstep(.5,.1,length(c));gl_FragColor=vec4(1.,1.,1.,a*.85*vA);}'});
 const m=new T3.Points(g,mat);m.frustumCulled=false;m.renderOrder=30;S3.add(m);return m})();
// --- билборды (герои, враги, ёлка): плоскость с опорой «на ноги», ориентирована как камера (без искажений), пропорции из текстуры
const ACT=[];const PLN=(()=>{const g=new T3.PlaneGeometry(1,1);g.translate(0,.5,0);return g})();
function actor(key,h,o){o=o||{};const mat=new T3.MeshBasicMaterial({map:tx3(key),transparent:true,alphaTest:.25,side:T3.DoubleSide,color:0xffffff});const m=new T3.Mesh(PLN,mat);S3.add(m);
 const a=Object.assign({m,key,h,x:0,y:0,z:0,flip:false,vis:true,sh:1,breath:.012,ph:Math.random()*6,tilt:0,sq:0,blinkT:rnd(1,4),blink:0,alpha:1,tint:null,flash:0,lift:0},o);a.m.renderOrder=o.ro||5;ACT.push(a);return a}
function actorKill(a){const i=ACT.indexOf(a);if(i>=0)ACT.splice(i,1);S3.remove(a.m);a.m.material.dispose();a.dead=true}
function actorsClear(keep){for(let i=ACT.length-1;i>=0;i--)if(!keep||!keep.includes(ACT[i]))actorKill(ACT[i])}
const _zq=new T3.Quaternion(),_zx=new T3.Vector3(0,0,1);
function actorsUpd(dt){for(const a of ACT){const m=a.m;m.visible=a.vis&&a.alpha>.01;if(!m.visible)continue;
 // моргание: подмена текстуры на кадр с закрытыми глазами
 let k=a.key;if(IM[k+'_blink']){a.blinkT-=dt;if(a.blinkT<0){a.blink=.13;a.blinkT=rnd(2.2,4.8)}if(a.blink>0){a.blink-=dt;if(okI(IM[k+'_blink']))k=k+'_blink'}}
 const t=tx3(k);if(m.material.map!==t)m.material.map=t;const im=IM[k];const ar=okI(im)?im.naturalWidth/im.naturalHeight:1;
 const br=1+Math.sin(T*2.4+a.ph)*a.breath;const h=a.h*br,w=a.h*ar*br;
 m.scale.set(a.flip?-w:w,h,1);m.position.set(a.x,a.y+a.lift,a.z);m.quaternion.copy(CAM.quaternion);if(a.tilt){_zq.setFromAxisAngle(_zx,a.tilt);m.quaternion.multiply(_zq)}
 const c=m.material.color;if(a.tint)c.setRGB(a.tint[0],a.tint[1],a.tint[2]);else c.setRGB(1,1,1);if(a.flash>0){a.flash-=dt*3;const f=Math.max(0,a.flash);c.setRGB(c.r+f*2,c.g+f*2,c.b+f*2)}
 m.material.opacity=a.alpha;m.material.transparent=true;
 if(a.sh&&a.y<6)shadow(a.x,a.z+.05,w*.36*a.sh,.5*a.alpha*clamp(1-a.y/5,0,1))}}
// --- проекция в координаты 2D-оверлея (дизайн 1280x720) и обратно (палец → точка на земле)
const _pv=new T3.Vector3();
function proj(x,y,z){_pv.set(x,y,z).project(CAM);return{x:((_pv.x+1)/2*W-OX)/S,y:((1-_pv.y)/2*H-OY)/S,z:_pv.z,ok:_pv.z<1}}
function projA(a,f){return proj(a.x,a.y+a.lift+a.h*(f==null?1:f),a.z)}
function pxPerUnit(x,y,z){const p=proj(x,y,z),q=proj(x,y+1,z);return Math.abs(q.y-p.y)}
const _ray=new T3.Raycaster(),_ndc=new T3.Vector2(),_gp=new T3.Plane(new T3.Vector3(0,1,0),0),_hit=new T3.Vector3();
function groundAt(dx,dy){const cx=OX+dx*S,cy=OY+dy*S;_ndc.set(cx/W*2-1,-(cy/H*2-1));_ray.setFromCamera(_ndc,CAM);if(!_ray.ray.intersectPlane(_gp,_hit))return null;return{x:_hit.x,z:_hit.z}}
// --- выборочный bloom: слой 1 → RT 1/4 → размытие → аддитивно поверх
const BL={};
(()=>{const mk=()=>new T3.WebGLRenderTarget(4,4,{type:T3.HalfFloatType,depthBuffer:true});BL.a=mk();BL.b=mk();BL.c=new T3.WebGLRenderTarget(4,4,{type:T3.HalfFloatType,depthBuffer:false});
 const vs='varying vec2 vU;void main(){vU=uv;gl_Position=vec4(position.xy,0.,1.);}';
 BL.blur=new T3.ShaderMaterial({uniforms:{tex:{value:null},dir:{value:new T3.Vector2()}},vertexShader:vs,depthTest:false,depthWrite:false,
  fragmentShader:'uniform sampler2D tex;uniform vec2 dir;varying vec2 vU;void main(){vec3 c=texture2D(tex,vU).rgb*.227;c+=texture2D(tex,vU+dir*1.385).rgb*.316;c+=texture2D(tex,vU-dir*1.385).rgb*.316;c+=texture2D(tex,vU+dir*3.231).rgb*.07;c+=texture2D(tex,vU-dir*3.231).rgb*.07;gl_FragColor=vec4(c,1.);}'});
 BL.comp=new T3.ShaderMaterial({uniforms:{tex:{value:null},raw:{value:null},k:{value:1.3},slow:{value:0},frost:{value:0},flash:{value:0},bl:{value:1}},vertexShader:vs,transparent:true,depthTest:false,depthWrite:false,blending:T3.CustomBlending,blendSrc:T3.OneFactor,blendDst:T3.OneFactor,
  fragmentShader:'uniform sampler2D tex,raw;uniform float k,slow,frost,flash,bl;varying vec2 vU;void main(){vec3 c=((1.-exp(-texture2D(tex,vU).rgb*1.2))*k+(1.-exp(-texture2D(raw,vU).rgb))*.35)*bl;vec2 d=vU-.5;float v=dot(d,d);c+=vec3(.25,.55,1.)*smoothstep(.12,.32,v)*(slow*.5+frost*.8);c+=vec3(1.,.95,.8)*flash;gl_FragColor=vec4(c,1.);}'});
 BL.dark=new T3.ShaderMaterial({uniforms:{a:{value:0}},vertexShader:vs,transparent:true,depthTest:false,depthWrite:false,fragmentShader:'uniform float a;varying vec2 vU;void main(){vec2 d=vU-.5;gl_FragColor=vec4(0.02,.04,.12,a*smoothstep(.05,.45,dot(d,d)));}'});
 BL.q=new T3.Mesh(new T3.PlaneGeometry(2,2));BL.qs=new T3.Scene();BL.qs.add(BL.q);BL.oc=new T3.OrthographicCamera(-1,1,1,-1,0,1)})();
// чёрный материал-заглушка для не-светящихся объектов при рендере слоя bloom: глушим через layers + маску глубины
const OCCL=new T3.MeshBasicMaterial({color:0x000000});
function quad(mat,target){BL.q.material=mat;R3.setRenderTarget(target);R3.render(BL.qs,BL.oc)}
let RW=0,RH=0,QDPR=Math.min(window.devicePixelRatio||1,1.6);
function resize3(){const w=W,h=H;if(w===RW&&h===RH&&R3.getPixelRatio()===QDPR)return;RW=w;RH=h;R3.setPixelRatio(QDPR);R3.setSize(w,h,false);CAM.aspect=w/h;
 // узкий экран — отодвигаем камеру, чтобы арена влезала по ширине
 CAM.fov=w/h<1.7?56:50;CAM.updateProjectionMatrix();const bw=Math.max(2,Math.round(w*QDPR/4)),bh=Math.max(2,Math.round(h*QDPR/4));BL.a.setSize(bw,bh);BL.b.setSize(bw,bh);BL.c.setSize(bw,bh);const ps=h*QDPR/(2*Math.tan(CAM.fov*Math.PI/360));GLOW.material.uniforms.ps.value=ps;SNOW.material.uniforms.ps.value=ps}
// --- адаптивное качество: следим за fps, при просадке снижаем разрешение, затем выключаем bloom
const QA={t:0,frames:0,acc:0,log:[]};
function qualityTick(dt){if(G.noAdapt)return;QA.t+=dt;QA.frames++;if(QA.t<2)return;const fps=QA.frames/QA.t;QA.t=0;QA.frames=0;QA.last=fps;if(document.hidden)return;
 if(fps<44){if(QDPR>1.05){QDPR=Math.max(1,QDPR-.3);RW=0;QA.log.push('dpr'+QDPR.toFixed(1))}else if(A3.bloom){A3.bloom=false;QA.log.push('nobloom')}else if(SNOW.geometry.drawRange.count>500){SNOW.geometry.setDrawRange(0,500);QA.log.push('lesssnow')}}}
// --- кадр
const TREE3={a:null,bulbs:[],lit:0,flick:0};
function treeBulbs(){const B=[];const arcs=[[.30,.2,.8],[.47,.26,.74],[.62,.32,.68],[.75,.38,.62]];const cols=[[1,.25,.3],[.3,1,.45],[.3,.6,1],[1,.85,.25],[1,.4,.9]];let k=0;arcs.forEach((a,ai)=>{const n=7-ai;for(let i=0;i<n;i++){const f=i/(n-1);const u=lerp(a[1],a[2],f);const v=a[0]+.06*Math.sin(f*Math.PI)*-1+(ai%2?.02:0);B.push({u,v:1-v,c:cols[k++%cols.length]})}});return B}
TREE3.bulbs=treeBulbs();
function treeAdd(x,z,h){const a=actor('tree',h,{x,z,breath:0,sh:1.4,ro:4});TREE3.a=a;return a}
function treeGlow(){const a=TREE3.a;if(!a||!a.vis)return;const im=IM.tree;const ar=okI(im)?im.naturalWidth/im.naturalHeight:.7;const w=a.h*ar;_v3.set(1,0,0).applyQuaternion(CAM.quaternion);_v3b.set(0,1,0).applyQuaternion(CAM.quaternion);
 const N=TREE3.bulbs.length;const lit=Math.round(TREE3.lit*N);TREE3.bulbs.forEach((b,i)=>{const on=i<lit;const px=a.x+_v3.x*(b.u-.5)*w+_v3b.x*b.v*a.h,py=a.y+_v3b.y*b.v*a.h,pz=a.z+_v3.z*(b.u-.5)*w+_v3b.z*b.v*a.h+.15;
  let k=on?(.75+.25*Math.sin(T*3+i)):.08;if(TREE3.flick>0&&on&&(i*7)%5===Math.floor(T*20)%5)k*=.2;glow(px,py,pz,[b.c[0]*k,b.c[1]*k,b.c[2]*k],on?.7:.3)});
 if(TREE3.flick>0)TREE3.flick-=DT;if(TREE3.lit>=1){const s=.8+.2*Math.sin(T*4);glow(a.x,a.y+a.h*.99,a.z+.2,[1*s,.95*s,.6*s],3.2)}
 if(TREE3.lit>0)lightPool(a.x,a.z+1,4+TREE3.lit*3,[.35*TREE3.lit,.28*TREE3.lit,.12*TREE3.lit],.8)}
let L3UPD=null;// хук сцены: вызывается перед рендером для заполнения батчей
function frame3D(){if(!A3.ready&&A3.n&&A3.ok>=A3.n)A3.ready=true;const gs=R3.domElement.style;['left','top','width','height'].forEach(k=>{if(gs[k]!==C.style[k])gs[k]=C.style[k]});const vv=A3.off?'hidden':'visible';if(gs.visibility!==vv)gs.visibility=vv;if(A3.off)return;resize3();const dt=DT;
 // слоу-мо
 if(A3.slowT>0){A3.slowT-=dt;A3.TS=lerp(A3.TS,.22,.3)}else A3.TS=lerp(A3.TS,1,.08);
 // камера: плавное следование + встряска + «толчок»
 const k=1-Math.exp(-CAMR.k*dt);CAMR.pos.lerp(CAMR.tp,k);CAMR.look.lerp(CAMR.tl,k);A3.shake=Math.max(0,A3.shake-dt*2.2);A3.punch=Math.max(0,A3.punch-dt*3);
 const sh=A3.shake*A3.shake*.5;CAM.position.set(CAMR.pos.x+Math.sin(T*47)*sh,CAMR.pos.y+Math.sin(T*53+1)*sh,CAMR.pos.z);_v3.subVectors(CAMR.look,CAMR.pos).normalize();CAM.position.addScaledVector(_v3,A3.punch*1.2);CAM.lookAt(CAMR.look);
 GLOW.n=0;BEAM.n=0;DSH.n=0;DLT.n=0;instReset();
 if(L3UPD)try{L3UPD(dt*A3.TS,dt)}catch(e){console.error(e)}
 actorsUpd(dt);treeGlow();firsUpd();instDone();
 [GLOW,BEAM,DSH,DLT].forEach(b=>{const at=b.geometry.attributes;for(const n in at)at[n].needsUpdate=true});GLOW.geometry.setDrawRange(0,GLOW.n);BEAM.geometry.setDrawRange(0,BEAM.n*6);DSH.geometry.setDrawRange(0,DSH.n*6);DLT.geometry.setDrawRange(0,DLT.n*6);
 SNOW.material.uniforms.t.value=T;AUR.material.uniforms.t.value=T;A3.aur=Math.max(0,A3.aur-dt*.08);AUR.material.uniforms.a.value=Math.min(1,A3.aur);AUR.visible=A3.aur>.01;A3.frost=Math.max(0,A3.frost-dt);A3.flash=Math.max(0,A3.flash-dt*2.5);
 // основной проход
 R3.info.reset();R3.setRenderTarget(null);R3.clear();CAM.layers.set(0);R3.render(S3,CAM);
 if(A3.bloom){// проход bloom: только слой 1, тёмные силуэты остальных — через предварительную глубину сцены
  const bg=S3.background,fog=S3.fog;S3.background=null;S3.fog=null;R3.setRenderTarget(BL.a);R3.setClearColor(0x000000,1);R3.clear();
  S3.overrideMaterial=OCCL;CAM.layers.set(0);const hid=[GLOW,BEAM,DLT,SNOW,AUR,XTAL,SHLD,PAN,MOON,FIRS,GROUND3];hid.forEach(o=>o.visible=false);ACT.forEach(a=>a.m.visible=false);R3.render(S3,CAM);// глубина героев не нужна — только земля/низкополи как маска
  S3.overrideMaterial=null;hid.forEach(o=>o.visible=true);AUR.visible=A3.aur>.01;actorsVisFix();const gp=GLOW.material.uniforms.ps,ps0=gp.value;gp.value=ps0*BL.a.height/(RH*QDPR);CAM.layers.set(1);R3.render(S3,CAM);gp.value=ps0;CAM.layers.set(0);S3.background=bg;S3.fog=fog;
  const ts=BL.blur.uniforms;ts.tex.value=BL.a.texture;ts.dir.value.set(1/BL.a.width,0);quad(BL.blur,BL.b);ts.tex.value=BL.b.texture;ts.dir.value.set(0,1/BL.a.height);quad(BL.blur,BL.c);ts.tex.value=BL.c.texture;ts.dir.value.set(2/BL.a.width,0);quad(BL.blur,BL.b);ts.tex.value=BL.b.texture;ts.dir.value.set(0,2/BL.a.height);quad(BL.blur,BL.c);
  const cu=BL.comp.uniforms;cu.tex.value=BL.c.texture;cu.raw.value=BL.a.texture;cu.bl.value=1}
 const cu=BL.comp.uniforms;cu.slow.value=clamp((1-A3.TS)*1.3,0,1);cu.frost.value=Math.min(1,A3.frost);cu.flash.value=A3.flash;
 if(A3.bloom){R3.setRenderTarget(null);quad(BL.comp,null)}else if(cu.slow.value>.02||cu.frost.value>.02||A3.flash>.02){cu.bl.value=0;cu.tex.value=BL.a.texture;cu.raw.value=BL.a.texture;R3.setRenderTarget(null);quad(BL.comp,null)}
 R3.setClearColor(S3.background,1);A3.info.calls=R3.info.render.calls;A3.info.tris=R3.info.render.triangles;qualityTick(dt);G.r3=A3.info}
function actorsVisFix(){for(const a of ACT)a.m.visible=a.vis&&a.alpha>.01}
// эффекты
function slowmo(t){A3.slowT=t||1}
function cshake(k){A3.shake=Math.max(A3.shake,k||1)}
function punch(k){A3.punch=Math.max(A3.punch,k||.6)}
function vib(p){try{if(navigator.vibrate&&SND)navigator.vibrate(p)}catch(e){}}
