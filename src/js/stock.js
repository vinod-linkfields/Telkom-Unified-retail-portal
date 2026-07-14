import { MOCK_DB, DEVICE_CATALOGUE, APP_STATE, saveStockRequests } from './state.js';
import { paginateExistingTable, renderPaginatedRows, showToast, pushNotification, openModal, closeModal } from './utils.js';
import { renderAgentDashboard, renderAreaDashboard } from './dashboards.js';

let activeApprovalId = null;

// Render Stock Requests View
export function renderStockRequests() {
  const requestsBody = document.getElementById('stock-requests-tbody');
  if (!requestsBody) return;

  let filtered = APP_STATE.stockRequests;

  // Hide Area level requests from store agents/managers unless explicitly granted
  if (APP_STATE.currentUser.role === 'agent' || APP_STATE.currentUser.role === 'manager') {
    filtered = filtered.filter(r => r.storeId === APP_STATE.currentUser.branch);
  }

  const rows = filtered.map(r => {
    let actionsHtml = `<button class="btn btn-sm btn-secondary" onclick="viewStockRequestDetails('${r.id}')">Details</button>`;
    if (r.status === 'Submitted' && APP_STATE.currentUser.role === 'area_manager') {
      actionsHtml += `<button class="btn btn-sm btn-success" onclick="openApprovalModal('${r.id}')">Review</button>`;
    } else if (r.status === 'Draft' && (APP_STATE.currentUser.role === 'manager' || APP_STATE.currentUser.role === 'agent')) {
      actionsHtml += `<button class="btn btn-sm btn-primary" onclick="submitStockRequest('${r.id}')">Submit</button>`;
    }

    return `
      <tr>
        <td><strong>${r.id}</strong></td>
        <td><code>${r.storeId}</code></td>
        <td>${r.product}</td>
        <td><span class="badge badge-neutral">${r.qty} units</span></td>
        <td><span class="badge ${r.priority === 'Urgent' ? 'badge-danger' : 'badge-warning'}">${r.priority}</span></td>
        <td>${r.date}</td>
        <td><span class="badge ${r.status === 'Approved' ? 'badge-success' : (r.status === 'Declined' ? 'badge-danger' : 'badge-warning')}">${r.status}</span></td>
        <td><div class="table-action-group">${actionsHtml}</div></td>
      </tr>
    `;
  });

  renderPaginatedRows(requestsBody, rows, {
    emptyRow: `<tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 20px;">No stock requests found.</td></tr>`
  });
}

export function initiateStockRequest(sku, productName) {
  const selectContainer = document.getElementById('stock-req-select-container');
  const readonlyRow = document.getElementById('stock-req-readonly-row');
  
  if (!sku) {
    if (selectContainer) selectContainer.style.display = 'block';
    if (readonlyRow) readonlyRow.style.display = 'none';
    
    // Dynamically populate device selection dropdown from DEVICE_CATALOGUE
    const selectEl = document.getElementById('stock-req-device-select');
    if (selectEl) {
      let optionsHtml = '<option value="">-- Select Device --</option>';
      Object.keys(DEVICE_CATALOGUE).forEach(key => {
        const item = DEVICE_CATALOGUE[key];
        optionsHtml += `<option value="${key}|${item.name}">${item.name} (${key})</option>`;
      });
      selectEl.innerHTML = optionsHtml;
      selectEl.value = "";
    }
    
    document.getElementById('stock-req-sku').value = "";
    document.getElementById('stock-req-product').value = "";
  } else {
    if (selectContainer) selectContainer.style.display = 'none';
    if (readonlyRow) readonlyRow.style.display = 'flex';
    
    document.getElementById('stock-req-sku').value = sku;
    document.getElementById('stock-req-product').value = productName;
  }

  document.getElementById('stock-req-qty').value = "5";
  document.getElementById('stock-req-reason').value = "Customer Order";
  document.getElementById('stock-req-priority').value = "Urgent";
  document.getElementById('stock-req-notes').value = "";

  openModal('stock-request-modal');
}

