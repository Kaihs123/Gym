/* AETHER Gym, as an app in the hub. Data paths are unchanged from the original page. */
AETHER.mount("<!-- ================= GYM (west of home) ================= -->\n<section class=\"hub-page app app-gym\" data-page=\"gym\" data-tint=\"gym\" id=\"app-gym\" aria-label=\"Gym\" data-off>\n  <div class=\"hub-scroll\" id=\"g-scroll\">\n    <header class=\"hub-appbar\">\n      <div class=\"hub-appid\"><i class=\"gicon\" data-tint=\"gym\" data-glyph=\"gym\" style=\"--s:40px\"><svg viewBox=\"0 0 48 48\" aria-hidden=\"true\"><g transform=\"rotate(-36 24 24)\"><rect x=\"3.5\" y=\"19\" width=\"5\" height=\"10\" rx=\"2.5\" fill=\"#fff\" fill-opacity=\".72\"/><rect x=\"9\" y=\"14\" width=\"6.6\" height=\"20\" rx=\"3.3\" fill=\"#fff\"/><rect x=\"15\" y=\"21.8\" width=\"18\" height=\"4.4\" rx=\"2.2\" fill=\"#fff\" fill-opacity=\".86\"/><rect x=\"32.4\" y=\"14\" width=\"6.6\" height=\"20\" rx=\"3.3\" fill=\"#fff\"/><rect x=\"39.5\" y=\"19\" width=\"5\" height=\"10\" rx=\"2.5\" fill=\"#fff\" fill-opacity=\".72\"/></g></svg></i><div><b>Gym</b><span class=\"chip\" id=\"g-chip\" role=\"status\">Connecting…</span></div></div>\n      <button type=\"button\" class=\"hub-search\" data-hub=\"search\" aria-label=\"Search the hub\"><i data-glyph=\"search\"><svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><circle cx=\"10.8\" cy=\"10.8\" r=\"6.3\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"/><path d=\"m15.6 15.6 4.6 4.6\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\"/></svg></i><span>Search</span><kbd>⌘K</kbd></button>\n    </header>\n    <nav class=\"tabs\" id=\"g-tabs\" aria-label=\"Gym sections\"></nav>\n    <div class=\"wrap\">\n      <div class=\"layout\">\n        <div class=\"left\">\n          <section class=\"hero-card\">\n            <div class=\"balance\"><div class=\"bl\"><span class=\"eyebrow\" id=\"g-eyebrow\">This week</span><strong class=\"num\" id=\"g-topTotal\">0 sessions</strong><span class=\"sub\" id=\"g-topSub\"></span></div><div class=\"wk\" id=\"g-wk\" role=\"img\" aria-label=\"Sessions this week\"></div></div>\n            <div class=\"stage-head\"><h1>Body parts</h1><p>Tap one to log · bar = sets vs weekly goal</p></div>\n            <section class=\"stage\" id=\"g-stage\" tabindex=\"0\" aria-label=\"Body parts. Use left and right arrow keys to switch body part.\">\n              <div class=\"ring\" id=\"g-ring\"></div>\n              <div class=\"arrows\"><button type=\"button\" id=\"g-prev\" aria-label=\"Previous body part\">‹</button><button type=\"button\" id=\"g-next\" aria-label=\"Next body part\">›</button></div>\n              <button type=\"button\" class=\"hub\" id=\"g-hub\" aria-label=\"Training overview\"><small id=\"g-hubLab\">Chest</small><strong id=\"g-hubPct\">0</strong><small id=\"g-hubSub\">of recent sets</small></button>\n            </section>\n          </section>\n          <div class=\"strip\">\n            <div><span>Streak</span><strong id=\"g-sStreak\">0 days</strong></div>\n            <div><span>Week volume</span><strong id=\"g-sVol\">0 kg</strong></div>\n            <div class=\"pos\"><span>PBs · 30 days</span><strong id=\"g-sPB\">0</strong></div>\n          </div>\n        </div>\n        <section class=\"sheet\" id=\"g-sheet\"></section>\n      </div>\n    </div>\n  </div>\n  <div class=\"rest\" id=\"g-rest\" role=\"group\" aria-label=\"Rest timer\" hidden><span class=\"rg\" aria-hidden=\"true\"></span><span class=\"rt\"><small id=\"g-restLab\">Rest</small><b id=\"g-restTime\">0:00</b></span><button type=\"button\" id=\"g-restAdd\">+30s</button><button type=\"button\" class=\"sk\" id=\"g-restSkip\">Skip</button></div>\n  <div class=\"lb\" id=\"g-lb\" role=\"dialog\" aria-modal=\"true\" aria-label=\"Progress photo\" hidden></div>\n</section>\n");
(function(){
"use strict";
const ROOT=document.getElementById("app-gym");
/* static ids on the hub page carry a g- prefix so they never collide with other apps */
const GIDS=new Set(["chip","tabs","eyebrow","topTotal","topSub","wk","stage","ring","prev","next","hub","hubLab","hubPct","hubSub","sStreak","sVol","sPB","sheet","rest","restLab","restTime","restAdd","restSkip","lb"]);
const $=id=>document.getElementById(GIDS.has(id)?"g-"+id:id);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const r1=n=>Math.round(n*10)/10;
const nf=(n,d)=>Number(n).toLocaleString("en-GB",{maximumFractionDigits:d==null?0:d});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const LS={
  get(k){try{return localStorage.getItem(k)}catch(e){return null}},
  set(k,v){try{localStorage.setItem(k,v);return true}catch(e){return false}},
  del(k){try{localStorage.removeItem(k)}catch(e){}}
};
const KEY={plan:"aethergym-plan",sess:"aethergym-sessions",photos:"aethergym-photos",theme:"aethergym-theme"};

/* ---------- dates (local, YYYY-MM-DD) ---------- */
const WD=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const MO=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const MOL=["January","February","March","April","May","June","July","August","September","October","November","December"];
const pad=n=>(n<10?"0":"")+n;
const ymd=d=>d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate());
const parse=s=>{const p=s.split("-");return new Date(+p[0],+p[1]-1,+p[2])};
const todayS=()=>ymd(new Date());
const addDays=(s,n)=>{const d=parse(s);d.setDate(d.getDate()+n);return ymd(d)};
const diff=(a,b)=>Math.round((parse(a)-parse(b))/864e5);
const dShort=s=>{const d=parse(s);return WD[d.getDay()]+" "+d.getDate()+" "+MO[d.getMonth()]};
const dFull=s=>{const d=parse(s);return d.getDate()+" "+MO[d.getMonth()]+" "+d.getFullYear()};
const wkStart=s=>{const d=parse(s);d.setDate(d.getDate()-((d.getDay()+6)%7));return ymd(d)};
const isDate=s=>typeof s==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&!isNaN(parse(s));
const agoShort=s=>{if(!s)return "—";const n=diff(todayS(),s);if(n<=0)return "Today";if(n<14)return n+"d ago";if(n<60)return Math.round(n/7)+"w ago";return Math.round(n/30)+"mo ago"};
const agoLong=s=>{if(!s)return "never";const n=diff(todayS(),s);if(n<=0)return "today";if(n===1)return "yesterday";if(n<14)return n+" days ago";if(n<60)return Math.round(n/7)+" weeks ago";return Math.round(n/30)+" months ago"};

/* ---------- catalogue ---------- */
const PARTS=[
  {key:"chest",label:"Chest",ex:[["bench","Barbell bench press"],["incdb","Incline dumbbell press"],["mpress","Machine chest press"],["wpchest","Plate-loaded chest press"],["wtachest","Total Access chest press"],["wdschest","Dual stack chest press (Animal)"],["wpec","Pec fly (multi pec/delt)"],["cfly","Cable fly"],["dips","Dips",1],["wasdip","Assisted dip",2],["push","Push-ups",1]]},
  {key:"back",label:"Back",ex:[["dead","Deadlift"],["pull","Pull-ups",1],["wassist","Assisted chin-up",2],["row","Barbell row"],["lat","Lat pulldown"],["wdspull","Dual stack front pulldown (Animal)"],["wsrow","Seated row (selectorised)"],["crow","Low pulley row"],["dbrow","One-arm dumbbell row"],["wbackext","Hyper extension"],["wcr1","Single-arm cable row"]]},
  {key:"shoulders",label:"Shoulders",ex:[["ohp","Overhead press"],["dbp","Dumbbell shoulder press"],["wpsp","Plate-loaded shoulder press"],["lat","Lateral raise"],["rear","Rear delt fly"],["wrdelt","Rear delt machine (multi pec/delt)"],["wcrd","Cable rear delt fly"],["wcl","Cable lateral raise"],["face","Face pull"],["shrug","Shrugs"]]},
  {key:"arms",label:"Arms",ex:[["bcurl","Barbell curl"],["hcurl","Hammer curl"],["icurl","Incline dumbbell curl"],["wbc","Biceps curl machine"],["pushdn","Triceps pushdown"],["skull","Skull crushers"],["ohext","Overhead triceps extension"],["wtx","Triceps extension machine"],["wcc","Cable curl"]]},
  {key:"legs",label:"Legs",ex:[["squat","Back squat"],["wlev","Leverage squat (plate)"],["whack","Hack squat (Animal plate)"],["rdl","Romanian deadlift"],["lpress","Leg press"],["lunge","Walking lunges"],["lext","Leg extension"],["lcurl","Lying leg curl"],["wadd","Hip adductor"],["wabd","Hip abductor"],["calf","Calf raise"],["wcgk","Cable glute kickback"]]},
  {key:"core",label:"Core",ex:[["cable","Cable crunch"],["hang","Hanging leg raise",1],["wheel","Ab wheel rollout",1],["decl","Decline sit-up",1],["twist","Russian twist"],["wcw","Cable woodchop"],["crunch","Crunches",1]]}
];
const partOf=k=>PARTS.find(p=>p.key===k)||PARTS[0];
const validPart=k=>PARTS.some(p=>p.key===k);
const validId=s=>typeof s==="string"&&/^[\w-]{1,60}$/.test(s);

/* ---------- state ---------- */
let unit="kg";
const DEFAULT_GROUPS=[["chest","back"],["shoulders","arms"],["core","legs"]];
const DEFAULT_HIDE={"chest-mpress":1,"r-chest-pec-deck":1,"r-shoulders-reverse-pec-deck":1,"r-back-reverse-hyperextension":1,"r-back-back-extension":1,"r-legs-hack-squat":1,"r-legs-seated-leg-curl":1,"r-legs-seated-calf-raise":1};
let PLAN={unit:"kg",custom:[],goal:10,rest:90,sched:{},uni:{},pick:{},goals:{},groups:DEFAULT_GROUPS.map(g=>g.slice()),day:{},hide:{}};
let SESS={};
let PHOTOS=[];
let ver=1,IDX=null;
const S={page:"home",part:"chest",tab:"log",pickKey:null,dayAdd:false,manage:false,date:todayS(),dateAuto:true,open:null,entry:{},ed:null,coachOpen:true,covOpen:false,msg:"",msgErr:false,msgFor:null,
  addEx:false,newName:"",newBw:false,histN:12,sel:null,
  calMonth:todayS().slice(0,8)+"01",calSel:todayS(),
  pDate:todayS(),pNote:"",pMsg:"",pErr:false,upBusy:false,lb:null,lbConfirm:false,exportText:null,copied:false};

/* weights are stored in kg and shown in the chosen unit */
const KG2LB=2.2046226218;
const dw=kg=>unit==="lb"?kg*KG2LB:kg;
const fw=kg=>{const v=r1(dw(kg));return Number.isInteger(v)?String(v):v.toFixed(1)};
const toKg=v=>Math.round((unit==="lb"?v/KG2LB:v)*1000)/1000;
const vol=kg=>{const v=dw(kg);return (v>=100000?nf(v/1000)+"k":nf(v))+" "+unit};
const e1=(w,r)=>w*(1+r/30);
const sideW=s=>s.L.w===s.R.w?fw(s.L.w):fw(s.L.w)+"/"+fw(s.R.w);
const fset=(s,bw)=>s.L?((s.L.w||s.R.w)?sideW(s)+" "+unit+" × ":"")+"L"+s.L.r+" R"+s.R.r:(bw===2?(s.w?"assist "+fw(s.w)+" "+unit+" × "+s.r:s.r+" reps"):((bw&&!s.w)?s.r+" reps":fw(s.w)+" "+unit+" × "+s.r));
const csx=(s,bw)=>s.L?((s.L.w||s.R.w)?sideW(s)+"×":"")+"L"+s.L.r+" R"+s.R.r:(bw===2?(s.w?"assist "+fw(s.w)+"×"+s.r:s.r+" reps"):((bw&&!s.w)?s.r+" reps":fw(s.w)+"×"+s.r));
const setVol=s=>s.L?s.L.w*s.L.r+s.R.w*s.R.r:s.w*s.r;
const sideOf=x=>{if(!x||typeof x!=="object")return null;const w=+x.w,r=Math.round(+x.r);return(isFinite(w)&&w>=0&&w<=2000&&isFinite(r)&&r>=1&&r<=1000)?{w:w,r:r}:null};
const weakSide=(bw,L,R)=>better(bw,L,R)?R:L;
const okW=(w,bw)=>isFinite(w)&&w>=0&&w<=2000&&(bw||w>0);
const okR=r=>isFinite(r)&&r>=1&&r<=1000;
const better=(bw,a,b)=>bw===2?(a.w<b.w||(a.w===b.w&&a.r>b.r)):bw?(a.w>b.w||(a.w===b.w&&a.r>b.r)):e1(a.w,a.r)>e1(b.w,b.r)+1e-9;

/* ---------- cleaning data that comes back from storage ---------- */
function cleanSession(date,raw){
  if(!isDate(date)||!raw||typeof raw!=="object"||!raw.ex||typeof raw.ex!=="object")return null;
  const out={date:date,ex:{}};
  Object.keys(raw.ex).forEach(id=>{
    const e=raw.ex[id];
    if(!validId(id)||!e||!Array.isArray(e.sets))return;
    const sets=e.sets.map(s=>{
      const o={w:+(s&&s.w),r:Math.round(+(s&&s.r)),t:+(s&&s.t)||0};
      const L=sideOf(s&&s.L),R=sideOf(s&&s.R);
      if(L&&R){const wk=weakSide(+e.bw===2?2:(e.bw?1:0),L,R);o.L=L;o.R=R;o.w=wk.w;o.r=wk.r}
      return o;
    }).filter(s=>isFinite(s.w)&&s.w>=0&&s.w<=2000&&isFinite(s.r)&&s.r>=1&&s.r<=1000);
    if(!sets.length)return;
    out.ex[id]={n:String(e.n||id).slice(0,60),p:validPart(e.p)?e.p:"chest",bw:+e.bw===2?2:(e.bw?1:0),sets:sets};
  });
  return Object.keys(out.ex).length?out:null;
}
function cleanPlan(raw){
  const o={unit:"kg",custom:[],goal:10,rest:90,sched:{},uni:{},pick:{},goals:{},groups:DEFAULT_GROUPS.map(g=>g.slice()),day:{},hide:{}};
  if(!raw||typeof raw!=="object")return o;
  if(raw.unit==="lb")o.unit="lb";
  const g=Math.round(+raw.goal);if(g>=1&&g<=40)o.goal=g;
  if(raw.rest!=null&&[0,60,90,120,180].indexOf(+raw.rest)>=0)o.rest=+raw.rest;
  if(Array.isArray(raw.sched)){
    const cut=addDays(todayS(),-60),all=PARTS.map(x=>x.key);
    raw.sched.forEach(e=>{
      if(!e||!isDate(e.d)||e.d<cut||!Array.isArray(e.p))return;
      const ks=all.filter(k=>e.p.indexOf(k)>=0);
      if(ks.length)o.sched[e.d]=ks;
    });
  }
  if(Array.isArray(raw.uni))raw.uni.forEach(e=>{if(e&&validId(e.id))o.uni[e.id]=e.v?1:0});
  if(Array.isArray(raw.hide))raw.hide.forEach(e=>{if(e&&validId(e.id))o.hide[e.id]=e.v?1:0});
  if(Array.isArray(raw.goals))raw.goals.forEach(e=>{const n=Math.round(+(e&&e.n));if(e&&validPart(e.k)&&n>=1&&n<=40)o.goals[e.k]=n});
  if(Array.isArray(raw.groups)){
    const used={},gs=[];
    raw.groups.slice(0,6).forEach(e=>{
      if(!e||!Array.isArray(e.p))return;
      const ks=PARTS.map(x=>x.key).filter(k=>e.p.indexOf(k)>=0&&!used[k]);
      ks.forEach(k=>{used[k]=1});
      if(ks.length)gs.push(ks);
    });
    o.groups=gs;
  }
  if(Array.isArray(raw.day)){
    const cut=addDays(todayS(),-60);
    raw.day.forEach(e=>{
      if(!e||!isDate(e.d)||e.d<cut||!Array.isArray(e.p))return;
      const ks=PARTS.map(x=>x.key).filter(k=>e.p.indexOf(k)>=0);
      if(ks.length>1)o.day[e.d]=ks;
    });
  }
  if(Array.isArray(raw.pick)){
    const cut=addDays(todayS(),-60);
    raw.pick.forEach(e=>{
      if(!e||!isDate(e.d)||e.d<cut||!Array.isArray(e.x))return;
      const xs=[];e.x.forEach(id=>{if(validId(id)&&xs.indexOf(id)<0&&xs.length<120)xs.push(id)});
      if(xs.length)o.pick[e.d]=xs;
    });
  }
  if(Array.isArray(raw.custom))raw.custom.forEach(c=>{
    if(c&&validId(c.id)&&validPart(c.p)&&typeof c.n==="string"&&c.n.trim())o.custom.push({id:c.id,p:c.p,n:c.n.trim().slice(0,40),bw:+c.bw===2?2:(c.bw?1:0)});
  });
  return o;
}
function cleanPhoto(id,raw){
  if(!validId(id)||!raw||typeof raw!=="object"||!isDate(raw.date))return null;
  const p={id:id,date:raw.date,note:String(raw.note||"").slice(0,120),at:+raw.at||0};
  if(typeof raw.asset==="string"&&/^[\w-]{8,64}$/.test(raw.asset))p.asset=raw.asset;
  else if(typeof raw.data==="string"&&raw.data.indexOf("data:image/")===0)p.data=raw.data;
  else return null;
  return p;
}
const sortPhotos=()=>PHOTOS.sort((a,b)=>a.date<b.date?1:a.date>b.date?-1:(b.at-a.at));
const photoUrl=p=>p.data||(window.AETHER_PHOTO_URL?window.AETHER_PHOTO_URL(p.asset):"/_blob/"+p.asset);
const planOut=()=>({unit:PLAN.unit,goal:PLAN.goal,rest:PLAN.rest,sched:Object.keys(PLAN.sched).sort().map(d=>({d:d,p:PLAN.sched[d].slice()})),uni:Object.keys(PLAN.uni).map(id=>({id:id,v:PLAN.uni[id]?1:0})),pick:Object.keys(PLAN.pick).sort().map(d=>({d:d,x:PLAN.pick[d].slice()})),goals:Object.keys(PLAN.goals).map(k=>({k:k,n:PLAN.goals[k]})),hide:Object.keys(PLAN.hide).map(id=>({id:id,v:PLAN.hide[id]?1:0})),groups:PLAN.groups.map(g=>({p:g.slice()})),day:Object.keys(PLAN.day).sort().map(d=>({d:d,p:PLAN.day[d].slice()})),custom:PLAN.custom.map(c=>({id:c.id,p:c.p,n:c.n,bw:c.bw===2?2:(c.bw?1:0)}))});
const clone=o=>JSON.parse(JSON.stringify(o));

/* ---------- storage: private database when available, this browser otherwise ---------- */
const B={mode:"pending",root:null,assets:null,err:null,slow:false,gotPlan:false,gotSess:false};
const hubPing=()=>{if(window.AETHER)AETHER.changed("gym")};
const pend=new Map();
let running=false,busyKey=null;
const isDirty=k=>pend.has(k)||busyKey===k;

function queue(kind,key){pend.set(kind+":"+key,{kind:kind,key:key});setStatus();run()}
function localWrite(kind){
  let ok=true;
  if(kind==="plan")ok=LS.set(KEY.plan,JSON.stringify(planOut()));
  else if(kind==="sess")ok=LS.set(KEY.sess,JSON.stringify(SESS));
  else if(kind==="photo")ok=LS.set(KEY.photos,JSON.stringify(PHOTOS));
  if(!ok){const e=new Error("This browser's storage is full or blocked.");e.code="local_full";throw e}
}
async function persist(j){
  if(B.mode==="local")return localWrite(j.kind);
  const root=B.root;
  if(j.kind==="plan")return root.set(planOut());
  if(j.kind==="sess"){
    const s=SESS[j.key],ref=root.collection("sessions").doc(j.key);
    return s?ref.set(clone(s)):ref.delete();
  }
  if(j.kind==="photo"){
    const p=PHOTOS.find(x=>x.id===j.key),ref=root.collection("photos").doc(j.key);
    return p?ref.set({date:p.date,note:p.note,asset:p.asset,at:p.at}):ref.delete();
  }
}
async function run(){
  if(running||B.mode==="pending")return;
  running=true;
  while(pend.size){
    const ent=pend.entries().next().value,k=ent[0],job=ent[1];
    pend.delete(k);busyKey=k;
    try{await persist(job);B.err=null}
    catch(e){
      const code=e&&e.code;
      job.tries=(job.tries||0)+1;
      if((code==="unavailable"||code==="resource_exhausted")&&job.tries<4){
        if(!pend.has(k))pend.set(k,job);
        busyKey=null;setStatus();
        await sleep(1500+Math.random()*1500);
        continue;
      }
      B.err=code==="quota_exceeded"?"Storage is full.":((e&&e.message)||"Couldn't save.");
    }
    busyKey=null;setStatus();
  }
  running=false;setStatus();
}
function setStatus(){
  const c=$("chip");if(!c)return;
  let t,bad=false,tip="";
  if(B.mode==="pending")t="Connecting…";
  else if(B.err){t="Not saved";bad=true;tip=B.err}
  else if(B.mode==="local"){t="This device only";tip="Saved in this browser only."}
  else if(pend.size||running||busyKey)t="Saving…";
  else if(B.slow){t="Offline?";tip="Can't reach your saved data yet. What you see may be out of date."}
  else{t="Saved";tip="Saved to your account."}
  c.textContent=t;c.title=tip;c.className="chip"+(bad?" err":"");
}
const touch=(kind,key)=>{ver++;queue(kind,key)};

let pendingRender=false;
const typing=()=>{const a=document.activeElement;return !!(a&&a.closest&&a.closest("#g-sheet")&&/^(INPUT|TEXTAREA)$/.test(a.tagName))};
window.addEventListener("aether-photo",()=>{ver++;softRender()});
function softRender(){
  if(typing()){pendingRender=true;updateChrome();return}
  renderAll();
}

function loadLocal(){
  try{
    PLAN=cleanPlan(JSON.parse(LS.get(KEY.plan)||"null"));
    const raw=JSON.parse(LS.get(KEY.sess)||"{}")||{};
    SESS={};Object.keys(raw).forEach(d=>{const c=cleanSession(d,raw[d]);if(c)SESS[d]=c});
    const ph=JSON.parse(LS.get(KEY.photos)||"[]");
    PHOTOS=(Array.isArray(ph)?ph:[]).map(p=>p&&cleanPhoto(p.id,p)).filter(Boolean);sortPhotos();
  }catch(e){}
  unit=PLAN.unit;
}
function subscribe(db,uid){
  const root=db.doc("data/users/"+uid+"/gym");B.root=root;
  const timer=setTimeout(()=>{B.slow=true;setStatus()},10000);
  const live=snap=>{if(snap.metadata&&!snap.metadata.fromCache){clearTimeout(timer);if(B.slow){B.slow=false;setStatus()}}};
  const fail=e=>{clearTimeout(timer);B.gotPlan=B.gotSess=true;hubPing();B.err=(e&&e.code==="revoked")?"Access to your data was withdrawn.":"Couldn't load your saved data.";setStatus()};
  root.onSnapshot(snap=>{
    live(snap);
    if(!B.gotPlan){B.gotPlan=true;hubPing()}
    if(isDirty("plan:plan"))return;
    if(snap.exists){PLAN=cleanPlan(snap.data());unit=PLAN.unit;ver++;softRender()}
  },fail);
  root.collection("sessions").onSnapshot(snap=>{
    live(snap);
    if(!B.gotSess){B.gotSess=true;hubPing()}
    const next={};
    snap.docs.forEach(d=>{const c=cleanSession(d.id,d.data());if(c)next[d.id]=clone(c)});
    const keep=k=>{if(SESS[k])next[k]=SESS[k];else delete next[k]};
    Object.keys(SESS).forEach(k=>{if(isDirty("sess:"+k))keep(k)});
    pend.forEach(j=>{if(j.kind==="sess")keep(j.key)});
    if(busyKey&&busyKey.indexOf("sess:")===0)keep(busyKey.slice(5));
    SESS=next;ver++;softRender();
  },fail);
  root.collection("photos").onSnapshot(snap=>{
    live(snap);
    const next=[];
    snap.docs.forEach(d=>{const c=cleanPhoto(d.id,d.data());if(c)next.push(c)});
    PHOTOS.forEach(p=>{if(isDirty("photo:"+p.id)&&!next.some(x=>x.id===p.id))next.push(p)});
    PHOTOS=next.filter(p=>!(pend.has("photo:"+p.id)&&!PHOTOS.some(x=>x.id===p.id)));sortPhotos();
    ver++;softRender();
  },fail);
}
/* one-time: sessions copied over from the original Gym page arrive as text and are unpacked here unchanged */
async function importStaged(db,uid){
  try{
    const ref=db.doc("data/users/"+uid+"/gym-import"),snap=await ref.get();
    const ex=typeof snap.exists==="function"?snap.exists():snap.exists;
    if(!ex)return;
    const d=snap.data()||{};let raw={};try{raw=JSON.parse(d.sessions||"{}")||{}}catch(e){raw={}}
    for(const date of Object.keys(raw)){
      const c=cleanSession(date,raw[date]);if(!c)continue;
      const sref=db.doc("data/users/"+uid+"/gym/sessions/"+date),cur=await sref.get();
      const has=typeof cur.exists==="function"?cur.exists():cur.exists;
      if(!has)await sref.set(clone(c));
    }
    await ref.delete();
  }catch(e){}
}
async function connect(){
  let db=null,uid=null,assets=null;
  try{
    if(window.claude&&typeof window.claude.use==="function"){
      const r=await Promise.all([window.claude.use("db"),window.claude.use("user"),window.claude.use("assets")]);
      db=r[0];assets=r[2];
      uid=r[1]?await r[1].id():null;
    }
  }catch(e){db=null}
  if(db&&uid){
    B.mode="cloud";B.assets=assets;
    try{subscribe(db,uid)}catch(e){B.mode="local";loadLocal()}
    importStaged(db,uid);
  }else{
    B.mode="local";B.assets=null;loadLocal();
  }
  ver++;setStatus();renderAll();run();
}

/* ---------- derived numbers ---------- */
const setCount=s=>Object.keys(s.ex).reduce((n,id)=>n+s.ex[id].sets.length,0);
function idx(){if(!IDX||IDX.ver!==ver)IDX=buildIndex();return IDX}
function buildIndex(){
  const dates=Object.keys(SESS).filter(d=>setCount(SESS[d])>0).sort();
  const by={},pb={},best={},heavy={},byDate={},pbs=[],part={};
  PARTS.forEach(p=>{part[p.key]={last:null,sets30:0,sets:0,wk:0}});
  const cut=addDays(todayS(),-29),ws=wkStart(todayS());let tot30=0;
  dates.forEach(d=>{
    const s=SESS[d],bd=byDate[d]={sets:0,vol:0,parts:{}};
    Object.keys(s.ex).forEach(id=>{
      const e=s.ex[id];if(!e.sets.length)return;
      (by[id]=by[id]||[]).push({date:d,e:e});
      const bw=e.bw===2?2:(e.bw?1:0),pp=part[e.p]||(part[e.p]={last:null,sets30:0,sets:0,wk:0});
      const bp=bd.parts[e.p]||(bd.parts[e.p]={sets:0,vol:0,ex:[]});
      bp.ex.push(e);
      let ti=0;
      e.sets.forEach((st,i)=>{
        if(better(bw,st,e.sets[ti]))ti=i;
        const h=heavy[id];
        if(!h||st.w>h.set.w||(st.w===h.set.w&&st.r>h.set.r))heavy[id]={set:st,date:d};
        const sv=bw===2?0:setVol(st);bd.sets++;bd.vol+=sv;bp.sets++;bp.vol+=sv;pp.sets++;if(d>=ws)pp.wk++;
        if(d>=cut){pp.sets30++;tot30++}
      });
      const top=e.sets[ti],b=best[id];
      if(b&&better(bw,top,b.set)){pb[d+"|"+id+"|"+ti]=1;pbs.push({date:d,id:id,n:e.n,bw:bw,set:top})}
      if(!b||better(bw,top,b.set))best[id]={set:top,date:d};
      if(!pp.last||d>pp.last)pp.last=d;
    });
  });
  pbs.reverse();
  return {ver:ver,dates:dates,by:by,pb:pb,best:best,heavy:heavy,byDate:byDate,pbs:pbs,part:part,tot30:tot30};
}
const isHidden=id=>Object.prototype.hasOwnProperty.call(PLAN.hide,id)?!!PLAN.hide[id]:!!DEFAULT_HIDE[id];
function exList(partKey){
  return exListAll(partKey).filter(x=>!isHidden(x.id)||hasSetsOn(S.date,x.id));
}
function exListAll(partKey){
  const out=[],seen={};
  partOf(partKey).ex.forEach(x=>{const id=partKey+"-"+x[0];out.push({id:id,p:partKey,n:x[1],bw:x[2]?+x[2]:0,custom:false});seen[id]=1});
  PLAN.custom.forEach(c=>{if(c.p===partKey&&!seen[c.id]){out.push({id:c.id,p:partKey,n:c.n,bw:c.bw?+c.bw:0,custom:true});seen[c.id]=1}});
  const I=idx();
  Object.keys(I.by).forEach(id=>{
    if(seen[id])return;
    const e=I.by[id][I.by[id].length-1].e;
    if(e.p===partKey){out.push({id:id,p:partKey,n:e.n,bw:e.bw?+e.bw:0,custom:false});seen[id]=1}
  });
  return out;
}
function suggest(ex,date){
  const list=idx().by[ex.id]||[];
  const sv=s=>({w:s.w,r:s.r,L:s.L||null,R:s.R||null});
  const here=list.find(x=>x.date===date);
  if(here)return sv(here.e.sets[here.e.sets.length-1]);
  for(let i=list.length-1;i>=0;i--)if(list[i].date<date)return sv(list[i].e.sets[list[i].e.sets.length-1]);
  return {w:ex.bw===2?30:(ex.bw?0:20),r:10,L:null,R:null};
}
const DEFAULT_UNI={"back-dbrow":1};
const isUni=id=>Object.prototype.hasOwnProperty.call(PLAN.uni,id)?!!PLAN.uni[id]:!!DEFAULT_UNI[id];
/* ---------- coach: which regions of a muscle have been worked, and what to do next ---------- */
const RG=(k,l,m,t,d)=>({k:k,l:l,m:m,t:t,d:d});
const EX=(n,p,s,c,bw)=>({n:n,p:p,s:s,c:c||"",bw:bw?+bw:0});
const COACH={
  chest:{reg:[
    RG("mid","Mid chest","Chest",4,"The bulk of the pec, loaded hardest by flat pressing."),
    RG("up","Upper chest","Chest",3,"Upper fibres respond best to an incline angle or a low-to-high path."),
    RG("low","Lower chest","Chest",2,"Lower fibres, hit by a decline angle or a high-to-low path."),
    RG("inner","Inner chest","Chest",2,"Worked through the squeeze and cross-body path of flies and crossovers.")],
   ex:[EX("Barbell bench press",["mid"],["low"],"bench"),EX("Machine chest press",["mid"],[],"mpress"),EX("Push-ups",["mid"],["low"],"push",1),EX("Dumbbell bench press",["mid"],[]),
     EX("Incline dumbbell press",["up"],["mid"],"incdb"),EX("Incline barbell press",["up"],["mid"]),EX("Low-to-high cable fly",["up"],["inner"]),EX("Landmine press",["up"],[]),
     EX("Dips",["low"],["mid"],"dips",1),EX("Decline press",["low"],["mid"]),EX("High-to-low cable fly",["low"],["inner"]),
     EX("Cable fly",["inner"],["mid"],"cfly"),EX("Pec deck",["inner"],[]),EX("Cable crossover",["inner"],["low"]),
     EX("Plate-loaded chest press",["mid"],[],"wpchest"),EX("Total Access chest press",["mid"],[],"wtachest"),EX("Dual stack chest press (Animal)",["mid"],["up"],"wdschest"),EX("Dual stack incline press (Animal)",["up"],["mid"]),EX("Dual stack decline press (Animal)",["low"],["mid"]),
     EX("Pec fly (multi pec/delt)",["inner"],[],"wpec"),EX("Smith machine bench press",["mid"],["low"]),EX("Smith machine incline press",["up"],["mid"]),EX("Assisted dip",["low"],["mid"],"wasdip",2)]},
  back:{reg:[
    RG("lats","Lats (width)","Back",4,"Width comes from driving the elbows down and back, as in pulldowns and pull-ups."),
    RG("thick","Mid back (thickness)","Back",4,"Rhomboids and mid traps, trained by horizontal rows."),
    RG("low","Lower back","Back",2,"Spinal erectors, trained by hinging and back extensions.")],
   ex:[EX("Pull-ups",["lats"],[],"pull",1),EX("Lat pulldown",["lats"],[],"lat"),EX("Close-grip pulldown",["lats"],["thick"]),EX("Straight-arm pulldown",["lats"],[]),EX("Meadows row",["lats"],["thick"]),
     EX("One-arm dumbbell row",["thick"],["lats"],"dbrow"),EX("Barbell row",["thick"],["lats"],"row"),EX("Low pulley row",["thick"],["lats"],"crow"),EX("Chest-supported row",["thick"],[]),EX("Wide-grip cable row",["thick"],[]),
     EX("Deadlift",["low"],["thick"],"dead"),EX("Back extension",["low"],[]),EX("Reverse hyperextension",["low"],[]),
     EX("Dual stack front pulldown (Animal)",["lats"],[],"wdspull"),EX("Assisted chin-up",["lats"],[],"wassist",2),EX("Seated row (selectorised)",["thick"],["lats"],"wsrow"),EX("Single-arm cable row",["thick"],["lats"],"wcr1"),EX("Hyper extension",["low"],[],"wbackext")]},
  shoulders:{reg:[
    RG("side","Side delts","Shoulders",3,"Builds shoulder width and responds best to lateral raises."),
    RG("rear","Rear delts","Shoulders",3,"Rear delts and upper back, usually the most under-trained part of the shoulder."),
    RG("front","Front delts","Shoulders",2,"Already working hard in every press, so a little goes a long way."),
    RG("traps","Traps","Shoulders",2,"Upper traps, loaded by shrugs and heavy carries.")],
   ex:[EX("Lateral raise",["side"],[],"lat"),EX("Cable lateral raise",["side"],[],"wcl"),EX("Upright row",["side"],["traps"]),
     EX("Rear delt fly",["rear"],[],"rear"),EX("Face pull",["rear"],["traps"],"face"),EX("Reverse pec deck",["rear"],[]),
     EX("Overhead press",["front"],["side"],"ohp"),EX("Dumbbell shoulder press",["front"],["side"],"dbp"),EX("Arnold press",["front"],["side"]),
     EX("Shrugs",["traps"],[],"shrug"),
     EX("Plate-loaded shoulder press",["front"],["side"],"wpsp"),EX("Rear delt machine (multi pec/delt)",["rear"],[],"wrdelt"),EX("Cable rear delt fly",["rear"],[],"wcrd"),EX("Smith machine shoulder press",["front"],["side"])]},
  arms:{reg:[
    RG("bi_short","Biceps · short head","Biceps",3,"The inner head, favoured by arms in front of the body and wider grips."),
    RG("bi_long","Biceps · long head","Biceps",3,"The outer head that adds peak, best loaded with the arm behind the body (incline, drag, bayesian)."),
    RG("brach","Brachialis","Biceps",2,"Sits under the biceps and adds arm thickness. Hammer and reverse grips."),
    RG("tri_long","Triceps · long head","Triceps",3,"The largest head, on the inner and back of the arm, loaded best with the arm overhead."),
    RG("tri_lat","Triceps · lateral head","Triceps",3,"The outer head, taking most of the work in pushdowns and pressing."),
    RG("tri_med","Triceps · medial head","Triceps",2,"The deep head, stressed by close-grip and reverse-grip work.")],
   ex:[EX("Barbell curl",["bi_short"],["bi_long"],"bcurl"),EX("Preacher curl",["bi_short"],[]),EX("Spider curl",["bi_short"],[]),
     EX("Incline dumbbell curl",["bi_long"],[],"icurl"),EX("Bayesian cable curl",["bi_long"],[]),EX("Drag curl",["bi_long"],[]),
     EX("Hammer curl",["brach"],["bi_long"],"hcurl"),EX("Cross-body hammer curl",["brach"],[]),EX("Reverse curl",["brach"],[]),
     EX("Overhead triceps extension",["tri_long"],[],"ohext"),EX("Cable overhead triceps extension",["tri_long"],[]),EX("Skull crushers",["tri_long"],["tri_med"],"skull"),
     EX("Triceps pushdown",["tri_lat"],["tri_med"],"pushdn"),EX("Triceps kickback",["tri_lat"],[]),EX("Close-grip bench press",["tri_lat"],["tri_med"]),
     EX("Reverse-grip pushdown",["tri_med"],[]),EX("Diamond push-ups",["tri_med"],["tri_lat"],"",1),
     EX("Biceps curl machine",["bi_short"],[],"wbc"),EX("Triceps extension machine",["tri_lat"],["tri_med"],"wtx"),EX("Cable curl",["bi_short"],[],"wcc")]},
  legs:{reg:[
    RG("quads","Quads","Quads",4,"The front of the thigh: squats, presses and extensions."),
    RG("hams","Hamstrings","Hamstrings",3,"The back of the thigh: hip hinges and leg curls."),
    RG("glutes","Glutes","Glutes",3,"Deep hip-extension work like thrusts, split squats and hinges."),
    RG("calves","Calves","Calves",3,"Respond to full range and a pause at the stretch.")],
   ex:[EX("Back squat",["quads","glutes"],["hams"],"squat"),EX("Leg press",["quads"],["glutes"],"lpress"),EX("Hack squat",["quads"],["glutes"]),EX("Leg extension",["quads"],[],"lext"),EX("Walking lunges",["quads"],["glutes"],"lunge"),
     EX("Lying leg curl",["hams"],[],"lcurl"),EX("Seated leg curl",["hams"],[]),EX("Romanian deadlift",["hams","glutes"],[],"rdl"),EX("Nordic curl",["hams"],[],"",1),
     EX("Hip thrust",["glutes"],["hams"]),EX("Bulgarian split squat",["glutes"],["quads"]),EX("Cable pull-through",["glutes"],["hams"]),
     EX("Calf raise",["calves"],[],"calf"),EX("Seated calf raise",["calves"],[]),
     EX("Hack squat (Animal plate)",["quads"],["glutes"],"whack"),EX("Leverage squat (plate)",["quads","glutes"],["hams"],"wlev"),EX("Hip abductor",["glutes"],[],"wabd"),EX("Hip adductor",[],[],"wadd"),EX("Smith machine squat",["quads","glutes"],["hams"]),EX("Cable glute kickback",["glutes"],[],"wcgk")]},
  core:{reg:[
    RG("abs_up","Upper abs","Abs",3,"Spinal flexion work such as crunches and cable crunches."),
    RG("abs_low","Lower abs","Abs",3,"Posterior pelvic tilt work: leg raises and reverse crunches."),
    RG("obl","Obliques","Obliques",2,"Rotation and anti-rotation: twists, woodchops and Pallof presses.")],
   ex:[EX("Cable crunch",["abs_up"],[],"cable"),EX("Crunches",["abs_up"],[],"crunch",1),EX("Decline sit-up",["abs_up"],[],"decl",1),EX("Ab wheel rollout",["abs_up"],["abs_low"],"wheel",1),
     EX("Hanging leg raise",["abs_low"],[],"hang",1),EX("Reverse crunch",["abs_low"],[],"",1),EX("Toes-to-bar",["abs_low"],[],"",1),
     EX("Russian twist",["obl"],[],"twist"),EX("Cable woodchop",["obl"],[],"wcw"),EX("Pallof press",["obl"],[])]}
};
const slug=n=>n.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,40);
const POOL={};
Object.keys(COACH).forEach(pk=>{COACH[pk].ex.forEach((e,i)=>{const id=e.c?pk+"-"+e.c:"r-"+pk+"-"+slug(e.n);e.id=id;POOL[id]={id:id,part:pk,e:e,i:i}})});
const fmtN=n=>Number.isInteger(n)?String(n):n.toFixed(1);

