/* ============================================================
   CASHHARDCLUB — The Vault · app.js
   v2 "door + catalog": ONE scrubbed clip (the door), held open, then the
   full 8-piece catalog as plain DOM. No buffer gate, no frame capture, no
   play() dependency — nothing here can strand the visitor on a frame.
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
const orient  = window.__orient || (innerHeight >= innerWidth ? "portrait" : "landscape");
const SRC     = DATA.clips[orient];          /* {list:[A,...], poster} — only list[0] is used */
const P       = DATA.products;               /* 8 products */

const $ = id => document.getElementById(id);
const els = {
  boot:$("boot"), chip:$("chip"), chipLbl:$("chipLabel"), chipPct:$("chipPct"),
  toast:$("toast"), vault:$("vault"), stage:$("stage"),
  vidA:$("vidA"), poster:$("fallbackPoster"),
  title:$("titleOverlay"), wall:$("wall"), grid:$("grid"),
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
   DOOR ENGINE — one clip, scrubbed, held open.
   No buffer gate, no frame capture, no play() dependency.
   There is deliberately NO code path that can hold the visitor.
   ============================================================ */
const v = els.vidA;
let dur = 0, aOK = true, playBlocked = false, watchdogDone = false;
const DOOR_OPEN = (typeof DATA.doorOpen === "number" ? DATA.doorOpen : 6.0);
const bootTs = performance.now();

function showPoster(){
  if(!els.poster.src) els.poster.src = SRC.poster;
  els.poster.style.display = "block";
}
function engineDead(){
  aOK = false;
  try{ v.pause(); }catch(e){}
  v.style.display = "none";
  showPoster(); chipHide(); bootOff();
}

v.addEventListener("loadedmetadata", ()=>{ dur = v.duration || 0; });
v.addEventListener("seeked", ()=>{ v._pend = false; });
v.addEventListener("loadeddata", bootOff, {once:true});
v.addEventListener("error", ()=>{ engineDead(); });
if(reduced){ v.style.display = "none"; showPoster(); bootOff(); }

/* Any interaction counts as the unlock gesture — desktop wheel-scroll included.
   If playback is refused anyway, playBlocked flips and scrub() seeks instead. */
["pointerdown","touchstart","wheel","keydown","scroll"].forEach(ev=>
  addEventListener(ev, ()=>{
    if(reduced || !aOK) return;
    const p = v.play();
    if(p && p.then) p.then(()=>v.pause()).catch(()=>{ playBlocked = true; });
  }, {once:true, passive:true}));

function scrub(t){
  const d = t - v.currentTime;
  if(Math.abs(d) < 0.06){ if(!v.paused) v.pause(); return; }
  if(!playBlocked && d > 0 && d < 2.5){
    try{ v.playbackRate = Math.min(6, Math.max(0.5, d*3)); }catch(e){}
    if(v.paused){
      const p = v.play();
      if(p && p.then) p.catch(()=>{ playBlocked = true; });
    }
  }else{
    if(!v.paused) v.pause();
    if(!v._pend){
      v._pend = true;
      if(typeof v.fastSeek === "function" && Math.abs(d) > 1.5) v.fastSeek(t);
      else v.currentTime = t;
      /* 'seeked' may not fire if the target rounds to the current frame */
      setTimeout(()=>{ v._pend = false; }, 400);
    }
  }
}

function vaultProgress(){
  const r = els.vault.getBoundingClientRect();
  const total = r.height - innerHeight;
  if(total <= 0) return 1;
  return Math.min(1, Math.max(0, -r.top/total));
}

/* ============================================================
   CATALOG WALL — all 8 pieces, in their bays, inside the vault.
   Plain DOM in normal flow: it cannot be blocked by video state.
   ============================================================ */
const BAYNUM = ["I","II","III","IV","V","VI","VII","VIII"];
const lowPower = coarse || (navigator.deviceMemory || 4) < 4;
const MAX_LOOPS = lowPower ? 2 : 8;

P.forEach((p,i)=>{
  const bay = document.createElement("article");
  bay.className = "bay" + (i===0 ? " bay-hero" : "");
  bay.setAttribute("data-open", i);
  bay.setAttribute("role","button");
  bay.setAttribute("tabindex","0");
  bay.setAttribute("aria-label","Open "+p.name);
  bay.innerHTML =
    '<div class="bay-inner">'+
      '<video class="bay-bg" muted loop playsinline preload="none" aria-hidden="true" data-loop="'+p.loop+'"></video>'+
      '<div class="bay-num display">'+BAYNUM[i]+'</div>'+
      '<img class="bay-cut" alt="'+p.name+'" data-src="'+p.cut+'" decoding="async" '+
           'onerror="if(this.dataset.fb!==\'1\'){this.dataset.fb=\'1\';this.src=\''+p.img+'\';}">'+
      (i===0 ? '<div class="bay-tag">1 of 1</div>' : '')+
    '</div>'+
    '<div class="bay-meta">'+
      '<div class="bay-name display">'+p.name+'</div>'+
      '<div class="bay-price num">'+priceHTML(p)+'</div>'+
      '<div class="bay-open">Open</div>'+
    '</div>';
  els.wall.appendChild(bay);
  bay.addEventListener("keydown", e=>{
    if(e.key==="Enter" || e.key===" "){
      e.preventDefault();
      openReveal(i, bay.querySelector(".bay-cut"));
    }
  });
});

const bays = [...els.wall.querySelectorAll(".bay")];
const playingLoops = new Set();
const visibleBays = new Set();
function playBay(vid){
  if(!vid || reduced || playingLoops.has(vid) || playingLoops.size >= MAX_LOOPS) return;
  if(!vid.src){ vid.src = vid.dataset.loop; vid.load(); }
  playingLoops.add(vid);
  const p = vid.play();
  if(p && p.then) p.catch(()=>{});
}
function stopBay(vid){
  if(!vid || !playingLoops.has(vid)) return;
  playingLoops.delete(vid);
  try{ vid.pause(); }catch(e){}
}
function primeBay(bay){
  const img = bay.querySelector(".bay-cut");
  if(img && !img.src) img.src = img.dataset.src;
}
if("IntersectionObserver" in window){
  const io = new IntersectionObserver(entries=>{
    entries.forEach(en=>{
      const bay = en.target;
      if(en.isIntersecting){
        visibleBays.add(bay);
        bay.classList.remove("pre"); bay.classList.add("in");
        primeBay(bay); playBay(bay.querySelector(".bay-bg"));
      }else{
        visibleBays.delete(bay);
        stopBay(bay.querySelector(".bay-bg"));
      }
    });
  }, {rootMargin:"250px 0px"});
  bays.forEach(b=>{ b.classList.add("pre"); io.observe(b); });
  /* failsafe: if the observer never fires, un-hide everything anyway */
  setTimeout(()=>bays.forEach(b=>{ if(b.classList.contains("pre")){ b.classList.remove("pre"); primeBay(b); } }), 2500);
}else{
  bays.forEach(b=>{ primeBay(b); });
}
/* pause every bay loop while a Reveal or the Ledger is open */
function pauseAllBays(){ [...playingLoops].forEach(stopBay); }
function resumeBays(){ visibleBays.forEach(b=>playBay(b.querySelector(".bay-bg"))); }

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
els.shopAll.addEventListener("click",()=>document.getElementById("wallSection").scrollIntoView({behavior:reduced?"auto":"smooth"}));

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
  pauseAllBays();
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
  resumeBays();
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
function openLedger(){ pauseAllBays(); els.ledger.classList.add("on"); els.ledgerScrim.classList.add("on"); }
function closeLedger(){ resumeBays(); els.ledger.classList.remove("on"); els.ledgerScrim.classList.remove("on"); els.handoff.classList.remove("on"); }
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
  const HOT="a,button,.size,.qbtn,.bay,.ph";
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
   MAIN LOOP — door only. Everything else is plain DOM.
   ============================================================ */
const swipeCue = $("swipeCue");
if(swipeCue){
  const w = swipeCue.querySelector(".sc-word");
  if(w) w.textContent = coarse ? "Swipe up" : "Scroll";
}
const skipBtn = $("skipToGrid");
if(skipBtn) skipBtn.addEventListener("click", e=>{
  e.stopPropagation();
  document.getElementById("wallSection").scrollIntoView({behavior: reduced ? "auto" : "smooth"});
});

function frame(){
  const now  = performance.now();
  const prog = vaultProgress();

  els.title.classList.toggle("on", prog < 0.25);
  if(swipeCue) swipeCue.classList.toggle("on", prog < 0.15);

  if(!reduced && aOK){
    if(dur){
      /* map the runway onto 0..DOOR_OPEN, then HOLD — the door does not keep going */
      scrub(Math.min(DOOR_OPEN, (prog/0.9) * DOOR_OPEN));
    }else if(!watchdogDone && now - bootTs > 12000){
      /* the film never arrived; fall back to the still. The wall is unaffected. */
      watchdogDone = true;
      engineDead();
    }
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

/* rotate → reload with the correct orientation's film */
let rotT;
addEventListener("resize",()=>{
  clearTimeout(rotT);
  rotT=setTimeout(()=>{
    const o = innerHeight>=innerWidth ? "portrait" : "landscape";
    if(o!==orient) location.reload();
  },400);
});

})();
