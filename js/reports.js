import { APP_STATE } from './state.js';
import { showToast, openModal, closeModal } from './utils.js';
import { downloadOrderReceipt } from './tracking.js';


export function handleReportFilterChange() {
  renderReports();
}

export function getFilteredReportData() {
  const category = document.getElementById('report-filter-category').value;
  const store = document.getElementById('report-filter-store').value;
  const startDateStr = document.getElementById('report-filter-start-date').value;
  const endDateStr = document.getElementById('report-filter-end-date').value;

  return getFilteredReportDataByDates(category, store, startDateStr, endDateStr);
}

export function getFilteredReportDataByDates(category, store, startDateStr, endDateStr) {
  const start = new Date(startDateStr + "T00:00:00");
  const end = new Date(endDateStr + "T23:59:59");

  let dataset = [];
  if (category === 'stock_status') {
    dataset = APP_STATE.stockRequests;
  } else {
    dataset = APP_STATE.ordersList;
  }

  let filtered = dataset;
  if (store !== 'ALL') {
    if (category === 'stock_status') {
      filtered = filtered.filter(item => item.storeId === store);
    } else {
      filtered = filtered.filter(item => item.store === store);
    }
  }

  filtered = filtered.filter(item => {
    if (!item.date) return false;
    const itemDate = new Date(item.date.replace(' ', 'T'));
    return itemDate >= start && itemDate <= end;
  });

  return filtered;
}