function coachPlan(pk,d){
  const co=COACH[pk],sd=SESS[d];
  let today=0;
  if(sd)Object.keys(sd.ex).forEach(id=>{if(sd.ex[id].p===pk)today+=sd.ex[id].sets.length});
  const session=today>0,mult=session?1:2,days=[];
  if(session)days.push(d);else for(let i=0;i<14;i++)days.push(addDays(d,-i));
  const cov={};co.reg.forEach(r=>{cov[r.k]=0});
  let any=0;
  days.forEach(day=>{
    const ss=SESS[day];if(!ss)return;
    Object.keys(ss.ex).forEach(id=>{
      const e=ss.ex[id];if(e.p!==pk)return;
      const n=e.sets.length;any+=n;
      const pi=POOL[id];if(!pi||pi.part!==pk)return;
      pi.e.p.forEach(k=>{if(k in cov)cov[k]+=n});
      pi.e.s.forEach(k=>{if(k in cov)cov[k]+=n*0.5});
    });
  });
  const regs=co.reg.map((r,i)=>{
    const T=r.t*mult,need=Math.max(1.5,T*0.66),c=cov[r.k];
    return {r:r,i:i,T:T,need:need,cov:c,done:c>=need,rel:Math.max(0.01,(T-c)/T)};
  });
  const touched={};regs.forEach(x=>{if(x.cov>0)touched[x.r.m]=1});
  const cmp=(a,b)=>b.rel-a.rel||b.T-a.T||a.i-b.i;
  const cand=regs.filter(x=>!x.done).sort(cmp);
  const doneToday={};if(sd)Object.keys(sd.ex).forEach(id=>{doneToday[id]=1});
  const used={};
  const best=x=>{
    let pick=null,bs=1e9;
    co.ex.forEach((e,i)=>{
      if(e.p.indexOf(x.r.k)<0||used[e.id]||isHidden(e.id))return;
      let sc=i*0.001+(e.c?0:0.4)+(doneToday[e.id]?3:0);
      e.p.forEach(k=>{if(k===x.r.k)return;const o=regs.find(y=>y.r.k===k);if(o)sc+=Math.min(1,o.cov/o.need)});
      if(sc<bs){bs=sc;pick={id:e.id,e:e,x:x,alt:false}}
    });
    if(pick)used[pick.id]=1;
    return pick;
  };
  const picks=[];
  if(cand.length){
    let A=[],B=cand;
    if(session){A=cand.filter(x=>touched[x.r.m]);B=cand.filter(x=>!touched[x.r.m])}
    const first=A.length?A[0]:B[0];
    const p1=best(first);if(p1)picks.push(p1);
    const other=()=>{const rest=B.filter(x=>x!==first);const o=rest.find(x=>x.r.m!==first.r.m)||rest[0];return o?best(o):null};
    let p2=null;
    if(A.length>=2)p2=best(A[1]);
    else if(A.length===1){p2=best(A[0]);if(p2)p2.alt=true;else p2=other()}
    else p2=other();
    if(p2)picks.push(p2);
  }
  const part=partOf(pk).label.toLowerCase();
  const hit=regs.filter(x=>x.done).map(x=>x.r.l),todo=cand.map(x=>x.r.l);
  let summary;
  if(!cand.length)summary="Every region of "+part+" is covered "+(session?"today":"over the last two weeks")+". Nicely rounded.";
  else if(session)summary=(hit.length?"Hit so far: "+hit.join(", ")+". ":"")+"Still to hit: "+todo.slice(0,4).join(", ")+(todo.length>4?" and "+(todo.length-4)+" more":"")+".";
  else summary=any?"Nothing logged for "+part+" yet today. These regions have had the least work over the last two weeks.":"No "+part+" logged in the last two weeks. Here's a balanced way to start.";
  return {session:session,regs:regs,picks:picks,summary:summary};
}
const pickIds=d=>PLAN.pick[d]||[];
const hasSetsOn=(d,id)=>{const s=SESS[d],e=s&&s.ex[id];return !!(e&&e.sets.length)};
const pickKeyOf=(pk,d)=>d+"|"+pk;
function sessionEx(P,d){
  const sel=pickIds(d);
  return exList(P.key).filter(x=>sel.indexOf(x.id)>=0||hasSetsOn(d,x.id));
}
const isPicking=(P,d)=>S.pickKey===pickKeyOf(P.key,d)||sessionEx(P,d).length===0;
function setPicks(d,ids,on){
  const cur=(PLAN.pick[d]||[]).slice();
  ids.forEach(id=>{const i=cur.indexOf(id);if(on&&i<0)cur.push(id);if(!on&&i>=0)cur.splice(i,1)});
  if(cur.length)PLAN.pick[d]=cur.slice(0,120);else delete PLAN.pick[d];
  touch("plan","plan");
}
function prevDayFor(pk,d,I){
  for(let i=I.dates.length-1;i>=0;i--){const x=I.dates[i];if(x<d&&I.byDate[x].parts[pk])return x}
  return null;
}
function regionOf(id){
  const pi=POOL[id];if(!pi)return "";
  const reg=COACH[pi.part].reg;
  return pi.e.p.map(k=>{const r=reg.find(x=>x.k===k);return r?r.l:""}).filter(Boolean).join(" / ");
}
function coachCard(P,d,I){
  const R=coachPlan(P.key,d),open=S.coachOpen,picking=isPicking(P,d);
  let h='<div class="coach'+(picking?" cmp":"")+'"><div class="ch"><span class="eyebrow">Coach</span><span>'+(open?'<button type="button" class="lnk" data-cov aria-expanded="'+S.covOpen+'">Coverage</button>':'')+
    '<button type="button" class="lnk" data-coachtoggle aria-expanded="'+open+'">'+(open?"Hide":"Show")+'</button></span></div>'+
    '<p class="cs">'+esc(R.summary)+'</p>';
  if(!open)return h+'</div>';
  const picked=id=>pickIds(d).indexOf(id)>=0||hasSetsOn(d,id);
  R.picks.forEach(pk=>{
    const x=pk.x,list=(I.by[pk.id]||[]).filter(z=>z.date!==d),le=list.length?list[list.length-1]:null;
    const last=le?"Last: "+fset(le.e.sets[le.e.sets.length-1],!!pk.e.bw)+" · "+dShort(le.date):"Not logged before";
    const aim=Math.max(2,Math.min(3,Math.round(x.need-x.cov)));
    h+='<div class="rec"><div class="rt"><b>'+esc(pk.e.n)+'</b>'+(pk.alt?'<span class="alt">Alternative</span>':"")+'</div>'+
      '<div class="tg">'+esc(x.r.l)+' · '+fmtN(x.cov)+' of '+x.T+' sets '+(R.session?"today":"in 2 weeks")+'</div>'+
      (pk.alt?'':'<p class="rs">'+esc(x.r.d)+'</p>')+
      '<div class="rf"><span class="rl">Aim for '+aim+' sets<br>'+esc(last)+'</span>'+(picking&&picked(pk.id)?'<button type="button" class="btn" disabled>Added</button>':'<button type="button" class="btn primary" data-rec="'+pk.id+'" aria-label="'+(picking?"Add to session: ":(picked(pk.id)?"Log ":"Add and log "))+esc(pk.e.n)+'">'+(picking?"+ Add":(picked(pk.id)?"Log it":"Add &amp; log"))+'</button>')+'</div></div>';
  });
  if(S.covOpen){
    h+='<div class="covg">'+R.regs.map(x=>'<div><span><span>'+esc(x.r.l)+'</span><b>'+fmtN(x.cov)+'/'+x.T+'</b></span><i><u style="width:'+Math.min(100,Math.round(x.cov/x.T*100))+'%"></u></i></div>').join("")+'</div>';
  }
  return h+'</div>';
}
const goalOf=k=>PLAN.goals[k]||PLAN.goal;
function groupOf(k){const g=PLAN.groups.find(x=>x.indexOf(k)>=0);return g?g.slice():[k]}
function dayParts(d,k){
  const out=groupOf(k),ex=PLAN.day[d];
  if(ex&&ex.indexOf(k)>=0)ex.forEach(x=>{if(out.indexOf(x)<0)out.push(x)});
  return PARTS.map(p=>p.key).filter(x=>out.indexOf(x)>=0);
}
const namesOf=ks=>ks.map(k=>partOf(k).label).join(" + ");
function nextUp(){
  const I=idx();let pick=PARTS[0].key,bestAge=-1;
  PARTS.forEach(p=>{
    const l=I.part[p.key].last,age=l?diff(todayS(),l):100000;
    if(age>bestAge){bestAge=age;pick=p.key}
  });
  return {key:pick,last:I.part[pick].last};
}

