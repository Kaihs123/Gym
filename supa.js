/* AETHER Gym on Supabase.
   1. A sign-in screen (email and password) that covers the app until someone is signed in.
   2. window.claude.use("db" | "user" | "assets"): the same small storage interface the app was written for,
      backed by Supabase: documents in table gym_docs, photos in the private storage bucket gym-photos.
   Every row and photo belongs to the signed-in person, and the rules in setup.sql stop anyone reading anyone else's. */
(function(){
"use strict";
var CFG=window.AETHER_CONFIG||{},configured=/^https:\/\/.+\.supabase\.co\/?$/.test(CFG.supabaseUrl||"")&&CFG.supabaseKey&&CFG.supabaseKey.indexOf("YOUR-")!==0;
var sb=null,USER=null,readyRes,READY=new Promise(function(r){readyRes=r});
var esc=function(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})};

/* ---------- sign-in screen ---------- */
var gate=document.createElement("div");gate.id="auth";gate.setAttribute("role","dialog");gate.setAttribute("aria-modal","true");gate.setAttribute("aria-labelledby","auth-h");
document.documentElement.classList.add("auth-on");
var MODE="in",BUSY=false,MSG="",ERR=false,EMAIL="";
function view(){
  if(!configured)return '<div class="auth-card"><div class="auth-logo">'+logo()+'</div><h1 id="auth-h">Almost ready</h1><p class="auth-p">This copy of AETHER Gym isn\'t connected to a database yet. Add the Supabase URL and key to <b>config.js</b>, then reload.</p></div>';
  var up=MODE==="up",fp=MODE==="reset",np=MODE==="new";
  var t=up?"Create your account":fp?"Reset your password":np?"Choose a new password":"Welcome back";
  var sub=up?"Your workouts are saved to your account, so they're there on any phone or computer.":fp?"We'll email you a link to set a new password.":np?"Enter a new password for your account.":"Sign in to see your training.";
  return '<form class="auth-card" novalidate>'+
    '<div class="auth-logo">'+logo()+'</div><span class="auth-brand">AETHER Gym</span>'+
    '<h1 id="auth-h">'+t+'</h1><p class="auth-p">'+sub+'</p>'+
    (np?'':'<label class="auth-f"><span>Email</span><input type="email" name="email" autocomplete="email" inputmode="email" required value="'+esc(EMAIL)+'"></label>')+
    (fp?'':'<label class="auth-f"><span>'+(np?"New password":"Password")+'</span><input type="password" name="pw" autocomplete="'+(up||np?"new-password":"current-password")+'" minlength="6" required></label>')+
    (up?'<p class="auth-hint">At least 6 characters.</p>':'')+
    (MSG?'<p class="auth-msg'+(ERR?" err":"")+'" role="'+(ERR?"alert":"status")+'">'+esc(MSG)+'</p>':'')+
    '<button type="submit" class="auth-go"'+(BUSY?" disabled":"")+'>'+(BUSY?"Please wait…":up?"Create account":fp?"Send reset link":np?"Save password":"Sign in")+'</button>'+
    (np&&USER?'<div class="auth-alt"><button type="button" data-m="cancel">Cancel</button></div>':'')+
    (np?'':'<div class="auth-alt">'+
      (MODE==="in"?'<button type="button" data-m="up">New here? <b>Create an account</b></button><button type="button" data-m="reset">Forgot password?</button>':
      '<button type="button" data-m="in">Already have an account? <b>Sign in</b></button>')+'</div>')+
  '</form>';
}
function logo(){return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="1.8" y="8.6" width="3" height="6.8" rx="1.3" fill="currentColor" stroke="none" opacity=".45"/><rect x="4.6" y="5.6" width="4" height="12.8" rx="1.8" fill="currentColor" stroke="none"/><path d="M8.6 12h6.8" stroke-width="2.6"/><rect x="15.4" y="5.6" width="4" height="12.8" rx="1.8" fill="currentColor" stroke="none"/><rect x="19.2" y="8.6" width="3" height="6.8" rx="1.3" fill="currentColor" stroke="none" opacity=".45"/></svg>'}
function draw(focus){var cur=gate.querySelector("input[name=email]");if(cur)EMAIL=cur.value;gate.innerHTML=view();if(focus!==false){var i=gate.querySelector(EMAIL?"input[name=pw]":"input")||gate.querySelector("input");if(i)setTimeout(function(){try{i.focus()}catch(e){}},50)}}
function say(m,err){MSG=m;ERR=!!err}
function friendly(e){
  var m=(e&&e.message)||String(e||"");
  if(/invalid login/i.test(m))return "That email and password don't match. Check them, or reset your password.";
  if(/already registered|already exists/i.test(m))return "There's already an account with that email. Sign in instead.";
  if(/email not confirmed/i.test(m))return "Confirm your email first. Check your inbox for the link.";
  if(/password should be|at least 6/i.test(m))return "The password needs at least 6 characters.";
  if(/rate limit|too many/i.test(m))return "Too many tries. Wait a minute and try again.";
  if(/fetch|network/i.test(m))return "Can't reach the server. Check your connection.";
  return m||"Something went wrong. Try again.";
}
gate.addEventListener("click",function(e){var b=e.target.closest("[data-m]");if(!b)return;var m=b.getAttribute("data-m");if(m==="cancel"){MODE="in";hideGate();return}MODE=m;say("");draw()});
gate.addEventListener("submit",async function(e){
  e.preventDefault();if(BUSY||!sb)return;
  var f=e.target,em=f.email?f.email.value.trim():"",pw=f.pw?f.pw.value:"";if(f.email)EMAIL=em;
  if(f.email&&!/^\S+@\S+\.\S+$/.test(em)){say("Enter a valid email address.",true);return draw()}
  if(f.pw&&pw.length<6){say("The password needs at least 6 characters.",true);return draw()}
  BUSY=true;say("");draw(false);
  try{
    if(MODE==="in"){var r=await sb.auth.signInWithPassword({email:em,password:pw});if(r.error)throw r.error}
    else if(MODE==="up"){
      var u=await sb.auth.signUp({email:em,password:pw,options:{emailRedirectTo:location.origin+location.pathname}});if(u.error)throw u.error;
      if(!u.data.session){MODE="in";say("Account created. Check your email for a confirmation link, then sign in.")}
    }else if(MODE==="reset"){
      var x=await sb.auth.resetPasswordForEmail(em,{redirectTo:location.origin+location.pathname});if(x.error)throw x.error;
      MODE="in";say("If there's an account for that email, a reset link is on its way.");
    }else if(MODE==="new"){
      var n=await sb.auth.updateUser({password:pw});if(n.error)throw n.error;
      MODE="in";say("");BUSY=false;hideGate();if(window.AETHER&&AETHER.toast)AETHER.toast("Password updated.");return;
    }
  }catch(err){say(friendly(err),true)}
  BUSY=false;if(!USER||MODE==="new")draw();
});
function showGate(){if(!gate.isConnected)document.body.appendChild(gate);document.documentElement.classList.add("auth-on");draw()}
function hideGate(){document.documentElement.classList.remove("auth-on");if(gate.isConnected)gate.remove()}

/* ---------- account button ---------- */
function accountUI(){
  if(!USER||document.getElementById("acct"))return;
  var r=document.querySelector(".hub-top-r");if(!r){setTimeout(accountUI,120);return}
  var em=USER.email||"",ini=(em[0]||"?").toUpperCase();
  r.insertAdjacentHTML("afterbegin",'<div class="acct" id="acct"><button type="button" class="hub-ibtn acct-b" aria-haspopup="true" aria-expanded="false" aria-label="Account" title="'+esc(em)+'">'+esc(ini)+'</button>'+
    '<div class="acct-m" hidden><p><small>Signed in as</small><b>'+esc(em)+'</b></p><button type="button" data-a="pw">Change password</button><button type="button" data-a="out" class="out">Sign out</button></div></div>');
  var box=document.getElementById("acct"),btn=box.querySelector(".acct-b"),menu=box.querySelector(".acct-m");
  btn.addEventListener("click",function(){var o=menu.hidden;menu.hidden=!o;btn.setAttribute("aria-expanded",String(o))});
  document.addEventListener("click",function(e){if(!box.contains(e.target)){menu.hidden=true;btn.setAttribute("aria-expanded","false")}});
  menu.addEventListener("click",async function(e){
    var a=e.target.closest("[data-a]");if(!a)return;
    if(a.getAttribute("data-a")==="pw"){MODE="new";say("");showGate();return}
    a.textContent="Signing out…";
    try{Object.keys(localStorage).forEach(function(k){if(/^aether/i.test(k))localStorage.removeItem(k)})}catch(_){}
    try{await sb.auth.signOut()}catch(_){}
    location.reload();
  });
}

/* ---------- storage interface ---------- */
var TABLE="gym_docs",BUCKET="gym-photos";
var listeners=[];/* {kind:"doc"|"col",path,cb,err} */
var cache={};/* path -> data, filled as docs are read and written */
function rel(p){return String(p).replace(/^\/+|\/+$/g,"")}
function parent(p){var i=p.lastIndexOf("/");return i<0?"":p.slice(0,i)}
function docSnap(path,data){return{id:path.split("/").pop(),exists:data!==undefined&&data!==null,data:function(){return data==null?undefined:JSON.parse(JSON.stringify(data))},metadata:{fromCache:false}}}
function colSnap(path){
  var docs=Object.keys(cache).filter(function(k){return parent(k)===path&&cache[k]!=null}).sort().map(function(k){return docSnap(k,cache[k])});
  return{docs:docs,size:docs.length,empty:!docs.length,metadata:{fromCache:false}};
}
function emit(path){
  listeners.forEach(function(l){
    try{if(l.kind==="doc"&&l.path===path)l.cb(docSnap(path,cache[path]));else if(l.kind==="col"&&l.path===parent(path))l.cb(colSnap(l.path))}catch(e){}
  });
}
async function fetchDoc(path){
  var r=await sb.from(TABLE).select("data").eq("user_id",USER.id).eq("path",path).maybeSingle();
  if(r.error)throw r.error;cache[path]=r.data?r.data.data:null;return cache[path];
}
async function fetchCol(path){
  var out=[],from=0,size=1000;
  for(;;){
    var r=await sb.from(TABLE).select("path,data").eq("user_id",USER.id).like("path",path.replace(/[%_]/g,"\\$&")+"/%").range(from,from+size-1);
    if(r.error)throw r.error;out=out.concat(r.data||[]);if(!r.data||r.data.length<size)break;from+=size;
  }
  Object.keys(cache).forEach(function(k){if(parent(k)===path)delete cache[k]});
  out.forEach(function(row){if(parent(row.path)===path)cache[row.path]=row.data});
}
async function refresh(l){
  try{if(l.kind==="doc"){await fetchDoc(l.path);l.cb(docSnap(l.path,cache[l.path]))}else{await fetchCol(l.path);l.cb(colSnap(l.path))}}
  catch(e){if(l.err)l.err(e)}
}
function refreshAll(){listeners.forEach(refresh)}
function DocRef(path){
  path=rel(path);
  return{id:path.split("/").pop(),path:path,
    get:async function(){await fetchDoc(path);return docSnap(path,cache[path])},
    set:async function(data){
      var clean=JSON.parse(JSON.stringify(data==null?{}:data));cache[path]=clean;emit(path);
      var r=await sb.from(TABLE).upsert({user_id:USER.id,path:path,data:clean,updated_at:new Date().toISOString()},{onConflict:"user_id,path"});
      if(r.error)throw r.error;
    },
    update:async function(part){var cur=cache[path]!==undefined?cache[path]:await fetchDoc(path);return this.set(Object.assign({},cur||{},part))},
    delete:async function(){cache[path]=null;emit(path);var r=await sb.from(TABLE).delete().eq("user_id",USER.id).eq("path",path);if(r.error)throw r.error},
    onSnapshot:function(cb,err){var l={kind:"doc",path:path,cb:cb,err:err};listeners.push(l);refresh(l);return function(){listeners=listeners.filter(function(x){return x!==l})}},
    collection:function(name){return ColRef(path+"/"+name)}
  };
}
function ColRef(path){
  path=rel(path);
  return{path:path,doc:function(id){return DocRef(path+"/"+id)},
    get:async function(){await fetchCol(path);return colSnap(path)},
    onSnapshot:function(cb,err){var l={kind:"col",path:path,cb:cb,err:err};listeners.push(l);refresh(l);return function(){listeners=listeners.filter(function(x){return x!==l})}}
  };
}
var DB={doc:DocRef,collection:ColRef};
/* other devices: pick up their changes when the app comes back to the front, and every couple of minutes */
document.addEventListener("visibilitychange",function(){if(document.visibilityState==="visible"&&USER)refreshAll()});
window.addEventListener("online",function(){if(USER)refreshAll()});
setInterval(function(){if(USER&&document.visibilityState==="visible")refreshAll()},120000);

/* photos: private bucket, shown through short-lived signed links */
var urls={},waiting={};
var PIXEL="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";
window.AETHER_PHOTO_URL=function(id){
  var u=urls[id];if(u&&u.until>Date.now())return u.url;
  if(!waiting[id]&&USER){waiting[id]=1;
    sb.storage.from(BUCKET).createSignedUrl(USER.id+"/"+id+".jpg",3600).then(function(r){
      delete waiting[id];if(r.data&&r.data.signedUrl){urls[id]={url:r.data.signedUrl,until:Date.now()+3300000};window.dispatchEvent(new Event("aether-photo"))}
    },function(){delete waiting[id]});
  }
  return u?u.url:PIXEL;
};
var ASSETS={
  upload:async function(blob,opt){
    var id=(Date.now().toString(36)+Math.random().toString(36).slice(2)+Math.random().toString(36).slice(2)).slice(0,24);
    var r=await sb.storage.from(BUCKET).upload(USER.id+"/"+id+".jpg",blob,{contentType:(opt&&opt.type)||"image/jpeg",upsert:false});
    if(r.error)throw r.error;return{id:id};
  },
  delete:async function(id){await sb.storage.from(BUCKET).remove([USER.id+"/"+id+".jpg"])}
};
var USERAPI={id:async function(){return USER.id},email:async function(){return USER.email}};
window.claude={use:async function(name){
  await READY;
  if(!USER)return null;
  if(name==="db")return DB;if(name==="user")return USERAPI;if(name==="assets")return ASSETS;
  return null;
}};

/* ---------- start ---------- */
function signedIn(u){
  var first=!USER;USER=u;
  if(first){readyRes();setTimeout(accountUI,0)}
  if(MODE!=="new")hideGate();
}
function boot(){
  if(!configured||!window.supabase){showGate();return}
  sb=window.supabase.createClient(CFG.supabaseUrl.replace(/\/$/,""),CFG.supabaseKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
  sb.auth.onAuthStateChange(function(ev,session){
    if(ev==="PASSWORD_RECOVERY"){MODE="new";say("");if(session&&session.user)USER=USER||session.user;showGate();return}
    if(session&&session.user){if(USER&&USER.id!==session.user.id){location.reload();return}signedIn(session.user)}
    else if(ev==="SIGNED_OUT"){location.reload()}
  });
  sb.auth.getSession().then(function(r){
    var s=r.data&&r.data.session;
    if(s&&s.user)signedIn(s.user);else if(!USER)showGate();
  },function(){showGate()});
}
if(document.body)boot();else document.addEventListener("DOMContentLoaded",boot);
})();
