import { APP_STATE, saveNotifications } from './state.js';

export function updateNotificationsBadge() {
  const count = APP_STATE.notifications.filter(n => !n.read).length;
  const badge = document.getElementById('notifications-count-badge');
  if (badge) {
    if (count > 0) {
      badge.style.display = 'flex';
      badge.innerText = count;
    } else {
      badge.style.display = 'none';
    }
  }
}

export function pushNotification(title, message, type, priority) {
  const notif = {
    id: "NT-" + Math.floor(1000 + Math.random() * 9000),
    title: title,
    message: message,
    type: type,
    priority: priority,
    date: new Date().toISOString().slice(0, 10) + " " + new Date().toTimeString().slice(0, 5),
    read: false,
    link: type.includes('stock') ? "stock-requests" : "order-tracking"
  };
  APP_STATE.notifications.unshift(notif);
  saveNotifications();
  updateNotificationsBadge();
}

export function showToast(message, type = "success") {
  const toast = document.createElement('div');
  toast.style.position = 'fixed';
  toast.style.bottom = '24px';
  toast.style.left = '24px';
  toast.style.padding = '12px 24px';
  toast.style.borderRadius = 'var(--radius-md)';
  toast.style.fontSize = '14px';
  toast.style.fontWeight = '600';
  toast.style.zIndex = '300';
  toast.style.boxShadow = 'var(--shadow-lg)';
  toast.style.animation = 'scaleIn 0.2s ease';
  
  if (type === 'success') {
    toast.style.backgroundColor = 'var(--success)';
    toast.style.color = 'white';
  } else if (type === 'danger') {
    toast.style.backgroundColor = 'var(--danger)';
    toast.style.color = 'white';
  } else if (type === 'warning') {
    toast.style.backgroundColor = 'var(--warning)';
    toast.style.color = 'var(--telkom-blue-dark)';
  } else {
    toast.style.backgroundColor = 'var(--telkom-blue-dark)';
    toast.style.color = 'white';
  }

  toast.innerText = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'fadeOut 0.2s ease';
    setTimeout(() => toast.remove(), 200);
  }, 4000);
}

export function maskID(idNum) {
  if (!idNum) return "";
  return idNum.slice(0, 2) + "*******" + idNum.slice(-4);
}

export function maskPassport(passport) {
  if (!passport) return "";
  return passport.slice(0, 2) + "****" + passport.slice(-3);
}

export function openModal(modalId) {
  const m = document.getElementById(modalId);
  if (m) m.style.display = 'flex';
}

export function closeModal(modalId) {
  const m = document.getElementById(modalId);
  if (m) m.style.display = 'none';

  if (modalId === 'order-details-modal') {
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('orderRef');
      url.searchParams.delete('order');
      window.history.pushState({ route: APP_STATE.activeRoute }, '', url.pathname + url.search + url.hash);
    } catch(e) {}
  }
}

const tablePaginationState = new Map();

function getPaginationKey(tbody, tableId) {
  if (tableId) return tableId;
  if (tbody.id) return tbody.id;
  const generatedId = `table-body-${Math.random().toString(36).slice(2, 9)}`;
  tbody.id = generatedId;
  return generatedId;
}

function getOrCreatePaginationControls(tbody, key) {
  const tableWrap = tbody.closest('.table-container');
  if (!tableWrap) return null;

  const existing = tableWrap.nextElementSibling;
  if (existing && existing.classList.contains('table-pagination') && existing.dataset.tableKey === key) {
    return existing;
  }
  if (existing && existing.classList.contains('table-pagination')) {
    existing.remove();
  }

  const controls = document.createElement('div');
  controls.className = 'table-pagination';
  controls.dataset.tableKey = key;
  tableWrap.insertAdjacentElement('afterend', controls);
  return controls;
}

