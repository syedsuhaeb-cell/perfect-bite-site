/* mobile.js — load AFTER app.js. Overrides app.js functions; menu data stays in app.js. */
(()=>{
const $$=s=>document.querySelectorAll(s),panel=$('#cartPanel');
let lastFocus=null;

// Veg / non-veg flag (heuristic — please verify against your real menu)
menu.forEach(x=>x.veg=!/chicken|egg|zinger|alfaham|sheekh/i.test(x.name+' '+x.description));

// Category chips: update in place so the row doesn't jump back to "All"
renderCategories=()=>{
  $('#categories').innerHTML=categories.map(c=>`<button class="category-btn${c===active?' active':''}" data-cat="${c}" aria-pressed="${c===active}">${c}</button>`).join('');
  $$('[data-cat]').forEach(b=>b.onclick=()=>{
    active=b.dataset.cat;
    $$('[data-cat]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',x===b)});
    b.scrollIntoView({inline:'center',block:'nearest',behavior:'smooth'});
    renderMenu();
  });
};

// List-row cards with veg marker and inline stepper
const cardHtml=x=>{
  const n=itemQty(x.id),pz=isPizza(x);
  const ctl=(!pz&&n)
    ?`<div class="qty-control"><button data-act="dec" data-id="${x.id}" aria-label="Remove one ${x.name}">−</button><span>${n}</span><button data-act="inc" data-id="${x.id}" aria-label="Add one ${x.name}">+</button></div>`
    :`<button class="add-btn" data-act="add" data-id="${x.id}" aria-label="${pz?'Choose extras and add':'Add'} ${x.name}">${pz?'Choose & add':'Add'}</button>`;
  return `<article class="menu-card"><div class="item-info"><span class="veg ${x.veg?'v':'nv'}" role="img" aria-label="${x.veg?'Vegetarian':'Non-vegetarian'}"></span><div class="item-name">${x.name}</div>${x.description?`<p class="item-desc">${x.description}</p>`:''}<div class="item-price">${money(x.price)}</div></div><div class="item-action">${ctl}${pz&&n?`<span class="item-in-cart">${n} in cart</span>`:''}</div></article>`;
};
renderMenu=()=>{
  const s=$('#search').value.trim().toLowerCase();
  const rows=menu.filter(x=>(active==='All'||x.category===active)&&`${x.name} ${x.category} ${x.description}`.toLowerCase().includes(s));
  $('#resultCount').textContent=`${rows.length} items`;
  $('#menuGrid').innerHTML=rows.length?rows.map(cardHtml).join(''):'<p>No matching dishes. Try another search.</p>';
};
$('#menuGrid').addEventListener('click',e=>{
  const b=e.target.closest('[data-act]');if(!b)return;
  const item=menu[+b.dataset.id],a=b.dataset.act;
  if(a==='add'){isPizza(item)?openExtras(item):addLine(item,[])}
  else if(a==='inc')addLine(item,[]);
  else{const i=cart.findIndex(l=>l.productId===item.id&&!l.extras.length);if(i>=0){if(--cart[i].qty<=0)cart.splice(i,1);renderMenu();renderCart()}}
  const f=n=>$(`#menuGrid [data-act="${n}"][data-id="${item.id}"]`);
  (f(a)||f('inc')||f('add'))?.focus();   // keep focus after re-render
});

// Cart open/close: scroll lock, inert when closed, focus handling
const open=()=>{document.body.classList.add('cart-open');panel.removeAttribute('inert');panel.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';lastFocus=document.activeElement;$('#closeCart').focus()};
const close=()=>{if(!document.body.classList.contains('cart-open'))return;document.body.classList.remove('cart-open');panel.setAttribute('inert','');panel.setAttribute('aria-hidden','true');document.body.style.overflow='';lastFocus?.focus?.()};
openCart=open;closeCart=close;
$('#openCart').onclick=open;$('#closeCart').onclick=close;$('#cartBackdrop').onclick=close;
document.addEventListener('keydown',e=>{if(e.key!=='Escape')return;close();if($('#extrasModal').classList.contains('show'))closeExtras()});

// Extras: hide the unpriced soft-drink row, focus first option
const oe=openExtras;
openExtras=i=>{oe(i);$$('.extra-unpriced').forEach(e=>e.remove());$('#extrasOptions input')?.focus()};

// Bottom cart bar + live checkout total + cart persistence
document.body.insertAdjacentHTML('beforeend','<button class="cart-bar" id="cartBar" type="button"><span id="cartBarText"></span><span>View order ›</span></button>');
const bar=$('#cartBar');bar.onclick=open;
const rc=renderCart;
renderCart=()=>{
  rc();
  const n=cart.reduce((a,x)=>a+x.qty,0),t=cart.reduce((a,x)=>a+lineTotal(x),0);
  bar.classList.toggle('show',n>0);
  $('#cartBarText').textContent=`${n} item${n===1?'':'s'} · ${money(t)}`;
  $('#checkout').textContent=n?`Order on WhatsApp · ${money(t)}`:'Continue on WhatsApp';
  try{localStorage.setItem('pb-cart',JSON.stringify({cart}))}catch(e){}
};
try{
  const s=JSON.parse(localStorage.getItem('pb-cart'));
  if(s&&Array.isArray(s.cart)){cart=s.cart.filter(l=>menu[l.productId]&&Array.isArray(l.extras));nextLineId=Math.max(0,...cart.map(l=>l.lineId))+1}
}catch(e){}

// WhatsApp: navigate in the same tab (no stale blank tab left behind)
const co=$('#checkout').onclick;
$('#checkout').onclick=e=>{const o=window.open;window.open=u=>{location.href=u};try{co.call($('#checkout'),e)}finally{window.open=o}};

renderCategories();renderMenu();renderCart();
})();
