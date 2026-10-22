# Полное прохождение настоящими тапами (hasTouch): титул→интро→карта→5 уровней→босс→медаль→бонус.
# На каждом вопросе: нарочная ошибка (проверяем, что засчитана и ввод не блокирован), затем исправление.
# Аудит текста в рамке, героев на земле и без растяжения, ошибки консоли, fps/r3, шишки и луна.
import asyncio,os,time,json,sys
from playwright.async_api import async_playwright
URL=os.environ.get('URL','http://127.0.0.1:8306/index.html')
VPS=[tuple(map(int,v.split('x'))) for v in os.environ.get('VPS','844x390,667x375,932x430').split(',')]
FAST=os.environ.get('FAST','1')=='1'
ARGS=['--autoplay-policy=no-user-gesture-required','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']
def log(*a):print(*a,flush=True)
async def run(b,W,H,F,R):
  tag=f'{W}x{H}';out=f'shots/play/{tag}';os.makedirs(out,exist_ok=True)
  ctx=await b.new_context(viewport={'width':W,'height':H},has_touch=True,is_mobile=True,device_scale_factor=2)
  pg=await ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and errs.append('console: '+m.text))
  await pg.goto(URL);await pg.evaluate('localStorage.clear()');await pg.reload();await pg.wait_for_function('G.scene==="title"',timeout=60000)
  await pg.evaluate(f'G.mute=true;G.fast={str(FAST).lower()}')
  st={'aud':0,'shots':0}
  async def tapd(x,y):
    q=await pg.evaluate(f'G.pg({x},{y})');await pg.touchscreen.tap(q['x'],q['y'])
  async def tapbtn(id,tmo=15):
    t0=time.time()
    while time.time()-t0<tmo:
      L=await pg.evaluate('G.btns()')
      for bt in L:
        if bt['id']==id and not bt['dis']:
          await tapd(bt['x'],bt['y']);await pg.wait_for_timeout(300);return True
      await pg.wait_for_timeout(150)
    F.append(f'{tag} {await pg.evaluate("G.scene")}: no button {id}');return False
  async def audit(where):
    st['aud']+=1
    await pg.evaluate('G.auditReq=1');await pg.wait_for_timeout(80)
    A=await pg.evaluate('({a:G._aud,v:vis(),g:GND,ac:(window.ARENA_ON===false?[]:(G.actors?G.actors():[])),sc:G.scene,S:S})')
    v=A['v'];a=A['a'] or {'t':[]}
    for t in a['t']:
      x0,y0,x1,y1=t['b'];pad=(y1-y0)*.18;y0+=pad;y1-=pad
      if x0<v['x0']-1 or x1>v['x0']+v['w']+1 or y0<v['y0']-1 or y1>v['y0']+v['h']+1:F.append(f"{tag} {where} text '{t['id']}' «{t['t']}» off-screen")
      if any(c.isdigit() for c in t.get('t','')) and t.get('css',99)<22:F.append(f"{tag} {where} small digits '{t['id']}' «{t['t']}» {t['css']:.1f}px")
      if t['box']:
        bx0,by0,bx1,by1=t['box']
        if x0<bx0-2 or x1>bx1+2 or y0<by0-4 or y1>by1+4:F.append(f"{tag} {where} text '{t['id']}' «{t['t']}» out of frame")
    for g in A['g']:
      if g.get('hero'):
        if abs(g['feet']-g['gl'])>2:F.append(f"{tag} {where} 2D hero {g['n']} floating")
        if abs(g['w']/g['h']-g['ar'])>0.01:F.append(f"{tag} {where} 2D hero {g['n']} stretched")
        if g['x']-g['w']/2<v['x0']-1 or g['x']+g['w']/2>v['x0']+v['w']+1:F.append(f"{tag} {where} 2D hero {g['n']} cut by edge")
    for c in A['ac']:
      if c['ar'] and abs(c['sar']-c['ar'])/c['ar']>0.01:F.append(f"{tag} {where} 3D {c['k']} stretched sar={c['sar']:.3f} ar={c['ar']:.3f}")
      if c['k'] in('ride','tree','cone','put_angry','put_kind','put_laugh') and abs(c['y'])>0.05:F.append(f"{tag} {where} 3D {c['k']} not on ground y={c['y']:.2f}")
  async def shot(name):
    st['shots']+=1;await pg.screenshot(path=f'{out}/{st["shots"]:02d}_{name}.png')
  async def perf(where):
    f=await pg.evaluate('G.fps()');r=await pg.evaluate('typeof G.r3=="function"?G.r3():G.r3');R.append(f'{tag} {where} fps={f} r3={r}')
  # титул → интро → карта
  await pg.wait_for_timeout(1200);await audit('title');await shot('title')
  await tapbtn('play');await pg.wait_for_function('G.scene==="intro"',timeout=8000)
  await pg.wait_for_timeout(1500);await audit('intro');await shot('intro')
  if await pg.evaluate('G.scene')=='intro':await tapbtn('skip',4)
  await pg.wait_for_function('G.scene==="map"',timeout=8000);await pg.wait_for_timeout(800);await audit('map');await shot('map')
  async def play(sc,fin,maxq=99):
    """играет текущую сцену до fin(); на каждом вопросе — ошибка и исправление"""
    t0=time.time();nq=0;seen=set();shot1=False;moon=False
    while time.time()-t0<300:
      if await pg.evaluate(fin):return nq
      if nq>=maxq and not await pg.evaluate('!!G.q()'):return nq
      q=await pg.evaluate('G.q()');gm=await pg.evaluate('G.gm()')
      c=await pg.evaluate('G.coneAt()')
      if c:await pg.evaluate(f'G.burTo({c["x"]},{c["z"]})');await pg.wait_for_timeout(200)
      if not moon and gm['bur'] and sc=='l2':
        m=await pg.evaluate('G.moon()');moon=True
        if m['p']['ok'] and 0<m['p']['y']<720:
          await pg.touchscreen.tap(m['pg']['x'],m['pg']['y']);await pg.wait_for_timeout(300)
          if not (await pg.evaluate('G.moon()'))['used']:F.append(f'{tag} moon tap not registered')
        else:F.append(f'{tag} moon not on screen {m["p"]}')
      if q and not gm['fly'] and q['tries']==0:
        nq+=1;key=json.dumps(q.get('opts'))+str(q.get('ans'))
        if not shot1:shot1=True;await pg.wait_for_timeout(350);await audit(sc+' q');await shot(sc+'_q')
        m0=await pg.evaluate('G.mist()')
        # ошибка
        if q.get('pick'):
          bad=[p for p in q['pick'] if p['id']!=q['ans']]
          good=[p for p in q['pick'] if p['id']==q['ans']]
          if not good:F.append(f'{tag} {sc} q{nq}: correct pick missing');return nq
          if bad:b0=bad[0]['b'];await tapd((b0[0]+b0[2])/2,(b0[1]+b0[3])/2)
          else:R.append(f'{tag} {sc} q{nq}: no wrong pick')
        else:
          bad=[i for i in range(len(q['opts'])) if i!=q['ans']]
          if bad:p=await pg.evaluate(f'G.trayPg({bad[0]})');await pg.touchscreen.tap(p['x'],p['y'])
          else:R.append(f'{tag} {sc} q{nq}: no wrong opt')
        tm=time.time()
        while await pg.evaluate('G.mist()')<=m0 and time.time()-tm<3:await pg.wait_for_timeout(30)
        if await pg.evaluate('G.mist()')<=m0:F.append(f'{tag} {sc} q{nq}: mistake not registered')
        if nq==2:await pg.wait_for_timeout(120);await shot(sc+'_miss')
        # исправление: сразу, как только ядро вернулось
        tm=time.time()
        while (await pg.evaluate('G.gm()'))['fly'] and time.time()-tm<3:await pg.wait_for_timeout(30)
        lag=(time.time()-tm)*1000
        if lag>900:F.append(f'{tag} {sc} q{nq}: input blocked {lag:.0f}ms after mistake')
        q2=await pg.evaluate('G.q()')
        if not q2:F.append(f'{tag} {sc} q{nq}: question vanished after mistake');continue
        if q2.get('pick'):
          g=[p for p in q2['pick'] if p['id']==q2['ans']][0]['b'];await tapd((g[0]+g[2])/2,(g[1]+g[3])/2)
        else:
          p=await pg.evaluate(f'G.trayPg({q2["ans"]})');await pg.touchscreen.tap(p['x'],p['y'])
        tm=time.time()
        while await pg.evaluate('!!G.q()&&G.q().tries>=1&&JSON.stringify(G.q().opts)+G.q().ans==='+json.dumps(key)) and time.time()-tm<3:await pg.wait_for_timeout(40)
        if await pg.evaluate('!!G.q()&&G.q().tries>=1&&JSON.stringify(G.q().opts)+G.q().ans==='+json.dumps(key)):F.append(f'{tag} {sc} q{nq}: correct answer not accepted')
        if nq==1:await pg.wait_for_timeout(150);await shot(sc+'_ok')
        if nq%2==1:await audit(f'{sc} q{nq}')
      else:
        if gm['en']>0:await pg.evaluate('G.killAll()')
        await pg.wait_for_timeout(150)
    F.append(f'{tag} {sc}: timeout (nq={nq})');return nq
  for n in range(1,6):
    sc=f'l{n}'
    await tapbtn(f'z{n}');
    try:await pg.wait_for_function(f'G.scene==="{sc}"',timeout=8000)
    except Exception:F.append(f'{tag} map node z{n} did not open {sc}');await pg.evaluate(f'G.go("{sc}")')
    await pg.wait_for_timeout(2500 if not FAST else 900);await audit(sc+' start');await perf(sc)
    nq=await play(sc,'G.lv().done');R.append(f'{tag} {sc}: {nq} questions')
    await pg.wait_for_timeout(700);await audit(sc+' win');await shot(sc+'_win')
    await tapbtn('next');await pg.wait_for_function('G.scene==="map"',timeout=8000);await pg.wait_for_timeout(500)
  cones=await pg.evaluate('G.S().cones');R.append(f'{tag} cones {cones}')
  if not all(cones):F.append(f'{tag} not all cones collected {cones}')
  await audit('map all');await shot('map_all')
  await tapbtn('z6');await pg.wait_for_function('G.scene==="boss"',timeout=8000);await pg.wait_for_timeout(1500);await perf('boss');await audit('boss')
  nq=await play('boss','G.scene==="medal"');R.append(f'{tag} boss: {nq} questions')
  await pg.wait_for_timeout(1200);await audit('medal');await shot('medal')
  if not await pg.evaluate('!!G.S().fin'):F.append(f'{tag} SV.fin not set')
  await tapbtn('tomap');await pg.wait_for_function('G.scene==="map"',timeout=8000);await pg.wait_for_timeout(600)
  if await tapbtn('bonus',5):
    await pg.wait_for_function('G.scene==="bonus"',timeout=8000);await pg.wait_for_timeout(1500);await perf('bonus')
    nq=await play('bonus','false',1);await shot('bonus');R.append(f'{tag} bonus: {nq} q')
  sec=await pg.evaluate('G.S().sec');R.append(f'{tag} secrets {sec}')
  # портрет: подсказка поворота
  await pg.set_viewport_size({'width':H,'height':W});await pg.wait_for_timeout(700);await pg.screenshot(path=f'{out}/99_portrait.png')
  rot=await pg.evaluate('typeof rotOn!=="undefined"?rotOn():(G.rot?G.rot():null)');R.append(f'{tag} portrait rot={rot}')
  if errs:F.append(f'{tag} errors {errs[:5]}')
  R.append(f'{tag} audits={st["aud"]} mistakes={await pg.evaluate("G.mist()")}')
  await ctx.close()
async def main():
  F=[];R=[]
  async with async_playwright() as p:
    b=await p.chromium.launch(args=ARGS)
    for W,H in VPS:
      try:await run(b,W,H,F,R)
      except Exception as e:F.append(f'{W}x{H} EXC {e!r}'[:500])
      log('\n'.join(R));R.clear()
    await b.close()
  log('FAIL' if F else 'OK');log('\n'.join(F))
asyncio.run(main())
