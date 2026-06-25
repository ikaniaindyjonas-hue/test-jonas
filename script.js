// ── DONNÉES ──
const products = [
  {id:1,name:"Robe Lin Naturel",price:7000,cat:"robes",colors:["#E0CEC0","#8C6B5A","#3D2B22"],img:"https://images.unsplash.com/photo-1572804013427-4d7ca7268217?w=400&q=80",badge:"new"},
  {id:2,name:"Chemise Douce",price:4000,cat:"hauts",colors:["#fff","#E8D5C8"],img:"https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=400&q=80"},
  {id:3,name:"Pantalon Fluide",price:10000,cat:"pantalons",colors:["#D4C8B0","#8C7A60"],img:"https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&q=80",badge:"sale",oldPrice:15000},
  {id:4,name:"Veste Caramel",price:100000,cat:"vestes",colors:["#C9A070","#7A5838"],img:"https://images.unsplash.com/photo-1551163943-3f6a855d1153?w=400&q=80"},
  {id:5,name:"Robe Crème",price:8000,cat:"robes",colors:["#F5EDE8","#C9A898"],img:"https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=400&q=80",badge:"new"},
  {id:6,name:"Top Brassière",price:3000,cat:"hauts",colors:["#E8D5C8","#3D2B22"],img:"https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=400&q=80"},
];

let cart = [];
let wishlist = new Set();
let currentCat = 'all';

// ── ZOOM ──
function openZoom(imgSrc) {
  document.getElementById('zoom-img').src = imgSrc;
  document.getElementById('zoom-modal').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeZoom() {
  document.getElementById('zoom-modal').classList.remove('open');
  document.body.style.overflow = 'auto';
}

// ── NAVIGATION ──
function goTo(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.bi').forEach(b => b.classList.remove('on'));
  document.getElementById('page-' + page).classList.add('active');
  document.getElementById('bi-' + page)?.classList.add('on');
  window.scrollTo(0,0);
  if (page === 'favoris') renderWishlist();
  if (page === 'boutique') renderProducts(currentCat);
}

// ── RENDU CARTE ──
function cardHTML(p) {
  const wished = wishlist.has(p.id);
  return `
    <div class="card" data-id="${p.id}">
      <div class="card-img">
        <img src="${p.img}" alt="${p.name}" loading="lazy" onclick="openZoom(this.src)" style="cursor:zoom-in"/>
        ${p.badge==='new'?'<span class="badge badge-new">Nouveau</span>':p.badge==='sale'?'<span class="badge badge-sale">Soldes</span>':''}
        <button class="wish" onclick="toggleWish(event,${p.id})" aria-label="Favoris">
          <svg viewBox="0 0 24 24">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"
              style="${wished?'fill:var(--terre);stroke:var(--terre)':''}"/>
          </svg>
        </button>
      </div>
      <div class="card-body">
        <p class="card-name">${p.name}</p>
        <div class="card-foot">
          <div>
            ${p.oldPrice?`<span class="price-old">${p.oldPrice} FCFA</span>`:''}
            <span class="price">${p.price} FCFA</span>
          </div>
          <div style="display:flex;align-items:center;gap:.5rem;">
            <div class="dots">${p.colors.map(c=>`<div class="dot" style="background:${c}"></div>`).join('')}</div>
            <button class="card-add" onclick="addToCart(${p.id})" aria-label="Ajouter au panier">
              <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>`;
}

// ── BOUTIQUE ──
function renderProducts(cat='all') {
  currentCat = cat;
  const list = cat==='all' ? products : products.filter(p=>p.cat===cat);
  document.getElementById('product-grid').innerHTML = list.map(cardHTML).join('');
}

document.querySelectorAll('.cat').forEach(b=>{
  b.addEventListener('click',()=>{
    document.querySelectorAll('.cat').forEach(c=>c.classList.remove('on'));
    b.classList.add('on');
    renderProducts(b.dataset.cat);
  });
});

// ── CLOSE ZOOM ON ESC ──
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeZoom();
});