// Draw line chart
export function drawSVGLineChart(containerId, dataPoints, labels) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const width = container.clientWidth || 450;
  const height = 220;

  if (dataPoints.length === 0) {
    container.innerHTML = `
      <div style="display:flex; align-items:center; justify-content:center; height:100%; color:var(--text-secondary); font-size:13px;">
        No records in the selected date range.
      </div>
    `;
    return;
  }

  const maxVal = Math.max(...dataPoints, 5);
  const minVal = 0;
  
  const paddingLeft = 40;
  const paddingRight = 15;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const stepX = dataPoints.length > 1 ? chartWidth / (dataPoints.length - 1) : chartWidth;
  
  const points = dataPoints.map((val, idx) => {
    const x = paddingLeft + idx * stepX;
    const y = paddingTop + chartHeight - ((val - minVal) / (maxVal - minVal)) * chartHeight;
    return { x, y, val, label: labels[idx] };
  });

  let pathD = "";
  let areaD = `M ${paddingLeft} ${paddingTop + chartHeight} `;

  points.forEach((pt, idx) => {
    if (idx === 0) {
      pathD += `M ${pt.x} ${pt.y} `;
    } else {
      pathD += `L ${pt.x} ${pt.y} `;
    }
    areaD += `L ${pt.x} ${pt.y} `;
  });

  areaD += `L ${points[points.length - 1].x} ${paddingTop + chartHeight} Z`;

  let gridHtml = '';
  const yTicks = 4;
  for (let i = 0; i <= yTicks; i++) {
    const val = minVal + (maxVal - minVal) * (i / yTicks);
    const y = paddingTop + chartHeight - (i / yTicks) * chartHeight;
    gridHtml += `
      <line x1="${paddingLeft}" y1="${y}" x2="${width - paddingRight}" y2="${y}" class="svg-chart-gridline" />
      <text x="${paddingLeft - 8}" y="${y + 3}" class="svg-chart-text" text-anchor="end">${Math.round(val)}</text>
    `;
  }

  let labelHtml = '';
  const labelStep = Math.max(1, Math.round(points.length / 6));
  points.forEach((pt, idx) => {
    if (idx % labelStep === 0 || idx === points.length - 1) {
      labelHtml += `
        <text x="${pt.x}" y="${height - 10}" class="svg-chart-text" text-anchor="middle">${pt.label}</text>
        <line x1="${pt.x}" y1="${paddingTop + chartHeight}" x2="${pt.x}" y2="${paddingTop + chartHeight + 4}" stroke="var(--border-color)" stroke-width="1" />
      `;
    }
  });

  let circleHtml = '';
  points.forEach((pt) => {
    circleHtml += `
      <circle cx="${pt.x}" cy="${pt.y}" r="4" class="svg-chart-point" data-val="${pt.val}" data-lbl="${pt.label}">
        <title>${pt.label}: ${pt.val}</title>
      </circle>
    `;
  });

  const svg = `
    <svg width="100%" height="100%" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
      <defs>
        <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="var(--telkom-blue)" stop-opacity="0.4"/>
          <stop offset="100%" stop-color="var(--telkom-blue)" stop-opacity="0.0"/>
        </linearGradient>
      </defs>
      
      <line x1="${paddingLeft}" y1="${paddingTop}" x2="${paddingLeft}" y2="${paddingTop + chartHeight}" class="svg-chart-axis" />
      <line x1="${paddingLeft}" y1="${paddingTop + chartHeight}" x2="${width - paddingRight}" y2="${paddingTop + chartHeight}" class="svg-chart-axis" />
      
      ${gridHtml}
      ${labelHtml}
      <path d="${areaD}" class="svg-chart-area" />
      <path d="${pathD}" class="svg-chart-line" />
      ${circleHtml}
    </svg>
  `;

  container.innerHTML = svg;
}

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
        <circle cx="${cx}" cy="${cy}" r="${radius}" class="svg-donut-circle-bg" />
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
              stroke-dasharray="${strokeDash} ${circumference - strokeDash}"
              stroke-dashoffset="${offset}"
              transform="rotate(-90 ${cx} ${cy})">
        <title>${seg.label}: ${seg.value} (${Math.round(pct * 100)}%)</title>
      </circle>
    `;
    
    currentOffset += strokeDash;
  });

  const svg = `
    <svg width="100%" height="100%" viewBox="0 0 \dots \dots">
      <circle cx="${cx}" cy="${cy}" r="${radius}" class="svg-donut-circle-bg" />
      ${segmentHtml}
      <text class="svg-donut-text-val" x="${cx}" y="${cy - 3}">${total}</text>
      <text class="svg-donut-text-lbl" x="${cx}" y="${cy + 18}">Total</text>
    </svg>
  `;

  // Workaround for literal replacement string issues
  container.innerHTML = svg.replace('\\dots', width).replace('\\dots', height);
}

// Render Leaderboard Chart
export function renderLeaderboardChart(containerId, items) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (items.length === 0) {
    container.innerHTML = `<div style="text-align: center; color: var(--text-secondary); font-size:13px; padding: 20px;">No performance logs recorded.</div>`;
    return;
  }

  const sorted = [...items].sort((a, b) => b.value - a.value);
  const maxVal = Math.max(...sorted.map(s => s.value), 1);

  let html = '';
  sorted.forEach(item => {
    const pct = (item.value / maxVal) * 100;
    html += `
      <div class="leaderboard-row">
        <div class="leaderboard-label" title="${item.label}">${item.label}</div>
        <div class="leaderboard-bar-outer">
          <div class="leaderboard-bar-inner" style="width: ${pct}%; background: ${item.color || 'linear-gradient(90deg, var(--telkom-blue), #5bc0be)'};"></div>
        </div>
        <div class="leaderboard-value">${item.displayValue || item.value}</div>
      </div>
    `;
  });

  container.innerHTML = html;
}

// Generate Actionable Insights
export function generateActionableInsights(filtered, category, role) {
  const list = document.getElementById('report-insights-list');
  if (!list) return;
  list.innerHTML = '';
  
  const insights = [];

  if (filtered.length === 0) {
    insights.push("No transaction records detected within this date range. Verify active filters or select a wider search window.");
  } else {
    if (category === 'order_activity' || category === 'agent_performance' || category === 'product_sales' || category === 'store_performance') {
      const orders = filtered;
      const total = orders.length;
      const fulfilled = orders.filter(o => o.status === 'Fulfilled').length;
      const fulfilledPct = total > 0 ? Math.round((fulfilled / total) * 100) : 0;
      
      const failedOrders = orders.filter(o => o.status === 'Failed' || o.payment === 'Failed').length;
      const failedPct = total > 0 ? Math.round((failedOrders / total) * 100) : 0;

      if (fulfilledPct < 75) {
        insights.push(`⚠️ <strong>Low Conversion Warning:</strong> Fulfillments are currently at ${fulfilledPct}%. Recommend auditing incomplete card payments and user consent delays.`);
      } else {
        insights.push(`📈 <strong>Strong Throughput:</strong> Order conversion is stable at ${fulfilledPct}%, meeting corporate retail targets.`);
      }

      const avgHandling = Math.round(orders.reduce((sum, o) => sum + (o.handlingTime || 0), 0) / total);
      if (avgHandling > 28) {
        insights.push(`⏱️ <strong>Efficiency Bottleneck:</strong> Avg handling time is ${avgHandling} minutes (target 25m). Suggest supervisor oversight during the POS/Transact confirmation step.`);
      } else {
        insights.push(`⚡ <strong>Operational Speed:</strong> Average order processing duration is optimized at ${avgHandling} minutes.`);
      }

      const productCounts = {};
      orders.forEach(o => {
        productCounts[o.product] = (productCounts[o.product] || 0) + 1;
      });
      let topProd = "";
      let topCount = 0;
      for (const [prod, qty] of Object.entries(productCounts)) {
        if (qty > topCount) {
          topCount = qty;
          topProd = prod;
        }
      }
      if (topProd) {
        insights.push(`📦 <strong>Velocity Leader:</strong> ${topProd} represents ${Math.round((topCount / total) * 100)}% of orders. Ensure branch warehouses maintain inventory reserve buffers.`);
      }
    } else if (category === 'stock_status') {
      const requests = filtered;
      const submitted = requests.filter(r => r.status === 'Submitted');
      const urgent = requests.filter(r => r.priority === 'Urgent').length;
      
      if (submitted.length > 0) {
        insights.push(`📋 <strong>Approval Backlog:</strong> ${submitted.length} stock requests are currently pending decision review. Advise regional directors to verify allocation queues.`);
      }
      if (urgent > 0) {
        insights.push(`🚨 <strong>Priority Alert:</strong> ${urgent} stock replenishment requests are marked URGENT due to active client orders.`);
      }
      
      const avgAge = Math.round(requests.reduce((sum, r) => sum + (r.ageDays || 0), 0) / requests.length);
      if (avgAge > 2) {
        insights.push(`⚠️ <strong>Request Ageing:</strong> Pending stock requests average ${avgAge} days. Advise supervisors to review draft documents.`);
      } else {
        insights.push(`✅ <strong>Warehouse Sync:</strong> Supply chain request turnaround is within the 48-hour SLA threshold.`);
      }
    } else if (category === 'payment_status') {
      const payments = filtered;
      const failed = payments.filter(p => p.payment === 'Failed').length;
      const failRate = payments.length > 0 ? Math.round((failed / payments.length) * 100) : 0;

      if (failRate > 5) {
        insights.push(`💳 <strong>Payment Outage Indicator:</strong> Card failure rate is currently at ${failRate}% (Limit 2%). Trigger card terminal diagnostics to check local connectivity.`);
      } else {
        insights.push(`✅ <strong>Merchant Transact Clear:</strong> Payment terminal success rate is healthy at ${100 - failRate}%.`);
      }
      
      const storeFails = {};
      payments.filter(p => p.payment === 'Failed').forEach(p => {
        storeFails[p.store] = (storeFails[p.store] || 0) + 1;
      });
      let maxStore = "";
      let maxCount = 0;
      for (const [st, ct] of Object.entries(storeFails)) {
        if (ct > maxCount) {
          maxCount = ct;
          maxStore = st;
        }
      }
      if (maxStore && maxCount > 2) {
        insights.push(`🔍 <strong>Hardware Defect Point:</strong> Store ${maxStore} accounts for ${maxCount} failures. Suggest terminal replacement or network check.`);
      }
    } else if (category === 'fixed_line') {
      const checks = filtered;
      const unavailable = checks.filter(c => c.coverageOutcome === 'Coverage unavailable').length;
      const rate = checks.length > 0 ? Math.round((unavailable / checks.length) * 100) : 0;

      if (rate > 20) {
        insights.push(`🌐 <strong>Network Expansion Indicator:</strong> ${rate}% of broadband coverage checks resulted in 'Coverage unavailable'. Advise fiber installation teams of demand centers.`);
      } else {
        insights.push(`🛰️ <strong>GIS Feasibility:</strong> Exlight fiber line coverage rate matches regional sales projections.`);
      }
    }
  }

  insights.forEach(ins => {
    list.innerHTML += `<li>${ins}</li>`;
  });
}

// Render Reports View
export function renderReports() {
  const role = APP_STATE.currentUser.role;
  const storeSelect = document.getElementById('report-filter-store');
  const storeSelectGroup = document.getElementById('report-store-filter-group');
  if (!storeSelect) return;

  // Lock branch if Store Manager
  if (role === 'manager') {
    storeSelect.value = APP_STATE.currentUser.branch;
    storeSelect.disabled = true;
    if (storeSelectGroup) storeSelectGroup.style.opacity = '0.7';
  } else {
    storeSelect.disabled = false;
    if (storeSelectGroup) storeSelectGroup.style.opacity = '1';
  }

  const category = document.getElementById('report-filter-category').value;
  const storeFilterVal = storeSelect.value;
  const startStr = document.getElementById('report-filter-start-date').value;
  const endStr = document.getElementById('report-filter-end-date').value;

  const filtered = getFilteredReportData();

  const kpiGrid = document.getElementById('report-kpi-grid');
  if (kpiGrid) kpiGrid.innerHTML = '';

  const tableThead = document.getElementById('report-table-thead');
  const tableTbody = document.getElementById('report-table-tbody');
  if (!tableThead || !tableTbody) return;
  tableThead.innerHTML = '';
  tableTbody.innerHTML = '';

  // Generate Date Labels & Trend Values
  const startDate = new Date(startStr);
  const endDate = new Date(endStr);
  const dateLabels = [];
  const dailyValues = [];

  let loopDate = new Date(startDate);
  while (loopDate <= endDate) {
    const year = loopDate.getFullYear();
    const month = String(loopDate.getMonth() + 1).padStart(2, '0');
    const day = String(loopDate.getDate()).padStart(2, '0');
    const dayStr = `${year}-${month}-\dots`;
    
    dateLabels.push(`${month}/${day}`);

    const dayItems = filtered.filter(item => item.date && item.date.startsWith(dayStr.replace('\\dots', day)));
    
    let val = 0;
    if (category === 'order_activity' || category === 'agent_performance' || category === 'product_sales' || category === 'fixed_line') {
      val = dayItems.length;
    } else if (category === 'store_performance') {
      val = dayItems.reduce((sum, d) => sum + (d.revenue || 0), 0);
    } else if (category === 'stock_status') {
      val = dayItems.length;
    } else if (category === 'payment_status') {
      val = dayItems.filter(d => d.payment === 'Failed').length;
    }
    
    dailyValues.push(val);
    loopDate.setDate(loopDate.getDate() + 1);
  }

  const trendTitleMap = {
    order_activity: "Daily Order Ingestion Volume",
    agent_performance: "Daily Operations Processing Volume",
    product_sales: "Daily Unit Dispatched Volume",
    store_performance: "Daily Store Revenue Outflow (ZAR)",
    stock_status: "Daily Stock Requests Opened",
    payment_status: "Daily Card Transaction Failures",
    fixed_line: "Daily Broadband Eligibility Inquiries"
  };
  
  const trendTitleEl = document.getElementById('trend-chart-title');
  if (trendTitleEl) trendTitleEl.innerText = trendTitleMap[category] || "Daily Volume Trend";
  drawSVGLineChart('report-trend-chart-container', dailyValues, dateLabels);

  let donutData = [];
  let leaderboardData = [];

  if (category === 'stock_status') {
    const total = filtered.length;
    const approved = filtered.filter(r => r.status === 'Approved').length;
    const rate = total > 0 ? Math.round((approved / total) * 100) : 0;
    const urgent = filtered.filter(r => r.priority === 'Urgent').length;
    
    const activeReqs = filtered.filter(r => r.status === 'Submitted' || r.status === 'Draft');
    const avgAge = activeReqs.length > 0 ? Math.round(activeReqs.reduce((sum, r) => sum + (r.ageDays || 0), 0) / activeReqs.length) : 0;

    if (kpiGrid) {
      kpiGrid.innerHTML = `
        <div class="metric-card">
          <div class="metric-title">Total Requests</div>
          <div class="metric-value">\dots</div>
          <div class="metric-trend text-secondary">Pre-seeded log scope</div>
        </div>
        <div class="metric-card">
          <div class="metric-title">Approval Rate</div>
          <div class="metric-value">\dots%</div>
          <div class="metric-trend text-success">Approved stock units</div>
        </div>
        <div class="metric-card">
          <div class="metric-title">Avg. Ageing</div>
          <div class="metric-value">\dotsd</div>
          <div class="metric-trend \dots">Pending requests age</div>
        </div>
        <div class="metric-card">
          <div class="metric-title">Urgent Requests</div>
          <div class="metric-value" style="color:var(--telkom-danger)">\dots</div>
          <div class="metric-trend text-danger">Priority allocation items</div>
        </div>
      `.replace('\\dots', total)
       .replace('\\dots', rate)
       .replace('\\dots', avgAge)
       .replace('\\dots', avgAge > 2 ? 'text-danger' : 'text-success')
       .replace('\\dots', urgent);
    }

    donutData = [
      { label: "Approved", value: filtered.filter(r => r.status === 'Approved').length, color: "#a2d829" },
      { label: "Declined", value: filtered.filter(r => r.status === 'Declined').length, color: "#ff4d4f" },
      { label: "Submitted", value: filtered.filter(r => r.status === 'Submitted').length, color: "#0099ff" },
      { label: "Draft", value: filtered.filter(r => r.status === 'Draft').length, color: "#999999" }
    ];

    const prodCount = {};
    filtered.forEach(r => {
      prodCount[r.product] = (prodCount[r.product] || 0) + r.qty;
    });
    for (const [prod, qty] of Object.entries(prodCount)) {
      leaderboardData.push({ label: prod, value: qty, displayValue: `${qty} units` });
    }
    const chartTitleEl = document.getElementById('leaderboard-chart-title');
    if (chartTitleEl) chartTitleEl.innerText = "Top Requested Products (Quantity)";

    tableThead.innerHTML = `
      <tr>
        <th>Request ID</th>
        <th>Store</th>
        <th>Product</th>
        <th>SKU</th>
        <th>Quantity</th>
        <th>Priority</th>
        <th>Date</th>
        <th>Status</th>
      </tr>
    `;

    if (filtered.length === 0) {
      tableTbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:30px; color:var(--text-secondary);">No matching stock records found.</td></tr>`;
    } else {
      filtered.forEach(r => {
        tableTbody.innerHTML += `
          <tr>
            <td><strong>${r.id}</strong></td>
            <td>${r.storeId}</td>
            <td>${r.product}</td>
            <td><code>${r.sku}</code></td>
            <td><span class="badge badge-neutral">${r.qty} units</span></td>
            <td><span class="badge ${r.priority === 'Urgent' ? 'badge-danger' : 'badge-warning'}">${r.priority}</span></td>
            <td>${r.date}</td>
            <td><span class="badge ${r.status === 'Approved' ? 'badge-success' : (r.status === 'Declined' ? 'badge-danger' : 'badge-warning')}">${r.status}</span></td>
          </tr>
        `;
      });
    }
  } else {
    const total = filtered.length;
    const completed = filtered.filter(o => o.status === 'Fulfilled').length;
    const successRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const totalRevenue = filtered.reduce((sum, o) => sum + (o.revenue || 0), 0);
    const avgHandlingTime = total > 0 ? Math.round(filtered.reduce((sum, o) => sum + (o.handlingTime || 0), 0) / total) : 0;

    if (category === 'order_activity') {
      if (kpiGrid) {
        kpiGrid.innerHTML = `
          <div class="metric-card">
            <div class="metric-title">Total Orders</div>
            <div class="metric-value">${total}</div>
            <div class="metric-trend text-secondary">Order capture attempts</div>
          </div>
          <div class="metric-card">
            <div class="metric-title">Fulfillment Rate</div>
            <div class="metric-value">${successRate}%</div>
            <div class="metric-trend text-success">Fulfilled successfully</div>
          </div>
          <div class="metric-card">
            <div class="metric-title">Total Revenue</div>
            <div class="metric-value">R ${totalRevenue.toLocaleString()}</div>
            <div class="metric-trend text-success">Billing projection value</div>
          </div>
          <div class="metric-card">
            <div class="metric-title">Avg. Handling Time</div>
            <div class="metric-value">${avgHandlingTime}m</div>
            <div class="metric-trend text-success">Within service level SLA</div>
          </div>
        `;
      }

      donutData = [
        { label: "Fulfilled", value: filtered.filter(o => o.status === 'Fulfilled').length, color: "#a2d829" },
        { label: "In Progress", value: filtered.filter(o => o.status === 'In Progress').length, color: "#0099ff" },
        { label: "Cancelled", value: filtered.filter(o => o.status === 'Cancelled').length, color: "#ff4d4f" },
        { label: "Failed", value: filtered.filter(o => o.status === 'Failed').length, color: "#d9d9d9" }
      ];

      const agentCount = {};
      filtered.forEach(o => {
        agentCount[o.agent] = (agentCount[o.agent] || 0) + 1;
      });
      for (const [agt, qty] of Object.entries(agentCount)) {
        leaderboardData.push({ label: agt, value: qty });
      }
      const chartTitleEl = document.getElementById('leaderboard-chart-title');
      if (chartTitleEl) chartTitleEl.innerText = "Top Processing Agents (Order Count)";

      tableThead.innerHTML = `
        <tr>
          <th>Order Ref</th>
          <th>Customer</th>
          <th>Product</th>
          <th>Store</th>
          <th>Agent ID</th>
          <th>Date</th>
          <th>Status</th>
          <th>Payment</th>
        </tr>
      `;

      if (filtered.length === 0) {
        tableTbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:30px; color:var(--text-secondary);">No matching order records found.</td></tr>`;
      } else {
        filtered.forEach(o => {
          tableTbody.innerHTML += `
            <tr>
              <td><strong>${o.orderRef}</strong></td>
              <td>${o.customerName}</td>
              <td>${o.product}</td>
              <td><code>${o.store}</code></td>
              <td>${o.agent}</td>
              <td>${o.date}</td>
              <td><span class="badge ${o.status === 'Fulfilled' || o.status === 'Active' ? 'badge-success' : 'badge-warning'}">${o.status}</span></td>
              <td><span class="badge ${o.payment.includes('Complete') ? 'badge-success' : 'badge-danger'}">\dots</span></td>
            </tr>
          `.replace('\dots', o.payment);
        });
      }
    } else if (category === 'agent_performance') {
      const orders = filtered;
      
      if (kpiGrid) {
        kpiGrid.innerHTML = `
          <div class="metric-card">
            <div class="metric-title">Agents Processing</div>
            <div class="metric-value">\dots</div>
            <div class="metric-trend text-secondary">Active branch agents</div>
          </div>
          <div class="metric-card">
            <div class="metric-title">Total Orders</div>
            <div class="metric-value">\dots</div>
            <div class="metric-trend text-success">Ingested volume</div>
          </div>
          <div class="metric-card">
            <div class="metric-title">Avg Handling Time</div>
            <div class="metric-value">\dotsm</div>
            <div class="metric-trend text-success">Customer face-to-face rate</div>
          </div>
          <div class="metric-card">
            <div class="metric-title">Optimal Actions</div>
            <div class="metric-value">\dots%</div>
            <div class="metric-trend text-success">Handling times &le; 25 mins</div>
          </div>
        `.replace('\dots', new Set(orders.map(o => o.agent)).size)
         .replace('\dots', total)
         .replace('\dots', avgHandlingTime)
         .replace('\dots', total > 0 ? Math.round((orders.filter(o => o.handlingTime <= 25).length / total) * 100) : 0);
      }

      donutData = [
        { label: "Optimal (<25m)", value: orders.filter(o => o.handlingTime <= 25).length, color: "#a2d829" },
        { label: "Acceptable (25-35m)", value: orders.filter(o => o.handlingTime > 25 && o.handlingTime <= 35).length, color: "#0099ff" },
        { label: "Suboptimal (>35m)", value: orders.filter(o => o.handlingTime > 35).length, color: "#ff4d4f" }
      ];

      const agentAverages = {};
      const agentTotals = {};
      orders.forEach(o => {
        agentTotals[o.agent] = (agentTotals[o.agent] || 0) + o.handlingTime;
        agentAverages[o.agent] = (agentAverages[o.agent] || 0) + 1;
      });
      for (const [agt, count] of Object.entries(agentAverages)) {
        const avg = Math.round(agentTotals[agt] / count);
        leaderboardData.push({ label: agt, value: avg, displayValue: `${avg} mins` });
      }
      const chartTitleEl = document.getElementById('leaderboard-chart-title');
      if (chartTitleEl) chartTitleEl.innerText = "Agent Performance (Average Handling Time)";

      tableThead.innerHTML = `
        <tr>
          <th>Order Ref</th>
          <th>Agent ID</th>
          <th>Agent Name</th>
          <th>Store</th>
          <th>Product</th>
          <th>Handling Time</th>
          <th>Status</th>
        </tr>
      `;

      if (filtered.length === 0) {
        tableTbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:30px; color:var(--text-secondary);">No performance logs recorded.</td></tr>`;
      } else {
        filtered.forEach(o => {
          tableTbody.innerHTML += `
            <tr>
              <td><strong>${o.orderRef}</strong></td>
              <td>${o.agent}</td>
              <td>${o.agentName || 'Store Agent'}</td>
              <td><code>${o.store}</code></td>
              <td>${o.product}</td>
              <td>${o.handlingTime} minutes</td>
              <td><span class="badge ${o.status === 'Fulfilled' || o.status === 'Active' ? 'badge-success' : 'badge-warning'}">${o.status}</span></td>
            </tr>
          `;
        });
      }
    } else if (category === 'product_sales') {
      const orders = filtered;
      const dataSales = orders.filter(o => o.type === 'Mobile Data');
      const voiceSales = orders.filter(o => o.type === 'Mobile' || o.type === 'SIM-only');
      const broadbandSales = orders.filter(o => o.type === 'Fixed Line');

      if (kpiGrid) {
        kpiGrid.innerHTML = `
          <div class="metric-card">
            <div class="metric-title">Broadband Fiber</div>
            <div class="metric-value">\dots</div>
            <div class="metric-trend text-secondary">Exlight connections</div>
          </div>
          <div class="metric-card">
            <div class="metric-title">LTE Router Data</div>
            <div class="metric-value">\dots</div>
            <div class="metric-trend text-success">Mobile data router deals</div>
          </div>
          <div class="metric-card">
            <div class="metric-title">Voice SIM Plans</div>
            <div class="metric-value">\dots</div>
            <div class="metric-trend text-success">SIM-only contracts</div>
          </div>
          <div class="metric-card">
            <div class="metric-title">Avg Order ZAR</div>
            <div class="metric-value">R \dots</div>
            <div class="metric-trend text-success">Monthly projection</div>
          </div>
        `.replace('\dots', broadbandSales.length)
         .replace('\dots', dataSales.length)
         .replace('\dots', voiceSales.length)
         .replace('\dots', total > 0 ? Math.round(totalRevenue / total) : 0);
      }

      donutData = [
        { label: "Fixed Line Fiber", value: broadbandSales.length, color: "#a2d829" },
        { label: "Mobile Data LTE", value: dataSales.length, color: "#0099ff" },
        { label: "Voice SIM Plans", value: voiceSales.length, color: "#ff4d4f" }
      ];

      const prodCount = {};
      orders.forEach(o => {
        prodCount[o.product] = (prodCount[o.product] || 0) + 1;
      });
      for (const [pr, val] of Object.entries(prodCount)) {
        leaderboardData.push({ label: pr, value: val });
      }
      const chartTitleEl = document.getElementById('leaderboard-chart-title');
      if (chartTitleEl) chartTitleEl.innerText = "Top Products (Dispatched Count)";

      tableThead.innerHTML = `
        <tr>
          <th>Order Ref</th>
          <th>Product Name</th>
          <th>Category</th>
          <th>Type</th>
          <th>Monthly Fee</th>
          <th>Contract Date</th>
          <th>Status</th>
        </tr>
      `;

      if (filtered.length === 0) {
        tableTbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:30px; color:var(--text-secondary);">No sales records found.</td></tr>`;
      } else {
        filtered.forEach(o => {
          tableTbody.innerHTML += `
            <tr>
              <td><strong>${o.orderRef}</strong></td>
              <td>${o.product}</td>
              <td>${o.productCategory || 'Mobile'}</td>
              <td>${o.type}</td>
              <td>R ${o.revenue}</td>
              <td>${o.date}</td>
              <td><span class="badge ${o.status === 'Fulfilled' || o.status === 'Active' ? 'badge-success' : 'badge-warning'}">${o.status}</span></td>
            </tr>
          `;
        });
      }
    } else if (category === 'store_performance') {
      const orders = filtered;
      
      const ptaRev = orders.filter(o => o.store === 'PTA-001').reduce((sum, o) => sum + o.revenue, 0);
      const jhbRev = orders.filter(o => o.store === 'JHB-002').reduce((sum, o) => sum + o.revenue, 0);
      const dbnRev = orders.filter(o => o.store === 'DBN-003').reduce((sum, o) => sum + o.revenue, 0);

      if (kpiGrid) {
        kpiGrid.innerHTML = `
          <div class="metric-card">
            <div class="metric-title">Total Store Income</div>
            <div class="metric-value">R \dots</div>
            <div class="metric-trend text-secondary">ZAR revenue sum</div>
          </div>
          <div class="metric-card">
            <div class="metric-title">JHB-002 (Rosebank)</div>
            <div class="metric-value">R \dots</div>
            <div class="metric-trend text-success">Gauteng node</div>
          </div>
          <div class="metric-card">
            <div class="metric-title">PTA-001 (Tshwane)</div>
            <div class="metric-value">R \dots</div>
            <div class="metric-trend text-success">Pretoria node</div>
          </div>
          <div class="metric-card">
            <div class="metric-title">DBN-003 (Gateway)</div>
            <div class="metric-value">R \dots</div>
            <div class="metric-trend text-success">KZN node</div>
          </div>
        `.replace('\dots', totalRevenue.toLocaleString())
         .replace('\dots', jhbRev.toLocaleString())
         .replace('\dots', ptaRev.toLocaleString())
         .replace('\dots', dbnRev.toLocaleString());
      }

      donutData = [
        { label: "PTA-001 (Tshwane)", value: ptaRev, color: "#a2d829" },
        { label: "JHB-002 (Rosebank)", value: jhbRev, color: "#0099ff" },
        { label: "DBN-003 (Gateway)", value: dbnRev, color: "#ff4d4f" }
      ];

      const storeCounts = {};
      orders.forEach(o => {
        storeCounts[o.store] = (storeCounts[o.store] || 0) + o.revenue;
      });
      for (const [st, val] of Object.entries(storeCounts)) {
        leaderboardData.push({ label: st, value: val, displayValue: `R ${val.toLocaleString()}` });
      }
      const chartTitleEl = document.getElementById('leaderboard-chart-title');
      if (chartTitleEl) chartTitleEl.innerText = "Store Performance (Total ZAR Revenue)";

      tableThead.innerHTML = `
        <tr>
          <th>Order Ref</th>
          <th>Store Node</th>
          <th>Agent ID</th>
          <th>Product Name</th>
          <th>Revenue (ZAR)</th>
          <th>Date Ingested</th>
          <th>Fulfillment</th>
        </tr>
      `;

      if (filtered.length === 0) {
        tableTbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:30px; color:var(--text-secondary);">No transaction logs recorded.</td></tr>`;
      } else {
        filtered.forEach(o => {
          tableTbody.innerHTML += `
            <tr>
              <td><strong>${o.orderRef}</strong></td>
              <td><code>${o.store}</code></td>
              <td>${o.agent}</td>
              <td>${o.product}</td>
              <td><strong>R ${o.revenue}</strong></td>
              <td>${o.date}</td>
              <td><span class="badge ${o.status === 'Fulfilled' || o.status === 'Active' ? 'badge-success' : 'badge-warning'}">${o.status}</span></td>
            </tr>
          `;
        });
      }
    } else if (category === 'payment_status') {
      const orders = filtered;
      const successful = orders.filter(o => o.payment === 'Payment Complete').length;
      const failed = orders.filter(o => o.payment === 'Failed').length;
      const refunded = orders.filter(o => o.payment === 'Refunded').length;

      if (kpiGrid) {
        kpiGrid.innerHTML = `
          <div class="metric-card">
            <div class="metric-title">Total Transactions</div>
            <div class="metric-value">\dots</div>
            <div class="metric-trend text-secondary">Card terminal handshakes</div>
          </div>
          <div class="metric-card">
            <div class="metric-title">Successful Payments</div>
            <div class="metric-value">\dots</div>
            <div class="metric-trend text-success">POS terminal cleared</div>
          </div>
          <div class="metric-card">
            <div class="metric-title">Failed Payments</div>
            <div class="metric-value" style="color:var(--telkom-danger)">\dots</div>
            <div class="metric-trend text-danger">Terminal declines/timeouts</div>
          </div>
          <div class="metric-card">
            <div class="metric-title">Refunded Transactions</div>
            <div class="metric-value">\dots</div>
            <div class="metric-trend text-warning">Cancelled orders</div>
          </div>
        `.replace('\dots', total)
         .replace('\dots', successful)
         .replace('\dots', failed)
         .replace('\dots', refunded);
      }

      donutData = [
        { label: "Successful", value: successful, color: "#a2d829" },
        { label: "Failed", value: failed, color: "#ff4d4f" },
        { label: "Refunded", value: refunded, color: "#0099ff" }
      ];

      const paymentCounts = {};
      orders.forEach(o => {
        paymentCounts[o.payment] = (paymentCounts[o.payment] || 0) + 1;
      });
      for (const [pm, val] of Object.entries(paymentCounts)) {
        leaderboardData.push({ label: pm, value: val });
      }
      const chartTitleEl = document.getElementById('leaderboard-chart-title');
      if (chartTitleEl) chartTitleEl.innerText = "Payment Gateway Outflow (Transaction Count)";

      tableThead.innerHTML = `
        <tr>
          <th>Order Ref</th>
          <th>Customer Name</th>
          <th>Store Node</th>
          <th>Product Name</th>
          <th>Value (ZAR)</th>
          <th>Transaction Status</th>
          <th>Date</th>
        </tr>
      `;

      if (filtered.length === 0) {
        tableTbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:30px; color:var(--text-secondary);">No merchant transaction records found.</td></tr>`;
      } else {
        filtered.forEach(o => {
          tableTbody.innerHTML += `
            <tr>
              <td><strong>${o.orderRef}</strong></td>
              <td>${o.customerName}</td>
              <td><code>${o.store}</code></td>
              <td>${o.product}</td>
              <td>R \dots</td>
              <td><span class="badge ${o.payment === 'Payment Complete' ? 'badge-success' : 'badge-danger'}">\dots</span></td>
              <td>${o.date}</td>
            </tr>
          `.replace('\dots', o.revenue)
           .replace('\dots', o.payment);
        });
      }
    } else if (category === 'fixed_line') {
      const orders = filtered;
      const checkRecords = orders.filter(o => o.coverageOutcome && o.coverageOutcome !== 'N/A');
      
      const avail = checkRecords.filter(c => c.coverageOutcome === 'Coverage available').length;
      const unavail = checkRecords.filter(c => c.coverageOutcome === 'Coverage unavailable').length;
      const inconcl = checkRecords.filter(c => c.coverageOutcome === 'Coverage inconclusive').length;

      if (kpiGrid) {
        kpiGrid.innerHTML = `
          <div class="metric-card">
            <div class="metric-title">Broadband Inquiries</div>
            <div class="metric-value">\dots</div>
            <div class="metric-trend text-secondary">GIS checks performed</div>
          </div>
          <div class="metric-card">
            <div class="metric-title">Coverage Available</div>
            <div class="metric-value">\dots</div>
            <div class="metric-trend text-success">Feasibility passed</div>
          </div>
          <div class="metric-card">
            <div class="metric-title">Coverage Unavailable</div>
            <div class="metric-value" style="color:var(--telkom-danger)">\dots</div>
            <div class="metric-trend text-danger">Broadband blocked</div>
          </div>
          <div class="metric-card">
            <div class="metric-title">Coverage Inconclusive</div>
            <div class="metric-value">\dots</div>
            <div class="metric-trend text-warning">Manual coordination checks</div>
          </div>
        `.replace('\dots', checkRecords.length)
         .replace('\dots', avail)
         .replace('\dots', unavail)
         .replace('\dots', inconcl);
      }

      donutData = [
        { label: "Available", value: avail, color: "#a2d829" },
        { label: "Unavailable", value: unavail, color: "#ff4d4f" },
        { label: "Inconclusive", value: inconcl, color: "#0099ff" }
      ];

      const outcomeCounts = {};
      checkRecords.forEach(c => {
        outcomeCounts[c.coverageOutcome] = (outcomeCounts[c.coverageOutcome] || 0) + 1;
      });
      for (const [oc, val] of Object.entries(outcomeCounts)) {
        leaderboardData.push({ label: oc, value: val });
      }
      const chartTitleEl = document.getElementById('leaderboard-chart-title');
      if (chartTitleEl) chartTitleEl.innerText = "Broadband Eligibility Feasibility Ratio";

      tableThead.innerHTML = `
        <tr>
          <th>Order Ref</th>
          <th>Customer Name</th>
          <th>Broadband Product</th>
          <th>Store Node</th>
          <th>GIS Coordinates</th>
          <th>Coverage Result</th>
          <th>Date Checked</th>
        </tr>
      `;

      if (checkRecords.length === 0) {
        tableTbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:30px; color:var(--text-secondary);">No GIS feasibility logs recorded.</td></tr>`;
      } else {
        checkRecords.forEach(o => {
          tableTbody.innerHTML += `
            <tr>
              <td><strong>${o.orderRef}</strong></td>
              <td>${o.customerName}</td>
              <td>${o.product}</td>
              <td><code>${o.store}</code></td>
              <td>-26.15, 28.05</td>
              <td><span class="badge ${o.coverageOutcome === 'Coverage available' ? 'badge-success' : 'badge-danger'}">\dots</span></td>
              <td>${o.date}</td>
            </tr>
          `.replace('\dots', o.coverageOutcome);
        });
      }
    }
  }

  // Draw donut
  drawSVGDonutChart('report-donut-chart-container', donutData);

  // Draw leaderboard
  renderLeaderboardChart('report-leaderboard-container', leaderboardData);

  // Actionable Insights
  generateActionableInsights(filtered, category, role);

  // Dynamic Audit metadata stamp
  const timestampStr = new Date().toLocaleString();
  const tsEl = document.getElementById('report-timestamp-meta');
  if (tsEl) tsEl.innerText = `Generated: ${timestampStr} by ${APP_STATE.currentUser.id} (${APP_STATE.currentUser.name})`;
}