/* ---------- edits ---------- */
function addSet(ex,date,w,r,L,R){
  const s=SESS[date]||(SESS[date]={date:date,ex:{}});
  const e=s.ex[ex.id]||(s.ex[ex.id]={n:ex.n,p:ex.p,bw:ex.bw===2?2:(ex.bw?1:0),sets:[]});
  const st={w:w,r:r,t:Date.now()};
  if(L&&R){st.L=L;st.R=R}
  e.sets.push(st);
  touch("sess",date);
}
function delSet(date,id,i){
  const s=SESS[date];if(!s||!s.ex[id])return;
  s.ex[id].sets.splice(i,1);
  if(!s.ex[id].sets.length)delete s.ex[id];
  if(!Object.keys(s.ex).length)delete SESS[date];
  touch("sess",date);
}

const planOf=d=>PLAN.sched[d]||[];
function setPlan(d,keys,quiet){
  if(keys.length)PLAN.sched[d]=keys.slice();else delete PLAN.sched[d];
  if(!quiet)touch("plan","plan");
}
function editSetSides(date,id,i,L,R){
  const s=SESS[date],e=s&&s.ex[id];if(!e||!e.sets[i])return false;
  const wk=weakSide(e.bw===2?2:(e.bw?1:0),L,R);
  e.sets[i]={w:wk.w,r:wk.r,L:L,R:R,t:e.sets[i].t||Date.now()};
  touch("sess",date);return true;
}
function editSet(date,id,i,w,r){
  const s=SESS[date],e=s&&s.ex[id];if(!e||!e.sets[i])return false;
  e.sets[i]={w:w,r:r,t:e.sets[i].t||Date.now()};
  touch("sess",date);return true;
}

/* ---------- rest timer ---------- */
const REST={end:0,total:0,over:0,iv:null};
const mmss=n=>Math.floor(n/60)+":"+pad(n%60);
function hideRest(){REST.end=0;REST.over=0;if(REST.iv){clearInterval(REST.iv);REST.iv=null}$("rest").hidden=true;ROOT.classList.remove("resting")}
function tickRest(){
  if(!REST.end)return;
  const left=Math.ceil((REST.end-Date.now())/1000),el=$("rest");
  if(left<=0){
    if(!REST.over){REST.over=Date.now();try{if(navigator.vibrate)navigator.vibrate(200)}catch(e){}}
    $("restLab").textContent="Rest over";$("restTime").textContent="Go";el.style.setProperty("--rp","100");
    if(Date.now()-REST.over>6000)hideRest();
    return;
  }
  $("restLab").textContent="Rest";$("restTime").textContent=mmss(left);
  el.style.setProperty("--rp",Math.max(0,Math.min(100,(1-left/REST.total)*100)).toFixed(1));
}
function startRest(sec){
  if(!sec)return;
  REST.total=sec;REST.end=Date.now()+sec*1000;REST.over=0;
  $("rest").hidden=false;ROOT.classList.add("resting");
  if(!REST.iv)REST.iv=setInterval(tickRest,250);
  tickRest();
}
$("restAdd").addEventListener("click",()=>{if(!REST.end)return;if(REST.over){startRest(30)}else{REST.end+=30000;REST.total+=30;tickRest()}});
$("restSkip").addEventListener("click",hideRest);

/* ---------- wheel ---------- */
const ORBS=PARTS.map(p=>({key:p.key,label:p.label,val:()=>idx().part[p.key].wk+" of "+goalOf(p.key)+" sets"}));
const stage=$("stage"),orbEls=[];
ORBS.forEach(o=>{
  const b=document.createElement("button");b.type="button";b.className="orb";b.setAttribute("data-key",o.key);
  b.innerHTML='<span class="floor"></span><span class="sphere"><span class="txt"><span class="lab">'+o.label+'</span><span class="val"></span></span></span>';
  stage.appendChild(b);orbEls.push(b);o.el=b;o.valEl=b.querySelector(".val");
});

const NAVS=[
  ["home","Overview",'<path d="M3 10.5 12 3l9 7.5M5.5 9.5V21h13V9.5M9 21v-7h6v7"/>'],
  ["train","Train",'<path d="M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11"/>'],
  ["cal","Calendar",'<path d="M4 5h16v15H4zM8 3v4M16 3v4M4 10h16M8 14h3M8 17h7"/>'],
  ["photos","Photos",'<path d="M4 8h3l1.6-2.5h6.8L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.4"/>'],
  ["settings","Settings",'<circle cx="12" cy="12" r="3.2"/><path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M18.4 5.6l-1.8 1.8M7.4 16.6l-1.8 1.8"/>']
];
$("tabs").innerHTML=NAVS.map(d=>'<button type="button" class="tab" data-nav="'+d[0]+'"><svg class="ico" viewBox="0 0 24 24" aria-hidden="true">'+d[2]+'</svg>'+d[1]+'</button>').join("");

