/* AETHER themes.
   Each theme is a handful of colours: background, cards, text, secondary text and a three-stop accent gradient, plus light or dark mode.
   Everything else (lines, glass, shadows, soft accents, the background wash) is worked out from those, so a theme can be edited with a few pickers.
   Built-in themes never change: editing one saves your own copy. Your choice and your themes are kept in this browser and,
   when you're signed in, in this page's private storage so they follow you to other devices. */
(function(){
"use strict";
var H=window.AETHER;if(!H)return;
var esc=H.esc,G=window.AETHER_GLYPHS||{};
var KEY="aether-theme",DOCNAME="theme";

var PRESETS=[
  {id:"aether",name:"Aether",mode:"light",bg:"#f3f4fa",card:"#ffffff",ink:"#161936",muted:"#5a6087",a1:"#4f8cff",a2:"#7a5cff",a3:"#e35cbc"},
  {id:"aether-dark",name:"Aether Night",mode:"dark",bg:"#0f1120",card:"#191c31",ink:"#eceefe",muted:"#9ba1c8",a1:"#5b9bff",a2:"#8f74ff",a3:"#ef6cc8"},
  {id:"midnight",name:"Midnight",mode:"dark",bg:"#0a1018",card:"#121b27",ink:"#e6eef7",muted:"#8fa3b8",a1:"#2dd4bf",a2:"#38bdf8",a3:"#818cf8"},
  {id:"graphite",name:"Graphite",mode:"dark",bg:"#141414",card:"#1f1f21",ink:"#f2f2f3",muted:"#a1a1aa",a1:"#a3e635",a2:"#34d399",a3:"#22d3ee"},
  {id:"ocean",name:"Ocean",mode:"light",bg:"#eef5f8",card:"#ffffff",ink:"#0f2a3a",muted:"#4f6b7c",a1:"#06b6d4",a2:"#0ea5e9",a3:"#6366f1"},
  {id:"sunset",name:"Sunset",mode:"light",bg:"#fbf3ee",card:"#ffffff",ink:"#2a1a17",muted:"#7a5f57",a1:"#f59e0b",a2:"#f97362",a3:"#ec4899"},
  {id:"sage",name:"Sage",mode:"light",bg:"#f1f4ef",card:"#ffffff",ink:"#1b261d",muted:"#5d6e5f",a1:"#84cc16",a2:"#22a06b",a3:"#0d9488"},
  {id:"sky",name:"Sky",mode:"light",bg:"#f0f6ff",card:"#ffffff",ink:"#0b1f3d",muted:"#4a6283",a1:"#60a5fa",a2:"#2563eb",a3:"#7c3aed"},
  {id:"lavender",name:"Lavender",mode:"light",bg:"#f5f2fb",card:"#ffffff",ink:"#221a3a",muted:"#6a5f85",a1:"#a78bfa",a2:"#8b5cf6",a3:"#d946ef"},
  {id:"rose",name:"Rose",mode:"light",bg:"#fbf1f3",card:"#ffffff",ink:"#2b1520",muted:"#7d5866",a1:"#fb7185",a2:"#e11d48",a3:"#f59e0b"},
  {id:"mint",name:"Mint",mode:"light",bg:"#eef8f4",card:"#ffffff",ink:"#10291f",muted:"#4d6e60",a1:"#34d399",a2:"#059669",a3:"#0ea5e9"},
  {id:"sand",name:"Sand",mode:"light",bg:"#f6f1e8",card:"#fffdf8",ink:"#2b2418",muted:"#75694f",a1:"#f59e0b",a2:"#c2410c",a3:"#a16207"},
  {id:"citrus",name:"Citrus",mode:"light",bg:"#fafaee",card:"#ffffff",ink:"#23240f",muted:"#6a6b4a",a1:"#eab308",a2:"#65a30d",a3:"#ea580c"},
  {id:"paper",name:"Paper",mode:"light",bg:"#f4f4f5",card:"#ffffff",ink:"#18181b",muted:"#63636b",a1:"#71717a",a2:"#3f3f46",a3:"#18181b"},
  {id:"nebula",name:"Nebula",mode:"dark",bg:"#15111f",card:"#201a2e",ink:"#f1ecff",muted:"#a99cc8",a1:"#c084fc",a2:"#a855f7",a3:"#f472b6"},
  {id:"ember",name:"Ember",mode:"dark",bg:"#17110e",card:"#231a15",ink:"#fbeee6",muted:"#bba293",a1:"#fb923c",a2:"#f97316",a3:"#ef4444"},
  {id:"forest",name:"Forest",mode:"dark",bg:"#0d1612",card:"#15221b",ink:"#e7f3ec",muted:"#94b3a2",a1:"#4ade80",a2:"#16a34a",a3:"#a3e635"},
  {id:"ruby",name:"Ruby",mode:"dark",bg:"#170d11",card:"#22141a",ink:"#fbe9ef",muted:"#c09aa8",a1:"#fb7185",a2:"#e11d48",a3:"#c084fc"},
  {id:"nord",name:"Nord",mode:"dark",bg:"#2e3440",card:"#3b4252",ink:"#eceff4",muted:"#b3bccd",a1:"#88c0d0",a2:"#5e81ac",a3:"#b48ead"},
  {id:"noir-gold",name:"Noir Gold",mode:"dark",bg:"#12110e",card:"#1c1a15",ink:"#f6f0e1",muted:"#b3a98f",a1:"#f59e0b",a2:"#b45309",a3:"#d97706"},
  {id:"true-black",name:"True Black",mode:"dark",bg:"#000000",card:"#0e0e10",ink:"#f5f5f7",muted:"#9a9aa2",a1:"#0a84ff",a2:"#5e5ce6",a3:"#bf5af2"}
];
var ICONS=[["solid","Solid","Coloured tiles, white icons"],["soft","Soft","Tinted tiles, coloured icons"],["outline","Outline","Light tiles with a coloured edge"],["mono","Mono","Plain tiles in your text colour"]];
var FIELDS=[["bg","Background"],["card","Cards and bars"],["ink","Main text"],["muted","Secondary text"],["a1","Accent start"],["a2","Accent middle"],["a3","Accent end"]];

/* ---------- colour maths ---------- */
function hex(h){h=String(h||"").trim().replace(/^#/,"");if(h.length===3)h=h.replace(/./g,"$&$&");return /^[0-9a-f]{6}$/i.test(h)?"#"+h.toLowerCase():null}
function rgb(h){h=hex(h)||"#000000";return[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)]}
function toHex(c){return "#"+c.map(function(v){v=Math.max(0,Math.min(255,Math.round(v)));return(v<16?"0":"")+v.toString(16)}).join("")}
function mix(a,b,t){var x=rgb(a),y=rgb(b);return toHex([0,1,2].map(function(i){return x[i]+(y[i]-x[i])*t}))}
function rgba(h,a){var c=rgb(h);return "rgba("+c[0]+","+c[1]+","+c[2]+","+a+")"}
function lum(h){var c=rgb(h).map(function(v){v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)});return .2126*c[0]+.7152*c[1]+.0722*c[2]}

function vars(t){
  var dk=t.mode==="dark",bg=t.bg,card=t.card,ink=t.ink,mu=t.muted,a1=t.a1,a2=t.a2,a3=t.a3;
  var accent=dk?mix(a2,"#ffffff",.18):mix(a2,ink,.16);
  var txt=function(c){return dk?mix(c,"#ffffff",.25):mix(c,ink,.22)};
  var v={
    "--bg":bg,"--card":card,"--panel":card,"--a1":a1,"--a2":a2,"--a3":a3,"--solid":card,"--ink":ink,"--ink-2":mix(ink,mu,.35),"--muted":mu,"--faint":mix(mu,bg,.3),
    "--line":rgba(ink,dk?.12:.1),"--line-2":rgba(ink,dk?.2:.17),"--card-line":rgba(ink,dk?.1:.09),"--hover":rgba(ink,dk?.06:.045),
    "--surface-2":dk?rgba(ink,.06):rgba(a2,.065),"--field":dk?mix(card,ink,.05):card,
    "--glass":dk?rgba(card,.7):"rgba(255,255,255,.58)","--glass-2":dk?rgba(card,.85):"rgba(255,255,255,.76)","--glass-edge":dk?rgba(ink,.1):"rgba(255,255,255,.92)",
    "--chrome":rgba(card,dk?.88:.84),"--chrome-2":rgba(bg,.84),
    "--accent":accent,"--accent-ink":"#ffffff","--accent-soft":rgba(a2,dk?.2:.12),
    "--aurora":"linear-gradient(120deg,"+a1+" 0%,"+a2+" 52%,"+a3+" 100%)",
    "--aurora-text":"linear-gradient(120deg,"+txt(a1)+" 0%,"+txt(a2)+" 50%,"+txt(a3)+" 100%)",
    "--aurora-soft":"linear-gradient(130deg,"+rgba(a1,.15)+","+rgba(a2,.14)+" 50%,"+rgba(a3,.14)+")",
    "--aurora-bg":"radial-gradient(36% 30% at 10% 6%,"+rgba(a1,dk?.18:.3)+",transparent 70%),radial-gradient(34% 30% at 92% 8%,"+rgba(a2,dk?.18:.25)+",transparent 70%),radial-gradient(44% 36% at 88% 88%,"+rgba(a3,dk?.14:.22)+",transparent 70%)",
    "--wash1":rgba(a1,dk?.14:.2),"--wash2":rgba(a2,dk?.14:.2),"--wash3":rgba(a3,dk?.1:.14),
    "--positive":dk?"#3fd3a2":"#0b8566","--negative":dk?"#ff6f8a":"#c4344f","--warn":dk?"#f2b552":"#9c5c08",
    "--sh-1":dk?"0 1px 2px rgba(0,0,0,.3),0 10px 28px -16px rgba(0,0,0,.6)":"0 1px 2px "+rgba(ink,.05)+",0 10px 28px -16px "+rgba(a2,.3),
    "--sh-2":dk?"0 1px 2px rgba(0,0,0,.3),0 24px 48px -28px rgba(0,0,0,.7)":"inset 0 1px 0 rgba(255,255,255,.95),0 1px 2px "+rgba(ink,.05)+",0 24px 48px -28px "+rgba(a2,.4),
    "--sh-float":dk?"0 18px 40px -18px rgba(0,0,0,.8)":"inset 0 1px 0 #fff,0 1px 2px "+rgba(ink,.06)+",0 18px 40px -18px "+rgba(a2,.4)
  };
  var css=":root{"+Object.keys(v).map(function(k){return k+":"+v[k]}).join(";")+";color-scheme:"+(dk?"dark":"light")+"}";
  /* the hub's and Wealth's own tint follow the theme accent; Gym keeps its coral */
  var tg="linear-gradient(140deg,"+mix(a1,"#ffffff",.25)+" 0%,"+mix(a2,"#ffffff",.2)+" 50%,"+mix(a3,"#ffffff",.25)+" 100%)";
  var on=lum(mix(a2,"#ffffff",.2))>.45?mix(a2,"#000000",.65):"#ffffff";
  css+='[data-tint="hub"],[data-tint="wealth"]{--tint-on:'+on+';--tint:'+a2+';--tint-ink:'+accent+';--tint-soft:'+rgba(a2,dk?.2:.13)+';--tint-grad:'+tg+';--tint-text:var(--aurora-text);--tint-glow:'+rgba(a2,.5)+'}';
  if(dk)css+='.app-wealth{--card:'+rgba(ink,.06)+';--edge:'+rgba(ink,.12)+';--glass-sheen:rgba(255,255,255,.06);--c-left:'+mix(card,ink,.2)+';--c-bills:'+mix(card,ink,.4)+'}';
  if(dk)css+='[data-tint="gym"]{--tint-ink:#ff8f7d;--tint-soft:rgba(242,103,95,.2)}';
  return css;
}

/* ---------- state ---------- */
var LS={get:function(k){try{return localStorage.getItem(k)}catch(e){return null}},set:function(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
var ST={icons:"solid",shape:"square",sel:"aether",custom:[],lastLight:"aether",lastDark:"aether-dark",at:0};
function load(raw){try{var o=JSON.parse(raw||"null");if(o&&typeof o==="object"){ST.sel=o.sel||ST.sel;if(ICONS.some(function(x){return x[0]===o.icons}))ST.icons=o.icons;if(o.shape==="circle"||o.shape==="square")ST.shape=o.shape;ST.custom=Array.isArray(o.custom)?o.custom.filter(valid):[];ST.lastLight=o.lastLight||ST.lastLight;ST.lastDark=o.lastDark||ST.lastDark;ST.at=+o.at||0}}catch(e){}}
function valid(t){return t&&t.id&&t.name&&FIELDS.every(function(f){return hex(t[f[0]])})&&(t.mode==="dark"||t.mode==="light")}
function all(){return PRESETS.concat(ST.custom)}
function byId(id){return all().find(function(t){return t.id===id})||PRESETS[0]}
function isPreset(id){return PRESETS.some(function(t){return t.id===id})}
function cur(){return byId(ST.sel)}
var styleEl=document.createElement("style");styleEl.id="hub-theme-vars";document.head.appendChild(styleEl);
function apply(){
  var t=cur();styleEl.textContent=vars(t);
  document.documentElement.setAttribute("data-mode",t.mode);
  document.documentElement.setAttribute("data-icons",ST.icons);document.documentElement.setAttribute("data-icon-shape",ST.shape);
  var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute("content",t.bg);
  var n=document.getElementById("hub-theme-name");if(n)n.textContent=t.name+" · "+(t.mode==="dark"?"Dark":"Light");
}
var cloud=null,pushT=null,lastPush=0;
function save(){
  ST.at=Date.now();
  var raw=JSON.stringify({icons:ST.icons,shape:ST.shape,sel:ST.sel,custom:ST.custom,lastLight:ST.lastLight,lastDark:ST.lastDark,at:ST.at});
  LS.set(KEY,raw);
  if(cloud){clearTimeout(pushT);pushT=setTimeout(function(){lastPush=ST.at;try{cloud.set({json:raw,at:ST.at,v:1}).catch(function(){})}catch(e){}},500)}
}
function select(id){
  var t=byId(id);ST.sel=t.id;
  if(t.mode==="dark")ST.lastDark=t.id;else ST.lastLight=t.id;
  apply();save();
}
load(LS.get(KEY));apply();

/* sync between devices when signed in */
if(H.cloud)H.cloud().then(function(c){
  if(!c)return;
  try{cloud=c.db.doc("data/users/"+c.uid+"/"+DOCNAME)}catch(e){return}
  var first=true;
  cloud.onSnapshot(function(snap){
    var d=snap.exists?snap.data():null,at=d?+d.at||0:0;
    if(first){first=false;if(!d||typeof d.json!=="string"){if(LS.get(KEY))save();return}if(ST.at>at){save();return}}
    if(d&&typeof d.json==="string"&&at>ST.at&&at!==lastPush){load(d.json);LS.set(KEY,d.json);apply();if(PANEL.open)render()}
  },function(){});
},function(){});

/* ---------- quick light/dark switch ---------- */
H.toggleMode=function(){
  var t=cur(),to=t.mode==="dark"?ST.lastLight:ST.lastDark;
  var target=byId(to);
  if(target.mode===t.mode)target=t.mode==="dark"?PRESETS[0]:PRESETS[1];
  select(target.id);
  if(PANEL.open)render();
};

/* ---------- appearance panel ---------- */
document.body.insertAdjacentHTML("beforeend",'<div class="hub-theme" id="hub-theme" role="dialog" aria-modal="true" aria-labelledby="hub-theme-h" hidden><div class="ht-box" id="ht-box"></div></div>');
var PANEL={open:false,back:null,draft:null,msg:""};
function swatch(t){
  return '<span class="ht-sw" aria-hidden="true" style="background:'+t.bg+'"><span style="background:'+t.card+';border-color:'+rgba(t.ink,.12)+'"><i style="background:'+t.ink+'"></i><i style="background:'+t.muted+';width:60%"></i><b style="background:linear-gradient(90deg,'+t.a1+','+t.a2+','+t.a3+')"></b></span></span>';
}
function card(t){
  var on=t.id===ST.sel;
  return '<button type="button" class="ht-card" data-pick="'+esc(t.id)+'" aria-pressed="'+on+'">'+swatch(t)+'<span class="ht-cn"><b>'+esc(t.name)+'</b><small>'+(t.mode==="dark"?"Dark":"Light")+(isPreset(t.id)?"":" · Yours")+'</small></span>'+(on?'<span class="ht-tick" aria-hidden="true">✓</span>':'')+'</button>';
}
function dyn(t,own){
  var ratio=function(a,b){var x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
  var cr=ratio(t.ink,t.card);
  return (cr<4.5?'<p class="ht-warn">Main text and cards are close in brightness ('+cr.toFixed(1)+':1), so words may be hard to read. Aim for 4.5:1 or more.</p>':'')+
    '<div class="ht-btns">'+
      (PANEL.draft?'<span class="ht-badge">Previewing your changes</span><button type="button" class="ht-btn primary" data-act="save">'+(own?"Save changes":"Save as my theme")+'</button><button type="button" class="ht-btn" data-act="discard">Discard</button>':'')+
      (own&&!PANEL.draft?'<button type="button" class="ht-btn" data-act="dup">Duplicate</button><button type="button" class="ht-btn danger" data-act="del">Delete theme</button>':'')+
      (!own&&!PANEL.draft?'<button type="button" class="ht-btn" data-act="dup">Make a copy to edit</button>':'')+
    '</div>'+
    (PANEL.msg?'<p class="ht-msg" role="status">'+esc(PANEL.msg)+'</p>':'');
}
function render(){
  var t=PANEL.draft||cur(),own=!isPreset(t.id),box=document.getElementById("ht-box");
  var light=all().filter(function(x){return x.mode==="light"}),dark=all().filter(function(x){return x.mode==="dark"});
  var fields=FIELDS.map(function(f){
    var k=f[0],v=hex(t[k]);
    return '<label class="ht-f"><span class="ht-cl"><input type="color" data-k="'+k+'" value="'+v+'" aria-label="'+f[1]+' colour"></span><span class="ht-fl"><b>'+f[1]+'</b><input type="text" class="ht-hex" data-hex="'+k+'" value="'+v+'" maxlength="7" spellcheck="false" aria-label="'+f[1]+' hex code"></span></label>';
  }).join("");
  box.innerHTML=
    '<header class="ht-head"><div><h2 id="hub-theme-h">Appearance</h2><p>Pick a theme, or edit the colours to make it yours.</p></div><button type="button" class="ht-x" data-act="close" aria-label="Close">×</button></header>'+
    '<div class="ht-body">'+
      '<div class="ht-mode" role="group" aria-label="Mode"><button type="button" data-act="light" aria-pressed="'+(t.mode==="light")+'">'+G.sun+'Light</button><button type="button" data-act="dark" aria-pressed="'+(t.mode==="dark")+'">'+G.moon+'Dark</button></div>'+
      '<h3>Icon style</h3><div class="ht-icons" role="group" aria-label="Icon style">'+ICONS.map(function(x){return '<button type="button" data-icons="'+x[0]+'" aria-pressed="'+(ST.icons===x[0])+'"><span class="ht-ip" data-icons="'+x[0]+'" data-icon-shape="'+ST.shape+'">'+H.icon("wealth","wealth",30)+H.icon("gym","gym",30)+'</span><b>'+x[1]+'</b><small>'+x[2]+'</small></button>'}).join('')+'</div>'+
      '<div class="ht-mode ht-shape" role="group" aria-label="Icon shape"><button type="button" data-shape="square" aria-pressed="'+(ST.shape==="square")+'"><i class="sq"></i>Rounded square</button><button type="button" data-shape="circle" aria-pressed="'+(ST.shape==="circle")+'"><i class="ci"></i>Circle</button></div>'+
      '<h3>Light themes</h3><div class="ht-grid">'+light.map(card).join("")+'</div>'+
      '<h3>Dark themes</h3><div class="ht-grid">'+dark.map(card).join("")+'</div>'+
      '<section class="ht-edit"><div class="ht-eh"><h3>'+(own?"Edit "+esc(t.name):"Customise "+esc(t.name))+'</h3></div>'+
        (own?'':'<p class="ht-note">Built-in themes stay as they are. Change any colour and saving makes your own copy.</p>')+
        '<label class="ht-name"><span>Theme name</span><input type="text" id="ht-name" value="'+esc(PANEL.draft?PANEL.draft.name:own?t.name:t.name+" (mine)")+'" maxlength="28"></label>'+
        '<div class="ht-fields">'+fields+'</div>'+
        '<div id="ht-dyn">'+dyn(t,own)+'</div>'+
      '</section>'+
    '</div>';
}
function preview(){styleEl.textContent=vars(PANEL.draft||cur());document.documentElement.setAttribute("data-mode",(PANEL.draft||cur()).mode)}
function ensureDraft(){if(!PANEL.draft){var t=cur();PANEL.draft=Object.assign({},t,{name:isPreset(t.id)?t.name+" (mine)":t.name})}return PANEL.draft}
function uid(){return "my-"+Date.now().toString(36)+Math.random().toString(36).slice(2,6)}
function act(a){
  PANEL.msg="";
  if(a==="close"){close();return}
  if(a==="light"||a==="dark"){
    if(PANEL.draft){PANEL.draft.mode=a;preview();render();return}
    var t=cur();if(t.mode===a)return;
    var to=byId(a==="dark"?ST.lastDark:ST.lastLight);if(to.mode!==a)to=a==="dark"?PRESETS[1]:PRESETS[0];
    select(to.id);render();return;
  }
  if(a==="discard"){PANEL.draft=null;apply();render();return}
  if(a==="save"){
    var d=PANEL.draft,nm=(document.getElementById("ht-name").value||"").trim()||"My theme";d.name=nm.slice(0,28);
    if(isPreset(d.id)){d.id=uid();ST.custom.push(d)}else{ST.custom=ST.custom.map(function(x){return x.id===d.id?d:x})}
    PANEL.draft=null;select(d.id);PANEL.msg="Saved “"+d.name+"”.";render();return;
  }
  if(a==="dup"){var c=Object.assign({},cur(),{id:uid(),name:(cur().name.replace(/ \(mine\)$/,""))+" (mine)"});ST.custom.push(c);select(c.id);PANEL.msg="Made a copy. Change any colour, then save.";render();return}
  if(a==="del"){
    var id=cur().id;if(isPreset(id))return;
    var gone=cur();ST.custom=ST.custom.filter(function(x){return x.id!==id});
    select(gone.mode==="dark"?(byId(ST.lastDark).id===id?PRESETS[1].id:ST.lastDark):(byId(ST.lastLight).id===id?PRESETS[0].id:ST.lastLight));
    PANEL.msg="Deleted “"+gone.name+"”.";render();return;
  }
}
function setColour(k,v){var h=hex(v);if(!h)return;var d=ensureDraft();d[k]=h;preview()}
function open(){
  if(PANEL.open)return;PANEL.open=true;PANEL.back=document.activeElement;PANEL.msg="";
  var p=document.getElementById("hub-theme");p.hidden=false;render();
  setTimeout(function(){var b=p.querySelector('.ht-card[aria-pressed="true"]')||p.querySelector("button");if(b)try{b.focus({preventScroll:true})}catch(e){}},30);
}
function close(){
  if(!PANEL.open)return;PANEL.open=false;
  if(PANEL.draft){PANEL.draft=null;apply()}
  document.getElementById("hub-theme").hidden=true;
  var b=PANEL.back;PANEL.back=null;if(b&&b.focus&&document.contains(b))try{b.focus({preventScroll:true})}catch(e){}
}
H.openTheme=open;
function keepScroll(fn){var b=document.getElementById("ht-box"),y=b?b.scrollTop:0;fn();if(b)b.scrollTop=y}
var panel=document.getElementById("hub-theme");
panel.addEventListener("pointerdown",function(e){if(e.target===panel)close()});
panel.addEventListener("click",function(e){
  var p=e.target.closest("[data-pick]");if(p){PANEL.draft=null;PANEL.msg="";select(p.getAttribute("data-pick"));render();var b=panel.querySelector('[data-pick="'+p.getAttribute("data-pick")+'"]');if(b)b.focus({preventScroll:true});return}
  var ic=e.target.closest("button[data-icons]");if(ic){ST.icons=ic.getAttribute("data-icons");apply();save();keepScroll(render);return}
  var sh=e.target.closest("button[data-shape]");if(sh){ST.shape=sh.getAttribute("data-shape");apply();save();keepScroll(render);return}
  var a=e.target.closest("[data-act]");if(a)act(a.getAttribute("data-act"));
});
panel.addEventListener("input",function(e){
  var t=e.target,k=t.getAttribute("data-k");
  if(k){setColour(k,t.value);var hx=panel.querySelector('[data-hex="'+k+'"]');if(hx)hx.value=t.value;markDraft();return}
  var hk=t.getAttribute("data-hex");
  if(hk){var h=hex(t.value);if(h){setColour(hk,h);var c=panel.querySelector('[data-k="'+hk+'"]');if(c)c.value=h;markDraft()}return}
  if(t.id==="ht-name"){ensureDraft().name=t.value;markDraft()}
});
/* the first edit switches the buttons to Save / Discard without losing the picker you're using */
function markDraft(){var t=PANEL.draft||cur(),el=document.getElementById("ht-dyn");if(el)el.innerHTML=dyn(t,!isPreset(t.id))}
document.addEventListener("keydown",function(e){if(PANEL.open&&e.key==="Escape"){e.preventDefault();e.stopPropagation();close()}},true);

H.cmds.push(
  {key:"cmd:theme",label:"Appearance",sub:"Themes, colours and dark mode",glyph:"grid",tag:"Settings",kw:"icons icon style theme themes colour color colours dark mode light night appearance customise",run:open},
  {key:"cmd:mode",label:"Switch light / dark mode",sub:"Appearance",glyph:"grid",tag:"Settings",kw:"dark mode light night toggle theme",run:function(){H.toggleMode()}}
);
})();
