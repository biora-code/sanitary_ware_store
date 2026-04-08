const PRODUCTS = 
[
  {
    id: 1,
    name: "Tile White 120x280",
    nameAl: "Pllakë 120x280",
    tag: "tiles",
    sub: "120x280",
    subAl: "120x280",
    image: "images/tiles/120x280/detria_multi_gloss_120x280_cm.jpg"
  },
  {
    id: 2,
    name: "Put a title",
    nameAl: "Pllakë 120x280",
    tag: "tiles",
    sub: "120x120",
    subAl: "120x120",
    image: "images/tiles/120x120/Golden-Carbom-Lux-120x120-Gardenia-Marmoteca_1024x1024.webp"
  },
    {
    id: 3,
    name: "Put a title",
    nameAl: "Ploteso me titull",
    tag: "accessories",
    sub: "all categories",
    subAl: "te gjitha",
    image: "images/Accessories/Accessories/A21390ACR.jpg"
  },
      {
    id: 4,
    name: "Put a title",
    nameAl: "Pllakë 120x280",
    tag: "laminate",
    sub: "All Categories",
    subAl: "te gjitha",
    image: "images/tiles/120x120/Golden-Carbom-Lux-120x120-Gardenia-Marmoteca_1024x1024.webp"
  }

];

const CATEGORIES = {
  tiles: {
    label: "Tiles",
    subs: ["120x280", "60x60", "30x60"]
  },
  laminate: {
    label: "Laminate",
    subs: ["8mm", "10mm"]
  },
  accessories: {
    label: "Accessories",
    subs: ["All Categories"]
  }
};


function buildMenu() {
  const map = {};

  PRODUCTS.forEach(p => {
    if (!map[p.tag]) map[p.tag] = new Set();
    map[p.tag].add(p.sub);
  });

  return map;
}