const N=ORBS.length,STEP=360/N;
let angle=0,dims={rx:120,ry:130,orb:92},anim=null,drag=null,suppress=false,front=null,booting=true;
const wrap360=a=>((a%360)+360)%360;
const shortest=(from,to)=>((to-from+540)%360)-180;
const reduce=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const angleFor=i=>wrap360(180-i*STEP);

function layout(){
  const w=stage.clientWidth||330;
  const orb=Math.max(86,Math.min(112,Math.round(w*0.25)));
  const ry=Math.round(orb*1.38),rx=Math.round(Math.min(w*0.36,200));
  dims={rx:rx,ry:ry,orb:orb};
  stage.style.height=(2*ry+orb+60)+"px";
  stage.style.setProperty("--orb",orb+"px");
  stage.style.setProperty("--hub",Math.round(orb*1.3)+"px");
  const ring=$("ring");ring.style.width=(rx*2)+"px";ring.style.height=(ry*2)+"px";
  position();
}
function position(){
  const rx=dims.rx,ry=dims.ry;
  for(let i=0;i<N;i++){
    const a=(i*STEP+angle)*Math.PI/180;
    const x=Math.sin(a)*rx,y=-Math.cos(a)*ry,d=(1-Math.cos(a))/2;
    const s=0.72+0.28*d,el=orbEls[i];
    el.style.transform="translate(-50%,-50%) translate("+x.toFixed(1)+"px,"+y.toFixed(1)+"px) scale("+s.toFixed(3)+")";
    el.style.opacity=(0.7+0.3*d).toFixed(2);
    el.style.zIndex=String(2+Math.round(d*10));
  }
}
function frontIndex(){
  let best=0,bd=999;
  for(let i=0;i<N;i++){const d=Math.abs(shortest(wrap360(i*STEP+angle),180));if(d<bd){bd=d;best=i}}
  return best;
}
function checkFront(){
  const i=frontIndex();
  if(i===front)return;
  front=i;
  for(let k=0;k<N;k++)orbEls[k].setAttribute("aria-current",k===i?"true":"false");
  S.part=ORBS[i].key;
  if(!booting){S.page="train";S.open=null;S.ed=null;S.addEx=false;S.sel=null;S.histN=12;S.msg="";S.exportText=null}
  renderAll();
}
function cancelAnim(){if(anim){cancelAnimationFrame(anim);anim=null}}
function animateTo(target){
  cancelAnim();
  const from=angle,to=from+shortest(wrap360(from),wrap360(target));
  {angle=wrap360(to);position();checkFront();return}
  const dur=Math.max(260,Math.min(620,Math.abs(to-from)*4.6)),t0=performance.now();
  (function step(now){
    const t=Math.min(1,(now-t0)/dur),e=1-Math.pow(1-t,3);
    angle=wrap360(from+(to-from)*e);position();checkFront();
    if(t<1)anim=requestAnimationFrame(step);else{anim=null;angle=wrap360(to);position()}
  })(t0);
}
function lock(i){animateTo(angleFor(i))}
function syncWheel(key){
  const i=ORBS.findIndex(o=>o.key===key);if(i<0)return;
  cancelAnim();angle=angleFor(i);position();front=i;
  for(let k=0;k<N;k++)orbEls[k].setAttribute("aria-current",k===i?"true":"false");
  S.part=key;
}
function snap(){lock(frontIndex())}
function focusSheet(){
  const sh=$("sheet"),r=sh.getBoundingClientRect();
  if(r.top>window.innerHeight*0.55||r.top<-20)sh.scrollIntoView({behavior:reduce?"auto":"smooth",block:"start"});
}
function pick(i){if(i===front){S.page="train";S.msg="";renderAll();focusSheet()}else lock(i)}
function pickPart(key){
  const i=ORBS.findIndex(o=>o.key===key);
  if(front===i){S.page="train";renderAll();focusSheet()}else{lock(i);setTimeout(focusSheet,60)}
}

stage.addEventListener("pointerdown",e=>{
  return;
  cancelAnim();drag={x:e.clientX,y:e.clientY,a:angle,active:false,id:e.pointerId};
});
stage.addEventListener("pointermove",e=>{
  if(!drag)return;
  const dx=e.clientX-drag.x,dy=e.clientY-drag.y;
  if(!drag.active&&Math.abs(dx)>7&&Math.abs(dx)>Math.abs(dy)*1.1){
    drag.active=true;try{stage.setPointerCapture(drag.id)}catch(_){}
  }
  if(drag.active){angle=wrap360(drag.a+dx*0.45);position();checkFront()}
});
function endDrag(){
  if(!drag)return;
  const was=drag.active;drag=null;
  if(was){suppress=true;setTimeout(()=>{suppress=false},0);snap()}
}
stage.addEventListener("pointerup",endDrag);
stage.addEventListener("pointercancel",endDrag);
stage.addEventListener("wheel",e=>{
  return;
  e.preventDefault();cancelAnim();
  angle=wrap360(angle+Math.max(-80,Math.min(80,e.deltaX))*0.2);position();checkFront();
  clearTimeout(stage._t);stage._t=setTimeout(snap,160);
},{passive:false});
stage.addEventListener("keydown",e=>{
  if(e.key==="ArrowRight"){e.preventDefault();lock((frontIndex()+1)%N)}
  if(e.key==="ArrowLeft"){e.preventDefault();lock((frontIndex()+N-1)%N)}
});
orbEls.forEach((el,i)=>{el.addEventListener("click",()=>{if(suppress)return;pick(i)})});
$("prev").addEventListener("click",()=>lock((frontIndex()+N-1)%N));
$("next").addEventListener("click",()=>lock((frontIndex()+1)%N));
$("hub").addEventListener("click",()=>{S.page="home";renderAll();focusSheet()});
window.addEventListener("resize",layout);

function onNav(e){
  const b=e.target.closest("[data-nav]");if(!b)return;
  S.page=b.getAttribute("data-nav");S.msg="";S.ed=null;S.exportText=null;S.copied=false;
  renderAll();focusSheet();
}
$("tabs").addEventListener("click",onNav);

/* ---------- charts ---------- */
function niceStep(raw){
  const mag=Math.pow(10,Math.floor(Math.log(raw)/Math.LN10)),m=[1,2,2.5,5,10];
  for(let i=0;i<m.length;i++)if(m[i]*mag>=raw)return m[i]*mag;
  return 10*mag;
}
function trendChart(points,label){
  const W=320,H=190,L=40,R=18,T=24,Bt=28,n=points.length;
  const vals=points.map(p=>p.v),mn=Math.min.apply(null,vals),mx=Math.max.apply(null,vals);
  const span=Math.max(mx-mn,mx*0.12,1),step=niceStep(span*1.3/4);
  const lo=Math.max(0,Math.floor((mn-span*0.15)/step)*step);
  let hi=Math.ceil((mx+span*0.15)/step)*step;if(hi<=lo)hi=lo+step*4;
  const x=i=>n===1?L+(W-L-R)/2:L+(W-L-R)*i/(n-1),y=v=>T+(H-T-Bt)*(1-(v-lo)/(hi-lo));
  let g="";
  for(let v=lo;v<=hi+step/1000;v+=step){
    g+='<path class="g" d="M'+L+' '+y(v).toFixed(1)+'H'+(W-R)+'"/><text class="t" x="'+(L-6)+'" y="'+(y(v)+3).toFixed(1)+'" text-anchor="end">'+nf(v,step<1?1:0)+'</text>';
  }
  let line="",i;
  for(i=0;i<n;i++)line+=(i?"L":"M")+x(i).toFixed(1)+" "+y(vals[i]).toFixed(1);
  const area=n>1?line+"L"+x(n-1).toFixed(1)+" "+y(lo).toFixed(1)+"L"+x(0).toFixed(1)+" "+y(lo).toFixed(1)+"Z":"";
  let dots="";
  if(n<=30)for(i=0;i<n-1;i++)dots+='<circle class="p" cx="'+x(i).toFixed(1)+'" cy="'+y(vals[i]).toFixed(1)+'" r="3.5"/>';
  const ex=x(n-1),ey=y(vals[n-1]);
  const xl='<text class="t" x="'+x(0).toFixed(1)+'" y="'+(H-8)+'" text-anchor="'+(n===1?"middle":"start")+'">'+dShort(points[0].date)+'</text>'+
    (n>1?'<text class="t" x="'+x(n-1).toFixed(1)+'" y="'+(H-8)+'" text-anchor="end">'+dShort(points[n-1].date)+'</text>':"");
  return '<svg class="chart" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="'+esc(label)+'">'+g+(area?'<path class="a" d="'+area+'"/>':"")+(n>1?'<path class="l" d="'+line+'"/>':"")+dots+xl+
    '<circle class="d" cx="'+ex.toFixed(1)+'" cy="'+ey.toFixed(1)+'" r="5"/><text class="e" x="'+Math.min(ex+4,W-4).toFixed(1)+'" y="'+(ey-10).toFixed(1)+'" text-anchor="end">'+nf(vals[n-1],1)+'</text></svg>';
}

/* ---------- views ---------- */
const stat=(l,v,c,sm)=>'<div class="stat'+(c?" "+c:"")+'"><span>'+l+'</span><strong>'+v+'</strong>'+(sm?'<small>'+sm+'</small>':"")+'</div>';
const head=(eyebrow,title,cls)=>{const nv=NAVS.find(n=>n[0]===S.page)||NAVS[1];return '<div class="sheet-head"><i class="tile"><svg viewBox="0 0 24 24" aria-hidden="true">'+nv[2]+'</svg></i><div><div class="eyebrow">'+eyebrow+'</div><h2'+(cls?' class="'+cls+'"':'')+'>'+title+'</h2></div></div>'};
const seg=(group,tabs,cur)=>'<div class="seg" role="tablist">'+tabs.map(t=>'<button type="button" role="tab" data-group="'+group+'" data-tab="'+t[0]+'" aria-selected="'+(cur===t[0])+'">'+t[1]+'</button>').join("")+'</div>';
const CHEV='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';

function homeTop(I,nx,np){
  const t=todayS(),tp=planOf(t),done=k=>!!(I.byDate[t]&&I.byDate[t].parts[k]),todo=tp.filter(k=>!done(k));
  let h;
  if(tp.length){
    const names=tp.map(k=>partOf(k).label).join(" + ");
    if(todo.length){
      const f=partOf(todo[0]);
      h='<div class="hero"><span>Planned today</span><strong>'+names+'</strong><small>'+(todo.length===tp.length?"Not started yet.":"Still to do: "+todo.map(k=>partOf(k).label).join(", ")+".")+'</small></div>'+
        '<button type="button" class="btn primary" data-go="'+f.key+'" style="width:100%;margin:-4px 0 18px">Train '+f.label.toLowerCase()+'</button>';
    }else h='<div class="hero"><span>Planned today</span><strong>'+names+'</strong><small>All done. Nice work.</small></div>';
  }else{
    const gp=groupOf(nx.key);
    h='<div class="hero"><span>Next up</span><strong>'+namesOf(gp)+'</strong><small>'+(nx.last?(gp.length>1?np.label+" last trained ":"Last trained ")+agoLong(nx.last)+".":"You haven't trained "+(gp.length>1?np.label.toLowerCase()+" ":"this ")+"yet.")+'</small></div>'+
      '<button type="button" class="btn primary" data-go="'+nx.key+'" style="width:100%;margin:-4px 0 18px">Train '+np.label.toLowerCase()+'</button>';
  }
  const ahead=Object.keys(PLAN.sched).filter(d=>d>t).sort().slice(0,5);
  h+='<div class="eyebrow" style="margin:0 0 10px">Coming up</div>';
  if(ahead.length){
    h+='<div class="rows" style="margin-bottom:18px">'+ahead.map(d=>{
      const ks=PLAN.sched[d];
      return '<button type="button" class="line" data-planday="'+d+'"><div class="h"><span>'+dShort(d)+'</span><b>'+ks.length+(ks.length===1?" body part":" body parts")+'</b></div><div class="s">'+ks.map(k=>partOf(k).label).join(", ")+'</div></button>';
    }).join("")+'</div>';
  }else{
    h+='<p class="note" style="margin:0 0 12px">Nothing planned yet.</p><button type="button" class="btn" data-planday="'+t+'" style="width:100%;margin-bottom:18px">Plan the days ahead</button>';
  }
  return h;
}
function goalsBlock(I){
  const all=PARTS.every(x=>goalOf(x.key)===goalOf(PARTS[0].key)),cur=goalOf(PARTS[0].key);
  return '<div class="goals">'+PARTS.map(p=>{
    const g=goalOf(p.key),w=I.part[p.key].wk,lc=p.label.toLowerCase();
    return '<div class="grow"><span class="gl"><b>'+p.label+'</b><small>'+w+' of '+g+' sets this week</small></span><div class="step"><button type="button" data-goalp="'+p.key+'|-1" aria-label="Lower '+lc+' goal">−</button>'+
      '<input type="number" data-goalin="'+p.key+'" inputmode="numeric" step="1" min="1" max="40" value="'+g+'" aria-label="Weekly sets goal for '+lc+'"><button type="button" data-goalp="'+p.key+'|1" aria-label="Raise '+lc+' goal">+</button></div></div>';
  }).join("")+'<div class="chips gall" role="group" aria-label="Set every body part to"><span>Set all to</span>'+[8,10,12,15,20].map(n=>'<button type="button" data-goalall="'+n+'" aria-pressed="'+(all&&cur===n)+'">'+n+'</button>').join("")+'</div></div>';
}
function groupsBlock(){
  const gs=PLAN.groups.filter(g=>g.length),rows=gs.concat(gs.length<6?[[]]:[]);
  return '<div class="control"><div class="h"><label>Training days</label></div><p class="note" style="margin:-6px 0 12px">Body parts you train in the same session. They share one day in Train and stay separate orbs on the wheel.</p>'+
    rows.map((g,i)=>'<div class="tday"><div class="th">'+(g.length?"Day "+(i+1):"Another day")+'</div><div class="chips" role="group" aria-label="'+(g.length?"Body parts in day "+(i+1):"Start another training day")+'">'+
      PARTS.map(p=>'<button type="button" data-grp="'+i+'|'+p.key+'" aria-pressed="'+(g.indexOf(p.key)>=0)+'">'+p.label+'</button>').join("")+'</div></div>').join("")+'</div>';
}
function welcome(){
  if(Object.keys(SESS).length||LS.get("aether-gym-welcome")==="1")return "";
  const st=[["Pick a body part","Tap Chest, Back, Legs and so on. The number shows sets done this week against your weekly goal."],
    ["Choose your exercises","Tap + on each exercise you plan to do, then press Start session."],
    ["Log each set","Enter the weight and reps. A rest timer starts on its own between sets."],
    ["Plan ahead","Use Calendar to set which body parts you train on which days."]];
  return '<section class="welcome"><div class="wh"><b>Getting started</b><button type="button" class="wx" data-welcome="hide" aria-label="Hide the getting started guide">Got it</button></div><ol>'+
    st.map((x,i)=>'<li><span class="n">'+(i+1)+'</span><span><b>'+x[0]+'</b><small>'+x[1]+'</small></span></li>').join("")+'</ol></section>';
}
function viewHome(){
  const I=idx(),nx=nextUp(),np=partOf(nx.key);
  const rows=PARTS.map(p=>{
    const st=I.part[p.key],share=I.tot30?st.sets30/I.tot30*100:0;
    return '<div class="line"><div class="h"><span>'+p.label+'</span><b>'+st.sets30+' sets<em>'+share.toFixed(0)+'%</em></b></div>'+
      '<div class="bar2"><i style="width:'+share.toFixed(1)+'%"></i></div><div class="s">Last trained '+agoLong(st.last)+'</div></div>';
  }).join("");
  const recent=I.pbs.slice(0,5).map(e=>'<div class="line"><div class="h"><span>'+esc(e.n)+'<div class="s">'+dShort(e.date)+'</div></span><b>'+fset(e.set,e.bw)+'</b></div></div>').join("");
  return head("Training overview","Last 30 days")+welcome()+homeTop(I,nx,np)+
    '<div class="rows">'+rows+'</div>'+
    '<div class="eyebrow" style="margin:20px 0 10px">Weekly set goals</div>'+goalsBlock(I)+
    '<div class="eyebrow" style="margin:20px 0 10px">Recent personal bests</div>'+
    (recent?'<div class="rows">'+recent+'</div>':'<p class="note" style="margin-top:0">No personal bests yet. Beat the top set of an earlier session and it shows up here.</p>')+
    '<p class="foot">Share is each body part\'s portion of your sets over the last 30 days. Volume is weight × reps.</p>';
}

