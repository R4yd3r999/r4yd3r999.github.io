/* Intro: un enjambre de agentes "reconstruye" la página capa a capa, con cursores,
   cajas de selección con medidas, texto que se escribe y una barra de progreso.

   Todo es visual: el contenido real ya está en el DOM (SEO y lectores de pantalla intactos).
   Solo se oculta con opacity y se revela por capas.

   El scroll es del usuario y gobierna el ritmo:
   · quieto o con la construcción a la vista: ritmo normal (BASE)
   · bajando de forma sostenida, o ya pasó de largo lo que falta: los agentes se apuran
   · lo pendiente queda por debajo de la pantalla (subió, o llegó al borde): pausa, y cada cursor
     se queda donde estaba (viven en coordenadas de documento, se mueven con el contenido)
   API: IX.init({str,ev}) · IX.start() · IX.stop()  ·  Escape o "Saltar" la omiten.
   No se ejecuta sola: la lanza el botón "Probar animación", como si se abriera la página. */
window.IX=(()=>{
const R=document.documentElement,RM=matchMedia("(prefers-reduced-motion:reduce)");
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v)),rnd=(a,b)=>a+Math.random()*(b-a);
const lum=h=>{const n=parseInt(h.slice(1),16);return(.299*(n>>16)+.587*((n>>8)&255)+.114*(n&255))/255};
const PAL=["#FF5C5C","#FF9F1C","#FFD60A","#30D158","#2DD4BF","#0A84FF","#7C5CFF","#FF4D9D","#00B8D9","#F97316","#A3E635","#C084FC"];

/* Qué se reconstruye, en orden de documento. */
const SEL=[".top",".brand","#lang","#theme","#mb",
".status",".status span",".hero h1",".lead",".hook span",".meta",".cta .btn",".try",".photo",
"main section:not(.hero) > h2",
".card",".card h3",".card .badge",".card p:not(.badge):not(.tech)",".card .tech span",".card .b a",".card .phone",".card .cn button",".card .shot",
"#abt p","#abt .et",".edu li",".edu li b",".edu li span",".langs li",".langs li b",".langs li span",".langs .dots",
".grp h3",".grp h3 small",".grp .chip",".chip span","#contact .prose","#links > *","#links span","footer"].join(",");
const kindOf=el=>el.matches(".photo,.phone,.shot")?"img"
 :el.matches("a.btn,button,.chip,.b a,select")?"box"
 :(el.children.length===0&&el.textContent.trim()?"text":"box");

/* Cursores: flecha (cajas), I-beam (texto) y cruz (imágenes). Contorno blanco para verse sobre cualquier fondo. */
const SVG='<svg class="k-a" viewBox="0 0 24 24"><path d="M3 2l7 19 3-8 8-3z" fill="currentColor" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>'
+'<svg class="k-t" viewBox="0 0 24 24" fill="none" stroke-linecap="round"><path d="M9 4h6M12 4v16M9 20h6" stroke="#fff" stroke-width="4.4"/><path d="M9 4h6M12 4v16M9 20h6" stroke="currentColor" stroke-width="2"/></svg>'
+'<svg class="k-x" viewBox="0 0 24 24" fill="none" stroke-linecap="round"><path d="M12 4v16M4 12h16" stroke="#fff" stroke-width="4.4"/><path d="M12 4v16M4 12h16" stroke="currentColor" stroke-width="2"/></svg>';
const HOT={a:[3,2],t:[12,12],x:[12,12]};
const BASE=.6,HOLD=.85,RUSH=5,RW=18; // RW = grosor de las reglas // ritmo base (1 = el original, rápido) · a qué altura de pantalla se pausa · tope de apuro

let cfg={str:()=>({}),ev(){}},S=null,host=null,hudT=0;

function init(o){cfg=Object.assign(cfg,o)}