// ── LANGUAGE SWITCH ──
function setLang(lang) {
  document.getElementById('en').style.display = lang === 'en' ? 'block' : 'none';
  document.getElementById('sq').style.display = lang === 'sq' ? 'block' : 'none';
  document.documentElement.lang = lang;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── HELPER ──
function getProd(id) {
  return PRODUCTS.find(p => p.id === id) || PRODUCTS[0];
}

// ── SEARCH STATE ──
let searchFocused = { en: false, sq: false };
let searchIdx = { en: -1, sq: -1 };
let searchResults = { en: [], sq: [] };

// ── HIGHLIGHT ──
function hl(text, q) {
  if (!q) return text;
  return text.replace(
    new RegExp('(' + q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi'),
    '<mark>$1</mark>'
  );
}

// ── MAIN PRODUCT RENDER ──
function renderProducts(products, lang) {
console.log(products)
  const container = document.getElementById(lang + '-cat-grid');
  if (!container) return;

  container.innerHTML = products.map(p => `
    <div class="product-card" onclick="showPage('${lang}','product',${p.id})">
      <img src="${p.image || ''}" alt="${p.name}">
      <div class="product-info">
        <div class="product-name">${lang === 'sq' ? p.nameAl : p.name}</div>
      </div>
    </div>
  `).join('');

}

// ── SHOW CATEGORY (EXPLORE) ──
function showCat(lang, catKey) {
  const filtered = PRODUCTS.filter(p => p.tag === catKey);

  showPage(lang, 'cat', {
    key: catKey,
    products: filtered
  });
}

// ── ✅ NEW: SHOW SUBCATEGORY ──
function showSubCat(lang, catKey, subName) {
  const cleanSub = subName.trim().toLowerCase();

  const filtered = PRODUCTS.filter(p => {
    const productSub = (lang === 'sq' ? p.subAl : p.sub)
      .trim()
      .toLowerCase();

    return p.tag === catKey && productSub === cleanSub;
  });

  console.log("FILTERED:", filtered);

  showPage(lang, 'cat', {
    key: catKey,
    sub: subName,
    products: filtered
  });
}

// ── PAGE NAVIGATION ──
function showPage(lang, page, data) {
  ['home', 'product', 'cat'].forEach(p => {
    const el = document.getElementById(lang + '-' + p);
    if (el) el.style.display = (p === page) ? 'block' : 'none';
  });

  // PRODUCT PAGE
  if (page === 'product') {
    const prod = typeof data === 'object' ? data : getProd(data);

    const title = document.getElementById(lang + '-prod-title');
    const img = document.getElementById(lang + '-prod-img');

    if (title) title.innerText = lang === 'sq' ? prod.nameAl : prod.name;
    if (img) img.src = prod.image;
  }

  // CATEGORY PAGE (Explore + Subcategory)
  if (page === 'cat') {
    const products = data?.products
      ? data.products
      : PRODUCTS.filter(p => p.tag === data.key);

    renderProducts(products, lang);

    const title = document.getElementById(lang + '-cat-title');
    if (title) {
      title.innerText = data?.sub
        ? data.sub
        : data.key.toUpperCase();
    }
  }
}

// ── SEARCH ──
function liveSearch(q, lang) {
  const clear = document.getElementById('hdr-clear-' + lang);
  if (clear) clear.style.display = q ? 'block' : 'block';

  if (!q.trim()) {
    closeDrop(lang);
    return;
  }

  renderDrop(q.trim(), lang);
}

function renderDrop(q, lang) {
  const drop = document.getElementById('hdr-drop-' + lang);
  if (!drop) return;

  const lq = q.toLowerCase();

  const catMatch = Object.entries(CATS).find(([key, c]) => {
    return c.en.toLowerCase().includes(lq) || c.sq.toLowerCase().includes(lq);
  });

  searchResults[lang] = PRODUCTS.filter(p => {
    const name = lang === 'sq' ? p.nameAl : p.name;
    const cat = lang === 'sq' ? p.catAl : p.cat;
    const sub = lang === 'sq' ? p.subAl : p.sub;
    return (name + ' ' + cat + ' ' + sub).toLowerCase().includes(lq);
  });

  const res = searchResults[lang];

  if (res.length === 0) {
    drop.innerHTML = '<div class="sdr-no">No products found</div>';
    drop.classList.add('open');
    return;
  }

  let catRow = '';
  if (catMatch) {
    const [catKey, catObj] = catMatch;
    const catLabel = lang === 'sq' ? catObj.sq : catObj.en;

    catRow = `
      <div class="sdr-item" onclick="showCat('${lang}','${catKey}')">
        <strong>Browse ${catLabel}</strong>
      </div>
    `;
  }

  const items = res.slice(0, 7).map((p, i) => {
    const name = lang === 'sq' ? p.nameAl : p.name;
    return `
      <div class="sdr-item" onclick="showPage('${lang}','product',${p.id})">
        ${hl(name, q)}
      </div>
    `;
  }).join('');

  drop.innerHTML = catRow + items;
  drop.classList.add('open');
}

// ── SEARCH HELPERS ──
function closeDrop(lang) {
  const drop = document.getElementById('hdr-drop-' + lang);
  if (drop) drop.classList.remove('open');
}

function clearSearch(lang) {
  const input = document.getElementById('hdr-input-' + lang);
  if (input) input.value = '';
  closeDrop(lang);
}

// ── STORE SCROLL ──
function scrollToStore(lang) {
  setLang(lang);
  showPage(lang, 'home');
  document.getElementById(lang + '-footer')?.scrollIntoView({ behavior: 'smooth' });
}

// - funksion qe nderton menun
function renderMenu(lang) {
  const container = document.getElementById('menu-' + lang);
  if (!container) return;

  container.innerHTML = Object.entries(CATEGORIES).map(([tag, cat]) => {

    const subsHtml = cat.subs.map(sub => `
      <li>
        <a href="#" onclick="showSubCat('${lang}','${tag}','${sub}');return false;">
          ${sub}
        </a>
      </li>
    `).join('');

    return `
      <li class="nav-l1-item">
        <a href="#" onclick="showCat('${lang}','${tag}');return false;">
          ${cat.label}<span class="arr">›</span>
        </a>
        <ul class="nav-l2">
          ${subsHtml}
        </ul>
      </li>
    `;
  }).join('');
}

document.addEventListener("DOMContentLoaded", () => {
  renderMenu('en');
  renderMenu('sq');
});