function dayBar(P,d){
  const parts=dayParts(d,P.key),I=idx(),rest=PARTS.filter(x=>parts.indexOf(x.key)<0);
  let h='<div class="daybar" role="group" aria-label="Body parts in this session">'+parts.map(k=>{
    const bp=I.byDate[d]&&I.byDate[d].parts[k],n=bp?bp.sets:0;
    return '<button type="button" class="dp" data-dpart="'+k+'" aria-pressed="'+(k===P.key)+'"><b>'+partOf(k).label+'</b><small>'+(n?n+(n===1?" set":" sets"):"no sets yet")+'</small></button>';
  }).join("")+(rest.length?'<button type="button" class="dp add" data-dpadd="'+(S.dayAdd?"cancel":"open")+'" aria-expanded="'+S.dayAdd+'" aria-label="Add another body part to this session"><b>'+(S.dayAdd?"×":"+")+'</b><small>'+(S.dayAdd?"Close":"Part")+'</small></button>':"")+'</div>';
  if(S.dayAdd&&rest.length)h+='<div class="chips dpadd" role="group" aria-label="Add a body part to this session">'+rest.map(x=>'<button type="button" data-dpadd="'+x.key+'">+ '+x.label+'</button>').join("")+'</div>';
  return h;
}
function viewTrain(){
  const P=partOf(S.part),dd=S.dateAuto?todayS():S.date,dps=dayParts(dd,P.key);
  const tabs=seg("train",[["log","Log"],["history","History"],["records","Records"]],S.tab);
  let body="";
  if(S.tab==="log")body=trainLog(P);else if(S.tab==="history")body=trainHistory(P);else body=trainRecords(P);
  return (dps.length>1?head("Training day",namesOf(dps),dps.length>2?"long":""):head("Body part",P.label))+dayBar(P,dd)+tabs+body;
}
function newExForm(){
  return '<div class="addcard addex"><label class="l" for="newEx">Exercise name</label><input type="text" id="newEx" maxlength="40" placeholder="e.g. Smith machine press" value="'+esc(S.newName)+'" autocomplete="off">'+
    '<div class="chips" style="margin:12px 0"><button type="button" data-bwtoggle aria-pressed="'+S.newBw+'">Bodyweight exercise</button></div>'+
    '<div class="btns"><button type="button" class="btn primary" data-addex="save">Add exercise</button><button type="button" class="btn" data-addex="cancel">Cancel</button></div>'+
    '<p class="msg err" role="status">'+(S.msgFor==="__new"?esc(S.msg):"")+'</p></div>';
}
function pickView(P,d,I,isToday){
  const all=exList(P.key),sel=pickIds(d),R=coachPlan(P.key,d),rec={};
  R.picks.forEach(pk=>{rec[pk.id]=1});
  const n=all.filter(x=>sel.indexOf(x.id)>=0||hasSetsOn(d,x.id)).length;
  const started=all.some(x=>hasSetsOn(d,x.id)),pd=prevDayFor(P.key,d,I);
  let h='<div class="pickhead"><b>'+(S.manage?"Edit your exercise list":(isToday?"Choose today's exercises":"Choose exercises for "+dShort(d)))+'</b><small>'+(S.manage?"Hide anything your gym does not have. Show brings it back. Your history is never deleted.":"Tap Add on what you plan to do. You can still add more once you are in the session.")+'</small></div>';
  if(!S.manage)h+=coachCard(P,d,I);
  h+='<div class="chips pkchips">'+(S.manage?"":(pd?'<button type="button" data-pickset="prev">Same as '+(diff(d,pd)===1?"yesterday":dShort(pd))+'</button>':"")+'<button type="button" data-pickset="all">Select all</button><button type="button" data-pickset="clear">Clear</button>')+'<button type="button" data-pickset="manage" aria-pressed="'+S.manage+'">Edit list</button></div>';
  h+='<div class="pklist" role="group" aria-label="Exercises">';
  if(S.manage){
    exListAll(P.key).forEach(ex=>{
      const hid=isHidden(ex.id),dn=hasSetsOn(d,ex.id);
      h+='<div class="pk mg'+(hid?" off":"")+'"><span class="pt"><b>'+esc(ex.n)+'</b><small>'+(dn?"Logged on this day":(hid?"Hidden from your list":(regionOf(ex.id)||"Shown in your list")))+'</small></span><button type="button" class="btn sm" data-hide="'+ex.id+'"'+(dn?" disabled":"")+'>'+(hid?"Show":"Hide")+'</button></div>';
    });
  }else all.forEach(ex=>{
    const done=SESS[d]&&SESS[d].ex[ex.id]&&SESS[d].ex[ex.id].sets.length,on=done||sel.indexOf(ex.id)>=0;
    const list=(I.by[ex.id]||[]).filter(z=>z.date!==d),le=list.length?list[list.length-1]:null;
    const last=done?done+(done===1?" set":" sets")+" logged on this day":(le?"Last: "+fset(le.e.sets[le.e.sets.length-1],ex.bw)+" · "+dShort(le.date):"Not logged yet"),rg=regionOf(ex.id);
    h+='<label class="pk'+(on?" on":"")+'"><input type="checkbox" data-pick="'+ex.id+'"'+(on?" checked":"")+(done?" disabled":"")+'><span class="pt"><b>'+esc(ex.n)+'</b>'+(rg?'<small class="rg">'+esc(rg)+'</small>':"")+'<small>'+esc(last)+'</small></span>'+
      (isUni(ex.id)?'<span class="lr">L/R</span>':"")+(rec[ex.id]?'<span class="cp">Coach pick</span>':"")+'<span class="tg'+(done?" dn":"")+'" aria-hidden="true"><svg class="plus" viewBox="0 0 24 24"><path d="M12 6v12M6 12h12"/></svg><svg class="tick" viewBox="0 0 24 24"><path d="m6 12.5 4 4 8-9"/></svg><em>'+(done?"Logged":on?"Added":"Add")+'</em></span></label>';
  });
  h+='</div>';
  h+=S.addEx?newExForm():'<button type="button" class="btn addex" data-addex="open" style="width:100%">+ New exercise</button>';
  if(S.manage)return h+'<div class="pickbar"><button type="button" class="btn primary" data-pickset="manage">Done editing</button></div>';
  h+='<div class="pickbar"><button type="button" class="btn primary" data-pickgo'+(n?"":" disabled")+'>'+(n?(started?"Done":(isToday?"Start session":"Show these exercises"))+" · "+n+(n===1?" exercise":" exercises"):"Pick at least one exercise")+'</button></div>';
  return h;
}
function trainLog(P){
  const I=idx(),t=todayS();
  if(S.dateAuto)S.date=t;
  const d=S.date,isToday=d===t,bd=I.byDate[d],bp=bd&&bd.parts[P.key];
  let h='<div class="datebar"><button type="button" data-date="-1" aria-label="Previous day">‹</button><div><b>'+dShort(d)+'</b><small>'+(isToday?"Today":agoLong(d))+'</small></div><button type="button" data-date="1" aria-label="Next day"'+(isToday?" disabled":"")+'>›</button></div>';
  if(planOf(d).indexOf(P.key)>=0)h+='<div class="plantag"><span class="pb">Planned</span><span>'+P.label+' is on the plan for this day</span></div>';
  if(isPicking(P,d))return h+pickView(P,d,I,isToday);
  const dps=dayParts(d,P.key);let tv=0,ts=0,tx=0;
  dps.forEach(k=>{const b=bd&&bd.parts[k];if(b){tv+=b.vol;ts+=b.sets;tx+=b.ex.length}});
  if(ts)h+='<div class="hero"><span>'+(dps.length>1?"Session":P.label)+' volume · '+(isToday?"today":dShort(d))+'</span><strong>'+vol(tv)+'</strong><small>'+ts+(ts===1?" set":" sets")+' across '+tx+(tx===1?" exercise":" exercises")+(dps.length>1?" · "+dps.filter(k=>bd.parts[k]).map(k=>partOf(k).label+" "+bd.parts[k].sets).join(", "):"")+'</small></div>';
  else h+='<p class="note" style="margin:0 0 14px">Nothing logged for '+P.label.toLowerCase()+' on this day yet. Open an exercise to log your first set.</p>';
  h+=sessionEx(P,d).map(ex=>exCard(ex,d,I)).join("");
  h+=coachCard(P,d,I);
  if(S.addEx)h+=newExForm();
  else h+='<div class="btnrow addrow"><button type="button" class="btn" data-pickopen>+ Add from list</button><button type="button" class="btn addex" data-addex="open">+ New exercise</button></div>';
  h+='<p class="foot">Estimated 1RM uses the Epley formula. A PB is a session\'s top set beating every earlier session\'s top set.</p>';
  return h;
}
const PENCIL='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4"/></svg>';
const perf=(z,as)=>(!as&&z.w>0)?e1(z.w,z.r):z.r;
function balanceCard(ex,d,I){
  const list=(I.by[ex.id]||[]).filter(x=>x.date<=d&&x.e.sets.some(s=>s.L));
  if(!list.length)return "";
  const ss=list.slice(-4).map(x=>{
    const us=x.e.sets.filter(s=>s.L),n=us.length;
    const f=k=>{let best=0,rs=0,ws=0;us.forEach(s=>{best=Math.max(best,perf(s[k],ex.bw===2));rs+=s[k].r;ws+=s[k].w});return {best:best,reps:rs/n,w:ws/n}};
    const L=f("L"),R=f("R"),hi=Math.max(L.best,R.best);
    return {date:x.date,L:L,R:R,gap:hi?Math.abs(L.best-R.best)/hi*100:0};
  });
  const c=ss[ss.length-1],L=c.L,R=c.R;
  const sameW=Math.abs(L.w-R.w)<=0.02*Math.max(L.w,R.w,0.001);
  const repGap=Math.abs(L.reps-R.reps);
  const weakK=L.best===R.best?(L.reps<=R.reps?"L":"R"):(L.best<R.best?"L":"R"),strK=weakK==="L"?"R":"L";
  const nm=k=>k==="L"?"left":"right",NM=k=>k==="L"?"Left":"Right";
  const imb=c.gap>=5||(sameW&&repGap>=2),bwm=L.w+R.w===0||ex.bw===2;
  const rn=Math.round(repGap*2)/2;
  const row=(k,val,max,txt)=>'<div class="br'+(imb&&k===weakK?" weak":"")+'"><b>'+k+'</b><i><u style="width:'+Math.round(val/max*100)+'%"></u></i><span>'+txt+'</span></div>';
  const maxB=Math.max(L.best,R.best)||1,maxR=Math.max(L.reps,R.reps)||1,rp=v=>fmtN(Math.round(v*10)/10)+" reps";
  let h='<div class="bal"><div class="bh"><span class="eyebrow">Left vs right</span><span class="bt">'+(imb?NM(weakK)+" side behind"+(c.gap>=5?" · "+Math.round(c.gap)+"%":""):"Balanced")+'</span></div>';
  if(!bwm)h+='<div class="bm"><span>Strength · est. 1RM</span>'+row("L",L.best,maxB,fw(L.best)+" "+unit)+row("R",R.best,maxB,fw(R.best)+" "+unit)+'</div>';
  h+='<div class="bm"><span>Endurance · reps per set</span>'+row("L",L.reps,maxR,rp(L.reps))+row("R",R.reps,maxR,rp(R.reps))+'</div>';
  const bl=[];
  if(!imb){
    bl.push("Left and right are "+(c.gap<1?"level":"within "+Math.round(c.gap)+"%")+". Keep matching them.");
    bl.push("Alternate which side goes first each set.");
  }else{
    bl.push("Lead with the "+nm(weakK)+" side each set, while it's fresh.");
    if(sameW&&repGap>=1)bl.push("The "+nm(strK)+" side gets "+fmtN(rn)+" more rep"+(rn===1?"":"s")+" per set. Stop it at the "+nm(weakK)+" side's count so the gap stops growing.");
    else if(!sameW&&repGap>=1&&((L.reps>R.reps)===(weakK==="L")))bl.push("The "+nm(weakK)+" side does more reps with less weight, so its endurance is ahead of its strength. Try adding weight to it.");
    else bl.push("Raise the "+nm(weakK)+" side's weight only once it matches the "+nm(strK)+" side's reps.");
    if(c.gap>=10||repGap>=3)bl.push("Add one extra set for the "+nm(weakK)+" side only, such as a single-arm finisher, until the gap is under 5%.");
    else bl.push("Keep sets equal and re-check next session.");
  }
  h+='<ul>'+bl.map(x=>'<li>'+esc(x)+'</li>').join("")+'</ul>';
  if(ss.length>=2){
    const a0=ss[0].gap,b0=c.gap;
    if(Math.abs(b0-a0)>=2&&(a0>=5||b0>=5))h+='<p class="bn">The gap has '+(b0<a0?"narrowed":"widened")+' from '+Math.round(a0)+'% to '+Math.round(b0)+'% over your last '+ss.length+' sessions.</p>';
  }
  return h+'</div>';
}
function sideWho(kind){return kind.length===2?(kind.charAt(0)==="l"?", left":", right"):""}
function stepRow(kind,id,label,val){
  const isW=kind.slice(-1)==="w",who=sideWho(kind);
  return '<div class="erow"><label for="e'+kind+'-'+id+'">'+label+'</label><div class="step"><button type="button" data-step="'+kind+'|'+id+'|-1" aria-label="'+(isW?"Less weight":"Fewer reps")+who+'">−</button>'+
    '<input type="number" id="e'+kind+'-'+id+'" data-e'+kind+'="'+id+'" inputmode="'+(isW?"decimal":"numeric")+'" step="'+(isW?"any":"1")+'" min="'+(isW?"0":"1")+'" value="'+esc(val)+'"><button type="button" data-step="'+kind+'|'+id+'|1" aria-label="'+(isW?"More weight":"More reps")+who+'">+</button></div></div>';
}
function edRow(kind,label,val){
  const isW=kind.slice(-1)==="w",who=sideWho(kind);
  return '<div class="erow"><label for="ed'+kind+'">'+label+'</label><div class="step"><button type="button" data-estep="'+kind+'|-1" aria-label="'+(isW?"Less weight":"Fewer reps")+who+'">−</button>'+
    '<input type="number" id="ed'+kind+'" data-ed="'+kind+'" inputmode="'+(isW?"decimal":"numeric")+'" step="'+(isW?"any":"1")+'" min="'+(isW?"0":"1")+'" value="'+esc(val)+'"><button type="button" data-estep="'+kind+'|1" aria-label="'+(isW?"More weight":"More reps")+who+'">+</button></div></div>';
}
function editPanel(ex,i,ek){
  const ed=S.ed,wl=ex.bw===2?"assistance":ex.bw?"added weight":"weight",WL=ex.bw===2?"Assistance":ex.bw?"Added weight":"Weight";
  const rows=ed.uni?
    edRow("lw","Left "+wl+" ("+unit+")",ed.lw)+edRow("lr","Left reps",ed.lr)+edRow("rw","Right "+wl+" ("+unit+")",ed.rw)+edRow("rr","Right reps",ed.rr):
    edRow("w",WL+" ("+unit+")",ed.w)+edRow("r","Reps",ed.r);
  return '<div class="setedit"><div class="eh">Edit set '+(i+1)+'</div><div class="entry">'+rows+'</div>'+
    '<div class="btnrow"><button type="button" class="btn primary" data-esave="'+ek+'">Save</button><button type="button" class="btn" data-ecancel>Cancel</button><button type="button" class="btn danger" data-del="'+ek+'">Delete</button></div>'+
    '<p class="msg err" role="status">'+(S.msgFor==="e:"+ex.id?esc(S.msg):"")+'</p></div>';
}
function exCard(ex,d,I){
  const sess=SESS[d],e=sess&&sess.ex[ex.id],sets=e?e.sets:[],open=S.open===ex.id;
  const list=I.by[ex.id]||[];let prev=null;
  for(let i=list.length-1;i>=0;i--)if(list[i].date<d){prev=list[i];break}
  let hasPb=false;
  sets.forEach((s,i)=>{if(I.pb[d+"|"+ex.id+"|"+i])hasPb=true});
  let sub;
  if(sets.length){
    let top=sets[0];sets.forEach(s=>{if(better(ex.bw,s,top))top=s});
    sub=sets.length+(sets.length===1?" set":" sets")+" · top "+fset(top,ex.bw);
  }else if(prev){
    const ls=prev.e.sets[prev.e.sets.length-1];sub="Last: "+fset(ls,ex.bw)+" · "+dShort(prev.date);
  }else sub="No sets yet";
  const uni=isUni(ex.id);
  let h='<div class="ex" data-open="'+open+'"><button type="button" class="ex-h" data-open="'+ex.id+'" aria-expanded="'+open+'"><span class="nm"><b>'+esc(ex.n)+'</b><small>'+esc(sub)+'</small></span>'+(uni?'<span class="lr" title="Left and right tracked separately">L/R</span>':"")+(hasPb?'<span class="pb">PB</span>':"")+CHEV+'</button>';
  if(open){
    h+='<div class="ex-b">';
    if(prev)h+='<p class="last">Last time · '+dShort(prev.date)+': '+prev.e.sets.map(s=>s.L?csx(s,ex.bw):((ex.bw&&!s.w)?s.r:fw(s.w)+"×"+s.r)).join(" · ")+'</p>';
    if(sets.length)h+='<div class="sth"><span>Set</span><span>'+(ex.bw===2?"Assist":ex.bw?"Added":unit)+'</span><span>Reps</span><span>Est. 1RM</span><span></span></div>';
    sets.forEach((s,i)=>{
      const ek=d+"|"+ex.id+"|"+i,pbk=!!I.pb[ek],bwz=ex.bw&&!s.w;
      if(S.ed&&S.ed.key===ek){h+=editPanel(ex,i,ek);return}
      const btn='<button type="button" class="x" data-edit="'+ek+'" aria-label="Edit set '+(i+1)+(pbk?", personal best":"")+'">'+PENCIL+'</button>';
      if(s.L){
        const noW=!s.L.w&&!s.R.w,same=s.L.w===s.R.w;
        h+='<div class="setrow uni'+(pbk?" pbr":"")+'"><span class="n">'+(i+1)+'</span>'+
          '<span class="w">'+(noW?"BW":same?fw(s.L.w):'<span class="two"><span><i>L</i>'+fw(s.L.w)+'</span><span><i>R</i>'+fw(s.R.w)+'</span></span>')+'</span>'+
          '<span class="r two"><span><i>L</i>'+s.L.r+'</span><span><i>R</i>'+s.R.r+'</span></span>'+
          '<span class="e">'+((noW||ex.bw===2)?"—":'<span class="two"><span><i>L</i>'+fw(e1(s.L.w,s.L.r))+'</span><span><i>R</i>'+fw(e1(s.R.w,s.R.r))+'</span></span>')+(pbk?'<span class="pb">PB</span>':"")+'</span>'+btn+'</div>';
        return;
      }
      h+='<div class="setrow'+(pbk?" pbr":"")+'"><span class="n">'+(i+1)+'</span><span class="w">'+(bwz?"BW":fw(s.w))+'</span><span class="r">'+s.r+'</span>'+
        '<span class="e">'+((bwz||ex.bw===2)?"—":fw(e1(s.w,s.r)))+(pbk?'<span class="pb">PB</span>':"")+'</span>'+btn+'</div>';
    });
    h+=balanceCard(ex,d,I);
    h+='<label class="chk"><input type="checkbox" data-uni="'+ex.id+'"'+(uni?" checked":"")+'><span>Track left and right separately</span></label>';
    const sg=suggest(ex,d),en=S.entry[ex.id]||{},wl=ex.bw===2?"Assistance":ex.bw?"Added weight":"Weight";
    let rows,extra="";
    if(uni){
      const split=en.split!=null?!!en.split:!!(sg.L&&sg.L.w!==sg.R.w);
      const bw0=sg.L?sg.L.w:sg.w,bw1=sg.R?sg.R.w:sg.w;
      const wv=en.w!=null?en.w:r1(dw(bw0)),lwv=en.lw!=null?en.lw:r1(dw(bw0)),rwv=en.rw!=null?en.rw:r1(dw(bw1));
      const lrv=en.lr!=null?en.lr:(sg.L?sg.L.r:sg.r),rrv=en.rr!=null?en.rr:(sg.R?sg.R.r:sg.r);
      rows=split?
        stepRow("lw",ex.id,"Left "+wl.toLowerCase()+" ("+unit+")",lwv)+stepRow("lr",ex.id,"Left reps",lrv)+stepRow("rw",ex.id,"Right "+wl.toLowerCase()+" ("+unit+")",rwv)+stepRow("rr",ex.id,"Right reps",rrv):
        stepRow("w",ex.id,wl+" ("+unit+")",wv)+stepRow("lr",ex.id,"Left reps",lrv)+stepRow("rr",ex.id,"Right reps",rrv);
      extra='<div class="chips" style="margin:10px 0 0"><button type="button" data-split="'+ex.id+'" aria-pressed="'+split+'">Different weight each side</button></div>';
    }else{
      const wv=en.w!=null?en.w:r1(dw(sg.w)),rv=en.r!=null?en.r:sg.r;
      rows=stepRow("w",ex.id,wl+" ("+unit+")",wv)+stepRow("r",ex.id,"Reps",rv);
    }
    h+='<div class="entry">'+rows+'</div>'+extra+
      '<button type="button" class="btn primary" data-log="'+ex.id+'" style="width:100%;margin-top:12px">Log set '+(sets.length+1)+'</button>'+
      '<p class="msg'+(S.msgErr?" err":"")+'" role="status">'+(S.msgFor===ex.id?esc(S.msg):"")+'</p>';
    if(ex.custom)h+='<button type="button" class="rm" data-rmex="'+ex.id+'">Remove this exercise from the list</button>';
    h+='</div>';
  }
  return h+'</div>';
}
function trainHistory(P){
  const I=idx();
  const days=I.dates.filter(d=>I.byDate[d].parts[P.key]).reverse();
  if(!days.length)return '<p class="note" style="margin-top:0">No '+P.label.toLowerCase()+' sessions yet. Log a set and your history builds up here.</p>';
  const shown=days.slice(0,S.histN);
  let h='<div class="rows">'+shown.map(d=>{
    const bp=I.byDate[d].parts[P.key];
    return '<div class="hs"><div class="hs-h"><b>'+dShort(d)+'</b><span>'+bp.sets+(bp.sets===1?" set":" sets")+' · '+vol(bp.vol)+'</span></div>'+
      bp.ex.map(e=>{
        const id=Object.keys(SESS[d].ex).find(k=>SESS[d].ex[k]===e);
        return '<div class="nm">'+esc(e.n)+'</div><div class="sets">'+e.sets.map((s,i)=>'<span'+(I.pb[d+"|"+id+"|"+i]?' class="pb"':"")+'>'+csx(s,e.bw)+(I.pb[d+"|"+id+"|"+i]?" · PB":"")+'</span>').join("")+'</div>';
      }).join("")+'</div>';
  }).join("")+'</div>';
  if(days.length>shown.length)h+='<button type="button" class="btn" data-more style="width:100%;margin-top:14px">Show older sessions ('+(days.length-shown.length)+' more)</button>';
  return h;
}
function trainRecords(P){
  const I=idx(),all=exList(P.key),withData=all.filter(x=>I.by[x.id]);
  if(!withData.length)return '<p class="note" style="margin-top:0">No records yet. Your heaviest sets and estimated one-rep maxes show up here once you log some.</p>'+
    '<div class="rows" style="margin-top:14px">'+all.map(x=>'<div class="line"><div class="h"><span>'+esc(x.n)+'</span><b style="color:var(--muted);font-weight:500">No sets yet</b></div></div>').join("")+'</div>';
  if(!S.sel||!withData.some(x=>x.id===S.sel)){
    // default to the most-trained exercise (it has the richest trend), newest first on ties
    S.sel=withData.slice().sort((a,b)=>{
      const la=I.by[a.id],lb=I.by[b.id];
      if(la.length!==lb.length)return lb.length-la.length;
      return la[la.length-1].date<lb[lb.length-1].date?1:la[la.length-1].date>lb[lb.length-1].date?-1:0;
    })[0].id;
  }
  const rows=all.map(x=>{
    const b=I.best[x.id],hv=I.heavy[x.id];
    if(!b)return '<div class="line"><div class="h"><span>'+esc(x.n)+'</span><b style="color:var(--muted);font-weight:500">No sets yet</b></div></div>';
    const main=x.bw?fset(b.set,x.bw):fset(hv.set,false);
    const side=x.bw?"":'1RM '+fw(e1(b.set.w,b.set.r));
    return '<button type="button" class="line" data-sel="'+x.id+'" aria-pressed="'+(S.sel===x.id)+'"><div class="h"><span>'+esc(x.n)+'<div class="s">'+dShort(x.bw?b.date:hv.date)+(side?" · est. "+side:"")+'</div></span><b>'+main+'</b></div></button>';
  }).join("");
  const ex=all.find(x=>x.id===S.sel),list=I.by[S.sel];
  const pts=list.map(s=>{
    let top=s.e.sets[0];s.e.sets.forEach(t=>{if(better(ex.bw,t,top))top=t});
    return {date:s.date,v:ex.bw?top.r:dw(e1(top.w,top.r))};
  });
  const b=I.best[S.sel],hv=I.heavy[S.sel];
  let total=0,tvol=0;list.forEach(s=>s.e.sets.forEach(t=>{total++;tvol+=(s.e.bw===2?0:setVol(t))}));
  const hero=ex.bw?
    '<div class="hero"><span>Best set · '+esc(ex.n)+'</span><strong>'+fset(b.set,true)+'</strong><small>Set on '+dShort(b.date)+'.</small></div>':
    '<div class="hero"><span>Estimated 1-rep max · '+esc(ex.n)+'</span><strong>'+fw(e1(b.set.w,b.set.r))+' '+unit+'</strong><small>From '+fset(b.set,false)+' on '+dShort(b.date)+'. Heaviest set: '+fset(hv.set,false)+'.</small></div>';
  return '<div class="rows">'+rows+'</div><div class="eyebrow" style="margin:22px 0 10px">Progress</div>'+hero+
    (pts.length>1?trendChart(pts,"Top set per session for "+ex.n):'<p class="note" style="margin-top:0">Log another session of this exercise to see a trend.</p>')+
    '<div class="stats" style="margin-top:14px">'+stat("Sessions",String(list.length))+stat("Total sets",String(total))+'</div>'+
    '<p class="foot">'+(ex.bw?"Chart shows reps in the top set of each session.":"Chart shows the estimated 1RM of the top set in each session, in "+unit+".")+' Total volume: '+vol(tvol)+'.</p>';
}

