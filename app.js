const $=s=>document.querySelector(s),R=document.documentElement;
const ok=el=>el.closest(".ph")?.classList.add("ok");
function img(src,alt,cls){const f=document.createElement("figure");f.className="ph "+cls;const i=new Image();i.alt=alt;i.loading="lazy";i.onload=()=>ok(i);i.onerror=()=>ok(i);i.src=src;f.append(i);return f}
function render(l){const t=T[l];R.lang=l;
document.querySelectorAll("[data-i]").forEach(e=>e.textContent=t[e.dataset.i]);
$("#plist").innerHTML="";
P.forEach(p=>{const c=document.createElement("article");c.className="card";
const x=document.createElement("div");x.innerHTML=`<h3>${p.n}</h3><p class="badge">${t[p.st==="live"?"live":p.st==="test"?"test":"dev"]}</p><p>${t.d[p.n]}</p>${t.m[p.n]?`<p>${t.m[p.n]}</p>`:""}<p class="tech">${p.tech}</p>`;
const b=document.createElement("div");b.className="b";
if(p.code)b.innerHTML=`<a href="${p.code}" target="_blank" rel="noopener">${t.code}</a>`;
if(p.apk)b.innerHTML+=`<a href="${p.apk}" target="_blank" rel="noopener">${t.apk}</a>`;
if(p.code)x.append(b);c.append(x);
if(p.img){const s=document.createElement("div");s.className="shots";p.img.forEach((n,i)=>s.append(img(`img/${n}.webp`,`${p.n} ${i+1}`,"shot")));c.append(s)}
$("#plist").append(c)});
$("#abt").innerHTML=t.about.map(x=>`<p>${x}</p>`).join("");
$("#stack").innerHTML=S.map((v,i)=>`<dt>${t.k[i]}</dt><dd>${v}</dd>`).join("");
const e=atob(U.e),w=atob(U.w);
$("#links").innerHTML=`<a class="btn" href="mailto:${e}">${e}</a><button class="btn ghost" id="cp" type="button">${t.em}</button><a class="btn ghost" href="https://wa.me/${w}?text=${encodeURIComponent(t.wa)}" target="_blank" rel="noopener">WhatsApp</a><a class="btn ghost" href="${U.li}" target="_blank" rel="noopener">LinkedIn</a><a class="btn ghost" href="${U.gh}" target="_blank" rel="noopener">GitHub</a>`;
$("#cp").onclick=async ev=>{try{await navigator.clipboard.writeText(e);ev.target.textContent=t.ok;setTimeout(()=>ev.target.textContent=t.em,1500)}catch(_){}}}
const g=k=>{try{return localStorage.getItem(k)}catch(_){return null}},s=(k,v)=>{try{localStorage.setItem(k,v)}catch(_){}};
R.dataset.theme=g("th")||(matchMedia("(prefers-color-scheme:dark)").matches?"dark":"light");
const nl=(navigator.language||"es").slice(0,2);let L=g("lg")||(T[nl]?nl:"es");$("#lang").value=L;
$("#lang").onchange=e=>{L=e.target.value;s("lg",L);render(L)};
$("#theme").onclick=()=>{R.dataset.theme=R.dataset.theme==="dark"?"light":"dark";s("th",R.dataset.theme)};
$(".photo img").onload=e=>ok(e.target);if($(".photo img").complete)ok($(".photo img"));
render(L);
