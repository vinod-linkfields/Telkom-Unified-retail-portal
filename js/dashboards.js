import { APP_STATE, MOCK_DB } from './state.js';
import { switchRoute, updateSidebarMenuOptions } from './routing.js';
import { renderPaginatedRows, showToast, openModal, closeModal } from './utils.js';
import { drawSVGDonutChart } from './reports.js';

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
    const promoIds = ['p-dev-2', 'p-sim-2', 'p-broad-1'];
    const promoProducts = promoIds.map(id => MOCK_DB.products.find(p => p.id === id)).filter(Boolean);
    
    promoContainer.innerHTML = promoProducts.map(p => {
      return `
        <div class="product-card" style="margin: 0; box-shadow: var(--shadow-sm); display: flex; flex-direction: column; justify-content: space-between; height: 100%; padding: 16px; border: 1px solid var(--border-color); border-radius: var(--radius-md); background: var(--bg-card);">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
              <span class="badge badge-success" style="font-size: 10px;">BEST SELLER</span>
              ${p.promo ? `<span class="badge badge-warning" style="font-size: 10px; background-color: var(--warning-light); color: var(--warning);">PROMO</span>` : ''}
            </div>
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

export function showProductDetails(productId) {
  const p = MOCK_DB.products.find(prod => prod.id === productId);
  if (!p) return;
  
  document.getElementById('product-details-modal-title').innerText = p.name;
  
  let specsHtml = `
    <div style="display: flex; flex-direction: column; gap: 12px;">
      <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 6px; font-size: 13px;">
        <span style="font-weight: 600; color: var(--text-secondary);">Category</span>
        <span style="color: var(--text-primary); font-weight: 700;">${p.category}</span>
      </div>
      <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 6px; font-size: 13px;">
        <span style="font-weight: 600; color: var(--text-secondary);">Deal ID</span>
        <span style="font-family: monospace; color: var(--telkom-blue-dark); font-weight: 700;">${p.dealId}</span>
      </div>
      <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 6px; font-size: 13px;">
        <span style="font-weight: 600; color: var(--text-secondary);">Contract Term</span>
        <span style="color: var(--text-primary); font-weight: 700;">${p.term || 24} Months</span>
      </div>
      <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 6px; font-size: 13px;">
        <span style="font-weight: 600; color: var(--text-secondary);">Allocations / Specs</span>
        <span style="color: var(--text-primary); text-align: right; max-width: 60%; font-weight: 600;">${p.allocation}</span>
      </div>
      <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 6px; font-size: 13px;">
        <span style="font-weight: 600; color: var(--text-secondary);">Once-off Fee</span>
        <span style="color: var(--text-primary); font-weight: 700;">R ${p.onceOff}</span>
      </div>
      <div style="display: flex; justify-content: space-between; padding-bottom: 6px; font-size: 13px;">
        <span style="font-weight: 600; color: var(--text-secondary);">Monthly Charge</span>
        <span style="color: var(--text-primary); font-weight: 800; font-size: 15px;">R ${p.price} /mo</span>
      </div>
  `;
  
  if (p.deviceInfo) {
    specsHtml += `
      <div style="margin-top: 10px; background-color: var(--bg-light); padding: 12px; border-radius: var(--radius-md); border-left: 4px solid var(--telkom-blue);">
        <strong style="display: block; font-size: 11px; color: var(--telkom-blue-dark); margin-bottom: 6px; text-transform: uppercase;">Device Specifications</strong>
        <div style="display: flex; justify-content: space-between; font-size: 12.5px; margin-bottom: 4px;">
          <span>Make:</span>
          <strong>${p.deviceInfo.make}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 12.5px; margin-bottom: 4px;">
          <span>Model:</span>
          <strong>${p.deviceInfo.model}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 12.5px;">
          <span>Default Color:</span>
          <strong>${p.deviceInfo.colour}</strong>
        </div>
      </div>
    `;
  }
  
  specsHtml += `</div>`;
  
  document.getElementById('product-details-modal-body').innerHTML = specsHtml;
  
  const ctaBtn = document.getElementById('product-details-modal-cta');
  if (ctaBtn) {
    ctaBtn.onclick = function() {
      closeModal('product-details-modal');
      window.selectProductForStepper(p.id);
    };
  }
  
  openModal('product-details-modal');
}

// Bind to window for UAT toggle handlers and inline HTML dashboard updates
window.renderAgentDashboard = renderAgentDashboard;
window.renderManagerDashboard = renderManagerDashboard;
window.renderAreaDashboard = renderAreaDashboard;
window.renderAdminDashboard = renderAdminDashboard;
window.handleUatRoleChange = handleUatRoleChange;
window.showProductDetails = showProductDetails;

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
