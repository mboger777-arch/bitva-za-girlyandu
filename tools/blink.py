# Кадры моргания *_blink.png: глаз закрашивается (inpaint по коже вокруг), сверху — тёмная дуга закрытого века с ресничками.
import numpy as np,cv2,sys,json
from PIL import Image
from scipy import ndimage
EY={'kira':[(163,145,14,16),(230,137,14,16)],'kira_think':[(143,133,13,14),(207,124,13,14)],'kira_point':[(228,133,13,15),(295,148,13,15)],'kira_cheer':[(250,132,14,16),(318,130,14,16)],
 'shu_orb':[(212,207,17,22),(318,208,21,24)],'shu_think':[(207,210,17,21),(320,222,21,23)],'shu_cheer':[(362,199,19,22),(470,197,18,22)]}
only=sys.argv[1:];INFO={}
NZ={'shu':.3}
FORCE={'kira':1.1,'kira_think':1.1,'kira_point':1.1,'kira_cheer':1.1}
WK={'kira':1.4,'kira_think':1.4,'kira_point':1.4,'kira_cheer':1.4}
for n,eyes in EY.items():
  if only and n not in only:continue
  im=np.array(Image.open(f'assets/sprites/{n}.png').convert('RGBA'));H,W=im.shape[:2];rgb=im[...,:3].astype(float);al=im[...,3]
  yy,xx=np.mgrid[0:H,0:W];out=im.copy();arcs=[]
  for (cx,cy,rx,ry) in eyes:
    K=WK.get(n,1.6);d=((xx-cx)/(rx*K))**2+((yy-cy)/(ry*K))**2
    ring=(d>1.25)&(d<2.2)&(al>250);skin=np.median(rgb[ring],0)
    diff=np.sqrt(((rgb-skin)**2).sum(-1))
    win=(d<1)&(al>200);cand=win&(diff>42)
    lab,nl=ndimage.label(cand);c0=lab[int(cy),int(cx)]
    if c0==0:
      sz=ndimage.sum(np.ones_like(lab),lab,range(1,nl+1)) if nl else [];c0=1+int(np.argmax(sz)) if nl else 0
    m=(lab==c0) if c0 else (((xx-cx)/rx)**2+((yy-cy)/ry)**2<1)
    m=ndimage.binary_fill_holes(m)
    if n in FORCE: m=m|((((xx-cx)/(rx*FORCE[n]))**2+((yy-cy)/(ry*FORCE[n]))**2<1)&(al>200))
    ys,xs=np.where(m);x0,x1,y0,y1=xs.min(),xs.max(),ys.min(),ys.max()
    # своё веко не должно быть больше разумного
    m=m|((((xx-(x0+x1)/2)/((x1-x0)/2+2))**2+(((yy-(y0+y1)/2)/((y1-y0)/2+2))**2)<1)&win)
    dark=rgb[m];lc=np.percentile(dark,8,axis=0)
    mm=cv2.dilate(m.astype(np.uint8)*255,np.ones((5,5),np.uint8))
    bgr=np.ascontiguousarray(out[...,:3][...,::-1])
    inp=cv2.inpaint(bgr,mm,7,cv2.INPAINT_TELEA)[...,::-1].astype(float)
    sd=rgb[ring].std(0)*NZ.get(n.split('_')[0],0);rng=np.random.default_rng(1);nz=cv2.GaussianBlur(rng.normal(0,1,(H,W)).astype(np.float32),(3,3),0)*1.6
    inp=np.clip(inp+nz[...,None]*sd[None,None,:],0,255)
    soft=cv2.GaussianBlur(mm.astype(float)/255,(7,7),0)[...,None]
    out[...,:3]=(inp*soft+out[...,:3]*(1-soft)).astype(np.uint8)
    arcs.append((x0,x1,y0,y1,lc))
  P=Image.fromarray(out);S=4;big=P.resize((W*S,H*S),Image.LANCZOS);A=np.array(big)
  for (x0,x1,y0,y1,lc) in arcs:
    cxm=(x0+x1)/2*S;yc=(y0+(y1-y0)*.55)*S;hw=(x1-x0)/2*S*1.02;sag=(y1-y0)*.22*S;th=max(3,(y1-y0)*.13)*S
    pts=np.array([[cxm+t*hw,yc+sag*(1-t*t)] for t in np.linspace(-1,1,40)],np.int32)
    col=tuple(int(v) for v in lc[::-1])
    cv2.polylines(A[...,:3].copy(),[pts],False,col,int(th)) # warm-up
    layer=np.ascontiguousarray(A[...,:3][...,::-1]);cv2.polylines(layer,[pts],False,col,int(th),cv2.LINE_AA)
    # реснички на внешнем крае
    for t in (-.95,.95):
      px,py=cxm+t*hw,yc+sag*(1-t*t);cv2.line(layer,(int(px),int(py)),(int(px+np.sign(t)*hw*.18),int(py-sag*.6-th*.4)),col,int(th*.7),cv2.LINE_AA)
    A[...,:3]=layer[...,::-1]
  P2=Image.fromarray(A).resize((W,H),Image.LANCZOS);a2=np.array(P2);a2[...,3]=al;Image.fromarray(a2).save(f'assets/sprites/{n}_blink.png');print(n,[a[:4] for a in arcs])
