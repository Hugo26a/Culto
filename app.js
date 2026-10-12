/* Culto — app web. Le contenu vient de editions/AAAA-MM-JJ.json, la liste de editions/index.json. */
const RUB={lit:"Littérature",essai:"Essai",eco:"Économie",geo:"Géopolitique",log:"Logistique",ent:"Entreprise"};
const $=id=>document.getElementById(id);
const store={get(k,d){try{const v=localStorage.getItem("culto:"+k);return v?JSON.parse(v):d}catch(e){return d}},set(k,v){try{localStorage.setItem("culto:"+k,JSON.stringify(v))}catch(e){}}};
const col=r=>`var(--${r})`;
const esc=t=>String(t).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const fr=v=>typeof v==="number"?v.toLocaleString("fr-FR"):v;

let IDX=null,ED=null,ITEMS=[],VOCAB={},cur=null;
let mode=store.get("mode","full"),read=store.get("read",{}),voiceName=store.get("voice",null),fsIdx=store.get("fs",1);
const FS=[16,18,20.5];document.documentElement.style.setProperty("--fs",FS[fsIdx]+"px");
const dur=i=>mode==="ex"?(i.exMin||i.min):i.min;
const blocksOf=i=>mode==="ex"&&i.ex&&i.ex.length?i.ex:i.blocks;
const isRead=id=>!!(ED&&read[ED.date]&&read[ED.date][id]);
const setRead=(id,v)=>{read[ED.date]=read[ED.date]||{};read[ED.date][id]=v;store.set("read",read)};
/* [[cle|texte]] → mot de la semaine cliquable */
const md=t=>String(t).replace(/\[\[(\w+)\|([^\]]+)\]\]/g,(_,k,x)=>`<button class="vw" data-v="${k}">${x}</button>`);

/* ---------- CHARGEMENT ---------- */
async function getJSON(u){const r=await fetch(u,{cache:"no-cache"});if(!r.ok)throw new Error(r.status);return r.json()}
async function boot(){
  try{IDX=await getJSON("editions/index.json");await loadEdition(IDX.latest)}
  catch(e){$("edLabel").textContent="Hors ligne";$("homeBody").innerHTML=`<p class="empty">Impossible de charger l’édition du jour.<br>Vérifie ta connexion puis rouvre Culto.</p>`}
}
async function loadEdition(date){
  ED=await getJSON(`editions/${date}.json`);ITEMS=ED.items;
  VOCAB=Object.fromEntries(((ED.week&&ED.week.words)||[]).map(w=>[w.key,w]));
  renderHome();renderWords();renderHist();window.scrollTo(0,0);
}