// ── FAVORIS ──
function renderWishlist() {
  const grid = document.getElementById('wishlist-grid');
  const empty = document.getElementById('wishlist-empty');
  if (!wishlist.size) {
    grid.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';
  const list = products.filter(p => wishlist.has(p.id));
  grid.innerHTML = list.map(cardHTML).join('');
}

function toggleWish(e, id) {
  e.stopPropagation();
  if (wishlist.has(id)) {
    wishlist.delete(id);
    showToast('Retiré des favoris');
  } else {
    wishlist.add(id);
    showToast('♡ Ajouté aux favoris');
  }
  // re-render la page courante
  const activePage = document.querySelector('.page.active').id;
  if (activePage === 'page-boutique') renderProducts(currentCat);
  if (activePage === 'page-favoris') renderWishlist();
  // badge favoris
  document.querySelector('#bi-favoris svg path').style.cssText =
    wishlist.size ? 'fill:var(--terre);stroke:var(--terre)' : '';
}

// ── PANIER ──
function addToCart(id) {
  const p = products.find(x=>x.id===id);
  const ex = cart.find(x=>x.id===id);
  if (ex) ex.qty++; else cart.push({...p, qty:1});
  updateCartUI();
  showToast('✓ Ajouté au panier');
}
function changeQty(id, d) {
  const i = cart.findIndex(x=>x.id===id);
  if (i===-1) return;
  cart[i].qty += d;
  if (cart[i].qty <= 0) cart.splice(i,1);
  updateCartUI();
}
function updateCartUI() {
  const count = cart.reduce((s,i)=>s+i.qty,0);
  document.getElementById('bnav-count').textContent = count;
  const total = cart.reduce((s,i)=>s+i.price*i.qty,0);
  document.getElementById('cart-total').textContent = total+' FCFA';
  const el = document.getElementById('cart-items');
  if (!cart.length) {
    el.innerHTML='<p style="color:var(--gris);font-size:.75rem;padding:1rem 0;">Votre panier est vide.</p>';
    return;
  }
  el.innerHTML = cart.map(item=>`
    <div class="cart-item">
      <img src="${item.img}" alt="${item.name}"/>
      <div class="ci-info">
        <p class="ci-name">${item.name}</p>
        <p class="ci-price">${item.price} FCFA</p>
        <div class="ci-qty">
          <button onclick="changeQty(${item.id},-1)">−</button>
          <span>${item.qty}</span>
          <button onclick="changeQty(${item.id},1)">+</button>
        </div>
      </div>
    </div>`).join('');
}

// ── DRAWER ──
function openDrawer() {
  document.getElementById('drawer').classList.add('open');
  document.getElementById('drawer-bg').classList.add('open');
}
function closeDrawer() {
  document.getElementById('drawer').classList.remove('open');
  document.getElementById('drawer-bg').classList.remove('open');
}
document.getElementById('bi-panier').addEventListener('click', openDrawer);
document.getElementById('drawer-bg').addEventListener('click', closeDrawer);

function checkout() {
  if (!cart.length) {
    showToast('Votre panier est vide.');
    return;
  }
  const total = cart.reduce((s,i)=>s+i.price*i.qty,0);
  const itemsList = cart.map(item => `${item.qty} x ${item.name}`).join('\n');
  const message = `Bonjour, je souhaite commander :\n${itemsList}\n\nTotal : ${total} FCFA`;
  const url = `https://wa.me/241062999231?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
}

// ── TOAST ──
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'), 2000);
}

// ── NEWSLETTER ──
function handleNl() {
  const v = document.getElementById('nl-input').value;
  if (!v || !v.includes('@')) { showToast('⚠ Email invalide'); return; }
  document.getElementById('nl-input').value = '';
  showToast('✓ Inscription confirmée !');
}

// ── INIT ──
renderProducts();
updateCartUI();
