/* ============================================================
   CASHHARDCLUB — The Vault · app.js
   Engine invariants preserved: parse-time clip-A fetch (inline in
   index.html), staged clip loading, buffered-gated scrub, forward
   playbackRate + chained seeks, idle-yield frame store, lazy media,
   orientation reload, posters off the critical path.
   ============================================================ */
(async function(){
"use strict";

/* ---------- config + data ---------- */
let DATA;
try{
  DATA = await (await fetch("products.json", {cache:"no-cache"})).json();
}catch(e){ console.error("products.json failed", e); return; }

const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const coarse  = matchMedia("(pointer: coarse)").matches;
const fine    = matchMedia("(pointer: fine)").matches;
const sleep   = ms=>new Promise(r=>setTimeout(r,ms));
const orient  = window.__orient || (innerHeight >= innerWidth ? "portrait" : "landscape");
const SRC     = DATA.clips[orient];          /* {list:[A,B,OUT], poster} */
const P       = DATA.products;               /* 8 products */
const DUR_EST = [10,10,6];

const $ = id => document.getElementById(id);
const els = {
  boot:$("boot"), chip:$("chip"), chipLbl:$("chipLabel"), chipPct:$("chipPct"),
  toast:$("toast"), vault:$("vault"), stage:$("stage"),
  vids:[$("vidA"),$("vidB"),$("vidOut")], canvas:$("frameCanvas"), poster:$("fallbackPoster"),
  title:$("titleOverlay"), rail:$("rail"), flyers:$("flyers"), grid:$("grid"),
  ticks:[...document.querySelectorAll(".tick")],
  cartBtn:$("cartBtn"), cartCount:$("cartCount"), shopAll:$("shopAllBtn"),
  reveal:$("reveal"), rvScrim:$("revealScrim"), rvBg:$("revealBg"), rvNum:$("rvNum"),
  rvImg:$("rvImg"), rvPanel:$("rvPanel"), rvBay:$("rvBay"), rvName:$("rvName"),
  rvPrice:$("rvPrice"), rvSizes:$("rvSizes"), rvQty:$("rvQty"), rvAdd:$("rvAdd"),
  rvColors:$("rvColors"), rvColorsLabel:$("rvColorsLabel"),
  rvBuy:$("rvBuy"), rvDesc:$("rvDesc"), rvPhotos:$("rvPhotos"), rvClose:$("rvClose"),
  qMinus:$("qMinus"), qPlus:$("qPlus"), ghost:$("flipGhost"), flyDot:$("flyDot"),
  ledger:$("ledger"), ledgerScrim:$("ledgerScrim"), ledgerItems:$("ledgerItems"),
  ledgerTotal:$("ledgerTotal"), ledgerClose:$("ledgerClose"), ledgerCheckout:$("ledgerCheckout"),
  handoff:$("handoff"), handoffLinks:$("handoffLinks")
};
const ctx = els.canvas.getContext("2d",{alpha:false});
const money = n => "$"+n.toFixed(2);
const priceHTML = p => money(p.price)+(p.was?'<span class="was">'+money(p.was)+"</span>":"");

/* ---------- boot loader ---------- */
function bootOff(){ els.boot.classList.add("off"); }
setTimeout(bootOff, 3000);

/* ---------- toast + chip ---------- */
let toastT=null;
function toast(msg){
  els.toast.textContent = msg;
  els.toast.classList.add("show");
  clearTimeout(toastT); toastT=setTimeout(()=>els.toast.classList.remove("show"),1600);
}
function chipShow(l,p){ els.chipLbl.textContent=l; els.chipPct.textContent=p; els.chip.classList.add("show"); }
function chipHide(){ els.chip.classList.remove("show"); }

/* ============================================================
   THREE-CLIP SCRUB ENGINE  (A: door→corridor · B: deeper · OUT: seal)
   ============================================================ */
const clips = SRC.list.map((url,i)=>({
  url, el:els.vids[i], dur:0, full:false, started:i===0, failed:false, i
}));
clips.forEach(c=>{
  c.el.addEventListener("loadedmetadata", ()=>{ c.dur = c.el.duration||0; });
  c.el.addEventListener("seeked", ()=>{ c.el._pend=false; });
  c.el.addEventListener("error", ()=>{
    if(c.freed) return;                       /* we removed the src on purpose */
    if(c.i===0){ engineDead(); } else { c.failed=true; }
  });
});
let aOK=true;
function engineDead(){
  aOK=false; clips.forEach(c=>c.el.style.display="none"); showPoster(); chipHide(); bootOff();
}
function showPoster(){
  if(!els.poster.src) els.poster.src = SRC.poster;
  els.poster.style.display="block";
}
if(reduced){ clips[0].el.style.display="none"; showPoster(); bootOff(); }
clips[0].el.addEventListener("loadeddata", bootOff, {once:true});

let unlocked=false;
function unlock(){
  if(unlocked||reduced) return; unlocked=true;
  clips.forEach(c=>{ if(!c.el.src) return;
    const p=c.el.play(); if(p&&p.then) p.then(()=>c.el.pause()).catch(()=>{ playBlocked=true; }); });
}
["pointerdown","touchstart","wheel","keydown","scroll"].forEach(ev=>
  addEventListener(ev, unlock, {once:true, passive:true}));

function startClip(i){
  const c=clips[i]; if(!c || c.started || reduced || !aOK) return;
  c.started=true; c.el.src=c.url; c.el.preload="auto"; c.el.load();
  if(unlocked) c.el.addEventListener("loadeddata", ()=>{
    const p=c.el.play(); if(p&&p.then) p.then(()=>c.el.pause()).catch(()=>{});
  }, {once:true});
}
function bufEnd(v){ try{const b=v.buffered; return b.length?b.end(b.length-1):0;}catch(e){return 0;} }
function markFull(){
  clips.forEach(c=>{
    if(c.started && !c.full && !c.failed && c.dur && bufEnd(c.el) >= c.dur-0.4) c.full=true;
  });
}
function durOf(i){ const c=clips[i]; return c.failed?0:(c.dur||DUR_EST[i]); }
function totalDur(){ return durOf(0)+durOf(1)+durOf(2); }
function clipStart(i){ let s=0; for(let k=0;k<i;k++) s+=durOf(k); return s; }

let playBlocked=false;
function setRate(v,r){ try{v.playbackRate=r;}catch(e){try{v.playbackRate=Math.min(r,4);}catch(e2){v.playbackRate=2;}} }
function scrubEl(v,t){
  const d=t-v.currentTime;
  const dead=playBlocked?0.05:0.12;
  if(Math.abs(d)<dead){ if(!v.paused)v.pause(); return; }
  /* forward motion normally rides playbackRate; if autoplay is refused we must seek instead
     or the film would never advance at all (desktop wheel-scroll never grants a gesture) */
  if(!playBlocked && d>0 && d<3){
    setRate(v, Math.min(8, Math.max(0.35, d*3)));
    if(v.paused){
      const p=v.play();
      if(p&&p.then) p.catch(()=>{ playBlocked=true; });
    }
  }else{
    if(!v.paused) v.pause();
    if(!v._pend){
      v._pend=true;
      if(typeof v.fastSeek==="function" && Math.abs(d)>1.5) v.fastSeek(t);
      else v.currentTime=t;
    }
  }
}
let activeSeg=0;
function setActive(i){
  if(activeSeg===i) return;
  clips.forEach((c,k)=>{
    if(k===i){ c.el.style.display="block"; }
    else{
      c.el.pause();
      c.el.style.display="none";
      if(k<i && c.dur) c.el.currentTime = Math.max(0, c.dur-0.04);   /* park earlier clips at their end */
      if(k>i) { if(c.dur) c.el.currentTime = 0; }
    }
  });
  activeSeg=i;
}

/* ---------- per-clip frame stores: each clip goes smooth as soon as IT is cached ---------- */
const clipFrames=[null,null,null];
const devMem=navigator.deviceMemory||4;
/* Hard memory ceiling. Every stored frame costs w*h*4 bytes; the previous settings could
   reach ~700MB on desktop, which stalls or kills the tab. Budget it explicitly instead. */
const FRAME_BUDGET_MB = coarse ? (devMem>=6?90:60) : 140;
const dims={max: coarse?640:900, fw:0, fh:0};
let lastKey="", lastScrollTs=performance.now(), capBusy=false, canvasOn=false, framesOff=false;
function frameCap(){
  if(!dims.fw) return 60;
  const perFrameMB=(dims.fw*dims.fh*4)/1048576;
  return Math.max(8, Math.floor(FRAME_BUDGET_MB/Math.max(0.05,perFrameMB)));
}
function drawFrame(arr,u){
  const i=Math.max(0,Math.min(arr.length-1,Math.round(u*(arr.length-1))));
  const key=arr._id+":"+i;
  if(key===lastKey) return; lastKey=key;
  ctx.drawImage(arr[i],0,0,els.canvas.width,els.canvas.height);
}
function seekAwait(v,t){
  return new Promise(res=>{
    let done=false;
    const fin=()=>{ if(done)return; done=true; v.removeEventListener("seeked",fin); res(); };
    v.addEventListener("seeked",fin);
    v.currentTime=t;
    setTimeout(fin,900);
  });
}
async function loadCap(url,useCORS){
  const cap=document.createElement("video");
  if(useCORS) cap.crossOrigin="anonymous";
  cap.muted=true; cap.playsInline=true; cap.preload="auto"; cap.src=url;
  await new Promise((res,rej)=>{
    cap.addEventListener("loadeddata",res,{once:true});
    cap.addEventListener("error",rej,{once:true});
    cap.load(); setTimeout(()=>rej(new Error("t")),20000);
  });
  try{const p=cap.play(); if(p&&p.then) await p.then(()=>cap.pause()).catch(()=>{});}catch(e){}
  return cap;
}
async function captureOne(c){
  const t0=performance.now();
  let cap;
  try{ cap=await loadCap(c.url,true); }catch(e){ cap=await loadCap(c.url,false); }
  const dur=cap.duration; if(!dur||!isFinite(dur)) throw new Error("nd");
  if(!dims.fw){
    const s=Math.min(1,dims.max/Math.max(cap.videoWidth,cap.videoHeight));
    dims.fw=Math.max(2,Math.round(cap.videoWidth*s));
    dims.fh=Math.max(2,Math.round(cap.videoHeight*s));
    els.canvas.width=dims.fw; els.canvas.height=dims.fh;
  }
  const T=clips.reduce((s,x)=>s+(x.failed?0:(x.dur||DUR_EST[x.i])),0)||dur;
  const share=Math.max(0.05,dur/T);
  const n=Math.max(8,Math.min(90,Math.round(frameCap()*share)));
  const out=[];
  for(let i=0;i<n;i++){
    /* never capture while the user is actively scrolling — capture is the jank source */
    while(performance.now()-lastScrollTs<400){ chipHide(); await sleep(180); }
    chipShow("Smoothing playback", Math.round((i/n)*100)+"%");
    await seekAwait(cap,(i/(n-1))*Math.max(0,dur-0.06));
    const cv=document.createElement("canvas");
    cv.width=dims.fw; cv.height=dims.fh;
    cv.getContext("2d",{alpha:false}).drawImage(cap,0,0,dims.fw,dims.fh);
    out.push(cv);
    if(performance.now()-t0>150000) throw new Error("slow");
  }
  cap.removeAttribute("src"); cap.load();
  out._id=c.i;
  clipFrames[c.i]=out;
  /* this clip's <video> is now dead weight — free the decoder and its memory */
  c.freed=true;
  c.el.pause(); c.el.style.display="none";
  c.el.removeAttribute("src"); c.el.load();
}
async function pumpCaptures(){
  if(capBusy||reduced||!aOK||framesOff) return;
  capBusy=true;
  try{
    for(const c of clips){
      if(c.failed||c.freed||clipFrames[c.i]||!c.full) continue;
      const t=performance.now();
      await captureOne(c);
      /* if capturing one clip was punishing, don't attempt the rest */
      if(performance.now()-t>120000) framesOff=true;
    }
  }catch(e){ framesOff=true; /* stay on video scrub for whatever didn't capture */ }
  finally{ capBusy=false; chipHide(); }
}

/* ============================================================
   TIMELINE  — stations defined in FILM SECONDS
   ============================================================ */
const stations = P.map((p,i)=>({p, i, range:DATA.stations[i]}));
function vaultProgress(){
  const r=els.vault.getBoundingClientRect();
  const total=r.height-innerHeight;
  if(total<=0) return 1;
  return Math.min(1,Math.max(0,-r.top/total));
}

/* sealed title injected into stage */
const sealed=document.createElement("div");
sealed.className="overlay"; sealed.id="sealedOverlay";
sealed.innerHTML='<div class="eyebrow">The door closes behind you</div><h1 class="foil">SEALED</h1><p class="sub">The full collection awaits below.</p>';
els.stage.appendChild(sealed);

/* ============================================================
   PRODUCT FLIGHT (+ velocity skew, tap-to-open)
   ============================================================ */
const F=[];
stations.forEach((s,i)=>{
  const d=document.createElement("div");
  d.className="flyer "+(i%2?"side-l":"side-r");
  d.innerHTML=`
    <div class="fmove" data-open="${i}" role="button" tabindex="-1" aria-label="Open ${s.p.name}">
      <div class="aura"></div>
      <img class="cutout" data-src="${s.p.cut}" alt="${s.p.name}" decoding="async"
           onerror="if(this.dataset.fb!=='1'){this.dataset.fb='1';this.src='${s.p.img}';}">
      ${i===0?'<div class="tapopen">Tap the piece to open it</div>':''}
    </div>
    <div class="pinfo plaque">
      <div class="bayno">${s.p.bay}</div>
      <div class="pname display">${s.p.name}</div>
      <div class="price num">${priceHTML(s.p)}</div>
      <div class="btnrow">
        <button class="btn btn-cart" data-open="${i}">Add to Cart</button>
        <a class="btn btn-buy" href="${s.p.url}" target="_blank" rel="noopener">Buy Now</a>
      </div>
    </div>`;
  els.flyers.appendChild(d);
  F.push({root:d, move:d.querySelector(".fmove"), aura:d.querySelector(".aura"),
          img:d.querySelector(".cutout"), info:d.querySelector(".pinfo"), shown:false, live:false});
});
const outCubic=t=>1-Math.pow(1-t,3), inCubic=t=>t*t*t;
function primeFlyer(i){ const f=F[i]; if(f.img && !f.img.src) f.img.src=f.img.dataset.src; }

let velo=0;
function updateFlyers(g, now){
  const wide=innerWidth>760;
  for(let i=0;i<stations.length;i++){
    const s=stations[i], f=F[i];
    const u=(g-s.range[0])/(s.range[1]-s.range[0]);
    if(u>-0.8 && u<1.3) primeFlyer(i);
    if(u<=0||u>=1){
      if(f.shown){
        f.root.style.visibility="hidden";
        f.root.style.pointerEvents="none";
        f.info.style.pointerEvents="none";
        f.info.classList.remove("live"); f.live=false;
        f.shown=false;
      }
      continue;
    }
    if(!f.shown){ f.root.style.visibility="visible"; f.shown=true; }
    const dir=(i%2)?-1:1;
    const targetX=wide?dir*innerWidth*0.12:0;
    let scale,x,y,rot,op;
    if(u<0.32){
      const k=outCubic(u/0.32);
      scale=0.05+0.95*k; x=targetX*k; y=-innerHeight*0.09*(1-k);
      rot=dir*14*(1-k); op=Math.min(1,k*1.6);
    }else if(u<0.72){
      scale=1; x=targetX; y=Math.sin(now*0.0012+i)*4; rot=0; op=1;
    }else{
      const q=inCubic((u-0.72)/0.28);
      scale=1+1.15*q; x=targetX+dir*innerWidth*0.22*q; y=innerHeight*0.06*q;
      rot=dir*-8*q; op=1-q;
    }
    const skew=Math.max(-3,Math.min(3,velo*140));        /* scroll-velocity lean */
    const stretch=1+Math.min(0.045,Math.abs(velo)*2.4);
    f.move.style.transform=
      `translate(-50%,-50%) translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) rotate(${rot.toFixed(2)}deg) skewY(${skew.toFixed(2)}deg) scale(${scale.toFixed(4)}) scaleY(${stretch.toFixed(4)})`;
    f.move.style.opacity=op.toFixed(3);
    f.aura.style.opacity=(op*0.9*(u<0.32?u/0.32:(u>0.72?(1-u)/0.28:1))).toFixed(3);
    const infoIn=Math.min(1,Math.max(0,(u-0.26)/0.14));
    const infoOut=Math.min(1,Math.max(0,(u-0.66)/0.10));
    const infoOp=outCubic(infoIn)*(1-inCubic(infoOut));
    f.info.style.opacity=infoOp.toFixed(3);
    f.info.style.transform=(wide?"translateY(-40%) ":"translateX(-50%) ")+`translate3d(0,${(24*(1-infoIn)).toFixed(1)}px,0)`;
    const live=infoOp>0.5;
    if(live!==f.live){ f.live=live; f.info.classList.toggle("live",live); }
    f.info.style.pointerEvents=live?"auto":"none";
    f.root.style.pointerEvents=live?"auto":"none";
  }
}

/* ============================================================
   COLLECTION GRID
   ============================================================ */
P.forEach((p,i)=>{
  const c=document.createElement("article");
  c.className="card";
  c.innerHTML=`
    <div class="ph" data-open="${i}"><img src="${p.img}" alt="${p.name}" loading="lazy" onerror="this.style.display='none'"></div>
    <div class="body">
      <div class="pname display">${p.name}</div>
      <div class="price num">${priceHTML(p)}</div>
      <div class="btnrow">
        <button class="btn btn-cart" data-open="${i}">Add to Cart</button>
        <a class="btn btn-buy" href="${p.url}" target="_blank" rel="noopener">Buy Now</a>
      </div>
    </div>`;
  els.grid.appendChild(c);
});
els.shopAll.addEventListener("click",()=>document.getElementById("collection").scrollIntoView({behavior:reduced?"auto":"smooth"}));

/* ============================================================
   PRODUCT REVEAL — FLIP open/close, bay-loop backdrop, tilt
   ============================================================ */
let rvOpenIdx=-1, rvSize=null, rvColor=null, rvQty=1, savedY=0, gyroAsked=false;
const ROMAN=["I","II","III","IV","V","VI","VII","VIII"];

function lockScroll(){
  savedY=scrollY;
  document.body.style.position="fixed";
  document.body.style.top=(-savedY)+"px";
  document.body.style.left="0"; document.body.style.right="0";
}
function unlockScroll(){
  document.body.style.position=""; document.body.style.top="";
  document.body.style.left=""; document.body.style.right="";
  scrollTo(0,savedY);
}
function flip(fromRect,toRect,src,done){
  if(reduced||!fromRect||!toRect){ done(); return; }
  const g=els.ghost;
  g.src=src; g.style.display="block";
  g.style.left="0"; g.style.top="0";
  g.style.width=fromRect.width+"px"; g.style.height=fromRect.height+"px";
  const dx=toRect.left-fromRect.left+(toRect.width-fromRect.width)/2*0;
  g.style.transform=`translate(${fromRect.left}px,${fromRect.top}px)`;
  const anim=g.animate([
    {transform:`translate(${fromRect.left}px,${fromRect.top}px) scale(1)`},
    {transform:`translate(${toRect.left+(toRect.width-fromRect.width)/2}px,${toRect.top+(toRect.height-fromRect.height)/2}px) scale(${toRect.width/fromRect.width})`}
  ],{duration:440,easing:"cubic-bezier(.2,.8,.2,1)"});
  anim.onfinish=()=>{ g.style.display="none"; done(); };
}
function openReveal(i, sourceEl, pushHash=true){
  if(rvOpenIdx===i && els.reveal.classList.contains("open")) return;
  const p=P[i]; rvOpenIdx=i; rvSize=null; rvColor=null; rvQty=1;
  els.rvBay.textContent=p.bay;
  els.rvName.textContent=p.name;
  els.rvPrice.innerHTML=priceHTML(p);
  els.rvDesc.textContent=p.desc;
  els.rvNum.textContent=ROMAN[i];
  els.rvBuy.href=p.url;
  els.rvQty.textContent="1";
  els.rvSizes.innerHTML=p.sizes.map(s=>`<button class="size" data-s="${s}">${s}</button>`).join("");
  if(p.sizes.length===1){ rvSize=p.sizes[0]; els.rvSizes.querySelector(".size").classList.add("sel"); }
  /* color chips — only for products with a real variant (e.g. Doberman tee) */
  const hasColors = Array.isArray(p.colors) && p.colors.length > 0;
  els.rvColors.style.display = hasColors ? "" : "none";
  els.rvColorsLabel.style.display = hasColors ? "" : "none";
  els.rvColors.innerHTML = hasColors
    ? p.colors.map(c=>`<button class="size" data-c="${c}">${c}</button>`).join("")
    : "";
  if(hasColors && p.colors.length===1){
    rvColor=p.colors[0]; els.rvColors.querySelector(".size").classList.add("sel");
  }
  els.rvPhotos.innerHTML=`<img src="${p.img}" alt="${p.name} photo">`;
  els.rvImg.classList.remove("ready");
  els.rvImg.src=p.cut;
  els.rvImg.onerror=()=>{ els.rvImg.onerror=null; els.rvImg.src=p.img; };
  /* looping bay backdrop — lazy, dimmed */
  els.rvBg.classList.remove("ready");
  if(!reduced && p.loop){
    els.rvBg.src=p.loop;
    els.rvBg.addEventListener("loadeddata",()=>{
      els.rvBg.classList.add("ready");
      els.rvBg.play().catch(()=>{});
    },{once:true});
    els.rvBg.load();
  }
  const fromRect = sourceEl ? sourceEl.getBoundingClientRect() : null;
  lockScroll();
  els.reveal.classList.add("open");
  requestAnimationFrame(()=>{
    const toRect=els.rvImg.getBoundingClientRect();
    flip(fromRect,toRect,p.cut,()=>els.rvImg.classList.add("ready"));
    if(!fromRect) els.rvImg.classList.add("ready");
  });
  if(pushHash){ try{ history.pushState(null,"","#/product/"+p.id); }catch(e){} }
  els.rvClose.focus({preventScroll:true});
}
function closeReveal(clearHash=true){
  if(!els.reveal.classList.contains("open")) return;
  els.reveal.classList.remove("open");
  els.rvBg.pause(); els.rvBg.removeAttribute("src"); els.rvBg.load();
  els.rvImg.style.transform="";
  unlockScroll();
  rvOpenIdx=-1;
  if(clearHash){ try{ history.pushState(null,"",location.pathname+location.search); }catch(e){} }
}
els.rvClose.addEventListener("click",()=>closeReveal());
els.rvScrim.addEventListener("click",()=>closeReveal());
addEventListener("keydown",e=>{
  if(e.key==="Escape"){ closeReveal(); closeLedger(); }
});
els.rvSizes.addEventListener("click",e=>{
  const b=e.target.closest(".size"); if(!b) return;
  rvSize=b.dataset.s;
  els.rvSizes.querySelectorAll(".size").forEach(x=>x.classList.toggle("sel",x===b));
});
els.rvColors.addEventListener("click",e=>{
  const b=e.target.closest(".size"); if(!b) return;
  rvColor=b.dataset.c;
  els.rvColors.querySelectorAll(".size").forEach(x=>x.classList.toggle("sel",x===b));
});
els.qMinus.addEventListener("click",()=>{ rvQty=Math.max(1,rvQty-1); els.rvQty.textContent=rvQty; });
els.qPlus.addEventListener("click",()=>{ rvQty=Math.min(9,rvQty+1); els.rvQty.textContent=rvQty; });

/* garment tilt: pointer (fine) + gyroscope (coarse, permission-gated) */
function applyTilt(rx,ry){
  els.rvImg.style.transform=`perspective(900px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
}
if(fine){
  els.reveal.addEventListener("pointermove",e=>{
    if(!els.reveal.classList.contains("open")) return;
    const cx=innerWidth/2, cy=innerHeight/2;
    applyTilt(((e.clientY-cy)/cy)*-6, ((e.clientX-cx)/cx)*6);
  });
}
function armGyro(){
  const h=e=>{
    if(!els.reveal.classList.contains("open")) return;
    const ry=Math.max(-6,Math.min(6,(e.gamma||0)/6));
    const rx=Math.max(-6,Math.min(6,((e.beta||0)-45)/6));
    applyTilt(rx,ry);
  };
  try{
    if(typeof DeviceOrientationEvent!=="undefined" && typeof DeviceOrientationEvent.requestPermission==="function"){
      DeviceOrientationEvent.requestPermission()
        .then(s=>{ if(s==="granted") addEventListener("deviceorientation",h); })
        .catch(()=>{});
    }else{
      addEventListener("deviceorientation",h);
    }
  }catch(e){}
}
if(coarse){
  els.rvImg.addEventListener("pointerdown",()=>{ if(!gyroAsked){ gyroAsked=true; armGyro(); } });
}

/* open triggers (flyers + grid) */
document.addEventListener("click",e=>{
  const t=e.target.closest("[data-open]");
  if(!t) return;
  e.preventDefault();
  const i=+t.dataset.open;
  const srcImg=t.closest(".flyer")?.querySelector(".cutout") || t.querySelector("img") || t.closest(".card")?.querySelector(".ph img");
  openReveal(i, srcImg||null);
});

/* hash routing */
function routeFromHash(push){
  const m=location.hash.match(/^#\/product\/([\w-]+)/);
  if(m){
    const i=P.findIndex(p=>p.id===m[1]);
    if(i>-1){ openReveal(i,null,false); return; }
  }
  closeReveal(false);
}
addEventListener("popstate",()=>routeFromHash(false));
if(location.hash.startsWith("#/product/")) routeFromHash(false);

/* ============================================================
   THE LEDGER — cart (localStorage) + fly-to-cart + Phase-A checkout
   ============================================================ */
let cart=[];
try{ cart=JSON.parse(localStorage.getItem("chc_cart_v1")||"[]"); }catch(e){ cart=[]; }
function saveCart(){ try{ localStorage.setItem("chc_cart_v1",JSON.stringify(cart)); }catch(e){} }
function cartQty(){ return cart.reduce((s,l)=>s+l.qty,0); }
function renderCart(){
  els.cartCount.textContent=cartQty();
  els.handoff.classList.remove("on");
  if(!cart.length){
    els.ledgerItems.innerHTML='<div id="ledgerEmpty">THE VAULT IS EMPTY.<br>EARN SOMETHING.</div>';
    els.ledgerTotal.textContent="$0.00";
    return;
  }
  els.ledgerItems.innerHTML=cart.map((l,idx)=>{
    const p=P.find(x=>x.id===l.id);
    return `<div class="li">
      <img src="${p.cut}" alt="" onerror="this.src='${p.img}'">
      <div class="in">
        <div class="n">${p.name}</div>
        <div class="m">SIZE ${l.size}${l.color ? " · " + String(l.color).toUpperCase() : ""} · ${money(p.price)}</div>
        <div class="row">
          <button class="qbtn" data-q="-1" data-i="${idx}">−</button>
          <span class="num">${l.qty}</span>
          <button class="qbtn" data-q="1" data-i="${idx}">+</button>
          <span class="p num">${money(p.price*l.qty)}</span>
        </div>
        <button class="rm" data-rm="${idx}">Remove</button>
      </div>
    </div>`;
  }).join("");
  const total=cart.reduce((s,l)=>{const p=P.find(x=>x.id===l.id);return s+p.price*l.qty;},0);
  els.ledgerTotal.textContent=money(total);
}
renderCart();
els.ledgerItems.addEventListener("click",e=>{
  const q=e.target.closest("[data-q]"), rm=e.target.closest("[data-rm]");
  if(q){
    const l=cart[+q.dataset.i]; l.qty+=+q.dataset.q;
    if(l.qty<=0) cart.splice(+q.dataset.i,1);
    saveCart(); renderCart(); return;
  }
  if(rm){ cart.splice(+rm.dataset.rm,1); saveCart(); renderCart(); }
});
function openLedger(){ els.ledger.classList.add("on"); els.ledgerScrim.classList.add("on"); }
function closeLedger(){ els.ledger.classList.remove("on"); els.ledgerScrim.classList.remove("on"); els.handoff.classList.remove("on"); }
els.cartBtn.addEventListener("click",()=>{ renderCart(); openLedger(); });
els.ledgerClose.addEventListener("click",closeLedger);
els.ledgerScrim.addEventListener("click",closeLedger);
els.ledgerCheckout.addEventListener("click",()=>{
  if(!cart.length){ toast("The ledger is empty"); return; }
  els.handoffLinks.innerHTML=cart.map(l=>{
    const p=P.find(x=>x.id===l.id);
    return `<a class="hl" href="${p.url}" target="_blank" rel="noopener">${p.name} · ${l.qty}× ${l.size}${l.color ? " " + l.color : ""} →</a>`;
  }).join("");
  els.handoff.classList.add("on");
});
function flyToCart(){
  const p=P[rvOpenIdx]; if(!p) return;
  const from=els.rvImg.getBoundingClientRect();
  const to=els.cartBtn.getBoundingClientRect();
  const d=els.flyDot;
  d.src=p.cut; d.style.display="block";
  d.animate([
    {transform:`translate(${from.left+from.width/2-27}px,${from.top+from.height/2-33}px) scale(1.4)`,opacity:1},
    {transform:`translate(${(from.left+to.left)/2}px,${Math.min(from.top,to.top)-60}px) scale(.8)`,opacity:1,offset:.55},
    {transform:`translate(${to.left}px,${to.top}px) scale(.12)`,opacity:.2}
  ],{duration:650,easing:"cubic-bezier(.3,.7,.3,1)"}).onfinish=()=>{
    d.style.display="none";
    els.cartBtn.classList.remove("pulse"); void els.cartBtn.offsetWidth;
    els.cartBtn.classList.add("pulse");
  };
}
els.rvAdd.addEventListener("click",()=>{
  const p=P[rvOpenIdx]; if(!p) return;
  if(!rvSize){
    els.rvSizes.classList.remove("need"); void els.rvSizes.offsetWidth;
    els.rvSizes.classList.add("need");
    toast("Pick a size first"); return;
  }
  if(Array.isArray(p.colors) && p.colors.length && !rvColor){
    els.rvColors.classList.remove("need"); void els.rvColors.offsetWidth;
    els.rvColors.classList.add("need");
    toast("Pick a color first"); return;
  }
  const line=cart.find(l=>l.id===p.id && l.size===rvSize && (l.color||null)===rvColor);
  if(line) line.qty=Math.min(9,line.qty+rvQty); else cart.push({id:p.id,size:rvSize,color:rvColor,qty:rvQty});
  saveCart(); renderCart(); flyToCart(); toast("Added to the ledger");
  try{ if(navigator.vibrate) navigator.vibrate(10); }catch(e){}
});

/* ============================================================
   P1 details — cursor + magnetic buttons
   ============================================================ */
if(fine && !reduced){
  document.body.classList.add("curon");
  const cur=$("cur"), ring=$("curring");
  let mx=innerWidth/2,my=innerHeight/2,rx=mx,ry=my;
  addEventListener("mousemove",e=>{ mx=e.clientX; my=e.clientY;
    cur.style.left=mx+"px"; cur.style.top=my+"px"; });
  (function ringLoop(){
    rx+=(mx-rx)*0.18; ry+=(my-ry)*0.18;
    ring.style.left=rx+"px"; ring.style.top=ry+"px";
    requestAnimationFrame(ringLoop);
  })();
  const HOT="a,button,.size,.qbtn,.fmove,.ph";
  document.addEventListener("mouseover",e=>{ if(e.target.closest(HOT)) document.body.classList.add("curhot"); });
  document.addEventListener("mouseout",e=>{ if(e.target.closest(HOT)) document.body.classList.remove("curhot"); });
  /* magnetic buttons */
  document.addEventListener("mousemove",e=>{
    const b=e.target.closest(".btn"); 
    document.querySelectorAll(".btn._mag").forEach(x=>{ if(x!==b){x.classList.remove("_mag");x.style.translate="";} });
    if(!b) return;
    const r=b.getBoundingClientRect();
    const dx=(e.clientX-(r.left+r.width/2))/r.width, dy=(e.clientY-(r.top+r.height/2))/r.height;
    b.classList.add("_mag");
    b.style.translate=`${(dx*6).toFixed(1)}px ${(dy*6).toFixed(1)}px`;
  });
}

/* ============================================================
   WAYFINDING — make it obvious there are 8 pieces below
   ============================================================ */
const swipeCue=document.createElement("div");
swipeCue.id="swipeCue";
swipeCue.innerHTML=
  '<div class="sc-word">'+(coarse?"Swipe up":"Scroll")+'</div>'+
  '<div class="sc-sub">8 pieces inside the vault</div>'+
  '<div class="sc-arrow" aria-hidden="true"><span></span><span></span></div>';
els.stage.appendChild(swipeCue);

const counter=document.createElement("div");
counter.id="pieceCount";
counter.className="plaque";
counter.innerHTML='<b id="pcNow">1</b> <span>/ 8 pieces</span>';
els.stage.appendChild(counter);
const pcNow=$("pcNow");

/* jump straight to the grid — for anyone who won't scroll the film at all */
const skip=document.createElement("button");
skip.id="skipToGrid";
skip.className="btn btn-cart";
skip.textContent="View all 8 pieces";
els.title.appendChild(skip);
skip.addEventListener("click",e=>{
  e.stopPropagation();
  document.getElementById("collection").scrollIntoView({behavior:reduced?"auto":"smooth"});
});

/* scroll position (px) that lands on a given film-second */
function scrollForFilmTime(t){
  const T=totalDur();
  if(T<=0) return 0;
  const r=els.vault.getBoundingClientRect();
  const top=r.top+scrollY;
  return top + (t/Math.max(0.05,T-0.05))*(r.height-innerHeight);
}
/* the roman rail is navigation, not decoration — make it tappable */
els.ticks.forEach((t,i)=>{
  t.setAttribute("role","button");
  t.setAttribute("tabindex","0");
  t.setAttribute("aria-label","Go to piece "+(i+1));
  const go=()=>{
    const s=DATA.stations[i];
    scrollTo({top:scrollForFilmTime(s[0]+(s[1]-s[0])*0.45), behavior:reduced?"auto":"smooth"});
  };
  t.addEventListener("click",go);
  t.addEventListener("keydown",e=>{ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); go(); } });
});
els.rail.removeAttribute("aria-hidden");

let cueSeen=false, lastCount=-1;
function updateWayfinding(g, active){
  /* the cue stays until they've actually reached the second piece — proof they understand the gesture */
  if(!cueSeen && g>DATA.stations[1][0]) cueSeen=true;
  swipeCue.classList.toggle("on", !cueSeen && g<DATA.stations[1][0]);
  const shown=Math.min(8,Math.max(1,active>-1?active+1:(g<DATA.stations[0][0]?1:8)));
  counter.classList.toggle("on", g>1.2 && g<DATA.sealedAt);
  if(shown!==lastCount){ lastCount=shown; pcNow.textContent=shown; }
}

/* ============================================================
   MAIN LOOP
   ============================================================ */
let prevProg=-1, prevG=0, prevT=performance.now();
function frame(){
  const now=performance.now();
  const prog=vaultProgress();
  if(Math.abs(prog-prevProg)>0.0004){ lastScrollTs=now; prevProg=prog; }

  markFull();
  const T=totalDur();
  let g=prog*Math.max(0,T-0.05);

  /* staged loading: next clip starts when current is cached or nearly reached */
  for(let i=0;i<clips.length-1;i++){
    if(clips[i].started && !clips[i+1].started &&
      (clips[i].full || g > clipStart(i)+durOf(i)*0.6)) startClip(i+1);
  }
  /* capture each clip as soon as IT is cached — don't wait for the whole film */
  if(clips.some(c=>!c.failed && !c.freed && c.full && !clipFrames[c.i])) pumpCaptures();

  /* gate to downloaded extent (captured clips are always safe to scrub) */
  if(aOK && !reduced){
    let reach=0, gated=false, gateLabel=null, gatePct="…";
    for(const c of clips){
      if(c.failed) break;
      if(clipFrames[c.i]){ reach+=durOf(c.i); continue; }
      if(!c.started){ gated=true; gateLabel=c.i? "Going deeper" : "Loading the vault"; break; }
      const be=c.full?durOf(c.i):Math.max(0,bufEnd(c.el)-0.3);
      reach+=be;
      if(!c.full){
        gated=true;
        gateLabel=c.i===0?"Loading the vault":"Going deeper";
        gatePct=c.dur?Math.round((bufEnd(c.el)/c.dur)*100)+"%":"…";
        break;
      }
    }
    if(gated && g>reach){ g=Math.max(0.01,reach); chipShow(gateLabel,gatePct); }
    else if(!capBusy) chipHide();
  }

  /* velocity (seconds of film per ms) */
  const dt=Math.max(1,now-prevT);
  velo=velo*0.85+((g-prevG)/dt)*0.15;
  prevG=g; prevT=now;

  /* overlays */
  els.title.classList.toggle("on", g<2.2);
  sealed.classList.toggle("on", g>DATA.sealedAt && g<T-0.2);

  let active=-1;
  stations.forEach((s,i)=>{ if(g>=s.range[0]&&g<s.range[1]) active=i; });
  els.ticks.forEach((t,i)=>t.classList.toggle("lit", i<=active&&active>-1));
  updateWayfinding(g, active);

  updateFlyers(g, now);

  if(aOK && !reduced && clips[0].dur){
    /* which clip owns g */
    let idx=0, local=g;
    while(idx<clips.length-1 && local>durOf(idx)-0.02 && !clips[idx+1].failed &&
          (clipFrames[idx+1] || (clips[idx+1].started && clips[idx+1].dur))){
      local-=durOf(idx); idx++;
    }
    local=Math.min(local, durOf(idx)-0.05);
    const fr=clipFrames[idx];
    if(fr){
      /* smooth path: pre-decoded frames, no video seeking at all */
      if(!canvasOn){ els.canvas.style.display="block"; canvasOn=true; }
      clips.forEach(c=>{ if(!c.freed && c.el.style.display!=="none"){ c.el.pause(); c.el.style.display="none"; } });
      activeSeg=-1;
      drawFrame(fr, durOf(idx)? Math.max(0,local)/durOf(idx) : 0);
    }else{
      if(canvasOn){ els.canvas.style.display="none"; canvasOn=false; }
      setActive(idx);
      scrubEl(clips[idx].el, Math.max(0,local));
    }
  }else if(aOK && !reduced){
    chipShow("Loading the vault","…");
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

/* rotate → reload with the correct orientation's films */
let rotT;
addEventListener("resize",()=>{
  clearTimeout(rotT);
  rotT=setTimeout(()=>{
    const o=innerHeight>=innerWidth?"portrait":"landscape";
    if(o!==orient) location.reload();
  },400);
});

})();
