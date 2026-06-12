// Telkom Retail Unified Digital Journey Platform - Core Application Logic

// ==========================================
// 1. MOCK DATABASE (CRM, CIM, TRANSACT, GIS, OMS, POS)
// ==========================================

const MOCK_DB = {
  // Amdocs Clarify CRM Customers
  crm: [
    {
      id: "1111111111111", // SA ID
      passport: "",
      accountNumber: "TEL-90812739",
      name: "Jan du Toit",
      status: "Active",
      segment: "Consumer",
      mobile: "0821234567",
      email: "jan.dutoit@gmail.com",
      address: "12 Main Rd, Rosebank, Johannesburg, 2196",
      billingAddress: "12 Main Rd, Rosebank, Johannesburg, 2196",
      preferredContact: "SMS",
      activeProducts: [
        { name: "Infinite Pay-Month SIM Only", type: "SIM-only", cost: 199, expiry: "2027-02-14" },
        { name: "Telkom LTE Home Router 100GB", type: "Mobile Data", cost: 299, expiry: "2026-12-01" }
      ],
      interactions: [
        { date: "2026-06-01 10:20", agent: "AGT-101", type: "Account Query", notes: "Customer queried billing on LTE Router." },
        { date: "2026-05-10 14:15", agent: "AGT-102", type: "Stock Query", notes: "Checked availability of Samsung S24." }
      ]
    },
    {
      id: "2222222222222", // SA ID
      passport: "",
      accountNumber: "TEL-55610283",
      name: "Thabo Mokoena",
      status: "Active",
      segment: "Consumer",
      mobile: "0739876543",
      email: "thabo.mokoena@yahoo.com",
      address: "45 Garsfontein Rd, Pretoria East, Pretoria, 0081",
      billingAddress: "45 Garsfontein Rd, Pretoria East, Pretoria, 0081",
      preferredContact: "Email",
      activeProducts: [
        { name: "Prepaid SIM Starter Pack", type: "SIM-only", cost: 0, expiry: "N/A" }
      ],
      interactions: [
        { date: "2026-05-15 09:45", agent: "AGT-104", type: "New Order", notes: "Assisted with prepaid SIM registration." }
      ]
    },
    {
      id: "3333333333333", // SA ID
      passport: "",
      accountNumber: "TEL-44129857",
      name: "Chloe Mercer",
      status: "Suspended", // Suspended status - Eligibility block
      segment: "Consumer",
      mobile: "0817766554",
      email: "chloe.mercer@outlook.com",
      address: "78 Seventh Ave, Melville, Johannesburg, 2092",
      billingAddress: "78 Seventh Ave, Melville, Johannesburg, 2092",
      preferredContact: "Phone",
      activeProducts: [
        { name: "Telkom LTE Smart Router (Suspended)", type: "Mobile Data", cost: 399, expiry: "Suspended" }
      ],
      interactions: [
        { date: "2026-06-10 11:30", agent: "AGT-101", type: "Complaint", notes: "Customer complained about suspended status due to payment delay." }
      ]
    },
    {
      id: "4444444444444", // SA ID
      passport: "",
      accountNumber: "TEL-88123901",
      name: "Lerato Nxumalo",
      status: "Active",
      segment: "Consumer",
      mobile: "0832345678",
      email: "lerato.nxumalo@gmail.com",
      address: "78 Sandton Dr, Sandton, Johannesburg, 2146",
      billingAddress: "78 Sandton Dr, Sandton, Johannesburg, 2146",
      preferredContact: "SMS",
      activeProducts: [
        { name: "Flexi SIM 10GB Promo", type: "SIM-only", cost: 99, expiry: "2027-04-30" }
      ],
      interactions: [
        { date: "2026-06-11 16:30", agent: "AGT-101", type: "Account Query", notes: "Assisted customer with billing details setup." }
      ]
    }
  ],

  // Products Catalogue
  products: [
    { id: "p-sim-1", category: "SIM-only", name: "Infinite Pay-Month SIM Only", type: "Mobile", price: 199, onceOff: 99, term: 24, allocation: "Unlimited Data @ 10Mbps, 100 Mins", promo: false },
    { id: "p-sim-2", category: "SIM-only", name: "Flexi SIM 10GB Promo", type: "Mobile", price: 99, onceOff: 99, term: 12, allocation: "10GB Data, 50 Mins, 100 SMSs", promo: true },
    { id: "p-dev-1", category: "Handset contracts", name: "Samsung Galaxy S24 Contract", type: "Mobile", price: 699, onceOff: 199, term: 24, allocation: "Samsung S24, 10GB Data, 100 Mins", deviceSKU: "SKU-S24-128", promo: false },
    { id: "p-dev-2", category: "Handset contracts", name: "iPhone 15 Pro Max Contract", type: "Mobile", price: 999, onceOff: 499, term: 24, allocation: "iPhone 15 Pro Max 256GB, 20GB Data, 200 Mins", deviceSKU: "SKU-IP15-256", promo: true },
    { id: "p-broad-1", category: "Exlight broadband plans", name: "Exlight Broadband 50Mbps", type: "Fixed Line", price: 499, onceOff: 0, term: 24, allocation: "50/25 Mbps Unlimited Fiber, Free Router & Install", promo: false },
    { id: "p-broad-2", category: "Exlight broadband plans", name: "Exlight Ultra 100Mbps", type: "Fixed Line", price: 699, onceOff: 0, term: 24, allocation: "100/50 Mbps Unlimited Fiber, Free Router & Install", promo: false }
  ],

  // GIS Coverage Check Coordinates
  gis: {
    "12 Main Rd, Rosebank, Johannesburg, 2196": { status: "Coverage available", ref: "GIS-RB-9028", coords: "-26.145, 28.043" },
    "45 Garsfontein Rd, Pretoria East, Pretoria, 0081": { status: "Coverage unavailable", ref: "", coords: "-25.792, 28.304" },
    "78 Seventh Ave, Melville, Johannesburg, 2092": { status: "Coverage inconclusive", ref: "GIS-ML-4412", coords: "-26.176, 28.010" },
    "78 Sandton Dr, Sandton, Johannesburg, 2146": { status: "Coverage available", ref: "GIS-SD-8812", coords: "-26.104, 28.058" }
  },

  // Transact Stock (by branch code)
  stock: {
    "PTA-001": {
      "SKU-S24-128": { onHand: 5, reserved: 1, available: 4 },
      "SKU-IP15-256": { onHand: 0, reserved: 0, available: 0 } // Out of Stock
    },
    "JHB-002": {
      "SKU-S24-128": { onHand: 0, reserved: 0, available: 0 },
      "SKU-IP15-256": { onHand: 4, reserved: 2, available: 2 }
    }
  }
};

const AUTH_STORAGE_KEY = "telkom_auth_session";

const DEMO_LOGIN_CREDENTIALS = {
  "AGT-101": { password: "password", name: "Piet van Zyl", role: "agent", branch: "PTA-001" },
  "MGR-002": { password: "password", name: "Store Manager", role: "manager", branch: "PTA-001" },
  "AM-909": { password: "password", name: "Area Director", role: "area_manager", branch: "PTA-001" },
  "ADMIN-001": { password: "password", name: "IT Operations", role: "admin", branch: "PTA-001" }
};

// ==========================================
// 2. STATE CONFIGURATION
// ==========================================

let APP_STATE = {
  // IAM User session
  currentUser: {
    id: "AGT-101",
    name: "Piet van Zyl",
    role: "agent", // agent, manager, area_manager, admin
    branch: "PTA-001",
    assignedStores: ["PTA-001", "JHB-002", "DBN-003"]
  },

  isAuthenticated: false,

  // Navigation
  activeRoute: "login",

  // Active Customer Journey State
  selectedCustomer: null,
  activeCIMInteraction: null,
  cart: {
    product: null,
    contractDetails: {
      simType: "eSIM",
      numberOption: "New Number",
      portInNumber: "",
      installationAddress: "",
      installationContactName: "",
      installationContactPhone: "",
      preferredInstallationDate: ""
    },
    consent: false,
    gisRef: "",
    gisStatus: "Not checked",
    stockChecked: false,
    stockStatus: "",
    paymentStatus: "Pending",
    posTxnRef: "",
    receiptNo: "",
    orderRef: ""
  },

  // Lists stored in localStorage for UAT durability
  stockRequests: [],
  ordersList: [],
  notifications: [],

  // Stepper Controller status
  currentStep: 1,

  // Outage / System Status overrides
  systemHealth: {
    crm: true,
    cim: true,
    oms: true,
    pos: true,
    transact: true,
    gis: true
  }
};

// ==========================================
// 3. STORAGE & PRE-SEEDING
// ==========================================

function generateMockData() {
  const customers = [
    { name: "Jan du Toit", accountNo: "TEL-90812739" },
    { name: "Thabo Mokoena", accountNo: "TEL-55610283" },
    { name: "Chloe Mercer", accountNo: "TEL-44129857" },
    { name: "Lerato Nxumalo", accountNo: "TEL-88123901" },
    { name: "Johan Smith", accountNo: "TEL-12903847" },
    { name: "Sipho Khumalo", accountNo: "TEL-38291029" },
    { name: "Fatima Naidoo", accountNo: "TEL-47291038" },
    { name: "Zama Cele", accountNo: "TEL-28193048" }
  ];

  const products = MOCK_DB.products;
  const stores = ["PTA-001", "JHB-002", "DBN-003"];
  const agents = {
    "PTA-001": [
      { id: "AGT-101", name: "Piet van Zyl" },
      { id: "AGT-102", name: "Sara Lee" }
    ],
    "JHB-002": [
      { id: "AGT-103", name: "Lerato Dlamini" },
      { id: "AGT-104", name: "Johan Botha" }
    ],
    "DBN-003": [
      { id: "AGT-105", name: "Sipho Zuma" },
      { id: "AGT-106", name: "Fatima Patel" }
    ]
  };

  const statuses = ["Fulfilled", "Fulfilled", "Fulfilled", "In Progress", "Cancelled", "Failed"];
  const paymentStatuses = ["Payment Complete", "Payment Complete", "Payment Complete", "Payment Complete", "Failed", "Failed"];
  const coverageOutcomesList = ["Coverage available", "Coverage available", "Coverage available", "Coverage unavailable", "Coverage inconclusive"];

  const orders = [];
  const stockRequests = [];

  // Generate 65 orders from June 1st to June 12th, 2026
  for (let i = 1; i <= 65; i++) {
    const day = Math.floor((i - 1) / 5.5) + 1; // June 1 to June 12
    const hour = 8 + (i % 10);
    const minute = 10 + (i * 7) % 50;
    const dateStr = `2026-06-${day < 10 ? '0' + day : day} ${hour < 10 ? '0' + hour : hour}:${minute < 10 ? '0' + minute : minute}`;

    const cust = customers[i % customers.length];
    const prod = products[i % products.length];
    const store = stores[i % stores.length];
    const storeAgents = agents[store];
    const agent = storeAgents[i % storeAgents.length];

    const status = statuses[i % statuses.length];
    
    let payment = "Payment Complete";
    if (status === "Failed") {
      payment = "Failed";
    } else if (status === "Cancelled") {
      payment = "Refunded";
    } else {
      payment = paymentStatuses[i % paymentStatuses.length];
    }

    let coverage = "N/A";
    if (prod.category === "Exlight broadband plans") {
      coverage = coverageOutcomesList[i % coverageOutcomesList.length];
    }

    const handlingTime = 12 + (i * 13) % 35; // 12 to 47 minutes
    const revenue = prod.price * (prod.term || 1) + prod.onceOff;

    orders.push({
      orderRef: `ORD-90${280 + i}`,
      customerName: cust.name,
      accountNo: cust.accountNo,
      product: prod.name,
      productCategory: prod.category,
      type: prod.type,
      store: store,
      agent: agent.id,
      agentName: agent.name,
      status: status,
      payment: payment,
      coverageOutcome: coverage,
      handlingTime: handlingTime,
      revenue: revenue,
      date: dateStr
    });
  }

  // Generate 15 stock requests
  for (let i = 1; i <= 15; i++) {
    const day = Math.floor((i - 1) / 1.5) + 1; // June 1 to June 10
    const dateStr = `2026-06-${day < 10 ? '0' + day : day} 10:15`;
    const store = stores[i % stores.length];
    const prod = products[(i + 2) % products.length];
    const qty = 2 + (i % 5) * 2; // 2 to 10
    const priorities = ["Normal", "Urgent", "Urgent"];
    const reqStatuses = ["Approved", "Approved", "Declined", "Submitted", "Draft"];
    const status = reqStatuses[i % reqStatuses.length];
    const priority = priorities[i % priorities.length];

    const ageDays = status === "Submitted" || status === "Draft" ? (12 - day) : 0;

    const req = {
      id: `REQ-100${i}`,
      storeId: store,
      requestedBy: `mgr_${store.split('-')[0].toLowerCase()}`,
      product: prod.name,
      sku: prod.deviceSKU || `SKU-${prod.id}`,
      qty: qty,
      reason: i % 2 === 0 ? "Customer Order" : "Replenishment",
      relatedOrder: i % 2 === 0 ? `ORD-90${280 + i}` : "",
      priority: priority,
      status: status,
      notes: "System pre-seeded analytics data.",
      date: dateStr,
      ageDays: ageDays
    };

    if (status === "Approved") {
      req.approvedQty = qty;
      req.decisionDate = `2026-06-${day + 1 < 10 ? '0' + (day + 1) : (day + 1)} 09:00`;
      req.decidedBy = "AM-909";
    } else if (status === "Declined") {
      req.decisionDate = `2026-06-${day + 1 < 10 ? '0' + (day + 1) : (day + 1)} 14:00`;
      req.decidedBy = "AM-909";
      req.declineReason = "Insufficient central warehouse stock.";
    }

    stockRequests.push(req);
  }

  return { orders, stockRequests };
}

function loadStateFromStorage() {
  const savedOrders = localStorage.getItem("telkom_orders");
  const savedRequests = localStorage.getItem("telkom_stock_requests");
  
  if (savedOrders && JSON.parse(savedOrders).length > 10) {
    APP_STATE.ordersList = JSON.parse(savedOrders);
  } else {
    const mock = generateMockData();
    APP_STATE.ordersList = mock.orders;
    saveOrders();
  }

  if (savedRequests && JSON.parse(savedRequests).length > 5) {
    APP_STATE.stockRequests = JSON.parse(savedRequests);
  } else {
    const mock = generateMockData();
    APP_STATE.stockRequests = mock.stockRequests;
    saveStockRequests();
  }

  const savedNotifications = localStorage.getItem("telkom_notifications");
  if (savedNotifications) {
    APP_STATE.notifications = JSON.parse(savedNotifications);
  } else {
    // Seed notifications
    APP_STATE.notifications = [
      { id: "NT-1", title: "New Stock Request Submitted", message: "Store JHB-002 has submitted a stock request REQ-1001.", type: "stock_request", priority: "Urgent", date: "2026-06-12 10:00", read: false, link: "stock-requests" },
      { id: "NT-2", title: "Stock Request Approved", message: "Your stock request REQ-1003 has been approved by Area Manager.", type: "stock_approval", priority: "Normal", date: "2026-06-12 09:05", read: false, link: "stock-requests" }
    ];
    saveNotifications();
  }

  restoreAuthSession();
}

function saveStockRequests() {
  localStorage.setItem("telkom_stock_requests", JSON.stringify(APP_STATE.stockRequests));
}

function saveOrders() {
  localStorage.setItem("telkom_orders", JSON.stringify(APP_STATE.ordersList));
}

function saveNotifications() {
  localStorage.setItem("telkom_notifications", JSON.stringify(APP_STATE.notifications));
}