const hudHtml=t=>`<div class="ixh" role="region" aria-label="${t.ix_hud}"><span class="ixav" aria-hidden="true"></span>`
+`<span class="ixlive"><span class="ixn"></span><span class="ixbar" aria-hidden="true"><i></i></span>`
+`<span class="ixsp" aria-hidden="true">1×</span><button type="button" class="ixb ixsk">${t.ix_skip}</button></span>`
+`<span class="ixend"><span class="ixm" role="status"></span><button type="button" class="ixb ixrp">${t.ix_again}</button>`
+`<button type="button" class="ixb ixcl" aria-label="${t.ix_close}">✕</button></span></div>`;

function closeHud(){clearTimeout(hudT);if(host){host.remove();host=null}}

/* ---------- capas ---------- */
function collect(){
 const out=[];
 document.querySelectorAll(SEL).forEach(el=>{
  const r=el.getBoundingClientRect();if(r.width<2||r.height<2)return;
  out.push({el,i:out.length,on:false,kind:kindOf(el),taken:false,done:false,tk:null,n:0,orig:"",words:false});
 });
 return out;
}
/* Texto: cada carácter (o cada palabra si es largo) en su span; se revelan de uno en uno
   y al terminar se restaura el texto original. */
function mkTokens(l){
 const txt=l.el.textContent;l.orig=txt;l.words=txt.length>70;
 const parts=l.words?txt.split(/(\s+)/):Array.from(txt),f=document.createDocumentFragment(),tk=[];
 parts.forEach(p=>{if(!p)return;const s=document.createElement("span");s.className="ixt";s.textContent=p;s.style.visibility="hidden";f.append(s);tk.push(s)});
 l.el.replaceChildren(f);l.tk=tk;l.n=0;
}
const docTop=l=>l.el.getBoundingClientRect().top+scrollY;
function pick(Y,vh,vw){
 const lim=Y+vh*.98;let seen=0;
 for(let j=S.ptr;j<S.LY.length&&seen<30;j++){
  const l=S.LY[j];if(l.taken)continue;seen++;
  const r=l.el.getBoundingClientRect();
  if(r.top+Y>lim)continue;
  l.taken=true;
  // fuera de pantalla en horizontal (capturas del carrusel que aún no se ven): se revelan al instante, sin gastar un agente
  if(r.left>=vw||r.right<=0){l.done=true;l.on=true;S.done++;l.el.classList.add("ly-on");seen--;continue}
  while(S.LY[S.ptr]&&S.LY[S.ptr].taken)S.ptr++;
  return l;
 }
 while(S.LY[S.ptr]&&S.LY[S.ptr].taken)S.ptr++;
 return null;
}

/* ---------- agentes ---------- */
function spawn(){
 const i=S.ag.length,c=PAL[i%PAL.length],vw=innerWidth,vh=innerHeight,Y=scrollY;
 const el=document.createElement("div");el.className="ixc";el.dataset.k="a";el.style.color=c;el.innerHTML=SVG;
 const sel=document.createElement("div");sel.className="ixs";sel.style.setProperty("--c",c);sel.style.setProperty("--ct",lum(c)>.6?"#111":"#fff");
 sel.innerHTML="<i></i><i></i><i></i><i></i><b></b>";
 const ph=document.createElement("div"),gv=document.createElement("div"),gh=document.createElement("div"),ms=document.createElement("div");
 ph.className="ixg";gv.className="ixgv";gh.className="ixgh";ms.className="ixd v";ms.innerHTML="<b></b>";
 for(const e of[ph,gv,gh])e.style.setProperty("--c",c);
 host.querySelector(".ixsl").append(ph,gv,gh,ms,sel);host.querySelector(".ixcu").append(el);
 const side=Math.random()<.5;
 const a={i,c,el,sel,ph,gv,gh,ms,gd:false,gs:false,phs:false,md:null,lab:sel.lastChild,k:"a",x:side?rnd(-60,vw+60):(Math.random()<.5?-60:vw+60),y:Y+(side?(Math.random()<.5?-60:vh+60):rnd(-60,vh+60)),
  rot:0,st:"idle",t:0,L:null,fx:.5,fy:.5,mx:200,my:100,tx:0,ty:0,r:null,lx:null,ly:null,wt:0,wx:vw/2,wy:Y+vh/2,dur:.5,lw:0,lh:0,gone:false};
 S.ag.push(a);
 if(i<4){const av=document.createElement("span");av.textContent=String.fromCharCode(65+i);av.style.background=c;av.style.color=lum(c)>.6?"#111":"#fff";host.querySelector(".ixav").append(av)}
}
function setKind(a,k){
 if(a.k===k)return;a.k=k;a.el.dataset.k=k;a.el.style.transformOrigin=HOT[k][0]+"px "+HOT[k][1]+"px";
}
function assign(a,l){
 a.gd=l.el.matches(".card,.photo,.phone,.shot")||Math.random()<(l.kind==="text"?.12:.4);
 if(l.kind==="img")a.ph.style.borderRadius=getComputedStyle(l.el).borderRadius;
 a.L=l;a.st="travel";a.t=0;a.fx=rnd(.3,.7);a.fy=rnd(.3,.7);
 a.mx=l.kind==="text"?rnd(30,140):240;a.my=l.kind==="text"?16:140;
}
/* Posiciones de cursor en coordenadas de DOCUMENTO (y = viewport + scrollY): si la
   simulación se congela, el cursor se queda pegado al contenido mientras el usuario hace scroll. */
