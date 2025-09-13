// app.js - plain JavaScript

// Wait for DOM to fully load before running
document.addEventListener('DOMContentLoaded', () => {

  // Select the container
  const cardsWrap = document.getElementById('cardsWrap');

  // Function to render plans
  function renderPlans(plans) {
    cardsWrap.innerHTML = ''; // Clear existing cards

    plans.forEach(plan => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <h3 class="plan-name">${plan.name}</h3>
        <p class="plan-price">₹${plan.price} / month</p>
        <p class="plan-speed">Speed: ${plan.speed}</p>
        <p class="plan-quota">Quota: ${plan.quota}</p>
        <div class="card-actions">
          <button type="button" class="btn subscribe-btn">Subscribe</button>
          <button type="button" class="btn ghost details-btn">Details</button>
        </div>
      `;
      cardsWrap.appendChild(card);
    });
  }

  
});


// ---------- Sample Plan Data (replace with API fetch in real app) ----------
const PLANS = [
  { id: "p1", name: "Fibernet Basic", type: "Fibernet", speed: 100, quota: 200, price: 499, popularity: 80, discount: 0 },
  { id: "p2", name: "Fibernet Plus", type: "Fibernet", speed: 300, quota: 500, price: 899, popularity: 150, discount: 10 },
  { id: "p3", name: "Fibernet Ultra", type: "Fibernet", speed: 1000, quota: 2000, price: 1999, popularity: 60, discount: 15 },
  { id: "p4", name: "Copper Starter", type: "Copper", speed: 50, quota: 100, price: 299, popularity: 30, discount: 0 },
  { id: "p5", name: "Student OTT Pack", type: "OTT", speed: 0, quota: 0, price: 149, popularity: 120, discount: 25 },
  { id: "p6", name: "Gaming Turbo", type: "Fibernet", speed: 500, quota: 1000, price: 1299, popularity: 110, discount: 5 }
];

// ---------- Helpers ----------
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

const cardsWrap = $('#cardsWrap');
const searchInput = $('#search');
const sortSelect = $('#sort');
const applyBtn = $('#applyFilters');
const resetBtn = $('#resetFilters');
const emptyMessage = $('#emptyMessage');

let data = [...PLANS]; // working copy

// ---------- Render card ----------
function createCard(plan){
  const card = document.createElement('article');
  card.className = 'plan-card';
  card.dataset.id = plan.id;
  card.innerHTML = `
    ${plan.discount? `<div class="ribbon">${plan.discount}% OFF</div>` : ''}
    <div class="plan-top">
      <div>
        <div class="plan-name">${plan.name}</div>
        <div class="plan-meta">${plan.type} • ${plan.speed ? plan.speed + ' Mbps' : 'Service'}</div>
      </div>
      <div class="badge">${plan.popularity}★</div>
    </div>

    <div>
      <div class="plan-hero">${plan.speed ? plan.speed : ''}<span class="small">${plan.speed? ' Mbps':''}</span></div>
      <div class="small">Quota: ${plan.quota ? plan.quota + ' GB' : 'N/A'}</div>

      <div class="plan-features">
        <div class="feature"><span>Monthly</span><strong>₹${plan.price}</strong></div>
        <div class="feature"><span>Type</span><span class="small">${plan.type}</span></div>
      </div>
    </div>

    <div class="plan-actions">
      <button class="btn-sub">Subscribe</button>
      <button class="btn-ghost">Details</button>
    </div>
  `;

  // add mouse tilt effect (3D)
  card.addEventListener('pointermove', (ev) => {
    const r = card.getBoundingClientRect();
    const cx = r.left + r.width/2;
    const cy = r.top + r.height/2;
    const dx = ev.clientX - cx;
    const dy = ev.clientY - cy;
    const rx = (-dy / r.height) * 12;
    const ry = (dx / r.width) * 12;
    card.style.transform = `translateY(-6px) scale(1.02) rotateX(${rx}deg) rotateY(${ry}deg)`;
  });
  card.addEventListener('pointerleave', () => {
    card.style.transform = '';
  });

  // subscription btn
  card.querySelector('.btn-sub').addEventListener('click', () => {
    alert(`Subscribed to "${plan.name}" — demo flow`);
  });

  return card;
}

// ---------- render list ----------
function render(plans){
  cardsWrap.innerHTML = '';
  if(!plans.length){
    emptyMessage.hidden = false;
    return;
  } else emptyMessage.hidden = true;

  plans.forEach(plan => {
    const c = createCard(plan);
    cardsWrap.appendChild(c);
  });

  // add intersection observer for reveal animations
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if(e.isIntersecting) {
        e.target.classList.add('revealed');
        observer.unobserve(e.target);
      }
    });
  }, {threshold:0.18});
  $$('.plan-card').forEach(card => observer.observe(card));

  // make card container draggable horizontally (mouse/touch)
  makeDragScrollable(cardsWrap);
}

// ---------- Filtering logic ----------
function getFilters(){
  const minPrice = Number($('#minPrice').value) || 0;
  const maxPrice = Number($('#maxPrice').value) || 99999;
  const speeds = $$('input[name="speed"]:checked').map(i => i.value);
  const types = $$('input[name="type"]:checked').map(i => i.value);
  const onlyDiscount = $('#onlyDiscount').checked;
  const search = searchInput.value.trim().toLowerCase();
  return {minPrice, maxPrice, speeds, types, onlyDiscount, search};
}

function applyFilters(){
  const f = getFilters();
  let out = data.filter(p => p.price >= f.minPrice && p.price <= f.maxPrice);
  if(f.speeds.length){
    out = out.filter(p => f.speeds.some(range => {
      const [a,b] = range.split('-').map(Number);
      return (p.speed || 0) >= a && (p.speed || 0) <= b;
    }));
  }
  if(f.types.length){
    out = out.filter(p => f.types.includes(p.type));
  }
  if(f.onlyDiscount){
    out = out.filter(p => p.discount && p.discount > 0);
  }
  if(f.search){
    out = out.filter(p => p.name.toLowerCase().includes(f.search) || p.type.toLowerCase().includes(f.search));
  }

  // sorting
  const sort = sortSelect.value;
  if(sort === 'price-asc') out.sort((a,b)=>a.price-b.price);
  else if(sort === 'price-desc') out.sort((a,b)=>b.price-a.price);
  else if(sort === 'speed-desc') out.sort((a,b)=> (b.speed||0)-(a.speed||0));
  else if(sort === 'popular') out.sort((a,b)=>b.popularity-a.popularity);

  render(out);
}

// ---------- Drag scroll helper ----------
function makeDragScrollable(el){
  let isDown=false, startX, scrollLeft;
  el.style.cursor = 'grab';
  el.addEventListener('pointerdown', (e) => {
    isDown = true;
    el.setPointerCapture(e.pointerId);
    startX = e.clientX;
    scrollLeft = el.scrollLeft;
    el.style.cursor = 'grabbing';
  });
  el.addEventListener('pointerup', (e) => {
    isDown = false;
    el.releasePointerCapture(e.pointerId);
    el.style.cursor = 'grab';
  });
  el.addEventListener('pointermove', (e) => {
    if(!isDown) return;
    const dx = e.clientX - startX;
    el.scrollLeft = scrollLeft - dx;
  });
  // prevent accidental text selection
  el.addEventListener('dragstart', (e)=> e.preventDefault());
}

// ---------- Reset filters ----------
function resetFilters(){
  $('#minPrice').value = 0;
  $('#maxPrice').value = 2000;
  $$('input[name="speed"]').forEach(i => i.checked=false);
  $$('input[name="type"]').forEach(i => i.checked=false);
  $('#onlyDiscount').checked = false;
  searchInput.value = '';
  sortSelect.value = 'popular';
  applyFilters();
}

// ---------- Wire up UI events ----------
applyBtn.addEventListener('click', applyFilters);
resetBtn.addEventListener('click', resetFilters);
searchInput.addEventListener('input', () => {
  // live search
  // small debounce
  clearTimeout(window._searchDeb);
  window._searchDeb = setTimeout(applyFilters, 250);
});
sortSelect.addEventListener('change', applyFilters);

// ---------- initial render ----------
render(data);
