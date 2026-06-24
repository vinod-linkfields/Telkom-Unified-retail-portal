import { MOCK_DB, APP_STATE, saveOrders, saveDraftOrders } from './state.js';
import { renderPaginatedRows, showToast, pushNotification, maskID, maskPassport, openModal, closeModal } from './utils.js';
import { switchRoute } from './routing.js';
import { renderStepper } from './stepper.js';

// Render Order Tracking View
function applyOrderFilters(list, isDraft = false) {
  let result = [...list];

  // 1. Search filter (Ref or Customer Name)
  const searchVal = document.getElementById('tracking-search-ref') ? document.getElementById('tracking-search-ref').value.trim().toLowerCase() : '';
  if (searchVal) {
    result = result.filter(o => {
      const ref = isDraft ? (o.draftId || '') : (o.orderRef || '');
      const cust = o.customerName || '';
      return ref.toLowerCase().includes(searchVal) || cust.toLowerCase().includes(searchVal);
    });
  }

  // 2. Start Date filter
  const startDateVal = document.getElementById('tracking-filter-start-date') ? document.getElementById('tracking-filter-start-date').value : '';
  if (startDateVal) {
    result = result.filter(o => {
      const dateStr = isDraft ? (o.timestamp || '') : (o.date || '');
      const ymd = dateStr.slice(0, 10);
      return ymd >= startDateVal;
    });
  }

  // 3. End Date filter
  let endDateVal = document.getElementById('tracking-filter-end-date') ? document.getElementById('tracking-filter-end-date').value : '';
  const startDateValChecked = document.getElementById('tracking-filter-start-date') ? document.getElementById('tracking-filter-start-date').value : '';
  if (startDateValChecked && endDateVal && endDateVal < startDateValChecked) {
    showToast("End date cannot be before start date.", "warning");
    document.getElementById('tracking-filter-end-date').value = '';
    endDateVal = '';
  }
  if (endDateVal) {
    result = result.filter(o => {
      const dateStr = isDraft ? (o.timestamp || '') : (o.date || '');
      const ymd = dateStr.slice(0, 10);
      return ymd <= endDateVal;
    });
  }

  // 4. Product filter
  const productVal = document.getElementById('tracking-filter-product') ? document.getElementById('tracking-filter-product').value : '';
  if (productVal) {
    result = result.filter(o => {
      const prodName = isDraft ? (o.product ? o.product.name : '') : (o.product || '');
      return prodName === productVal;
    });
  }

  return result;
}

function applyVisibilityFilters(list, isDraft = false) {
  const viewAllNetwork = document.getElementById('tracking-view-all') && document.getElementById('tracking-view-all').checked;
  if (viewAllNetwork) {
    return list;
  }
  
  if (APP_STATE.currentUser.role === 'agent') {
    return list.filter(o => {
      const agentId = isDraft ? (o.agentId || '') : (o.agent || '');
      return agentId === APP_STATE.currentUser.id;
    });
  } else if (APP_STATE.currentUser.role === 'manager') {
    return list.filter(o => {
      const storeVal = isDraft ? (o.branch || '') : (o.store || '');
      return storeVal === APP_STATE.currentUser.branch;
    });
  }
  return list;
}

