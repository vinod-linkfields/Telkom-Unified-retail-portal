import { MOCK_DB, APP_STATE } from './state.js';

// ─── Global Products Registry ────────────────────────────────────────────────
// All products loaded from the Excel file.  Populated by loadProductsFromJSON().
export let PRODUCTS_REGISTRY = [];
let _productsLoaded = false;
let _loadingPromise = null;

const PAGE_SIZE = 24;
let _currentPage = 1;

export async function loadProductsFromJSON() {
  if (_productsLoaded) return PRODUCTS_REGISTRY;
  if (_loadingPromise) return _loadingPromise;

  _loadingPromise = fetch('/Products/products.json')
    .then(r => r.json())
    .then(data => {
      PRODUCTS_REGISTRY = data;
      // Also expose on APP_STATE so stepper / dashboards can look up by id
      APP_STATE.products = PRODUCTS_REGISTRY;
      _productsLoaded = true;
      return PRODUCTS_REGISTRY;
    })
    .catch(err => {
      console.error('Failed to load products.json – falling back to MOCK_DB.products', err);
      PRODUCTS_REGISTRY = MOCK_DB.products || [];
      APP_STATE.products = PRODUCTS_REGISTRY;
      _productsLoaded = true;
      return PRODUCTS_REGISTRY;
    });

  return _loadingPromise;
}

/** Find a product in the registry by id / dealId */
export function findProductById(id) {
  return PRODUCTS_REGISTRY.find(p => p.id === id || p.dealId === id) ||
         MOCK_DB.products.find(p => p.id === id);
}

// ─── Term/price helpers ───────────────────────────────────────────────────────
export function getProductTermAndPrice(p) {
  const defaultTerm = p.term || 24;
  const term = APP_STATE.productTerms[p.id] || defaultTerm;
  let price = p.monthlyFee ?? p.price ?? 0;

  if (term === 12 && p.term !== 12) price = Math.round(price * 1.25);
  else if (term === 36 && p.term !== 36) price = Math.round(price * 0.9);

  return { term, price };
}

export function updateProductTermPrice(productId, newTerm) {
  APP_STATE.productTerms[productId] = parseInt(newTerm);
  renderCatalogue();
}

export function updateProductColor(productId, color) {
  APP_STATE.productColors[productId] = color;
}

export function clearCatalogueSearch() {
  const searchInput = document.getElementById('catalogue-search-input');
  if (searchInput) searchInput.value = '';
  _currentPage = 1;
  renderCatalogue();
}