export function openExportModal() {
  const category = document.getElementById('report-filter-category').value;
  const store = document.getElementById('report-filter-store').value;
  const startDate = document.getElementById('report-filter-start-date').value;
  const endDate = document.getElementById('report-filter-end-date').value;

  const catName = document.getElementById('report-filter-category').options[document.getElementById('report-filter-category').selectedIndex].text;
  const storeName = document.getElementById('report-filter-store').options[document.getElementById('report-filter-store').selectedIndex].text;

  document.getElementById('export-modal-report-name').innerText = catName;
  document.getElementById('export-modal-scope').innerText = `Branch: ${storeName}`;
  document.getElementById('export-from-date').value = startDate;
  document.getElementById('export-to-date').value = endDate;

  // Reset progress bar
  document.getElementById('export-modal-progress-container').style.display = 'none';
  document.getElementById('export-modal-progress-pct').innerText = '0%';
  document.getElementById('export-modal-progress-bar').style.width = '0%';
  document.getElementById('btn-confirm-export').disabled = false;

  openModal('report-export-modal');
}

export function toggleSelectAllExportFormats(el) {
  const checked = el.checked;
  document.getElementById('export-format-pdf').checked = checked;
  document.getElementById('export-format-csv').checked = checked;
  document.getElementById('export-format-excel').checked = checked;
}

