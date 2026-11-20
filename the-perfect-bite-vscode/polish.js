/* polish.js — load AFTER mobile.js. Fill in CONFIG; blank fields are skipped. */
(()=>{
const CONFIG={
  open:'13:00',          // e.g. '11:00'  (24h, India time)
  close:'23:00',         // e.g. '23:00'  (past midnight is fine, e.g. '01:00')
  fssai:'12345678901234',         // e.g. '12345678901234'
  phone:'+917829515859'
};

// Favicon (no image file needed)
document.head.insertAdjacentHTML('beforeend','<link rel="icon" href="data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#211f1c"/><text x="32" y="43" font-size="30" font-weight="800" text-anchor="middle" fill="#fff" font-family="Georgia,serif">PB</text></svg>')+'">');
document.head.insertAdjacentHTML('beforeend','<style>.cart-line .cl-price{color:var(--ink);font-weight:700;font-size:14px}.open-badge{font-weight:700;color:var(--ink)}.open-badge.closed .dot{background:#b3261e}</style>');

// Open-now badge
const hm=s=>{const[a,b]=s.split(':').map(Number);return a*60+(b||0)};
const fmt=s=>{const[h,m]=s.split(':').map(Number);return(h%12||12)+(m?':'+String(m).padStart(2,'0'):'')+(h<12?' am':' pm')};
if(CONFIG.open&&CONFIG.close){
  const ist=new Date(new Date().toLocaleString('en-US',{timeZone:'Asia/Kolkata'}));
  const m=ist.getHours()*60+ist.getMinutes(),o=hm(CONFIG.open),c=hm(CONFIG.close);
  const isOpen=o<c?(m>=o&&m<c):(m>=o||m<c);
  const txt=isOpen?`Open now · until ${fmt(CONFIG.close)}`:`Closed · opens ${fmt(CONFIG.open)}`;
  const note=document.querySelector('.hero-note');
  if(note)note.insertAdjacentHTML('beforebegin',`<div class="hero-note open-badge${isOpen?'':' closed'}"><span class="dot"></span>${txt}</div>`);
  const vs=document.querySelector('.visit-card span');
  if(vs)vs.textContent=`${txt} · Pickup & delivery enquiries`;
}

// FSSAI line in footer
if(CONFIG.fssai){document.querySelector('footer p')?.insertAdjacentHTML('beforeend',`<br>FSSAI Lic. No. ${CONFIG.fssai}`)}

// Simpler cart lines: name, extras, line total
const rc=renderCart;
renderCart=()=>{
  rc();
  if(!cart.length)return;
  $('#cartItems').innerHTML=cart.map(l=>{
    const x=menu[l.productId],ex=l.extras.map(e=>e.name).join(', '),unit=x.price+l.extras.reduce((a,e)=>a+e.price,0);
    return `<div class="cart-line"><div><strong>${x.name}</strong>${ex?`<small>+ ${ex}</small>`:''}<small class="cl-price">${l.qty>1?`${l.qty} × ${money(unit)} = `:''}${money(lineTotal(l))}</small></div><div class="qty-control"><button data-minus-line="${l.lineId}" aria-label="Remove one ${x.name}">−</button><span>${l.qty}</span><button data-plus-line="${l.lineId}" aria-label="Add one ${x.name}">+</button></div></div>`;
  }).join('');
  document.querySelectorAll('[data-plus-line]').forEach(b=>b.onclick=()=>{const l=cart.find(x=>x.lineId===+b.dataset.plusLine);if(l)l.qty++;renderCart();renderMenu()});
  document.querySelectorAll('[data-minus-line]').forEach(b=>b.onclick=()=>{const i=cart.findIndex(x=>x.lineId===+b.dataset.minusLine);if(i>=0&&--cart[i].qty<=0)cart.splice(i,1);renderCart();renderMenu()});
};

// Local-business structured data for Google
const ld={'@context':'https://schema.org','@type':'Restaurant',name:'The Perfect Bite',servesCuisine:['Fast food','Indian street food'],telephone:CONFIG.phone,
  address:{'@type':'PostalAddress',streetAddress:'Shampur Main Road',addressLocality:'Bengaluru',addressRegion:'Karnataka',addressCountry:'IN'}};
if(CONFIG.open&&CONFIG.close)ld.openingHours=`Mo-Su ${CONFIG.open}-${CONFIG.close}`;
const s=document.createElement('script');s.type='application/ld+json';s.textContent=JSON.stringify(ld);document.head.appendChild(s);

renderCart();
})();