function viewCal(){
  const I=idx(),t=todayS(),m1=S.calMonth,md=parse(m1),y=md.getFullYear(),mo=md.getMonth();
  const dim=new Date(y,mo+1,0).getDate(),lead=(md.getDay()+6)%7;
  const prefix=m1.slice(0,8);
  const inMonth=I.dates.filter(d=>d.indexOf(prefix.slice(0,7))===0).length;
  // longest streak of consecutive days
  let best=0,run=0,prevD=null;
  I.dates.forEach(d=>{run=(prevD&&diff(d,prevD)===1)?run+1:1;if(run>best)best=run;prevD=d});
  const w4=I.dates.filter(d=>d>addDays(t,-28)&&d<=t).length;
  const nd=new Date(),lim=ymd(new Date(nd.getFullYear(),nd.getMonth()+12,1)).slice(0,7);
  let cells="";
  ["M","T","W","T","F","S","S"].forEach(w=>{cells+='<div class="wd">'+w+'</div>'});
  for(let i=0;i<lead;i++)cells+='<i></i>';
  for(let d=1;d<=dim;d++){
    const ds=prefix+pad(d),on=!!I.byDate[ds],pl=planOf(ds).length>0,past=ds<t;
    cells+='<button type="button" data-day="'+ds+'" class="'+(on?"on ":"")+(pl&&!on?(past?"miss ":"plan "):"")+(ds===t?"today ":"")+(ds===S.calSel?"sel":"")+'" aria-label="'+dShort(ds)+(on?", trained":"")+(pl&&!on?(past?", planned, not logged":", planned"):"")+'">'+d+'</button>';
  }
  const sel=S.calSel,bd=I.byDate[sel],pls=planOf(sel);
  let detail;
  if(bd){
    detail='<div class="eyebrow" style="margin:0 0 8px">'+dShort(sel)+' · '+bd.sets+' sets · '+vol(bd.vol)+'</div><div class="rows">'+
      PARTS.filter(p=>bd.parts[p.key]).map(p=>{
        const bp=bd.parts[p.key];
        return '<div class="line"><div class="h"><span>'+p.label+'</span><b>'+bp.sets+(bp.sets===1?" set":" sets")+'</b></div><div class="s">'+bp.ex.map(e=>esc(e.n)).join(", ")+'</div></div>';
      }).join("")+'</div>';
    if(pls.length)detail+='<p class="note">Planned: '+pls.map(k=>partOf(k).label+(bd.parts[k]?" (done)":" (not logged)")).join(", ")+'.</p>';
  }else if(sel<t){
    detail='<div class="eyebrow" style="margin:0 0 8px">'+dShort(sel)+'</div><p class="note" style="margin:0">'+(pls.length?"Planned: "+pls.map(k=>partOf(k).label).join(", ")+". Nothing was logged.":"Rest day. Nothing logged.")+'</p>';
  }else{
    detail='<div class="eyebrow" style="margin:0 0 8px">'+dShort(sel)+(sel===t?" · today":"")+'</div>'+(sel===t?'<p class="note" style="margin:0">Nothing logged yet today.</p>':"");
  }
  let panel="";
  if(sel>=t){
    panel='<div class="eyebrow" style="margin:18px 0 8px">Plan '+(sel===t?"today":dShort(sel))+'</div>'+
      (PLAN.groups.some(g=>g.length>1)?'<div class="chips" style="margin:0 0 8px" role="group" aria-label="Plan a whole training day">'+PLAN.groups.filter(g=>g.length>1).map(g=>'<button type="button" data-plangrp="'+g.join(",")+'" aria-pressed="'+(pls.length===g.length&&g.every(k=>pls.indexOf(k)>=0))+'">'+namesOf(g)+'</button>').join("")+'</div>':"")+
      '<div class="chips" style="margin:0 0 10px" role="group" aria-label="Body parts planned for '+dShort(sel)+'">'+PARTS.map(p=>'<button type="button" data-plan="'+p.key+'" aria-pressed="'+(pls.indexOf(p.key)>=0)+'">'+p.label+'</button>').join("")+'</div>'+
      (pls.length?'<div class="btns"><button type="button" class="btn" data-planrep>Repeat for 4 weeks</button><button type="button" class="btn" data-planclear>Clear plan</button></div>':'<p class="note" style="margin:0">Tap the body parts you plan to train.</p>')+
      '<p class="msg" role="status">'+(S.msgFor==="plan"?esc(S.msg):"")+'</p>';
  }
  return head("Training log","Calendar")+
    '<div class="stats">'+stat("This month",inMonth+(inMonth===1?" day":" days"))+stat("Last 4 weeks",(w4/4).toFixed(1)+" / week")+stat("Longest streak",best+(best===1?" day":" days"))+stat("All time",I.dates.length+(I.dates.length===1?" day":" days"))+'</div>'+
    '<div class="datebar"><button type="button" data-cal="-1" aria-label="Previous month">‹</button><div><b>'+MOL[mo]+' '+y+'</b></div><button type="button" data-cal="1" aria-label="Next month"'+(prefix.slice(0,7)>=lim?" disabled":"")+'>›</button></div>'+
    '<div class="cal">'+cells+'</div><div class="legend"><span>Trained</span><span class="p">Planned</span><span class="t">Today</span></div>'+detail+panel+
    (sel<=t?'<button type="button" class="btn primary" data-logday style="width:100%;margin-top:14px">'+(bd?"Open this day in Train":"Log a session for this day")+'</button>':"");
}

function viewPhotos(){
  const t=todayS(),can=B.mode==="local"||!!B.assets;
  let span="—";
  if(PHOTOS.length>1){const f=PHOTOS[PHOTOS.length-1].date,l=PHOTOS[0].date,n=diff(l,f);span=n<=0?"Same day":n+" days"}
  let grid="",cur="";
  PHOTOS.forEach((p,i)=>{
    const mk=MOL[parse(p.date).getMonth()]+" "+parse(p.date).getFullYear();
    if(mk!==cur){if(cur)grid+='</div>';grid+='<div class="mh">'+mk+'</div><div class="pgrid">';cur=mk}
    grid+='<button type="button" class="ph" data-photo="'+esc(p.id)+'" aria-label="Photo from '+dShort(p.date)+(p.note?", "+esc(p.note):"")+'"><img src="'+esc(photoUrl(p))+'" alt="" loading="lazy"><span>'+dShort(p.date)+'</span></button>';
  });
  if(cur)grid+='</div>';
  return head("Progress","Photos")+
    '<div class="stats">'+stat("Photos",String(PHOTOS.length))+stat("Tracked over",span,"",PHOTOS.length?"since "+dFull(PHOTOS[PHOTOS.length-1].date):"")+'</div>'+
    '<div class="addcard"><div class="two"><div><label class="l" for="pDate">Date</label><input type="date" id="pDate" value="'+esc(S.pDate)+'" max="'+t+'"></div>'+
    '<div><label class="l" for="pNote">Note (optional)</label><input type="text" id="pNote" maxlength="120" placeholder="e.g. Front, morning" value="'+esc(S.pNote)+'" autocomplete="off"></div></div>'+
    '<label class="btn primary'+((can&&!S.upBusy)?"":" off")+'" for="pFile">'+(S.upBusy?"Adding…":"Add progress photos")+'</label>'+
    '<input class="vh" type="file" id="pFile" accept="image/*" multiple'+((can&&!S.upBusy)?"":" disabled")+'>'+
    '<p class="msg'+(S.pErr?" err":"")+'" role="status">'+esc(S.pMsg)+'</p></div>'+
    (can?"":'<p class="note">Photo storage isn\'t available in this view. Open the page from your own account to add photos.</p>')+
    (PHOTOS.length?grid:'<p class="note">No photos yet. Add one above and it\'s filed under its date.</p>')+
    '<p class="foot">'+(B.mode==="local"?"Photos are shrunk and kept in this browser only.":"Photos are stored with this page. They stay private to you unless you share the page.")+'</p>';
}

function viewSettings(){
  const sw=(attr,arr,sel)=>'<div class="seg" role="group">'+arr.map(t=>'<button type="button" data-'+attr+'="'+t[0]+'" aria-pressed="'+(sel===t[0])+'">'+t[1]+'</button>').join("")+'</div>';
  const where=B.mode==="cloud"?"Your workouts, custom exercises and photos are saved to your private data for this page, so they're here whenever you reopen it.":
    B.mode==="local"?"Saved in this browser only. If you clear site data or switch device, it won't follow you.":"Connecting to your saved data…";
  return head("Preferences","Settings")+
    '<div class="control" style="margin-top:0"><div class="h"><label>Weight unit</label></div>'+sw("unit",[["kg","Kilograms"],["lb","Pounds"]],unit)+'<p class="note" style="margin:-6px 0 0">Switching only changes how weights are shown. Nothing you logged is altered.</p></div>'+
    '<div class="control"><div class="h"><label>Rest timer</label></div>'+sw("rest",[["0","Off"],["60","60s"],["90","90s"],["120","2 min"],["180","3 min"]],String(PLAN.rest))+'<p class="note" style="margin:-6px 0 0">Starts after you log a set.</p></div>'+
    '<div class="control"><div class="h"><label>Weekly sets goal</label></div><p class="note" style="margin:-6px 0 12px">Fills the ring around each body part on the wheel. Set one for each.</p>'+goalsBlock(idx())+'</div>'+groupsBlock()+
    '<div class="control"><div class="h"><label>Where your data lives</label></div><p class="note" style="margin:0">'+where+'</p></div>'+
    '<div class="control"><div class="h"><label>Backup</label></div><p class="note" style="margin:0 0 10px">Copy your workouts and exercise list as text you can keep. Photos are not included.</p>'+
    '<button type="button" class="btn" data-copy style="width:100%">'+(S.copied?"Copied":"Copy data as JSON")+'</button>'+
    (S.exportText!=null?'<p class="note">Your browser blocked copying. Select and copy this instead:</p><textarea class="exp" id="exp" readonly>'+esc(S.exportText)+'</textarea>':"")+'</div>'+
    '<p class="foot">Aether Gym keeps what you log and nothing else. Estimated 1RM is a guide, not a promise.</p>';
}

function renderLb(){
  const el=$("lb");
  const p=S.lb&&PHOTOS.find(x=>x.id===S.lb);
  if(!p){el.hidden=true;el.innerHTML="";return}
  const i=PHOTOS.indexOf(p);
  const was=!el.hidden;
  el.hidden=false;
  el.innerHTML='<img src="'+esc(photoUrl(p))+'" alt="Progress photo from '+dShort(p.date)+'"><div class="meta"><b>'+dFull(p.date)+'</b>'+(p.note?'<span>'+esc(p.note)+'</span>':"")+'<span>'+(i+1)+' of '+PHOTOS.length+'</span></div>'+
    '<div class="row">'+(S.lbConfirm?
      '<button type="button" class="btn danger" data-lb="delyes">Delete photo</button><button type="button" class="btn" data-lb="delno">Keep it</button>':
      '<button type="button" class="btn" data-lb="prev"'+(i<=0?" disabled":"")+'>‹ Newer</button><button type="button" class="btn" data-lb="next"'+(i>=PHOTOS.length-1?" disabled":"")+'>Older ›</button>'+
      '<button type="button" class="btn danger" data-lb="del">Delete</button><button type="button" class="btn" data-lb="close" id="lbClose">Close</button>')+'</div>';
  if(!was){const c=$("lbClose");if(c)c.focus()}
}