/* Distancia (px) hasta la capa ya construida más cercana: en la misma fila, horizontal; si no, vertical. Se guarda en coordenadas de documento. */
function calcMeasure(a){
 const l=a.L,r=l.el.getBoundingClientRect(),Y=scrollY;a.md=null;
 for(let j=l.i-1;j>=Math.max(0,l.i-14);j--){
  const p=S.LY[j];if(!p.done||p.el.contains(l.el)||l.el.contains(p.el))continue;
  const q=p.el.getBoundingClientRect();if(q.width<4||q.height<4)continue;
  const ov=Math.min(r.bottom,q.bottom)-Math.max(r.top,q.top);
  if(ov>Math.min(r.height,q.height)*.4){
   const g=r.left-q.right;if(g>1&&g<320){a.md={o:"h",x:q.right,y:Y+Math.max(r.top,q.top)+ov/2,len:g};break}
  }else{
   const ox=Math.min(r.right,q.right)-Math.max(r.left,q.left),g=r.top-q.bottom;
   if(ox>8&&g>1&&g<320){a.md={o:"v",x:Math.max(r.left,q.left)+ox/2,y:Y+q.bottom,len:g};break}
  }
 }
 const m=a.ms;
 if(a.md){m.className="ixd "+a.md.o+(a.gs?" on":"");m.style.width=a.md.o==="h"?a.md.len+"px":"";m.style.height=a.md.o==="v"?a.md.len+"px":"";m.lastChild.textContent=Math.round(a.md.len)}
}
function target(a,vw,vh,Y){
 if(a.st==="leave")return[vw/2,Y+vh-44];
 const l=a.L;
 if(l){
  if(a.st==="act"&&l.kind==="text"&&l.tk){
   const tk=l.n?l.tk[l.n-1]:l.tk[0],q=tk.getBoundingClientRect();return[l.n?q.right:q.left,Y+q.top+q.height/2];
  }
  const r=l.el.getBoundingClientRect();return[r.left+Math.min(r.width*a.fx,a.mx),Y+r.top+Math.min(r.height*a.fy,a.my)];
 }
 if(S.phase==="scan"){ // remolino alrededor del centro mientras escanea
  return[vw/2+Math.cos(S.t*2+a.i*1.9)*(70+a.i*9),Y+vh*.45+Math.sin(S.t*2.3+a.i*1.3)*(50+a.i*7)];
 }
 return[a.wx,a.wy];
}
/* Cada fotograma en dos pasadas para no mezclar lecturas y escrituras del DOM:
   think() decide y mide; paint() solo escribe estilos. */