export function renderOrderTracking() {
  const container = document.getElementById('tracking-table-container');
  if (!container) return;

  const tab = APP_STATE.activeTrackingTab || 'submitted';

  // Populate dynamic product dropdown
  const productSelect = document.getElementById('tracking-filter-product');
  if (productSelect && productSelect.options.length <= 1) {
    APP_STATE.products.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.name;
      opt.textContent = p.name;
      productSelect.appendChild(opt);
    });
  }

  // Calculate counts using search filter & permissions
  const searchValForCount = document.getElementById('tracking-search-ref') ? document.getElementById('tracking-search-ref').value.trim().toLowerCase() : '';

  // Submitted Count
  let submittedFilteredForCount = (APP_STATE.ordersList || []).filter(o => o.status !== 'Cancelled');
  submittedFilteredForCount = applyVisibilityFilters(submittedFilteredForCount, false);
  if (searchValForCount) {
    submittedFilteredForCount = submittedFilteredForCount.filter(o => o.orderRef.toLowerCase().includes(searchValForCount) || o.customerName.toLowerCase().includes(searchValForCount));
  }
  const submittedCount = submittedFilteredForCount.length;

  // Pending Count
  let pendingDrafts = APP_STATE.draftOrders || [];
  pendingDrafts = applyVisibilityFilters(pendingDrafts, true);
  if (searchValForCount) {
    pendingDrafts = pendingDrafts.filter(d => d.draftId.toLowerCase().includes(searchValForCount) || d.customerName.toLowerCase().includes(searchValForCount));
  }

  let pendingSubmitted = (APP_STATE.ordersList || []).filter(o => {
    if (o.status === 'Cancelled') return false;
    const isRicaPending = o.isSimProduct && o.ricaStatus === 'Pending';
    const isActivationPending = o.isSimProduct && o.ricaStatus === 'Verified' && !o.simActivationNumber;
    const isPaymentPending = !o.payment.includes('Complete');
    return isRicaPending || isActivationPending || isPaymentPending;
  });
  pendingSubmitted = applyVisibilityFilters(pendingSubmitted, false);
  if (searchValForCount) {
    pendingSubmitted = pendingSubmitted.filter(o => o.orderRef.toLowerCase().includes(searchValForCount) || o.customerName.toLowerCase().includes(searchValForCount));
  }
  const pendingCount = pendingDrafts.length + pendingSubmitted.length;

  // Cancelled Count
  let cancelledFilteredForCount = (APP_STATE.ordersList || []).filter(o => o.status === 'Cancelled');
  cancelledFilteredForCount = applyVisibilityFilters(cancelledFilteredForCount, false);
  if (searchValForCount) {
    cancelledFilteredForCount = cancelledFilteredForCount.filter(o => o.orderRef.toLowerCase().includes(searchValForCount) || o.customerName.toLowerCase().includes(searchValForCount));
  }
  const cancelledCount = cancelledFilteredForCount.length;

  // Render dynamic badges on the tab buttons
  const submittedTabBtn = document.getElementById('tracking-tab-btn-submitted');
  const pendingTabBtn = document.getElementById('tracking-tab-btn-pending');
  const cancelledTabBtn = document.getElementById('tracking-tab-btn-cancelled');

  if (submittedTabBtn) {
    submittedTabBtn.innerHTML = `Submitted Orders <span style="margin-left: 6px; display: inline-block; padding: 2px 6px; font-size: 11px; border-radius: 10px; background-color: ${tab === 'submitted' ? 'var(--telkom-blue-dark)' : 'var(--border-color)'}; color: ${tab === 'submitted' ? 'var(--text-white)' : 'var(--text-secondary)'}; font-weight: 600;">${submittedCount}</span>`;
  }
  if (pendingTabBtn) {
    pendingTabBtn.innerHTML = `Pending Orders <span style="margin-left: 6px; display: inline-block; padding: 2px 6px; font-size: 11px; border-radius: 10px; background-color: ${tab === 'pending' ? 'var(--telkom-blue-dark)' : 'var(--border-color)'}; color: ${tab === 'pending' ? 'var(--text-white)' : 'var(--text-secondary)'}; font-weight: 600;">${pendingCount}</span>`;
  }
  if (cancelledTabBtn) {
    cancelledTabBtn.innerHTML = `Cancelled Orders <span style="margin-left: 6px; display: inline-block; padding: 2px 6px; font-size: 11px; border-radius: 10px; background-color: ${tab === 'cancelled' ? 'var(--telkom-blue-dark)' : 'var(--border-color)'}; color: ${tab === 'cancelled' ? 'var(--text-white)' : 'var(--text-secondary)'}; font-weight: 600;">${cancelledCount}</span>`;
  }

  if (tab === 'submitted') {
    let filtered = (APP_STATE.ordersList || []).filter(o => o.status !== 'Cancelled');
    filtered = applyOrderFilters(filtered, false);
    filtered = applyVisibilityFilters(filtered, false);

    const rows = filtered.map(o => `
      <tr>
        <td><strong>${o.orderRef}</strong></td>
        <td>${o.customerName}</td>
        <td>${o.product}</td>
        <td><code>${o.store}</code></td>
        <td>${o.date}</td>
        <td><span class="badge ${o.status === 'Fulfilled' || o.status === 'Active' ? 'badge-success' : 'badge-warning'}">${o.status}</span></td>
        <td>
          <button class="btn btn-sm btn-secondary" onclick="viewOrderDetails('${o.orderRef}')" style="margin-right: 5px;">Details</button>
          <button class="btn btn-sm btn-success" onclick="downloadOrderReceipt('${o.orderRef}')">Receipt</button>
        </td>
      </tr>
    `);

    container.innerHTML = `
      <table class="custom-table">
        <thead>
          <tr>
            <th>Order Ref</th>
            <th>Customer</th>
            <th>Product Name</th>
            <th>Branch Store</th>
            <th>Date Captured</th>
            <th>OMS Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="tracking-table-body">
        </tbody>
      </table>
    `;
    renderPaginatedRows(document.getElementById('tracking-table-body'), rows, {
      emptyRow: `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 20px;">No tracking orders found.</td></tr>`
    });
  } else if (tab === 'pending') {
    let draftsFiltered = APP_STATE.draftOrders || [];
    draftsFiltered = applyOrderFilters(draftsFiltered, true);
    draftsFiltered = applyVisibilityFilters(draftsFiltered, true);

    let submittedPendingFiltered = (APP_STATE.ordersList || []).filter(o => {
      if (o.status === 'Cancelled') return false;
      const isRicaPending = o.isSimProduct && o.ricaStatus === 'Pending';
      const isActivationPending = o.isSimProduct && o.ricaStatus === 'Verified' && !o.simActivationNumber;
      const isPaymentPending = !o.payment.includes('Complete');
      return isRicaPending || isActivationPending || isPaymentPending;
    });
    submittedPendingFiltered = applyOrderFilters(submittedPendingFiltered, false);
    submittedPendingFiltered = applyVisibilityFilters(submittedPendingFiltered, false);

    const draftRows = draftsFiltered.map(d => `
      <tr style="background-color: rgba(15, 48, 87, 0.02);">
        <td><span class="badge badge-secondary" style="letter-spacing:0.5px;">DRAFT</span></td>
        <td>${d.customerName || 'Anonymous Customer'}</td>
        <td>${d.product ? d.product.name : 'Unknown Product'}</td>
        <td><code>${d.branch}</code></td>
        <td>${d.timestamp.replace('T', ' ').substring(0,16)}</td>
        <td><span class="badge badge-secondary">Awaiting Completion</span></td>
        <td>
          <button class="btn btn-sm btn-primary" onclick="resumeDraftOrder('${d.draftId}')">Resume checkout</button>
        </td>
      </tr>
    `);

    const submittedRows = submittedPendingFiltered.map(o => {
      const actionBtnHtml = `<button class="btn btn-sm btn-secondary" onclick="viewOrderDetails('${o.orderRef}')">Resolve blocks</button>`;
      let detailText = "Awaiting Action";
      if (o.ricaStatus === 'Pending') {
        detailText = "RICA Verification Required";
      } else if (o.ricaStatus === 'Verified' && !o.simActivationNumber) {
        detailText = "Awaiting SIM Serial Input";
      } else if (!o.payment.includes('Complete')) {
        detailText = "POS Payment Failure";
      }

      return `
        <tr>
          <td><strong>${o.orderRef}</strong></td>
          <td>${o.customerName}</td>
          <td>${o.product}</td>
          <td><code>${o.store}</code></td>
          <td>${o.date}</td>
          <td><span class="badge badge-warning">${detailText}</span></td>
          <td>
            ${actionBtnHtml}
          </td>
        </tr>
      `;
    });

    const rows = [...draftRows, ...submittedRows];

    container.innerHTML = `
      <table class="custom-table">
        <thead>
          <tr>
            <th>Order Ref</th>
            <th>Customer</th>
            <th>Product Name</th>
            <th>Branch Store</th>
            <th>Date Saved</th>
            <th>Block Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="tracking-pending-table-body">
        </tbody>
      </table>
    `;
    renderPaginatedRows(document.getElementById('tracking-pending-table-body'), rows, {
      emptyRow: `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 20px;">No pending orders or drafts.</td></tr>`
    });
  } else if (tab === 'cancelled') {
    let filtered = (APP_STATE.ordersList || []).filter(o => o.status === 'Cancelled');
    filtered = applyOrderFilters(filtered, false);
    filtered = applyVisibilityFilters(filtered, false);

    const rows = filtered.map(o => {
      const audit = o.cancelledAudit || {};
      const dateCancelled = audit.cancellationDate || o.date || 'N/A';
      const cancelledBy = audit.cancelledBy || o.agent || 'AGT-101';

      return `
        <tr>
          <td><strong>${o.orderRef}</strong></td>
          <td>${o.customerName}</td>
          <td>${o.product}</td>
          <td>${o.date}</td>
          <td>${dateCancelled}</td>
          <td><code>${cancelledBy}</code></td>
          <td><span class="badge badge-danger">Cancelled</span></td>
          <td>
            <button class="btn btn-sm btn-secondary" onclick="viewOrderDetails('${o.orderRef}')">Details</button>
          </td>
        </tr>
      `;
    });

    container.innerHTML = `
      <table class="custom-table">
        <thead>
          <tr>
            <th>Order Ref</th>
            <th>Customer</th>
            <th>Product Name</th>
            <th>Date Created</th>
            <th>Date Cancelled</th>
            <th>Cancelled By</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="tracking-cancelled-table-body">
        </tbody>
      </table>
    `;
    renderPaginatedRows(document.getElementById('tracking-cancelled-table-body'), rows, {
      emptyRow: `<tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 20px;">No cancelled orders found.</td></tr>`
    });
  }
}

