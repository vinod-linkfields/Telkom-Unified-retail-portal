import { APP_STATE, MOCK_DB } from './state.js';
import { switchRoute, updateSidebarMenuOptions } from './routing.js';
import { renderPaginatedRows, showToast, openModal, closeModal, drawSVGDonutChart } from './utils.js';

export function renderAgentDashboard() {
  const recentOrders = APP_STATE.ordersList
    .filter(o => o.agent === APP_STATE.currentUser.id && o.store === APP_STATE.currentUser.branch)
    .slice(0, 5);

  const tbody = document.getElementById('agent-recent-orders-tbody');
  if (tbody) {
    const rows = recentOrders.map(o => `
      <tr>
        <td><strong>${o.orderRef}</strong></td>
        <td>${o.customerName}</td>
        <td>${o.product}</td>
        <td>${o.date}</td>
        <td><span class="badge ${o.status === 'Fulfilled' ? 'badge-success' : 'badge-warning'}">${o.status}</span></td>
      </tr>
    `);
    renderPaginatedRows(tbody, rows, {
      emptyRow: `<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">No orders found.</td></tr>`
    });
  }

  // Get dynamic dates for simulated "today"
  const dates = APP_STATE.ordersList.map(o => o.date.split(' ')[0]);
  const latestDate = dates.reduce((max, d) => d > max ? d : max, '2026-06-12');
  const todayStr = new Date().toISOString().slice(0, 10);
  const targetDate = APP_STATE.ordersList.some(o => o.date.startsWith(todayStr)) ? todayStr : latestDate;

  const todayOrders = APP_STATE.ordersList.filter(o => 
    o.agent === APP_STATE.currentUser.id && 
    o.store === APP_STATE.currentUser.branch && 
    o.date.startsWith(targetDate)
  );
  
  const myDrafts = APP_STATE.draftOrders.filter(d => d.agentId === APP_STATE.currentUser.id);
  const completedToday = todayOrders.filter(o => o.status === 'Fulfilled' || o.status === 'Active');

  const branchStock = MOCK_DB.stock[APP_STATE.currentUser.branch] || {};
  let oosCount = 0;
  for (const [sku, detail] of Object.entries(branchStock)) {
    if (detail.available === 0) oosCount++;
  }

  const agentTodayEl = document.getElementById('agent-today-count');
  if (agentTodayEl) agentTodayEl.innerText = todayOrders.length;
  
  const agentDraftsEl = document.getElementById('agent-drafts-count');
  if (agentDraftsEl) agentDraftsEl.innerText = myDrafts.length;
  
  const agentCompletedEl = document.getElementById('agent-completed-count');
  if (agentCompletedEl) agentCompletedEl.innerText = completedToday.length;
  
  const agentStockAlertsCountEl = document.getElementById('agent-stock-alerts-count');
  if (agentStockAlertsCountEl) agentStockAlertsCountEl.innerText = oosCount;
  
  const stockAlertContainer = document.getElementById('agent-stock-alerts');
  if (stockAlertContainer) {
    stockAlertContainer.innerHTML = '';
    for (const [sku, detail] of Object.entries(branchStock)) {
      if (detail.available === 0) {
        const p = MOCK_DB.products.find(prod => prod.deviceSKU === sku);
        stockAlertContainer.innerHTML += `
          <div style="background-color: var(--danger-light); border-left: 4px solid var(--danger); padding: 10px 14px; border-radius: var(--radius-md); font-size: 13px; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
            <div>
              <strong>OUT OF STOCK:</strong> ${p ? p.name : sku}
            </div>
            <button class="btn btn-sm btn-danger" onclick="initiateStockRequest('${sku}', '${p ? p.name : sku}')">Request Stock</button>
          </div>
        `;
      }
    }
    if (oosCount === 0) {
      stockAlertContainer.innerHTML = `<p style="font-size: 13px; color: var(--text-secondary);">All catalogue devices are fully stocked in this branch.</p>`;
    }
  }

  const draftTbody = document.getElementById('agent-draft-orders-tbody');
  if (draftTbody) {
    const rows = myDrafts.map(d => {
      const prodName = d.cart && d.cart.product ? d.cart.product.name : 'No Product';
      const getActiveStepsForProduct = window.getActiveStepsForProduct;
      let stepLabel = `Step ${d.currentStep}`;
      if (getActiveStepsForProduct) {
        const steps = getActiveStepsForProduct(d.cart.product);
        const stepIndex = steps.findIndex(s => s.id === d.currentStep);
        stepLabel = stepIndex > -1 ? `Step ${stepIndex + 1}: ${steps[stepIndex].label}` : `Step ${d.currentStep}`;
      }

      return `
        <tr>
          <td><strong>${d.draftId}</strong></td>
          <td>${d.customerName || '<span style="color: var(--text-muted);">No Customer Linked</span>'}</td>
          <td>${prodName}</td>
          <td><span class="badge badge-warning">${stepLabel}</span></td>
          <td>${d.timestamp ? d.timestamp.replace('T', ' ').substring(0,16) : d.date}</td>
          <td>
            <button class="btn btn-sm btn-primary" onclick="resumeDraftOrder('${d.draftId}')">Continue</button>
          </td>
        </tr>
      `;
    });
    renderPaginatedRows(draftTbody, rows, {
      emptyRow: `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 20px;">No saved drafts found.</td></tr>`
    });
  }

  // Render Promotions & Best Sellers
  const promoContainer = document.getElementById('dashboard-promotions-list');
  if (promoContainer) {
    const promoIds = ['p-dev-2', 'p-sim-2', 'p-dev-1'];
    const promoProducts = promoIds.map(id => MOCK_DB.products.find(p => p.id === id)).filter(Boolean);
    
    promoContainer.innerHTML = promoProducts.map(p => {
      const imgPath = p.id === 'p-dev-1' ? 'Images/samsung_galaxy_s24.png' : (p.id === 'p-dev-2' ? 'Images/iphone_15_pro_max.png' : '');
      const imageHtml = imgPath ? `
        <div style="text-align: center; margin-bottom: 12px; background-color: var(--bg-light); border-radius: var(--radius-md); padding: 12px; height: 120px; display: flex; align-items: center; justify-content: center; border: 1px solid var(--border-color);">
          <img src="${imgPath}" alt="${p.name}" style="max-height: 100%; max-width: 100%; object-fit: contain;">
        </div>
      ` : '';

      return `
        <div class="product-card" style="margin: 0; box-shadow: var(--shadow-sm); display: flex; flex-direction: column; justify-content: space-between; height: 100%; padding: 16px; border: 1px solid var(--border-color); border-radius: var(--radius-md); background: var(--bg-card);">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
              <span class="badge badge-success" style="font-size: 10px;">BEST SELLER</span>
              ${p.promo ? `<span class="badge badge-warning" style="font-size: 10px; background-color: var(--warning-light); color: var(--warning);">PROMO</span>` : ''}
            </div>
            ${imageHtml}
            <div style="font-size: 11px; color: var(--text-muted); font-weight: 700;">${p.category}</div>
            <div style="font-size: 14px; font-weight: 700; color: var(--telkom-blue-dark); margin: 6px 0; font-family: var(--font-display);">${p.name}</div>
            <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 12px; line-height: 1.4;">${p.allocation}</div>
          </div>
          <div>
            <div style="font-size: 18px; font-weight: 800; color: var(--text-primary); margin-bottom: 12px;">R ${p.price}<span style="font-size: 12px; font-weight: 500; color: var(--text-muted);">/mo</span></div>
            <div style="display: flex; gap: 8px;">
              <button class="btn btn-sm btn-primary" onclick="selectProductForStepper('${p.id}')" style="flex: 1; font-size: 12px;">Start Order</button>
              <button class="btn btn-sm btn-outline" onclick="showProductDetails('${p.id}')" style="font-size: 12px; padding: 0 10px;">Details</button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // Render Top Products This Week
  const topProductsContainer = document.getElementById('dashboard-top-products-container');
  if (topProductsContainer) {
    const productSales = {};
    APP_STATE.ordersList.forEach(o => {
      productSales[o.product] = (productSales[o.product] || 0) + 1;
    });
    const sortedProducts = Object.entries(productSales)
      .map(([name, count]) => {
        const prod = MOCK_DB.products.find(p => p.name === name);
        return { name, count, category: prod ? prod.category : 'Catalogue' };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    const maxCount = Math.max(...sortedProducts.map(p => p.count), 1);
    const ranks = ['🥇', '🥈', '🥉'];
    
    topProductsContainer.innerHTML = sortedProducts.map((item, index) => {
      const pct = (item.count / maxCount) * 100;
      return `
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="font-size: 20px; font-weight: bold; width: 24px; text-align: center;">${ranks[index] || (index + 1)}</div>
          <div style="flex: 1;">
            <div style="display: flex; justify-content: space-between; font-size: 12.5px; font-weight: 600; color: var(--text-primary); margin-bottom: 4px;">
              <span>${item.name} <span style="font-size: 11px; color: var(--text-muted); font-weight: normal;">(${item.category})</span></span>
              <span style="font-weight: 700; color: var(--telkom-blue-dark);">${item.count} sold</span>
            </div>
            <div style="background-color: var(--border-color); height: 8px; border-radius: 4px; overflow: hidden; width: 100%;">
              <div style="background: linear-gradient(90deg, var(--telkom-blue) 0%, var(--success) 100%); width: ${pct}%; height: 100%; border-radius: 4px;"></div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // Render Order Status Distribution (Pie Chart)
  const chartContainer = document.getElementById('dashboard-status-chart-container');
  if (chartContainer) {
    const statusCounts = {};
    APP_STATE.ordersList.forEach(o => {
      statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
    });

    const segmentData = [
      { label: "Fulfilled", value: statusCounts["Fulfilled"] || 0, color: "#2e6600" },
      { label: "Active", value: statusCounts["Active"] || 0, color: "#2e6600" },
      { label: "In Progress", value: statusCounts["In Progress"] || 0, color: "#faad14" },
      { label: "Cancelled", value: statusCounts["Cancelled"] || 0, color: "#ff4d4f" },
      { label: "Failed", value: statusCounts["Failed"] || 0, color: "#7f8c8d" }
    ].filter(s => s.value > 0);

    drawSVGDonutChart('dashboard-status-chart-container', segmentData);

    const legendContainer = document.getElementById('dashboard-status-chart-legend');
    if (legendContainer) {
      legendContainer.innerHTML = segmentData.map(seg => `
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="width: 10px; height: 10px; border-radius: 50%; background-color: ${seg.color}; display: inline-block;"></span>
          <span style="color: var(--text-secondary);">${seg.label}: <strong>${seg.value}</strong></span>
        </div>
      `).join('');
    }
  }
}

export function renderManagerDashboard() {
  const storeOrders = APP_STATE.ordersList.filter(o => o.store === APP_STATE.currentUser.branch);
  const mgrOrdersEl = document.getElementById('mgr-orders-today');
  if (mgrOrdersEl) mgrOrdersEl.innerText = storeOrders.length;
  const mgrPendingEl = document.getElementById('mgr-pending-reqs');
  if (mgrPendingEl) mgrPendingEl.innerText = APP_STATE.stockRequests.filter(r => r.storeId === APP_STATE.currentUser.branch && r.status === 'Submitted').length;
  
  const branchStock = MOCK_DB.stock[APP_STATE.currentUser.branch] || {};
  let oosItems = [];
  for (const [sku, detail] of Object.entries(branchStock)) {
    if (detail.available === 0) {
      const p = MOCK_DB.products.find(prod => prod.deviceSKU === sku);
      oosItems.push(p ? p.name : sku);
    }
  }
  const mgrOosEl = document.getElementById('mgr-oos-count');
  if (mgrOosEl) mgrOosEl.innerText = oosItems.length;

  const agentsBody = document.getElementById('mgr-agents-tbody');
  if (agentsBody) {
    renderPaginatedRows(agentsBody, [`
      <tr>
        <td>AGT-101</td>
        <td>Piet van Zyl</td>
        <td><span class="badge badge-success">Active</span></td>
        <td>${storeOrders.filter(o => o.agent === 'AGT-101').length}</td>
      </tr>
      <tr>
        <td>AGT-102</td>
        <td>Sara Lee</td>
        <td><span class="badge badge-success">Active</span></td>
        <td>${storeOrders.filter(o => o.agent === 'AGT-102').length}</td>
      </tr>
    `]);
  }
}

export function renderAreaDashboard() {
  const amTotalEl = document.getElementById('am-total-orders');
  if (amTotalEl) amTotalEl.innerText = APP_STATE.ordersList.length;
  const amPendingEl = document.getElementById('am-pending-approvals');
  if (amPendingEl) amPendingEl.innerText = APP_STATE.stockRequests.filter(r => r.status === 'Submitted').length;

  const pendingTbody = document.getElementById('am-pending-requests-tbody');
  if (!pendingTbody) return;

  const pendingRequests = APP_STATE.stockRequests.filter(r => r.status === 'Submitted');
  const rows = pendingRequests.map(r => `
    <tr>
      <td><strong>${r.id}</strong></td>
      <td>${r.storeId}</td>
      <td>${r.product}</td>
      <td><span class="badge badge-neutral">${r.qty} units</span></td>
      <td><span class="badge ${r.priority === 'Urgent' ? 'badge-danger' : 'badge-warning'}">${r.priority}</span></td>
      <td>${r.date}</td>
      <td>
        <button class="btn btn-sm btn-secondary" onclick="viewStockRequestDetails('${r.id}')" style="margin-right: 5px;">Details</button>
        <button class="btn btn-sm btn-success" onclick="openApprovalModal('${r.id}')">Review & Decide</button>
      </td>
    </tr>
  `);
  renderPaginatedRows(pendingTbody, rows, {
    emptyRow: `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 20px;">No pending stock requests require approval.</td></tr>`
  });
}

export function renderAdminDashboard() {
  const integrationLogs = [
    { time: "15:38:12", api: "Amdocs Clarify CRM - customerQuery", status: "Success", latency: "142ms" },
    { time: "15:37:45", api: "Amdocs CIM - interactionLog", status: "Success", latency: "210ms" },
    { time: "15:36:02", api: "POS Terminal - txnInitiate", status: "Success", latency: "85ms" },
    { time: "15:35:14", api: "Transact - stockCheck", status: "Success", latency: "90ms" }
  ];

  const logTbody = document.getElementById('admin-logs-tbody');
  if (logTbody) {
    const rows = integrationLogs.map(l => `
      <tr>
        <td><code>${l.time}</code></td>
        <td><strong>${l.api}</strong></td>
        <td><span class="badge badge-success">${l.status}</span></td>
        <td>${l.latency}</td>
      </tr>
    `);
    renderPaginatedRows(logTbody, rows);
  }

  for (const [key, val] of Object.entries(APP_STATE.systemHealth)) {
    const indicator = document.getElementById(`health-status-${key}`);
    const dot = document.getElementById(`dot-${key}`);
    if (indicator) {
      if (val) {
        indicator.innerText = "ONLINE";
        indicator.className = "badge badge-success";
        if (dot) dot.className = "health-dot";
      } else {
        indicator.innerText = "OFFLINE";
        indicator.className = "badge badge-danger";
        if (dot) dot.className = "health-dot danger";
      }
    }
  }
}

export function closeProductDrawer(event) {
  if (event) event.preventDefault();
  const drawer = document.getElementById('product-details-drawer');
  if (!drawer) return;
  const content = drawer.querySelector('.drawer-content');
  if (content) {
    content.style.animation = 'slideOutRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
    setTimeout(() => {
      drawer.style.display = 'none';
      content.style.animation = '';
    }, 280);
  } else {
    drawer.style.display = 'none';
  }
}

export function showProductDetails(productId) {
  const p = MOCK_DB.products.find(prod => prod.id === productId);
  if (!p) return;
  
  const titleEl = document.getElementById('product-details-drawer-title');
  if (titleEl) titleEl.innerText = p.name;
  
  let display = "N/A";
  let storage = "N/A";
  let dataBundle = "N/A";
  let contractDuration = `${p.term || 24} Months`;
  let battery = "N/A";
  let highlights = [];
  let accessories = [];
  let imageSvg = "";
  
  if (p.id === 'p-sim-1') {
    display = "N/A";
    storage = "N/A";
    dataBundle = "Unlimited @ 10Mbps";
    highlights = ["Unlimited LTE Data", "100 Voice Minutes", "Free SIM Card & RICA"];
    accessories = ["SIM card ejector", "Telkom welcome kit"];
    imageSvg = `
      <svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="15" y="10" width="70" height="80" rx="8" fill="var(--info-light)" stroke="var(--telkom-blue)" stroke-width="3"/>
        <path d="M85 25 L70 10 L15 10 C11.7 10 9 12.7 9 16 L9 84 C9 87.3 11.7 90 15 90 L85 90 C88.3 90 91 87.3 91 84 L91 26 L85 25 Z" fill="var(--telkom-blue-light)" stroke="var(--telkom-blue)" stroke-width="3"/>
        <rect x="25" y="40" width="40" height="30" rx="3" fill="#F4D03F" stroke="#D4AC0D" stroke-width="2"/>
        <line x1="35" y1="40" x2="35" y2="70" stroke="#D4AC0D" stroke-width="1.5"/>
        <line x1="45" y1="40" x2="45" y2="70" stroke="#D4AC0D" stroke-width="1.5"/>
        <line x1="55" y1="40" x2="55" y2="70" stroke="#D4AC0D" stroke-width="1.5"/>
        <line x1="25" y1="50" x2="65" y2="50" stroke="#D4AC0D" stroke-width="1.5"/>
        <line x1="25" y1="60" x2="65" y2="60" stroke="#D4AC0D" stroke-width="1.5"/>
      </svg>
    `;
  } else if (p.id === 'p-sim-2') {
    display = "N/A";
    storage = "N/A";
    dataBundle = "10GB Data";
    highlights = ["10GB High-speed LTE", "50 Voice Minutes", "100 SMSs included"];
    accessories = ["SIM card ejector", "Telkom sticker pack"];
    imageSvg = `
      <svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M85 25 L70 10 L15 10 C11.7 10 9 12.7 9 16 L9 84 C9 87.3 11.7 90 15 90 L85 90 C88.3 90 91 87.3 91 84 L91 26 L85 25 Z" fill="#E8F8F5" stroke="#1ABC9C" stroke-width="3"/>
        <rect x="25" y="40" width="40" height="30" rx="3" fill="#F4D03F" stroke="#D4AC0D" stroke-width="2"/>
        <line x1="35" y1="40" x2="35" y2="70" stroke="#D4AC0D" stroke-width="1.5"/>
        <line x1="45" y1="40" x2="45" y2="70" stroke="#D4AC0D" stroke-width="1.5"/>
        <line x1="55" y1="40" x2="55" y2="70" stroke="#D4AC0D" stroke-width="1.5"/>
        <line x1="25" y1="50" x2="65" y2="50" stroke="#D4AC0D" stroke-width="1.5"/>
        <line x1="25" y1="60" x2="65" y2="60" stroke="#D4AC0D" stroke-width="1.5"/>
      </svg>
    `;
  } else if (p.id === 'p-dev-1') {
    display = "6.2 inches OLED";
    storage = "128GB";
    dataBundle = "10GB Data";
    battery = "4000 mAh";
    highlights = ["50MP Triple Camera with AI Zoom", "Super Fast charging 2.0", "Water & Dust Resistant (IP68)", "Exynos 2400 Deca-Core Processor"];
    accessories = ["USB-C Charge Cable", "Silicon Protective Case", "Quick Start Guide"];
    imageSvg = `
      <svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="25" y="8" width="50" height="84" rx="10" fill="#2C3E50" stroke="#BDC3C7" stroke-width="3"/>
        <rect x="28" y="11" width="44" height="78" rx="8" fill="#1C2833"/>
        <circle cx="50" cy="15" r="2" fill="#5D6D7E"/>
        <rect x="42" y="86" width="16" height="2" rx="1" fill="#BDC3C7"/>
      </svg>
    `;
  } else if (p.id === 'p-dev-2') {
    display = "6.7 inches Super Retina";
    storage = "256GB";
    dataBundle = "20GB Data";
    battery = "4441 mAh";
    highlights = ["Titanium Design & Action Button", "48MP Main Camera (5x Telephoto)", "A17 Pro chip with 6-core GPU", "Ceramic Shield front cover"];
    accessories = ["USB-C Woven Charge Cable", "Clear Magsafe Case", "Apple Sticker"];
    imageSvg = `
      <svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="25" y="8" width="50" height="84" rx="12" fill="#1B2631" stroke="#AEB6BF" stroke-width="3"/>
        <rect x="28" y="11" width="44" height="78" rx="10" fill="#0E1621"/>
        <rect x="42" y="14" width="16" height="4" rx="2" fill="#000000"/>
        <circle cx="45" cy="16" r="1.2" fill="#1A5276"/>
      </svg>
    `;
  } else {
    imageSvg = `
      <svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="20" y="20" width="60" height="60" rx="8" fill="var(--bg-light)" stroke="var(--border-color)" stroke-width="2"/>
        <path d="M35 50 L45 60 L65 40" stroke="var(--telkom-blue)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
  }
  
  const imgPath = p.id === 'p-dev-1' ? 'Images/samsung_galaxy_s24.png' : (p.id === 'p-dev-2' ? 'Images/iphone_15_pro_max.png' : '');
  const imageDisplayHtml = imgPath ? `
    <img src="${imgPath}" alt="${p.name}" style="max-height: 80px; max-width: 80px; object-fit: contain;">
  ` : imageSvg;

  let specsHtml = `
    <div style="display: flex; gap: 20px; align-items: center; background: var(--bg-light); padding: 20px; border-radius: var(--radius-lg); margin-bottom: 24px;">
      <div style="flex-shrink: 0; background: white; padding: 10px; border-radius: var(--radius-md); box-shadow: var(--shadow-sm); border: 1px solid var(--border-color); height: 100px; width: 100px; display: flex; align-items: center; justify-content: center;">
        ${imageDisplayHtml}
      </div>
      <div style="flex: 1;">
        <div style="display: flex; gap: 6px; margin-bottom: 8px;">
          <span class="badge badge-success" style="font-size: 10px; font-weight: 700;">BEST SELLER</span>
          ${p.promo ? `<span class="badge badge-warning" style="font-size: 10px; font-weight: 700; background-color: var(--warning-light); color: var(--warning);">PROMO</span>` : ''}
        </div>
        <h3 style="font-size: 18px; margin: 0 0 4px 0; color: var(--telkom-blue-dark); font-family: var(--font-display);">${p.name}</h3>
        <p style="font-size: 13px; color: var(--text-muted); margin: 0 0 12px 0;">
          Category: <strong>${p.category}</strong>
        </p>
        <div style="display: flex; align-items: baseline; gap: 8px;">
          <span style="font-size: 22px; font-weight: 800; color: var(--text-primary);">R ${p.price}</span>
          <span style="font-size: 12px; color: var(--text-muted);">/mo x ${p.term || 24} months</span>
        </div>
        ${p.onceOff > 0 ? `<div style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">Once-off fee: <strong>R ${p.onceOff}</strong></div>` : ''}
      </div>
    </div>
    
    <h4 style="font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: var(--telkom-blue-dark); margin-bottom: 12px;">Key Specifications</h4>
    <div class="spec-cards-grid">
      <div class="spec-card">
        <span class="spec-card-label">Display</span>
        <span class="spec-card-value">${display}</span>
      </div>
      <div class="spec-card">
        <span class="spec-card-label">Storage</span>
        <span class="spec-card-value">${storage}</span>
      </div>
      <div class="spec-card">
        <span class="spec-card-label">Data Bundle</span>
        <span class="spec-card-value">${dataBundle}</span>
      </div>
      <div class="spec-card">
        <span class="spec-card-label">Contract Term</span>
        <span class="spec-card-value">${contractDuration}</span>
      </div>
      ${battery !== "N/A" ? `
      <div class="spec-card">
        <span class="spec-card-label">Battery Capacity</span>
        <span class="spec-card-value">${battery}</span>
      </div>
      ` : ''}
      <div class="spec-card">
        <span class="spec-card-label">Deal ID</span>
        <span class="spec-card-value" style="font-family: monospace; font-size: 11px;">${p.dealId}</span>
      </div>
    </div>
    
    ${highlights.length > 0 ? `
    <h4 style="font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: var(--telkom-blue-dark); margin-bottom: 8px; margin-top: 16px;">Key Highlights</h4>
    <ul class="highlights-list">
      ${highlights.map(h => `
        <li class="highlight-item">
          <span class="highlight-icon-check">✓</span>
          <span>${h}</span>
        </li>
      `).join('')}
    </ul>
    ` : ''}
    
    ${accessories.length > 0 ? `
    <h4 style="font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: var(--telkom-blue-dark); margin-bottom: 8px; margin-top: 16px;">Included in the box</h4>
    <div class="accessories-container">
      ${accessories.map(a => `<span class="accessory-tag">${a}</span>`).join('')}
    </div>
    ` : ''}
  `;
  
  const bodyEl = document.getElementById('product-details-drawer-body');
  if (bodyEl) bodyEl.innerHTML = specsHtml;
  
  const ctaBtn = document.getElementById('product-details-drawer-cta');
  if (ctaBtn) {
    ctaBtn.onclick = function(e) {
      closeProductDrawer(e);
      window.selectProductForStepper(p.id);
    };
  }
  
  const drawer = document.getElementById('product-details-drawer');
  if (drawer) {
    drawer.style.display = 'flex';
    const content = drawer.querySelector('.drawer-content');
    if (content) {
      content.style.animation = 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
    }
  }
}

// Bind to window for UAT toggle handlers and inline HTML dashboard updates
window.renderAgentDashboard = renderAgentDashboard;
window.renderManagerDashboard = renderManagerDashboard;
window.renderAreaDashboard = renderAreaDashboard;
window.renderAdminDashboard = renderAdminDashboard;
window.handleUatRoleChange = handleUatRoleChange;
window.showProductDetails = showProductDetails;
window.closeProductDrawer = closeProductDrawer;

export function handleUatRoleChange() {
  const role = document.getElementById('uat-role').value;
  APP_STATE.currentUser.role = role;
  
  if (role === 'agent') {
    APP_STATE.currentUser.id = "AGT-101";
    APP_STATE.currentUser.name = "Piet van Zyl";
  } else if (role === 'manager') {
    APP_STATE.currentUser.id = "MGR-002";
    APP_STATE.currentUser.name = "Store Manager";
  } else if (role === 'area_manager') {
    APP_STATE.currentUser.id = "AM-909";
    APP_STATE.currentUser.name = "Area Director";
  } else if (role === 'admin') {
    APP_STATE.currentUser.id = "IT-801";
    APP_STATE.currentUser.name = "IT Operations";
  }

  updateSidebarMenuOptions();

  if (role === 'agent') switchRoute('agent-dashboard');
  else if (role === 'manager') switchRoute('manager-dashboard');
  else if (role === 'area_manager') switchRoute('area-dashboard');
  else if (role === 'admin') switchRoute('admin-dashboard');
  
  showToast(`UAT: Swapped role to ${role.toUpperCase()}`, "info");
}