/* ---------- render ---------- */
function updateChrome(){
  const I=idx(),t=todayS(),ws=wkStart(t);
  const wk=I.dates.filter(d=>d>=ws&&d<=t);
  let wsets=0,wvol=0;wk.forEach(d=>{wsets+=I.byDate[d].sets;wvol+=I.byDate[d].vol});
  $("eyebrow").textContent="This week · "+dShort(t);
  $("topTotal").textContent=wk.length+(wk.length===1?" session":" sessions");
  $("topSub").textContent=wk.length?nf(wsets)+(wsets===1?" set · ":" sets · ")+vol(wvol)+" lifted so far":"Nothing logged yet this week. Pick a body part to begin.";
  let sk=0,dd=I.byDate[t]?t:addDays(t,-1);while(I.byDate[dd]){sk++;dd=addDays(dd,-1)}
  $("sStreak").textContent=sk+(sk===1?" day":" days");
  const letters=["M","T","W","T","F","S","S"],on=[],pln=[];let wkh="";
  for(let i=0;i<7;i++){
    const d=addDays(ws,i),b=I.byDate[d],pl=!b&&d>=t&&planOf(d).length>0;
    if(b)on.push(WD[parse(d).getDay()]);
    if(pl)pln.push(WD[parse(d).getDay()]);
    wkh+='<span class="'+(b?"on ":"")+(pl?"plan ":"")+(d===t?"today":"")+'"><i style="height:'+(b?Math.round(8+Math.min(1,b.sets/20)*30):(pl?10:4))+'px"></i><b>'+letters[i]+'</b></span>';
  }
  $("wk").innerHTML=wkh;$("wk").setAttribute("aria-label","Trained this week: "+(on.length?on.join(", "):"no days yet")+(pln.length?". Planned: "+pln.join(", ")+".":""));
  $("sVol").textContent=vol(wvol);
  $("sPB").textContent=String(I.pbs.filter(e=>e.date>=addDays(t,-29)).length);
  ORBS.forEach(o=>{
    const l=I.part[o.key].last,w=I.part[o.key].wk;
    o.valEl.textContent=o.val();
    o.el.style.setProperty("--p",String(Math.min(100,Math.round(w/goalOf(o.key)*100))));
    o.el.classList.toggle("has",w>0);
    o.el.setAttribute("aria-label",o.label+", "+w+" of "+goalOf(o.key)+" sets this week, last trained "+agoLong(l));
  });
  if(ROOT.dataset.sheetPage!==S.page){ROOT.dataset.sheetPage=S.page;$("sheet").scrollTop=0}
  ROOT.querySelectorAll("[data-nav]").forEach(b=>{
    const p=b.getAttribute("data-nav");
    if(p===S.page){b.setAttribute("aria-current","page");centerTab(b)}else b.removeAttribute("aria-current");
  });
  const o=ORBS[front==null?0:front],st=I.part[o.key];
  $("hubLab").textContent=o.label;$("hubPct").textContent=String(st.wk);$("hubSub").textContent="of "+goalOf(o.key)+" sets";
  $("hub").setAttribute("aria-label",o.label+": "+st.wk+" of "+goalOf(o.key)+" sets this week. Open training overview.");
  if(window.AETHER)AETHER.changed("gym");
}
function centerTab(b){
  const bar=$("tabs");if(!bar||bar.scrollWidth<=bar.clientWidth+1)return;
  const l=Math.max(0,b.offsetLeft-(bar.clientWidth-b.offsetWidth)/2);
  try{bar.scrollTo({left:l,behavior:reduce?"auto":"smooth"})}catch(e){bar.scrollLeft=l}
}
function renderAll(){
  pendingRender=false;
  updateChrome();
  const v={home:viewHome,train:viewTrain,cal:viewCal,photos:viewPhotos,settings:viewSettings}[S.page]||viewHome;
  $("sheet").innerHTML=v();
  renderLb();
  setStatus();
}

/* ---------- events ---------- */
const sheet=$("sheet");
sheet.addEventListener("click",e=>{if(e.target.closest('[data-welcome="hide"]')){LS.set("aether-gym-welcome","1");renderAll()}});
function say(id,msg,err){S.msg=msg;S.msgErr=!!err;S.msgFor=id}
function readNum(sel){const el=sheet.querySelector(sel);return el?parseFloat(el.value):NaN}

sheet.addEventListener("click",e=>{
  const t=e.target.closest("button");if(!t)return;
  const a=n=>t.getAttribute(n);
  if(t.hasAttribute("data-tab")){S.tab=a("data-tab");S.msg="";S.addEx=false;S.ed=null;renderAll();return}
  if(t.hasAttribute("data-go")){pickPart(a("data-go"));S.tab="log";return}
  if(t.hasAttribute("data-open")&&t.classList.contains("ex-h")){const id=a("data-open");S.open=S.open===id?null:id;S.msg="";S.ed=null;renderAll();return}
  if(t.hasAttribute("data-step")){
    const p=a("data-step").split("|"),kind=p[0],isW=kind.slice(-1)==="w",dir=parseInt(p[2],10);
    const el=sheet.querySelector('[data-e'+kind+'="'+p[1]+'"]');if(!el)return;
    let v=parseFloat(el.value);if(!isFinite(v))v=0;
    v=isW?Math.max(0,r1(v+dir*(unit==="lb"?5:2.5))):Math.max(1,Math.round(v)+dir);
    el.value=v;(S.entry[p[1]]=S.entry[p[1]]||{})[kind]=String(v);return;
  }
  if(t.hasAttribute("data-split")){
    const id=a("data-split"),en=(S.entry[id]=S.entry[id]||{}),was=!!sheet.querySelector('[data-elw="'+id+'"]');
    const val=k=>{const el=sheet.querySelector('[data-e'+k+'="'+id+'"]');return el?el.value:null};
    if(was){const lw=val("lw");if(lw!=null)en.w=lw;en.split=false}
    else{const w=val("w");if(w!=null){en.lw=w;en.rw=w}en.split=true}
    renderAll();return;
  }
  if(t.hasAttribute("data-coachtoggle")){S.coachOpen=!S.coachOpen;renderAll();return}
  if(t.hasAttribute("data-cov")){S.covOpen=!S.covOpen;renderAll();return}
  if(t.hasAttribute("data-rec")){
    const id=a("data-rec"),info=POOL[id];if(!info)return;
    const pp=partOf(info.part),was=isPicking(pp,S.date);
    if(!exList(info.part).some(x=>x.id===id)){PLAN.custom.push({id:id,p:info.part,n:info.e.n,bw:info.e.bw?+info.e.bw:0});touch("plan","plan")}
    setPicks(S.date,[id],true);
    S.ed=null;S.msg="";
    if(was){S.pickKey=pickKeyOf(info.part,S.date);renderAll();return}
    S.open=id;renderAll();
    const el=$("ew-"+id);if(el)el.scrollIntoView({block:"center",behavior:reduce?"auto":"smooth"});
    return;
  }
  if(t.hasAttribute("data-edit")){
    const k=a("data-edit"),p=k.split("|"),se=SESS[p[0]]&&SESS[p[0]].ex[p[1]],st=se&&se.sets[+p[2]];
    if(!st)return;
    S.ed=st.L?{key:k,uni:1,lw:String(r1(dw(st.L.w))),lr:String(st.L.r),rw:String(r1(dw(st.R.w))),rr:String(st.R.r)}:{key:k,w:String(r1(dw(st.w))),r:String(st.r)};
    S.msg="";renderAll();
    const i=$(st.L?"edlw":"edw");if(i){i.focus();if(i.select)i.select()}return;
  }
  if(t.hasAttribute("data-ecancel")){S.ed=null;S.msg="";renderAll();return}
  if(t.hasAttribute("data-estep")){
    const p=a("data-estep").split("|"),kind=p[0],isW=kind.slice(-1)==="w",dir=parseInt(p[1],10),el=$("ed"+kind);
    if(!el||!S.ed)return;
    let v=parseFloat(el.value);if(!isFinite(v))v=0;
    v=isW?Math.max(0,r1(v+dir*(unit==="lb"?5:2.5))):Math.max(1,Math.round(v)+dir);
    el.value=v;S.ed[kind]=String(v);return;
  }
  if(t.hasAttribute("data-esave")){
    const p=a("data-esave").split("|"),e=SESS[p[0]]&&SESS[p[0]].ex[p[1]];
    if(!e||!e.sets[+p[2]]){S.ed=null;renderAll();return}
    if(e.sets[+p[2]].L){
      const g=k=>readNum("#ed"+k),gi=k=>parseInt(($("ed"+k)||{}).value,10),bwu=e.bw===2?2:(e.bw?1:0);
      const lw=g("lw"),rw=g("rw"),lr=gi("lr"),rr=gi("rr");
      if(!okW(lw,bwu)||!okW(rw,bwu)){say("e:"+p[1],bwu?"Enter an added weight of 0 or more.":"Enter a weight above 0.",true);renderAll();return}
      if(!okR(lr)||!okR(rr)){say("e:"+p[1],"Enter at least 1 rep for each side.",true);renderAll();return}
      editSetSides(p[0],p[1],+p[2],{w:toKg(lw),r:lr},{w:toKg(rw),r:rr});S.ed=null;say(p[1],"Set "+(+p[2]+1)+" updated.",false);renderAll();return;
    }
    const w=readNum("#edw"),r=parseInt(($("edr")||{}).value,10),bw=e.bw===2?2:(e.bw?1:0);
    if(!isFinite(w)||w<0||w>2000||(!bw&&w<=0)){say("e:"+p[1],bw?"Enter an added weight of 0 or more.":"Enter a weight above 0.",true);renderAll();return}
    if(!isFinite(r)||r<1||r>1000){say("e:"+p[1],"Enter at least 1 rep.",true);renderAll();return}
    editSet(p[0],p[1],+p[2],toKg(w),r);S.ed=null;say(p[1],"Set "+(+p[2]+1)+" updated.",false);renderAll();return;
  }
  if(t.hasAttribute("data-log")){
    const id=a("data-log"),ex=exList(S.part).find(x=>x.id===id);if(!ex)return;
    const rd=k=>readNum('[data-e'+k+'="'+id+'"]'),rdi=k=>parseInt((sheet.querySelector('[data-e'+k+'="'+id+'"]')||{}).value,10);
    const wmsg=ex.bw===2?"Enter the assistance weight, 0 or more.":ex.bw?"Enter an added weight of 0 or more.":"Enter a weight above 0.";
    if(isUni(id)){
      const split=!!sheet.querySelector('[data-elw="'+id+'"]');
      const lw=split?rd("lw"):rd("w"),rw=split?rd("rw"):lw,lr=rdi("lr"),rr=rdi("rr");
      if(!okW(lw,ex.bw)||!okW(rw,ex.bw)){say(id,wmsg,true);renderAll();return}
      if(!okR(lr)||!okR(rr)){say(id,"Enter at least 1 rep for each side.",true);renderAll();return}
      const L={w:toKg(lw),r:lr},R={w:toKg(rw),r:rr},wk=weakSide(ex.bw===2?2:(ex.bw?1:0),L,R);
      addSet(ex,S.date,wk.w,wk.r,L,R);
      S.entry[id]={split:split};
    }else{
      const w=rd("w"),r=rdi("r");
      if(!okW(w,ex.bw)){say(id,wmsg,true);renderAll();return}
      if(!okR(r)){say(id,"Enter at least 1 rep.",true);renderAll();return}
      addSet(ex,S.date,toKg(w),r);
      delete S.entry[id];
    }
    if(S.date===todayS())startRest(PLAN.rest);
    const I=idx(),n=SESS[S.date].ex[id].sets.length;
    const isPb=!!I.pb[S.date+"|"+id+"|"+(n-1)];
    say(id,"Set "+n+" logged"+(isPb?". New personal best.":"."),false);
    renderAll();return;
  }
  if(t.hasAttribute("data-del")){const p=a("data-del").split("|");delSet(p[0],p[1],parseInt(p[2],10));S.ed=null;say(null,"");renderAll();return}
  if(t.hasAttribute("data-date")){
    const n=addDays(S.date,parseInt(a("data-date"),10));
    if(n>todayS())return;
    S.date=n;S.dateAuto=n===todayS();S.msg="";S.ed=null;renderAll();return;
  }
  if(t.hasAttribute("data-pickopen")){S.pickKey=pickKeyOf(S.part,S.date);S.addEx=false;S.ed=null;S.msg="";renderAll();focusSheet();return}
  if(t.hasAttribute("data-hide")){
    const id=a("data-hide");PLAN.hide[id]=isHidden(id)?0:1;touch("plan","plan");renderAll();
    const el=sheet.querySelector('[data-hide="'+id+'"]');if(el)el.focus({preventScroll:true});return;
  }
  if(t.hasAttribute("data-pickset")){
    const m=a("data-pickset"),P=partOf(S.part),d=S.date,I=idx(),ids=exList(P.key).map(x=>x.id);
    if(m==="manage"){S.manage=!S.manage;S.pickKey=pickKeyOf(P.key,d);renderAll();return}
    const free=ids.filter(id=>!hasSetsOn(d,id));
    if(m==="all")setPicks(d,free,true);
    else if(m==="clear")setPicks(d,free,false);
    else if(m==="prev"){
      const pd=prevDayFor(P.key,d,I);if(!pd)return;
      const last=Object.keys(SESS[pd].ex).filter(id=>SESS[pd].ex[id].p===P.key&&ids.indexOf(id)>=0);
      setPicks(d,free,false);setPicks(d,last,true);
    }
    S.pickKey=pickKeyOf(P.key,d);renderAll();return;
  }
  if(t.hasAttribute("data-pickgo")){
    const P=partOf(S.part),d=S.date;
    S.pickKey=null;S.manage=false;
    const list=sessionEx(P,d);
    if(!list.length){S.pickKey=pickKeyOf(P.key,d);renderAll();return}
    const first=list.find(x=>!hasSetsOn(d,x.id))||list[0];
    S.open=first.id;S.ed=null;S.msg="";S.addEx=false;renderAll();focusSheet();return;
  }
  if(t.hasAttribute("data-addex")){
    const m=a("data-addex");
    if(m==="open"){S.addEx=true;S.newName="";S.newBw=false;S.msg="";renderAll();const i=$("newEx");if(i)i.focus();return}
    if(m==="cancel"){S.addEx=false;S.msg="";renderAll();return}
    const nm=(S.newName||"").trim();
    if(!nm){say("__new","Give the exercise a name.",true);renderAll();return}
    const id="c-"+Date.now().toString(36)+Math.random().toString(36).slice(2,5);
    const was=isPicking(partOf(S.part),S.date);
    PLAN.custom.push({id:id,p:S.part,n:nm.slice(0,40),bw:S.newBw?1:0});
    setPicks(S.date,[id],true);
    S.addEx=false;S.msg="";
    if(was)S.pickKey=pickKeyOf(S.part,S.date);else S.open=id;
    renderAll();return;
  }
  if(t.hasAttribute("data-bwtoggle")){S.newBw=!S.newBw;t.setAttribute("aria-pressed",String(S.newBw));return}
  if(t.hasAttribute("data-rmex")){
    const id=a("data-rmex");PLAN.custom=PLAN.custom.filter(c=>c.id!==id);touch("plan","plan");S.open=null;renderAll();return;
  }
  if(t.hasAttribute("data-more")){S.histN+=12;renderAll();return}
  if(t.hasAttribute("data-sel")){S.sel=a("data-sel");renderAll();return}
  if(t.hasAttribute("data-cal")){
    const d=parse(S.calMonth);d.setMonth(d.getMonth()+parseInt(a("data-cal"),10));
    const nm=ymd(new Date(d.getFullYear(),d.getMonth(),1)),now=new Date(),lim=ymd(new Date(now.getFullYear(),now.getMonth()+12,1)).slice(0,7);
    if(nm.slice(0,7)>lim)return;
    S.calMonth=nm;renderAll();return;
  }
  if(t.hasAttribute("data-day")){S.calSel=a("data-day");S.msg="";renderAll();return}
  if(t.hasAttribute("data-planday")){const d=a("data-planday");S.page="cal";S.calSel=d;S.calMonth=d.slice(0,8)+"01";S.ed=null;S.msg="";renderAll();focusSheet();return}
  if(t.hasAttribute("data-plan")){
    const k=a("data-plan"),d=S.calSel;if(d<todayS())return;
    const cur=planOf(d).slice(),i=cur.indexOf(k);
    if(i>=0)cur.splice(i,1);else cur.push(k);
    setPlan(d,PARTS.map(x=>x.key).filter(x=>cur.indexOf(x)>=0));S.msg="";renderAll();return;
  }
  if(t.hasAttribute("data-planclear")){setPlan(S.calSel,[]);say("plan","Plan cleared.",false);renderAll();return}
  if(t.hasAttribute("data-planrep")){
    const ks=planOf(S.calSel).slice();if(!ks.length)return;
    for(let i=1;i<=4;i++)setPlan(addDays(S.calSel,7*i),ks,true);
    touch("plan","plan");say("plan","Copied to the next 4 weeks.",false);renderAll();return;
  }
  if(t.hasAttribute("data-logday")){S.date=S.calSel;S.dateAuto=S.calSel===todayS();S.page="train";S.tab="log";renderAll();focusSheet();return}
  if(t.hasAttribute("data-photo")){S.lb=a("data-photo");S.lbConfirm=false;renderLb();return}
  if(t.hasAttribute("data-unit")){
    const u=a("data-unit");if(u===unit)return;
    unit=u;PLAN.unit=u;S.entry={};S.ed=null;touch("plan","plan");renderAll();return;
  }
  if(t.hasAttribute("data-rest")){PLAN.rest=parseInt(a("data-rest"),10);touch("plan","plan");renderAll();return}
  if(t.hasAttribute("data-goalp")){
    const q=a("data-goalp").split("|"),k=q[0];if(!validPart(k))return;
    const g=Math.max(1,Math.min(40,goalOf(k)+parseInt(q[1],10)));
    if(g!==goalOf(k)){PLAN.goals[k]=g;touch("plan","plan")}
    renderAll();const el=sheet.querySelector('[data-goalp="'+a("data-goalp")+'"]');if(el)el.focus({preventScroll:true});return;
  }
  if(t.hasAttribute("data-goalall")){
    const n=parseInt(a("data-goalall"),10);if(!(n>=1&&n<=40))return;
    PLAN.goal=n;PLAN.goals={};touch("plan","plan");renderAll();return;
  }
  if(t.hasAttribute("data-grp")){
    const q=a("data-grp").split("|"),gi=parseInt(q[0],10),k=q[1];if(!validPart(k))return;
    const gs=PLAN.groups.filter(g=>g.length).map(g=>g.slice());
    const tgt=gs[gi]||(gs.push([]),gs[gs.length-1]);
    const had=tgt.indexOf(k)>=0;
    gs.forEach(g=>{const i=g.indexOf(k);if(i>=0)g.splice(i,1)});
    if(!had)tgt.push(k);
    PLAN.groups=gs.map(g=>PARTS.map(x=>x.key).filter(x=>g.indexOf(x)>=0)).filter(g=>g.length);
    touch("plan","plan");renderAll();return;
  }
  if(t.hasAttribute("data-dpart")){
    const k=a("data-dpart");if(!validPart(k)||k===S.part)return;
    syncWheel(k);S.open=null;S.ed=null;S.addEx=false;S.dayAdd=false;S.histN=12;S.msg="";renderAll();return;
  }
  if(t.hasAttribute("data-dpadd")){
    const m=a("data-dpadd");
    if(m==="open"||m==="cancel"){S.dayAdd=m==="open";renderAll();return}
    if(!validPart(m))return;
    const d=S.dateAuto?todayS():S.date,cur=dayParts(d,S.part).concat(dayParts(d,m),[m]);
    PLAN.day[d]=PARTS.map(x=>x.key).filter(x=>cur.indexOf(x)>=0);
    touch("plan","plan");syncWheel(m);S.open=null;S.ed=null;S.addEx=false;S.dayAdd=false;S.msg="";renderAll();return;
  }
  if(t.hasAttribute("data-plangrp")){
    const g=a("data-plangrp").split(",").filter(validPart),d=S.calSel;if(d<todayS()||!g.length)return;
    const cur=planOf(d),same=cur.length===g.length&&g.every(k=>cur.indexOf(k)>=0);
    setPlan(d,same?[]:PARTS.map(x=>x.key).filter(x=>g.indexOf(x)>=0));S.msg="";renderAll();return;
  }
  if(t.hasAttribute("data-copy")){
    const txt=JSON.stringify({app:"aether-gym",version:1,unitShown:unit,plan:planOut(),sessions:SESS,photos:PHOTOS.map(p=>({id:p.id,date:p.date,note:p.note}))},null,1);
    const fallback=()=>{S.exportText=txt;S.copied=false;renderAll();const x=$("exp");if(x){x.focus();x.select()}};
    try{
      if(!navigator.clipboard||!navigator.clipboard.writeText){fallback();return}
      navigator.clipboard.writeText(txt).then(()=>{S.exportText=null;S.copied=true;renderAll();setTimeout(()=>{S.copied=false;if(S.page==="settings")renderAll()},2500)},fallback);
    }catch(err){fallback()}
  }
});
sheet.addEventListener("input",e=>{
  const el=e.target;
  const KINDS=["w","r","lw","rw","lr","rr"];
  for(let i=0;i<KINDS.length;i++){const at="data-e"+KINDS[i];if(el.hasAttribute(at)){const id=el.getAttribute(at);(S.entry[id]=S.entry[id]||{})[KINDS[i]]=el.value;return}}
  if(el.hasAttribute("data-ed")&&S.ed){S.ed[el.getAttribute("data-ed")]=el.value;return}
  if(el.id==="newEx"){S.newName=el.value;return}
  if(el.id==="pDate"){S.pDate=el.value;return}
  if(el.id==="pNote"){S.pNote=el.value;return}
});
sheet.addEventListener("keydown",e=>{
  if(e.key!=="Enter")return;
  const el=e.target;
  const entryAttr=el.attributes&&Array.prototype.find.call(el.attributes,at=>/^data-e(w|r|lw|rw|lr|rr)$/.test(at.name));
  if(el.hasAttribute&&el.hasAttribute("data-ed")){
    e.preventDefault();const b=sheet.querySelector("[data-esave]");if(b)b.click();
  }else if(entryAttr){
    e.preventDefault();
    const id=entryAttr.value,b=sheet.querySelector('[data-log="'+id+'"]');if(b)b.click();
  }else if(el.id==="newEx"){e.preventDefault();const b=sheet.querySelector('[data-addex="save"]');if(b)b.click()}
});
sheet.addEventListener("focusout",()=>{
  if(!pendingRender)return;
  setTimeout(()=>{if(pendingRender&&!typing())renderAll()},0);
});
sheet.addEventListener("change",e=>{
  if(e.target.id==="pFile")addPhotos(e.target);
  if(e.target.hasAttribute&&e.target.hasAttribute("data-pick")){
    const id=e.target.getAttribute("data-pick");
    setPicks(S.date,[id],e.target.checked);
    S.pickKey=pickKeyOf(S.part,S.date);renderAll();
    const el=sheet.querySelector('[data-pick="'+id+'"]');if(el)el.focus({preventScroll:true});
    return;
  }
  if(e.target.hasAttribute&&e.target.hasAttribute("data-uni")){
    const id=e.target.getAttribute("data-uni"),on=e.target.checked,en=S.entry[id]||{};
    PLAN.uni[id]=on?1:0;
    if(on){if(en.r!=null){en.lr=en.r;en.rr=en.r}}else if(en.lr!=null)en.r=en.lr;
    S.entry[id]=en;S.ed=null;touch("plan","plan");renderAll();
  }
  if(e.target.hasAttribute&&e.target.hasAttribute("data-goalin")){
    const k=e.target.getAttribute("data-goalin"),g=Math.round(+e.target.value);
    if(validPart(k)&&g>=1&&g<=40&&g!==goalOf(k)){PLAN.goals[k]=g;touch("plan","plan")}
    renderAll();
  }
});

