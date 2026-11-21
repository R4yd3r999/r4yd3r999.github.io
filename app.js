const $=s=>document.querySelector(s),R=document.documentElement;
const ok=el=>el.closest(".ph")?.classList.add("ok");
function img(src,alt,cls,soon){const f=document.createElement("figure");f.className="ph "+cls;f.dataset.l=soon;const i=new Image();i.alt=alt;i.loading="lazy";i.onload=()=>ok(i);i.onerror=()=>{i.remove();f.classList.add("nope")};i.src=src;f.append(i);return f}
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
if(p.img){const s=document.createElement("div");s.className="shots";p.img.forEach((n,i)=>s.append(img(`img/${n}.webp`,`${p.n} ${i+1}`,"shot",t.soon)));c.append(s)}
$("#plist").append(c)});
$("#abt").innerHTML=t.about.map(x=>`<p>${x}</p>`).join("")+`<h3 class="et">${t.edu_t}</h3><ul class="edu">${t.edu.map(([a,b])=>`<li><b>${a}</b><span>${b}</span></li>`).join("")}</ul><h3 class="et">${t.lang_t}</h3><ul class="langs">${t.langs.map(([n,v,d])=>`<li><b>${n}</b><span>${v}</span><i class="dots" role="img" aria-label="${v}">${"<u class=\"on\"></u>".repeat(d)}${"<u></u>".repeat(5-d)}</i></li>`).join("")}</ul>`;
const lum=x=>{const n=parseInt(x,16);return(.299*(n>>16)+.587*((n>>8)&255)+.114*(n&255))/255};
const ico=k=>{const o=IC[k];return o.d?`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${o.d}"/></svg>`:`<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="${o.p}"/></svg>`};
$("#sk").innerHTML=K.map(g=>`<div class="grp"><h3 style="--o:${{s:1,u:.6,l:.3}[g.lv]}">${t["lv_"+g.lv]}<small>${t["c_"+g.lv]}</small></h3><ul class="chips">${g.i.map(([n,k])=>`<li class="chip" style="--c:${IC[k].h&&lum(IC[k].h)>.2?"#"+IC[k].h:"var(--a)"}">${ico(k)}<span>${n[0]==="@"?t[n.slice(1)]:n}</span></li>`).join("")}</ul></div>`).join("");
const e=atob(U.e),w=atob(U.w);
$("#links").innerHTML=`<a class="btn" href="mailto:${e}">${e}</a><button class="btn ghost" id="cp" type="button">${t.em}</button><a class="btn ghost" href="https://wa.me/${w}?text=${encodeURIComponent(t.wa)}" target="_blank" rel="noopener">WhatsApp</a>${[["linkedin","LinkedIn",U.li],["github","GitHub",U.gh]].map(([k,n,u])=>`<a class="chip" href="${u}" target="_blank" rel="noopener" style="--c:${IC[k].h&&lum(IC[k].h)>.2?"#"+IC[k].h:"var(--a)"}">${ico(k)}<span>${n}</span></a>`).join("")}`;
$("#cp").onclick=async ev=>{try{await navigator.clipboard.writeText(e);ev.target.textContent=t.ok;setTimeout(()=>ev.target.textContent=t.em,1500)}catch(_){}};
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
$("#lang").onchange=e=>{L=e.target.value;s("lg",L);render(L)};
$("#theme").onclick=()=>{R.dataset.theme=R.dataset.theme==="dark"?"light":"dark";s("th",R.dataset.theme)};
$(".photo img").onload=e=>ok(e.target);if($(".photo img").complete)ok($(".photo img"));
if(matchMedia("(hover:hover)").matches){addEventListener("pointermove",e=>{const t=e.target.closest?.(".tilt");if(!t)return;const r=t.getBoundingClientRect();t.style.setProperty("--ry",((e.clientX-r.left)/r.width-.5)*7+"deg");t.style.setProperty("--rx",-((e.clientY-r.top)/r.height-.5)*7+"deg")});
addEventListener("pointerout",e=>{const t=e.target.closest?.(".tilt");if(t){t.style.setProperty("--ry","0deg");t.style.setProperty("--rx","0deg")}})}
{const y=new Date().getFullYear();if(y>2026)$("#yr").textContent="2026–"+y}
const mb=$("#mb"),mp=$("#mp"),face=$("#face");let bt;
const blink=()=>{face.classList.remove("bl");void face.getBoundingClientRect();face.classList.add("bl")};
face.addEventListener("animationend",()=>face.classList.remove("bl"));
face.addEventListener("pointerdown",blink);
const idle=()=>{bt=setTimeout(()=>{blink();idle()},2200+Math.random()*3000)};
const setM=o=>{mp.classList.toggle("open",o);mb.classList.toggle("open",o);mb.setAttribute("aria-expanded",o);clearTimeout(bt);if(o)bt=setTimeout(()=>{blink();idle()},700)};
mb.onclick=e=>{e.stopPropagation();setM(!mp.classList.contains("open"))};
mp.querySelectorAll("a").forEach(x=>x.onclick=()=>setM(false));
document.addEventListener("click",e=>{if(!e.target.closest(".menu"))setM(false)});
addEventListener("keydown",e=>{if(e.key==="Escape")setM(false)});
addEventListener("pointermove",e=>{if(!mp.classList.contains("open"))return;const r=face.getBoundingClientRect(),dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2),d=Math.hypot(dx,dy)||1,k=Math.min(1,d/180)*2.2;face.style.setProperty("--px",(dx/d*k).toFixed(2)+"px");face.style.setProperty("--py",(dy/d*k).toFixed(2)+"px")});
render(L);intro();
