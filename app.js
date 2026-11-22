/* Analytics: eventos propios (GA4). Si GA está bloqueado, no pasa nada. */
const ev=(n,p)=>{try{if(window.gtag)gtag("event",n,p)}catch(_){}};
const $=s=>document.querySelector(s),R=document.documentElement;
const ok=el=>el.closest(".ph")?.classList.add("ok");
function img(src,alt,cls,soon){const f=document.createElement("figure");f.className="ph "+cls;f.dataset.l=soon;const i=new Image();i.alt=alt;i.loading="lazy";i.onload=()=>ok(i);i.onerror=()=>{i.remove();f.classList.add("nope")};i.src=src;f.append(i);return f}
/* Galería de capturas de móvil: el tamaño de cada captura lo fija su proporción real (dim),
   no la imagen; así nunca descuadra la tarjeta ni recorta la captura. */
const lb=$("#lb"),li=$("#li"),lc=$("#lc");let LS=[],LI=0;
function lbShow(i){LI=(i+LS.length)%LS.length;const x=LS[LI];li.src=x.big;li.alt=x.alt;lc.textContent=`${x.alt} · ${LI+1}/${LS.length}`}
function lbOpen(list,i){LS=list;lbShow(i);lb.showModal()}
function gallery(p,t){
const cap=t.sh?.[p.n]||[],wrap=document.createElement("div");wrap.className="gal";
const s=document.createElement("div");s.className="shots phones";s.tabIndex=0;s.setAttribute("role","group");s.setAttribute("aria-label",`${p.n} · ${t.gl}`);
const list=p.img.map((n,i)=>({big:`img/${n}-lg.webp`,alt:cap[i]||`${p.n} ${i+1}`}));
p.img.forEach((n,i)=>{const [w,h]=p.dim[i],b=document.createElement("button");
b.type="button";b.className="ph phone";b.style.aspectRatio=`${w} / ${h}`;b.dataset.l=t.soon;b.setAttribute("aria-label",list[i].alt);
b.onclick=()=>lbOpen(list,i);s.append(b);
const m=new Image();m.alt="";m.width=w;m.height=h;m.decoding="async";if(i>1)m.loading="lazy";
m.onload=()=>ok(m);m.onerror=()=>{m.remove();b.classList.add("nope")};b.append(m);m.src=`img/${n}.webp`});
const nav=document.createElement("div");nav.className="cn";
const mk=(c,l,g)=>{const x=document.createElement("button");x.type="button";x.className=c;x.setAttribute("aria-label",l);x.textContent=g;return x};
const pv=mk("pv",t.gl_p,"‹"),nx=mk("nx",t.gl_n,"›");
const upd=()=>{pv.disabled=s.scrollLeft<4;nx.disabled=s.scrollLeft+s.clientWidth>=s.scrollWidth-4};
const by=d=>s.scrollBy({left:d*s.clientWidth*.8,behavior:matchMedia("(prefers-reduced-motion:reduce)").matches?"auto":"smooth"});
pv.onclick=()=>by(-1);nx.onclick=()=>by(1);s.addEventListener("scroll",upd,{passive:true});addEventListener("resize",upd);
nav.append(pv,nx);wrap.append(s,nav);requestAnimationFrame(upd);return wrap}
function reveal(){const els=document.querySelectorAll("main section:not(.hero) h2,.prose,.grp,.card,.links");
if(!("IntersectionObserver"in window)){els.forEach(e=>e.classList.add("in"));return}
const o=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("in");o.unobserve(e.target)}}),{threshold:.12});
els.forEach(e=>{e.classList.add("rv");o.observe(e)})}
function render(l){const t=T[l];R.lang=l;
document.querySelectorAll("[data-i]").forEach(e=>e.textContent=t[e.dataset.i]);
$("#plist").innerHTML="";
P.forEach(p=>{const c=document.createElement("article");c.className="card tilt";
const x=document.createElement("div");x.innerHTML=`<h3>${p.n}</h3><p class="badge">${t[p.st==="live"?"live":p.st==="test"?"test":"dev"]}</p><p>${t.d[p.n]}</p>${t.m[p.n]?`<p>${t.m[p.n]}</p>`:""}<p class="tech">${p.tech}</p>`;
const b=document.createElement("div");b.className="b";
if(p.code)b.innerHTML=`<a href="${p.code}" target="_blank" rel="noopener">${t.code} ↗</a>`;
if(p.apk)b.innerHTML+=`<a href="${p.apk}" target="_blank" rel="noopener">${t.apk} ↓</a>`;
if(p.code)x.append(b);c.append(x);
if(p.img){if(p.shape==="phone")c.append(gallery(p,t));else{const s=document.createElement("div");s.className="shots";p.img.forEach((n,i)=>s.append(img(`img/${n}.webp`,`${p.n} ${i+1}`,"shot",t.soon)));c.append(s)}}
$("#plist").append(c)});
$("#abt").innerHTML=t.about.map(x=>`<p>${x}</p>`).join("")+`<h3 class="et">${t.edu_t}</h3><ul class="edu">${t.edu.map(([a,b])=>`<li><b>${a}</b><span>${b}</span></li>`).join("")}</ul><h3 class="et">${t.lang_t}</h3><ul class="langs">${t.langs.map(([n,v,d])=>`<li><b>${n}</b><span>${v}</span><i class="dots" role="img" aria-label="${v}">${"<u class=\"on\"></u>".repeat(d)}${"<u></u>".repeat(5-d)}</i></li>`).join("")}</ul>`;
const lum=x=>{const n=parseInt(x,16);return(.299*(n>>16)+.587*((n>>8)&255)+.114*(n&255))/255};
const ico=k=>{const o=IC[k];return o.d?`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${o.d}"/></svg>`:`<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="${o.p}"/></svg>`};
$("#sk").innerHTML=K.map(g=>`<div class="grp"><h3 style="--o:${{s:1,u:.6,l:.3}[g.lv]}">${t["lv_"+g.lv]}<small>${t["c_"+g.lv]}</small></h3><ul class="chips">${g.i.map(([n,k])=>`<li class="chip" style="--c:${IC[k].h&&lum(IC[k].h)>.2?"#"+IC[k].h:"var(--a)"}">${ico(k)}<span>${n[0]==="@"?t[n.slice(1)]:n}</span></li>`).join("")}</ul></div>`).join("");
const e=atob(U.e),w=atob(U.w);
$("#links").innerHTML=`<a class="btn" href="mailto:${e}">${ico("gmail")}<span>${e}</span></a><button class="btn ghost" id="cp" type="button"><svg class="ci" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><g class="cp1"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/></g><path class="ck" d="M5 12.5l4.5 4.5L19 7.5"/></svg><span>${t.em}</span><span class="sr" role="status" aria-live="polite"></span></button><a class="btn ghost" href="https://wa.me/${w}?text=${encodeURIComponent(t.wa)}" target="_blank" rel="noopener">${ico("whatsapp")}<span>WhatsApp</span></a>${[["linkedin","LinkedIn",U.li],["github","GitHub",U.gh]].map(([k,n,u])=>`<a class="chip" href="${u}" target="_blank" rel="noopener" style="--c:${IC[k].h&&lum(IC[k].h)>.2?"#"+IC[k].h:"var(--a)"}">${ico(k)}<span>${n}</span></a>`).join("")}`;
{const cp=$("#cp"),sr=cp.querySelector(".sr");let ct;cp.onclick=async()=>{try{await navigator.clipboard.writeText(e)}catch(_){return}
cp.classList.remove("done");void cp.offsetWidth;cp.classList.add("done");sr.textContent=t.ok;clearTimeout(ct);ct=setTimeout(()=>{cp.classList.remove("done");sr.textContent=""},1600)}};
$("#lx").setAttribute("aria-label",t.gl_x);$("#lp").setAttribute("aria-label",t.gl_p);$("#ln").setAttribute("aria-label",t.gl_n);
reveal()}
function intro(){if(matchMedia("(prefers-reduced-motion:reduce)").matches)return;
const els=[".status",".hero h1",".lead",".hook",".meta",".cta",".photo"].map($),c=$(".cur");let i=0;
document.body.classList.add("intro");
const end=()=>{els.forEach(e=>e.classList.add("on"));c.classList.add("off");setTimeout(()=>document.body.classList.remove("intro"),700)};
setTimeout(end,4400);
(function step(){if(i>=els.length)return end();const e=els[i++],r=e.getBoundingClientRect();
c.style.transform=`translate(${Math.round(r.left+Math.min(r.width*.5,120))}px,${Math.round(Math.min(r.top+r.height*.4,innerHeight-60))}px)`;
setTimeout(()=>{e.classList.add("on");setTimeout(step,i===2?300:160)},230)})()}
const g=k=>{try{return localStorage.getItem(k)}catch(_){return null}},s=(k,v)=>{try{localStorage.setItem(k,v)}catch(_){}};
R.dataset.theme=g("th")||(matchMedia("(prefers-color-scheme:dark)").matches?"dark":"light");
const nl=(navigator.language||"es").slice(0,2);let L=g("lg")||(T[nl]?nl:"es");$("#lang").value=L;
$("#lang").onchange=e=>{L=e.target.value;s("lg",L);render(L);ev("language_change",{language:L})};
$("#theme").onclick=()=>{R.dataset.theme=R.dataset.theme==="dark"?"light":"dark";s("th",R.dataset.theme);ev("theme_change",{theme:R.dataset.theme})};
$(".photo img").onload=e=>ok(e.target);if($(".photo img").complete)ok($(".photo img"));
if(matchMedia("(hover:hover)").matches){addEventListener("pointermove",e=>{const t=e.target.closest?.(".tilt");if(!t)return;const r=t.getBoundingClientRect();t.style.setProperty("--ry",((e.clientX-r.left)/r.width-.5)*7+"deg");t.style.setProperty("--rx",-((e.clientY-r.top)/r.height-.5)*7+"deg")});
addEventListener("pointerout",e=>{const t=e.target.closest?.(".tilt");if(t){t.style.setProperty("--ry","0deg");t.style.setProperty("--rx","0deg")}})}
{const y=new Date().getFullYear();if(y>2026)$("#yr").textContent="2026–"+y}
const mb=$("#mb"),mp=$("#mp"),face=$("#face");let bt;
const blink=()=>{face.classList.remove("bl");void face.getBoundingClientRect();face.classList.add("bl")};
face.addEventListener("animationend",()=>face.classList.remove("bl"));
face.addEventListener("pointerdown",blink);
const idle=()=>{bt=setTimeout(()=>{blink();idle()},2200+Math.random()*3000)};
const setM=o=>{const was=mp.classList.contains("open");if(o!==was)ev(o?"menu_open":"menu_close");mp.classList.toggle("open",o);mb.classList.toggle("open",o);mb.setAttribute("aria-expanded",o);clearTimeout(bt);if(o)bt=setTimeout(()=>{blink();idle()},700)};
mb.onclick=e=>{e.stopPropagation();setM(!mp.classList.contains("open"))};
mp.querySelectorAll("a").forEach(x=>x.onclick=()=>setM(false));
document.addEventListener("click",e=>{if(!e.target.closest(".menu"))setM(false)});
addEventListener("keydown",e=>{if(e.key==="Escape")setM(false)});
addEventListener("pointermove",e=>{if(!mp.classList.contains("open"))return;const r=face.getBoundingClientRect(),dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2),d=Math.hypot(dx,dy)||1,k=Math.min(1,d/180)*2.2;face.style.setProperty("--px",(dx/d*k).toFixed(2)+"px");face.style.setProperty("--py",(dy/d*k).toFixed(2)+"px")});
$("#lx").onclick=()=>lb.close();$("#lp").onclick=()=>lbShow(LI-1);$("#ln").onclick=()=>lbShow(LI+1);
lb.addEventListener("click",e=>{if(e.target===lb||e.target.classList.contains("lbi"))lb.close()});
lb.addEventListener("keydown",e=>{if(e.key==="ArrowLeft")lbShow(LI-1);if(e.key==="ArrowRight")lbShow(LI+1)});
{let x0=null;lb.addEventListener("touchstart",e=>{x0=e.touches[0].clientX},{passive:true});
lb.addEventListener("touchend",e=>{if(x0===null)return;const d=e.changedTouches[0].clientX-x0;x0=null;if(Math.abs(d)>50)lbShow(LI+(d<0?1:-1))},{passive:true})}
/* Analytics: clics (delegados, siguen funcionando tras cambiar de idioma) */
document.addEventListener("click",e=>{const t=e.target;if(!t.closest)return;
const proj=()=>t.closest(".card")?.querySelector("h3")?.textContent||"";
const ph=t.closest(".phone");if(ph){ev("view_screenshots",{project:proj()});return}
if(t.closest("#cp")){ev("click_copy_email");return}
if(t.closest("#face")){ev("click_face");return}
const a=t.closest("a[href]");if(!a)return;const h=a.getAttribute("href")||"";
if(h.startsWith("mailto:"))return ev("click_email");
if(h.includes("wa.me"))return ev("click_whatsapp");
if(h.includes("linkedin.com"))return ev("click_linkedin");
if(a.closest(".b")){return ev(h.includes("/releases")?"apk_download":"view_code",{project:proj()})}
if(h.includes("github.com"))return ev("click_github");
if(h==="#projects"||h==="#contact"||h==="#about")ev("nav_click",{target:h.slice(1)})});
render(L);intro();