/* ---------- photos ---------- */
function shrink(file,max,q){
  return new Promise((res,rej)=>{
    const url=URL.createObjectURL(file),img=new Image();
    img.onload=()=>{
      URL.revokeObjectURL(url);
      const k=Math.min(1,max/Math.max(img.naturalWidth,img.naturalHeight));
      const w=Math.max(1,Math.round(img.naturalWidth*k)),h=Math.max(1,Math.round(img.naturalHeight*k));
      const c=document.createElement("canvas");c.width=w;c.height=h;
      c.getContext("2d").drawImage(img,0,0,w,h);
      c.toBlob(b=>b?res(b):rej(new Error("encode")),"image/jpeg",q);
    };
    img.onerror=()=>{URL.revokeObjectURL(url);rej(new Error("decode"))};
    img.src=url;
  });
}
const toDataUrl=blob=>new Promise((res,rej)=>{const f=new FileReader();f.onload=()=>res(f.result);f.onerror=()=>rej(f.error);f.readAsDataURL(blob)});
async function addPhotos(input){
  const files=Array.from(input.files||[]);input.value="";
  if(!files.length||S.upBusy)return;
  const date=isDate(S.pDate)&&S.pDate<=todayS()?S.pDate:todayS(),note=(S.pNote||"").trim().slice(0,120);
  S.upBusy=true;S.pMsg="Adding "+files.length+(files.length===1?" photo…":" photos…");S.pErr=false;renderAll();
  let ok=0,fail="";
  for(const f of files){
    try{
      const id="p"+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
      if(B.mode==="cloud"){
        if(!B.assets)throw new Error("Photo storage isn't available here.");
        const blob=await shrink(f,1600,0.85),up=await B.assets.upload(blob,{type:"image/jpeg"});
        PHOTOS.push({id:id,date:date,note:note,asset:up.id,at:Date.now()});
      }else{
        const blob=await shrink(f,900,0.7);
        PHOTOS.push({id:id,date:date,note:note,data:await toDataUrl(blob),at:Date.now()});
      }
      sortPhotos();touch("photo",id);ok++;
      if(B.mode==="local"&&B.err){PHOTOS=PHOTOS.filter(p=>p.id!==id);B.err=null;throw new Error("This browser's storage is full.")}
    }catch(err){
      fail=err&&err.message==="decode"?"Couldn't read that image. Try a JPG or PNG.":(err&&err.message)||"Couldn't add that photo.";
      if(err&&err.code==="quota_or_state")fail="This page's photo storage is full.";
    }
  }
  S.upBusy=false;S.pNote=ok?"":S.pNote;
  S.pErr=!!fail;S.pMsg=fail?(ok?ok+" added. "+fail:fail):(ok+(ok===1?" photo":" photos")+" added to "+dShort(date)+".");
  renderAll();
}
async function deletePhoto(id){
  const p=PHOTOS.find(x=>x.id===id);if(!p)return;
  PHOTOS=PHOTOS.filter(x=>x.id!==id);touch("photo",id);
  if(B.mode==="cloud"&&B.assets&&p.asset){try{await B.assets.delete(p.asset)}catch(e){}}
}
$("lb").addEventListener("click",e=>{
  const b=e.target.closest("[data-lb]");
  if(!b){if(e.target===$("lb")){S.lb=null;S.lbConfirm=false;renderLb()}return}
  const act=b.getAttribute("data-lb"),i=PHOTOS.findIndex(p=>p.id===S.lb);
  if(act==="close"){S.lb=null;S.lbConfirm=false}
  else if(act==="prev"&&i>0){S.lb=PHOTOS[i-1].id}
  else if(act==="next"&&i<PHOTOS.length-1){S.lb=PHOTOS[i+1].id}
  else if(act==="del"){S.lbConfirm=true}
  else if(act==="delno"){S.lbConfirm=false}
  else if(act==="delyes"){
    const nxt=PHOTOS[i+1]||PHOTOS[i-1];
    deletePhoto(S.lb);S.lb=nxt&&nxt.id!==S.lb?nxt.id:null;S.lbConfirm=false;renderAll();return;
  }
  renderLb();
});
document.addEventListener("keydown",e=>{
  if($("lb").hidden)return;
  const i=PHOTOS.findIndex(p=>p.id===S.lb);
  if(e.key==="Escape"){S.lb=null;S.lbConfirm=false;renderLb()}
  else if(e.key==="ArrowLeft"&&i>0){S.lb=PHOTOS[i-1].id;S.lbConfirm=false;renderLb()}
  else if(e.key==="ArrowRight"&&i<PHOTOS.length-1){S.lb=PHOTOS[i+1].id;S.lbConfirm=false;renderLb()}
});

/* ---------- start ---------- */
(function boot(){
  layout();
  angle=angleFor(0);position();checkFront();
  booting=false;
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(layout);
  setStatus();
  connect();
})();

/* ---------- hub registration ---------- */
if(window.AETHER)AETHER.app({
  id:"gym",name:"Gym",tint:"gym",glyph:"gym",slot:3,kw:"workout training exercise lift sets reps",
  onShow(){layout();if(pendingRender&&!typing())renderAll()},
  sections(){
    return [
      {id:"home",label:"Training overview",kw:"last 30 days goals personal bests"},
      {id:"train",label:"Train",kw:"log session sets workout"},
      {id:"cal",label:"Training calendar",kw:"plan schedule days streak"},
      {id:"photos",label:"Progress photos",kw:"pictures"},
      {id:"settings",label:"Gym settings",kw:"unit kg lb rest timer backup goals training days"}
    ].concat(PARTS.map(p=>({id:"part:"+p.key,label:"Train "+p.label.toLowerCase(),sub:"Body part",kw:p.label+" "+p.ex.map(x=>x[1]).join(" ")})));
  },
  go(sec){
    if(sec.indexOf("part:")===0){const k=sec.slice(5);if(!validPart(k))return;S.tab="log";pickPart(k);return}
    if(["home","train","cal","photos","settings"].indexOf(sec)<0)return;
    S.page=sec;S.msg="";S.ed=null;S.exportText=null;S.copied=false;renderAll();focusSheet();
  },
  summary(){
    const I=idx(),t=todayS(),ws=wkStart(t),wk=I.dates.filter(d=>d>=ws&&d<=t);
    let sets=0,vv=0;wk.forEach(d=>{sets+=I.byDate[d].sets;vv+=I.byDate[d].vol});
    let sk=0,dd=I.byDate[t]?t:addDays(t,-1);while(I.byDate[dd]){sk++;dd=addDays(dd,-1)}
    const tp=planOf(t),done=k=>!!(I.byDate[t]&&I.byDate[t].parts[k]);
    let next;
    if(tp.length)next=tp.some(k=>!done(k))?"Planned today: "+namesOf(tp):"Today's plan is done: "+namesOf(tp);
    else{const nx=nextUp();next="Next up: "+namesOf(groupOf(nx.key))+(nx.last?", last trained "+agoLong(nx.last):"")}
    let bars='<span class="hub-wk">';
    for(let i=0;i<7;i++){
      const d=addDays(ws,i),b=I.byDate[d],pl=!b&&d>=t&&planOf(d).length>0;
      bars+='<span class="'+(b?"on ":"")+(pl?"pl ":"")+(d===t?"today":"")+'" style="--h:'+(b?Math.min(1,.3+b.sets/24):(pl?.3:0)).toFixed(2)+'"><i></i><b>'+"MTWTFSS"[i]+'</b></span>';
    }
    bars+='</span>';
    const n=wk.length,val=n+(n===1?" session":" sessions");
    return {short:val,eyebrow:"This week",value:val,
      sub:n?nf(sets)+(sets===1?" set · ":" sets · ")+vol(vv)+(sk>1?" · "+sk+"-day streak":""):"Nothing logged yet this week",
      viz:bars,next:next,aria:val+" this week. "+next};
  },
  brief(){
    if(B.mode==="pending"||(B.mode==="cloud"&&!(B.gotPlan&&B.gotSess)))return {loading:true,slots:1};
    const I=idx(),t=todayS(),tp=planOf(t).filter(validPart),bd=I.byDate[t],h=new Date().getHours();
    const done=k=>!!(bd&&bd.parts[k]),low=s=>s.toLowerCase();
    const setsTxt=n=>nf(n)+(n===1?" set":" sets");
    const lastOf=ks=>{let l=null;ks.forEach(k=>{const x=I.part[k]&&I.part[k].last;if(x&&(!l||x>l))l=x});return l};
    const ahead=Object.keys(PLAN.sched).filter(d=>d>t&&planOf(d).some(validPart)).sort();
    const whenOf=d=>{const n=diff(d,t);return n===1?"tomorrow":n<7?"on "+WD[parse(d).getDay()]:"on "+dShort(d)};
    const lines=[],stats=[];let st;
    if(tp.length){
      const dn=tp.filter(done),todo=tp.filter(k=>!done(k));
      if(!todo.length){
        st={label:"Training",value:"Done",sub:namesOf(tp)+" · "+setsTxt(bd.sets),ring:1,go:"home",rank:3};
        lines.push({text:"Today's "+low(namesOf(tp))+" session is done.",em:"done",rank:3});
      }else if(dn.length){
        st={label:"Training",value:dn.length+" of "+tp.length,sub:namesOf(todo)+" still to do",ring:dn.length/tp.length,go:"part:"+todo[0],rank:7};
        lines.push({text:namesOf(dn)+" done, "+low(namesOf(todo))+" still to go.",em:low(namesOf(todo))+" still to go",rank:7});
      }else{
        const r=h<21?8:6;
        st={label:"Training",value:namesOf(tp),sub:"Planned · not started",ring:0,go:"part:"+tp[0],rank:r};
        lines.push({text:namesOf(tp)+(tp.length>1?" are":" is")+" on the plan today.",em:namesOf(tp),rank:r});
      }
    }else if(bd){
      const ks=PARTS.map(p=>p.key).filter(k=>bd.parts[k]);
      st={label:"Training",value:"Done",sub:(ks.length?namesOf(ks)+" · ":"")+setsTxt(bd.sets),ring:1,go:"home",rank:3};
      lines.push({text:"You've trained "+(ks.length?low(namesOf(ks)):"")+" today.",em:"trained",rank:3});
    }else{
      const nx=ahead[0];
      st={label:"Training",value:"Rest day",sub:nx?namesOf(planOf(nx).filter(validPart))+" "+whenOf(nx):"Nothing planned",go:nx?"cal":"train",rank:2};
      lines.push({text:"Rest day today"+(nx?", with "+low(namesOf(planOf(nx).filter(validPart)))+" "+whenOf(nx)+".":"."),em:"Rest day",rank:2});
    }
    stats.push(st);
    const pbT=I.pbs.filter(e=>e.date===t);
    if(pbT.length)lines.push({text:"New personal best on "+pbT[0].n+(pbT.length>1?" and "+(pbT.length-1)+" more":"")+".",em:"personal best",rank:5});
    let sk=0,dd=bd?t:addDays(t,-1);while(I.byDate[dd]){sk++;dd=addDays(dd,-1)}
    if(sk>=3)lines.push({text:sk+"-day training streak.",em:sk+"-day",rank:2});
    const agenda=ahead.filter(d=>d<=addDays(t,7)).map(d=>{
      const ks=planOf(d).filter(validPart),l=lastOf(ks);
      return {d:d,title:namesOf(ks),sub:l?"Last trained "+dShort(l):"Not logged yet",go:"cal"};
    });
    const todo=tp.find(k=>!done(k));
    return {lines:lines,stats:stats,agenda:agenda,plan:{label:"Plan your training",go:"cal"},
      actions:[{label:"Log a set",icon:"log",go:todo?"part:"+todo:"train"},{label:"Add photo",icon:"camera",go:"photos"}]};
  }
});
})();
