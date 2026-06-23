import { MOCK_DB, APP_STATE } from './state.js';

// Get selected term and calculated price for a product
export function getProductTermAndPrice(p) {
  const defaultTerm = p.term || 24;
  const term = APP_STATE.productTerms[p.id] || defaultTerm;
  let price = p.price;
  
  if (term === 12) {
    price = Math.round(p.price * 1.25);
  } else if (term === 36) {
    price = Math.round(p.price * 0.9);
  }
  return { term, price };
}

// Update term and recalculate catalogue values
export function updateProductTermPrice(productId, newTerm) {
  APP_STATE.productTerms[productId] = parseInt(newTerm);
  renderCatalogue();
}

export function updateProductColor(productId, color) {
  APP_STATE.productColors[productId] = color;
}

// Clear catalogue search text input
export function clearCatalogueSearch() {
  const searchInput = document.getElementById('catalogue-search-input');
  if (searchInput) {
    searchInput.value = '';
  }
  renderCatalogue();
}

// Render Catalogue
export function renderCatalogue() {
  const listEl = document.getElementById('catalogue-products-list');
  if (!listEl) return;
  listEl.innerHTML = '';

  // Get active search and filter values
  const searchInput = document.getElementById('catalogue-search-input');
  const searchVal = searchInput ? searchInput.value.trim().toLowerCase() : '';
  const clearBtn = document.getElementById('catalogue-search-clear');
  if (clearBtn) {
    clearBtn.style.display = searchVal ? 'block' : 'none';
  }

  const typeFilter = Array.from(document.querySelectorAll('.filter-type-checkbox:checked')).map(cb => cb.value);
  const checkedPriceRadio = document.querySelector('.filter-price-radio:checked');
  const priceFilter = checkedPriceRadio ? checkedPriceRadio.value : 'all'; // all, 0-200, 200-500, 500+

  const promoOnlyEl = document.getElementById('filter-promotions-only');
  const promoOnly = promoOnlyEl ? promoOnlyEl.checked : false;

  let filtered = MOCK_DB.products;

  // Promotions & Best Sellers filter
  if (promoOnly) {
    const promoIds = ['p-dev-2', 'p-sim-2', 'p-dev-1'];
    filtered = filtered.filter(p => p.promo || promoIds.includes(p.id));
  }

  // Category filters
  if (typeFilter.length > 0) {
    filtered = filtered.filter(p => typeFilter.includes(p.category));
  }

  // Price filters
  if (priceFilter !== 'all') {
    if (priceFilter === '0-200') filtered = filtered.filter(p => p.price <= 200);
    else if (priceFilter === '200-500') filtered = filtered.filter(p => p.price > 200 && p.price <= 500);
    else if (priceFilter === '500+') filtered = filtered.filter(p => p.price > 500);
  }

  // Free text & Deal ID search
  if (searchVal) {
    filtered = filtered.filter(p => {
      const matchName = p.name.toLowerCase().includes(searchVal);
      const matchCategory = p.category.toLowerCase().includes(searchVal);
      const matchDealId = p.dealId ? p.dealId.toLowerCase().includes(searchVal) : false;
      const matchAllocation = p.allocation.toLowerCase().includes(searchVal);
      const matchDeviceSKU = p.deviceSKU ? p.deviceSKU.toLowerCase().includes(searchVal) : false;
      
      const matchDeviceSpecs = p.deviceInfo ? (
        p.deviceInfo.name.toLowerCase().includes(searchVal) ||
        p.deviceInfo.make.toLowerCase().includes(searchVal) ||
        p.deviceInfo.model.toLowerCase().includes(searchVal) ||
        p.deviceInfo.colour.toLowerCase().includes(searchVal)
      ) : false;
      
      return matchName || matchCategory || matchDealId || matchAllocation || matchDeviceSKU || matchDeviceSpecs;
    });
  }

  if (filtered.length === 0) {
    listEl.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 48px; background-color: var(--bg-card); border-radius: var(--radius-lg); border: 1px solid var(--border-color);">
        <p style="color: var(--text-secondary); font-size: 14px;">No products match your search or filters.</p>
      </div>
    `;
    return;
  }

  filtered.forEach(p => {
    // Get custom term & price
    const { term, price } = getProductTermAndPrice(p);

    // Check stock status if device SKU is attached
    let stockBadgeHtml = '';
    let isOos = false;
    
    if (p.deviceSKU) {
      const stock = MOCK_DB.stock[APP_STATE.currentUser.branch]?.[p.deviceSKU] || { onHand: 0, reserved: 0, available: 0 };
      if (stock) {
        if (stock.available === 0) {
          stockBadgeHtml = `<span class="badge badge-danger" style="margin-left: 8px;">Out of Stock</span>`;
          isOos = true;
        } else if (stock.available <= 2) {
          stockBadgeHtml = `<span class="badge badge-warning" style="margin-left: 8px;">Low Stock (${stock.available})</span>`;
        } else {
          stockBadgeHtml = `<span class="badge badge-success" style="margin-left: 8px;">In Stock (${stock.available})</span>`;
        }
      }
    }

    // Render device specifications if it's a handset/device product
    let deviceSpecsHtml = '';
    if (p.deviceInfo) {
      deviceSpecsHtml = `
        <div class="product-device-specs-grid">
          <div class="product-device-spec-item">
            <span class="product-device-spec-label">Device Name</span>
            <span class="product-device-spec-value">${p.deviceInfo.name}</span>
          </div>
          <div class="product-device-spec-item">
            <span class="product-device-spec-label">Make</span>
            <span class="product-device-spec-value">${p.deviceInfo.make}</span>
          </div>
          <div class="product-device-spec-item">
            <span class="product-device-spec-label">Model</span>
            <span class="product-device-spec-value">${p.deviceInfo.model}</span>
          </div>
        </div>
      `;
    }

    const imgPath = p.id === 'p-dev-1' ? 'Images/samsung_galaxy_s24.png' : (p.id === 'p-dev-2' ? 'Images/iphone_15_pro_max.png' : '');
    const imageHtml = imgPath ? `
      <div class="product-image-container" style="text-align: center; margin-bottom: 12px; background-color: var(--bg-light); border-radius: var(--radius-md); padding: 12px; height: 140px; display: flex; align-items: center; justify-content: center; border: 1px solid var(--border-color);">
        <img src="${imgPath}" alt="${p.name}" style="max-height: 100%; max-width: 100%; object-fit: contain;">
      </div>
    ` : '';

    listEl.innerHTML += `
      <div class="product-card">
        ${p.promo ? `<div class="product-badge-promo">PROMO</div>` : ''}
        <div class="product-info-area">
          <div class="product-category">${p.category} ${stockBadgeHtml}</div>
          ${imageHtml}
          <div style="font-size: 11px; color: var(--text-muted); font-weight: 700; margin-top: 4px;">DEAL ID: ${p.dealId}</div>
          <div class="product-name" style="margin-top: 4px;">${p.name}</div>
          
          ${deviceSpecsHtml}

          <div class="product-contract-term-selector">
            <label class="form-label" style="font-size: 11px; margin-bottom: 4px; font-weight: 600;">Contract Term</label>
            <select class="form-control" onchange="updateProductTermPrice('${p.id}', this.value)">
              <option value="12" ${term === 12 ? 'selected' : ''}>12 Months</option>
              <option value="24" ${term === 24 ? 'selected' : ''}>24 Months</option>
              <option value="36" ${term === 36 ? 'selected' : ''}>36 Months</option>
            </select>
          </div>
          
          <div class="product-allocation" style="margin-top: 12px;">
            <div class="allocation-row">
              <span>Specs/Alloc:</span>
              <span class="allocation-val">${p.allocation}</span>
            </div>
          </div>
          
          <div class="product-pricing">
            <span class="price-currency">R</span>
            <span class="price-amount">${price}</span>
            <span class="price-period">/mo</span>
          </div>
          <div class="price-onceoff">Once-off Connection Fee: R${p.onceOff}</div>
          
          <div style="margin-top: 16px;">
            <button class="btn btn-primary product-cta-btn" onclick="selectProductForStepper('${p.id}')">Select Product</button>
          </div>
        </div>
      </div>
    `;
  });
}

// Bind to window for global inline HTML execution
window.getProductTermAndPrice = getProductTermAndPrice;
window.updateProductTermPrice = updateProductTermPrice;
window.updateProductColor = updateProductColor;
window.clearCatalogueSearch = clearCatalogueSearch;
window.renderCatalogue = renderCatalogue;