function think(a,dt,sdt,vw,vh,Y){
 if(a.gone)return;
 if(a.st==="idle"){
  if(S.phase==="build"&&S.f>.05){const l=pick(Y,vh,vw);if(l)assign(a,l)}
  a.wt-=sdt;if(a.wt<=0){a.wt=rnd(.5,1);a.wx=rnd(vw*.15,vw*.85);a.wy=Y+rnd(vh*.2,vh*.6)}
 }
 const[tx,ty]=target(a,vw,vh,Y);a.tx=tx;a.ty=ty;
 const dist=Math.hypot(tx-a.x,ty-a.y);
 if(a.st==="travel"){a.t+=sdt;if((dist<40&&a.t>.1)||a.t>1){a.st="select";a.t=0;a.sel.classList.remove("on");setKind(a,a.L.kind==="text"?"t":a.L.kind==="img"?"x":"a");a.rot=0;a.lw=-1;a.lx=a.ly=null;a.sel.classList.add("on");if(a.gd)calcMeasure(a)}}
 else if(a.st==="select"){a.t+=sdt;if(a.t>=.12){a.st="act";a.t=0;startAct(a)}}
 else if(a.st==="act"){a.t+=sdt;if(actStep(a)){a.st="release";a.t=0}}
 else if(a.st==="release"){a.t+=sdt;if(a.t>=.08){endLayer(a);a.st="idle";a.sel.classList.remove("on");setKind(a,"a")}}
 else if(a.st==="leave"&&dist<28){a.gone=true;a.el.style.opacity=0;a.sel.classList.remove("on");return}
 a.r=a.L&&(a.st==="select"||a.st==="act"||a.st==="release")?a.L.el.getBoundingClientRect():null;
 if(sdt<=0)return; // pausa: ni se mueve ni gira, se queda exactamente donde estaba
 // movimiento (suavizado exponencial)
 const k=1-Math.exp(-sdt*((a.st==="select"||a.st==="act")?16:9));
 const nx=a.x+(clamp(tx,8,vw-8)-a.x)*k,ny=a.y+(ty-a.y)*k;
 // las flechas giran hacia donde vuelan, como aviones de papel; trabajando, vuelven a la posición normal
 const sp=Math.hypot(nx-a.x,ny-a.y)/Math.max(dt,.001);
 const want=a.k==="a"&&(a.st==="travel"||a.st==="idle"||a.st==="leave")&&sp>220?Math.atan2(ny-a.y,nx-a.x)*57.2958+135:0;
 a.rot+=(((want-a.rot+540)%360)-180)*(1-Math.exp(-dt*12));
 a.x=nx;a.y=ny;
}
function paint(a,Y){
 if(a.gone)return;
 const h=HOT[a.k];
 a.el.style.transform=`translate(${(a.x-h[0]).toFixed(1)}px,${(a.y-Y-h[1]).toFixed(1)}px) rotate(${a.rot.toFixed(1)}deg)`;
 const r=a.r,l=a.L;
 // placeholder gris mientras la imagen todavía no aparece; guías y medida en algunas capas
 const wantPh=!!(r&&l&&l.kind==="img"&&!l.on&&(a.st==="select"||a.st==="act")),wantG=!!(r&&a.gd);
 if(wantPh!==a.phs){a.phs=wantPh;a.ph.classList.toggle("on",wantPh)}
 if(wantG!==a.gs){a.gs=wantG;a.gv.classList.toggle("on",wantG);a.gh.classList.toggle("on",wantG);a.ms.classList.toggle("on",wantG&&!!a.md)}
 if(!r)return;
 const lx=Math.round(r.left*2)/2,ly=Math.round(r.top*2)/2,w=Math.round(r.width),hh=Math.round(r.height);
 if(lx!==a.lx||ly!==a.ly){
  a.lx=lx;a.ly=ly;const t=`translate(${lx}px,${ly}px)`;a.sel.style.transform=t;a.ph.style.transform=t;
  a.gv.style.transform=`translateX(${lx}px)`;a.gh.style.transform=`translateY(${ly}px)`;
 }
 if(w!==a.lw||hh!==a.lh){a.lw=w;a.lh=hh;for(const e of[a.sel,a.ph]){e.style.width=r.width+"px";e.style.height=r.height+"px"}a.lab.textContent=w+" × "+hh}
 if(wantG&&a.md)a.ms.style.transform=`translate(${a.md.x.toFixed(1)}px,${(a.md.y-Y).toFixed(1)}px)`;
}
/* Reglas tipo herramienta de diseño: arriba en px, a la izquierda en coordenadas de la página (se mueven al hacer scroll). */
function drawRulers(Y,vw,vh){
 const dpr=Math.min(devicePixelRatio||1,2),T=S.rt,Lc=S.rl,key=vw+"x"+vh+"x"+dpr;
 if(S.rk!==key){S.rk=key;T.width=vw*dpr;T.height=RW*dpr;T.style.width=vw+"px";T.style.height=RW+"px";Lc.width=RW*dpr;Lc.height=vh*dpr;Lc.style.width=RW+"px";Lc.style.height=vh+"px"}
 const a=T.getContext("2d"),b=Lc.getContext("2d");
 a.setTransform(dpr,0,0,dpr,0,0);b.setTransform(dpr,0,0,dpr,0,0);
 a.clearRect(0,0,vw,RW);b.clearRect(0,0,RW,vh);
 a.fillStyle=b.fillStyle="rgba(16,17,20,.88)";a.fillRect(0,0,vw,RW);b.fillRect(0,0,RW,vh);
 S.ag.forEach(g=>{if(g.gs&&g.r){a.fillStyle=b.fillStyle=g.c+"77";a.fillRect(g.r.left,0,g.r.width,RW);b.fillRect(0,g.r.top,RW,g.r.height)}});
 a.strokeStyle=b.strokeStyle="#8b909a";a.fillStyle=b.fillStyle="#c3c7cf";a.lineWidth=b.lineWidth=1;a.font=b.font='9px "JetBrains Mono",monospace';
 a.beginPath();b.beginPath();
 for(let x=0;x<vw;x+=10){const t=x%100===0?RW:x%50===0?9:5;a.moveTo(x+.5,RW);a.lineTo(x+.5,RW-t);if(x%100===0&&x)a.fillText(x,x+3,9)}
 const Yi=Math.round(Y);
 for(let y=(10-Yi%10)%10;y<vh;y+=10){
  const d=Yi+y,t=d%100===0?RW:d%50===0?9:5;b.moveTo(RW,y+.5);b.lineTo(RW-t,y+.5);
  if(d%100===0&&d){b.save();b.translate(9,y-3);b.rotate(-Math.PI/2);b.fillText(d,0,0);b.restore()}
 }
 a.stroke();b.stroke();
}
function startAct(a){
 const l=a.L;
 if(l.kind==="text"){mkTokens(l);a.dur=clamp(l.tk.length*(l.words?.022:.018),.2,.9)}
 if(l.kind==="img")a.dur=.6;                   // placeholder gris y, después, la imagen
 else{l.el.classList.add("ly-on");l.on=true}
}
function actStep(a){
 const l=a.L;
 if(l.kind==="text"){
  const p=clamp(a.t/a.dur,0,1),n=Math.floor(p*l.tk.length);
  for(let j=l.n;j<n;j++)l.tk[j].style.visibility="";
  l.n=Math.max(l.n,n);return p>=1;
 }
 if(l.kind==="img"){
  if(!l.on&&a.t>=.35){l.el.classList.add("ly-on");l.on=true}
  return a.t>=a.dur;
 }
 return a.t>=.1;
}
function endLayer(a){
 const l=a.L;
 if(l.tk){l.el.textContent=l.orig;l.tk=null}
 l.done=true;S.done++;a.L=null;
}

