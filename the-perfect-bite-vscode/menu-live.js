/* menu-live.js — load LAST (after polish.js).
   Order in index.html: app.js, mobile.js, polish.js, menu-live.js
   Leave both URLs blank and the site simply keeps using the menu baked into app.js. */
(()=>{
const CONFIG={
  MENU_CSV_URL:'https://docs.google.com/spreadsheets/d/e/2PACX-1vS66ru3cuU6NfyUowNB717uxbVflhfp_C3Voi583XFLXZVmvCJg6C1fgqy115FED8n_nhMqqPQzDrgg/pub?gid=299207458&single=true&output=csv',      // Google Sheet → File → Share → Publish to web → "menu" tab → CSV → paste link
  SETTINGS_CSV_URL:'https://docs.google.com/spreadsheets/d/e/2PACX-1vS66ru3cuU6NfyUowNB717uxbVflhfp_C3Voi583XFLXZVmvCJg6C1fgqy115FED8n_nhMqqPQzDrgg/pub?gid=1201451541&single=true&output=csv',  // optional: same for the "settings" tab
  REFRESH_MIN:5         // re-check when the tab becomes visible after this many minutes
};

const slug=s=>s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
const yes=v=>/^(y|yes|true|1)$/i.test((v||'').trim());
const no=v=>/^(n|no|false|0)$/i.test((v||'').trim());
const clean=s=>(s||'').replace(/[<>]/g,'').replace(/"/g,"'").trim();

document.head.insertAdjacentHTML('beforeend','<style>.notice{background:#211f1c;color:#fff;text-align:center;font-size:14px;line-height:1.4;padding:10px 16px}.is-soldout{opacity:.65}.soldout{font-size:13px;font-weight:700;color:#6f6962}.pop-tag{display:inline-block;font-size:11px;font-weight:700;color:#c2410c;margin-left:8px;vertical-align:1px;white-space:nowrap}</style>');

/* ---------- CSV ---------- */
function parseCSV(t){const rows=[];let r=[],f='',q=false;for(let i=0;i<t.length;i++){const c=t[i];if(q){if(c==='"'){if(t[i+1]==='"'){f+='"';i++}else q=false}else f+=c}else if(c==='"')q=true;else if(c===','){r.push(f);f=''}else if(c==='\n'||c==='\r'){if(c==='\r'&&t[i+1]==='\n')i++;r.push(f);f='';rows.push(r);r=[]}else f+=c}if(f||r.length){r.push(f);rows.push(r)}return rows.filter(x=>x.some(c=>c.trim()))}
function toObjects(t){const[h,...rest]=parseCSV(t.replace(/^\uFEFF/,''));const k=h.map(x=>x.trim().toLowerCase());return rest.map(r=>Object.fromEntries(k.map((n,i)=>[n,(r[i]||'').trim()])))}

/* ---------- stable ids + cart persistence by id (not array position) ---------- */
menu.forEach(x=>{x.sid=slug(x.name);if(x.available===undefined)x.available=true});

function rebuild(lines){
  let dropped=false;const out=[];
  for(const l of lines){
    const i=menu.findIndex(m=>m.sid===l.sid);
    if(i<0||!menu[i].available){dropped=true;continue}
    out.push({lineId:nextLineId++,productId:i,qty:l.qty,extras:l.extras.map(id=>pizzaExtras.find(p=>p.id===id)).filter(Boolean)});
  }
  cart=out;return dropped;
}
const save=()=>{try{localStorage.setItem('pb-cart2',JSON.stringify({lines:cart.map(l=>({sid:menu[l.productId]?.sid,qty:l.qty,extras:l.extras.map(e=>e.id)})).filter(l=>l.sid)}))}catch(e){}};
const rc=renderCart;renderCart=()=>{rc();save()};
try{const s=JSON.parse(localStorage.getItem('pb-cart2'));if(s&&Array.isArray(s.lines))rebuild(s.lines)}catch(e){}

/* ---------- sold-out + popular badges ---------- */
const rm=renderMenu;
renderMenu=()=>{rm();document.querySelectorAll('#menuGrid .menu-card').forEach(card=>{
  const b=card.querySelector('[data-id]'),x=b&&menu[+b.dataset.id];if(!x)return;
  if(x.popular)card.querySelector('.item-name')?.insertAdjacentHTML('beforeend','<span class="pop-tag">★ Popular</span>');
  if(!x.available){card.classList.add('is-soldout');const a=card.querySelector('.item-action');if(a)a.innerHTML='<span class="soldout">Sold out today</span>'}
})};

/* ---------- apply sheet data ---------- */
function applyMenu(txt){
  const seen=new Set();
  const items=toObjects(txt).map(r=>({sid:slug(r.id||r.name||''),category:clean(r.category).replace(/&amp;/g,'&'),name:clean(r.name),price:Number(r.price),description:clean(r.description),veg:yes(r.veg),available:!no(r.available),popular:yes(r.popular),sort:Number(r.sort)||0}))
    .filter(x=>x.sid&&x.name&&x.category&&Number.isFinite(x.price)&&x.price>0&&!seen.has(x.sid)&&seen.add(x.sid));
  if(items.length<10){console.warn('Menu sheet ignored: fewer than 10 valid rows');return false}
  items.sort((a,b)=>a.sort-b.sort);
  const prev=Object.fromEntries(menu.map(m=>[m.sid,m.price]));
  const lines=cart.map(l=>({sid:menu[l.productId]?.sid,qty:l.qty,extras:l.extras.map(e=>e.id)}));
  menu.length=0;items.forEach((x,i)=>menu.push({id:i,...x}));
  categories.length=0;categories.push('All',...new Set(menu.map(x=>x.category)));
  if(!categories.includes(active))active='All';
  const dropped=rebuild(lines);
  const repriced=lines.some(l=>prev[l.sid]!==undefined&&menu.find(m=>m.sid===l.sid)?.price!==prev[l.sid]);
  renderCategories();renderMenu();renderCart();
  if(dropped)toast('Some items are no longer available');else if(repriced)toast('Some prices were updated');
  return true;
}
function applySettings(txt){
  const kv=Object.fromEntries(toObjects(txt).map(r=>[(r.key||'').toLowerCase(),r.value||'']));
  pizzaExtras.forEach(e=>{const v=kv['extra_'+e.id];if(v!==undefined&&v!==''&&Number.isFinite(Number(v))&&Number(v)>=0)e.price=Number(v)});
  let n=document.getElementById('notice');const msg=clean(kv.notice);
  if(msg){if(!n){n=document.createElement('div');n.id='notice';n.className='notice';n.setAttribute('role','status');document.body.prepend(n)}n.textContent=msg}else if(n)n.remove();
  renderCart();
}

/* ---------- fetch with timeout, cache, fallback ---------- */
async function get(url,key){
  try{
    const c=new AbortController(),t=setTimeout(()=>c.abort(),7000);
    const r=await fetch(url,{cache:'no-store',signal:c.signal});clearTimeout(t);
    if(!r.ok)throw new Error(r.status);
    const txt=await r.text();
    try{localStorage.setItem(key,txt)}catch(e){}
    return txt;
  }catch(e){console.warn('Sheet fetch failed, using cached copy',e);try{return localStorage.getItem(key)}catch(_){return null}}
}
const applied={};
async function refresh(){
  last=Date.now();
  for(const[url,key,fn]of[[CONFIG.SETTINGS_CSV_URL,'pb-settings-csv',applySettings],[CONFIG.MENU_CSV_URL,'pb-menu-csv',applyMenu]]){
    if(!url)continue;
    const t=await get(url,key);
    if(t&&t!==applied[key]){try{if(fn(t)!==false)applied[key]=t}catch(e){console.warn(e)}}
  }
}
let last=0;

// Show last known sheet data instantly, then update from the network
for(const[url,key,fn]of[[CONFIG.SETTINGS_CSV_URL,'pb-settings-csv',applySettings],[CONFIG.MENU_CSV_URL,'pb-menu-csv',applyMenu]]){
  if(!url)continue;
  try{const c=localStorage.getItem(key);if(c&&fn(c)!==false)applied[key]=c}catch(e){}
}
renderMenu();renderCart();
if(CONFIG.MENU_CSV_URL||CONFIG.SETTINGS_CSV_URL){
  refresh();
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&Date.now()-last>CONFIG.REFRESH_MIN*60000)refresh()});
}
})();