/* ---------- ACCUEIL ---------- */
function renderHome(){
  document.querySelectorAll("[data-mode]").forEach(b=>b.classList.toggle("on",b.dataset.mode===mode));
  const latest=ED.date===IDX.latest;
  $("archBar").innerHTML=latest?"":`<div class="archbar"><span>Tu consultes une ancienne édition</span><button data-goto="${IDX.latest}">Revenir à aujourd’hui</button></div>`;
  $("edLabel").textContent=`${ED.label} · ${ED.example?"Édition exemple":"Édition n° "+ED.n}`;$("edEx").hidden=!ED.example;
  const n=ITEMS.filter(i=>isRead(i.id)).length,N=ITEMS.length;
  $("ringTxt").textContent=`${n}/${N}`;$("ringFg").style.strokeDashoffset=119.4*(1-n/N);
  const tot=ITEMS.reduce((s,i)=>s+dur(i),0);
  $("hello").textContent=mode==="ex"?"Ton quart d’heure de culture":"Ta demi-heure de culture";
  const lit=ITEMS.find(i=>i.r==="lit"),ess=ITEMS.find(i=>i.r==="essai"),ana=ITEMS.filter(i=>i.kind==="analysis");
  if(lit){$("coverTitle").textContent=lit.tagline||lit.title;$("coverSrc").innerHTML=`<em>${esc(lit.title)}</em> · ${esc(lit.by.split("·")[0].trim())}`;$("coverRead").textContent=`Lire · ${dur(lit)} min`;$("coverDone").hidden=!isRead(lit.id)}
  $("weekLbl").textContent=ED.week?`jour ${ED.week.day} / 5`:"";
  $("wordsHome").innerHTML=Object.values(VOCAB).map(v=>`<button class="word" data-v="${v.key}"><span class="w">${esc(v.w)}</span><span class="ph">${esc((v.ph.split("·")[1]||"").trim())}</span><p>${esc(v.short)}</p></button>`).join("");
  $("essayDur").textContent=ess?`≈ ${dur(ess)} min`:"";
  $("essayHome").innerHTML=ess?`<button class="book ${isRead(ess.id)?"is-done":""}" style="--c:${col(ess.r)}" data-open="${ess.id}"><span class="spine"></span><span class="in"><span class="cap">Livre · Essai</span><h3>${esc(ess.title)}</h3><span class="by">${esc(ess.by)} · ${dur(ess)} min</span></span><span class="check">${isRead(ess.id)?"✓":""}</span></button>`:"";
  $("anaDur").textContent=`${ana.length} analyses · ${tot} min au total`;
  $("analysesHome").innerHTML=ana.map(a=>`<button class="arow ${isRead(a.id)?"is-done":""}" style="--c:${col(a.r)}" data-open="${a.id}"><span class="fig">${esc(a.fig||"")}<small>${esc(a.figl||"")}</small></span><span class="t"><span class="cap">${RUB[a.r]}</span><h3>${esc(a.title)}</h3><span class="m">${dur(a)} min</span></span><span class="check">${isRead(a.id)?"✓":""}</span></button>`).join("");
}
function renderWords(){
  $("wordsIntro").textContent=`Deux mots par semaine, retrouvés chaque jour dans au moins trois textes. ${ED.week?ED.week.label+" · jour "+ED.week.day+" / 5.":""}`;
  $("wordsFull").innerHTML=Object.values(VOCAB).map(v=>{
    const uses=ITEMS.filter(i=>JSON.stringify(blocksOf(i)).includes(`[[${v.key}|`));
    return `<div class="vcard"><div><div class="w">${esc(v.w)}</div><div class="gram">${esc(v.ph)}</div></div><p class="def">${esc(v.def)}</p><dl><div><dt>Étymologie</dt><dd>${esc(v.ety)}</dd></div><div><dt>Exemple</dt><dd><em>${esc(v.ex)}</em></dd></div><div><dt>Synonymes</dt><dd>${esc(v.syn)}</dd></div><div><dt>Dans l’édition · ${uses.length} textes</dt><dd class="uses">${uses.map(u=>`<button data-open="${u.id}" data-find="${v.key}">${esc(u.title.length>34?u.title.slice(0,32)+"…":u.title)}</button>`).join("")}</dd></div></dl></div>`;
  }).join("");
  const rv=IDX.review||[];
  $("reviewList").innerHTML=rv.length?rv.map(r=>`<div><b>${esc(r.w)}</b><span>${esc(r.short)} · ${esc(r.week)}</span></div>`).join(""):`<p class="muted" style="margin:0;font-size:14px">Les mots des semaines passées apparaîtront ici.</p>`;
}
function renderHist(){
  $("histList").innerHTML=(IDX.editions||[]).map(h=>{
    const r=read[h.date]?Object.values(read[h.date]).filter(Boolean).length:0;
    return `<button class="hday" data-goto="${h.date}"><header><h3>${esc(h.label)}</h3><span class="cap muted">${h.date===ED.date?"Affichée · ":""}${r}/${h.items.length} lus</span></header><ul>${h.items.map(([rb,t])=>`<li style="--c:${col(rb)}">${esc(t)}</li>`).join("")}</ul>${h.words?`<p class="vw2 muted" style="margin:12px 0 0;font-size:13px">Mots : <b style="color:var(--gold)">${h.words.map(esc).join(" · ")}</b></p>`:""}</button>`}).join("");
}