function changePage(delta) {
  _currentPage += delta;
  renderCatalogue();
  // Scroll product grid into view
  const el = document.getElementById('catalogue-products-list');
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ─── Render ───────────────────────────────────────────────────────────────────
export function renderCatalogue() {
  const listEl = document.getElementById('catalogue-products-list');
  if (!listEl) return;

  // If products not yet loaded, show spinner and kick off load
  if (!_productsLoaded) {
    listEl.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 64px;">
        <div style="display: inline-block; width: 40px; height: 40px; border: 4px solid var(--border-color); border-top-color: var(--telkom-blue); border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
        <p style="color: var(--text-secondary); margin-top: 16px; font-size: 14px;">Loading product catalogue…</p>
      </div>
    `;
    loadProductsFromJSON().then(() => renderCatalogue());
    return;
  }

  listEl.innerHTML = '';

  // ── Gather filter values ──────────────────────────────────────────────────
  const searchInput = document.getElementById('catalogue-search-input');
  const searchVal = searchInput ? searchInput.value.trim().toLowerCase() : '';
  const clearBtn = document.getElementById('catalogue-search-clear');
  if (clearBtn) clearBtn.style.display = searchVal ? 'block' : 'none';

  const typeFilter = Array.from(document.querySelectorAll('.filter-type-checkbox:checked')).map(cb => cb.value);
  const checkedPriceRadio = document.querySelector('.filter-price-radio:checked');
  const priceFilter = checkedPriceRadio ? checkedPriceRadio.value : 'all';
  const promoOnlyEl = document.getElementById('filter-promotions-only');
  const promoOnly = promoOnlyEl ? promoOnlyEl.checked : false;

  const termFilterEl = document.querySelector('.filter-term-radio:checked');
  const termFilter = termFilterEl ? parseInt(termFilterEl.value) : 0; // 0 = all

  // ── Apply filters ─────────────────────────────────────────────────────────
  let filtered = PRODUCTS_REGISTRY;

  if (promoOnly) {
    filtered = filtered.filter(p => p.promo);
  }

  if (typeFilter.length > 0) {
    filtered = filtered.filter(p => typeFilter.includes(p.category));
  }

  if (termFilter > 0) {
    filtered = filtered.filter(p => p.term === termFilter);
  }

  const price = (p) => p.monthlyFee ?? p.price ?? 0;

  if (priceFilter !== 'all') {
    if (priceFilter === '0-200')   filtered = filtered.filter(p => price(p) <= 200);
    else if (priceFilter === '200-500') filtered = filtered.filter(p => price(p) > 200 && price(p) <= 500);
    else if (priceFilter === '500-1000') filtered = filtered.filter(p => price(p) > 500 && price(p) <= 1000);
    else if (priceFilter === '1000+')   filtered = filtered.filter(p => price(p) > 1000);
  }

  if (searchVal) {
    filtered = filtered.filter(p => {
      return (
        (p.name || '').toLowerCase().includes(searchVal) ||
        (p.package || '').toLowerCase().includes(searchVal) ||
        (p.category || '').toLowerCase().includes(searchVal) ||
        (p.dealId || '').toLowerCase().includes(searchVal) ||
        (p.description || '').toLowerCase().includes(searchVal) ||
        (p.device || '').toLowerCase().includes(searchVal) ||
        (p.tag || '').toLowerCase().includes(searchVal) ||
        (p.additionalData || '').toLowerCase().includes(searchVal)
      );
    });
  }

  // ── Update results count ──────────────────────────────────────────────────
  const resultsCountEl = document.getElementById('catalogue-results-count');
  if (resultsCountEl) {
    resultsCountEl.textContent = `${filtered.length.toLocaleString()} product${filtered.length !== 1 ? 's' : ''} found`;
  }

  if (filtered.length === 0) {
    listEl.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 48px; background-color: var(--bg-card); border-radius: var(--radius-lg); border: 1px solid var(--border-color);">
        <div style="font-size: 48px; margin-bottom: 12px;">🔍</div>
        <p style="color: var(--text-secondary); font-size: 14px;">No products match your search or filters.</p>
        <button class="btn btn-outline" style="margin-top: 12px;" onclick="clearCatalogueSearch()">Clear Filters</button>
      </div>
    `;
    return;
  }

  // ── Pagination ────────────────────────────────────────────────────────────
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  if (_currentPage > totalPages) _currentPage = 1;
  const start = (_currentPage - 1) * PAGE_SIZE;
  const paginated = filtered.slice(start, start + PAGE_SIZE);

  // ── Render cards ──────────────────────────────────────────────────────────
  paginated.forEach(p => {
    const { term, price: displayPrice } = getProductTermAndPrice(p);
    const onceOff = p.onceOff ?? 99;

    // Category colour accent
    const catColors = {
      'Handset': '#0066cc',
      'SIM Only': '#00875a',
      'Mobile Data': '#7b2d8b',
      'Tablets': '#d14900',
      'Laptops': '#505050',
    };
    const accent = catColors[p.category] || '#0066cc';

    // Device label (truncated)
    const deviceLabel = p.device ? `<div style="font-size: 11px; color: var(--text-secondary); margin-top: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${p.device}">📱 ${p.device}</div>` : '';

    // Additional data label
    const addDataLabel = p.additionalData ? `<div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">➕ ${p.additionalData}</div>` : '';

    // Tag badge
    const tagBadge = p.tag ? `<span class="badge" style="background: var(--warning-light); color: var(--warning); font-size: 10px; margin-top: 4px; display: inline-block; border: 1px solid var(--warning);">${p.tag}</span>` : '';

    // Promo badge
    const promoBadge = p.promo ? `<div class="product-badge-promo">PROMO</div>` : '';

    // Description (truncated to first ~80 chars)
    const shortDesc = (p.description || '').length > 90
      ? (p.description || '').substring(0, 90).trim() + '…'
      : (p.description || '');

    listEl.innerHTML += `
      <div class="product-card">
        ${promoBadge}
        <div class="product-info-area">
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
            <span class="product-category" style="background: ${accent}18; color: ${accent}; border: 1px solid ${accent}30; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 700;">${p.category}</span>
          </div>

          <div style="font-size: 10px; color: var(--text-muted); font-weight: 700; font-family: monospace; letter-spacing: 0.5px;">DEAL ID: ${p.dealId}</div>
          <div class="product-name" style="margin-top: 4px; font-size: 14px; line-height: 1.3; min-height: 36px;">${p.name}</div>

          ${deviceLabel}
          ${addDataLabel}
          ${tagBadge}

          <div class="product-allocation" style="margin-top: 10px;">
            <div class="allocation-row" style="font-size: 12px;">
              <span style="color: var(--text-secondary);">${shortDesc}</span>
            </div>
          </div>

          <div style="display: flex; gap: 8px; align-items: center; margin-top: 10px;">
            <div style="background: var(--bg-light); border-radius: 6px; padding: 4px 8px; font-size: 11px; color: var(--text-secondary); border: 1px solid var(--border-color);">
              ⏱ ${term} months
            </div>
          </div>

          <div class="product-pricing" style="margin-top: 12px;">
            <span class="price-currency">R</span>
            <span class="price-amount">${displayPrice ? displayPrice.toFixed(0) : '—'}</span>
            <span class="price-period">/mo</span>
          </div>
          <div class="price-onceoff">Once-off Connection Fee: R${onceOff}</div>

          <div style="margin-top: 14px; display: flex; gap: 8px;">
            <button class="btn btn-primary product-cta-btn" onclick="selectProductForStepper('${p.id}')" style="flex: 1; font-size: 13px;">Select Product</button>
            <button class="btn btn-outline" onclick="showProductDetails('${p.id}')" style="padding: 0 12px; font-size: 13px;">Details</button>
          </div>
        </div>
      </div>
    `;
  });

  // ── Pagination controls ───────────────────────────────────────────────────
  if (totalPages > 1) {
    const paginationDiv = document.createElement('div');
    paginationDiv.style.cssText = 'grid-column: 1 / -1; display: flex; align-items: center; justify-content: center; gap: 12px; padding: 24px 0; flex-wrap: wrap;';

    const pageInfo = `<span style="font-size: 13px; color: var(--text-secondary);">Page <strong>${_currentPage}</strong> of <strong>${totalPages}</strong> &nbsp;·&nbsp; Showing ${start + 1}–${Math.min(start + PAGE_SIZE, filtered.length)} of ${filtered.length.toLocaleString()}</span>`;

    paginationDiv.innerHTML = `
      <button class="btn btn-outline" onclick="changeCataloguePage(-1)" ${_currentPage <= 1 ? 'disabled' : ''} style="font-size: 13px; padding: 6px 16px;">← Prev</button>
      ${pageInfo}
      <button class="btn btn-outline" onclick="changeCataloguePage(1)" ${_currentPage >= totalPages ? 'disabled' : ''} style="font-size: 13px; padding: 6px 16px;">Next →</button>
    `;
    listEl.appendChild(paginationDiv);
  }
}

// ─── Bind globals ─────────────────────────────────────────────────────────────
window.getProductTermAndPrice = getProductTermAndPrice;
window.updateProductTermPrice = updateProductTermPrice;
window.updateProductColor = updateProductColor;
window.clearCatalogueSearch = clearCatalogueSearch;
window.renderCatalogue = () => { _currentPage = 1; renderCatalogue(); };
// Override so oninput="renderCatalogue()" on search doesn't reset page
window._renderCatalogueNoReset = renderCatalogue;
window.changeCataloguePage = (delta) => {
  _currentPage += delta;
  renderCatalogue();
  const el = document.getElementById('catalogue-products-list');
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
};
window.findProductById = findProductById;
// Allow inline HTML to reset page: filterChange() resets page then renders
window.filterCatalogueChange = () => { _currentPage = 1; renderCatalogue(); };
// Allow search input to NOT reset page for UX consistency
window.searchCatalogueInput = () => { _currentPage = 1; renderCatalogue(); };