export function switchTrackingTab(tabName) {
  APP_STATE.activeTrackingTab = tabName;
  const submittedBtn = document.getElementById('tracking-tab-btn-submitted');
  const pendingBtn = document.getElementById('tracking-tab-btn-pending');
  const cancelledBtn = document.getElementById('tracking-tab-btn-cancelled');
  
  if (submittedBtn && pendingBtn) {
    submittedBtn.classList.remove('active');
    submittedBtn.style.borderBottom = '3px solid transparent';
    submittedBtn.style.color = 'var(--text-secondary)';
    submittedBtn.style.fontWeight = '600';

    pendingBtn.classList.remove('active');
    pendingBtn.style.borderBottom = '3px solid transparent';
    pendingBtn.style.color = 'var(--text-secondary)';
    pendingBtn.style.fontWeight = '600';

    if (cancelledBtn) {
      cancelledBtn.classList.remove('active');
      cancelledBtn.style.borderBottom = '3px solid transparent';
      cancelledBtn.style.color = 'var(--text-secondary)';
      cancelledBtn.style.fontWeight = '600';
    }

    if (tabName === 'submitted') {
      submittedBtn.classList.add('active');
      submittedBtn.style.borderBottom = '3px solid var(--telkom-blue)';
      submittedBtn.style.color = 'var(--telkom-blue-dark)';
      submittedBtn.style.fontWeight = '700';
    } else if (tabName === 'pending') {
      pendingBtn.classList.add('active');
      pendingBtn.style.borderBottom = '3px solid var(--telkom-blue)';
      pendingBtn.style.color = 'var(--telkom-blue-dark)';
      pendingBtn.style.fontWeight = '700';
    } else if (tabName === 'cancelled' && cancelledBtn) {
      cancelledBtn.classList.add('active');
      cancelledBtn.style.borderBottom = '3px solid var(--telkom-blue)';
      cancelledBtn.style.color = 'var(--telkom-blue-dark)';
      cancelledBtn.style.fontWeight = '700';
    }
  }
  renderOrderTracking();
}

export function switchModalTab(tabName) {
  const omsPanel = document.getElementById('modal-panel-oms');
  const debicheckPanel = document.getElementById('modal-panel-debicheck');
  const cancellationPanel = document.getElementById('modal-panel-cancellation');
  const omsBtn = document.getElementById('modal-tab-btn-oms');
  const debicheckBtn = document.getElementById('modal-tab-btn-debicheck');
  const cancellationBtn = document.getElementById('modal-tab-btn-cancellation');
  
  if (omsPanel) omsPanel.style.display = 'none';
  if (debicheckPanel) debicheckPanel.style.display = 'none';
  if (cancellationPanel) cancellationPanel.style.display = 'none';

  if (omsBtn) {
    omsBtn.classList.remove('active');
    omsBtn.style.borderBottom = '3px solid transparent';
    omsBtn.style.color = 'var(--text-secondary)';
    omsBtn.style.fontWeight = '600';
  }
  if (debicheckBtn) {
    debicheckBtn.classList.remove('active');
    debicheckBtn.style.borderBottom = '3px solid transparent';
    debicheckBtn.style.color = 'var(--text-secondary)';
    debicheckBtn.style.fontWeight = '600';
  }
  if (cancellationBtn) {
    cancellationBtn.classList.remove('active');
    cancellationBtn.style.borderBottom = '3px solid transparent';
    cancellationBtn.style.color = 'var(--text-secondary)';
    cancellationBtn.style.fontWeight = '600';
  }

  if (tabName === 'oms') {
    if (omsPanel) omsPanel.style.display = 'grid';
    if (omsBtn) {
      omsBtn.classList.add('active');
      omsBtn.style.borderBottom = '3px solid var(--telkom-blue)';
      omsBtn.style.color = 'var(--telkom-blue-dark)';
      omsBtn.style.fontWeight = '700';
    }
  } else if (tabName === 'debicheck') {
    if (debicheckPanel) debicheckPanel.style.display = 'block';
    if (debicheckBtn) {
      debicheckBtn.classList.add('active');
      debicheckBtn.style.borderBottom = '3px solid var(--telkom-blue)';
      debicheckBtn.style.color = 'var(--telkom-blue-dark)';
      debicheckBtn.style.fontWeight = '700';
    }
  } else if (tabName === 'cancellation') {
    if (cancellationPanel) cancellationPanel.style.display = 'block';
    if (cancellationBtn) {
      cancellationBtn.classList.add('active');
      cancellationBtn.style.borderBottom = '3px solid var(--telkom-blue)';
      cancellationBtn.style.color = 'var(--telkom-blue-dark)';
      cancellationBtn.style.fontWeight = '700';
    }
  }
}