function saveAuthSession() {
  localStorage.setItem(
    AUTH_STORAGE_KEY,
    JSON.stringify({
      currentUser: APP_STATE.currentUser,
      activeRoute: APP_STATE.activeRoute,
      isAuthenticated: APP_STATE.isAuthenticated
    })
  );
}

function clearAuthSession() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

function restoreAuthSession() {
  const savedSession = localStorage.getItem(AUTH_STORAGE_KEY);

  if (!savedSession) {
    return false;
  }

  try {
    const parsedSession = JSON.parse(savedSession);

    if (!parsedSession?.currentUser) {
      return false;
    }

    APP_STATE.currentUser = {
      ...APP_STATE.currentUser,
      ...parsedSession.currentUser
    };
    APP_STATE.isAuthenticated = true;
    APP_STATE.activeRoute = parsedSession.activeRoute || 'agent-dashboard';
    return true;
  } catch (error) {
    clearAuthSession();
    return false;
  }
}

// ==========================================
// 4. ROUTING & VIEWS CONTROLLER
// ==========================================

function switchRoute(route) {
  if (!APP_STATE.isAuthenticated && route !== 'login') {
    route = 'login';
  }

  // Role Access Control Checks
  if (route !== 'login') {
    if (APP_STATE.currentUser.role === 'agent' && (route === 'area-dashboard' || route === 'reports' || route === 'record-logs' || route === 'admin-dashboard')) {
      showToast("Access Denied: Store Agent does not have permissions for Area Manager, Reports, or Logs sections.", "danger");
      return;
    }
    if (APP_STATE.currentUser.role === 'manager' && (route === 'area-dashboard' || route === 'admin-dashboard')) {
      showToast("Access Denied: Store Managers do not have permissions to access Area Dashboard or IT/Admin.", "danger");
      return;
    }
    if (APP_STATE.currentUser.role === 'area_manager' && (route === 'admin-dashboard' || route === 'order-stepper' || route === 'customer-search')) {
      showToast("Access Denied: Area Managers manage store oversight and cannot process orders directly.", "danger");
      return;
    }
  }

  APP_STATE.activeRoute = route;
  
  // Show/Hide Sidebar and Header layout based on route
  const sidebar = document.getElementById('app-sidebar');
  const header = document.getElementById('app-header');
  const mainLayout = document.getElementById('main-content-layout');

  if (route === 'login') {
    if (sidebar) sidebar.style.display = 'none';
    if (header) header.style.display = 'none';
    if (mainLayout) mainLayout.style.setProperty('margin-left', '0', 'important');
  } else {
    if (sidebar) sidebar.style.display = 'flex';
    if (header) header.style.display = 'flex';
    if (mainLayout) mainLayout.style.setProperty('margin-left', ''); // restores CSS default
  }
  
  // Highlight sidebar
  document.querySelectorAll('.sidebar-link').forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('data-route') === route) {
      link.classList.add('active');
    }
  });

  // Hide all screens
  document.querySelectorAll('.view-container').forEach(view => {
    view.style.display = 'none';
  });

  // Show selected screen
  const targetView = document.getElementById(`view-${route}`);
  if (targetView) {
    targetView.style.display = 'block';
    // Trigger screen-specific rendering
    renderScreen(route);
  }

  if (route === 'login') {
    clearAuthSession();
    APP_STATE.isAuthenticated = false;
  } else if (APP_STATE.isAuthenticated) {
    saveAuthSession();
  }
}

// ==========================================
// 5. SCREEN RENDERERS
// ==========================================

function renderScreen(route) {
  // Render headers / sessions
  updateSessionBanner();

  switch (route) {
    case "agent-dashboard":
      renderAgentDashboard();
      break;
    case "manager-dashboard":
      renderManagerDashboard();
      break;
    case "area-dashboard":
      renderAreaDashboard();
      break;
    case "admin-dashboard":
      renderAdminDashboard();
      break;
    case "customer-search":
      // Reset customer search inputs
      document.getElementById('search-error').style.display = 'none';
      break;
    case "customer-360":
      renderCustomer360();
      break;
    case "catalogue":
      renderCatalogue();
      break;
    case "order-stepper":
      renderStepper();
      break;
    case "order-tracking":
      renderOrderTracking();
      break;
    case "stock-requests":
      renderStockRequests();
      break;
    case "reports":
      renderReports();
      break;
    case "record-logs":
      renderRecordLogs();
      break;
    case "notifications":
      renderNotificationsView();
      break;
  }
}

// Update Header Customer Session info
function updateSessionBanner() {
  const banner = document.getElementById('session-banner');
  if (APP_STATE.selectedCustomer) {
    banner.style.display = 'flex';
    document.getElementById('session-customer-name').innerText = APP_STATE.selectedCustomer.name;
    document.getElementById('session-account-no').innerText = APP_STATE.selectedCustomer.accountNumber;
    
    // CIM interaction status
    const cimStatus = document.getElementById('session-cim-status');
    if (APP_STATE.activeCIMInteraction) {
      cimStatus.innerText = `Active CIM Session: ${APP_STATE.activeCIMInteraction.type}`;
      cimStatus.className = "session-tag";
    } else {
      cimStatus.innerText = "No active CIM interaction";
      cimStatus.className = "session-tag warning";
    }
  } else {
    banner.style.display = 'none';
  }
}