/* ---------- GRAPHIQUES (spécification JSON générique) ---------- */
function niceStep(range){const raw=range/4,p=10**Math.floor(Math.log10(raw||1));return [1,2,2.5,5,10].find(k=>k*p>=raw)*p}
const fmtv=(c,v)=>(c.prefix||"")+fr(v)+(c.suffix||"");
function chartHTML(c){
  let svg="";
  if(c.type==="hbar"){
    const W=320,max=Math.max(...c.rows.map(r=>r[1])),hi=Math.ceil(max/niceStep(max))*niceStep(max),bw=W-60,H=c.rows.length*56+8;
    svg=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(c.title)}">`+c.rows.map(([l,v],i)=>{const y=4+i*56,w=Math.max(3,v/hi*bw),top=v===max;
      return `<text x="0" y="${y+13}" font-size="12" fill="var(--ink)">${esc(l)}</text><rect x="0" y="${y+20}" width="${w}" height="24" rx="5" fill="${top?"var(--c)":"var(--muted)"}" opacity="${top?1:.55}"/><text x="${w+6}" y="${y+37}" font-size="13" font-weight="700" fill="var(--ink)">${esc(fmtv(c,v))}</text>`}).join("")+`</svg>`;
  } else if(c.type==="vbar"){
    const all=c.series.flatMap(s=>s.values),mx=Math.max(...all,0),mn=Math.min(...all,0),st=niceStep(mx-mn),hi=Math.ceil(mx/st)*st,lo=Math.floor(mn/st)*st;
    const W=320,H=190,top=14,bot=H-28,x0=28,y=v=>top+(hi-v)/(hi-lo||1)*(bot-top),n=c.labels.length,gw=(W-x0)/n,ns=c.series.length,bw=Math.min(28,gw*0.7/ns);
    const pal=["var(--c)","var(--gold)","var(--muted)"];
    let g="";for(let v=lo;v<=hi+1e-9;v+=st)g+=`<line x1="${x0}" x2="${W}" y1="${y(v)}" y2="${y(v)}" stroke="${Math.abs(v)<1e-9?"var(--muted)":"var(--line)"}"/><text x="${x0-6}" y="${y(v)+3.5}" text-anchor="end" font-size="10" fill="var(--muted)">${fr(+v.toFixed(2))}</text>`;
    let b="";c.labels.forEach((l,i)=>{const cx=x0+gw*i+gw/2;c.series.forEach((s,k)=>{const v=s.values[i];if(v==null)return;const x=cx-ns*bw/2+k*bw,a=y(Math.max(v,0)),h=Math.max(Math.abs(y(v)-y(0)),1.5);
      b+=`<rect x="${x+1}" y="${a}" width="${bw-2}" height="${h}" rx="3" fill="${pal[k%3]}"/><text x="${x+bw/2}" y="${v<0?y(v)+11:a-4}" text-anchor="middle" font-size="9.5" font-weight="700" fill="var(--ink)">${esc(fmtv(c,v))}</text>`});
      b+=`<text x="${cx}" y="${H-10}" text-anchor="middle" font-size="10.5" fill="var(--muted)">${esc(l)}</text>`});
    svg=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(c.title)}">${g}${b}</svg>`+(ns>1?`<div class="lg">${c.series.map((s,k)=>`<span><i style="background:${pal[k%3]}"></i>${esc(s.name)}</span>`).join("")}</div>`:"");
  }
  return `<figure class="chart" style="margin-inline:0"><h6>${esc(c.title)}</h6>${c.sub?`<p class="sub">${esc(c.sub)}</p>`:""}${svg}${c.note?`<p class="srcl">${esc(c.note)}</p>`:""}</figure>`;
}