export function viewOrderDetails(orderRef) {
  const order = APP_STATE.ordersList.find(o => o.orderRef === orderRef);
  if (!order) return;

  // Reset modal tab to 'oms'
  switchModalTab('oms');

  const cancellationTabBtn = document.getElementById('modal-tab-btn-cancellation');
  if (cancellationTabBtn) {
    if (order.status === 'Cancelled') {
      cancellationTabBtn.style.display = 'inline-block';
    } else {
      cancellationTabBtn.style.display = 'none';
    }
  }

  document.getElementById('view-order-ref').innerText = order.orderRef;
  document.getElementById('view-order-status').innerText = order.status;
  document.getElementById('view-order-status').className = `badge ${order.status === 'Fulfilled' || order.status === 'Active' ? 'badge-success' : (order.status === 'Cancelled' ? 'badge-danger' : 'badge-warning')}`;
  document.getElementById('view-order-cust').innerText = order.customerName;
  document.getElementById('view-order-acct').innerText = order.accountNo;
  
  const productText = order.product + (order.selectedColor ? ` (${order.selectedColor})` : '');
  document.getElementById('view-order-prod').innerText = productText;
  
  document.getElementById('view-order-store').innerText = order.store;
  document.getElementById('view-order-agent').innerText = order.agent;
  document.getElementById('view-order-date').innerText = order.date;
  document.getElementById('view-order-pay').innerText = order.payment;
  document.getElementById('view-order-pay').className = `badge ${order.payment.includes('Complete') ? 'badge-success' : 'badge-danger'}`;

  // Populate Contract Details
  const product = MOCK_DB.products.find(p => p.name === order.product);
  const contractPlanEl = document.getElementById('view-order-contract-plan');
  const onceOffEl = document.getElementById('view-order-once-off');
  if (contractPlanEl) {
    contractPlanEl.innerText = product ? `R${product.price} /mo (${product.term} Months)` : 'N/A';
  }
  if (onceOffEl) {
    onceOffEl.innerText = product ? `R${product.onceOff}` : 'N/A';
  }

  // Populate RICA & SIM badges
  const ricaStatusEl = document.getElementById('view-order-rica-status');
  const simStatusEl = document.getElementById('view-order-sim-status');
  if (ricaStatusEl) {
    ricaStatusEl.innerText = order.ricaStatus || 'N/A';
    ricaStatusEl.className = `badge ${order.ricaStatus === 'Verified' ? 'badge-success' : (order.ricaStatus === 'Pending' ? 'badge-warning' : 'badge-secondary')}`;
  }
  if (simStatusEl) {
    simStatusEl.innerText = order.simActivationNumber ? 'Activated' : (order.isSimProduct ? 'Pending' : 'N/A');
    simStatusEl.className = `badge ${order.simActivationNumber ? 'badge-success' : (order.isSimProduct ? 'badge-warning' : 'badge-secondary')}`;
  }

  // Populate dynamic timeline
  const timelineEl = document.getElementById('view-order-timeline');
  if (timelineEl) {
    let timelineHtml = `
      <div style="margin-bottom: 20px; position:relative;">
        <div style="position:absolute; left:-29px; top:2px; width:12px; height:12px; border-radius:50%; background-color: var(--success); border: 2px solid white;"></div>
        <strong>Order captured & submitted to OMS</strong>
        <div style="font-size:11px; color:var(--text-muted)">Completed successfully at ${order.date}. Order Ref: ${order.orderRef}</div>
      </div>
    `;

    const isPaid = order.payment.includes('Complete');
    timelineHtml += `
      <div style="margin-bottom: 20px; position:relative;">
        <div style="position:absolute; left:-29px; top:2px; width:12px; height:12px; border-radius:50%; background-color: ${isPaid ? 'var(--success)' : 'var(--danger)'}; border: 2px solid white;"></div>
        <strong>POS Terminal Card Payment</strong>
        <div style="font-size:11px; color:var(--text-muted)">State: ${order.payment}</div>
      </div>
    `;

    if (order.isSimProduct) {
      const isRicaVerified = order.ricaStatus === 'Verified';
      timelineHtml += `
        <div style="margin-bottom: 20px; position:relative;">
          <div style="position:absolute; left:-29px; top:2px; width:12px; height:12px; border-radius:50%; background-color: ${isRicaVerified ? 'var(--success)' : 'var(--warning)'}; border: 2px solid white;"></div>
          <strong>RICA Verification Gateway</strong>
          <div style="font-size:11px; color:var(--text-muted)">Status: ${order.ricaStatus}</div>
        </div>
      `;

      const isSimActivated = !!order.simActivationNumber;
      timelineHtml += `
        <div style="margin-bottom: 20px; position:relative;">
          <div style="position:absolute; left:-29px; top:2px; width:12px; height:12px; border-radius:50%; background-color: ${isSimActivated ? 'var(--success)' : 'var(--warning)'}; border: 2px solid white;"></div>
          <strong>HLR Network SIM Activation</strong>
          <div style="font-size:11px; color:var(--text-muted)">ICCID: ${order.simActivationNumber || 'Awaiting activation'}</div>
        </div>
      `;
    }

    const isFulfilled = order.status === 'Fulfilled' || order.status === 'Active';
    timelineHtml += `
      <div style="position:relative;">
        <div style="position:absolute; left:-29px; top:2px; width:12px; height:12px; border-radius:50%; background-color: ${isFulfilled ? 'var(--success)' : (order.status === 'Cancelled' ? 'var(--danger)' : 'var(--warning)')}; border: 2px solid white;"></div>
        <strong>OMS Order Provisioning Finalization</strong>
        <div style="font-size:11px; color:var(--text-muted)">Status: ${order.status}</div>
      </div>
    `;

    timelineEl.innerHTML = timelineHtml;
  }

  // Populate dynamic documents list
  const docsEl = document.getElementById('view-order-docs');
  if (docsEl) {
    const customer = MOCK_DB.crm.find(c => c.accountNumber === order.accountNo);
    const docs = customer ? customer.documents : null;
    let docsHtml = '';

    if (docs && Object.keys(docs).length > 0) {
      docsHtml += `<div style="display: flex; flex-direction: column; gap: 8px;">`;
      const docLabels = {
        idDoc: "Identity Document",
        bankStatements: "Last 3 Months Bank Statements",
        proofAddress: "Proof of Address",
        companyReg: "Company Registration Document"
      };
      Object.keys(docs).forEach(key => {
        const doc = docs[key];
        docsHtml += `
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; border: 1px solid var(--border-color); border-radius: var(--radius-md); background-color: var(--bg-light); font-size: 12px;">
            <div>
              <strong>${docLabels[key] || key}</strong>
              <div style="font-size: 10px; color: var(--text-secondary);">${doc.name} (${doc.size || '1.2 MB'})</div>
            </div>
            <span class="badge badge-success" style="font-size: 9px; padding: 2px 6px;">Uploaded</span>
          </div>
        `;
      });
      docsHtml += `</div>`;
    } else {
      docsHtml = `<div style="color: var(--text-muted); font-style: italic; font-size: 12px; padding: 4px 0;">No supporting documents uploaded for this customer profile.</div>`;
    }
    docsEl.innerHTML = docsHtml;
  }

  const ricaPanel = document.getElementById('order-details-rica-panel');
  const isSim = order.isSimProduct || (order.type === 'Mobile' || order.product.includes('SIM') || order.product.includes('Contract'));
  if (isSim && order.status !== 'Cancelled' && ricaPanel) {
    ricaPanel.style.display = 'block';
    renderOrderActivationWorkflow(order, ricaPanel, true);
  } else if (ricaPanel) {
    ricaPanel.style.display = 'none';
  }

  const cancellationPanel = document.getElementById('modal-panel-cancellation');
  if (cancellationPanel) {
    if (order.status === 'Cancelled') {
      const audit = order.cancelledAudit || {};
      const cancelledBy = audit.cancelledBy || order.agent || 'AGT-101';
      const cancellationDate = audit.cancellationDate || order.date || 'N/A';
      const lastCompletedStep = audit.lastCompletedStep || 'Step 1: Check Avail';
      const reason = audit.reason || 'No reason provided';

      cancellationPanel.innerHTML = `
        <div style="background-color: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 20px; font-size: 13px; color: var(--text-secondary);">
          <h5 style="color: var(--telkom-blue-dark); font-size: 15px; font-weight: 700; margin-bottom: 16px; border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">Order Cancellation Audit Information</h5>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            <div>
              <span style="font-size: 11px; color: var(--text-muted); display: block;">Order Reference Number</span>
              <strong style="color: var(--text-primary); font-size: 14px;">${order.orderRef}</strong>
            </div>
            <div>
              <span style="font-size: 11px; color: var(--text-muted); display: block;">Cancelled By User (Agent ID)</span>
              <strong style="color: var(--text-primary); font-size: 14px;">${cancelledBy}</strong>
            </div>
            <div>
              <span style="font-size: 11px; color: var(--text-muted); display: block;">Cancellation Date & Time</span>
              <strong style="color: var(--text-primary); font-size: 14px;">${cancellationDate}</strong>
            </div>
            <div>
              <span style="font-size: 11px; color: var(--text-muted); display: block;">Last Completed Stepper Step</span>
              <strong style="color: var(--text-primary); font-size: 14px;">${lastCompletedStep}</strong>
            </div>
            <div style="grid-column: 1 / -1; border-top: 1px solid var(--border-color); padding-top: 12px; margin-top: 4px;">
              <span style="font-size: 11px; color: var(--text-muted); display: block; margin-bottom: 4px;">Reason for Cancellation</span>
              <div style="background-color: var(--bg-light); border: 1px dashed var(--border-color); padding: 12px; border-radius: var(--radius-md); font-weight: 500; color: var(--text-primary); min-height: 48px;">
                ${reason}
              </div>
            </div>
          </div>
        </div>
      `;
    } else {
      cancellationPanel.innerHTML = '';
    }
  }

  // Populate DebiCheck Mandate details tab
  const customer = MOCK_DB.crm.find(c => c.accountNumber === order.accountNo || c.name === order.customerName);
  const customerName = order.customerName;
  const email = (customer && customer.email) || `${customerName.toLowerCase().replace(/\s+/g, '.')}@gmail.co.za`;
  
  // Extract number dynamically from orderRef to generate stable data
  const refNum = parseInt(order.orderRef.replace(/\D/g, '')) || 0;
  const mobile = (customer && customer.mobile) || "08" + String((refNum * 1357) % 90000000 + 10000000);
  const idNum = (customer && customer.id) || (customer && customer.passport) || "930412" + String((refNum * 997) % 900000).padStart(6, '0') + "087";
  
  const banks = ["ABSA", "Standard Bank", "Nedbank", "FNB", "Capitec Bank Limited"];
  const bankNameVal = banks[refNum % banks.length];
  
  const branchCodes = {
    "ABSA": "632005",
    "FNB": "250655",
    "Capitec Bank Limited": "470010",
    "Standard Bank": "051001",
    "Nedbank": "198765"
  };
  
  const isNewDebit = order.debiCheck;
  const bankName = isNewDebit ? order.debiCheck.bankName : bankNameVal;
  const branchCode = isNewDebit ? order.debiCheck.branchCode : (branchCodes[bankName] || "632005");
  const accountType = isNewDebit ? order.debiCheck.accountType : ["Cheque/Current", "Savings", "Transmission"][refNum % 3];
  const accountNumber = isNewDebit ? order.debiCheck.accountNumber : "62" + String((refNum * 997) % 100000000).padStart(8, '0');
  const debitDay = isNewDebit ? order.debiCheck.debitDay : ["1st", "15th", "25th"][refNum % 3];
  const monthlyAmount = isNewDebit ? order.debiCheck.monthlyAmount : (product ? product.price : 199);
  const onceOffAmount = isNewDebit ? order.debiCheck.onceOffAmount : (product ? product.onceOff : 99);
  const debiCheckRef = isNewDebit ? order.debiCheck.debiCheckRef : "DBC-" + String((refNum * 321) % 100000000).padStart(8, '0');

  // Verification statuses (AVS, credit, authn)
  const avsStatus = `<span class="badge badge-success">Verified</span>`;
  
  const vettingStatus = (order.status === 'Fulfilled' || order.status === 'In Progress' || order.status === 'Active') ? 
    `<span class="badge badge-success">Approved</span>` : 
    (order.status === 'Failed' ? `<span class="badge badge-danger">Declined</span>` : `<span class="badge badge-warning">Pending</span>`);

  let authStatusHtml = `<span class="badge badge-warning">Pending</span>`;
  if (order.status === 'Fulfilled' || order.status === 'Active') {
    authStatusHtml = `<span class="badge badge-success">Approved</span>`;
  } else if (order.status === 'Failed') {
    authStatusHtml = `<span class="badge badge-danger">Declined</span>`;
  } else if (order.status === 'Cancelled') {
    authStatusHtml = `<span class="badge badge-danger">Expired</span>`;
  }

  const debicheckPanel = document.getElementById('modal-panel-debicheck');
  if (debicheckPanel) {
    debicheckPanel.innerHTML = `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
        <!-- Card 1: Account Holder Information (View Only) -->
        <div class="debicheck-card" style="background-color: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 16px;">
          <h5 style="color: var(--telkom-blue-dark); font-size: 14px; font-weight: 700; border-bottom: 1px solid var(--border-color); padding-bottom: 8px; margin-bottom: 12px; text-transform: uppercase;">1. Account Holder Info</h5>
          <div style="display: flex; flex-direction: column; gap: 10px;">
            <div>
              <span style="font-size: 11px; color: var(--text-muted); display: block;">Account Holder Name</span>
              <strong style="color: var(--text-primary); font-size: 13px;">${customerName}</strong>
            </div>
            <div>
              <span style="font-size: 11px; color: var(--text-muted); display: block;">ID / Passport Number</span>
              <strong style="color: var(--text-primary); font-size: 13px;">${idNum}</strong>
            </div>
            <div>
              <span style="font-size: 11px; color: var(--text-muted); display: block;">Mobile Number (View Only – used for DebiCheck authorization)</span>
              <strong style="color: var(--text-primary); font-size: 13px;">${mobile}</strong>
            </div>
            <div>
              <span style="font-size: 11px; color: var(--text-muted); display: block;">Email Address</span>
              <strong style="color: var(--text-primary); font-size: 13px; word-break: break-all;">${email}</strong>
            </div>
          </div>
        </div>

        <!-- Card 2: Settlement Banking Details -->
        <div class="debicheck-card" style="background-color: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 16px;">
          <h5 style="color: var(--telkom-blue-dark); font-size: 14px; font-weight: 700; border-bottom: 1px solid var(--border-color); padding-bottom: 8px; margin-bottom: 12px; text-transform: uppercase;">2. Settlement Banking Details</h5>
          <div style="display: flex; flex-direction: column; gap: 10px;">
            <div>
              <span style="font-size: 11px; color: var(--text-muted); display: block;">Bank Name</span>
              <strong style="color: var(--text-primary); font-size: 13px;">${bankName}</strong>
            </div>
            <div>
              <span style="font-size: 11px; color: var(--text-muted); display: block;">Account Number</span>
              <strong style="color: var(--text-primary); font-size: 13px;">${accountNumber}</strong>
            </div>
            <div>
              <span style="font-size: 11px; color: var(--text-muted); display: block;">Account Type</span>
              <strong style="color: var(--text-primary); font-size: 13px;">${accountType}</strong>
            </div>
            <div>
              <span style="font-size: 11px; color: var(--text-muted); display: block;">Branch Code</span>
              <strong style="color: var(--text-primary); font-size: 13px;">${branchCode}</strong>
            </div>
            <div>
              <span style="font-size: 11px; color: var(--text-muted); display: block;">Debit Order Day</span>
              <strong style="color: var(--text-primary); font-size: 13px;">${debitDay}</strong>
            </div>
          </div>
        </div>

        <!-- Card 3: Mandate Specs & Verification Status -->
        <div class="debicheck-card" style="background-color: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 16px;">
          <h5 style="color: var(--telkom-blue-dark); font-size: 14px; font-weight: 700; border-bottom: 1px solid var(--border-color); padding-bottom: 8px; margin-bottom: 12px; text-transform: uppercase;">3. Specs & Verification Status</h5>
          <div style="display: flex; flex-direction: column; gap: 10px;">
            <div>
              <span style="font-size: 11px; color: var(--text-muted); display: block;">Monthly Debit Amount</span>
              <strong style="color: var(--text-primary); font-size: 13px;">R${monthlyAmount.toLocaleString()} (Auto-populated)</strong>
            </div>
            <div>
              <span style="font-size: 11px; color: var(--text-muted); display: block;">Once-Off Amount</span>
              <strong style="color: var(--text-primary); font-size: 13px;">R${onceOffAmount.toLocaleString()} (Auto-populated)</strong>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-color); padding-top: 8px; margin-top: 4px;">
              <span style="font-size: 11.5px; color: var(--text-secondary);">Bank Account Verification Status (AVS):</span>
              <strong>${avsStatus}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-color); padding-top: 8px;">
              <span style="font-size: 11.5px; color: var(--text-secondary);">Credit Vetting Status:</span>
              <strong>${vettingStatus}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-color); padding-top: 8px;">
              <span style="font-size: 11.5px; color: var(--text-secondary);">DebiCheck Authentication Status:</span>
              <strong>${authStatusHtml}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-color); padding-top: 8px;">
              <span style="font-size: 11.5px; color: var(--text-secondary);">DebiCheck Reference Number:</span>
              <code style="font-weight: bold; color: var(--telkom-blue-dark);">${debiCheckRef}</code>
            </div>
          </div>
        </div>

        <!-- Card 4: Consent & Terms -->
        <div class="debicheck-card" style="background-color: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 16px; display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <h5 style="color: var(--telkom-blue-dark); font-size: 14px; font-weight: 700; border-bottom: 1px solid var(--border-color); padding-bottom: 8px; margin-bottom: 12px; text-transform: uppercase;">4. Authorizations & Consents</h5>
            <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 8px;">
              <div style="display: flex; align-items: flex-start; gap: 10px;">
                <input type="checkbox" checked disabled style="margin-top: 3px; cursor: not-allowed;">
                <span style="font-size: 12px; line-height: 1.3; color: var(--text-primary);">
                  <strong>Customer Authorization Consent Checkbox:</strong> Customer authorizes monthly debit collections.
                </span>
              </div>
              <div style="display: flex; align-items: flex-start; gap: 10px;">
                <input type="checkbox" checked disabled style="margin-top: 3px; cursor: not-allowed;">
                <span style="font-size: 12px; line-height: 1.3; color: var(--text-primary);">
                  <strong>Terms & Conditions Acceptance Checkbox:</strong> Customer accepts contract terms and conditions.
                </span>
              </div>
            </div>
          </div>
          
          <div style="font-size: 10px; color: var(--text-muted); border-top: 1px dashed var(--border-color); padding-top: 8px; margin-top: 10px;">
            All authorizations were verified digitally by the customer during order checkout.
          </div>
        </div>
      </div>
    `;
  }

  openModal('order-details-modal');
}