export function handleStockRequestSubmit(e) {
  e.preventDefault();
  
  const sku = document.getElementById('stock-req-sku').value;
  const prod = document.getElementById('stock-req-product').value;
  
  if (!sku || !prod) {
    showToast("Please select a valid device.", "error");
    return;
  }

  const qty = parseInt(document.getElementById('stock-req-qty').value);
  const reason = document.getElementById('stock-req-reason').value;
  const priority = document.getElementById('stock-req-priority').value;
  const notes = document.getElementById('stock-req-notes').value;

  const newReq = {
    id: "REQ-" + Math.floor(1000 + Math.random() * 9000),
    storeId: APP_STATE.currentUser.branch,
    requestedBy: APP_STATE.currentUser.id,
    product: prod,
    sku: sku,
    qty: qty,
    reason: reason,
    priority: priority,
    notes: notes,
    status: "Submitted",
    date: new Date().toISOString().slice(0, 10) + " " + new Date().toTimeString().slice(0, 5)
  };

  APP_STATE.stockRequests.unshift(newReq);
  saveStockRequests();

  // Push area manager notification
  pushNotification(
    "New Stock Request",
    `Store ${newReq.storeId} requested ${newReq.qty}x ${newReq.product}.`,
    "stock_request",
    newReq.priority
  );

  closeModal('stock-request-modal');
  showToast(`Stock request ${newReq.id} submitted for Area approval.`, "success");
  
  if (APP_STATE.activeRoute === 'stock-requests') {
    switchStockTab('requests');
  } else if (APP_STATE.activeRoute === 'agent-dashboard') {
    renderAgentDashboard();
  }
}

export function openApprovalModal(reqId) {
  activeApprovalId = reqId;
  const req = APP_STATE.stockRequests.find(r => r.id === reqId);
  if (!req) return;

  document.getElementById('approve-req-id').innerText = req.id;
  document.getElementById('approve-store').innerText = req.storeId;
  document.getElementById('approve-product').innerText = req.product;
  document.getElementById('approve-qty').innerText = req.qty;
  document.getElementById('approve-priority').innerText = req.priority;
  document.getElementById('approve-priority').className = `badge ${req.priority === 'Urgent' ? 'badge-danger' : 'badge-warning'}`;
  document.getElementById('approve-notes').innerText = req.notes || "None";
  document.getElementById('approve-decision-qty').value = req.qty;
  
  // Set decline area display based on decision type dropdown
  const decSelect = document.getElementById('approve-decision-type');
  decSelect.value = "Approve";
  toggleDeclineReasonArea();

  openModal('approval-modal');
}

export function toggleDeclineReasonArea() {
  const decType = document.getElementById('approve-decision-type').value;
  const reasonDiv = document.getElementById('decline-reason-group');
  if (reasonDiv) {
    if (decType === 'Decline') {
      reasonDiv.style.display = 'block';
    } else {
      reasonDiv.style.display = 'none';
    }
  }
}

export function handleApprovalSubmit(e) {
  e.preventDefault();
  const decision = document.getElementById('approve-decision-type').value;
  const approvedQty = parseInt(document.getElementById('approve-decision-qty').value);
  const declineReason = document.getElementById('approve-decline-reason').value;
  const approvalNotes = document.getElementById('approve-decision-notes').value;

  const req = APP_STATE.stockRequests.find(r => r.id === activeApprovalId);
  if (!req) return;

  if (decision === 'Approve') {
    req.status = "Approved";
    req.approvedQty = approvedQty;
    
    // Add approved stock units to branch transact database
    const branchStock = MOCK_DB.stock[req.storeId];
    if (branchStock && branchStock[req.sku]) {
      branchStock[req.sku].available += approvedQty;
      branchStock[req.sku].onHand += approvedQty;
    }

    pushNotification(
      "Stock Request Approved",
      `Area Manager approved stock request ${req.id} for ${req.product}.`,
      "stock_approval",
      "Normal"
    );
  } else {
    req.status = "Declined";
    req.declineReason = declineReason;

    pushNotification(
      "Stock Request Declined",
      `Stock request ${req.id} declined. Reason: ${declineReason}.`,
      "stock_approval",
      "Normal"
    );
  }

  req.decidedBy = APP_STATE.currentUser.id;
  req.decisionDate = new Date().toISOString().slice(0, 10);
  req.approvalNotes = approvalNotes;

  saveStockRequests();
  closeModal('approval-modal');
  showToast(`Stock request status updated: ${req.status}`, decision === 'Approve' ? 'success' : 'danger');
  
  renderAreaDashboard();
}