/* ---------- LECTEUR ---------- */
function blockHTML(b,i){
  if(b.h) return `<h4 id="s${i}">${esc(b.h)}</h4>`;
  if(b.h5) return `<h5>${esc(b.h5)}</h5>`;
  if(b.p) return `<p data-s class="${b.lead?"lead":""}">${md(b.p)}</p>`;
  if(b.ul) return `<ul class="bul">${b.ul.map(x=>`<li data-s>${md(x)}</li>`).join("")}</ul>`;
  if(b.keys) return `<ul class="keys">${b.keys.map(([t,s])=>`<li data-s><div><b>${md(t)}</b><span>${md(s)}</span></div></li>`).join("")}</ul>`;
  if(b.quote) return `<blockquote class="quote" data-s><p>« ${esc(b.quote)} »</p><cite>${esc(b.cite||"")}</cite></blockquote>`;
  if(b.stats) return `<div class="stats">${b.stats.map(([v,l])=>`<div class="stat"><b>${esc(v)}</b><span>${esc(l)}</span></div>`).join("")}</div>`;
  if(b.chart) return chartHTML(b.chart);
  return "";
}
function openItem(id,find){
  cur=ITEMS.find(i=>i.id===id);if(!cur)return;const idx=ITEMS.indexOf(cur),BL=blocksOf(cur);
  document.querySelectorAll("[data-mode]").forEach(b=>b.classList.toggle("on",b.dataset.mode===mode));
  $("reader").style.setProperty("--c",col(cur.r));
  const parts=BL.filter(b=>b.h).length;
  const kicker=cur.kind==="book"?(cur.r==="lit"?"Livre · Littérature":"Livre · Essai"):RUB[cur.r];
  $("rHero").innerHTML=`<div class="rhero"><span class="cap">${kicker}</span><h2>${esc(cur.title)}</h2><p class="by">${esc(cur.by)}</p><div class="meta"><span>${mode==="ex"?"Express":"Complet"} · ${dur(cur)} min</span><span>${parts} parties</span><span>${idx+1} / ${ITEMS.length}</span></div></div>`;
  $("rChips").innerHTML=BL.map((b,i)=>b.h?`<button data-to="s${i}">${esc(b.h)}</button>`:"").join("");
  const nxt=ITEMS[idx+1];
  $("rBody").innerHTML=BL.map(blockHTML).join("")+
   `<div class="endbox">${cur.src?`<p class="sources"><b>Sources.</b> ${esc(cur.src)}</p>`:""}<button class="mark ${isRead(cur.id)?"on":""}" id="markBtn">${isRead(cur.id)?"✓ Lu":"Marquer comme lu"}</button>${nxt?`<button class="next" data-open="${nxt.id}"><span><span class="cap">À suivre · ${RUB[nxt.r]}</span><b>${esc(nxt.title)}</b></span><span aria-hidden="true">→</span></button>`:""}</div>`;
  $("rBody").querySelectorAll("h4,h5,[data-s]").forEach((el,i)=>el.dataset.q=i+1);
  $("markBtn").onclick=()=>{setRead(cur.id,!isRead(cur.id));const b=$("markBtn");b.classList.toggle("on",isRead(cur.id));b.textContent=isRead(cur.id)?"✓ Lu":"Marquer comme lu";renderHome();renderHist()};
  $("reader").hidden=false;$("tabs").hidden=true;$("reader").scrollTop=0;
  $("player").classList.remove("above-tabs");
  spyChips();updateIcons();if(playingId===playKey())highlight(qi,false);
  if(find){const el=$("rBody").querySelector(`[data-v="${find}"]`);if(el)setTimeout(()=>{el.scrollIntoView({block:"center"});el.animate([{background:"var(--gold-soft)"},{background:"transparent"}],{duration:1400})},60)}
}
function closeReader(){$("reader").hidden=true;$("tabs").hidden=false;$("player").classList.add("above-tabs")}
function spyChips(){
  const hs=[...$("rBody").querySelectorAll("h4")],chips=[...$("rChips").querySelectorAll("button")];
  const upd=()=>{let k=0;hs.forEach((h,i)=>{if(h.getBoundingClientRect().top<180)k=i});chips.forEach((c,i)=>c.classList.toggle("on",i===k))};
  $("reader").onscroll=upd;upd();
}