export function downloadOrderReceipt(orderRef) {
  const order = APP_STATE.ordersList.find(o => o.orderRef === orderRef);
  if (!order) return;

  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  
  const receiptWindow = window.open("", "_blank");
  if (!receiptWindow) {
    showToast("Popup blocker prevented opening receipt window. Please allow popups.", "danger");
    return;
  }

  const receiptNo = "REC-" + Math.floor(10000000 + Math.random() * 90000000);
  const cost = order.revenue || 499;

  const docHtml = `
    <html>
    <head>
      <title>Telkom Receipt - ${order.orderRef}</title>
      <style>
        body { font-family: 'Courier New', Courier, monospace; padding: 20px; color: #000; width: 320px; margin: 0 auto; }
        .divider { border-top: 1px dashed #000; margin: 10px 0; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .flex { display: flex; justify-content: space-between; }
        .header-title { font-size: 18px; font-weight: bold; margin-bottom: 4px; }
        .footer { font-size: 11px; margin-top: 20px; text-align: center; }
      </style>
    </head>
    <body>
      <div class="text-center">
        <div class="header-title">TELKOM SOUTH AFRICA</div>
        <div>Retail Store POS Receipt</div>
        <div>Branch Node: ${order.store}</div>
      </div>
      
      <div class="divider"></div>
      
      <div>
        <div class="flex"><span>Date:</span> <span>${order.date}</span></div>
        <div class="flex"><span>Receipt No:</span> <span>${receiptNo}</span></div>
        <div class="flex"><span>Order Ref:</span> <span>${order.orderRef}</span></div>
        <div class="flex"><span>Agent ID:</span> <span>${order.agent}</span></div>
      </div>
      
      <div class="divider"></div>
      
      <div>
        <strong>Customer Profile</strong>
        <div class="flex"><span>Name:</span> <span>${order.customerName}</span></div>
        <div class="flex"><span>Account:</span> <span>${order.accountNo}</span></div>
      </div>
      
      <div class="divider"></div>
      
      <div>
        <strong>Product Description</strong>
        <div style="font-size:13px; margin: 4px 0;">${order.product}</div>
        <div class="flex"><span>OMS Status:</span> <span>${order.status}</span></div>
        <div class="flex"><span>Payment Method:</span> <span>Card Terminal</span></div>
        <div class="flex" style="font-weight:bold; margin-top:6px;">
          <span>TOTAL PAID:</span> <span>R ${cost.toLocaleString()}</span>
        </div>
      </div>
      
      <div class="divider"></div>
      
      <div class="footer">
        Thank you for choosing Telkom.<br>
        For query details, please quote Order Ref: ${order.orderRef}<br>
        CIM Session Sync Verified.
      </div>

      <script>
        window.onload = function() {
          window.print();
        }
      </script>
    </body>
    </html>
  `;

  receiptWindow.document.write(docHtml);
  receiptWindow.document.close();

  const fileContent = `
========================================
       TELKOM SOUTH AFRICA RECEIPT
========================================
Receipt Number: ${receiptNo}
Order Reference: ${order.orderRef}
Date Created: ${order.date}
Store Branch: ${order.store}
Agent ID: ${order.agent}
----------------------------------------
CUSTOMER DETAILS
Customer Name: ${order.customerName}
Account Number: ${order.accountNo}
----------------------------------------
PRODUCT SUMMARY
Product: ${order.product}
OMS Status: ${order.status}
Payment Status: ${order.payment}
TOTAL PAID: R ${cost}
========================================
         THANK YOU FOR YOUR PATRONAGE
========================================
`;
  const blob = new Blob([fileContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `Receipt_${order.orderRef}.pdf`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast(`Receipt for ${order.orderRef} downloaded successfully.`, "success");
}

export function emailContractToCustomer(orderRef) {
  const customer = APP_STATE.selectedCustomer;
  if (!customer || !customer.email) {
    showToast("Error: No customer email address found.", "danger");
    return;
  }
  showToast(`Contract Agreement emailed successfully to ${customer.email}!`, "success");
}

export function printContractDocument(orderRef) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    showToast("Popup blocker prevented print window. Please allow popups.", "danger");
    return;
  }

  const customer = APP_STATE.selectedCustomer;
  const product = APP_STATE.cart.product;

  let bankName = "N/A";
  let accountNo = "N/A";
  if (APP_STATE.cart.billingSelection) {
    const bs = APP_STATE.cart.billingSelection;
    if (bs.option === 'existing') {
      bankName = "Existing Account (ABSA)";
      accountNo = "••••1234";
    } else if (bs.option === 'new') {
      bankName = bs.newDebit.bankName || "N/A";
      const fullAcc = bs.newDebit.accountNumber || "";
      accountNo = fullAcc.length > 4 ? "••••" + fullAcc.slice(-4) : fullAcc;
    }
  }

  printWindow.document.write(`
    <html>
      <head>
        <title>Telkom Customer Contract - ${orderRef}</title>
        <style>
          body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #333; line-height: 1.6; }
          .logo { text-align: center; margin-bottom: 30px; }
          .header { text-align: center; border-bottom: 3px solid #0099ff; padding-bottom: 10px; margin-bottom: 30px; }
          h2 { color: #0f3057; text-transform: uppercase; margin: 0; }
          .section-title { color: #0f3057; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-top: 25px; margin-bottom: 15px; text-transform: uppercase; font-size: 12px; letter-spacing: 1px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px; }
          td { padding: 8px 0; }
          td.label { font-weight: bold; width: 30%; color: #666; }
          .signatures { display: flex; justify-content: space-between; margin-top: 40px; }
          .sig-box { width: 45%; border: 1px dashed #ccc; padding: 15px; text-align: center; background-color: #f9f9f9; }
          .sig-font { font-family: 'Georgia', serif; font-style: italic; font-size: 18px; color: #0f3057; margin: 8px 0; }
          .footer { text-align: center; font-size: 11px; color: #999; margin-top: 50px; border-top: 1px solid #eee; padding-top: 10px; }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>Telkom SA SOC Ltd</h2>
          <div style="font-size: 12px; font-weight: bold; color: #0099ff; letter-spacing: 1px; margin-top: 5px;">CUSTOMER CONTRACT AGREEMENT</div>
        </div>

        <table>
          <tr>
            <td class="label">Agreement Reference</td>
            <td><strong>${orderRef}</strong></td>
            <td class="label">Date of Agreement</td>
            <td><strong>${new Date().toLocaleDateString()}</strong></td>
          </tr>
        </table>

        <div class="section-title">1. Subscriber Personal Details</div>
        <table>
          <tr>
            <td class="label">Full Name</td>
            <td>${customer.name}</td>
            <td class="label">Identity Number</td>
            <td>${customer.id ? maskID(customer.id) : maskPassport(customer.passport)}</td>
          </tr>
          <tr>
            <td class="label">Mobile Number</td>
            <td>${customer.mobile || 'N/A'}</td>
            <td class="label">Email Address</td>
            <td>${customer.email || 'N/A'}</td>
          </tr>
          <tr>
            <td class="label">Billing Address</td>
            <td colspan="3">${customer.address || 'N/A'}</td>
          </tr>
        </table>

        <div class="section-title">2. Contract Plan Specifications</div>
        <table>
          <tr>
            <td class="label">Allocated Product</td>
            <td>${product.name}</td>
            <td class="label">Contract Duration</td>
            <td>${product.term} Months</td>
          </tr>
          <tr>
            <td class="label">Monthly Charge</td>
            <td>R${product.price} /mo</td>
            <td class="label">Once-off Connection Fee</td>
            <td>R${product.onceOff}</td>
          </tr>
          <tr>
            <td class="label">Plan Details</td>
            <td colspan="3">${product.allocation}</td>
          </tr>
        </table>

        <div class="section-title">3. Debit Order Billing Information</div>
        <table>
          <tr>
            <td class="label">Authorized Bank</td>
            <td>${bankName}</td>
            <td class="label">Account Number</td>
            <td>${accountNo}</td>
          </tr>
          <tr>
            <td class="label">Collection Date</td>
            <td>1st of every month</td>
            <td class="label">DebiCheck Status</td>
            <td>Verified and Authorized</td>
          </tr>
        </table>

        <div class="section-title">4. Compliance & Signatures</div>
        <p style="font-size: 11px; color: #555; margin-bottom: 20px;">The Subscriber agrees to all terms and conditions of Telkom SA. Credit check, NCA requirements and POPI act consent checked digitally.</p>
        
        <div class="signatures">
          <div class="sig-box">
            <div style="font-size: 10px; color: #666; font-weight: bold;">AUTHORIZED AGENT SIGNATURE</div>
            <div class="sig-font">Piet van Zyl</div>
            <div style="font-size: 10px; color: #999;">Branch PTA-01 (Pretoria Main)</div>
          </div>
          <div class="sig-box">
            <div style="font-size: 10px; color: #666; font-weight: bold;">SUBSCRIBER SIGNATURE</div>
            <div class="sig-font">${customer.name}</div>
            <div style="font-size: 10px; color: #999;">IP: 192.168.10.150 (POPIA Compliant)</div>
          </div>
        </div>

        <div class="footer">
          Telkom SA SOC Ltd is an authorized financial services provider. Reg no: 1991/005476/30.
        </div>

        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}

export function handleSaveDraft() {
  const exists = APP_STATE.cart.draftId ? APP_STATE.draftOrders.find(d => d.draftId === APP_STATE.cart.draftId) : null;
  const targetId = APP_STATE.cart.draftId || "DRF-" + Math.floor(100000 + Math.random() * 900000);
  
  const currentStep = APP_STATE.currentStep;
  const draftObj = {
    draftId: targetId,
    customerName: APP_STATE.selectedCustomer ? APP_STATE.selectedCustomer.name : "",
    customerAccount: APP_STATE.selectedCustomer ? APP_STATE.selectedCustomer.accountNumber : "",
    selectedCustomer: APP_STATE.selectedCustomer,
    activeCIMInteraction: APP_STATE.activeCIMInteraction,
    product: APP_STATE.cart.product,
    cart: { ...APP_STATE.cart, draftId: targetId },
    step: currentStep,
    branch: APP_STATE.currentUser.branch,
    agentId: APP_STATE.currentUser.id,
    timestamp: new Date().toISOString()
  };

  if (exists) {
    const idx = APP_STATE.draftOrders.findIndex(d => d.draftId === targetId);
    if (idx > -1) APP_STATE.draftOrders[idx] = draftObj;
  } else {
    APP_STATE.draftOrders.unshift(draftObj);
  }
  
  saveDraftOrders();
  showToast(`Checkout draft saved successfully! ID: ${targetId}`, "success");
  
  // Reset cart and customer state
  APP_STATE.selectedCustomer = null;
  APP_STATE.activeCIMInteraction = null;
  APP_STATE.cart = {
    product: null,
    contractDetails: { simType: "eSIM", numberOption: "New Number", portInNumber: "", installationAddress: "", installationContactName: "", installationContactPhone: "", preferredInstallationDate: "" },
    consent: false,
    gisRef: "",
    gisStatus: "Not checked",
    stockChecked: false,
    stockStatus: "",
    ricaStatus: "",
    simActivationNumber: "",
    paymentStatus: "Pending",
    posTxnRef: "",
    receiptNo: "",
    orderRef: "",
    draftId: ""
  };
  APP_STATE.currentStep = 1;

  switchRoute('order-tracking');
}

export function resumeDraftOrder(draftId) {
  const d = APP_STATE.draftOrders.find(o => o.draftId === draftId);
  if (!d) return;

  APP_STATE.selectedCustomer = d.selectedCustomer;
  APP_STATE.activeCIMInteraction = d.activeCIMInteraction;
  APP_STATE.cart = { ...d.cart };
  APP_STATE.currentStep = d.step;

  showToast("Resumed saved draft session.", "success");
  
  switchRoute('order-stepper');
  renderStepper();
}

export function getOrderActivationStep(order) {
  if (!order.activationStep) {
    if (order.ricaStatus === 'Pending') {
      order.activationStep = 'start';
    } else if (order.ricaStatus === 'Verified' && !order.simActivationNumber) {
      order.activationStep = 'enter_sim';
    } else if (order.simActivationNumber) {
      order.activationStep = 'completed';
    } else {
      order.activationStep = 'start';
    }
  }
  return order.activationStep;
}

export function renderOrderActivationWorkflow(order, container, isModal) {
  const step = getOrderActivationStep(order);
  const containerId = container.id;
  const orderRef = order.orderRef;

  if (step === 'start') {
    container.innerHTML = `
      <div style="background-color: var(--bg-light); border: 1px solid var(--border-color); padding: 18px; border-radius: var(--radius-md); text-align: center;">
        <h5 style="color: var(--telkom-blue-dark); font-weight: 700; margin-bottom: 8px;">SIM Activation & RICA Workflow</h5>
        <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 14px;">This order contains cellular lines that require mobile activation and RICA verification.</p>
        <button class="btn btn-primary" onclick="setPostOrderActivationStep('${orderRef}', 'run_rica', '${containerId}')" style="background-color: var(--telkom-blue-dark); border-color: var(--telkom-blue-dark); font-weight: 600; color: var(--text-white);">
          Proceed to RICA Verification
        </button>
      </div>
    `;
  } else if (step === 'run_rica') {
    container.innerHTML = `
      <div style="background-color: var(--bg-light); border: 1px solid var(--border-color); padding: 18px; border-radius: var(--radius-md);">
        <h5 style="color: var(--telkom-blue-dark); font-weight: 700; margin-bottom: 8px;">RICA Verification</h5>
        <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 14px;">Perform the national RICA database check for customer <strong>${order.customerName}</strong>.</p>
        
        <div style="display: flex; align-items: center; gap: 14px; flex-wrap: wrap;">
          <button type="button" class="btn btn-primary" id="btn-run-rica-activation" onclick="runRicaActivationWorkflow('${orderRef}', '${containerId}')" style="background-color: var(--telkom-blue-dark); border-color: var(--telkom-blue-dark); font-weight: 600; color: var(--text-white);">
            Perform RICA Verification
          </button>
        </div>
        
        <div id="activation-rica-progress-area" style="display: none; margin-top: 14px;">
          <div style="font-size: 11px; color: var(--text-secondary); margin-bottom: 4px;" id="activation-rica-progress-text">Connecting to RICA verification gateway...</div>
          <div class="rica-progress-container" style="height: 6px; background-color: var(--border-color); border-radius: 3px; overflow: hidden;">
            <div id="activation-rica-progress-bar" style="height: 100%; width: 0%; background-color: var(--telkom-blue); transition: width 0.1s ease;"></div>
          </div>
        </div>
      </div>
    `;
  } else if (step === 'enter_sim') {
    container.innerHTML = `
      <div style="background-color: var(--bg-light); border: 1px solid var(--border-color); padding: 18px; border-radius: var(--radius-md);">
        <h5 style="color: var(--telkom-blue-dark); font-weight: 700; margin-bottom: 8px;">Enter SIM Serial Number</h5>
        <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 12px;">RICA verification passed. Provide the 19-digit ICCID SIM card number to activate the cellular line.</p>
        <div style="display: flex; gap: 12px; align-items: flex-end;">
          <div style="flex: 1;">
            <input type="text" id="activation-sim-iccid" class="form-control" placeholder="19-digit ICCID e.g. 8927..." style="height: 38px;" value="${order.simActivationNumber || ''}">
          </div>
          <button class="btn btn-primary" onclick="submitPostOrderSimNumber('${orderRef}', '${containerId}')" style="height: 38px; font-weight: 600;">
            Activate SIM & Complete
          </button>
        </div>
      </div>
    `;
  } else if (step === 'completed') {
    container.innerHTML = `
      <div style="background-color: var(--success-light); border: 1px solid var(--success-border); padding: 18px; border-radius: var(--radius-md); text-align: center;">
        <div style="width: 44px; height: 44px; border-radius: 50%; background-color: var(--success); color: var(--text-white); display: flex; align-items: center; justify-content: center; margin: 0 auto 12px; font-size: 22px; font-weight: bold;">✓</div>
        <h5 style="color: var(--success); font-weight: 700; margin-bottom: 6px;">SIM Activation is Completed!</h5>
        <p style="font-size: 13px; color: var(--text-secondary);">The SIM card (ICCID: <strong>${order.simActivationNumber}</strong>) is verified via RICA and active on the HLR network.</p>
      </div>
    `;
  }
}

export function setPostOrderActivationStep(orderRef, stepVal, containerId) {
  const order = APP_STATE.ordersList.find(o => o.orderRef === orderRef);
  if (order) {
    order.activationStep = stepVal;
    saveOrders();
    const container = document.getElementById(containerId);
    if (container) {
      renderOrderActivationWorkflow(order, container, containerId === 'order-details-rica-panel');
    }
  }
}

export function submitPostOrderSimNumber(orderRef, containerId) {
  const order = APP_STATE.ordersList.find(o => o.orderRef === orderRef);
  if (!order) return;
  const input = document.getElementById('activation-sim-iccid');
  if (!input) return;
  const val = input.value.trim();
  if (!/^\d{19}$/.test(val)) {
    showToast("SIM serial number must be exactly 19 digits.", "danger");
    return;
  }
  order.simActivationNumber = val;
  order.status = 'Active';
  order.activationStep = 'completed';
  saveOrders();
  
  pushNotification(
    "SIM Card Activated",
    `SIM Serial ${order.simActivationNumber} activated successfully for order ${orderRef}.`,
    "sim_activated",
    "Normal"
  );
  
  showToast("SIM serial captured and cellular line activated successfully!", "success");

  const container = document.getElementById(containerId);
  if (container) {
    renderOrderActivationWorkflow(order, container, containerId === 'order-details-rica-panel');
  }
  
  if (document.getElementById('order-details-modal').style.display !== 'none') {
    viewOrderDetails(orderRef);
  }
  
  if (APP_STATE.activeRoute === 'order-tracking') {
    renderOrderTracking();
  }
}

export function runRicaActivationWorkflow(orderRef, containerId) {
  const order = APP_STATE.ordersList.find(o => o.orderRef === orderRef);
  if (!order) return;

  const btn = document.getElementById('btn-run-rica-activation');
  const progressArea = document.getElementById('activation-rica-progress-area');
  const progressBar = document.getElementById('activation-rica-progress-bar');
  const progressText = document.getElementById('activation-rica-progress-text');

  if (btn) btn.style.display = 'none';
  if (progressArea) progressArea.style.display = 'block';

  let progress = 0;
  const interval = setInterval(() => {
    progress += 10;
    if (progressBar) progressBar.style.width = progress + '%';
    if (progressText) {
      if (progress < 40) progressText.innerText = "Querying Clarify CRM metadata...";
      else if (progress < 80) progressText.innerText = "Verifying biometric check record...";
      else progressText.innerText = "Finalizing gateway handshake...";
    }

    if (progress >= 100) {
      clearInterval(interval);
      order.ricaStatus = 'Verified';
      order.activationStep = 'enter_sim';
      saveOrders();

      showToast("RICA Verification Successful! Now capture the SIM number.", "success");
      
      const container = document.getElementById(containerId);
      if (container) {
        renderOrderActivationWorkflow(order, container, containerId === 'order-details-rica-panel');
      }
      
      if (document.getElementById('order-details-modal').style.display !== 'none') {
        viewOrderDetails(orderRef);
      }
      
      if (APP_STATE.activeRoute === 'order-tracking') {
        renderOrderTracking();
      }
    }
  }, 200);
}

// Bind to window for global inline HTML execution
window.renderOrderTracking = renderOrderTracking;
window.switchTrackingTab = switchTrackingTab;
window.switchModalTab = switchModalTab;
window.viewOrderDetails = viewOrderDetails;
window.downloadOrderReceipt = downloadOrderReceipt;
window.emailContractToCustomer = emailContractToCustomer;
window.printContractDocument = printContractDocument;
window.handleSaveDraft = handleSaveDraft;
window.resumeDraftOrder = resumeDraftOrder;
window.renderOrderActivationWorkflow = renderOrderActivationWorkflow;
window.setPostOrderActivationStep = setPostOrderActivationStep;
window.submitPostOrderSimNumber = submitPostOrderSimNumber;
window.runRicaActivationWorkflow = runRicaActivationWorkflow;
