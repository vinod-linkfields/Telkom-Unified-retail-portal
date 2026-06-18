import { APP_STATE, MOCK_DB } from './state.js';
import { switchRoute, updateSidebarMenuOptions } from './routing.js';
import { showToast } from './utils.js';

export function renderAgentDashboard() {
  const recentOrders = APP_STATE.ordersList
    .filter(o => o.agent === APP_STATE.currentUser.id && o.store === APP_STATE.currentUser.branch)
    .slice(0, 5);

  const tbody = document.getElementById('agent-recent-orders-tbody');
  if (tbody) {
    tbody.innerHTML = '';
    if (recentOrders.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">No orders found.</td></tr>`;
    } else {
      recentOrders.forEach(o => {
        tbody.innerHTML += `
          <tr>
            <td><strong>${o.orderRef}</strong></td>
            <td>${o.customerName}</td>
            <td>${o.product}</td>
            <td>${o.date}</td>
            <td><span class="badge ${o.status === 'Fulfilled' ? 'badge-success' : 'badge-warning'}">${o.status}</span></td>
          </tr>
        `;
      });
    }
  }

  const agentTodayEl = document.getElementById('agent-today-count');
  if (agentTodayEl) agentTodayEl.innerText = recentOrders.length;
  
  const pendingEl = document.getElementById('agent-pending-payments');
  if (pendingEl) {
    pendingEl.innerText = APP_STATE.ordersList.filter(o => o.payment === 'Payment Pending').length;
  }
  
  const totalLdusEl = document.getElementById('agent-total-ldus');
  if (totalLdusEl) {
    totalLdusEl.innerText = "18";
  }
  
  const demoUnitsEl = document.getElementById('agent-demo-units');
  if (demoUnitsEl) {
    demoUnitsEl.innerText = "6";
  }
  
  const branchStock = MOCK_DB.stock[APP_STATE.currentUser.branch] || {};
  const stockAlertContainer = document.getElementById('agent-stock-alerts');
  if (stockAlertContainer) {
    stockAlertContainer.innerHTML = '';
    let oosCount = 0;
    for (const [sku, detail] of Object.entries(branchStock)) {
      if (detail.available === 0) {
        oosCount++;
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
    draftTbody.innerHTML = '';
    const myDrafts = APP_STATE.draftOrders.filter(d => d.agentId === APP_STATE.currentUser.id);
    if (myDrafts.length === 0) {
      draftTbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 20px;">No saved drafts found.</td></tr>`;
    } else {
      myDrafts.forEach(d => {
        const prodName = d.cart && d.cart.product ? d.cart.product.name : 'No Product';
        const getActiveStepsForProduct = window.getActiveStepsForProduct;
        let stepLabel = `Step ${d.currentStep}`;
        if (getActiveStepsForProduct) {
          const steps = getActiveStepsForProduct(d.cart.product);
          const stepIndex = steps.findIndex(s => s.id === d.currentStep);
          stepLabel = stepIndex > -1 ? `Step ${stepIndex + 1}: ${steps[stepIndex].label}` : `Step ${d.currentStep}`;
        }
        
        draftTbody.innerHTML += `
          <tr>
            <td><strong>${d.draftId}</strong></td>
            <td>${d.customer ? d.customer.name : '<span style="color: var(--text-muted);">No Customer Linked</span>'}</td>
            <td>${prodName}</td>
            <td><span class="badge badge-warning">${stepLabel}</span></td>
            <td>${d.date}</td>
            <td>
              <button class="btn btn-sm btn-primary" onclick="resumeDraftOrder('${d.draftId}')">Continue</button>
            </td>
          </tr>
        `;
      });
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
    agentsBody.innerHTML = `
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
    `;
  }
}

export function renderAreaDashboard() {
  const amTotalEl = document.getElementById('am-total-orders');
  if (amTotalEl) amTotalEl.innerText = APP_STATE.ordersList.length;
  const amPendingEl = document.getElementById('am-pending-approvals');
  if (amPendingEl) amPendingEl.innerText = APP_STATE.stockRequests.filter(r => r.status === 'Submitted').length;

  const pendingTbody = document.getElementById('am-pending-requests-tbody');
  if (!pendingTbody) return;
  pendingTbody.innerHTML = '';
  
  const pendingRequests = APP_STATE.stockRequests.filter(r => r.status === 'Submitted');
  if (pendingRequests.length === 0) {
    pendingTbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 20px;">No pending stock requests require approval.</td></tr>`;
  } else {
    pendingRequests.forEach(r => {
      pendingTbody.innerHTML += `
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
      `;
    });
  }
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
    logTbody.innerHTML = '';
    integrationLogs.forEach(l => {
      logTbody.innerHTML += `
        <tr>
          <td><code>${l.time}</code></td>
          <td><strong>${l.api}</strong></td>
          <td><span class="badge badge-success">${l.status}</span></td>
          <td>${l.latency}</td>
        </tr>
      `;
    });
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

// Bind to window for UAT toggle handlers and inline HTML dashboard updates
window.renderAgentDashboard = renderAgentDashboard;
window.renderManagerDashboard = renderManagerDashboard;
window.renderAreaDashboard = renderAreaDashboard;
window.renderAdminDashboard = renderAdminDashboard;
window.handleUatRoleChange = handleUatRoleChange;

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