export function viewStockRequestDetails(reqId) {
  const req = APP_STATE.stockRequests.find(r => r.id === reqId);
  if (!req) return;

  document.getElementById('det-req-id').innerText = req.id;
  
  const statusEl = document.getElementById('det-req-status');
  statusEl.innerText = req.status;
  statusEl.className = `badge ${req.status === 'Approved' ? 'badge-success' : (req.status === 'Declined' ? 'badge-danger' : 'badge-warning')}`;
  
  document.getElementById('det-req-store').innerText = req.storeId;
  document.getElementById('det-req-user').innerText = req.requestedBy;
  document.getElementById('det-req-date').innerText = req.date;
  document.getElementById('det-req-product').innerText = req.product;
  document.getElementById('det-req-sku').innerText = req.sku;
  document.getElementById('det-req-qty').innerText = req.qty;
  
  const priorityEl = document.getElementById('det-req-priority');
  priorityEl.innerText = req.priority;
  priorityEl.className = `badge ${req.priority === 'Urgent' ? 'badge-danger' : 'badge-warning'}`;
  
  document.getElementById('det-req-reason').innerText = req.reason;
  document.getElementById('det-req-notes').innerText = req.notes || "None provided";

  const approvalSection = document.getElementById('det-approval-section');
  if (req.status === 'Approved' || req.status === 'Declined') {
    approvalSection.style.display = 'block';
    document.getElementById('det-approved-by').innerText = req.decidedBy || "N/A";
    document.getElementById('det-approved-date').innerText = req.decisionDate || "N/A";
    document.getElementById('det-approval-notes').innerText = req.approvalNotes || "None";

    const qtyRow = document.getElementById('det-approved-qty-row');
    const declineRow = document.getElementById('det-decline-reason-row');

    if (req.status === 'Approved') {
      qtyRow.style.display = 'flex';
      declineRow.style.display = 'none';
      document.getElementById('det-approved-qty').innerText = req.approvedQty || req.qty;
    } else {
      qtyRow.style.display = 'none';
      declineRow.style.display = 'flex';
      document.getElementById('det-decline-reason').innerText = req.declineReason || "Alternative product suggested";
    }
  } else {
    approvalSection.style.display = 'none';
  }

  openModal('stock-request-details-modal');
}