export function triggerReportDownload() {
  const pdfChecked = document.getElementById('export-format-pdf').checked;
  const csvChecked = document.getElementById('export-format-csv').checked;
  const excelChecked = document.getElementById('export-format-excel').checked;
  
  if (!pdfChecked && !csvChecked && !excelChecked) {
    showToast("Please select at least one format to download.", "warning");
    return;
  }

  const progressContainer = document.getElementById('export-modal-progress-container');
  const progressBar = document.getElementById('export-modal-progress-bar');
  const progressPct = document.getElementById('export-modal-progress-pct');
  const exportBtn = document.getElementById('btn-confirm-export');

  progressContainer.style.display = 'block';
  exportBtn.disabled = true;

  let pct = 0;
  const interval = setInterval(() => {
    pct += 10;
    progressBar.style.width = pct + '%';
    progressPct.innerText = pct + '%';

    if (pct >= 100) {
      clearInterval(interval);
      
      const fromDate = document.getElementById('export-from-date').value;
      const toDate = document.getElementById('export-to-date').value;
      const category = document.getElementById('report-filter-category').value;
      const store = document.getElementById('report-filter-store').value;
      
      const filtered = getFilteredReportDataByDates(category, store, fromDate, toDate);

      // Execute downloads
      if (csvChecked) {
        downloadCSVReport(category, filtered, fromDate, toDate);
      }
      if (excelChecked) {
        downloadExcelReport(category, filtered, fromDate, toDate);
      }
      if (pdfChecked) {
        downloadPDFReport(category, store, filtered, fromDate, toDate);
      }

      setTimeout(() => {
        closeModal('report-export-modal');
        showToast("Export completed successfully.", "success");
      }, 300);
    }
  }, 80);
}