/* ---------- ritmo: el scroll del usuario manda ---------- */
/* 0 = pausa · 1 = normal · >1 = apuro. Se mide contra la primera capa SIN terminar. */
function pace(vh){
 if(S.phase==="leave")return 1;
 while(S.LY[S.fd]&&S.LY[S.fd].done)S.fd++;
 const u=S.LY[S.fd];if(!u)return 1;
 const r=u.el.getBoundingClientRect();
 if(r.top>vh*HOLD)return 0;                        // lo pendiente está bajo la pantalla (subió, o llegó al borde)
 if(r.bottom<-20)return RUSH;                      // el usuario ya pasó de largo: a darse prisa
 if(S.sv>120)return 1+clamp(S.sv/450,0,RUSH-1.5);  // baja de forma sostenida: más rápido cuanto más rápido baje
 return 1;
}

/* ---------- HUD ---------- */
function hudTick(now,force){
 if(!force&&now-S.hr<100)return;S.hr=now;
 const t=S.tr,held=S.goal===0&&S.f<.05,rush=S.f>1.25;
 const n=S.hud.querySelector(".ixn"),txt=S.phase==="scan"?t.ix_scan:held?t.ix_hold:`<b>${S.ag.length}</b> ${t.ix_agents}<i></i><b>${S.done}</b> / ${S.LY.length} ${t.ix_layers}`;
 if(txt!==S.hx){S.hx=txt;n.innerHTML=txt}
 const sp=S.hud.querySelector(".ixsp"),lab=held?"⏸":rush?S.f.toFixed(1)+"×":"1×";
 if(lab!==sp.textContent){sp.textContent=lab;sp.dataset.s=held?"p":rush?"f":"n"}
 S.hud.querySelector(".ixbar i").style.transform=`scaleX(${(S.done/S.LY.length).toFixed(3)})`;
}