export function renderStoreInventoryTab() {
  const panel = document.getElementById('stock-panel-inventory');
  if (!panel) return;

  const branch = APP_STATE.currentUser.branch;
  const categories = ["Phones", "Tablets", "Laptops"];

  let html = '';

  categories.forEach(cat => {
    let devicesHtml = '';
    
    Object.keys(DEVICE_CATALOGUE).forEach(sku => {
      const dev = DEVICE_CATALOGUE[sku];
      if (dev.category === cat) {
        const stockInfo = MOCK_DB.stock[branch]?.[sku] || { onHand: 0, reserved: 0, available: 0 };
        const isLow = stockInfo.available < 3;
        
        devicesHtml += `
          <tr>
            <td><strong>${dev.name}</strong></td>
            <td><code>${sku}</code></td>
            <td>${dev.model}</td>
            <td>${dev.colour}</td>
            <td><span class="badge badge-neutral">${stockInfo.onHand} units</span></td>
            <td><span class="badge ${stockInfo.available > 0 ? (isLow ? 'badge-warning' : 'badge-success') : 'badge-danger'}">
              ${stockInfo.available > 0 ? (isLow ? `Low Stock (${stockInfo.available})` : `In Stock (${stockInfo.available})`) : 'Out of Stock'}
            </span></td>
            <td>
              <button class="btn btn-sm btn-primary" onclick="initiateStockRequest('${sku}', '${dev.name}')">Request Stock</button>
            </td>
          </tr>
        `;
      }
    });

    html += `
      <div class="panel" style="margin-bottom: 24px;">
        <div class="panel-header">
          <span class="panel-title">${cat} Collection</span>
        </div>
        <div class="panel-body" style="padding: 0;">
          <div class="table-container" style="margin: 0; border: none; border-radius: 0;">
            <table class="custom-table">
              <thead>
                <tr>
                  <th>Device Model</th>
                  <th>SKU Code</th>
                  <th>Specs</th>
                  <th>Colour</th>
                  <th>On Hand</th>
                  <th>Available</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${devicesHtml || `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 16px;">No devices registered in this category.</td></tr>`}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  });

  panel.innerHTML = html;
  panel.querySelectorAll('tbody').forEach((tbody, index) => {
    paginateExistingTable(tbody, {
      tableId: `store-inventory-${categories[index] || index}`
    });
  });
}

export function renderLowStockTab() {
  const panel = document.getElementById('stock-panel-lowstock');
  if (!panel) return;

  const branch = APP_STATE.currentUser.branch;
  let lowStockHtml = '';

  Object.keys(DEVICE_CATALOGUE).forEach(sku => {
    const dev = DEVICE_CATALOGUE[sku];
    const stockInfo = MOCK_DB.stock[branch]?.[sku] || { onHand: 0, reserved: 0, available: 0 };
    
    if (stockInfo.available < 3) {
      const isOos = stockInfo.available === 0;
      
      lowStockHtml += `
        <tr>
          <td><span class="badge badge-info">${dev.category}</span></td>
          <td><strong>${dev.name}</strong></td>
          <td><code>${sku}</code></td>
          <td>${dev.model}</td>
          <td><span class="badge badge-neutral">${stockInfo.onHand} units</span></td>
          <td><span class="badge ${isOos ? 'badge-danger' : 'badge-warning'}">
            ${isOos ? 'Out of Stock' : `Low Stock (${stockInfo.available})`}
          </span></td>
          <td>
            <button class="btn btn-sm ${isOos ? 'btn-danger' : 'btn-warning'}" onclick="initiateStockRequest('${sku}', '${dev.name}')">
              ${isOos ? 'Request Stock' : 'Request Replenishment'}
            </button>
          </td>
        </tr>
      `;
    }
  });

  panel.innerHTML = `
    <div class="panel">
      <div class="panel-header">
        <span class="panel-title" style="color: var(--danger); font-weight: 700;">Critical Inventory Alert: Low & Out of Stock Items</span>
      </div>
      <div class="panel-body" style="padding: 0;">
        <div class="table-container" style="margin: 0; border: none; border-radius: 0;">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Device Model</th>
                <th>SKU Code</th>
                <th>Specs</th>
                <th>On Hand</th>
                <th>Available</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${lowStockHtml || `<tr><td colspan="7" style="text-align: center; color: var(--success); font-weight: 600; padding: 24px;">✓ Great news! All inventory models are well-stocked.</td></tr>`}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
  paginateExistingTable(panel.querySelector('tbody'), {
    tableId: 'low-stock-alerts'
  });
}

export function handleStockReqDeviceSelectChange(val) {
  if (!val) {
    document.getElementById('stock-req-sku').value = "";
    document.getElementById('stock-req-product').value = "";
    return;
  }
  
  const [sku, productName] = val.split('|');
  document.getElementById('stock-req-sku').value = sku;
  document.getElementById('stock-req-product').value = productName;
}

export function switchStockTab(tabName) {
  if (!window.__BYPASS_TAB_URL_SYNC__) {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', tabName);
      window.history.pushState({ route: 'stock-requests', tab: tabName }, '', url.pathname + url.search + url.hash);
    } catch(e) {}
  }

  document.querySelectorAll('.stock-tab-panel').forEach(p => p.style.display = 'none');
  const targetPanel = document.getElementById(`stock-panel-${tabName}`);
  if (targetPanel) {
    targetPanel.style.display = 'block';
  }

  document.querySelectorAll('.tab-navigation .tab-btn').forEach(btn => {
    btn.style.borderBottom = '3px solid transparent';
    btn.style.color = 'var(--text-secondary)';
    btn.style.fontWeight = '600';
  });

  const activeBtn = document.getElementById(`stock-tab-btn-${tabName}`);
  if (activeBtn) {
    activeBtn.style.borderBottom = '3px solid var(--telkom-blue)';
    activeBtn.style.color = 'var(--telkom-blue-dark)';
  }

  if (tabName === 'inventory') {
    renderStoreInventoryTab();
  } else if (tabName === 'lowstock') {
    renderLowStockTab();
  } else if (tabName === 'requests') {
    renderStockRequests();
  }
}

export function submitStockRequest(reqId) {
  const req = APP_STATE.stockRequests.find(r => r.id === reqId);
  if (req) {
    req.status = 'Submitted';
    saveStockRequests();
    pushNotification(
      "New Stock Request",
      `Store ${req.storeId} requested ${req.qty}x ${req.product}.`,
      "stock_request",
      req.priority
    );
    showToast(`Stock request ${reqId} submitted for Area approval.`, "success");
    renderStockRequests();
  }
}

// Bind to window for inline onclick attributes
window.renderStockRequests = renderStockRequests;
window.initiateStockRequest = initiateStockRequest;
window.handleStockRequestSubmit = handleStockRequestSubmit;
window.openApprovalModal = openApprovalModal;
window.toggleDeclineReasonArea = toggleDeclineReasonArea;
window.handleApprovalSubmit = handleApprovalSubmit;
window.viewStockRequestDetails = viewStockRequestDetails;
window.renderStoreInventoryTab = renderStoreInventoryTab;
window.renderLowStockTab = renderLowStockTab;
window.handleStockReqDeviceSelectChange = handleStockReqDeviceSelectChange;
window.switchStockTab = switchStockTab;
window.submitStockRequest = submitStockRequest;