export function renderPaginatedRows(tbody, rows, options = {}) {
  if (!tbody) return;

  const {
    emptyRow = '',
    pageSize = 5,
    tableId,
    itemLabel = 'entries',
    infoElement = null
  } = options;

  const key = getPaginationKey(tbody, tableId);
  const total = rows.length;
  const controls = getOrCreatePaginationControls(tbody, key);
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(tablePaginationState.get(key) || 1, pageCount);
  tablePaginationState.set(key, currentPage);

  if (total === 0) {
    tbody.innerHTML = emptyRow;
    if (controls) controls.remove();
    if (infoElement) infoElement.innerText = `Showing 0 ${itemLabel}`;
    return;
  }

  const startIndex = (currentPage - 1) * pageSize;
  const visibleRows = rows.slice(startIndex, startIndex + pageSize);
  tbody.innerHTML = visibleRows.join('');

  const startCount = startIndex + 1;
  const endCount = Math.min(startIndex + pageSize, total);
  const rangeText = `Showing ${startCount}-${endCount} of ${total} ${itemLabel}`;
  if (infoElement) infoElement.innerText = rangeText;

  if (!controls) return;

  const compactPages = [];
  for (let i = 1; i <= pageCount; i++) {
    if (i === 1 || i === pageCount || Math.abs(i - currentPage) <= 1) {
      compactPages.push(i);
    }
  }

  let lastPage = 0;
  const pageButtons = compactPages.map(page => {
    const gap = page - lastPage > 1 ? '<span class="table-pagination-gap">...</span>' : '';
    lastPage = page;
    return `${gap}<button type="button" class="table-page-btn ${page === currentPage ? 'active' : ''}" data-page="${page}" aria-label="Page ${page}">${page}</button>`;
  }).join('');

  const summaryHtml = infoElement ? '' : `<span class="table-pagination-summary">${rangeText}</span>`;
  controls.innerHTML = `
    ${summaryHtml}
    <div class="table-pagination-actions">
      <button type="button" class="table-page-btn" data-page="${currentPage - 1}" ${currentPage === 1 ? 'disabled' : ''}>Prev</button>
      ${pageButtons}
      <button type="button" class="table-page-btn" data-page="${currentPage + 1}" ${currentPage === pageCount ? 'disabled' : ''}>Next</button>
    </div>
  `;

  controls.querySelectorAll('button[data-page]').forEach(button => {
    button.addEventListener('click', () => {
      const nextPage = Number(button.dataset.page);
      if (!nextPage || nextPage < 1 || nextPage > pageCount || nextPage === currentPage) return;
      tablePaginationState.set(key, nextPage);
      renderPaginatedRows(tbody, rows, options);
    });
  });
}

export function paginateExistingTable(tbody, options = {}) {
  if (!tbody) return;
  const rowElements = Array.from(tbody.querySelectorAll('tr'));
  const emptyRow = rowElements.length === 1 && rowElements[0].querySelector('td[colspan]')
    ? rowElements[0].outerHTML
    : options.emptyRow;
  const rows = emptyRow ? [] : rowElements.map(row => row.outerHTML);
  renderPaginatedRows(tbody, rows, {
    ...options,
    emptyRow
  });
}

// Bind modal utilities to window for inline onclick handlers
window.openModal = openModal;
window.closeModal = closeModal;

// Draw Donut Chart
export function drawSVGDonutChart(containerId, segmentData) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  const width = 150;
  const height = 150;
  const radius = 50;
  const cx = width / 2;
  const cy = height / 2;
  const circumference = 2 * Math.PI * radius;

  const total = segmentData.reduce((sum, item) => sum + item.value, 0);

  if (total === 0) {
    container.innerHTML = `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
        <circle cx="${cx}" cy="${cy}" r="${radius}" class="svg-donut-circle-bg" stroke-width="20" fill="none" stroke="var(--border-color)" />
        <text class="svg-donut-text-val" x="${cx}" y="${cy}">0</text>
        <text class="svg-donut-text-lbl" x="${cx}" y="${cy + 18}">Records</text>
      </svg>
    `;
    return;
  }

  let currentOffset = 0;
  let segmentHtml = '';

  segmentData.forEach(seg => {
    const pct = seg.value / total;
    const strokeDash = pct * circumference;
    const offset = circumference - currentOffset;
    
    segmentHtml += `
      <circle cx="${cx}" cy="${cy}" r="${radius}" 
              class="svg-donut-segment" 
              stroke="${seg.color}"
              stroke-width="20"
              fill="none"
              stroke-dasharray="${strokeDash} ${circumference - strokeDash}"
              stroke-dashoffset="${offset}"
              transform="rotate(-90 ${cx} ${cy})">
        <title>${seg.label}: ${seg.value} (${Math.round(pct * 100)}%)</title>
      </circle>
    `;
    
    currentOffset += strokeDash;
  });

  const svg = `
    <svg width="100%" height="100%" viewBox="0 0 ${width} ${height}">
      <circle cx="${cx}" cy="${cy}" r="${radius}" class="svg-donut-circle-bg" stroke-width="20" fill="none" stroke="var(--border-color)" />
      ${segmentHtml}
      <text class="svg-donut-text-val" x="${cx}" y="${cy - 3}">${total}</text>
      <text class="svg-donut-text-lbl" x="${cx}" y="${cy + 18}">Total</text>
    </svg>
  `;

  container.innerHTML = svg;
}