// Render Store Agent Dashboard
function renderAgentDashboard() {
  // Recent orders list
  const recentOrders = APP_STATE.ordersList
    .filter(o => o.agent === APP_STATE.currentUser.id && o.store === APP_STATE.currentUser.branch)
    .slice(0, 5);

  const tbody = document.getElementById('agent-recent-orders-tbody');
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

  // Set counts
  document.getElementById('agent-today-count').innerText = recentOrders.length;
  document.getElementById('agent-pending-payments').innerText = APP_STATE.ordersList.filter(o => o.payment === 'Payment Pending').length;
  
  // Stock alert box
  const branchStock = MOCK_DB.stock[APP_STATE.currentUser.branch];
  const stockAlertContainer = document.getElementById('agent-stock-alerts');
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

// Render Store Manager Dashboard
function renderManagerDashboard() {
  const storeOrders = APP_STATE.ordersList.filter(o => o.store === APP_STATE.currentUser.branch);
  document.getElementById('mgr-orders-today').innerText = storeOrders.length;
  document.getElementById('mgr-pending-reqs').innerText = APP_STATE.stockRequests.filter(r => r.storeId === APP_STATE.currentUser.branch && r.status === 'Submitted').length;
  
  const branchStock = MOCK_DB.stock[APP_STATE.currentUser.branch];
  let oosItems = [];
  for (const [sku, detail] of Object.entries(branchStock)) {
    if (detail.available === 0) {
      const p = MOCK_DB.products.find(prod => prod.deviceSKU === sku);
      oosItems.push(p ? p.name : sku);
    }
  }
  document.getElementById('mgr-oos-count').innerText = oosItems.length;

  // Active agents table
  const agentsBody = document.getElementById('mgr-agents-tbody');
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

// Render Area Manager Dashboard
function renderAreaDashboard() {
  // Aggregate KPIs
  document.getElementById('am-total-orders').innerText = APP_STATE.ordersList.length;
  document.getElementById('am-pending-approvals').innerText = APP_STATE.stockRequests.filter(r => r.status === 'Submitted').length;

  // Filter requests table to only display Submitted stock requests
  const pendingTbody = document.getElementById('am-pending-requests-tbody');
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

// Render IT Admin Health Monitor
function renderAdminDashboard() {
  const integrationLogs = [
    { time: "15:38:12", api: "Amdocs Clarify CRM - customerQuery", status: "Success", latency: "142ms" },
    { time: "15:37:45", api: "Amdocs CIM - interactionLog", status: "Success", latency: "210ms" },
    { time: "15:36:02", api: "POS Terminal - txnInitiate", status: "Success", latency: "85ms" },
    { time: "15:35:14", api: "Transact - stockCheck", status: "Success", latency: "90ms" }
  ];

  const logTbody = document.getElementById('admin-logs-tbody');
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

  // Toggle buttons color based on system health
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

// Render Customer 360 Screen
function renderCustomer360() {
  const cust = APP_STATE.selectedCustomer;
  if (!cust) return;

  // Check backend CRM status outage
  if (!APP_STATE.systemHealth.crm) {
    document.getElementById('crm-data-card').style.display = 'none';
    document.getElementById('crm-error-state').style.display = 'block';
    return;
  } else {
    document.getElementById('crm-data-card').style.display = 'block';
    document.getElementById('crm-error-state').style.display = 'none';
  }

  // Populate Customer details
  document.getElementById('c360-fullname').innerText = cust.name;
  document.getElementById('c360-idmask').innerText = cust.id ? maskID(cust.id) : maskPassport(cust.passport);
  document.getElementById('c360-account').innerText = cust.accountNumber;
  document.getElementById('c360-status').innerText = cust.status;
  document.getElementById('c360-status').className = `badge ${cust.status === 'Active' ? 'badge-success' : 'badge-danger'}`;
  document.getElementById('c360-segment').innerText = cust.segment;
  document.getElementById('c360-pref').innerText = cust.preferredContact;
  document.getElementById('c360-email').innerText = cust.email;
  document.getElementById('c360-mobile').innerText = cust.mobile;
  document.getElementById('c360-address').innerText = cust.address;

  // Active products list
  const prodContainer = document.getElementById('c360-active-products');
  prodContainer.innerHTML = '';
  cust.activeProducts.forEach(p => {
    prodContainer.innerHTML += `
      <div style="padding: 12px; border: 1px solid var(--border-color); border-radius: var(--radius-md); margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <div style="font-weight: 700; color: var(--telkom-blue-dark);">${p.name}</div>
          <div style="font-size: 11px; color: var(--text-secondary);">Expires: ${p.expiry}</div>
        </div>
        <div style="font-weight: 700; color: var(--telkom-blue);">R${p.cost} pm</div>
      </div>
    `;
  });

  // Eligibility warnings
  const warningsBox = document.getElementById('c360-eligibility');
  warningsBox.innerHTML = '';
  if (cust.status === 'Suspended') {
    warningsBox.innerHTML = `
      <div style="background-color: var(--danger-light); border-left: 4px solid var(--danger); padding: 14px; border-radius: var(--radius-md); color: var(--danger); font-size: 13px; font-weight: 600; margin-bottom: 20px;">
        WARNING: This customer account is suspended. Order captures are restricted until outstanding payments are cleared.
      </div>
    `;
    document.getElementById('c360-start-order-btn').disabled = true;
  } else {
    warningsBox.innerHTML = `
      <div style="background-color: var(--success-light); border-left: 4px solid var(--success); padding: 14px; border-radius: var(--radius-md); color: var(--success); font-size: 13px; font-weight: 600; margin-bottom: 20px;">
        ELIGIBLE: Account is in good standing. Consumer segment mobile & fixed order journeys authorized.
      </div>
    `;
    document.getElementById('c360-start-order-btn').disabled = false;
  }

  // Interaction logs
  const logsBody = document.getElementById('c360-interactions-list');
  logsBody.innerHTML = '';
  cust.interactions.forEach(i => {
    logsBody.innerHTML += `
      <div style="padding: 12px; border-bottom: 1px solid var(--border-color); font-size: 13px;">
        <div style="display: flex; justify-content: space-between; font-weight: 600; margin-bottom: 4px;">
          <span style="color: var(--telkom-blue-dark);">${i.type}</span>
          <span style="color: var(--text-muted); font-size: 11px;">${i.date}</span>
        </div>
        <div style="color: var(--text-secondary);">${i.notes}</div>
        <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">Agent: ${i.agent} | Retail Store</div>
      </div>
    `;
  });
}

// Render Catalogue
function renderCatalogue() {
  const listEl = document.getElementById('catalogue-products-list');
  listEl.innerHTML = '';

  // Get active filter values
  const typeFilter = Array.from(document.querySelectorAll('.filter-type-checkbox:checked')).map(cb => cb.value);
  const priceFilter = document.querySelector('.filter-price-radio:checked').value; // all, 0-200, 200-500, 500+

  let filtered = MOCK_DB.products;

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

  if (filtered.length === 0) {
    listEl.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 48px; background-color: var(--bg-card); border-radius: var(--radius-lg); border: 1px solid var(--border-color);">
        <p style="color: var(--text-secondary); font-size: 14px;">No products match your selected filters.</p>
      </div>
    `;
    return;
  }

  filtered.forEach(p => {
    // Check stock status if device SKU is attached
    let stockBadgeHtml = '';
    let isOos = false;
    
    if (p.deviceSKU) {
      const stock = MOCK_DB.stock[APP_STATE.currentUser.branch][p.deviceSKU];
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

    listEl.innerHTML += `
      <div class="product-card">
        ${p.promo ? `<div class="product-badge-promo">PROMO</div>` : ''}
        <div class="product-info-area">
          <div class="product-category">${p.category} ${stockBadgeHtml}</div>
          <div class="product-name">${p.name}</div>
          
          <div class="product-allocation">
            <div class="allocation-row">
              <span>Specs/Alloc:</span>
              <span class="allocation-val">${p.allocation}</span>
            </div>
            <div class="allocation-row">
              <span>Term:</span>
              <span class="allocation-val">${p.term} Months</span>
            </div>
          </div>
          
          <div class="product-pricing">
            <span class="price-currency">R</span>
            <span class="price-amount">${p.price}</span>
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

// Render Order Capture Wizard (Stepper steps)
function renderStepper() {
  // Update stepper buttons/headings
  const stepContainer = document.getElementById('stepper-form-content');
  stepContainer.innerHTML = '';
  
  // Render step navigation numbers in UI
  document.querySelectorAll('.stepper-step').forEach((el, index) => {
    el.className = 'stepper-step';
    if (index + 1 < APP_STATE.currentStep) {
      el.classList.add('completed');
    } else if (index + 1 === APP_STATE.currentStep) {
      el.classList.add('active');
    }
  });

  const product = APP_STATE.cart.product;

  switch (APP_STATE.currentStep) {
    case 1: // Customer Summary
      stepContainer.innerHTML = `
        <h3 style="margin-bottom: 16px;">Step 1: Customer Details confirmation</h3>
        <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 24px;">Verify pre-populated details from Clarify CRM before continuing.</p>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; background-color: var(--bg-light); padding: 20px; border-radius: var(--radius-lg); border: 1px solid var(--border-color);">
          <div>
            <div style="font-size: 12px; color: var(--text-muted); font-weight: 600;">FULL NAME</div>
            <div style="font-weight: 700; color: var(--telkom-blue-dark); font-size: 15px;">${APP_STATE.selectedCustomer.name}</div>
          </div>
          <div>
            <div style="font-size: 12px; color: var(--text-muted); font-weight: 600;">CRM ACCOUNT NUMBER</div>
            <div style="font-weight: 700; color: var(--telkom-blue-dark); font-size: 15px;">${APP_STATE.selectedCustomer.accountNumber}</div>
          </div>
          <div>
            <div style="font-size: 12px; color: var(--text-muted); font-weight: 600;">IDENTITY DOCUMENT / PASSPORT</div>
            <div style="font-weight: 700; color: var(--telkom-blue-dark); font-size: 15px;">${APP_STATE.selectedCustomer.id ? maskID(APP_STATE.selectedCustomer.id) : maskPassport(APP_STATE.selectedCustomer.passport)}</div>
          </div>
          <div>
            <div style="font-size: 12px; color: var(--text-muted); font-weight: 600;">SEGMENT ELIGIBILITY</div>
            <div><span class="badge badge-success">${APP_STATE.selectedCustomer.segment} Only</span></div>
          </div>
        </div>
      `;
      break;

    case 2: // CIM Interaction details
      stepContainer.innerHTML = `
        <h3 style="margin-bottom: 16px;">Step 2: Log Visit Interaction in Amdocs CIM</h3>
        <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 20px;">Capture customer's reason of visit for compliance reporting.</p>
        
        <div class="form-group">
          <label class="form-label">Interaction Reason Type <span class="required">*</span></label>
          <select id="stepper-cim-type" class="form-control" onchange="updateCIMState()">
            <option value="New Order" ${APP_STATE.activeCIMInteraction.type === 'New Order' ? 'selected' : ''}>New Product Purchase</option>
            <option value="Account Query" ${APP_STATE.activeCIMInteraction.type === 'Account Query' ? 'selected' : ''}>Account Upgrade / Renewal</option>
            <option value="Stock Query" ${APP_STATE.activeCIMInteraction.type === 'Stock Query' ? 'selected' : ''}>Stock Verification</option>
          </select>
        </div>
        
        <div class="form-group">
          <label class="form-label">Channel Location</label>
          <input type="text" class="form-control" value="Retail Store Session" disabled>
        </div>
        
        <div class="form-group">
          <label class="form-label">CIM Session Notes <span class="required">*</span></label>
          <textarea id="stepper-cim-notes" class="form-control" rows="3" placeholder="Enter session notes (minimum 10 characters)..." oninput="updateCIMState()">${APP_STATE.activeCIMInteraction.notes || ''}</textarea>
          <div class="input-helper">Characters entered: <span id="cim-char-count">0</span>/500 (Min 10)</div>
          <div id="cim-notes-error" class="input-error-msg" style="display:none;">Notes must contain at least 10 characters before proceeding.</div>
        </div>
      `;
      updateCIMNotesCount();
      break;

    case 3: // Selected Product View
      stepContainer.innerHTML = `
        <h3 style="margin-bottom: 16px;">Step 3: Confirm Selected Product</h3>
        <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 20px;">Review product specification and contract period details.</p>
        
        <div style="background-color: var(--bg-light); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 24px; display: flex; align-items: center; justify-content: space-between;">
          <div>
            <span class="badge badge-info" style="margin-bottom: 8px;">${product.category}</span>
            <h4 style="margin-bottom: 4px;">${product.name}</h4>
            <p style="font-size: 13px; color: var(--text-secondary);">${product.allocation}</p>
            <div style="font-size: 12px; color: var(--text-muted); margin-top: 8px;">Contract terms: ${product.term} Months | Connection Charge: R${product.onceOff} once-off</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 13px; color: var(--text-secondary);">Monthly Cost</div>
            <div style="font-family: var(--font-display); font-size: 36px; font-weight: 800; color: var(--telkom-blue-dark); line-height: 1;">R${product.price}</div>
          </div>
        </div>
      `;
      break;

    case 4: // Coverage Check (Fixed Line) or Stock Check (Handset)
      if (product.category === 'Exlight broadband plans') {
        renderStepperCoverageCheck(stepContainer);
      } else if (product.deviceSKU) {
        renderStepperStockCheck(stepContainer);
      } else {
        // Skip check for SIM-Only (nothing to check)
        stepContainer.innerHTML = `
          <h3 style="margin-bottom: 16px;">Step 4: Availability Verification</h3>
          <div style="background-color: var(--success-light); border-left: 4px solid var(--success); padding: 16px; border-radius: var(--radius-md); color: var(--success); font-size: 13px; font-weight: 600;">
            Verification Skip: SIM-Only contracts do not require device stock allocation or GIS check. Please proceed.
          </div>
        `;
      }
      break;

    case 5: // Contract details & forms
      renderStepperContractDetails(stepContainer, product);
      break;

    case 6: // Customer Consent form
      stepContainer.innerHTML = `
        <h3 style="margin-bottom: 16px;">Step 6: Capture Customer Consent & Sign-Off</h3>
        <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 24px;">Legally required declarations for SA NCA compliance.</p>
        
        <div style="background-color: var(--bg-card); border: 1px solid var(--border-color); padding: 20px; border-radius: var(--radius-lg); font-size: 13px; color: var(--text-secondary); max-height: 250px; overflow-y: scroll; margin-bottom: 24px;">
          <h5 style="color: var(--telkom-blue-dark); margin-bottom: 8px;">NCA CREDIT & DATA PROTECTION POLICY</h5>
          <p style="margin-bottom: 12px;">The customer agrees that Telkom SA SOC Ltd may check credit histories with authorized credit agencies for the purpose of contract evaluation. The customer certifies that all details provided are true and complete.</p>
          <p style="margin-bottom: 12px;">Telkom SA complies with the Protection of Personal Information Act (POPIA) 4 of 2013. The customer's information is secure and will only be utilized for managing this digital journey.</p>
          <p>By checking the boxes below, the customer gives explicit sign-off to activate this service.</p>
        </div>

        <label class="checkbox-group">
          <input type="checkbox" id="consent-check" ${APP_STATE.cart.consent ? 'checked' : ''} onchange="toggleConsent()">
          <span class="checkbox-label"><strong>Accept terms and conditions:</strong> Customer acknowledges and accepts terms of the ${product.term}-month contract plan.</span>
        </label>

        <label class="checkbox-group">
          <input type="checkbox" id="consent-marketing" checked>
          <span class="checkbox-label">Authorize marketing communications via SMS and Email (Optional).</span>
        </label>
      `;
      break;

    case 7: // Review & Validation Checklist
      renderStepperReviewChecklist(stepContainer);
      break;
  }
}

// Stepper Step 4: GIS Coverage Check
function renderStepperCoverageCheck(container) {
  // Verify GIS API status outage override
  if (!APP_STATE.systemHealth.gis) {
    container.innerHTML = `
      <h3 style="margin-bottom: 16px;">Step 4: GIS Fixed-Line Coverage Checker</h3>
      <div style="background-color: var(--danger-light); border-left: 4px solid var(--danger); padding: 16px; border-radius: var(--radius-md); color: var(--danger); font-size: 13px; font-weight: 600; margin-bottom: 20px;">
        GIS API Offline: Connection to Telkom Coverage Checker timed out.
      </div>
      <button class="btn btn-primary" onclick="simulateGisApiRetry()">Retry Connection</button>
    `;
    return;
  }

  const addr = APP_STATE.selectedCustomer.address;
  const coverageData = MOCK_DB.gis[addr];
  
  let resultBox = '';
  if (APP_STATE.cart.gisStatus === 'Coverage available') {
    resultBox = `
      <div style="background-color: var(--success-light); border-left: 4px solid var(--success); padding: 14px; border-radius: var(--radius-md); color: var(--success); font-size: 13px; font-weight: 600; margin-top: 16px;">
        COVERAGE APPROVED: Exlight Broadband is available. Ref: <strong>${coverageData.ref}</strong> (${coverageData.coords})
      </div>
    `;
  } else if (APP_STATE.cart.gisStatus === 'Coverage unavailable') {
    resultBox = `
      <div style="background-color: var(--danger-light); border-left: 4px solid var(--danger); padding: 14px; border-radius: var(--radius-md); color: var(--danger); font-size: 13px; font-weight: 600; margin-top: 16px;">
        COVERAGE DECLINED: Address does not have Exlight fiber services. Fixed line ordering is blocked.
      </div>
    `;
  } else if (APP_STATE.cart.gisStatus === 'Coverage inconclusive') {
    resultBox = `
      <div style="background-color: var(--warning-light); border-left: 4px solid var(--warning); padding: 14px; border-radius: var(--radius-md); color: var(--warning); font-size: 13px; margin-top: 16px;">
        <p style="font-weight: 700; color: var(--warning); margin-bottom: 8px;">GIS RESULT INCONCLUSIVE</p>
        <p style="font-size: 12px; margin-bottom: 12px; color: var(--text-secondary);">The address coordinates require manual confirmation or site validation.</p>
        <button class="btn btn-sm btn-outline" onclick="forceCoverageAcceptance()">Manual Override & Accept</button>
      </div>
    `;
  }

  container.innerHTML = `
    <h3 style="margin-bottom: 16px;">Step 4: GIS Fixed-Line Coverage Checker</h3>
    <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 20px;">Address check must return 'Coverage available' for Exlight products.</p>
    
    <div class="gis-container">
      <div>
        <div class="form-group">
          <label class="form-label">Service Address</label>
          <input type="text" class="form-control" value="${addr}" disabled>
        </div>
        <button class="btn btn-primary" onclick="simulateGisAddressCheck()">Execute Coverage Check</button>
        ${resultBox}
      </div>
      <div>
        <div class="gis-map-placeholder">
          <div class="gis-map-inner">
            <div class="gis-grid-lines"></div>
            <div class="gis-map-marker ${APP_STATE.cart.gisStatus === 'Coverage available' ? 'success' : (APP_STATE.cart.gisStatus === 'Coverage unavailable' ? 'danger' : '')}"></div>
            <div style="position: absolute; bottom: 12px; left: 12px; background: rgba(0,0,0,0.6); color: white; padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: 600; letter-spacing: 0.5px;">GIS GEOLOCATION ENGINE</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Stepper Step 4: Transact Stock check
function renderStepperStockCheck(container) {
  // Verify Transact API status outage
  if (!APP_STATE.systemHealth.transact) {
    container.innerHTML = `
      <h3 style="margin-bottom: 16px;">Step 4: Transact Device Stock Allocation</h3>
      <div style="background-color: var(--danger-light); border-left: 4px solid var(--danger); padding: 16px; border-radius: var(--radius-md); color: var(--danger); font-size: 13px; font-weight: 600; margin-bottom: 20px;">
        Transact Stock API Offline: Database communication failure.
      </div>
      <button class="btn btn-primary" onclick="simulateStockApiRetry()">Retry Connection</button>
    `;
    return;
  }

  const p = APP_STATE.cart.product;
  const stockInfo = MOCK_DB.stock[APP_STATE.currentUser.branch][p.deviceSKU] || { onHand: 0, reserved: 0, available: 0 };

  let statusAlert = '';
  if (APP_STATE.cart.stockChecked) {
    if (APP_STATE.cart.stockStatus === 'In Stock') {
      statusAlert = `
        <div style="background-color: var(--success-light); border-left: 4px solid var(--success); padding: 14px; border-radius: var(--radius-md); color: var(--success); font-size: 13px; font-weight: 600; margin-top: 16px;">
          STOCK ALLOCATED: Device is available and reserved for this order.
        </div>
      `;
    } else {
      statusAlert = `
        <div style="background-color: var(--danger-light); border-left: 4px solid var(--danger); padding: 14px; border-radius: var(--radius-md); color: var(--danger); font-size: 13px; font-weight: 600; margin-top: 16px;">
          OUT OF STOCK: Device not available in PTA-001 branch. Store Manager must initiate a stock request.
        </div>
        <div style="margin-top: 12px; display: flex; gap: 10px;">
          <button class="btn btn-sm btn-outline" onclick="notifyStoreManagerForStock()">Notify Store Manager</button>
          <button class="btn btn-sm btn-secondary" onclick="switchRoute('catalogue')">Change Product</button>
        </div>
      `;
    }
  }

  container.innerHTML = `
    <h3 style="margin-bottom: 16px;">Step 4: Transact Device Stock Allocation</h3>
    <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 20px;">Verify device stock levels in POS branch prior to contract binding.</p>
    
    <div style="display: grid; grid-template-columns: 1.5fr 1fr; gap: 32px;">
      <div>
        <table class="custom-table" style="margin-bottom: 20px;">
          <thead>
            <tr>
              <th>Store Code</th>
              <th>SKU Code</th>
              <th>On Hand</th>
              <th>Reserved</th>
              <th>Available</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>${APP_STATE.currentUser.branch} (This Branch)</strong></td>
              <td><code>${p.deviceSKU}</code></td>
              <td>${stockInfo.onHand} units</td>
              <td>${stockInfo.reserved}</td>
              <td><span class="badge ${stockInfo.available > 0 ? 'badge-success' : 'badge-danger'}">${stockInfo.available}</span></td>
            </tr>
          </tbody>
        </table>
        
        <button class="btn btn-primary" onclick="simulateStockCheckAction()">Check and Lock Stock</button>
        ${statusAlert}
      </div>
      
      <div style="background-color: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 20px;">
        <h5 style="color: var(--telkom-blue-dark); margin-bottom: 12px;">Alternative Branch Stock</h5>
        <div style="font-size: 13px;">
          <div style="display:flex; justify-content:space-between; padding: 8px 0; border-bottom:1px solid var(--border-color);">
            <span>JHB-002 (Rosebank)</span>
            <span class="badge badge-success">2 Available</span>
          </div>
          <div style="display:flex; justify-content:space-between; padding: 8px 0;">
            <span>DBN-003 (Gateway)</span>
            <span class="badge badge-danger">0 Available</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Stepper Step 5: Contract Details Forms
function renderStepperContractDetails(container, product) {
  if (product.category === 'Exlight broadband plans') {
    // Fixed Line Exlight Details Form
    container.innerHTML = `
      <h3 style="margin-bottom: 16px;">Step 5: Capture Installation & Delivery Contact Details</h3>
      <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 20px;">OMS requires physical contact metrics to assign field technicians.</p>
      
      <div class="form-group">
        <label class="form-label">Physical Installation Address</label>
        <input type="text" class="form-control" value="${APP_STATE.selectedCustomer.address}" disabled>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Installation Contact Name <span class="required">*</span></label>
          <input type="text" id="billing-contact-name" class="form-control" placeholder="Enter contact name..." value="${APP_STATE.cart.contractDetails.installationContactName || APP_STATE.selectedCustomer.name}" oninput="updateContractDetailsState()">
        </div>
        <div class="form-group">
          <label class="form-label">Installation Contact Number <span class="required">*</span></label>
          <input type="text" id="billing-contact-phone" class="form-control" placeholder="e.g. 0821234567" value="${APP_STATE.cart.contractDetails.installationContactPhone || APP_STATE.selectedCustomer.mobile}" oninput="updateContractDetailsState()">
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Preferred Installation Date</label>
        <input type="date" id="billing-install-date" class="form-control" value="${APP_STATE.cart.contractDetails.preferredInstallationDate || ''}" onchange="updateContractDetailsState()">
        <div class="input-helper">Dates must not be in the past.</div>
      </div>
    `;
  } else {
    // Mobile Product Details Form
    container.innerHTML = `
      <h3 style="margin-bottom: 16px;">Step 5: Capture Mobile Line & SIM Configuration</h3>
      <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 20px;">Configure SIM connection parameters for cell provisioning.</p>
      
      <div class="form-group">
        <label class="form-label">SIM Type Option <span class="required">*</span></label>
        <select id="mobile-sim-type" class="form-control" onchange="updateContractDetailsState()">
          <option value="eSIM" ${APP_STATE.cart.contractDetails.simType === 'eSIM' ? 'selected' : ''}>eSIM (Instant QR Provisioning)</option>
          <option value="Physical SIM" ${APP_STATE.cart.contractDetails.simType === 'Physical SIM' ? 'selected' : ''}>Standard Physical Nano SIM</option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">Mobile Number Routing <span class="required">*</span></label>
        <select id="mobile-number-opt" class="form-control" onchange="updateContractDetailsState()">
          <option value="New Number" ${APP_STATE.cart.contractDetails.numberOption === 'New Number' ? 'selected' : ''}>Provision New Telkom MSISDN</option>
          <option value="Port In" ${APP_STATE.cart.contractDetails.numberOption === 'Port In' ? 'selected' : ''}>Port existing number from CellC/Vodacom/MTN</option>
        </select>
      </div>

      <div class="form-group" id="port-in-wrapper" style="display: ${APP_STATE.cart.contractDetails.numberOption === 'Port In' ? 'block' : 'none'};">
        <label class="form-label">Number to Port <span class="required">*</span></label>
        <input type="text" id="mobile-port-number" class="form-control" placeholder="e.g. 082 123 4567" value="${APP_STATE.cart.contractDetails.portInNumber || ''}" oninput="updateContractDetailsState()">
        <div class="input-helper">Please ensure port forms are signed.</div>
      </div>
    `;
  }
}

// Stepper Step 7: Order Review Validation checklist
function renderStepperReviewChecklist(container) {
  // Run verification tests
  const customerValid = !!APP_STATE.selectedCustomer;
  const interactionValid = !!APP_STATE.activeCIMInteraction && APP_STATE.activeCIMInteraction.notes.trim().length >= 10;
  const productValid = !!APP_STATE.cart.product;
  
  let coverageValid = true;
  if (APP_STATE.cart.product && APP_STATE.cart.product.category === 'Exlight broadband plans') {
    coverageValid = APP_STATE.cart.gisStatus === 'Coverage available';
  }

  let stockValid = true;
  if (APP_STATE.cart.product && APP_STATE.cart.product.deviceSKU) {
    stockValid = APP_STATE.cart.stockChecked && APP_STATE.cart.stockStatus === 'In Stock';
  }

  const detailsValid = APP_STATE.cart.product && APP_STATE.cart.product.category === 'Exlight broadband plans' ?
    (!!APP_STATE.cart.contractDetails.installationContactName && !!APP_STATE.cart.contractDetails.installationContactPhone) : true;
  
  const consentValid = APP_STATE.cart.consent;
  const roleValid = APP_STATE.currentUser.role === 'agent' || APP_STATE.currentUser.role === 'manager';

  // Overall check
  const submissionAllowed = customerValid && interactionValid && productValid && coverageValid && stockValid && detailsValid && consentValid && roleValid;

  container.innerHTML = `
    <h3 style="margin-bottom: 16px;">Step 7: Final Validation Checklist</h3>
    <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 24px;">Pre-submission review. Ensure all required dependencies are validated.</p>
    
    <div style="margin-bottom: 24px;">
      <div class="checklist-item ${customerValid ? 'pass' : 'fail'}">
        <div class="checklist-info">
          <div class="checklist-status-icon ${customerValid ? 'pass' : 'fail'}">${customerValid ? '✓' : '✗'}</div>
          <div><strong>Customer Account Identification</strong> - Found from CRM database.</div>
        </div>
        <span class="badge ${customerValid ? 'badge-success' : 'badge-danger'}">${customerValid ? 'Pass' : 'Fail'}</span>
      </div>

      <div class="checklist-item ${interactionValid ? 'pass' : 'fail'}">
        <div class="checklist-info">
          <div class="checklist-status-icon ${interactionValid ? 'pass' : 'fail'}">${interactionValid ? '✓' : '✗'}</div>
          <div><strong>Amdocs CIM Interaction Log</strong> - Notes minimum requirement satisfied.</div>
        </div>
        <span class="badge ${interactionValid ? 'badge-success' : 'badge-danger'}">${interactionValid ? 'Pass' : 'Fail'}</span>
      </div>

      <div class="checklist-item ${productValid ? 'pass' : 'fail'}">
        <div class="checklist-info">
          <div class="checklist-status-icon ${productValid ? 'pass' : 'fail'}">${productValid ? '✓' : '✗'}</div>
          <div><strong>Product Catalogue Allocation</strong> - Valid item selected.</div>
        </div>
        <span class="badge ${productValid ? 'badge-success' : 'badge-danger'}">${productValid ? 'Pass' : 'Fail'}</span>
      </div>

      ${APP_STATE.cart.product && APP_STATE.cart.product.category === 'Exlight broadband plans' ? `
      <div class="checklist-item ${coverageValid ? 'pass' : 'fail'}">
        <div class="checklist-info">
          <div class="checklist-status-icon ${coverageValid ? 'pass' : 'fail'}">${coverageValid ? '✓' : '✗'}</div>
          <div><strong>GIS fixed line coverage check</strong> - Required for Exlight broadband.</div>
        </div>
        <span class="badge ${coverageValid ? 'badge-success' : 'badge-danger'}">${coverageValid ? 'Pass' : 'Fail'}</span>
      </div>
      ` : ''}

      ${APP_STATE.cart.product && APP_STATE.cart.product.deviceSKU ? `
      <div class="checklist-item ${stockValid ? 'pass' : 'fail'}">
        <div class="checklist-info">
          <div class="checklist-status-icon ${stockValid ? 'pass' : 'fail'}">${stockValid ? '✓' : '✗'}</div>
          <div><strong>Device stock availability check</strong> - SKU allocation from Transact.</div>
        </div>
        <span class="badge ${stockValid ? 'badge-success' : 'badge-danger'}">${stockValid ? 'Pass' : 'Fail'}</span>
      </div>
      ` : ''}

      <div class="checklist-item ${detailsValid ? 'pass' : 'fail'}">
        <div class="checklist-info">
          <div class="checklist-status-icon ${detailsValid ? 'pass' : 'fail'}">${detailsValid ? '✓' : '✗'}</div>
          <div><strong>Service Details capture</strong> - All mandatory form details filled.</div>
        </div>
        <span class="badge ${detailsValid ? 'badge-success' : 'badge-danger'}">${detailsValid ? 'Pass' : 'Fail'}</span>
      </div>

      <div class="checklist-item ${consentValid ? 'pass' : 'fail'}">
        <div class="checklist-info">
          <div class="checklist-status-icon ${consentValid ? 'pass' : 'fail'}">${consentValid ? '✓' : '✗'}</div>
          <div><strong>NCA customer consent</strong> - Legally binding checked options.</div>
        </div>
        <span class="badge ${consentValid ? 'badge-success' : 'badge-danger'}">${consentValid ? 'Pass' : 'Fail'}</span>
      </div>
    </div>

    ${submissionAllowed ? `
      <div style="background-color: var(--success-light); border-left: 4px solid var(--success); padding: 14px; border-radius: var(--radius-md); color: var(--success); font-size: 13px; font-weight: 600; margin-bottom: 20px;">
        All checks passed! Ready to submit order and initiate payment.
      </div>
    ` : `
      <div style="background-color: var(--danger-light); border-left: 4px solid var(--danger); padding: 14px; border-radius: var(--radius-md); color: var(--danger); font-size: 13px; font-weight: 600; margin-bottom: 20px;">
        ERROR: Order checklist contains issues. Correct failed steps in the stepper before submitting.
      </div>
    `}
  `;

  // Disable/enable checkout progression button based on check validation
  document.getElementById('stepper-next-btn').disabled = !submissionAllowed;
}

// Render Order Tracking View
function renderOrderTracking() {
  const tbody = document.getElementById('tracking-tbody');
  tbody.innerHTML = '';
  
  let filtered = APP_STATE.ordersList;

  // Search input filters
  const searchVal = document.getElementById('tracking-search-ref').value.trim();
  if (searchVal) {
    filtered = filtered.filter(o => o.orderRef.toLowerCase().includes(searchVal.toLowerCase()) || o.customerName.toLowerCase().includes(searchVal.toLowerCase()));
  }

  // Role visibility restriction / Checkbox override
  const viewAllNetwork = document.getElementById('tracking-view-all') && document.getElementById('tracking-view-all').checked;
  if (!viewAllNetwork) {
    if (APP_STATE.currentUser.role === 'agent') {
      filtered = filtered.filter(o => o.agent === APP_STATE.currentUser.id);
    } else if (APP_STATE.currentUser.role === 'manager') {
      filtered = filtered.filter(o => o.store === APP_STATE.currentUser.branch);
    }
  }

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 20px;">No tracking orders found.</td></tr>`;
    return;
  }

  filtered.forEach(o => {
    tbody.innerHTML += `
      <tr>
        <td><strong>${o.orderRef}</strong></td>
        <td>${o.customerName}</td>
        <td>${o.product}</td>
        <td><code>${o.store}</code></td>
        <td>${o.date}</td>
        <td><span class="badge ${o.status === 'Fulfilled' ? 'badge-success' : (o.status === 'Cancelled' ? 'badge-danger' : 'badge-warning')}">${o.status}</span></td>
        <td>
          <button class="btn btn-sm btn-secondary" onclick="viewOrderDetails('${o.orderRef}')" style="margin-right: 5px;">Details</button>
          <button class="btn btn-sm btn-primary" onclick="downloadOrderReceipt('${o.orderRef}')" style="background-color: var(--telkom-blue); border-color: var(--telkom-blue);">Receipt</button>
        </td>
      </tr>
    `;
  });
}

// Render Stock Requests View
function renderStockRequests() {
  const requestsBody = document.getElementById('stock-requests-tbody');
  requestsBody.innerHTML = '';

  let filtered = APP_STATE.stockRequests;

  // Hide Area level requests from store agents/managers unless explicitly granted
  if (APP_STATE.currentUser.role === 'agent' || APP_STATE.currentUser.role === 'manager') {
    filtered = filtered.filter(r => r.storeId === APP_STATE.currentUser.branch);
  }

  if (filtered.length === 0) {
    requestsBody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 20px;">No stock requests found.</td></tr>`;
    return;
  }

  filtered.forEach(r => {
    let actionsHtml = `<button class="btn btn-sm btn-secondary" onclick="viewStockRequestDetails('${r.id}')" style="margin-right: 5px;">Details</button>`;
    if (r.status === 'Submitted' && APP_STATE.currentUser.role === 'area_manager') {
      actionsHtml += `<button class="btn btn-sm btn-success" onclick="openApprovalModal('${r.id}')">Review</button>`;
    } else if (r.status === 'Draft' && (APP_STATE.currentUser.role === 'manager' || APP_STATE.currentUser.role === 'agent')) {
      actionsHtml += `<button class="btn btn-sm btn-primary" onclick="submitStockRequest('${r.id}')">Submit</button>`;
    }

    requestsBody.innerHTML += `
      <tr>
        <td><strong>${r.id}</strong></td>
        <td><code>${r.storeId}</code></td>
        <td>${r.product}</td>
        <td><span class="badge badge-neutral">${r.qty} units</span></td>
        <td><span class="badge ${r.priority === 'Urgent' ? 'badge-danger' : 'badge-warning'}">${r.priority}</span></td>
        <td>${r.date}</td>
        <td><span class="badge ${r.status === 'Approved' ? 'badge-success' : (r.status === 'Declined' ? 'badge-danger' : 'badge-warning')}">${r.status}</span></td>
        <td>${actionsHtml}</td>
      </tr>
    `;
  });
}

// ==========================================
// 8. STORE & SALES REPORTING & ANALYTICS VIEW
// ==========================================

function handleReportFilterChange() {
  renderReports();
}

function getFilteredReportData() {
  const category = document.getElementById('report-filter-category').value;
  const store = document.getElementById('report-filter-store').value;
  const startDateStr = document.getElementById('report-filter-start-date').value;
  const endDateStr = document.getElementById('report-filter-end-date').value;

  return getFilteredReportDataByDates(category, store, startDateStr, endDateStr);
}

function getFilteredReportDataByDates(category, store, startDateStr, endDateStr) {
  const start = new Date(startDateStr + "T00:00:00");
  const end = new Date(endDateStr + "T23:59:59");

  // Determine what dataset to use
  let dataset = [];
  if (category === 'stock_status') {
    dataset = APP_STATE.stockRequests;
  } else {
    dataset = APP_STATE.ordersList;
  }

  // Filter by store
  let filtered = dataset;
  if (store !== 'ALL') {
    if (category === 'stock_status') {
      filtered = filtered.filter(item => item.storeId === store);
    } else {
      filtered = filtered.filter(item => item.store === store);
    }
  }

  // Filter by date range
  filtered = filtered.filter(item => {
    if (!item.date) return false;
    const itemDate = new Date(item.date.replace(' ', 'T'));
    return itemDate >= start && itemDate <= end;
  });

  return filtered;
}

// Draw line chart
function drawSVGLineChart(containerId, dataPoints, labels) {
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
function drawSVGDonutChart(containerId, segmentData) {
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
    <svg width="100%" height="100%" viewBox="0 0 ${width} ${height}">
      <circle cx="${cx}" cy="${cy}" r="${radius}" class="svg-donut-circle-bg" />
      ${segmentHtml}
      <text class="svg-donut-text-val" x="${cx}" y="${cy - 3}">${total}</text>
      <text class="svg-donut-text-lbl" x="${cx}" y="${cy + 18}">Total</text>
    </svg>
  `;

  container.innerHTML = svg;
}

// Render Leaderboard Chart
function renderLeaderboardChart(containerId, items) {
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
function generateActionableInsights(filtered, category, role) {
  const list = document.getElementById('report-insights-list');
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

      // Rule 1: Conversion rate check
      if (fulfilledPct < 75) {
        insights.push(`⚠️ <strong>Low Conversion Warning:</strong> Fulfillments are currently at ${fulfilledPct}%. Recommend auditing incomplete card payments and user consent delays.`);
      } else {
        insights.push(`📈 <strong>Strong Throughput:</strong> Order conversion is stable at ${fulfilledPct}%, meeting corporate retail targets.`);
      }

      // Rule 2: Average Handling Time check
      const avgHandling = Math.round(orders.reduce((sum, o) => sum + (o.handlingTime || 0), 0) / total);
      if (avgHandling > 28) {
        insights.push(`⏱️ <strong>Efficiency Bottleneck:</strong> Avg handling time is ${avgHandling} minutes (target 25m). Suggest supervisor oversight during the POS/Transact confirmation step.`);
      } else {
        insights.push(`⚡ <strong>Operational Speed:</strong> Average order processing duration is optimized at ${avgHandling} minutes.`);
      }

      // Rule 3: Product sales volume alert
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
      
      // Store checkout issue check
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

  // Add the insights list elements
  insights.forEach(ins => {
    list.innerHTML += `<li>${ins}</li>`;
  });
}

// Render Reports View
function renderReports() {
  const role = APP_STATE.currentUser.role;
  const storeSelect = document.getElementById('report-filter-store');
  const storeSelectGroup = document.getElementById('report-store-filter-group');

  // Lock branch if Store Manager
  if (role === 'manager') {
    storeSelect.value = APP_STATE.currentUser.branch;
    storeSelect.disabled = true;
    storeSelectGroup.style.opacity = '0.7';
  } else {
    storeSelect.disabled = false;
    storeSelectGroup.style.opacity = '1';
  }

  // Get current filters
  const category = document.getElementById('report-filter-category').value;
  const storeFilterVal = storeSelect.value;
  const startStr = document.getElementById('report-filter-start-date').value;
  const endStr = document.getElementById('report-filter-end-date').value;

  // Filtered dataset
  const filtered = getFilteredReportData();

  // Clear visual sections
  const kpiGrid = document.getElementById('report-kpi-grid');
  kpiGrid.innerHTML = '';

  const tableThead = document.getElementById('report-table-thead');
  const tableTbody = document.getElementById('report-table-tbody');
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
    const dayStr = `${year}-${month}-${day}`;
    
    dateLabels.push(`${month}/${day}`);

    const dayItems = filtered.filter(item => item.date && item.date.startsWith(dayStr));
    
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

  // Draw Line Chart
  const trendTitleMap = {
    order_activity: "Daily Order Ingestion Volume",
    agent_performance: "Daily Operations Processing Volume",
    product_sales: "Daily Unit Dispatched Volume",
    store_performance: "Daily Store Revenue Outflow (ZAR)",
    stock_status: "Daily Stock Requests Opened",
    payment_status: "Daily Card Transaction Failures",
    fixed_line: "Daily Broadband Eligibility Inquiries"
  };
  document.getElementById('trend-chart-title').innerText = trendTitleMap[category] || "Daily Volume Trend";
  drawSVGLineChart('report-trend-chart-container', dailyValues, dateLabels);

  // Donut and Leaderboard Data holders
  let donutData = [];
  let leaderboardData = [];

  // Populate dynamic cards, donut segments, leaderboards, and logs
  if (category === 'stock_status') {
    const total = filtered.length;
    const approved = filtered.filter(r => r.status === 'Approved').length;
    const rate = total > 0 ? Math.round((approved / total) * 100) : 0;
    const urgent = filtered.filter(r => r.priority === 'Urgent').length;
    
    const activeReqs = filtered.filter(r => r.status === 'Submitted' || r.status === 'Draft');
    const avgAge = activeReqs.length > 0 ? Math.round(activeReqs.reduce((sum, r) => sum + (r.ageDays || 0), 0) / activeReqs.length) : 0;

    // KPI Cards
    kpiGrid.innerHTML = `
      <div class="metric-card">
        <div class="metric-title">Total Requests</div>
        <div class="metric-value">${total}</div>
        <div class="metric-trend text-secondary">Pre-seeded log scope</div>
      </div>
      <div class="metric-card">
        <div class="metric-title">Approval Rate</div>
        <div class="metric-value">${rate}%</div>
        <div class="metric-trend text-success">Approved stock units</div>
      </div>
      <div class="metric-card">
        <div class="metric-title">Avg. Ageing</div>
        <div class="metric-value">${avgAge}d</div>
        <div class="metric-trend ${avgAge > 2 ? 'text-danger' : 'text-success'}">Pending requests age</div>
      </div>
      <div class="metric-card">
        <div class="metric-title">Urgent Requests</div>
        <div class="metric-value" style="color:var(--telkom-danger)">${urgent}</div>
        <div class="metric-trend text-danger">Priority allocation items</div>
      </div>
    `;

    // Donut Segments
    donutData = [
      { label: "Approved", value: filtered.filter(r => r.status === 'Approved').length, color: "#a2d829" },
      { label: "Declined", value: filtered.filter(r => r.status === 'Declined').length, color: "#ff4d4f" },
      { label: "Submitted", value: filtered.filter(r => r.status === 'Submitted').length, color: "#0099ff" },
      { label: "Draft", value: filtered.filter(r => r.status === 'Draft').length, color: "#999999" }
    ];

    // Leaderboards
    const prodCount = {};
    filtered.forEach(r => {
      prodCount[r.product] = (prodCount[r.product] || 0) + r.qty;
    });
    for (const [prod, qty] of Object.entries(prodCount)) {
      leaderboardData.push({ label: prod, value: qty, displayValue: `${qty} units` });
    }
    document.getElementById('leaderboard-chart-title').innerText = "Top Requested Products (Quantity)";

    // Table Headers & Rows
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
    // Orders-based categories
    const total = filtered.length;
    const completed = filtered.filter(o => o.status === 'Fulfilled').length;
    const successRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const totalRevenue = filtered.reduce((sum, o) => sum + (o.revenue || 0), 0);
    const avgHandlingTime = total > 0 ? Math.round(filtered.reduce((sum, o) => sum + (o.handlingTime || 0), 0) / total) : 0;

    if (category === 'order_activity') {
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
          <div class="metric-trend text-secondary">OMS queue clearance</div>
        </div>
      `;

      donutData = [
        { label: "Fulfilled", value: filtered.filter(o => o.status === 'Fulfilled').length, color: "#a2d829" },
        { label: "In Progress", value: filtered.filter(o => o.status === 'In Progress').length, color: "#0099ff" },
        { label: "Cancelled", value: filtered.filter(o => o.status === 'Cancelled').length, color: "#faad14" },
        { label: "Failed", value: filtered.filter(o => o.status === 'Failed').length, color: "#ff4d4f" }
      ];

      // Products leaderboard
      const prodCount = {};
      filtered.forEach(o => { prodCount[o.product] = (prodCount[o.product] || 0) + 1; });
      for (const [prod, qty] of Object.entries(prodCount)) {
        leaderboardData.push({ label: prod, value: qty, displayValue: `${qty} orders` });
      }
      document.getElementById('leaderboard-chart-title').innerText = "Most Popular Products Sold";
    }

    else if (category === 'agent_performance') {
      // Find top agent
      const agentCounts = {};
      filtered.forEach(o => { agentCounts[o.agentName || o.agent] = (agentCounts[o.agentName || o.agent] || 0) + 1; });
      let topAgent = "N/A";
      let maxAgentCount = 0;
      for (const [ag, ct] of Object.entries(agentCounts)) {
        if (ct > maxAgentCount) {
          maxAgentCount = ct;
          topAgent = ag;
        }
      }

      kpiGrid.innerHTML = `
        <div class="metric-card">
          <div class="metric-title">Active Agents</div>
          <div class="metric-value">6</div>
          <div class="metric-trend text-success">Branch logs active</div>
        </div>
        <div class="metric-card">
          <div class="metric-title">Total Revenue</div>
          <div class="metric-value">R ${totalRevenue.toLocaleString()}</div>
          <div class="metric-trend text-success">Total sales value</div>
        </div>
        <div class="metric-card">
          <div class="metric-title">Avg. Handling Time</div>
          <div class="metric-value">${avgHandlingTime}m</div>
          <div class="metric-trend text-secondary">Target: 25 minutes</div>
        </div>
        <div class="metric-card">
          <div class="metric-title">Top Performer</div>
          <div class="metric-value" style="font-size:16px; padding: 6px 0;">${topAgent}</div>
          <div class="metric-trend text-success">${maxAgentCount} sales cleared</div>
        </div>
      `;

      // Donut by agent
      const agentMap = {};
      filtered.forEach(o => { agentMap[o.agentName || o.agent] = (agentMap[o.agentName || o.agent] || 0) + 1; });
      const agColors = ["#0099ff", "#5bc0be", "#faad14", "#ff4d4f", "#c5a3ff", "#a2d829"];
      let cIdx = 0;
      for (const [ag, val] of Object.entries(agentMap)) {
        donutData.push({ label: ag, value: val, color: agColors[cIdx % agColors.length] });
        cIdx++;
      }

      // Leaderboard of agent revenues
      const agentRevs = {};
      filtered.forEach(o => { agentRevs[o.agentName || o.agent] = (agentRevs[o.agentName || o.agent] || 0) + (o.revenue || 0); });
      for (const [ag, rev] of Object.entries(agentRevs)) {
        leaderboardData.push({ label: ag, value: rev, displayValue: `R ${rev.toLocaleString()}` });
      }
      document.getElementById('leaderboard-chart-title').innerText = "Agent Sales Contribution Leaderboard";
    }

    else if (category === 'product_sales') {
      const prodCounts = {};
      filtered.forEach(o => { prodCounts[o.product] = (prodCounts[o.product] || 0) + 1; });
      
      let topProd = "N/A";
      let topVal = 0;
      let leastProd = "N/A";
      let leastVal = Infinity;
      
      for (const [prod, qty] of Object.entries(prodCounts)) {
        if (qty > topVal) {
          topVal = qty;
          topProd = prod;
        }
        if (qty < leastVal) {
          leastVal = qty;
          leastProd = prod;
        }
      }
      if (leastVal === Infinity) leastProd = "N/A";

      const mobileCount = filtered.filter(o => o.type === 'Mobile').length;
      const fixedCount = filtered.filter(o => o.type === 'Fixed Line').length;

      kpiGrid.innerHTML = `
        <div class="metric-card">
          <div class="metric-title">Products Cleared</div>
          <div class="metric-value">${total}</div>
          <div class="metric-trend text-secondary">Total units sold</div>
        </div>
        <div class="metric-card">
          <div class="metric-title">Top Product</div>
          <div class="metric-value" style="font-size:13px; font-weight:bold; padding: 8px 0;">${topProd}</div>
          <div class="metric-trend text-success">${topVal} contracts</div>
        </div>
        <div class="metric-card">
          <div class="metric-title">Least Sold</div>
          <div class="metric-value" style="font-size:13px; font-weight:bold; padding: 8px 0; color:var(--telkom-danger)">${leastProd}</div>
          <div class="metric-trend text-danger">${leastVal === Infinity ? 0 : leastVal} contracts</div>
        </div>
        <div class="metric-card">
          <div class="metric-title">Product Mix</div>
          <div class="metric-value" style="font-size:14px; padding: 6px 0;">M: ${mobileCount} | F: ${fixedCount}</div>
          <div class="metric-trend text-secondary">Mobile vs Fixed Line ratio</div>
        </div>
      `;

      // Donut by product category
      const catCounts = {};
      filtered.forEach(o => { catCounts[o.productCategory || 'SIM-only'] = (catCounts[o.productCategory || 'SIM-only'] || 0) + 1; });
      const catColors = ["#0099ff", "#faad14", "#5bc0be"];
      let catIdx = 0;
      for (const [cat, val] of Object.entries(catCounts)) {
        donutData.push({ label: cat, value: val, color: catColors[catIdx % catColors.length] });
        catIdx++;
      }

      // Leaderboard of product volume
      for (const [prod, qty] of Object.entries(prodCounts)) {
        leaderboardData.push({ label: prod, value: qty, displayValue: `${qty} units` });
      }
      document.getElementById('leaderboard-chart-title').innerText = "Product Sales Volume Rankings";
    }

    else if (category === 'store_performance') {
      const storeRevs = {};
      const storeCounts = {};
      filtered.forEach(o => { 
        storeRevs[o.store] = (storeRevs[o.store] || 0) + (o.revenue || 0); 
        storeCounts[o.store] = (storeCounts[o.store] || 0) + 1;
      });

      let topStore = "N/A";
      let topRev = 0;
      for (const [st, rev] of Object.entries(storeRevs)) {
        if (rev > topRev) {
          topRev = rev;
          topStore = st;
        }
      }

      kpiGrid.innerHTML = `
        <div class="metric-card">
          <div class="metric-title">Total Network Sales</div>
          <div class="metric-value">R ${totalRevenue.toLocaleString()}</div>
          <div class="metric-trend text-success">Aggregate revenue</div>
        </div>
        <div class="metric-card">
          <div class="metric-title">Top Store Branch</div>
          <div class="metric-value">${topStore}</div>
          <div class="metric-trend text-success">R ${topRev.toLocaleString()} revenue</div>
        </div>
        <div class="metric-card">
          <div class="metric-title">Avg. Store Revenue</div>
          <div class="metric-value">R ${Math.round(totalRevenue / 3).toLocaleString()}</div>
          <div class="metric-trend text-secondary">3 active locations</div>
        </div>
        <div class="metric-card">
          <div class="metric-title">Total Transactions</div>
          <div class="metric-value">${total}</div>
          <div class="metric-trend text-success">Fulfilled + In Progress</div>
        </div>
      `;

      // Donut by store revenue
      for (const [st, rev] of Object.entries(storeRevs)) {
        donutData.push({ 
          label: st, 
          value: rev, 
          color: st === 'PTA-001' ? '#0099ff' : (st === 'JHB-002' ? '#5bc0be' : '#faad14') 
        });
      }

      // Leaderboard of stores revenue
      for (const [st, rev] of Object.entries(storeRevs)) {
        leaderboardData.push({ label: `Branch ${st}`, value: rev, displayValue: `R ${rev.toLocaleString()}` });
      }
      document.getElementById('leaderboard-chart-title').innerText = "Store Revenue Contribution Comparison";
    }

    else if (category === 'payment_status') {
      const failed = filtered.filter(o => o.payment === 'Failed').length;
      const failRate = total > 0 ? Math.round((failed / total) * 100) : 0;
      const values = filtered.filter(o => o.payment === 'Payment Complete').reduce((sum, o) => sum + (o.revenue || 0), 0);

      kpiGrid.innerHTML = `
        <div class="metric-card">
          <div class="metric-title">Payments Attempted</div>
          <div class="metric-value">${total}</div>
          <div class="metric-trend text-secondary">POS Terminal swipes</div>
        </div>
        <div class="metric-card">
          <div class="metric-title">Failure Rate</div>
          <div class="metric-value" style="color:${failRate > 5 ? 'var(--telkom-danger)' : 'var(--text-dark)'}">${failRate}%</div>
          <div class="metric-trend ${failRate > 5 ? 'text-danger' : 'text-success'}">Limit target: 2%</div>
        </div>
        <div class="metric-card">
          <div class="metric-title">Successful Swipes</div>
          <div class="metric-value">${total - failed}</div>
          <div class="metric-trend text-success">Cleared POS integrations</div>
        </div>
        <div class="metric-card">
          <div class="metric-title">Processed Value</div>
          <div class="metric-value">R ${values.toLocaleString()}</div>
          <div class="metric-trend text-success">Settled merchant funds</div>
        </div>
      `;

      donutData = [
        { label: "Payment Complete", value: filtered.filter(o => o.payment === 'Payment Complete').length, color: "#a2d829" },
        { label: "Failed", value: filtered.filter(o => o.payment === 'Failed').length, color: "#ff4d4f" },
        { label: "Refunded", value: filtered.filter(o => o.payment === 'Refunded').length, color: "#faad14" }
      ];

      // Failure leaderboard by store
      const storeFails = { "PTA-001": 0, "JHB-002": 0, "DBN-003": 0 };
      filtered.filter(o => o.payment === 'Failed').forEach(o => {
        storeFails[o.store] = (storeFails[o.store] || 0) + 1;
      });
      for (const [st, qty] of Object.entries(storeFails)) {
        leaderboardData.push({ label: `Branch ${st}`, value: qty, displayValue: `${qty} failures` });
      }
      document.getElementById('leaderboard-chart-title').innerText = "POS Terminal Payment Failures by Branch";
    }

    else if (category === 'fixed_line') {
      const fixedOrders = filtered.filter(o => o.type === 'Fixed Line');
      const checksCount = fixedOrders.length;
      const available = fixedOrders.filter(o => o.coverageOutcome === 'Coverage available').length;
      const unavailable = fixedOrders.filter(o => o.coverageOutcome === 'Coverage unavailable').length;
      const inconclusive = fixedOrders.filter(o => o.coverageOutcome === 'Coverage inconclusive').length;

      const availableRate = checksCount > 0 ? Math.round((available / checksCount) * 100) : 0;

      kpiGrid.innerHTML = `
        <div class="metric-card">
          <div class="metric-title">GIS Line Checks</div>
          <div class="metric-value">${checksCount}</div>
          <div class="metric-trend text-secondary">Broadband checks run</div>
        </div>
        <div class="metric-card">
          <div class="metric-title">Eligibility Pass</div>
          <div class="metric-value">${availableRate}%</div>
          <div class="metric-trend text-success">Coverage confirmed</div>
        </div>
        <div class="metric-card">
          <div class="metric-title">Unavailable Areas</div>
          <div class="metric-value" style="color:var(--telkom-danger)">${unavailable}</div>
          <div class="metric-trend text-danger">No network coverage</div>
        </div>
        <div class="metric-card">
          <div class="metric-title">Inconclusive Results</div>
          <div class="metric-value" style="color:var(--telkom-warning)">${inconclusive}</div>
          <div class="metric-trend text-warning">Manual survey required</div>
        </div>
      `;

      donutData = [
        { label: "Coverage available", value: available, color: "#a2d829" },
        { label: "Coverage unavailable", value: unavailable, color: "#ff4d4f" },
        { label: "Coverage inconclusive", value: inconclusive, color: "#faad14" }
      ];

      // Store checks leaderboard
      const storeChecks = { "PTA-001": 0, "JHB-002": 0, "DBN-003": 0 };
      fixedOrders.forEach(o => {
        storeChecks[o.store] = (storeChecks[o.store] || 0) + 1;
      });
      for (const [st, qty] of Object.entries(storeChecks)) {
        leaderboardData.push({ label: `Branch ${st}`, value: qty, displayValue: `${qty} checks` });
      }
      document.getElementById('leaderboard-chart-title').innerText = "Fixed-Line GIS Coverage Checks by Store";
    }

    // Default detailed order table columns
    tableThead.innerHTML = `
      <tr>
        <th>Order Ref</th>
        <th>Customer</th>
        <th>Product</th>
        <th>Store</th>
        <th>Agent</th>
        <th>Date</th>
        <th>Status</th>
        <th>Payment</th>
      </tr>
    `;

    if (filtered.length === 0) {
      tableTbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:30px; color:var(--text-secondary);">No orders matching constraints.</td></tr>`;
    } else {
      filtered.forEach(o => {
        tableTbody.innerHTML += `
          <tr>
            <td><strong>${o.orderRef}</strong></td>
            <td>${o.customerName}</td>
            <td>${o.product}</td>
            <td>${o.store}</td>
            <td><code>${o.agent}</code></td>
            <td>${o.date}</td>
            <td><span class="badge ${o.status === 'Fulfilled' ? 'badge-success' : (o.status === 'Cancelled' ? 'badge-warning' : (o.status === 'Failed' ? 'badge-danger' : 'badge-neutral'))}">${o.status}</span></td>
            <td><span class="badge ${o.payment === 'Payment Complete' ? 'badge-success' : (o.payment === 'Failed' ? 'badge-danger' : 'badge-warning')}">${o.payment}</span></td>
          </tr>
        `;
      });
    }
  }

  // Draw Donut Chart
  const segmentTitleMap = {
    order_activity: "Fulfillment Status Share",
    agent_performance: "Operational Agent Sales Share",
    product_sales: "Product Category Volume Share",
    store_performance: "Store Revenue Segment Share",
    stock_status: "Approval Cycle Segment Share",
    payment_status: "Card Settlement Outcome Share",
    fixed_line: "GIS Feasibility Coverage Share"
  };
  document.getElementById('segment-chart-title').innerText = segmentTitleMap[category] || "Status Composition Breakdown";
  drawSVGDonutChart('report-donut-chart-container', donutData);

  // Render Donut Legend
  const legendContainer = document.getElementById('report-donut-legend');
  legendContainer.innerHTML = '';
  const donutTotal = donutData.reduce((s, d) => s + d.value, 0);
  
  donutData.forEach(d => {
    const pct = donutTotal > 0 ? Math.round((d.value / donutTotal) * 100) : 0;
    legendContainer.innerHTML += `
      <div class="legend-item">
        <div style="display:flex; align-items:center; gap:6px;">
          <span class="legend-color-dot" style="background-color: ${d.color};"></span>
          <span style="font-weight:600; color:var(--text-dark)">${d.label}</span>
        </div>
        <span style="font-weight:bold; color:var(--text-secondary);">${d.value} (${pct}%)</span>
      </div>
    `;
  });

  // Render Leaderboard / Ranking Chart
  renderLeaderboardChart('report-leaderboard-container', leaderboardData);

  // Generate Actionable Insights
  generateActionableInsights(filtered, category, role);

  // Update table row count
  document.getElementById('report-table-count').innerText = `Showing ${filtered.length} entries`;

  // Set Generation Timestamp
  const now = new Date();
  const timestampStr = now.toISOString().replace('T', ' ').substring(0, 19) + " SAST";
  document.getElementById('report-generation-timestamp').innerText = `Generated: ${timestampStr} by ${APP_STATE.currentUser.id} (${APP_STATE.currentUser.name})`;
}

// ==========================================
// 9. REPORT EXPORT OPTIONS POP-UP & TRIGGERS
// ==========================================

function openExportModal() {
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

function toggleSelectAllExportFormats(el) {
  const checked = el.checked;
  document.getElementById('export-format-pdf').checked = checked;
  document.getElementById('export-format-csv').checked = checked;
  document.getElementById('export-format-excel').checked = checked;
}

function triggerReportDownload() {
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

function downloadCSVReport(category, data, fromDate, toDate) {
  let csvContent = "";
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

  if (category === 'stock_status') {
    csvContent += `Telkom Stock Request Status History Report\n`;
    csvContent += `Generated at: ${timestamp} SAST\n`;
    csvContent += `Date Range: ${fromDate} to ${toDate}\n\n`;
    csvContent += `Request ID,Store,Product,SKU,Quantity,Priority,Date,Status,Notes\n`;
    
    data.forEach(r => {
      csvContent += `"${r.id}","${r.storeId}","${r.product}","${r.sku}","${r.qty}","${r.priority}","${r.date}","${r.status}","${r.notes || ''}"\n`;
    });
  } else {
    csvContent += `Telkom Operational Sales Report (${category.toUpperCase()})\n`;
    csvContent += `Generated at: ${timestamp} SAST\n`;
    csvContent += `Date Range: ${fromDate} to ${toDate}\n\n`;
    csvContent += `Order Ref,Customer,Account No,Product,Store,Agent,Date,Status,Payment,Handling Time (mins),Value (ZAR),Coverage Outcome\n`;
    
    data.forEach(o => {
      csvContent += `"${o.orderRef}","${o.customerName}","${o.accountNo}","${o.product}","${o.store}","${o.agent}","${o.date}","${o.status}","${o.payment}","${o.handlingTime}","${o.revenue}","${o.coverageOutcome || 'N/A'}"\n`;
    });
  }

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `Telkom_Report_${category}_${fromDate}_to_${toDate}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function downloadExcelReport(category, data, fromDate, toDate) {
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
        <tr><td colspan="8">Date range: ${fromDate} to ${toDate}</td></tr>
        <tr><td colspan="8">Category: ${category}</td></tr>
        <tr><td colspan="8"></td></tr>
  `;

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
  link.setAttribute("download", `Telkom_Report_${category}_${fromDate}_to_${toDate}.xls`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function downloadPDFReport(category, store, data, fromDate, toDate) {
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
          <td><span style="color: ${r.priority === 'Urgent' ? 'red' : 'black'}; font-weight: ${r.priority === 'Urgent' ? 'bold' : 'normal'};">${r.priority}</span></td>
          <td>${r.date}</td>
          <td>${r.status}</td>
        </tr>
      `;
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
          <img src="Images/Logo.svg" alt="Telkom Retail" style="height: 40px; object-fit: contain; display: block; margin-bottom: 4px; filter: invert(1);">
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

  // Simulated raw output file download
  const fileContent = `
========================================
TELKOM RETAIL OPERATIONAL AUDIT REPORT
========================================
Generated: ${timestamp} SAST
Category: ${catName}
Scope: ${storeName}
Date Range: ${fromDate} to ${toDate}
Total Records: ${data.length}
========================================
Report metadata compilation complete.
See printable window layout for the PDF document preview structure.
========================================
`;
  const blob = new Blob([fileContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `Telkom_Report_${category}_${fromDate}_to_${toDate}.pdf`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ==========================================
// 8B. OPERATIONAL RECORD LOGS VIEW & INSTANT SEARCH
// ==========================================

function handleLogFilterChange() {
  renderRecordLogs();
}

function resetLogFilters() {
  document.getElementById('log-search-input').value = '';
  document.getElementById('log-filter-category').value = 'order_activity';
  
  // Set default dates
  document.getElementById('log-filter-start-date').value = '2026-06-01';
  document.getElementById('log-filter-end-date').value = '2026-06-12';
  
  // Reset store select if not disabled
  const storeSelect = document.getElementById('log-filter-store');
  if (storeSelect && !storeSelect.disabled) {
    storeSelect.value = 'ALL';
  }
  
  renderRecordLogs();
}

function getFilteredLogsData() {
  const category = document.getElementById('log-filter-category').value;
  const store = document.getElementById('log-filter-store').value;
  const startDateStr = document.getElementById('log-filter-start-date').value;
  const endDateStr = document.getElementById('log-filter-end-date').value;
  const searchVal = document.getElementById('log-search-input').value.trim().toLowerCase();

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

function renderRecordLogs() {
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
            <td><span class="badge ${o.payment === 'Payment Complete' ? 'badge-success' : (o.payment === 'Failed' ? 'badge-danger' : 'badge-warning')}">${o.payment}</span></td>
            ${extraCols}
            <td>
              <button class="btn btn-sm btn-primary" onclick="downloadOrderReceipt('${o.orderRef}')" style="white-space:nowrap;">
                🧾 Receipt
              </button>
            </td>
          </tr>
        `;
      });
    }
  }

  // Update count
  document.getElementById('log-table-count').innerText = `Showing ${filtered.length} entries`;

  // Set Generation Timestamp
  const now = new Date();
  const timestampStr = now.toISOString().replace('T', ' ').substring(0, 19) + " SAST";
  document.getElementById('log-generation-timestamp').innerText = `Generated: ${timestampStr} by ${APP_STATE.currentUser.id}`;
}

// ==========================================
// 8C. RECEIPT VIEWING & DOWNLOADING
// ==========================================

function downloadOrderReceipt(orderRef) {
  const order = APP_STATE.ordersList.find(o => o.orderRef === orderRef);
  if (!order) return;

  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  
  // Create beautiful printable receipt layout
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

  // Trigger simulated raw output file download
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

// Render Notifications Tray
function renderNotificationsView() {
  const container = document.getElementById('notifications-page-list');
  container.innerHTML = '';
  
  if (APP_STATE.notifications.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding: 48px; background-color: var(--bg-card); border-radius: var(--radius-lg); border:1px solid var(--border-color);">
        <p style="color:var(--text-secondary)">No notifications found.</p>
      </div>
    `;
    return;
  }

  APP_STATE.notifications.forEach(n => {
    container.innerHTML += `
      <div class="notification-item ${n.read ? '' : 'unread'}" onclick="markNotificationRead('${n.id}', '${n.link}')">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div class="notification-title">${n.title}</div>
          <span class="badge ${n.priority === 'Urgent' ? 'badge-danger' : 'badge-neutral'}">${n.priority}</span>
        </div>
        <div class="notification-msg">${n.message}</div>
        <div class="notification-meta">
          <span>Channel: Retail Portals</span>
          <span>${n.date}</span>
        </div>
      </div>
    `;
  });
}

// Toggle read state of notification
function markNotificationRead(id, link) {
  const notif = APP_STATE.notifications.find(n => n.id === id);
  if (notif) {
    notif.read = true;
    saveNotifications();
    updateNotificationsBadge();
    if (link) {
      switchRoute(link);
    } else {
      renderNotificationsView();
    }
  }
}

// Update Notifications Badge icon
function updateNotificationsBadge() {
  const count = APP_STATE.notifications.filter(n => !n.read).length;
  const badge = document.getElementById('notifications-count-badge');
  if (count > 0) {
    badge.style.display = 'flex';
    badge.innerText = count;
  } else {
    badge.style.display = 'none';
  }
}

// Toggle notifications drawer overlay
function toggleNotificationsDrawer() {
  const drawer = document.getElementById('notifications-drawer');
  drawer.classList.toggle('open');
  if (drawer.classList.contains('open')) {
    renderNotificationsDrawerBody();
  }
}

function renderNotificationsDrawerBody() {
  const body = document.getElementById('drawer-notifications-list');
  body.innerHTML = '';
  
  const unread = APP_STATE.notifications.filter(n => !n.read);
  if (unread.length === 0) {
    body.innerHTML = `<p style="text-align:center; font-size:12px; color:var(--text-muted); margin-top:20px;">All caught up!</p>`;
    return;
  }

  unread.forEach(n => {
    body.innerHTML += `
      <div class="notification-item unread" onclick="markNotificationRead('${n.id}', '${n.link}')" style="font-size:12px;">
        <div style="font-weight:700; margin-bottom: 2px;">${n.title}</div>
        <div style="color:var(--text-secondary); margin-bottom: 4px;">${n.message}</div>
        <div style="font-size:9px; color:var(--text-muted);">${n.date}</div>
      </div>
    `;
  });
}

// ==========================================
// 6. CUSTOMER SELECTION & CIM SESSION
// ==========================================

function handleCustomerSearch(e) {
  e.preventDefault();
  
  // Verify CRM System health outage
  if (!APP_STATE.systemHealth.crm) {
    showToast("Amdocs Clarify CRM is currently offline. Cannot retrieve records.", "danger");
    return;
  }

  const queryType = document.getElementById('search-type').value;
  const queryVal = document.getElementById('search-input').value.trim();
  const errorBox = document.getElementById('search-error');
  errorBox.style.display = 'none';

  if (!queryVal) {
    errorBox.innerText = "Please enter an ID number, account number, or mobile number.";
    errorBox.style.display = 'block';
    return;
  }

  // Format validations
  if (queryType === 'id' && !/^\d{13}$/.test(queryVal)) {
    errorBox.innerText = "South African ID number must be exactly 13 digits.";
    errorBox.style.display = 'block';
    return;
  }

  // Find customer in database
  let found = null;
  if (queryType === 'id') {
    found = MOCK_DB.crm.find(c => c.id === queryVal);
  } else if (queryType === 'passport') {
    found = MOCK_DB.crm.find(c => c.passport.toLowerCase() === queryVal.toLowerCase());
  } else if (queryType === 'account') {
    found = MOCK_DB.crm.find(c => c.accountNumber.toLowerCase() === queryVal.toLowerCase());
  } else if (queryType === 'mobile') {
    found = MOCK_DB.crm.find(c => c.mobile === queryVal);
  }

  const resultsDiv = document.getElementById('search-results-panel');
  const resultsTbody = document.getElementById('search-results-tbody');
  
  resultsTbody.innerHTML = '';
  if (found) {
    resultsDiv.style.display = 'block';
    resultsTbody.innerHTML = `
      <tr>
        <td><strong>${found.name}</strong></td>
        <td>${found.id ? maskID(found.id) : maskPassport(found.passport)}</td>
        <td>${found.accountNumber}</td>
        <td>${found.mobile}</td>
        <td><span class="badge ${found.status === 'Active' ? 'badge-success' : 'badge-danger'}">${found.status}</span></td>
        <td>
          <button class="btn btn-sm btn-primary" onclick="identifyCustomer('${found.id || found.passport}', '${!!found.id ? 'id' : 'passport'}')">Select Profile</button>
        </td>
      </tr>
    `;
  } else {
    resultsDiv.style.display = 'block';
    resultsTbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 30px;">
          Customer record not found. 
          <br><br>
          <button class="btn btn-sm btn-outline" onclick="openCreateCustomerModal()">Create / Refer Customer</button>
        </td>
      </tr>
    `;
  }
}

// Select Customer and Create CIM Session
function identifyCustomer(identityVal, type) {
  let cust = null;
  if (type === 'id') {
    cust = MOCK_DB.crm.find(c => c.id === identityVal);
  } else {
    cust = MOCK_DB.crm.find(c => c.passport === identityVal);
  }

  if (cust) {
    APP_STATE.selectedCustomer = cust;
    
    // Automatically create a CIM Session
    APP_STATE.activeCIMInteraction = {
      type: "New Order",
      channel: "Retail store",
      storeId: APP_STATE.currentUser.branch,
      agentId: APP_STATE.currentUser.id,
      timestamp: new Date().toISOString(),
      notes: ""
    };

    showToast(`CIM Session created for ${cust.name}`, "success");
    switchRoute('customer-360');
  }
}

// Terminate Customer Session
function closeCustomerSession() {
  APP_STATE.selectedCustomer = null;
  APP_STATE.activeCIMInteraction = null;
  // Clear cart
  APP_STATE.cart = {
    product: null,
    contractDetails: { simType: "eSIM", numberOption: "New Number", portInNumber: "", installationAddress: "", installationContactName: "", installationContactPhone: "", preferredInstallationDate: "" },
    consent: false,
    gisRef: "",
    gisStatus: "Not checked",
    stockChecked: false,
    stockStatus: "",
    paymentStatus: "Pending",
    posTxnRef: "",
    receiptNo: "",
    orderRef: ""
  };
  APP_STATE.currentStep = 1;

  showToast("Customer session terminated successfully.", "neutral");
  switchRoute('customer-search');
}

// ==========================================
// 7. PRODUCT CART SELECTION & WIZARD STEPS
// ==========================================

function selectProductForStepper(prodId) {
  // Check customer session exists
  if (!APP_STATE.selectedCustomer) {
    showToast("Error: No customer session active. Identify a customer first.", "warning");
    switchRoute('customer-search');
    return;
  }

  // Account eligibility suspended check
  if (APP_STATE.selectedCustomer.status === 'Suspended') {
    showToast("Transaction Blocked: This customer account is suspended. Clear outstanding balances in Clarify CRM first.", "danger");
    return;
  }

  const p = MOCK_DB.products.find(prod => prod.id === prodId);
  if (p) {
    // Check GIS check required
    if (p.category === 'Exlight broadband plans') {
      APP_STATE.cart.gisStatus = "Not checked";
      APP_STATE.cart.gisRef = "";
    } else {
      APP_STATE.cart.gisStatus = "Skip";
    }

    // Check stock lock required
    if (p.deviceSKU) {
      APP_STATE.cart.stockChecked = false;
      APP_STATE.cart.stockStatus = "";
    } else {
      APP_STATE.cart.stockChecked = true;
      APP_STATE.cart.stockStatus = "Skip";
    }

    APP_STATE.cart.product = p;
    APP_STATE.currentStep = 1; // start from Step 1
    switchRoute('order-stepper');
  }
}

function handleStepperBack() {
  if (APP_STATE.currentStep > 1) {
    APP_STATE.currentStep--;
    renderStepper();
  }
}

function handleStepperNext() {
  // Validate current step before proceeding
  if (APP_STATE.currentStep === 2) {
    // Validate CIM interaction notes length
    if (!APP_STATE.activeCIMInteraction || APP_STATE.activeCIMInteraction.notes.trim().length < 10) {
      document.getElementById('cim-notes-error').style.display = 'block';
      return;
    }
  }

  if (APP_STATE.currentStep === 4) {
    // If fixed line, requires coverage available
    if (APP_STATE.cart.product.category === 'Exlight broadband plans' && APP_STATE.cart.gisStatus !== 'Coverage available') {
      showToast("GIS check must return 'Coverage available' to proceed.", "warning");
      return;
    }
    // If device contract, requires stock checked & available
    if (APP_STATE.cart.product.deviceSKU && (!APP_STATE.cart.stockChecked || APP_STATE.cart.stockStatus !== 'In Stock')) {
      showToast("Device stock must be locked and verified available to proceed.", "warning");
      return;
    }
  }

  if (APP_STATE.currentStep === 5) {
    // Validate form inputs
    const p = APP_STATE.cart.product;
    if (p.category === 'Exlight broadband plans') {
      const name = document.getElementById('billing-contact-name').value.trim();
      const phone = document.getElementById('billing-contact-phone').value.trim();
      if (!name || !phone) {
        showToast("Please complete all mandatory installation contact fields.", "warning");
        return;
      }
    } else {
      if (APP_STATE.cart.contractDetails.numberOption === 'Port In' && !APP_STATE.cart.contractDetails.portInNumber) {
        showToast("Port in phone number must be supplied.", "warning");
        return;
      }
    }
  }

  if (APP_STATE.currentStep === 6) {
    if (!APP_STATE.cart.consent) {
      showToast("NCA Credit Check consent checkboxes must be acknowledged.", "warning");
      return;
    }
  }

  if (APP_STATE.currentStep === 7) {
    // Trigger submission order to OMS
    submitOrderToOMS();
    return;
  }

  if (APP_STATE.currentStep < 7) {
    APP_STATE.currentStep++;
    renderStepper();
  }
}

// Update local CIM variables
function updateCIMState() {
  const type = document.getElementById('stepper-cim-type').value;
  const notes = document.getElementById('stepper-cim-notes').value;
  APP_STATE.activeCIMInteraction.type = type;
  APP_STATE.activeCIMInteraction.notes = notes;
  updateCIMNotesCount();

  if (notes.trim().length >= 10) {
    document.getElementById('cim-notes-error').style.display = 'none';
  }
}

function updateCIMNotesCount() {
  const count = APP_STATE.activeCIMInteraction.notes.trim().length;
  const countEl = document.getElementById('cim-char-count');
  if (countEl) countEl.innerText = count;
}

// Update Local Contract details
function updateContractDetailsState() {
  const p = APP_STATE.cart.product;
  if (p.category === 'Exlight broadband plans') {
    APP_STATE.cart.contractDetails.installationContactName = document.getElementById('billing-contact-name').value;
    APP_STATE.cart.contractDetails.installationContactPhone = document.getElementById('billing-contact-phone').value;
    APP_STATE.cart.contractDetails.preferredInstallationDate = document.getElementById('billing-install-date').value;
  } else {
    APP_STATE.cart.contractDetails.simType = document.getElementById('mobile-sim-type').value;
    const numOpt = document.getElementById('mobile-number-opt').value;
    APP_STATE.cart.contractDetails.numberOption = numOpt;
    
    const portEl = document.getElementById('port-in-wrapper');
    if (numOpt === 'Port In') {
      portEl.style.display = 'block';
      APP_STATE.cart.contractDetails.portInNumber = document.getElementById('mobile-port-number').value;
    } else {
      portEl.style.display = 'none';
      APP_STATE.cart.contractDetails.portInNumber = '';
    }
  }
}

function toggleConsent() {
  APP_STATE.cart.consent = document.getElementById('consent-check').checked;
}

// ==========================================
// 8. GIS AND STOCK SIMULATORS
// ==========================================

function simulateGisAddressCheck() {
  const addr = APP_STATE.selectedCustomer.address;
  const coverageData = MOCK_DB.gis[addr];
  
  if (coverageData) {
    APP_STATE.cart.gisStatus = coverageData.status;
    APP_STATE.cart.gisRef = coverageData.ref;
  } else {
    APP_STATE.cart.gisStatus = "Coverage unavailable";
    APP_STATE.cart.gisRef = "";
  }
  
  showToast(`GIS Check: ${APP_STATE.cart.gisStatus}`, APP_STATE.cart.gisStatus === 'Coverage available' ? 'success' : 'danger');
  renderStepper();
}

function forceCoverageAcceptance() {
  APP_STATE.cart.gisStatus = "Coverage available";
  APP_STATE.cart.gisRef = "GIS-OVERRIDE-TEMP";
  showToast("Manual GIS Coverage override accepted.", "success");
  renderStepper();
}

function simulateGisApiRetry() {
  APP_STATE.systemHealth.gis = true;
  showToast("GIS checker API reconnected.", "success");
  renderStepper();
}

function simulateStockCheckAction() {
  const p = APP_STATE.cart.product;
  const stock = MOCK_DB.stock[APP_STATE.currentUser.branch][p.deviceSKU];
  
  if (stock && stock.available > 0) {
    // Allocate/Reserve stock temporarily
    stock.available--;
    stock.reserved++;
    APP_STATE.cart.stockChecked = true;
    APP_STATE.cart.stockStatus = "In Stock";
    showToast("Stock allocation locked in Transact.", "success");
  } else {
    APP_STATE.cart.stockChecked = true;
    APP_STATE.cart.stockStatus = "Out of Stock";
    showToast("Out of stock alert triggered.", "danger");
  }
  renderStepper();
}

function simulateStockApiRetry() {
  APP_STATE.systemHealth.transact = true;
  showToast("Transact stock database online.", "success");
  renderStepper();
}

function notifyStoreManagerForStock() {
  showToast("Notification dispatched to Store Manager regarding out of stock device.", "info");
}

// ==========================================
// 9. SUBMISSION & POS PAYMENT
// ==========================================

function submitOrderToOMS() {
  // Validate OMS status
  if (!APP_STATE.systemHealth.oms) {
    showToast("Amdocs OMS Submission Timeout. System Unavailable.", "danger");
    return;
  }

  // Create OMS Order reference
  const ordRef = "ORD-" + Math.floor(100000 + Math.random() * 900000);
  APP_STATE.cart.orderRef = ordRef;

  // Add interaction logs to customer crm log
  APP_STATE.selectedCustomer.interactions.unshift({
    date: new Date().toISOString().slice(0, 10) + " " + new Date().toTimeString().slice(0, 5),
    agent: APP_STATE.currentUser.id,
    type: "New Order",
    notes: `OMS order submitted: ${ordRef}. Product: ${APP_STATE.cart.product.name}. CIM notes: ${APP_STATE.activeCIMInteraction.notes}`
  });

  // Switch to payment view
  switchRoute('payment');
}

function renderPaymentScreen() {
  document.getElementById('pay-order-ref').innerText = APP_STATE.cart.orderRef;
  document.getElementById('pay-amount').innerText = `R${APP_STATE.cart.product.price + APP_STATE.cart.product.onceOff}`;
}

function handlePOSPaymentTrigger() {
  // Verify POS terminal health outage override
  if (!APP_STATE.systemHealth.pos) {
    showToast("POS terminal handshake timed out. Payment initiation failed.", "danger");
    return;
  }

  // POS Loading simulate
  const payBtn = document.getElementById('pay-init-btn');
  payBtn.disabled = true;
  payBtn.innerText = "Connecting terminal...";

  setTimeout(() => {
    payBtn.innerText = "Verifying transaction...";
    
    setTimeout(() => {
      // Complete payment
      APP_STATE.cart.posTxnRef = "POS-" + Math.floor(10000000 + Math.random() * 90000000);
      APP_STATE.cart.receiptNo = "REC-" + Math.floor(10000000 + Math.random() * 90000000);
      APP_STATE.cart.paymentStatus = "Successful";

      // Append order to local database orders
      const newOrder = {
        orderRef: APP_STATE.cart.orderRef,
        customerName: APP_STATE.selectedCustomer.name,
        accountNo: APP_STATE.selectedCustomer.accountNumber,
        product: APP_STATE.cart.product.name,
        type: APP_STATE.cart.product.type,
        store: APP_STATE.currentUser.branch,
        agent: APP_STATE.currentUser.id,
        status: "Submitted",
        payment: "Payment Complete",
        date: new Date().toISOString().replace('T', ' ').slice(0, 19)
      };

      APP_STATE.ordersList.unshift(newOrder);
      saveOrders();

      // Trigger success notification
      pushNotification(
        "Order Processed Successfully",
        `Order ${newOrder.orderRef} for ${newOrder.customerName} processed and paid.`,
        "order_submitted",
        "Normal"
      );

      showToast("POS payment success. Receipt generated.", "success");
      
      // Render receipt view
      switchRoute('confirmation');
    }, 1500);
  }, 1500);
}

// Confirmation receipt render
function renderConfirmationReceipt() {
  document.getElementById('conf-receipt-no').innerText = APP_STATE.cart.receiptNo;
  document.getElementById('conf-order-ref').innerText = APP_STATE.cart.orderRef;
  document.getElementById('conf-date').innerText = new Date().toLocaleString();
  document.getElementById('conf-cust-name').innerText = APP_STATE.selectedCustomer.name;
  document.getElementById('conf-account').innerText = APP_STATE.selectedCustomer.accountNumber;
  document.getElementById('conf-agent').innerText = `${APP_STATE.currentUser.name} (${APP_STATE.currentUser.id})`;
  document.getElementById('conf-store').innerText = APP_STATE.currentUser.branch;
  document.getElementById('conf-product').innerText = APP_STATE.cart.product.name;
  document.getElementById('conf-term').innerText = `${APP_STATE.cart.product.term} Months`;
  document.getElementById('conf-price').innerText = `R${APP_STATE.cart.product.price} /mo`;
  document.getElementById('conf-onceoff').innerText = `R${APP_STATE.cart.product.onceOff}`;
  document.getElementById('conf-total').innerText = `R${APP_STATE.cart.product.price + APP_STATE.cart.product.onceOff}`;
}

// ==========================================
// 10. STOCK REQUEST WORKFLOW
// ==========================================

function initiateStockRequest(sku, productName) {
  // Setup modal
  document.getElementById('stock-req-sku').value = sku;
  document.getElementById('stock-req-product').value = productName;
  document.getElementById('stock-req-qty').value = "5";
  document.getElementById('stock-req-reason').value = "Customer Order";
  document.getElementById('stock-req-priority').value = "Urgent";
  document.getElementById('stock-req-notes').value = "";

  openModal('stock-request-modal');
}

function handleStockRequestSubmit(e) {
  e.preventDefault();
  
  const sku = document.getElementById('stock-req-sku').value;
  const prod = document.getElementById('stock-req-product').value;
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
    renderStockRequests();
  } else if (APP_STATE.activeRoute === 'agent-dashboard') {
    renderAgentDashboard();
  }
}

// Approve / Decline modal load for Area Manager
let activeApprovalId = null;

function openApprovalModal(reqId) {
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

function toggleDeclineReasonArea() {
  const decType = document.getElementById('approve-decision-type').value;
  const reasonDiv = document.getElementById('decline-reason-group');
  if (decType === 'Decline') {
    reasonDiv.style.display = 'block';
  } else {
    reasonDiv.style.display = 'none';
  }
}

function handleApprovalSubmit(e) {
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

// ==========================================
// 11. GENERAL UTILITY HELPERS
// ==========================================

function pushNotification(title, message, type, priority) {
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

function showToast(message, type = "success") {
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

// Masking helpers
function maskID(idNum) {
  if (!idNum) return "";
  return idNum.slice(0, 2) + "*******" + idNum.slice(-4);
}

function maskPassport(passport) {
  if (!passport) return "";
  return passport.slice(0, 2) + "****" + passport.slice(-3);
}

// Modal management
function openModal(modalId) {
  document.getElementById(modalId).style.display = 'flex';
}

function closeModal(modalId) {
  document.getElementById(modalId).style.display = 'none';
}

// UAT panel interactions
function toggleUatPanel() {
  const p = document.getElementById('uat-controller-panel');
  p.classList.toggle('collapsed');
}

function handleUatRoleChange() {
  const role = document.getElementById('uat-role').value;
  APP_STATE.currentUser.role = role;
  
  // Set mock user profiles matching role
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

  // Update navbar layout permissions
  updateSidebarMenuOptions();

  // Route to role specific dashboard
  if (role === 'agent') switchRoute('agent-dashboard');
  else if (role === 'manager') switchRoute('manager-dashboard');
  else if (role === 'area_manager') switchRoute('area-dashboard');
  else if (role === 'admin') switchRoute('admin-dashboard');
  
  showToast(`UAT: Swapped role to ${role.toUpperCase()}`, "info");
}

function updateSidebarMenuOptions() {
  const role = APP_STATE.currentUser.role;
  const menuContainer = document.getElementById('sidebar-dynamic-menu');
  menuContainer.innerHTML = '';

  document.getElementById('sidebar-role-indicator').innerText = role;
  document.getElementById('nav-user-fullname').innerText = APP_STATE.currentUser.name;
  document.getElementById('nav-user-rolename').innerText = role.toUpperCase();

  let html = '';

  if (role === 'agent') {
    html += `
      <div class="menu-section-title">Retail Agent Operations</div>
      <ul class="sidebar-menu-list">
        <li class="sidebar-menu-item"><a class="sidebar-link" data-route="agent-dashboard" onclick="switchRoute('agent-dashboard')"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg><span>Dashboard</span></a></li>
        <li class="sidebar-menu-item"><a class="sidebar-link" data-route="customer-search" onclick="switchRoute('customer-search')"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg><span>Customer Search</span></a></li>
        <li class="sidebar-menu-item"><a class="sidebar-link" data-route="catalogue" onclick="switchRoute('catalogue')"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg><span>Product Catalogue</span></a></li>
        <li class="sidebar-menu-item"><a class="sidebar-link" data-route="order-tracking" onclick="switchRoute('order-tracking')"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg><span>Order Tracking</span></a></li>
        <li class="sidebar-menu-item"><a class="sidebar-link" data-route="stock-requests" onclick="switchRoute('stock-requests')"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg><span>Stock Requests</span></a></li>
      </ul>
    `;
  } else if (role === 'manager') {
    html += `
      <div class="menu-section-title">Manager Operations</div>
      <ul class="sidebar-menu-list">
        <li class="sidebar-menu-item"><a class="sidebar-link" data-route="manager-dashboard" onclick="switchRoute('manager-dashboard')"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg><span>Dashboard</span></a></li>
        <li class="sidebar-menu-item"><a class="sidebar-link" data-route="customer-search" onclick="switchRoute('customer-search')"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg><span>Customer Search</span></a></li>
        <li class="sidebar-menu-item"><a class="sidebar-link" data-route="catalogue" onclick="switchRoute('catalogue')"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg><span>Product Catalogue</span></a></li>
        <li class="sidebar-menu-item"><a class="sidebar-link" data-route="order-tracking" onclick="switchRoute('order-tracking')"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg><span>Order Tracking</span></a></li>
        <li class="sidebar-menu-item"><a class="sidebar-link" data-route="stock-requests" onclick="switchRoute('stock-requests')"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg><span>Stock Requests</span></a></li>
        <li class="sidebar-menu-item"><a class="sidebar-link" data-route="reports" onclick="switchRoute('reports')"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg><span>Reports</span></a></li>
        <li class="sidebar-menu-item"><a class="sidebar-link" data-route="record-logs" onclick="switchRoute('record-logs')"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg><span>Record Logs</span></a></li>
      </ul>
    `;
  } else if (role === 'area_manager') {
    html += `
      <div class="menu-section-title">Area Operations</div>
      <ul class="sidebar-menu-list">
        <li class="sidebar-menu-item"><a class="sidebar-link" data-route="area-dashboard" onclick="switchRoute('area-dashboard')"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg><span>Area Dashboard</span></a></li>
        <li class="sidebar-menu-item"><a class="sidebar-link" data-route="order-tracking" onclick="switchRoute('order-tracking')"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg><span>Order Tracking</span></a></li>
        <li class="sidebar-menu-item"><a class="sidebar-link" data-route="stock-requests" onclick="switchRoute('stock-requests')"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg><span>Stock Approvals</span></a></li>
        <li class="sidebar-menu-item"><a class="sidebar-link" data-route="reports" onclick="switchRoute('reports')"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg><span>Reports</span></a></li>
        <li class="sidebar-menu-item"><a class="sidebar-link" data-route="record-logs" onclick="switchRoute('record-logs')"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg><span>Record Logs</span></a></li>
      </ul>
    `;
  } else if (role === 'admin') {
    html += `
      <div class="menu-section-title">IT Administration</div>
      <ul class="sidebar-menu-list">
        <li class="sidebar-menu-item"><a class="sidebar-link" data-route="admin-dashboard" onclick="switchRoute('admin-dashboard')"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"></path></svg><span>Health Portal</span></a></li>
        <li class="sidebar-menu-item"><a class="sidebar-link" data-route="reports" onclick="switchRoute('reports')"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg><span>Reports</span></a></li>
        <li class="sidebar-menu-item"><a class="sidebar-link" data-route="record-logs" onclick="switchRoute('record-logs')"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg><span>Record Logs</span></a></li>
        <li class="sidebar-menu-item"><a class="sidebar-link" data-route="notifications" onclick="switchRoute('notifications')"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg><span>Integration Alerts</span></a></li>
      </ul>
    `;
  }

  // Common navigation elements
  html += `
    <div class="menu-section-title">System & Settings</div>
    <ul class="sidebar-menu-list">
      <li class="sidebar-menu-item"><a class="sidebar-link" data-route="notifications" onclick="switchRoute('notifications')"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg><span>Notifications</span></a></li>
      <li class="sidebar-menu-item"><a class="sidebar-link" onclick="handleLogout()"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg><span>Log Out</span></a></li>
    </ul>
  `;

  menuContainer.innerHTML = html;
}

function handleUatOutageToggle(systemName) {
  const checkbox = document.getElementById(`outage-${systemName}`);
  APP_STATE.systemHealth[systemName] = !checkbox.checked;
  
  // Show status indicator toast
  if (checkbox.checked) {
    showToast(`UAT: Simulated outage triggered for ${systemName.toUpperCase()}`, "danger");
  } else {
    showToast(`UAT: Restored connectivity for ${systemName.toUpperCase()}`, "success");
  }

  // Refresh current screen to show updated API state
  renderScreen(APP_STATE.activeRoute);
}

// CRM customer update/save actions
function openCreateCustomerModal() {
  openModal('customer-create-modal');
}

function handleCreateCustomerSubmit(e) {
  e.preventDefault();
  
  const idNum = document.getElementById('new-cust-id').value.trim();
  const name = document.getElementById('new-cust-name').value.trim();
  const mobile = document.getElementById('new-cust-mobile').value.trim();
  const email = document.getElementById('new-cust-email').value.trim();
  const address = document.getElementById('new-cust-address').value.trim();

  // Validate SA ID
  if (!/^\d{13}$/.test(idNum)) {
    showToast("South African ID must be exactly 13 digits.", "danger");
    return;
  }

  const newCust = {
    id: idNum,
    passport: "",
    accountNumber: "TEL-" + Math.floor(10000000 + Math.random() * 90000000),
    name: name,
    status: "Active",
    segment: "Consumer",
    mobile: mobile,
    email: email,
    address: address,
    billingAddress: address,
    preferredContact: "SMS",
    activeProducts: [],
    interactions: []
  };

  MOCK_DB.crm.push(newCust);
  
  closeModal('customer-create-modal');
  showToast(`Profile created in Clarify CRM for ${name}.`, "success");

  // Automatically select this new customer
  identifyCustomer(newCust.id, 'id');
}

// Edit existing customer modal
function openEditCustomerModal() {
  const cust = APP_STATE.selectedCustomer;
  if (!cust) return;

  document.getElementById('edit-cust-email').value = cust.email;
  document.getElementById('edit-cust-mobile').value = cust.mobile;
  document.getElementById('edit-cust-address').value = cust.address;
  document.getElementById('edit-cust-billing').value = cust.billingAddress;
  document.getElementById('edit-cust-pref').value = cust.preferredContact;

  openModal('customer-edit-modal');
}

function handleEditCustomerSubmit(e) {
  e.preventDefault();
  const cust = APP_STATE.selectedCustomer;
  if (!cust) return;

  cust.email = document.getElementById('edit-cust-email').value;
  cust.mobile = document.getElementById('edit-cust-mobile').value;
  cust.address = document.getElementById('edit-cust-address').value;
  cust.billingAddress = document.getElementById('edit-cust-billing').value;
  cust.preferredContact = document.getElementById('edit-cust-pref').value;

  closeModal('customer-edit-modal');
  showToast("Customer contact details updated in Clarify CRM.", "success");
  renderCustomer360();
}

// Order Tracking Details Modal
function viewOrderDetails(orderRef) {
  const order = APP_STATE.ordersList.find(o => o.orderRef === orderRef);
  if (!order) return;

  document.getElementById('view-order-ref').innerText = order.orderRef;
  document.getElementById('view-order-status').innerText = order.status;
  document.getElementById('view-order-status').className = `badge ${order.status === 'Fulfilled' ? 'badge-success' : 'badge-warning'}`;
  document.getElementById('view-order-cust').innerText = order.customerName;
  document.getElementById('view-order-acct').innerText = order.accountNo;
  document.getElementById('view-order-prod').innerText = order.product;
  document.getElementById('view-order-store').innerText = order.store;
  document.getElementById('view-order-agent').innerText = order.agent;
  document.getElementById('view-order-date').innerText = order.date;
  document.getElementById('view-order-pay').innerText = order.payment;
  document.getElementById('view-order-pay').className = `badge ${order.payment.includes('Complete') ? 'badge-success' : 'badge-danger'}`;

  openModal('order-details-modal');
}

// Log out action
function handleLogout() {
  APP_STATE.selectedCustomer = null;
  APP_STATE.activeCIMInteraction = null;
  APP_STATE.isAuthenticated = false;
  clearAuthSession();
  switchRoute('login');
  showToast("User logged out.", "neutral");
}

// Login verification
function toggleLoginPassword(btn) {
  const input = btn.closest('.login-password-wrap').querySelector('.login-input');
  const isText = input.type === 'text';
  input.type = isText ? 'password' : 'text';
  btn.querySelector('.eye-icon').style.opacity = isText ? '1' : '0.4';
}

function handleLoginSubmit(e) {
  e.preventDefault();
  
  // Show loading state
  const submitBtn = document.getElementById('login-submit-btn');
  const btnText = submitBtn?.querySelector('.login-btn-text');
  const btnLoader = submitBtn?.querySelector('.login-btn-loader');
  if (submitBtn) {
    submitBtn.disabled = true;
    if (btnText) btnText.style.display = 'none';
    if (btnLoader) btnLoader.style.display = 'flex';
  }

  setTimeout(() => {
    if (submitBtn) {
      submitBtn.disabled = false;
      if (btnText) btnText.style.display = 'flex';
      if (btnLoader) btnLoader.style.display = 'none';
    }
    doLogin();
  }, 900);
}

function doLogin() {

  const idInput = document.getElementById('login-agent-id').value.trim();
  const password = document.getElementById('login-password').value.trim();
  const branch = document.getElementById('login-branch').value;
  const loginError = document.getElementById('login-form-error');
  loginError.style.display = 'none';

  if (!idInput || !password) {
    loginError.innerText = "Invalid username or password.";
    loginError.style.display = 'block';
    return;
  }

  const demoCredential = DEMO_LOGIN_CREDENTIALS[idInput.toUpperCase()];

  // Simulate authentication validation
  if (password === 'error') {
    loginError.innerText = "Locked account. Please contact Telkom Identity Support.";
    loginError.style.display = 'block';
    return;
  }

  if (!demoCredential || password !== demoCredential.password) {
    loginError.innerText = "Use one of the demo credentials shown on the login screen.";
    loginError.style.display = 'block';
    return;
  }

  // Auto derive roles based on Agent ID prefix
  // AGT-xxx -> store agent
  // MGR-xxx -> store manager
  // AM-xxx -> area manager
  // IT-xxx -> admin IT
  let derivedRole = 'agent';
  let name = 'Agent User';
  if (idInput.startsWith('MGR') || idInput.toLowerCase().includes('mgr')) {
    derivedRole = 'manager';
    name = 'Store Manager';
  } else if (idInput.startsWith('AM') || idInput.toLowerCase().includes('am')) {
    derivedRole = 'area_manager';
    name = 'Area Director';
  } else if (idInput.startsWith('IT') || idInput.toLowerCase().includes('it') || idInput.startsWith('ADM')) {
    derivedRole = 'admin';
    name = 'IT Operations';
  }

  APP_STATE.currentUser.id = idInput;
  APP_STATE.currentUser.name = demoCredential.name || name;
  APP_STATE.currentUser.role = demoCredential.role || derivedRole;
  APP_STATE.currentUser.branch = branch;
  APP_STATE.isAuthenticated = true;

  // Set UAT controller select value to match
  const uatRoleSelect = document.getElementById('uat-role');
  if (uatRoleSelect) {
    uatRoleSelect.value = APP_STATE.currentUser.role;
  }

  updateSidebarMenuOptions();
  saveAuthSession();
  
  showToast(`Welcome back, ${APP_STATE.currentUser.name}! Logged into ${branch}.`, "success");
  
  // Navigate to corresponding dashboard
  if (APP_STATE.currentUser.role === 'agent') switchRoute('agent-dashboard');
  else if (APP_STATE.currentUser.role === 'manager') switchRoute('manager-dashboard');
  else if (APP_STATE.currentUser.role === 'area_manager') switchRoute('area-dashboard');
  else if (APP_STATE.currentUser.role === 'admin') switchRoute('admin-dashboard');
}

// Old export simulation removed. Multi-format popup modal is now used instead.

// ==========================================
// 12. INITIALIZATION
// ==========================================

window.addEventListener('DOMContentLoaded', () => {
  // Load local mock database states
  loadStateFromStorage();
  
  // Set navbar and route
  updateSidebarMenuOptions();
  switchRoute(APP_STATE.isAuthenticated ? APP_STATE.activeRoute : 'login');
  
  // Update badge notifications count
  updateNotificationsBadge();
});

// ==========================================
// 13. SESSION TIMEOUT SIMULATION
// ==========================================

let sessionTimeoutInterval = null;

function triggerSessionTimeoutSimulation() {
  // Clear any existing timer
  if (sessionTimeoutInterval) {
    clearInterval(sessionTimeoutInterval);
  }

  let count = 30;
  document.getElementById('session-timeout-countdown').innerText = count;
  openModal('session-timeout-modal');

  sessionTimeoutInterval = setInterval(() => {
    count--;
    const countEl = document.getElementById('session-timeout-countdown');
    if (countEl) {
      countEl.innerText = count;
    }

    if (count <= 0) {
      clearInterval(sessionTimeoutInterval);
      sessionTimeoutInterval = null;
      closeModal('session-timeout-modal');
      handleTimeoutLogout();
    }
  }, 1000);

  showToast("UAT: Inactivity warning triggered.", "warning");
}

function handleTimeoutLogout() {
  if (sessionTimeoutInterval) {
    clearInterval(sessionTimeoutInterval);
    sessionTimeoutInterval = null;
  }
  closeModal('session-timeout-modal');
  handleLogout();
  showToast("Session closed due to inactivity timeout.", "danger");
}

function extendSessionLife() {
  if (sessionTimeoutInterval) {
    clearInterval(sessionTimeoutInterval);
    sessionTimeoutInterval = null;
  }
  closeModal('session-timeout-modal');
  showToast("Session lease extended successfully.", "success");
}

// Bind to window to ensure click events can trigger them
window.triggerSessionTimeoutSimulation = triggerSessionTimeoutSimulation;
window.handleTimeoutLogout = handleTimeoutLogout;
window.extendSessionLife = extendSessionLife;

// ==========================================
// 14. VIEW STOCK REQUEST DETAILS
// ==========================================

function viewStockRequestDetails(reqId) {
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

window.viewStockRequestDetails = viewStockRequestDetails;
window.handleLoginSubmit = handleLoginSubmit;
window.handleCustomerSearch = handleCustomerSearch;
window.handleCreateCustomerSubmit = handleCreateCustomerSubmit;
window.handleEditCustomerSubmit = handleEditCustomerSubmit;
window.handleStockRequestSubmit = handleStockRequestSubmit;
window.handleApprovalSubmit = handleApprovalSubmit;
window.handleStepperBack = handleStepperBack;
window.handleStepperNext = handleStepperNext;
window.handlePOSPaymentTrigger = handlePOSPaymentTrigger;
window.renderOrderTracking = renderOrderTracking;
window.openExportModal = openExportModal;
window.resetLogFilters = resetLogFilters;
window.toggleNotificationsDrawer = toggleNotificationsDrawer;
window.toggleUatPanel = toggleUatPanel;
window.triggerSessionTimeoutSimulation = triggerSessionTimeoutSimulation;
window.handleTimeoutLogout = handleTimeoutLogout;
window.extendSessionLife = extendSessionLife;
window.closeCustomerSession = closeCustomerSession;
window.initiateStockRequest = initiateStockRequest;
window.handleUatRoleChange = handleUatRoleChange;
window.triggerReportDownload = triggerReportDownload;
window.switchRoute = switchRoute;
window.handleLogout = handleLogout;
window.renderScreen = renderScreen;
window.closeModal = closeModal;
window.toggleLoginPassword = toggleLoginPassword;

// Auto-fill hint chip click
document.addEventListener('click', function(e) {
  if (e.target.classList.contains('login-hint-chip')) {
    const agentInput = document.getElementById('login-agent-id');
    if (agentInput) {
      const chipText = e.target.textContent.trim();
      // Only fill ID chips, not 'error'
      if (chipText !== 'error') {
        agentInput.value = chipText;
        agentInput.focus();
      }
    }
  }
});