/* ---------- AUDIO (synthèse vocale de l'appareil) ---------- */
const synth=window.speechSynthesis;const SPEEDS=[0.9,1,1.15,1.3,1.5];
let rate=store.get("rate",1);
let queue=[],qi=0,playing=false,paused=false,playingId=null,playingTitle="";
const playKey=()=>cur&&ED?`${ED.date}/${cur.id}/${mode}`:null;
const isGood=v=>/(enhanced|premium|améliorée|amélioré|neural|natural|siri)/i.test(v.name+" "+(v.voiceURI||""));
function frVoices(){if(!synth)return[];return synth.getVoices().filter(v=>/^fr/i.test(v.lang)).sort((a,b)=>(isGood(b)-isGood(a))||(/fr.FR/i.test(b.lang)-/fr.FR/i.test(a.lang)))}
const vkey=v=>v.voiceURI||v.name;
function pickVoice(){const vs=frVoices();return vs.find(v=>vkey(v)===voiceName)||vs.find(v=>v.name===voiceName)||vs[0]||null}
function voiceLabel(){const v=pickVoice();return `${v?v.name:"Voix iOS"} · ${String(rate).replace(".",",")}×`}
function buildQueue(){
  const q=[{text:cur.title+". "+cur.by.replace("·",",")+".",label:"Titre"}];let sec="";
  $("rBody").querySelectorAll("h4,h5,[data-s]").forEach(el=>{if(el.tagName==="H4")sec=el.innerText;q.push({text:el.innerText.replace(/[«»]/g,""),label:sec})});
  return q;
}
const PLAY='<path d="M8 5.5v13l11-6.5z"/>',PAUSE='<path d="M6.5 4.5h4v15h-4zM13.5 4.5h4v15h-4z"/>';
function updateIcons(){
  const on=playing&&!paused,mine=playingId&&playingId===playKey();
  $("pIcon").innerHTML=on?PAUSE:PLAY;$("pPlay").setAttribute("aria-label",on?"Pause":"Reprendre");
  $("rPlayIcon").innerHTML=mine&&on?PAUSE:PLAY;$("rPlay").classList.toggle("on",!!(mine&&playing));
  const fp=$("fpPlay");if(fp)fp.innerHTML=`<svg viewBox="0 0 24 24">${on?PAUSE:PLAY}</svg>`;
  $("pTitle").textContent=playingTitle;$("pSub").textContent=voiceLabel();
}
function highlight(i,scroll=true){
  qi=i;const pct=(i/Math.max(queue.length-1,1)*100)+"%";
  $("pTrack").style.width=pct;
  const fb=$("fpBar");if(fb){fb.style.width=pct;$("fpPos").textContent=`Passage ${i+1} / ${queue.length}`;$("fpNow").textContent=queue[i]?queue[i].label:""}
  document.querySelectorAll(".speaking").forEach(e=>e.classList.remove("speaking"));
  if(playingId===playKey()&&!$("reader").hidden){const el=$("rBody").querySelector(`[data-q="${i}"]`);if(el){el.classList.add("speaking");if(scroll)el.scrollIntoView({block:"center",behavior:"smooth"})}}
}
/* Toute la lecture est mise en file d'attente d'un coup (iOS n'applique la voix choisie qu'aux phrases lancées par un geste). */
function enqueueFrom(start){
  synth.cancel();const v=pickVoice();
  for(let i=start;i<queue.length;i++){
    const u=new SpeechSynthesisUtterance(queue[i].text);
    if(v){u.voice=v;u.lang=v.lang}else u.lang="fr-FR";
    u.rate=rate;u.onstart=()=>{if(playing)highlight(i)};
    if(i===queue.length-1)u.onend=()=>{if(playing&&!paused){playing=false;updateIcons();$("pTrack").style.width="100%"}};
    synth.speak(u);
  }
}
function startAudio(from=0){
  if(!synth){openSheet(playerSheet());return}
  queue=buildQueue();playingId=playKey();playingTitle=cur.title;
  playing=true;paused=false;$("player").hidden=false;
  $("player").classList.toggle("above-tabs",$("reader").hidden);
  highlight(from);enqueueFrom(from);updateIcons();
}
function jump(i){if(!queue.length)return;i=Math.max(0,Math.min(queue.length-1,i));playing=true;paused=false;highlight(i);enqueueFrom(i);updateIcons()}
function togglePause(){
  if(!playing){jump(qi>=queue.length-1?0:qi);return}
  if(!paused){synth.pause();paused=true}else{synth.resume();paused=false}
  updateIcons();
}
function closePlayer(){playing=false;paused=false;playingId=null;if(synth)synth.cancel();$("player").hidden=true;document.querySelectorAll(".speaking").forEach(e=>e.classList.remove("speaking"));updateIcons()}
$("pPlay").onclick=togglePause;
$("pStop").onclick=closePlayer;
$("pInfo").onclick=()=>openSheet(playerSheet());
$("rPlay").onclick=()=>{if(playingId===playKey()&&playing)togglePause();else startAudio(0)};
if(synth)synth.onvoiceschanged=()=>updateIcons();