/* ---------- ciclo de vida ---------- */
function frame(now){
 if(!S||!S.on)return;
 S.raf=requestAnimationFrame(frame);
 const dt=Math.min(.05,(now-S.last)/1000||.016);S.last=now;
 const vw=innerWidth,vh=innerHeight,Y=scrollY;
 // velocidad de scroll (px/s, + = bajando), suavizada
 S.sv+=((Y-S.lastY)/Math.max(dt,.001)-S.sv)*(1-Math.exp(-dt*6));S.lastY=Y;
 // el ritmo se acerca a su objetivo: frena rápido, acelera con suavidad
 S.goal=pace(vh);
 S.f+=(S.goal-S.f)*(1-Math.exp(-dt*(S.goal<S.f?14:5)));
 if(S.goal===0&&S.f<.03)S.f=0;
 const sdt=dt*BASE*S.f;
 S.t+=sdt;
 while(S.ag.length<S.N&&S.t>=.1+S.ag.length*.1)spawn();
 if(S.phase==="scan"){
  S.line.style.opacity=1;S.line.style.transform=`translateY(${(Math.min(1,S.t/S.buildAt)*vh).toFixed(0)}px)`;
  if(S.t>=S.buildAt){S.phase="build";S.line.style.opacity=0}
 }
 S.ag.forEach(a=>think(a,dt,sdt,vw,vh,Y));S.ag.forEach(a=>paint(a,Y));
 if(S.phase==="build"&&S.done>=S.LY.length){S.phase="leave";S.leaveT=0;S.ag.forEach(a=>{if(!a.gone)a.st="leave"})}
 if(S.phase==="leave"){
  S.leaveT+=sdt;
  if(S.ag.every(a=>a.gone)||S.leaveT>2.6)return finish(false);
 }
// reglas: visibles mientras algún agente trabaja con guías
 if(S.ag.some(g=>g.gs&&g.r))S.rUntil=now+350;
 const showR=now<S.rUntil;
 if(showR!==S.rsh){S.rsh=showR;S.rt.classList.toggle("on",showR);S.rl.classList.toggle("on",showR)}
 if(showR)drawRulers(Y,vw,vh);
 hudTick(now);
 if(now-S.t0>180000)finish(true,"timeout"); // red de seguridad
}
function onKey(e){if(e.key==="Escape")finish(true,"user")}
function finish(skipped,src){
 if(!S||!S.on)return;
 const s=S;s.on=false;cancelAnimationFrame(s.raf);
 removeEventListener("keydown",onKey);
 s.LY.forEach(l=>{if(l.tk){l.el.textContent=l.orig;l.tk=null}l.el.removeAttribute("data-ly");l.el.classList.remove("ly-on")});
 R.classList.remove("ix");

 S=null;
 if(skipped){
  cfg.ev("intro_skip",{progress:Math.round(s.done/s.LY.length*100),by:src});
  closeHud();return;
 }
 // fin normal: se retiran cursores y queda el HUD con el resumen
 const sec=((performance.now()-s.t0)/1000).toFixed(1);
 host.querySelectorAll(".ixl,.ixr,.ixsl,.ixcu").forEach(e=>e.remove());
 const hud=s.hud;hud.classList.add("done");
 hud.querySelector(".ixm").textContent=s.tr.ix_done.replace("{n}",s.ag.length).replace("{s}",sec);
 const hide=ms=>{clearTimeout(hudT);hudT=setTimeout(closeHud,ms)};
 hide(9000);
 hud.addEventListener("pointerenter",()=>clearTimeout(hudT));hud.addEventListener("focusin",()=>clearTimeout(hudT));
 hud.addEventListener("pointerleave",()=>hide(4000));hud.addEventListener("focusout",()=>hide(4000));
 hud.querySelector(".ixcl").onclick=closeHud;
 hud.querySelector(".ixrp").onclick=()=>{cfg.ev("intro_replay");closeHud();start()};
 cfg.ev("intro_complete",{agents:s.ag.length,seconds:+sec});
}