export function downloadCSVReport(category, data, fromDate, toDate) {
  let csvContent = "";
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

  if (category === 'stock_status') {
    csvContent += `Telkom Stock Request Status History Report\\n`;
    csvContent += `Generated at: ${timestamp} SAST\\n`;
    csvContent += `Date Range: ${fromDate} to ${toDate}\\n\\n`;
    csvContent += `Request ID,Store,Product,SKU,Quantity,Priority,Date,Status,Notes\\n`;
    
    data.forEach(r => {
      csvContent += `"${r.id}","${r.storeId}","\dots","${r.sku}","${r.qty}","${r.priority}","${r.date}","${r.status}","${r.notes || ''}"\\n`.replace('\dots', r.product.replace(/"/g, '""'));
    });
  } else {
    csvContent += `Telkom Operational Sales Report (${category.toUpperCase()})\\n`;
    csvContent += `Generated at: ${timestamp} SAST\\n`;
    csvContent += `Date Range: ${fromDate} to ${toDate}\\n\\n`;
    csvContent += `Order Ref,Customer,Account No,Product,Store,Agent,Date,Status,Payment,Handling Time (mins),Value (ZAR),Coverage Outcome\\n`;
    
    data.forEach(o => {
      csvContent += `"${o.orderRef}","${o.customerName}","${o.accountNo}","\dots","${o.store}","${o.agent}","${o.date}","${o.status}","${o.payment}","${o.handlingTime}","${o.revenue}","${o.coverageOutcome || 'N/A'}"\\n`.replace('\dots', o.product.replace(/"/g, '""'));
    });
  }

  const blob = new Blob([csvContent.replace(/\\n/g, '\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `Telkom_Report_${category}_${fromDate}_to_${toDate}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function downloadExcelReport(category, data, fromDate, toDate) {
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  
  let excelHtml = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: sans-serif; }
        table { border-collapse: collapse; width: 100%; }
        th { background-color: #0099ff; color: white; border: 1px solid #ccc; padding: 6px; }
        td { border: 1px solid #ccc; padding: 6px; }
        .header-cell { font-weight: bold; font-size: 16px; color: #0a1c3a; }
      </style>
    </head>
    <body>
      <table>
        <tr><td class="header-cell" colspan="8">Telkom Operational Report - Excel Output</td></tr>
        <tr><td colspan="8">Generated: ${timestamp} SAST</td></tr>
        <tr><td colspan="8">Date range: \dots to \dots</td></tr>
        <tr><td colspan="8">Category: ${category}</td></tr>
        <tr><td colspan="8"></td></tr>
  `.replace('\dots', fromDate).replace('\dots', toDate);

  if (category === 'stock_status') {
    excelHtml += `
      <thead>
        <tr>
          <th>Request ID</th>
          <th>Store</th>
          <th>Product</th>
          <th>SKU</th>
          <th>Quantity</th>
          <th>Priority</th>
          <th>Date</th>
          <th>Status</th>
          <th>Notes</th>
        </tr>
      </thead>
      <tbody>
    `;
    data.forEach(r => {
      excelHtml += `
        <tr>
          <td>${r.id}</td>
          <td>${r.storeId}</td>
          <td>${r.product}</td>
          <td>${r.sku}</td>
          <td>${r.qty}</td>
          <td>${r.priority}</td>
          <td>${r.date}</td>
          <td>${r.status}</td>
          <td>${r.notes || ''}</td>
        </tr>
      `;
    });
  } else {
    excelHtml += `
      <thead>
        <tr>
          <th>Order Ref</th>
          <th>Customer</th>
          <th>Account No</th>
          <th>Product</th>
          <th>Store</th>
          <th>Agent</th>
          <th>Date</th>
          <th>Status</th>
          <th>Payment</th>
          <th>Handling Time (m)</th>
          <th>Value (ZAR)</th>
          <th>Coverage Outcome</th>
        </tr>
      </thead>
      <tbody>
    `;
    data.forEach(o => {
      excelHtml += `
        <tr>
          <td>${o.orderRef}</td>
          <td>${o.customerName}</td>
          <td>${o.accountNo}</td>
          <td>${o.product}</td>
          <td>${o.store}</td>
          <td>${o.agent}</td>
          <td>${o.date}</td>
          <td>${o.status}</td>
          <td>${o.payment}</td>
          <td>${o.handlingTime}</td>
          <td>${o.revenue}</td>
          <td>${o.coverageOutcome || 'N/A'}</td>
        </tr>
      `;
    });
  }

  excelHtml += `
      </tbody>
    </table>
    </body>
    </html>
  `;

  const blob = new Blob([excelHtml], { type: 'application/vnd.ms-excel' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `Telkom_Report_${category}_\dots.xls`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function downloadPDFReport(category, store, data, fromDate, toDate) {
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const printWindow = window.open("", "_blank");
  
  if (!printWindow) {
    showToast("Popup blocker prevented print window. Please allow popups.", "danger");
    return;
  }

  const catName = document.getElementById('report-filter-category').options[document.getElementById('report-filter-category').selectedIndex].text;
  const storeName = document.getElementById('report-filter-store').options[document.getElementById('report-filter-store').selectedIndex].text;

  let kpisHtml = "";
  if (category === 'stock_status') {
    const total = data.length;
    const approved = data.filter(d => d.status === 'Approved').length;
    const rate = total > 0 ? Math.round((approved / total) * 100) : 0;
    const urgent = data.filter(d => d.priority === 'Urgent').length;
    kpisHtml = `
      <div style="display:flex; justify-content:space-between; margin-bottom: 20px;">
        <div style="border:1px solid #ccc; padding:10px; border-radius:4px; flex:1; margin-right:10px; text-align:center;">
          <div style="font-size:11px; color:#666;">Total Requests</div>
          <div style="font-size:18px; font-weight:bold;">${total}</div>
        </div>
        <div style="border:1px solid #ccc; padding:10px; border-radius:4px; flex:1; margin-right:10px; text-align:center;">
          <div style="font-size:11px; color:#666;">Approval Rate</div>
          <div style="font-size:18px; font-weight:bold;">${rate}%</div>
        </div>
        <div style="border:1px solid #ccc; padding:10px; border-radius:4px; flex:1; text-align:center;">
          <div style="font-size:11px; color:#666;">Urgent Requests</div>
          <div style="font-size:18px; font-weight:bold; color:red;">${urgent}</div>
        </div>
      </div>
    `;
  } else {
    const total = data.length;
    const completed = data.filter(d => d.status === 'Fulfilled').length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const revenue = data.reduce((sum, d) => sum + (d.revenue || 0), 0);
    kpisHtml = `
      <div style="display:flex; justify-content:space-between; margin-bottom: 20px;">
        <div style="border:1px solid #ccc; padding:10px; border-radius:4px; flex:1; margin-right:10px; text-align:center;">
          <div style="font-size:11px; color:#666;">Total Transactions</div>
          <div style="font-size:18px; font-weight:bold;">${total}</div>
        </div>
        <div style="border:1px solid #ccc; padding:10px; border-radius:4px; flex:1; margin-right:10px; text-align:center;">
          <div style="font-size:11px; color:#666;">Success Rate</div>
          <div style="font-size:18px; font-weight:bold;">${rate}%</div>
        </div>
        <div style="border:1px solid #ccc; padding:10px; border-radius:4px; flex:1; text-align:center;">
          <div style="font-size:11px; color:#666;">Total Revenue</div>
          <div style="font-size:18px; font-weight:bold; color:#0099ff;">R ${revenue.toLocaleString()}</div>
        </div>
      </div>
    `;
  }

  let tableHeaders = "";
  let tableRows = "";

  if (category === 'stock_status') {
    tableHeaders = `
      <tr>
        <th>Request ID</th>
        <th>Store</th>
        <th>Product</th>
        <th>SKU</th>
        <th>Qty</th>
        <th>Priority</th>
        <th>Date</th>
        <th>Status</th>
      </tr>
    `;
    data.forEach(r => {
      tableRows += `
        <tr>
          <td><strong>${r.id}</strong></td>
          <td>${r.storeId}</td>
          <td>${r.product}</td>
          <td><code>${r.sku}</code></td>
          <td>${r.qty}</td>
          <td><span style="color: ${r.priority === 'Urgent' ? 'red' : 'black'}; font-weight: \dots;">${r.priority}</span></td>
          <td>${r.date}</td>
          <td>${r.status}</td>
        </tr>
      `.replace('\dots', r.priority === 'Urgent' ? 'bold' : 'normal');
    });
  } else {
    tableHeaders = `
      <tr>
        <th>Order Ref</th>
        <th>Customer</th>
        <th>Product</th>
        <th>Store</th>
        <th>Agent</th>
        <th>Date</th>
        <th>Status</th>
        <th>Payment</th>
        <th>Outcome</th>
        <th>Value</th>
      </tr>
    `;
    data.forEach(o => {
      tableRows += `
        <tr>
          <td><strong>${o.orderRef}</strong></td>
          <td>${o.customerName}</td>
          <td>${o.product}</td>
          <td>${o.store}</td>
          <td>${o.agent}</td>
          <td>${o.date}</td>
          <td>${o.status}</td>
          <td>${o.payment}</td>
          <td>${o.coverageOutcome || 'N/A'}</td>
          <td>R ${o.revenue}</td>
        </tr>
      `;
    });
  }

  const documentHtml = `
    <html>
    <head>
      <title>Telkom Operational Report - PDF Output</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; color: #333; }
        .logo-area { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #0099ff; padding-bottom: 15px; margin-bottom: 25px; }
        .logo-txt { font-size: 24px; font-weight: bold; color: #0a1c3a; }
        .report-meta { font-size: 12px; color: #555; line-height: 1.5; }
        .report-title { font-size: 20px; font-weight: bold; margin-bottom: 15px; color: #0099ff; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { border: 1px solid #ddd; padding: 10px; font-size: 11px; text-align: left; }
        th { background-color: #f2f2f2; color: #0a1c3a; font-weight: bold; }
        tr:nth-child(even) { background-color: #fafafa; }
        .footer { margin-top: 40px; border-top: 1px solid #ccc; padding-top: 10px; font-size: 10px; color: #777; text-align: center; }
      </style>
    </head>
    <body>
      <div class="logo-area">
        <div>
          <div style="font-size: 20px; font-weight: bold; color: #0f3057;">Telkom Retail</div>
          <div style="font-size: 12px; color: #0099ff; font-weight: 600;">Unified Digital Platform</div>
        </div>
        <div class="report-meta" style="text-align: right;">
          <strong>Date Generated:</strong> ${timestamp} SAST<br>
          <strong>Scope:</strong> ${storeName}<br>
          <strong>Date Range:</strong> ${fromDate} to ${toDate}
        </div>
      </div>

      <div class="report-title">${catName}</div>
      <p style="font-size: 13px; margin-bottom: 20px; color: #555;">This audit log contains the records and operational metrics filtered under branch parameters.</p>

      ${kpisHtml}

      <table>
        <thead>
          ${tableHeaders}
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>

      <div class="footer">
        Confidential Report - Telkom SA Ltd. Corporate Security Compliance.<br>
        For internal audit and operational management authorization use only.
      </div>

      <script>
        window.onload = function() {
          window.print();
        }
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(documentHtml);
  printWindow.document.close();

  const fileContent = `
========================================
TELKOM RETAIL OPERATIONAL AUDIT REPORT
========================================
Generated: ${timestamp} SAST
Category: \dots
Scope: \dots
Date Range: \dots to \dots
Total Records: ${data.length}
========================================
Report metadata compilation complete.
See printable window layout for the PDF document preview structure.
========================================
`.replace('\dots', catName).replace('\dots', storeName).replace('\dots', fromDate).replace('\dots', toDate);
  const blob = new Blob([fileContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `Telkom_Report_\dots.pdf`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Bind to window for inline onclick attributes
window.handleReportFilterChange = handleReportFilterChange;
window.renderReports = renderReports;
window.openExportModal = openExportModal;
window.toggleSelectAllExportFormats = toggleSelectAllExportFormats;
window.triggerReportDownload = triggerReportDownload;

export function handleLogFilterChange() {
  renderRecordLogs();
}

export function resetLogFilters() {
  const logSearchInput = document.getElementById('log-search-input');
  if (logSearchInput) logSearchInput.value = '';
  const logFilterCategory = document.getElementById('log-filter-category');
  if (logFilterCategory) logFilterCategory.value = 'order_activity';
  
  // Set default dates
  const logFilterStartDate = document.getElementById('log-filter-start-date');
  if (logFilterStartDate) logFilterStartDate.value = '2026-06-01';
  const logFilterEndDate = document.getElementById('log-filter-end-date');
  if (logFilterEndDate) logFilterEndDate.value = '2026-06-12';
  
  // Reset store select if not disabled
  const storeSelect = document.getElementById('log-filter-store');
  if (storeSelect && !storeSelect.disabled) {
    storeSelect.value = 'ALL';
  }
  
  renderRecordLogs();
}

export function getFilteredLogsData() {
  const category = document.getElementById('log-filter-category').value;
  const store = document.getElementById('log-filter-store').value;
  const startDateStr = document.getElementById('log-filter-start-date').value;
  const endDateStr = document.getElementById('log-filter-end-date').value;
  const searchInput = document.getElementById('log-search-input');
  const searchVal = searchInput ? searchInput.value.trim().toLowerCase() : '';

  let filtered = getFilteredReportDataByDates(category, store, startDateStr, endDateStr);

  if (searchVal) {
    filtered = filtered.filter(item => {
      if (category === 'stock_status') {
        return (
          item.id.toLowerCase().includes(searchVal) ||
          item.product.toLowerCase().includes(searchVal) ||
          item.sku.toLowerCase().includes(searchVal) ||
          (item.storeId && item.storeId.toLowerCase().includes(searchVal)) ||
          (item.status && item.status.toLowerCase().includes(searchVal))
        );
      } else {
        return (
          item.orderRef.toLowerCase().includes(searchVal) ||
          item.customerName.toLowerCase().includes(searchVal) ||
          (item.accountNo && item.accountNo.toLowerCase().includes(searchVal)) ||
          item.product.toLowerCase().includes(searchVal) ||
          item.store.toLowerCase().includes(searchVal) ||
          (item.agent && item.agent.toLowerCase().includes(searchVal)) ||
          (item.status && item.status.toLowerCase().includes(searchVal))
        );
      }
    });
  }

  return filtered;
}

export function renderRecordLogs() {
  const role = APP_STATE.currentUser.role;
  const storeSelect = document.getElementById('log-filter-store');
  const storeSelectGroup = document.getElementById('log-store-filter-group');

  if (!storeSelect) return;

  // Lock branch if Store Manager
  if (role === 'manager') {
    storeSelect.value = APP_STATE.currentUser.branch;
    storeSelect.disabled = true;
    if (storeSelectGroup) storeSelectGroup.style.opacity = '0.7';
  } else {
    storeSelect.disabled = false;
    if (storeSelectGroup) storeSelectGroup.style.opacity = '1';
  }

  const category = document.getElementById('log-filter-category').value;
  const filtered = getFilteredLogsData();

  const tableThead = document.getElementById('log-table-thead');
  const tableTbody = document.getElementById('log-table-tbody');
  
  if (!tableThead || !tableTbody) return;
  
  tableThead.innerHTML = '';
  tableTbody.innerHTML = '';

  if (category === 'stock_status') {
    tableThead.innerHTML = `
      <tr>
        <th>Request ID</th>
        <th>Store</th>
        <th>Product</th>
        <th>SKU</th>
        <th>Quantity</th>
        <th>Priority</th>
        <th>Date</th>
        <th>Status</th>
      </tr>
    `;

    if (filtered.length === 0) {
      tableTbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:30px; color:var(--text-secondary);">No matching stock logs found.</td></tr>`;
    } else {
      filtered.forEach(r => {
        tableTbody.innerHTML += `
          <tr>
            <td><strong>${r.id}</strong></td>
            <td>${r.storeId}</td>
            <td>${r.product}</td>
            <td><code>${r.sku}</code></td>
            <td><span class="badge badge-neutral">${r.qty} units</span></td>
            <td><span class="badge ${r.priority === 'Urgent' ? 'badge-danger' : 'badge-warning'}">${r.priority}</span></td>
            <td>${r.date}</td>
            <td><span class="badge ${r.status === 'Approved' ? 'badge-success' : (r.status === 'Declined' ? 'badge-danger' : 'badge-warning')}">${r.status}</span></td>
          </tr>
        `;
      });
    }
  } else {
    tableThead.innerHTML = `
      <tr>
        <th>Order Ref</th>
        <th>Customer Name</th>
        <th>Product Name</th>
        <th>Store</th>
        <th>Agent ID</th>
        <th>Date</th>
        <th>Status</th>
        <th>Payment</th>
        ${category === 'payment_status' ? '<th>Handling (m)</th><th>Revenue Value</th>' : ''}
        ${category === 'fixed_line' ? '<th>GIS Outcome</th>' : ''}
        <th>Action</th>
      </tr>
    `;

    if (filtered.length === 0) {
      tableTbody.innerHTML = `<tr><td colspan="${category === 'payment_status' ? 10 : (category === 'fixed_line' ? 9 : 8)}" style="text-align:center; padding:30px; color:var(--text-secondary);">No matching logs found.</td></tr>`;
    } else {
      filtered.forEach(o => {
        let extraCols = '';
        if (category === 'payment_status') {
          extraCols = `<td>${o.handlingTime}m</td><td>R ${o.revenue}</td>`;
        } else if (category === 'fixed_line') {
          extraCols = `<td><span class="badge ${o.coverageOutcome === 'Coverage available' ? 'badge-success' : (o.coverageOutcome === 'Coverage unavailable' ? 'badge-danger' : 'badge-warning')}">${o.coverageOutcome}</span></td>`;
        }

        tableTbody.innerHTML += `
          <tr>
            <td><strong>${o.orderRef}</strong></td>
            <td>${o.customerName}</td>
            <td>${o.product}</td>
            <td>${o.store}</td>
            <td><code>${o.agent}</code></td>
            <td>${o.date}</td>
            <td><span class="badge ${o.status === 'Fulfilled' ? 'badge-success' : (o.status === 'Cancelled' ? 'badge-warning' : (o.status === 'Failed' ? 'badge-danger' : 'badge-neutral'))}">${o.status}</span></td>
            <td><span class="badge \dots">${o.payment}</span></td>
            ${extraCols}
            <td>
              <button class="btn btn-sm btn-primary" onclick="downloadOrderReceipt('${o.orderRef}')" style="white-space:nowrap;">
                🧾 Receipt
              </button>
            </td>
          </tr>
        `.replace('\\dots', o.payment === 'Payment Complete' ? 'badge-success' : (o.payment === 'Failed' ? 'badge-danger' : 'badge-warning'));
      });
    }
  }

  // Update count
  const countEl = document.getElementById('log-table-count');
  if (countEl) countEl.innerText = `Showing ${filtered.length} entries`;

  // Set Generation Timestamp
  const now = new Date();
  const timestampStr = now.toISOString().replace('T', ' ').substring(0, 19) + " SAST";
  const genEl = document.getElementById('log-generation-timestamp');
  if (genEl) genEl.innerText = `Generated: ${timestampStr} by ${APP_STATE.currentUser.id}`;
}

window.handleLogFilterChange = handleLogFilterChange;
window.resetLogFilters = resetLogFilters;
window.renderRecordLogs = renderRecordLogs;