/* ---------- FEUILLES ---------- */
function openSheet(html){$("sheet").innerHTML=`<div class="grab"></div>${html}<button class="closebtn" data-close>Fermer</button>`;$("scrim").hidden=false}
function closeSheet(){$("scrim").hidden=true}
function wordSheet(k){const v=VOCAB[k];if(!v)return"";return `<div class="w">${esc(v.w)}</div><p class="muted" style="font-family:var(--ui);font-size:13px;margin:6px 0 0">${esc(v.ph)}</p><p>${esc(v.def)}</p><p style="font-size:14.5px;color:var(--muted)"><b style="color:var(--ink)">Étymologie.</b> ${esc(v.ety)}</p><p style="font-size:14.5px"><b>Exemple.</b> <em>${esc(v.ex)}</em></p>`}
function voiceList(){
  const all=synth?synth.getVoices():[],vs=frVoices(),cv=pickVoice();
  return `<div class="vlist">${vs.length?vs.map(v=>`<button class="vopt ${cv&&vkey(v)===vkey(cv)?"on":""}" data-voice="${esc(vkey(v))}"><span><b>${esc(v.name)}</b><br><small>${esc(v.lang)}</small></span>${isGood(v)?'<span class="tag">Premium</span>':""}</button>`).join(""):`<p style="font-size:14.5px">Aucune voix française détectée.</p>`}</div>
  <p class="diag">${vs.length} voix française${vs.length>1?"s":""} visible${vs.length>1?"s":""} par l’app, sur ${all.length} au total.</p>`;
}
function playerSheet(){
  const on=playing&&!paused;
  return `<div class="fp"><span class="cap muted">En lecture</span><h3 style="margin-top:6px">${esc(playingTitle||"—")}</h3><p class="now" id="fpNow">${queue[qi]?esc(queue[qi].label):""}</p>
  <div class="bar"><i id="fpBar" style="width:${queue.length?(qi/Math.max(queue.length-1,1)*100):0}%"></i></div><div class="pos"><span id="fpPos">Passage ${qi+1} / ${queue.length||1}</span><span>${String(rate).replace(".",",")}×</span></div>
  <div class="ctrl">
   <div><button data-act="prev" aria-label="Passage précédent"><svg viewBox="0 0 24 24"><path d="M6 5h2.5v14H6zM19 5.5v13L9.5 12z"/></svg></button><small>Précédent</small></div>
   <div><button class="big" id="fpPlay" data-act="toggle" aria-label="Lecture ou pause"><svg viewBox="0 0 24 24">${on?PAUSE:PLAY}</svg></button><small>&nbsp;</small></div>
   <div><button data-act="next" aria-label="Passage suivant"><svg viewBox="0 0 24 24"><path d="M15.5 5H18v14h-2.5zM5 5.5v13l9.5-6.5z"/></svg></button><small>Suivant</small></div>
  </div>
  <h4>Vitesse</h4><div class="spd">${SPEEDS.map(r=>`<button data-rate="${r}" class="${r===rate?"on":""}">${String(r).replace(".",",")}×</button>`).join("")}</div>
  <h4>Voix</h4>${voiceList()}</div>`;
}

/* ---------- ÉVÉNEMENTS ---------- */
document.addEventListener("click",e=>{
  const t=e.target.closest("button,[data-s]");if(!t)return;
  if(t.matches("[data-close]"))return closeSheet();
  if(t.dataset.mode){if(t.dataset.mode!==mode){mode=t.dataset.mode;store.set("mode",mode);renderHome();renderWords();if(!$("reader").hidden)openItem(cur.id)}return}
  if(t.dataset.goto){closeSheet();if(!$("reader").hidden)closeReader();loadEdition(t.dataset.goto).then(()=>showView("vToday"));return}
  if(t.dataset.act){const a=t.dataset.act;if(a==="toggle")togglePause();else jump(qi+(a==="next"?1:-1));return}
  if(t.dataset.rate){rate=+t.dataset.rate;store.set("rate",rate);if(playing&&!paused)jump(qi);updateIcons();openSheet(playerSheet());return}
  if(t.dataset.voice){voiceName=t.dataset.voice;store.set("voice",voiceName);if(playing&&!paused)jump(qi);updateIcons();openSheet(playerSheet());return}
  if(t.classList.contains("word")||t.classList.contains("vw")){e.stopPropagation();return openSheet(wordSheet(t.dataset.v))}
  if(t.dataset.open){closeSheet();return openItem(t.dataset.open,t.dataset.find)}
  if(t.dataset.to){const h=$(t.dataset.to);if(h)h.scrollIntoView({behavior:"smooth",block:"start"});return}
  if(t.dataset.s!==undefined&&playing&&playingId===playKey()){jump(+t.dataset.q);return}
  if(t.classList.contains("tab"))return showView(t.dataset.v);
});
function showView(v){document.querySelectorAll(".tab").forEach(b=>b.setAttribute("aria-current",b.dataset.v===v?"true":"false"));["vToday","vWords","vHist"].forEach(x=>$(x).hidden=x!==v);window.scrollTo(0,0)}
$("scrim").addEventListener("click",e=>{if(e.target===$("scrim"))closeSheet()});
$("coverBtn").onclick=e=>{const lit=ITEMS.find(i=>i.r==="lit");if(!lit)return;const listen=e.target.closest("#coverListen");openItem(lit.id);if(listen)startAudio(0)};
$("rBack").onclick=closeReader;
$("rSize").onclick=()=>{fsIdx=(fsIdx+1)%FS.length;store.set("fs",fsIdx);document.documentElement.style.setProperty("--fs",FS[fsIdx]+"px")};
document.addEventListener("keydown",e=>{if(e.key==="Escape"){if(!$("scrim").hidden)closeSheet();else if(!$("reader").hidden)closeReader()}});
/* nouvelle édition quand l'app revient au premier plan */
document.addEventListener("visibilitychange",async()=>{if(document.visibilityState!=="visible"||!IDX)return;try{const n=await getJSON("editions/index.json");if(n.latest!==IDX.latest&&ED.date===IDX.latest){IDX=n;await loadEdition(n.latest)}else IDX=n}catch(e){}});