function start(){
 if(S&&S.on)return false;
 closeHud();
 if(RM.matches)return false;
 scrollTo({top:0,behavior:"instant"}); // como quien abre la página: siempre desde arriba
 let LY;
 try{
  LY=collect();if(LY.length<8)return false;
  const t=cfg.str();
  document.querySelectorAll(".rv").forEach(e=>e.classList.add("in")); // la intro manda sobre el reveal por scroll
  LY.forEach(l=>l.el.setAttribute("data-ly",""));
  R.classList.add("ixn","ix");requestAnimationFrame(()=>requestAnimationFrame(()=>R.classList.remove("ixn")));
  host=document.createElement("div");host.id="ix";
  host.innerHTML='<div class="ixl"></div><canvas class="ixr ixrt" aria-hidden="true"></canvas><canvas class="ixr ixrl" aria-hidden="true"></canvas><div class="ixsl" aria-hidden="true"></div><div class="ixcu" aria-hidden="true"></div>'+hudHtml(t);
  document.body.append(host);
  const lo=(navigator.hardwareConcurrency||8)<=2,N=lo?8:Math.min(innerWidth,screen.width||innerWidth)<700?12:18;
  S={on:true,LY,N,f:1,goal:1,sv:0,lastY:scrollY,hr:0,hx:"",t:0,last:performance.now(),t0:performance.now(),phase:"scan",buildAt:.7,
   ag:[],done:0,ptr:0,fd:0,leaveT:0,tr:t,line:host.querySelector(".ixl"),rt:host.querySelector(".ixrt"),rl:host.querySelector(".ixrl"),rk:"",rUntil:0,rsh:false,hud:host.querySelector(".ixh")};
  S.hud.querySelector(".ixsk").onclick=()=>finish(true,"btn");
  addEventListener("keydown",onKey);
  hudTick(S.last,true);
  S.raf=requestAnimationFrame(frame);
  return true;
 }catch(err){ // si algo falla, la página nunca se queda oculta
  if(S)S.on=false;S=null;
  R.classList.remove("ix");
  (LY||[]).forEach(l=>{l.el.removeAttribute("data-ly");l.el.classList.remove("ly-on")});
  closeHud();return false;
 }
}
function stop(){if(S&&S.on)finish(true,"user");closeHud()}
return{init,start,stop};
})();