/* ---------- OUVERTURE ANIMÉE ---------- */
let splashAnims=[];
function playSplash(){
  const sp=$("splash");if(!sp||sp.hidden||!sp.animate)return;
  splashAnims.forEach(x=>x.cancel());
  const E={out:"cubic-bezier(.2,.8,.2,1)",inout:"cubic-bezier(.65,0,.35,1)",spring:"cubic-bezier(.34,1.56,.64,1)"};
  const list=splashAnims=[];const an=(el,kf,o)=>{const x=el.animate(kf,{fill:"both",easing:E.out,...o});list.push(x);return x};
  const fmt=new Date().toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long",timeZone:"Europe/Paris"});
  $("spDate").textContent=fmt;
  const lines=[...$("spLines").children];
  lines.forEach((l,i)=>an(l,[{transform:"scaleX(0)",opacity:1},{transform:"scaleX(1)",opacity:1}],{delay:i*110,duration:420}));
  lines.forEach((l,i)=>{const dx=380,dy=512-(392+i*64+18);an(l,[{transform:"scaleX(1)",opacity:1},{transform:`translate(${dx}px,${dy}px) scaleX(.05)`,opacity:0}],{delay:800+i*40,duration:420,easing:E.inout,fill:"forwards"})});
  an($("spArc"),[{strokeDashoffset:1},{strokeDashoffset:0}],{delay:950,duration:650,easing:E.inout});
  an($("spDot"),[{transform:"scale(0)"},{transform:"scale(1)"}],{delay:1150,duration:520,easing:E.spring});
  [...$("spWord").children].forEach((l,i)=>an(l,[{opacity:0,transform:"translateY(14px)"},{opacity:1,transform:"none"}],{delay:1350+i*45,duration:420}));
  an($("spDate"),[{opacity:0,letterSpacing:".4em"},{opacity:.75,letterSpacing:".14em"}],{delay:1600,duration:600});
  an($("spSkip"),[{opacity:0},{opacity:.5}],{delay:600,duration:400});
  an($("vToday"),[{transform:"scale(.94)",opacity:.4},{transform:"none",opacity:1}],{delay:2350,duration:550,fill:"backwards"});
  const out=an(sp,[{opacity:1,transform:"none"},{opacity:0,transform:"scale(1.08)"}],{delay:2350,duration:550});
  const done=()=>{sp.hidden=true;list.forEach(x=>x.cancel())};
  out.finished.then(done).catch(()=>{});
  sp.onclick=()=>list.forEach(x=>x.finish());
}
playSplash();
/* rejoue aussi quand l'app revient au premier plan après plus d'une minute */
let hiddenAt=0;
document.addEventListener("visibilitychange",()=>{
  if(document.visibilityState==="hidden"){hiddenAt=Date.now();return}
  if(hiddenAt&&Date.now()-hiddenAt>60000&&!matchMedia("(prefers-reduced-motion: reduce)").matches){$("splash").hidden=false;playSplash()}
});

if("serviceWorker" in navigator)navigator.serviceWorker.register("sw.js").catch(()=>{});
boot();
