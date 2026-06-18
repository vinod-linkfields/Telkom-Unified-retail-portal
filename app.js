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
    { id: "p-sim-1", category: "SIM-only", name: "Infinite Pay-Month SIM Only", type: "Mobile", price: 199, onceOff: 99, term: 24, allocation: "Unlimited Data @ 10Mbps, 100 Mins", promo: false, dealId: "DEAL-SIM-01" },
    { id: "p-sim-2", category: "SIM-only", name: "Flexi SIM 10GB Promo", type: "Mobile", price: 99, onceOff: 99, term: 12, allocation: "10GB Data, 50 Mins, 100 SMSs", promo: true, dealId: "DEAL-SIM-02" },
    { id: "p-dev-1", category: "Handset contracts", name: "Samsung Galaxy S24 Contract", type: "Mobile", price: 699, onceOff: 199, term: 24, allocation: "Samsung S24, 10GB Data, 100 Mins", deviceSKU: "SKU-S24-128", promo: false, dealId: "DEAL-S24-24", deviceInfo: { name: "Samsung Galaxy S24", make: "Samsung", model: "Galaxy S24 128GB", colour: "Phantom Black" } },
    { id: "p-dev-2", category: "Handset contracts", name: "iPhone 15 Pro Max Contract", type: "Mobile", price: 999, onceOff: 499, term: 24, allocation: "iPhone 15 Pro Max 256GB, 20GB Data, 200 Mins", deviceSKU: "SKU-IP15-256", promo: true, dealId: "DEAL-IP15-24", deviceInfo: { name: "iPhone 15 Pro Max", make: "Apple", model: "iPhone 15 Pro Max 256GB", colour: "Natural Titanium" } },
    { id: "p-broad-1", category: "Exlight broadband plans", name: "Exlight Broadband 50Mbps", type: "Fixed Line", price: 499, onceOff: 0, term: 24, allocation: "50/25 Mbps Unlimited Fiber, Free Router & Install", promo: false, dealId: "DEAL-FIB-50" },
    { id: "p-broad-2", category: "Exlight broadband plans", name: "Exlight Ultra 100Mbps", type: "Fixed Line", price: 699, onceOff: 0, term: 24, allocation: "100/50 Mbps Unlimited Fiber, Free Router & Install", promo: false, dealId: "DEAL-FIB-100" }
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
      "SKU-IP15-256": { onHand: 0, reserved: 0, available: 0 },
      "SKU-A54-128": { onHand: 8, reserved: 2, available: 6 },
      "SKU-TAB-S9": { onHand: 2, reserved: 0, available: 2 },
      "SKU-IPAD-10": { onHand: 1, reserved: 0, available: 1 },
      "SKU-MAC-AIR": { onHand: 0, reserved: 0, available: 0 },
      "SKU-HP-PRO": { onHand: 6, reserved: 1, available: 5 }
    },
    "JHB-002": {
      "SKU-S24-128": { onHand: 0, reserved: 0, available: 0 },
      "SKU-IP15-256": { onHand: 4, reserved: 2, available: 2 },
      "SKU-A54-128": { onHand: 5, reserved: 1, available: 4 },
      "SKU-TAB-S9": { onHand: 0, reserved: 0, available: 0 },
      "SKU-IPAD-10": { onHand: 3, reserved: 0, available: 3 },
      "SKU-MAC-AIR": { onHand: 4, reserved: 0, available: 4 },
      "SKU-HP-PRO": { onHand: 1, reserved: 0, available: 1 }
    },
    "DBN-003": {
      "SKU-S24-128": { onHand: 3, reserved: 0, available: 3 },
      "SKU-IP15-256": { onHand: 2, reserved: 0, available: 2 },
      "SKU-A54-128": { onHand: 4, reserved: 0, available: 4 },
      "SKU-TAB-S9": { onHand: 5, reserved: 0, available: 5 },
      "SKU-IPAD-10": { onHand: 6, reserved: 0, available: 6 },
      "SKU-MAC-AIR": { onHand: 1, reserved: 0, available: 1 },
      "SKU-HP-PRO": { onHand: 4, reserved: 0, available: 4 }
    }
  }
};

const DEVICE_CATALOGUE = {
  // Phones
  "SKU-S24-128": { category: "Phones", name: "Samsung Galaxy S24", make: "Samsung", model: "Galaxy S24 128GB", colour: "Phantom Black" },
  "SKU-IP15-256": { category: "Phones", name: "iPhone 15 Pro Max", make: "Apple", model: "iPhone 15 Pro Max 256GB", colour: "Natural Titanium" },
  "SKU-A54-128": { category: "Phones", name: "Samsung Galaxy A54", make: "Samsung", model: "Galaxy A54 128GB", colour: "Awesome Graphite" },
  // Tablets
  "SKU-TAB-S9": { category: "Tablets", name: "Samsung Galaxy Tab S9", make: "Samsung", model: "Galaxy Tab S9 128GB", colour: "Graphite" },
  "SKU-IPAD-10": { category: "Tablets", name: "iPad 10th Gen", make: "Apple", model: "iPad 10.9-inch 64GB", colour: "Space Grey" },
  // Laptops
  "SKU-MAC-AIR": { category: "Laptops", name: "MacBook Air M2", make: "Apple", model: "MacBook Air 13\" 256GB", colour: "Midnight" },
  "SKU-HP-PRO": { category: "Laptops", name: "HP ProBook 450", make: "HP", model: "HP ProBook 450 G10", colour: "Pike Silver" }
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
    ricaStatus: "",
    simActivationNumber: "",
    paymentStatus: "Pending",
    posTxnRef: "",
    receiptNo: "",
    orderRef: "",
    draftId: ""
  },

  // Lists stored in localStorage for UAT durability
  stockRequests: [],
  ordersList: [],
  notifications: [],

  // Stepper Controller status
  currentStep: 1,
  productTerms: {},
  productColors: {},
  draftOrders: [],
  activeTrackingTab: "submitted",
  customerCreateStep: 1,
  newCustomerData: {
    personal: { idNum: "", idType: "SA ID", firstName: "", lastName: "", email: "", mobile: "", altContact: "", marketingConsent: false },
    employment: { status: "", type: "", occupation: "", employerName: "", employerContact: "", startDate: "" },
    address: { line1: "", street: "", suburb: "", city: "", postalCode: "" },
    financial: { grossIncome: "", netIncome: "", expenses: "" },
    banking: { bankName: "", branchCode: "", accountType: "", accountNumber: "", branchName: "", debitDate: "1st", debiCheckConsent: false, creditConsent: false }
  },

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

    const isSimProduct = prod.category === 'SIM-only' || prod.category === 'Handset contracts';
    const ricaStatus = isSimProduct ? (status === 'Fulfilled' ? 'Verified' : 'Pending') : 'N/A';
    const simActivationNumber = isSimProduct && status === 'Fulfilled' ? '892700000000' + (1000000 + i) : '';

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
      date: dateStr,
      ricaStatus: ricaStatus,
      simActivationNumber: simActivationNumber,
      isSimProduct: isSimProduct
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

  const savedDrafts = localStorage.getItem("telkom_draft_orders");
  if (savedDrafts) {
    APP_STATE.draftOrders = JSON.parse(savedDrafts);
  } else {
    APP_STATE.draftOrders = [];
  }

  restoreAuthSession();
}

function saveStockRequests() {
  localStorage.setItem("telkom_stock_requests", JSON.stringify(APP_STATE.stockRequests));
}

function saveOrders() {
  localStorage.setItem("telkom_orders", JSON.stringify(APP_STATE.ordersList));
}

function saveDraftOrders() {
  localStorage.setItem("telkom_draft_orders", JSON.stringify(APP_STATE.draftOrders));
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
  try { updateSessionBanner(); } catch(e) { console.warn('updateSessionBanner error:', e); }

  switch (route) {
    case "agent-dashboard":
      try { renderAgentDashboard(); } catch(e) { console.error('renderAgentDashboard error:', e); }
      break;
    case "manager-dashboard":
      try { renderManagerDashboard(); } catch(e) { console.error('renderManagerDashboard error:', e); }
      break;
    case "area-dashboard":
      try { renderAreaDashboard(); } catch(e) { console.error('renderAreaDashboard error:', e); }
      break;
    case "admin-dashboard":
      try { renderAdminDashboard(); } catch(e) { console.error('renderAdminDashboard error:', e); }
      break;
    case "customer-search":
      try {
        // Reset customer search inputs
        const searchErrEl = document.getElementById('search-error');
        if (searchErrEl) searchErrEl.style.display = 'none';
      } catch(e) { console.warn('customer-search reset error:', e); }
      break;
    case "customer-create":
      try { renderCustomerCreateStep(APP_STATE.customerCreateStep); } catch(e) { console.error('renderCustomerCreateStep error:', e); }
      break;
    case "customer-360":
      try { renderCustomer360(); } catch(e) { console.error('renderCustomer360 error:', e); }
      break;
    case "catalogue":
      try { renderCatalogue(); } catch(e) { console.error('renderCatalogue error:', e); }
      break;
    case "order-stepper":
      try { renderStepper(); } catch(e) { console.error('renderStepper error:', e); }
      break;
    case "payment":
      try { renderPaymentScreen(); } catch(e) { console.error('renderPaymentScreen error:', e); }
      break;
    case "confirmation":
      try { renderConfirmationReceipt(); } catch(e) { console.error('renderConfirmationReceipt error:', e); }
      break;
    case "order-tracking":
      try { renderOrderTracking(); } catch(e) { console.error('renderOrderTracking error:', e); }
      break;
    case "stock-requests":
      try { switchStockTab('inventory'); } catch(e) { console.error('switchStockTab error:', e); }
      break;
    case "reports":
      try { renderReports(); } catch(e) { console.error('renderReports error:', e); }
      break;
    case "record-logs":
      try { renderRecordLogs(); } catch(e) { console.error('renderRecordLogs error:', e); }
      break;
    case "notifications":
      try { renderNotificationsView(); } catch(e) { console.error('renderNotificationsView error:', e); }
      break;
  }
}

// Update Header Customer Session info
function updateSessionBanner() {
  const banner = document.getElementById('session-banner');
  if (!banner) return;
  if (APP_STATE.selectedCustomer) {
    banner.style.display = 'flex';
    const nameEl = document.getElementById('session-customer-name');
    const accEl = document.getElementById('session-account-no');
    if (nameEl) nameEl.innerText = APP_STATE.selectedCustomer.name;
    if (accEl) accEl.innerText = APP_STATE.selectedCustomer.accountNumber;
    
    // CIM interaction status
    const cimStatus = document.getElementById('session-cim-status');
    if (cimStatus) {
      if (APP_STATE.activeCIMInteraction) {
        cimStatus.innerText = `Active CIM Session: ${APP_STATE.activeCIMInteraction.type}`;
        cimStatus.className = "session-tag";
      } else {
        cimStatus.innerText = "No active CIM interaction";
        cimStatus.className = "session-tag warning";
      }
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
  if (!tbody) return;
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
  
  // Stock alert box
  const branchStock = MOCK_DB.stock[APP_STATE.currentUser.branch] || {};
  const stockAlertContainer = document.getElementById('agent-stock-alerts');
  if (!stockAlertContainer) return;
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

  // Saved order drafts for this agent
  const draftTbody = document.getElementById('agent-draft-orders-tbody');
  if (draftTbody) {
    draftTbody.innerHTML = '';
    const myDrafts = APP_STATE.draftOrders.filter(d => d.agentId === APP_STATE.currentUser.id);
    if (myDrafts.length === 0) {
      draftTbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 20px;">No saved drafts found.</td></tr>`;
    } else {
      myDrafts.forEach(d => {
        const prodName = d.cart && d.cart.product ? d.cart.product.name : 'No Product';
        const steps = getActiveStepsForProduct(d.cart.product);
        const stepIndex = steps.findIndex(s => s.id === d.currentStep);
        const stepLabel = stepIndex > -1 ? `Step ${stepIndex + 1}: ${steps[stepIndex].label}` : `Step ${d.currentStep}`;
        
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

// Render Store Manager Dashboard
function renderManagerDashboard() {
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

  // Active agents table
  const agentsBody = document.getElementById('mgr-agents-tbody');
  if (!agentsBody) return;
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
  const amTotalEl = document.getElementById('am-total-orders');
  if (amTotalEl) amTotalEl.innerText = APP_STATE.ordersList.length;
  const amPendingEl = document.getElementById('am-pending-approvals');
  if (amPendingEl) amPendingEl.innerText = APP_STATE.stockRequests.filter(r => r.status === 'Submitted').length;

  // Filter requests table to only display Submitted stock requests
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

// Render IT Admin Health Monitor
function renderAdminDashboard() {
  const integrationLogs = [
    { time: "15:38:12", api: "Amdocs Clarify CRM - customerQuery", status: "Success", latency: "142ms" },
    { time: "15:37:45", api: "Amdocs CIM - interactionLog", status: "Success", latency: "210ms" },
    { time: "15:36:02", api: "POS Terminal - txnInitiate", status: "Success", latency: "85ms" },
    { time: "15:35:14", api: "Transact - stockCheck", status: "Success", latency: "90ms" }
  ];

  const logTbody = document.getElementById('admin-logs-tbody');
  if (!logTbody) return;
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

  // Render documents panel
  renderCustomer360Documents();

  // Saved order drafts for this customer
  const custDraftsPanel = document.getElementById('c360-drafts-panel');
  const custDraftsContent = document.getElementById('c360-drafts-content');
  if (custDraftsPanel && custDraftsContent) {
    const custDrafts = APP_STATE.draftOrders.filter(d => d.customer && d.customer.accountNumber === cust.accountNumber);
    if (custDrafts.length > 0) {
      custDraftsPanel.style.display = 'block';
      custDraftsContent.innerHTML = custDrafts.map(d => {
        const prodName = d.cart && d.cart.product ? d.cart.product.name : 'No Product';
        const steps = getActiveStepsForProduct(d.cart.product);
        const stepIndex = steps.findIndex(s => s.id === d.currentStep);
        const stepLabel = stepIndex > -1 ? `Step ${stepIndex + 1}: ${steps[stepIndex].label}` : `Step ${d.currentStep}`;
        
        return `
          <div style="padding: 12px; border: 1px solid var(--border-color); border-radius: var(--radius-md); margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; background-color: var(--bg-card);">
            <div>
              <div style="font-weight: 700; color: var(--telkom-blue-dark);">${prodName} (${d.draftId})</div>
              <div style="font-size: 11px; color: var(--text-secondary); margin-top: 2px;">Saved at: ${stepLabel} | Date: ${d.date}</div>
            </div>
            <button class="btn btn-sm btn-primary" onclick="resumeDraftOrder('${d.draftId}')">Continue</button>
          </div>
        `;
      }).join('');
    } else {
      custDraftsPanel.style.display = 'none';
    }
  }

  // Pending orders (submitted but awaiting RICA / SIM activation / Payment)
  const pendingOrdersPanel = document.getElementById('c360-pending-orders-panel');
  const pendingOrdersContent = document.getElementById('c360-pending-orders-content');
  if (pendingOrdersPanel && pendingOrdersContent) {
    const customerPendingOrders = (APP_STATE.ordersList || []).filter(o => {
      if (o.accountNo !== cust.accountNumber) return false;
      const isRicaPending = o.isSimProduct && o.ricaStatus === 'Pending';
      const isActivationPending = o.isSimProduct && o.ricaStatus === 'Verified' && !o.simActivationNumber;
      const isPaymentPending = !o.payment.includes('Complete');
      return isRicaPending || isActivationPending || isPaymentPending;
    });

    if (customerPendingOrders.length > 0) {
      pendingOrdersPanel.style.display = 'block';
      pendingOrdersContent.innerHTML = customerPendingOrders.map(o => {
        let pendingStatus = '';
        let badgeClass = 'badge-warning';
        if (!o.payment.includes('Complete')) {
          pendingStatus = 'Payment Pending';
          badgeClass = 'badge-danger';
        } else if (o.isSimProduct && o.ricaStatus === 'Pending') {
          pendingStatus = 'RICA Pending';
          badgeClass = 'badge-warning';
        } else if (o.isSimProduct && o.ricaStatus === 'Verified' && !o.simActivationNumber) {
          pendingStatus = 'Activation Pending';
          badgeClass = 'badge-warning';
        }

        return `
          <div style="padding: 12px; border: 1px solid var(--border-color); border-radius: var(--radius-md); margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; background-color: var(--bg-card);">
            <div>
              <div style="font-weight: 700; color: var(--telkom-blue-dark);">${o.product} <span style="font-size: 11px; font-weight: 400; color: var(--text-muted);">(${o.orderRef})</span></div>
              <div style="font-size: 11px; color: var(--text-secondary); margin-top: 4px;">
                Date: ${o.date} | Store: ${o.store}
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <span class="badge ${badgeClass}">${pendingStatus}</span>
              <button class="btn btn-sm btn-secondary" onclick="viewOrderDetails('${o.orderRef}')">Details</button>
              <button class="btn btn-sm btn-primary" onclick="viewOrderDetails('${o.orderRef}')">Process</button>
            </div>
          </div>
        `;
      }).join('');
    } else {
      pendingOrdersPanel.style.display = 'none';
    }
  }
}

// Get selected term and calculated price for a product
function getProductTermAndPrice(p) {
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
function updateProductTermPrice(productId, newTerm) {
  APP_STATE.productTerms[productId] = parseInt(newTerm);
  renderCatalogue();
}

function updateProductColor(productId, color) {
  APP_STATE.productColors[productId] = color;
}

// Clear catalogue search text input
function clearCatalogueSearch() {
  const searchInput = document.getElementById('catalogue-search-input');
  if (searchInput) {
    searchInput.value = '';
  }
  renderCatalogue();
}

// Render Catalogue
function renderCatalogue() {
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

    listEl.innerHTML += `
      <div class="product-card">
        ${p.promo ? `<div class="product-badge-promo">PROMO</div>` : ''}
        <div class="product-info-area">
          <div class="product-category">${p.category} ${stockBadgeHtml}</div>
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

// Render Order Capture Wizard (Stepper steps)
function getActiveStepsForProduct(product) {
  const steps = [
    { id: 1, label: "Check Avail" },
    { id: 2, label: "Identify Cust" },
    { id: 3, label: "Confirm Details" },
    { id: 4, label: "Log CIM" },
    { id: 5, label: "Billing Selection" },
    { id: 6, label: "Credit Vetting" },
    { id: 7, label: "Connection Form" },
    { id: 8, label: "Consent Check" },
    { id: 9, label: "Supporting Docs" },
    { id: 10, label: "Pre-Sub Review" }
  ];
  
  if (product) {
    const needsGis = product.category === 'Exlight broadband plans';
    const needsStock = !!product.deviceSKU;
    if (!needsGis && !needsStock) {
      return steps.filter(s => s.id !== 1);
    }
  }
  return steps;
}

function getStepperStepTitle(stepId, defaultTitle) {
  const product = APP_STATE.cart.product;
  const steps = getActiveStepsForProduct(product);
  const index = steps.findIndex(s => s.id === stepId);
  const displayNum = index > -1 ? index + 1 : stepId;
  return `Step ${displayNum}: ${defaultTitle}`;
}

function renderStepperHeader() {
  const container = document.querySelector('#view-order-stepper .stepper-container');
  if (!container) return;
  
  const product = APP_STATE.cart.product;
  const steps = getActiveStepsForProduct(product);
  const currentIndex = steps.findIndex(s => s.id === APP_STATE.currentStep);
  
  container.innerHTML = steps.map((s, index) => {
    let statusClass = '';
    if (index < currentIndex) {
      statusClass = 'completed';
    } else if (index === currentIndex) {
      statusClass = 'active';
    }
    return `
      <div class="stepper-step ${statusClass}" data-step="${s.id}">
        <div class="step-icon">${index + 1}</div>
        <span class="step-label">${s.label}</span>
      </div>
    `;
  }).join('');
}

function renderStepper() {
  const stepContainer = document.getElementById('stepper-form-content');
  if (!stepContainer) return;
  stepContainer.innerHTML = '';
  
  const product = APP_STATE.cart.product;
  if (!product) {
    stepContainer.innerHTML = `<div style="padding: 40px; text-align: center; color: var(--text-secondary); font-size: 15px;">No product selected. Please select a product from the catalogue first.</div>`;
    return;
  }

  const steps = getActiveStepsForProduct(product);
  const stepExists = steps.some(s => s.id === APP_STATE.currentStep);
  if (!stepExists && steps.length > 0) {
    APP_STATE.currentStep = steps[0].id;
  }

  // Render step navigation numbers in UI
  renderStepperHeader();

  const nextBtn = document.getElementById('stepper-next-btn');
  if (nextBtn) {
    if (APP_STATE.currentStep === 10) {
      nextBtn.innerText = 'Create Contract';
    } else {
      nextBtn.innerText = 'Continue';
    }
    nextBtn.disabled = false; // default
  }

  const backBtn = document.getElementById('stepper-back-btn');
  if (backBtn) {
    backBtn.disabled = false;
  }

  switch (APP_STATE.currentStep) {
    case 1: // Coverage Check (Fixed Line) or Stock Check (Handset)
      if (product.category === 'Exlight broadband plans') {
        renderStepperCoverageCheck(stepContainer);
      } else if (product.deviceSKU) {
        renderStepperStockCheck(stepContainer);
      } else {
        stepContainer.innerHTML = `
          <h3 style="margin-bottom: 16px;">${getStepperStepTitle(1, "Availability Verification")}</h3>
          <div style="background-color: var(--success-light); border-left: 4px solid var(--success); padding: 16px; border-radius: var(--radius-md); color: var(--success); font-size: 13px; font-weight: 600;">
            Verification Skip: SIM-Only contracts do not require device stock allocation or GIS check. Please proceed.
          </div>
        `;
      }
      break;

    case 2: // Customer Search & Identification
      renderStepperCustomerSearch(stepContainer);
      break;

    case 3: // Customer Details & Product Specs confirmation
      stepContainer.innerHTML = `
        <h3 style="margin-bottom: 16px;">${getStepperStepTitle(3, "Confirm Customer & Product Details")}</h3>
        <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 24px;">Verify the customer profile and product details for this order.</p>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
          <div style="background-color: var(--bg-light); padding: 20px; border-radius: var(--radius-lg); border: 1px solid var(--border-color);">
            <h5 style="color: var(--telkom-blue-dark); margin-bottom: 12px; font-weight: 700;">CUSTOMER PROFILE</h5>
            <div style="margin-bottom: 10px;">
              <div style="font-size: 11px; color: var(--text-muted); font-weight: 600;">FULL NAME</div>
              <div style="font-weight: 700; color: var(--text-primary); font-size: 14px;">${APP_STATE.selectedCustomer.name}</div>
            </div>
            <div style="margin-bottom: 10px;">
              <div style="font-size: 11px; color: var(--text-muted); font-weight: 600;">CRM ACCOUNT NUMBER</div>
              <div style="font-weight: 700; color: var(--text-primary); font-size: 14px;">${APP_STATE.selectedCustomer.accountNumber}</div>
            </div>
            <div>
              <div style="font-size: 11px; color: var(--text-muted); font-weight: 600;">IDENTITY DOCUMENT / PASSPORT</div>
              <div style="font-weight: 700; color: var(--text-primary); font-size: 14px;">${APP_STATE.selectedCustomer.id ? maskID(APP_STATE.selectedCustomer.id) : maskPassport(APP_STATE.selectedCustomer.passport)}</div>
            </div>
          </div>
          
          <div style="background-color: var(--bg-light); padding: 20px; border-radius: var(--radius-lg); border: 1px solid var(--border-color);">
            <h5 style="color: var(--telkom-blue-dark); margin-bottom: 12px; font-weight: 700;">PRODUCT DETAILS</h5>
            <div style="margin-bottom: 10px;">
              <div style="font-size: 11px; color: var(--text-muted); font-weight: 600;">NAME</div>
              <div style="font-weight: 700; color: var(--text-primary); font-size: 14px;">${product.name}</div>
            </div>
            <div style="margin-bottom: 10px;">
              <div style="font-size: 11px; color: var(--text-muted); font-weight: 600;">ALLOCATION</div>
              <div style="font-weight: 700; color: var(--text-primary); font-size: 14px;">${product.allocation}</div>
            </div>
            <div style="margin-bottom: 10px;">
              <div style="font-size: 11px; color: var(--text-muted); font-weight: 600;">MONTHLY COST</div>
              <div style="font-weight: 700; color: var(--telkom-blue); font-size: 18px;">R${product.price} pm <span style="font-size:12px; color:var(--text-secondary); font-weight:normal;">(${product.term} Months)</span></div>
            </div>
            ${product.selectedColor ? `
            <div>
              <div style="font-size: 11px; color: var(--text-muted); font-weight: 600;">SELECTED COLOR</div>
              <div style="font-weight: 700; color: var(--text-primary); font-size: 14px;">${product.selectedColor}</div>
            </div>
            ` : ''}
          </div>
        </div>
      `;
      break;

    case 4: // CIM Interaction details
      stepContainer.innerHTML = `
        <h3 style="margin-bottom: 16px;">${getStepperStepTitle(4, "Log Visit Interaction in Amdocs CIM")}</h3>
        <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 20px;">Capture customer's reason of visit for compliance reporting.</p>
        
        <div class="form-group">
          <label class="form-label">Interaction Reason Type <span class="required">*</span></label>
          <select id="stepper-cim-type" class="form-control" onchange="updateCIMState()">
            <option value="New Order" ${APP_STATE.activeCIMInteraction.type === 'New Order' ? 'selected' : ''}>New Product Purchase</option>
            <option value="Account Query" ${APP_STATE.activeCIMInteraction.type === 'Account Query' ? 'selected' : ''}>Account Upgrade / Renewal</option>
            <option value="Stock Query" ${APP_STATE.activeCIMInteraction.type === 'Stock Query' ? 'selected' : ''}>Stock Verification</option>
          </select>
        </div>
        
        <div class="form-group" style="margin-top:16px;">
          <label class="form-label">Channel Location</label>
          <input type="text" class="form-control" value="Retail Store Session" disabled>
        </div>
        
        <div class="form-group" style="margin-top:16px;">
          <label class="form-label">CIM Session Notes <span class="required">*</span></label>
          <textarea id="stepper-cim-notes" class="form-control" rows="3" placeholder="Enter session notes (minimum 10 characters)..." oninput="updateCIMState()">${APP_STATE.activeCIMInteraction.notes || ''}</textarea>
          <div class="input-helper">Characters entered: <span id="cim-char-count">0</span>/500 (Min 10)</div>
          <div id="cim-notes-error" class="input-error-msg" style="display:none;">Notes must contain at least 10 characters before proceeding.</div>
        </div>
      `;
      updateCIMNotesCount();
      break;

    case 5: // Billing Account Selection [New]
      renderStepperBillingSelection(stepContainer);
      break;

    case 6: // Credit Vetting Check [New]
      renderStepperCreditVetting(stepContainer);
      break;

    case 7: // Connection details & forms
      renderStepperContractDetails(stepContainer, product);
      break;

    case 8: // Customer Consent form (was step 6)
      stepContainer.innerHTML = `
        <h3 style="margin-bottom: 16px;">${getStepperStepTitle(8, "Capture Customer Consent & Sign-Off")}</h3>
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

        <label class="checkbox-group" style="margin-top:12px;">
          <input type="checkbox" id="consent-marketing" checked>
          <span class="checkbox-label">Authorize marketing communications via SMS and Email (Optional).</span>
        </label>
      `;
      break;

    case 9: // Supporting Documents [New]
      renderStepperSupportingDocs(stepContainer);
      break;

    case 10: // Review & Validation Checklist (was step 7)
      renderStepperReviewChecklist(stepContainer);
      break;
  }
}

// -----------------------------------------
// STEP 5 BILLING ACCOUNT SELECTION RENDERER
// -----------------------------------------
function renderStepperBillingSelection(container) {
  const accounts = [
    { id: "ACC-7019", type: "Cheque", bank: "ABSA", number: "••••1234" },
    { id: "ACC-8891", type: "Savings", bank: "FNB", number: "••••5678" }
  ];

  if (!APP_STATE.cart.billingSelection) {
    APP_STATE.cart.billingSelection = {
      option: "existing",
      selectedId: accounts[0].id,
      newDebit: { bankName: "", branchCode: "", accountType: "", accountNumber: "", debiCheckConsent: false }
    };
  }

  const bill = APP_STATE.cart.billingSelection;
  const isNew = bill.option === 'new';

  let existingHtml = '';
  accounts.forEach(acc => {
    existingHtml += `
      <label class="radio-card" style="display:flex; align-items:center; gap:12px; padding:12px 16px; border: 1px solid var(--border-color); border-radius: var(--radius-md); margin-bottom:10px; cursor:pointer;">
        <input type="radio" name="existing-billing-acc" value="${acc.id}" ${bill.selectedId === acc.id ? 'checked' : ''} onchange="updateBillingSelection('selectedId', '${acc.id}')">
        <div>
          <strong style="color:var(--telkom-blue-dark);">${acc.bank} (${acc.type})</strong>
          <div style="font-size:12px; color:var(--text-secondary);">Account Code: ${acc.id} | Account No: ${acc.number}</div>
        </div>
      </label>
    `;
  });

  container.innerHTML = `
    <h3 style="margin-bottom: 16px;">${getStepperStepTitle(5, "Billing Account Selection")}</h3>
    <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 20px;">Choose whether to bill this postpaid subscription to an existing account or register new Debit Check details.</p>
    
    <div style="display:flex; gap:24px; margin-bottom:20px; background-color: var(--bg-light); padding: 12px; border-radius: var(--radius-md); border:1px solid var(--border-color);">
      <label class="checkbox-group" style="margin:0; align-items:center;">
        <input type="radio" name="billing-opt" value="existing" ${!isNew ? 'checked' : ''} onchange="updateBillingSelection('option', 'existing')">
        <span class="checkbox-label" style="font-weight:700;">Use Existing Billing Account</span>
      </label>
      <label class="checkbox-group" style="margin:0; align-items:center;">
        <input type="radio" name="billing-opt" value="new" ${isNew ? 'checked' : ''} onchange="updateBillingSelection('option', 'new')">
        <span class="checkbox-label" style="font-weight:700;">Add New Debit Check Details</span>
      </label>
    </div>

    <div id="billing-existing-panel" style="display: ${!isNew ? 'block' : 'none'};">
      <h5 style="margin-bottom: 12px; color: var(--telkom-blue-dark);">Active Customer Billing Profiles</h5>
      ${existingHtml}
    </div>

    <div id="billing-new-panel" style="display: ${isNew ? 'block' : 'none'};">
      <h5 style="margin-bottom: 16px; color: var(--telkom-blue-dark);">Register New DebiCheck Account</h5>
      
      <div class="form-row">
        <div class="form-group searchable-dropdown-container">
          <label class="form-label">Bank Name <span class="required">*</span></label>
          <input type="text" id="billing-new-bankname" class="form-control searchable-dropdown-input" placeholder="Select bank name..." value="${bill.newDebit.bankName || ''}" onclick="toggleBillingBankMenu(event)" readonly>
          <div id="billing-bank-dropdown-menu" class="searchable-dropdown-menu">
            <div class="searchable-dropdown-search-box">
              <input type="text" class="form-control" placeholder="Filter banks..." oninput="filterBillingBankOptions(this)" onclick="event.stopPropagation()">
            </div>
            <div id="billing-bank-dropdown-options-list">
              <!-- Banks loaded dynamically -->
            </div>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Branch Code <span class="required">*</span></label>
          <input type="text" id="billing-new-branchcode" class="form-control" placeholder="e.g. 632005" value="${bill.newDebit.branchCode || ''}" oninput="handleBillingNewInput('branchCode', this.value.replace(/[^0-9]/g, ''))">
        </div>
      </div>

      <div class="form-row" style="margin-top:16px;">
        <div class="form-group">
          <label class="form-label">Account Type <span class="required">*</span></label>
          <select id="billing-new-acctype" class="form-control" onchange="handleBillingNewInput('accountType', this.value)">
            <option value="">-- Select Type --</option>
            <option value="Cheque" ${bill.newDebit.accountType === 'Cheque' ? 'selected' : ''}>Cheque</option>
            <option value="Savings" ${bill.newDebit.accountType === 'Savings' ? 'selected' : ''}>Savings</option>
            <option value="Transmission" ${bill.newDebit.accountType === 'Transmission' ? 'selected' : ''}>Transmission</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Account Number <span class="required">*</span></label>
          <input type="text" id="billing-new-accnum" class="form-control" placeholder="Enter account number..." value="${bill.newDebit.accountNumber || ''}" oninput="handleBillingNewInput('accountNumber', this.value.replace(/[^0-9]/g, ''))">
        </div>
      </div>

      <label class="checkbox-group" style="margin-top:20px; align-items:flex-start;">
        <input type="checkbox" id="billing-new-consent" ${bill.newDebit.debiCheckConsent ? 'checked' : ''} onchange="handleBillingNewInput('debiCheckConsent', this.checked)" style="margin-top: 3px;">
        <span class="checkbox-label"><strong>Debit Collection Authorization (Required):</strong> I authorize Telkom and/or its approved debt collection partners to use DEBICHECK for collection of monthly fees.</span>
      </label>
    </div>
  `;
}

function updateBillingSelection(field, val) {
  if (!APP_STATE.cart.billingSelection) return;
  APP_STATE.cart.billingSelection[field] = val;
  renderStepper();
}

function handleBillingNewInput(field, val) {
  if (!APP_STATE.cart.billingSelection) return;
  APP_STATE.cart.billingSelection.newDebit[field] = val;
}

function saveBillingInputs() {
  const bill = APP_STATE.cart.billingSelection;
  if (!bill || bill.option === 'existing') return;
  
  const bank = document.getElementById('billing-new-bankname');
  const branch = document.getElementById('billing-new-branchcode');
  const type = document.getElementById('billing-new-acctype');
  const accNum = document.getElementById('billing-new-accnum');
  const consent = document.getElementById('billing-new-consent');

  if (bank) bill.newDebit.bankName = bank.value;
  if (branch) bill.newDebit.branchCode = branch.value.trim();
  if (type) bill.newDebit.accountType = type.value;
  if (accNum) bill.newDebit.accountNumber = accNum.value.trim();
  if (consent) bill.newDebit.debiCheckConsent = consent.checked;
}

function toggleBillingBankMenu(e) {
  e.stopPropagation();
  const menu = document.getElementById('billing-bank-dropdown-menu');
  if (menu) {
    menu.classList.toggle('show');
    filterBillingBankOptions(null);
  }
}

function filterBillingBankOptions(searchEl) {
  const listEl = document.getElementById('billing-bank-dropdown-options-list');
  if (!listEl) return;
  listEl.innerHTML = '';

  const searchVal = searchEl ? searchEl.value.trim().toLowerCase() : '';
  const filtered = BANK_OPTIONS.filter(b => b.toLowerCase().includes(searchVal));

  if (filtered.length === 0) {
    listEl.innerHTML = `<div style="padding: 10px 14px; font-size: 13px; color: var(--text-muted);">No banks found</div>`;
    return;
  }

  const selectedBank = APP_STATE.cart.billingSelection ? APP_STATE.cart.billingSelection.newDebit.bankName : '';

  filtered.forEach(b => {
    listEl.innerHTML += `
      <div class="searchable-dropdown-option ${selectedBank === b ? 'selected' : ''}" onclick="selectBillingBankOption('${b}')">
        ${b}
      </div>
    `;
  });
}

function selectBillingBankOption(bank) {
  if (APP_STATE.cart.billingSelection) {
    APP_STATE.cart.billingSelection.newDebit.bankName = bank;
  }
  const input = document.getElementById('billing-new-bankname');
  if (input) input.value = bank;

  const menu = document.getElementById('billing-bank-dropdown-menu');
  if (menu) menu.classList.remove('show');
}

// -----------------------------------------
// STEP 6 CREDIT VETTING OUTCOMES RENDERER
// -----------------------------------------
function renderStepperCreditVetting(container) {
  if (!APP_STATE.cart.creditVetting) {
    APP_STATE.cart.creditVetting = {
      outcome: "", 
      ran: false,
      depositPaid: false
    };
  }

  const cv = APP_STATE.cart.creditVetting;

  let outcomeHtml = '';
  if (cv.ran) {
    if (cv.outcome === 'Successful') {
      outcomeHtml = `
        <div class="vetting-panel vetting-success">
          <div class="vetting-panel-icon">✓</div>
          <div>
            <h4 style="margin: 0 0 4px 0; font-weight:700;">Credit Assessment Successful</h4>
            <p style="margin: 0; font-size: 13px;">Credit vetting completed successfully. Postpaid provisioning is authorized.</p>
          </div>
        </div>
      `;
    } else if (cv.outcome === 'Declined') {
      outcomeHtml = `
        <div class="vetting-panel vetting-danger">
          <div class="vetting-panel-icon">✗</div>
          <div>
            <h4 style="margin: 0 0 4px 0; font-weight:700;">Credit Assessment Declined</h4>
            <p style="margin: 0; font-size: 13px;">Credit vetting was unsuccessful. Postpaid deal cannot proceed.</p>
          </div>
        </div>
      `;
      // Disable Continue button
      const nextBtn = document.getElementById('stepper-next-btn');
      if (nextBtn) nextBtn.disabled = true;
    } else if (cv.outcome === 'Referral') {
      let depositActionHtml = '';
      if (!cv.depositPaid) {
        depositActionHtml = `
          <div style="margin-top: 12px;">
            <p style="font-size: 12px; margin-bottom: 8px; font-weight:500;"><strong>Business Rule:</strong> Customer is required to pay a R 250.00 deposit before continuing.</p>
            <button class="btn btn-sm btn-outline" onclick="payCreditVettingDeposit()">Record Deposit Payment (R250)</button>
          </div>
        `;
        // Disable Continue button until paid
        const nextBtn = document.getElementById('stepper-next-btn');
        if (nextBtn) nextBtn.disabled = true;
      } else {
        depositActionHtml = `
          <div style="margin-top: 12px; color: var(--success); font-weight: 600; font-size: 13px;">
            ✓ Refundable Deposit of R250.00 Paid (Receipt Ref: DEP-8902). Assessment lock cleared.
          </div>
        `;
      }

      outcomeHtml = `
        <div class="vetting-panel vetting-warning">
          <div class="vetting-panel-icon">!</div>
          <div>
            <h4 style="margin: 0 0 4px 0; font-weight:700;">Credit Assessment Referral</h4>
            <p style="margin: 0; font-size: 13px;">Additional review is required before proceeding.</p>
            ${depositActionHtml}
          </div>
        </div>
      `;
    }
  } else {
    outcomeHtml = `
      <div style="text-align: center; padding: 32px 0;">
        <p style="color: var(--text-secondary); margin-bottom: 20px;">Initiate credit assessment through NCR-approved databases.</p>
        
        <div style="display:flex; justify-content:center; align-items:center; gap:12px; margin-bottom: 24px;">
          <label style="font-size:12px; font-weight:600; color:var(--text-secondary);">Select Vetting Outcome (UAT Simulation):</label>
          <select id="mock-vetting-outcome" class="form-control" style="width:160px; height:32px; font-size:12px; padding:4px 8px;">
            <option value="Successful">Successful</option>
            <option value="Declined">Declined</option>
            <option value="Referral">Referral</option>
          </select>
        </div>

        <button class="btn btn-primary" onclick="runCreditVettingCheck()">Execute Credit Bureau Vetting</button>
      </div>
    `;
  }

  container.innerHTML = `
    <h3 style="margin-bottom: 16px;">${getStepperStepTitle(6, "Credit Vetting Check")}</h3>
    <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 24px;">National Credit Regulator (NCR) risk evaluation scoring.</p>
    ${outcomeHtml}
  `;
}

function runCreditVettingCheck() {
  const select = document.getElementById('mock-vetting-outcome');
  const val = select ? select.value : 'Successful';
  
  if (APP_STATE.cart.creditVetting) {
    APP_STATE.cart.creditVetting.outcome = val;
    APP_STATE.cart.creditVetting.ran = true;
    APP_STATE.cart.creditVetting.depositPaid = false;
  }
  
  showToast(`Credit Bureau check finished: ${val}`, "success");
  renderStepper();
}

function payCreditVettingDeposit() {
  if (APP_STATE.cart.creditVetting) {
    APP_STATE.cart.creditVetting.depositPaid = true;
  }
  showToast("Refundable deposit payment captured.", "success");
  renderStepper();
}

// -----------------------------------------
// STEP 9 SUPPORTING DOCUMENTS RENDERER
// -----------------------------------------
function renderStepperSupportingDocs(container) {
  const customer = APP_STATE.selectedCustomer;
  const idNum = customer.id || customer.passport || "Not declared";

  if (!APP_STATE.cart.supportingDocs) {
    APP_STATE.cart.supportingDocs = {
      option: "now",
      uploads: { idDoc: null, bankStatements: null, proofAddress: null, companyReg: null },
      progress: { idDoc: 0, bankStatements: 0, proofAddress: 0, companyReg: 0 }
    };
  }

  // Sync customer profile documents if present
  const custDocs = customer.documents || {};
  const sd = APP_STATE.cart.supportingDocs;
  Object.keys(sd.uploads).forEach(key => {
    if (!sd.uploads[key] && custDocs[key]) {
      sd.uploads[key] = { name: custDocs[key].name, size: custDocs[key].size };
      sd.progress[key] = 100;
    }
  });

  const isNow = sd.option === 'now';

  let filesHtml = '';
  if (isNow) {
    const docTypes = [
      { key: "idDoc", label: "Identity Document (ID Card/Passport)" },
      { key: "bankStatements", label: "Last 3 Months Bank Statements" },
      { key: "proofAddress", label: "Proof of Address (Utility Bill)" },
      { key: "companyReg", label: "Company Registration Document (CIPC)" }
    ];

    docTypes.forEach(doc => {
      const file = sd.uploads[doc.key];
      const prog = sd.progress[doc.key];

      let innerUploadHtml = '';
      if (file) {
        if (prog < 100) {
          innerUploadHtml = `
            <div style="width:100%;">
              <div style="font-size:12px; color:var(--text-secondary); margin-bottom:6px; display:flex; justify-content:space-between;">
                <span>Uploading: <strong>${file.name}</strong></span>
                <span>${prog}%</span>
              </div>
              <div class="upload-progress-container" style="display:block;">
                <div class="upload-progress-bar" id="progress-bar-${doc.key}" style="width:${prog}%;"></div>
              </div>
            </div>
          `;
        } else {
          innerUploadHtml = `
            <div class="uploaded-file-info" style="width:100%;">
              <div class="uploaded-file-details">
                <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>${file.name} (${file.size})</span>
              </div>
              <div class="uploaded-file-actions">
                <button class="btn btn-sm btn-secondary" onclick="triggerBrowseDoc('${doc.key}')">Replace</button>
                <button class="btn btn-sm btn-danger" onclick="removeUploadedDoc('${doc.key}')">Remove</button>
              </div>
            </div>
          `;
        }
      } else {
        innerUploadHtml = `
          <div class="upload-drag-zone" id="drag-zone-${doc.key}" 
               ondragover="handleDocDragOver(event, '${doc.key}')" 
               ondragleave="handleDocDragLeave(event, '${doc.key}')" 
               ondrop="handleDocDrop(event, '${doc.key}')"
               onclick="triggerBrowseDoc('${doc.key}')">
            <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="margin-bottom:4px;"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            <span style="font-size:13px; color:var(--text-primary); font-weight:600;">Drag and drop file here, or <span style="color:var(--telkom-blue); text-decoration:underline;">Browse</span></span>
            <span style="font-size:11px; color:var(--text-muted);">PDF, JPG, PNG up to 5 MB</span>
          </div>
          <input type="file" id="file-input-${doc.key}" style="display:none;" onchange="handleDocFileSelected(event, '${doc.key}')" accept=".pdf,.jpg,.png">
        `;
      }

      filesHtml += `
        <div class="file-upload-card">
          <label class="form-label" style="margin-bottom:8px; font-weight:700; color:var(--telkom-blue-dark);">${doc.label}</label>
          ${innerUploadHtml}
        </div>
      `;
    });
  }

  container.innerHTML = `
    <h3 style="margin-bottom: 16px;">${getStepperStepTitle(9, "Supporting Documents")}</h3>
    <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 20px;">Upload legally required supporting customer documents to verify identity and banking details.</p>
    
    <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom:20px; background-color: var(--bg-light); padding:16px; border-radius: var(--radius-md); border:1px solid var(--border-color);">
      <div>
        <div style="font-size: 11px; color: var(--text-muted); font-weight:700;">PRE-FILLED ID NUMBER</div>
        <input type="text" class="form-control" value="${idNum}" disabled style="background-color:transparent; font-weight:700; border:none; padding:4px 0;">
      </div>
      <div>
        <div style="font-size: 11px; color: var(--text-muted); font-weight:700;">UPLOAD SETTINGS</div>
        <div style="display:flex; gap:16px; margin-top:8px;">
          <label class="checkbox-group" style="margin:0; align-items:center;">
            <input type="radio" name="docs-opt" value="now" ${isNow ? 'checked' : ''} onchange="updateDocsOption('now')">
            <span class="checkbox-label" style="font-weight:600;">Upload documents now</span>
          </label>
          <label class="checkbox-group" style="margin:0; align-items:center;">
            <input type="radio" name="docs-opt" value="later" ${!isNow ? 'checked' : ''} onchange="updateDocsOption('later')">
            <span class="checkbox-label" style="font-weight:600;">Skip for now and upload later</span>
          </label>
        </div>
      </div>
    </div>

    <div id="docs-upload-fields" style="display: ${isNow ? 'block' : 'none'};">
      ${filesHtml}
    </div>

    <div id="docs-skip-message" style="display: ${!isNow ? 'block' : 'none'}; background-color: var(--info-light); border-left:4px solid var(--telkom-blue); padding:16px; border-radius: var(--radius-md); font-size:13px; font-weight:600; color:var(--text-secondary);">
      No problem. You can upload your documents anytime from your Profile or provide them to a call centre agent later.
    </div>
  `;
}

function updateDocsOption(opt) {
  if (APP_STATE.cart.supportingDocs) {
    APP_STATE.cart.supportingDocs.option = opt;
  }
  renderStepper();
}

function saveDocsOptionInput() {
  const radio = document.querySelector('input[name="docs-opt"]:checked');
  if (radio && APP_STATE.cart.supportingDocs) {
    APP_STATE.cart.supportingDocs.option = radio.value;
  }
}

function triggerBrowseDoc(key) {
  const input = document.getElementById(`file-input-${key}`);
  if (input) input.click();
}

function handleDocFileSelected(e, key) {
  const file = e.target.files[0];
  if (file) {
    simulateDocUpload(key, file.name);
  }
}

function removeUploadedDoc(key) {
  if (APP_STATE.cart.supportingDocs) {
    APP_STATE.cart.supportingDocs.uploads[key] = null;
    APP_STATE.cart.supportingDocs.progress[key] = 0;
  }
  const cust = APP_STATE.selectedCustomer;
  if (cust && cust.documents && cust.documents[key]) {
    delete cust.documents[key];
  }
  renderStepper();
}

// Drag & Drop Handlers
function handleDocDragOver(e, key) {
  e.preventDefault();
  const zone = document.getElementById(`drag-zone-${key}`);
  if (zone) zone.classList.add('dragover');
}

function handleDocDragLeave(e, key) {
  e.preventDefault();
  const zone = document.getElementById(`drag-zone-${key}`);
  if (zone) zone.classList.remove('dragover');
}

function handleDocDrop(e, key) {
  e.preventDefault();
  const zone = document.getElementById(`drag-zone-${key}`);
  if (zone) zone.classList.remove('dragover');

  const file = e.dataTransfer.files[0];
  if (file) {
    // Validate type
    const ext = file.name.split('.').pop().toLowerCase();
    if (ext === 'pdf' || ext === 'jpg' || ext === 'png') {
      simulateDocUpload(key, file.name);
    } else {
      showToast("Invalid format: PDF, JPG, PNG only.", "danger");
    }
  }
}

function simulateDocUpload(docType, fileName) {
  if (!APP_STATE.cart.supportingDocs) return;
  APP_STATE.cart.supportingDocs.progress[docType] = 1;
  APP_STATE.cart.supportingDocs.uploads[docType] = { name: fileName, size: "1.2 MB" };
  renderStepper(); 

  let current = 0;
  const interval = setInterval(() => {
    current += 10;
    if (current > 100) {
      current = 100;
      clearInterval(interval);
      
      // Save to customer profile as well!
      const cust = APP_STATE.selectedCustomer;
      if (cust) {
        cust.documents = cust.documents || {};
        cust.documents[docType] = { name: fileName, size: "1.2 MB" };
      }
      
      showToast(`${docType.replace(/([A-Z])/g, ' $1')} uploaded successfully.`, "success");
    }
    if (APP_STATE.cart.supportingDocs) {
      APP_STATE.cart.supportingDocs.progress[docType] = current;
    }
    
    // Update progress bar element in DOM
    const pBar = document.getElementById(`progress-bar-${docType}`);
    if (pBar) pBar.style.width = `${current}%`;
    
    if (current === 100) {
      setTimeout(() => {
        renderStepper(); 
      }, 200);
    }
  }, 100);
}

// Bind to window for click triggers
window.runCreditVettingCheck = runCreditVettingCheck;
window.payCreditVettingDeposit = payCreditVettingDeposit;
window.updateBillingSelection = updateBillingSelection;
window.handleBillingNewInput = handleBillingNewInput;
window.toggleBillingBankMenu = toggleBillingBankMenu;
window.filterBillingBankOptions = filterBillingBankOptions;
window.selectBillingBankOption = selectBillingBankOption;
window.updateDocsOption = updateDocsOption;
window.triggerBrowseDoc = triggerBrowseDoc;
window.handleDocFileSelected = handleDocFileSelected;
window.removeUploadedDoc = removeUploadedDoc;
window.handleDocDragOver = handleDocDragOver;
window.handleDocDragLeave = handleDocDragLeave;
window.handleDocDrop = handleDocDrop;


// Stepper Step 4: GIS Coverage Check
function renderStepperCoverageCheck(container) {
  // Verify GIS API status outage override
  if (!APP_STATE.systemHealth.gis) {
    container.innerHTML = `
      <h3 style="margin-bottom: 16px;">${getStepperStepTitle(1, "GIS Fixed-Line Coverage Checker")}</h3>
      <div style="background-color: var(--danger-light); border-left: 4px solid var(--danger); padding: 16px; border-radius: var(--radius-md); color: var(--danger); font-size: 13px; font-weight: 600; margin-bottom: 20px;">
        GIS API Offline: Connection to Telkom Coverage Checker timed out.
      </div>
      <button class="btn btn-primary" onclick="simulateGisApiRetry()">Retry Connection</button>
    `;
    return;
  }

  const isCustSelected = !!APP_STATE.selectedCustomer;
  const addr = isCustSelected ? APP_STATE.selectedCustomer.address : (APP_STATE.cart.tempCoverageAddress || "");
  const coverageData = MOCK_DB.gis[addr] || { ref: "GIS-AUTO-" + Math.floor(1000 + Math.random() * 9000), coords: "-26.15, 28.05" };
  
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

  let addressInputHtml = '';
  if (isCustSelected) {
    addressInputHtml = `
      <div class="form-group">
        <label class="form-label">Service Address</label>
        <input type="text" class="form-control" value="${addr}" disabled>
      </div>
    `;
  } else {
    addressInputHtml = `
      <div class="form-group">
        <label class="form-label">Service Address <span class="required">*</span></label>
        <input type="text" id="stepper-temp-address" class="form-control" value="${addr}" placeholder="Enter street address, suburb, city..." oninput="updateTempAddress(this.value)">
      </div>
    `;
  }

  container.innerHTML = `
    <h3 style="margin-bottom: 16px;">${getStepperStepTitle(1, "GIS Fixed-Line Coverage Checker")}</h3>
    <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 20px;">Address check must return 'Coverage available' for Exlight products.</p>
    
    <div class="gis-container">
      <div>
        ${addressInputHtml}
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

// Update selected color for device in the order stepper
function updateStepperColor(color) {
  const p = APP_STATE.cart.product;
  if (p) {
    p.selectedColor = color;
    APP_STATE.productColors[p.id] = color;
    showToast(`Handset color updated to ${color}`, "info");
  }
}

// Stepper Step 1: Transact Stock check
function renderStepperStockCheck(container) {
  // Verify Transact API status outage
  if (!APP_STATE.systemHealth.transact) {
    container.innerHTML = `
      <h3 style="margin-bottom: 16px;">${getStepperStepTitle(1, "Transact Device Stock Allocation")}</h3>
      <div style="background-color: var(--danger-light); border-left: 4px solid var(--danger); padding: 16px; border-radius: var(--radius-md); color: var(--danger); font-size: 13px; font-weight: 600; margin-bottom: 20px;">
        Transact Stock API Offline: Database communication failure.
      </div>
      <button class="btn btn-primary" onclick="simulateStockApiRetry()">Retry Connection</button>
    `;
    return;
  }

  const p = APP_STATE.cart.product;
  const stockInfo = MOCK_DB.stock[APP_STATE.currentUser.branch]?.[p.deviceSKU] || { onHand: 0, reserved: 0, available: 0 };

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

  let colorSelectorHtml = '';
  if (p.deviceInfo) {
    let colors = [];
    if (p.deviceInfo.name.includes("Samsung Galaxy S24")) {
      colors = ["Phantom Black", "Marble Gray", "Cobalt Violet", "Amber Yellow"];
    } else if (p.deviceInfo.name.includes("iPhone 15 Pro Max")) {
      colors = ["Natural Titanium", "Blue Titanium", "White Titanium", "Black Titanium"];
    } else {
      colors = [p.deviceInfo.colour || "Standard Color", "Ceramic White", "Charcoal Gray", "Sleek Silver"];
    }
    
    const selectedColor = p.selectedColor || APP_STATE.productColors[p.id] || colors[0];
    p.selectedColor = selectedColor;

    colorSelectorHtml = `
      <div class="form-group" style="margin-bottom: 20px; max-width: 350px;">
        <label class="form-label" style="font-weight: 600;">Select Available Color Variant</label>
        <select id="stepper-color-select" class="form-control" onchange="updateStepperColor(this.value)">
          ${colors.map(c => `<option value="${c}" ${c === selectedColor ? 'selected' : ''}>${c}</option>`).join('')}
        </select>
      </div>
    `;
  }

  container.innerHTML = `
    <h3 style="margin-bottom: 16px;">${getStepperStepTitle(1, "Transact Device Stock Allocation")}</h3>
    <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 20px;">Verify device stock levels in POS branch prior to contract binding.</p>
    
    <div class="layout-2col">
      <div>
        ${colorSelectorHtml}
        
        <div class="table-container" style="margin-bottom: 20px;">
          <table class="custom-table">
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
        </div>
        
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

function renderStepperContractDetails(container, product) {
  if (product.category === 'Exlight broadband plans') {
    // Fixed Line Exlight Details Form
    container.innerHTML = `
      <h3 style="margin-bottom: 16px;">${getStepperStepTitle(7, "Capture Installation & Delivery Contact Details")}</h3>
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
      <h3 style="margin-bottom: 16px;">${getStepperStepTitle(7, "Capture Mobile Line & SIM Configuration")}</h3>
      <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 20px;">Configure SIM connection parameters for cell provisioning.</p>
      
      <div class="form-group">
        <label class="form-label">SIM Type Option <span class="required">*</span></label>
        <select id="mobile-sim-type" class="form-control" onchange="updateContractDetailsState()">
          <option value="eSIM" ${APP_STATE.cart.contractDetails.simType === 'eSIM' ? 'selected' : ''}>eSIM (Instant QR Provisioning)</option>
          <option value="Physical SIM" ${APP_STATE.cart.contractDetails.simType === 'Physical SIM' ? 'selected' : ''}>Standard Physical Nano SIM</option>
        </select>
      </div>

      <div class="form-group" style="margin-top: 12px;">
        <label class="form-label">Mobile Number Routing <span class="required">*</span></label>
        <select id="mobile-number-opt" class="form-control" onchange="updateContractDetailsState()">
          <option value="New Number" ${APP_STATE.cart.contractDetails.numberOption === 'New Number' ? 'selected' : ''}>Provision New Telkom MSISDN</option>
          <option value="Port In" ${APP_STATE.cart.contractDetails.numberOption === 'Port In' ? 'selected' : ''}>Port existing number from CellC/Vodacom/MTN</option>
        </select>
      </div>

      <div class="form-group" id="port-in-wrapper" style="display: ${APP_STATE.cart.contractDetails.numberOption === 'Port In' ? 'block' : 'none'}; margin-top: 12px;">
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

  // Step 5: Billing Selection Validation
  let billingValid = false;
  if (APP_STATE.cart.billingSelection) {
    const bill = APP_STATE.cart.billingSelection;
    if (bill.option === 'existing' && bill.selectedId) {
      billingValid = true;
    } else if (bill.option === 'new') {
      const nd = bill.newDebit;
      if (nd.bankName && nd.branchCode && nd.accountType && nd.accountNumber && nd.debiCheckConsent) {
        billingValid = true;
      }
    }
  }

  // Step 6: Credit Vetting Validation
  let vettingValid = false;
  if (APP_STATE.cart.creditVetting && APP_STATE.cart.creditVetting.ran) {
    const cv = APP_STATE.cart.creditVetting;
    if (cv.outcome === 'Successful') {
      vettingValid = true;
    } else if (cv.outcome === 'Referral' && cv.depositPaid) {
      vettingValid = true;
    }
  }

  // Step 7: Connection details validation
  const detailsValid = APP_STATE.cart.product && APP_STATE.cart.product.category === 'Exlight broadband plans' ?
    (!!APP_STATE.cart.contractDetails.installationContactName && !!APP_STATE.cart.contractDetails.installationContactPhone) : true;
  
  // Step 8: Consent validation
  const consentValid = APP_STATE.cart.consent;

  // Step 9: Supporting documents validation
  let docsValid = false;
  if (APP_STATE.cart.supportingDocs) {
    const sd = APP_STATE.cart.supportingDocs;
    if (sd.option === 'later') {
      docsValid = true; // Skipped for now
    } else if (sd.option === 'now') {
      const uploads = sd.uploads;
      if (uploads.idDoc && uploads.bankStatements && uploads.proofAddress && uploads.companyReg) {
        docsValid = true;
      }
    }
  }

  const roleValid = APP_STATE.currentUser.role === 'agent' || APP_STATE.currentUser.role === 'manager';

  // Overall check (RICA and SIM Activation bypassed in stepper)
  const submissionAllowed = customerValid && interactionValid && productValid && coverageValid && stockValid && billingValid && vettingValid && detailsValid && consentValid && docsValid && roleValid;

  container.innerHTML = `
    <h3 style="margin-bottom: 16px;">${getStepperStepTitle(10, "Final Validation Checklist")}</h3>
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

      <div class="checklist-item ${billingValid ? 'pass' : 'fail'}">
        <div class="checklist-info">
          <div class="checklist-status-icon ${billingValid ? 'pass' : 'fail'}">${billingValid ? '✓' : '✗'}</div>
          <div><strong>Billing Account Selection</strong> - Valid existing profile or new DebiCheck setup.</div>
        </div>
        <span class="badge ${billingValid ? 'badge-success' : 'badge-danger'}">${billingValid ? 'Pass' : 'Fail'}</span>
      </div>

      <div class="checklist-item ${vettingValid ? 'pass' : 'fail'}">
        <div class="checklist-info">
          <div class="checklist-status-icon ${vettingValid ? 'pass' : 'fail'}">${vettingValid ? '✓' : '✗'}</div>
          <div><strong>Credit Bureau Risk Vetting Check</strong> - Experian credit check outcome clean.</div>
        </div>
        <span class="badge ${vettingValid ? 'badge-success' : 'badge-danger'}">${vettingValid ? 'Pass' : 'Fail'}</span>
      </div>

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

      <div class="checklist-item ${docsValid ? 'pass' : 'fail'}">
        <div class="checklist-info">
          <div class="checklist-status-icon ${docsValid ? 'pass' : 'fail'}">${docsValid ? '✓' : '✗'}</div>
          <div><strong>Supporting Documents</strong> - Required files uploaded or deferred.</div>
        </div>
        <span class="badge ${docsValid ? 'badge-success' : 'badge-danger'}">${docsValid ? 'Pass' : 'Fail'}</span>
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
  const container = document.getElementById('tracking-table-container');
  if (!container) return;

  const tab = APP_STATE.activeTrackingTab || 'submitted';

  // Calculate Submitted count (using current search filter & permissions)
  let submittedFilteredForCount = APP_STATE.ordersList || [];
  const searchValForCount = document.getElementById('tracking-search-ref') ? document.getElementById('tracking-search-ref').value.trim() : '';
  if (searchValForCount) {
    submittedFilteredForCount = submittedFilteredForCount.filter(o => o.orderRef.toLowerCase().includes(searchValForCount.toLowerCase()) || o.customerName.toLowerCase().includes(searchValForCount.toLowerCase()));
  }
  const viewAllNetworkForCount = document.getElementById('tracking-view-all') && document.getElementById('tracking-view-all').checked;
  if (!viewAllNetworkForCount) {
    if (APP_STATE.currentUser.role === 'agent') {
      submittedFilteredForCount = submittedFilteredForCount.filter(o => o.agent === APP_STATE.currentUser.id);
    } else if (APP_STATE.currentUser.role === 'manager') {
      submittedFilteredForCount = submittedFilteredForCount.filter(o => o.store === APP_STATE.currentUser.branch);
    }
  }
  const submittedCount = submittedFilteredForCount.length;

  // Calculate Pending count: drafts + submitted orders awaiting RICA/SIM/Payment
  let pendingDrafts = APP_STATE.draftOrders || [];
  if (APP_STATE.currentUser.role === 'agent') {
    pendingDrafts = pendingDrafts.filter(d => d.agentId === APP_STATE.currentUser.id);
  } else if (APP_STATE.currentUser.role === 'manager') {
    pendingDrafts = pendingDrafts.filter(d => d.branch === APP_STATE.currentUser.branch);
  }

  let pendingSubmitted = (APP_STATE.ordersList || []).filter(o => {
    const isRicaPending = o.isSimProduct && o.ricaStatus === 'Pending';
    const isActivationPending = o.isSimProduct && o.ricaStatus === 'Verified' && !o.simActivationNumber;
    const isPaymentPending = !o.payment.includes('Complete');
    return isRicaPending || isActivationPending || isPaymentPending;
  });
  if (APP_STATE.currentUser.role === 'agent') {
    pendingSubmitted = pendingSubmitted.filter(o => o.agent === APP_STATE.currentUser.id);
  } else if (APP_STATE.currentUser.role === 'manager') {
    pendingSubmitted = pendingSubmitted.filter(o => o.store === APP_STATE.currentUser.branch);
  }

  const pendingCount = pendingDrafts.length + pendingSubmitted.length;

  // Render dynamic badges on the tab buttons
  const submittedTabBtn = document.getElementById('tracking-tab-btn-submitted');
  const pendingTabBtn = document.getElementById('tracking-tab-btn-pending');
  if (submittedTabBtn) {
    submittedTabBtn.innerHTML = `Submitted Orders <span style="margin-left: 6px; display: inline-block; padding: 2px 6px; font-size: 11px; border-radius: 10px; background-color: ${tab === 'submitted' ? 'var(--telkom-blue-dark)' : 'var(--border-color)'}; color: ${tab === 'submitted' ? 'var(--text-white)' : 'var(--text-secondary)'}; font-weight: 600;">${submittedCount}</span>`;
  }
  if (pendingTabBtn) {
    pendingTabBtn.innerHTML = `Pending Orders <span style="margin-left: 6px; display: inline-block; padding: 2px 6px; font-size: 11px; border-radius: 10px; background-color: ${tab === 'pending' ? 'var(--telkom-blue-dark)' : 'var(--border-color)'}; color: ${tab === 'pending' ? 'var(--text-white)' : 'var(--text-secondary)'}; font-weight: 600;">${pendingCount}</span>`;
  }

  if (tab === 'submitted') {
    let filtered = APP_STATE.ordersList || [];

    // Search input filters
    const searchVal = document.getElementById('tracking-search-ref') ? document.getElementById('tracking-search-ref').value.trim() : '';
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

    let rowsHtml = '';
    if (filtered.length === 0) {
      rowsHtml = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 20px;">No tracking orders found.</td></tr>`;
    } else {
      filtered.forEach(o => {
        rowsHtml += `
          <tr>
            <td><strong>${o.orderRef}</strong></td>
            <td>${o.customerName}</td>
            <td>${o.product}</td>
            <td><code>${o.store}</code></td>
            <td>${o.date}</td>
            <td><span class="badge ${o.status === 'Fulfilled' || o.status === 'Active' ? 'badge-success' : (o.status === 'Cancelled' ? 'badge-danger' : 'badge-warning')}">${o.status}</span></td>
            <td>
              <button class="btn btn-sm btn-secondary" onclick="viewOrderDetails('${o.orderRef}')" style="margin-right: 5px;">Details</button>
              <button class="btn btn-sm btn-primary" onclick="downloadOrderReceipt('${o.orderRef}')" style="background-color: var(--telkom-blue); border-color: var(--telkom-blue);">Receipt</button>
            </td>
          </tr>
        `;
      });
    }

    container.innerHTML = `
      <table class="custom-table">
        <thead>
          <tr>
            <th>Order Reference</th>
            <th>Customer Name</th>
            <th>Selected Product</th>
            <th>Store Node</th>
            <th>Submission Date</th>
            <th>OMS Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody id="tracking-tbody">
          ${rowsHtml}
        </tbody>
      </table>
    `;
  } else {
    // pending tab: drafts + submitted-but-incomplete orders
    let draftRows = APP_STATE.draftOrders || [];
    if (APP_STATE.currentUser.role === 'agent') {
      draftRows = draftRows.filter(d => d.agentId === APP_STATE.currentUser.id);
    } else if (APP_STATE.currentUser.role === 'manager') {
      draftRows = draftRows.filter(d => d.branch === APP_STATE.currentUser.branch);
    }

    let submittedPendingRows = (APP_STATE.ordersList || []).filter(o => {
      const isRicaPending = o.isSimProduct && o.ricaStatus === 'Pending';
      const isActivationPending = o.isSimProduct && o.ricaStatus === 'Verified' && !o.simActivationNumber;
      const isPaymentPending = !o.payment.includes('Complete');
      return isRicaPending || isActivationPending || isPaymentPending;
    });
    if (APP_STATE.currentUser.role === 'agent') {
      submittedPendingRows = submittedPendingRows.filter(o => o.agent === APP_STATE.currentUser.id);
    } else if (APP_STATE.currentUser.role === 'manager') {
      submittedPendingRows = submittedPendingRows.filter(o => o.store === APP_STATE.currentUser.branch);
    }

    let rowsHtml = '';
    const totalPending = draftRows.length + submittedPendingRows.length;

    if (totalPending === 0) {
      rowsHtml = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 20px;">No pending orders found.</td></tr>`;
    } else {
      // Render submitted-but-incomplete orders first
      submittedPendingRows.forEach(o => {
        let pendingStatus = '';
        if (!o.payment.includes('Complete')) {
          pendingStatus = 'Payment Pending';
        } else if (o.isSimProduct && o.ricaStatus === 'Pending') {
          pendingStatus = 'RICA Pending';
        } else if (o.isSimProduct && o.ricaStatus === 'Verified' && !o.simActivationNumber) {
          pendingStatus = 'Activation Pending';
        }

        rowsHtml += `
          <tr>
            <td><strong>${o.orderRef}</strong></td>
            <td>${o.customerName}</td>
            <td>${o.product}</td>
            <td><code>${o.store}</code></td>
            <td>${o.date}</td>
            <td><span class="badge badge-warning">${pendingStatus}</span></td>
            <td>
              <button class="btn btn-sm btn-secondary" onclick="viewOrderDetails('${o.orderRef}')" style="margin-right: 5px;">Details</button>
              <button class="btn btn-sm btn-primary" onclick="viewOrderDetails('${o.orderRef}')">Process</button>
            </td>
          </tr>
        `;
      });

      // Then render draft orders
      draftRows.forEach(d => {
        const prodName = d.cart && d.cart.product ? d.cart.product.name : 'No Product';
        const steps = getActiveStepsForProduct(d.cart.product);
        const stepIndex = steps.findIndex(s => s.id === d.currentStep);
        const stepLabel = stepIndex > -1 ? `Step ${stepIndex + 1}: ${steps[stepIndex].label}` : `Step ${d.currentStep}`;

        rowsHtml += `
          <tr>
            <td><strong>${d.draftId}</strong></td>
            <td>${d.customer ? d.customer.name : '<span style="color: var(--text-muted);">No Customer Linked</span>'}</td>
            <td>${prodName}</td>
            <td><code>${d.branch}</code></td>
            <td>${d.date}</td>
            <td><span class="badge badge-secondary">${stepLabel}</span></td>
            <td>
              <button class="btn btn-sm btn-primary" onclick="resumeDraftOrder('${d.draftId}')">Continue</button>
            </td>
          </tr>
        `;
      });
    }

    container.innerHTML = `
      <table class="custom-table">
        <thead>
          <tr>
            <th>Reference</th>
            <th>Customer Name</th>
            <th>Selected Product</th>
            <th>Store Node</th>
            <th>Date</th>
            <th>Pending Status</th>
            <th style="width: 150px;">Action</th>
          </tr>
        </thead>
        <tbody id="pending-tracking-tbody">
          ${rowsHtml}
        </tbody>
      </table>
    `;
  }
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
  const countEl = document.getElementById('report-table-count');
  if (countEl) countEl.innerText = `Showing ${filtered.length} entries`;

  // Set Generation Timestamp
  const now = new Date();
  const timestampStr = now.toISOString().replace('T', ' ').substring(0, 19) + " SAST";
  const tsEl = document.getElementById('report-generation-timestamp');
  if (tsEl) tsEl.innerText = `Generated: ${timestampStr} by ${APP_STATE.currentUser.id} (${APP_STATE.currentUser.name})`;
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
          <img src="Images/Logo_new.svg" alt="Telkom Retail" style="height: 40px; object-fit: contain; display: block; margin-bottom: 4px;">
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
          <button class="btn btn-sm btn-outline" onclick="openNewCustomerWizard()">Add New Customer</button>
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
  if (APP_STATE.selectedCustomer && APP_STATE.selectedCustomer.status === 'Suspended') {
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

    // Get customized term and price
    const { term, price } = getProductTermAndPrice(p);
    const selectedColor = APP_STATE.productColors[prodId] || (p.deviceInfo ? p.deviceInfo.colour : "");
    APP_STATE.cart.product = {
      ...p,
      price: price,
      term: term,
      selectedColor: selectedColor
    };

    if (!APP_STATE.selectedCustomer) {
      APP_STATE.activeCIMInteraction = {
        type: "New Order",
        channel: "Retail store",
        storeId: APP_STATE.currentUser.branch,
        agentId: APP_STATE.currentUser.id,
        timestamp: new Date().toISOString(),
        notes: ""
      };
    }

    const activeSteps = getActiveStepsForProduct(APP_STATE.cart.product);
    APP_STATE.currentStep = activeSteps.length > 0 ? activeSteps[0].id : 1;
    switchRoute('order-stepper');
  }
}

function handleStepperBack() {
  const product = APP_STATE.cart.product;
  const steps = getActiveStepsForProduct(product);
  const currentIndex = steps.findIndex(s => s.id === APP_STATE.currentStep);
  if (currentIndex > 0) {
    APP_STATE.currentStep = steps[currentIndex - 1].id;
    renderStepper();
  } else {
    switchRoute('catalogue');
  }
}

function handleStepperNext() {
  const step = APP_STATE.currentStep;

  // Validate Step 1: Check Availability
  if (step === 1) {
    if (APP_STATE.cart.product.category === 'Exlight broadband plans') {
      const tempAddrInput = document.getElementById('stepper-temp-address');
      if (tempAddrInput) {
        APP_STATE.cart.tempCoverageAddress = tempAddrInput.value.trim();
      }
      const addr = APP_STATE.selectedCustomer ? APP_STATE.selectedCustomer.address : APP_STATE.cart.tempCoverageAddress;
      if (!addr || addr.trim().length === 0) {
        showToast("Please enter a service address.", "warning");
        return;
      }
      if (APP_STATE.cart.gisStatus !== 'Coverage available') {
        showToast("GIS check must return 'Coverage available' to proceed.", "warning");
        return;
      }
    } else if (APP_STATE.cart.product.deviceSKU) {
      if (!APP_STATE.cart.stockChecked || APP_STATE.cart.stockStatus !== 'In Stock') {
        showToast("Device stock must be locked and verified available to proceed.", "warning");
        return;
      }
    }
  }

  // Validate Step 2: Customer Identification
  if (step === 2) {
    if (!APP_STATE.selectedCustomer) {
      showToast("Please search and select a customer profile to link to this order.", "warning");
      return;
    }
  }

  // Validate Step 4: Log CIM
  if (step === 4) {
    if (!APP_STATE.activeCIMInteraction || APP_STATE.activeCIMInteraction.notes.trim().length < 10) {
      document.getElementById('cim-notes-error').style.display = 'block';
      return;
    }
  }

  // Validate Step 5: Billing Selection
  if (step === 5) {
    saveBillingInputs();
    const bill = APP_STATE.cart.billingSelection;
    if (bill && bill.option === 'new') {
      const nd = bill.newDebit;
      if (!nd.bankName || !nd.branchCode || !nd.accountType || !nd.accountNumber) {
        showToast("Please fill in all mandatory debit details (*)", "warning");
        return;
      }
      if (!nd.debiCheckConsent) {
        showToast("DebiCheck collection authorization checkbox is required.", "warning");
        return;
      }
    }
  }

  // Validate Step 6: Credit Vetting
  if (step === 6) {
    const cv = APP_STATE.cart.creditVetting;
    if (!cv || !cv.ran) {
      showToast("Please run Credit Bureau vetting assessment first.", "warning");
      return;
    }
    if (cv.outcome === 'Declined') {
      showToast("Blocked: Credit vetting was declined. Cannot proceed with order.", "danger");
      return;
    }
    if (cv.outcome === 'Referral' && !cv.depositPaid) {
      showToast("Action Required: Customer must pay deposit to resolve referral block.", "warning");
      return;
    }
  }

  // Validate Step 7: Connection details (was Step 5)
  if (step === 7) {
    const p = APP_STATE.cart.product;
    if (p.category === 'Exlight broadband plans') {
      const name = document.getElementById('billing-contact-name').value.trim();
      const phone = document.getElementById('billing-contact-phone').value.trim();
      if (!name || !phone) {
        showToast("Please complete all mandatory installation contact fields.", "warning");
        return;
      }
      APP_STATE.cart.contractDetails.installationContactName = name;
      APP_STATE.cart.contractDetails.installationContactPhone = phone;
      APP_STATE.cart.contractDetails.preferredInstallationDate = document.getElementById('billing-install-date').value;
    } else {
      const simType = document.getElementById('mobile-sim-type').value;
      const numOpt = document.getElementById('mobile-number-opt').value;
      APP_STATE.cart.contractDetails.simType = simType;
      APP_STATE.cart.contractDetails.numberOption = numOpt;
      
      if (numOpt === 'Port In') {
        const portNum = document.getElementById('mobile-port-number').value.trim();
        if (!portNum) {
          showToast("Port in phone number must be supplied.", "warning");
          return;
        }
        APP_STATE.cart.contractDetails.portInNumber = portNum;
      }

      // RICA Check removed from checkout stepper (relocated to post-submission workflow)
    }
  }

  // Validate Step 8: Consent Check (was Step 6)
  if (step === 8) {
    if (!APP_STATE.cart.consent) {
      showToast("NCA Credit Check consent checkboxes must be acknowledged.", "warning");
      return;
    }
  }

  // Validate Step 9: Supporting Documents
  if (step === 9) {
    saveDocsOptionInput();
    const sd = APP_STATE.cart.supportingDocs;
    if (sd && sd.option === 'now') {
      const uploads = sd.uploads;
      if (!uploads.idDoc || !uploads.bankStatements || !uploads.proofAddress || !uploads.companyReg) {
        showToast("Please upload all four required supporting documents or select 'Skip for now'.", "warning");
        return;
      }
    }
  }

  // Final Step 10: Submission (was Step 7)
  if (step === 10) {
    submitOrderToOMS();
    return;
  }

  const product = APP_STATE.cart.product;
  const steps = getActiveStepsForProduct(product);
  const currentIndex = steps.findIndex(s => s.id === step);

  if (currentIndex > -1 && currentIndex < steps.length - 1) {
    APP_STATE.currentStep = steps[currentIndex + 1].id;
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
  const isCustSelected = !!APP_STATE.selectedCustomer;
  const addr = isCustSelected ? APP_STATE.selectedCustomer.address : (APP_STATE.cart.tempCoverageAddress || "").trim();
  
  if (!addr) {
    showToast("Please enter a service address first.", "warning");
    return;
  }
  
  let coverageData = MOCK_DB.gis[addr];
  if (!coverageData) {
    const matchingKey = Object.keys(MOCK_DB.gis).find(key => key.toLowerCase().includes(addr.toLowerCase()) || addr.toLowerCase().includes(key.toLowerCase()));
    if (matchingKey) {
      coverageData = MOCK_DB.gis[matchingKey];
    }
  }

  if (coverageData) {
    APP_STATE.cart.gisStatus = coverageData.status;
    APP_STATE.cart.gisRef = coverageData.ref;
  } else {
    APP_STATE.cart.gisStatus = "Coverage available";
    APP_STATE.cart.gisRef = "GIS-AUTO-" + Math.floor(1000 + Math.random() * 9000);
  }
  
  showToast(`GIS Check: ${APP_STATE.cart.gisStatus}`, APP_STATE.cart.gisStatus === 'Coverage available' ? 'success' : (APP_STATE.cart.gisStatus === 'Coverage inconclusive' ? 'warning' : 'danger'));
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
  const stock = MOCK_DB.stock[APP_STATE.currentUser.branch]?.[p.deviceSKU];
  
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
  
  const payBtn = document.getElementById('pay-init-btn');
  if (payBtn) {
    payBtn.disabled = false;
    payBtn.innerHTML = `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> Verify transaction`;
  }
}

function handlePOSPaymentTrigger() {
  const payBtn = document.getElementById('pay-init-btn');
  if (!payBtn) return;

  const outcomeSelect = document.getElementById('mock-payment-outcome');
  const outcome = outcomeSelect ? outcomeSelect.value : 'Successful';

  // Verify POS terminal health outage override
  if (!APP_STATE.systemHealth.pos || outcome === 'Timeout') {
    payBtn.disabled = true;
    payBtn.innerText = "Connecting terminal...";
    setTimeout(() => {
      showToast("POS terminal handshake timed out. Payment initiation failed.", "danger");
      payBtn.disabled = false;
      payBtn.innerHTML = `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> Verify transaction`;
    }, 300);
    return;
  }

  if (outcome === 'Declined') {
    payBtn.disabled = true;
    payBtn.innerText = "Connecting terminal...";
    setTimeout(() => {
      payBtn.innerText = "Verifying transaction...";
      setTimeout(() => {
        showToast("POS transaction was declined by bank.", "danger");
        payBtn.disabled = false;
        payBtn.innerHTML = `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> Verify transaction`;
      }, 300);
    }, 300);
    return;
  }

  // POS Loading simulate (Successful path)
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
      const isSimProduct = APP_STATE.cart.product && (APP_STATE.cart.product.category === 'SIM-only' || APP_STATE.cart.product.category === 'Handset contracts');
      const newOrder = {
        orderRef: APP_STATE.cart.orderRef,
        customerName: APP_STATE.selectedCustomer.name,
        accountNo: APP_STATE.selectedCustomer.accountNumber,
        product: APP_STATE.cart.product.name,
        selectedColor: APP_STATE.cart.product.selectedColor || "",
        type: APP_STATE.cart.product.type,
        store: APP_STATE.currentUser.branch,
        agent: APP_STATE.currentUser.id,
        status: "Submitted",
        payment: "Payment Complete",
        date: new Date().toISOString().replace('T', ' ').slice(0, 19),
        ricaStatus: isSimProduct ? "Pending" : "N/A",
        simActivationNumber: "",
        isSimProduct: isSimProduct
      };

      if (APP_STATE.cart.draftId) {
        APP_STATE.draftOrders = APP_STATE.draftOrders.filter(d => d.draftId !== APP_STATE.cart.draftId);
        saveDraftOrders();
      }

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
    }, 300);
  }, 300);
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
  
  const productText = APP_STATE.cart.product.name + (APP_STATE.cart.product.selectedColor ? ` (${APP_STATE.cart.product.selectedColor})` : '');
  document.getElementById('conf-product').innerText = productText;
  
  document.getElementById('conf-term').innerText = `${APP_STATE.cart.product.term} Months`;
  document.getElementById('conf-price').innerText = `R${APP_STATE.cart.product.price} /mo`;
  document.getElementById('conf-onceoff').innerText = `R${APP_STATE.cart.product.onceOff}`;
  document.getElementById('conf-total').innerText = `R${APP_STATE.cart.product.price + APP_STATE.cart.product.onceOff}`;

  const isSimProduct = APP_STATE.cart.product && (APP_STATE.cart.product.category === 'SIM-only' || APP_STATE.cart.product.category === 'Handset contracts');
  const panel = document.getElementById('confirmation-rica-activation-panel');
  if (isSimProduct && panel) {
    panel.style.display = 'block';
    renderConfirmationRicaActivation();
  } else if (panel) {
    panel.style.display = 'none';
  }

  // Render customer contract agreement
  renderConfirmationContract(APP_STATE.cart.orderRef);
}

function renderConfirmationContract(orderRef) {
  const panel = document.getElementById('confirmation-contract-panel');
  if (!panel) return;

  const product = APP_STATE.cart.product;
  const customer = APP_STATE.selectedCustomer;
  if (!product || !customer) {
    panel.style.display = 'none';
    return;
  }

  // Determine billing debit info
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

  panel.style.display = 'block';
  panel.innerHTML = `
    <div class="contract-header" style="text-align: center; border-bottom: 2px solid var(--telkom-blue); padding-bottom: 16px; margin-bottom: 20px;">
      <h3 style="color: var(--telkom-blue-dark); font-weight: 800; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">Customer Contract Agreement</h3>
      <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px; font-weight: 700;">TELKOM SA SOC LTD - MOBILE & BROADBAND SERVICES</div>
    </div>

    <div style="font-size: 13px; color: var(--text-primary); line-height: 1.6;">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; background-color: var(--bg-light); padding: 14px; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
        <div>
          <div style="font-size: 10px; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Agreement Reference</div>
          <strong style="color: var(--telkom-blue-dark);">${orderRef}</strong>
        </div>
        <div>
          <div style="font-size: 10px; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Agreement Date</div>
          <strong>${new Date().toLocaleDateString()}</strong>
        </div>
      </div>

      <h5 style="color: var(--telkom-blue-dark); font-weight: 700; border-bottom: 1px solid var(--border-color); padding-bottom: 6px; margin-bottom: 10px; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px;">1. Subscriber Personal Details</h5>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; font-size: 12px;">
        <div><strong>Full Name:</strong> ${customer.name}</div>
        <div><strong>SA ID / Passport:</strong> ${customer.id ? maskID(customer.id) : maskPassport(customer.passport)}</div>
        <div><strong>Contact Number:</strong> ${customer.mobile || 'N/A'}</div>
        <div><strong>Email Address:</strong> ${customer.email || 'N/A'}</div>
        <div style="grid-column: 1 / -1;"><strong>Billing Address:</strong> ${customer.address || 'N/A'}</div>
      </div>

      <h5 style="color: var(--telkom-blue-dark); font-weight: 700; border-bottom: 1px solid var(--border-color); padding-bottom: 6px; margin-bottom: 10px; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px;">2. Contract Product Specifications</h5>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; font-size: 12px;">
        <div><strong>Allocated Product:</strong> ${product.name}</div>
        <div><strong>Contract Term:</strong> ${product.term} Months</div>
        <div><strong>Monthly Cost Plan:</strong> R${product.price} /mo</div>
        <div><strong>Once-Off Charge:</strong> R${product.onceOff}</div>
        <div style="grid-column: 1 / -1;"><strong>Product Allocation:</strong> ${product.allocation}</div>
      </div>

      <h5 style="color: var(--telkom-blue-dark); font-weight: 700; border-bottom: 1px solid var(--border-color); padding-bottom: 6px; margin-bottom: 10px; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px;">3. Debit Order Billing Authorization</h5>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; font-size: 12px;">
        <div><strong>Payment Bank:</strong> ${bankName}</div>
        <div><strong>Account Number:</strong> ${accountNo}</div>
        <div><strong>Debit Collection Date:</strong> 1st of every month</div>
        <div><strong>DebiCheck Consent:</strong> Authorised (NCA Compliant)</div>
      </div>

      <h5 style="color: var(--telkom-blue-dark); font-weight: 700; border-bottom: 1px solid var(--border-color); padding-bottom: 6px; margin-bottom: 10px; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px;">4. Digital Signatures & Compliance</h5>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; font-size: 11px;">
        <div style="border: 1px dashed var(--border-color); padding: 10px; border-radius: var(--radius-sm); background-color: var(--bg-light); text-align: center;">
          <div style="font-size: 9px; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Agent Signature (Piet van Zyl)</div>
          <div style="font-family: 'Georgia', serif; font-style: italic; font-size: 15px; margin: 4px 0; color: var(--telkom-blue-dark);">Piet van Zyl</div>
          <div style="font-size: 9px; color: var(--text-muted);">IP: 192.168.10.150 (Verified)</div>
        </div>
        <div style="border: 1px dashed var(--border-color); padding: 10px; border-radius: var(--radius-sm); background-color: var(--bg-light); text-align: center;">
          <div style="font-size: 9px; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Subscriber Signature (Digital)</div>
          <div style="font-family: 'Georgia', serif; font-style: italic; font-size: 15px; margin: 4px 0; color: var(--telkom-blue-dark);">${customer.name}</div>
          <div style="font-size: 9px; color: var(--text-muted);">NCA/POPIA Consent Checked</div>
        </div>
      </div>

      <div style="display: flex; gap: 16px; justify-content: center; border-top: 1px solid var(--border-color); padding-top: 18px; margin-top: 16px;">
        <button class="btn btn-outline" onclick="emailContractToCustomer('${orderRef}')" style="flex: 1; justify-content: center; height: 38px; border-color: var(--telkom-blue); color: var(--telkom-blue);">
          <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="margin-right: 6px;"><path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
          Email Contract
        </button>
        <button class="btn btn-primary" onclick="printContractDocument('${orderRef}')" style="flex: 1; justify-content: center; height: 38px; background-color: var(--telkom-blue-dark); border-color: var(--telkom-blue-dark); color: var(--text-white);">
          <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="margin-right: 6px;"><path stroke-linecap="round" stroke-linejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
          Print Contract
        </button>
      </div>
    </div>
  `;
}

function emailContractToCustomer(orderRef) {
  const customer = APP_STATE.selectedCustomer;
  if (!customer || !customer.email) {
    showToast("Error: No customer email address found.", "danger");
    return;
  }
  showToast(`Contract Agreement emailed successfully to ${customer.email}!`, "success");
}

function printContractDocument(orderRef) {
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

// ==========================================
// 10. STOCK REQUEST WORKFLOW
// ==========================================

function initiateStockRequest(sku, productName) {
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

function handleStockRequestSubmit(e) {
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
  document.getElementById('view-order-status').className = `badge ${order.status === 'Fulfilled' || order.status === 'Active' ? 'badge-success' : 'badge-warning'}`;
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
  if (isSim && ricaPanel) {
    ricaPanel.style.display = 'block';
    renderOrderActivationWorkflow(order, ricaPanel, true);
  } else if (ricaPanel) {
    ricaPanel.style.display = 'none';
  }

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

// Login view switcher controllers
function showLoginForm() {
  document.getElementById('login-form').style.display = 'block';
  document.getElementById('forgot-password-form').style.display = 'none';
  document.getElementById('otp-verify-form').style.display = 'none';
  document.getElementById('password-reset-form').style.display = 'none';
  
  document.querySelector('.login-card-title').innerText = "Welcome Back";
  document.querySelector('.login-card-sub').innerText = "Sign in to your workspace";
  document.getElementById('login-form-error').style.display = 'none';
}

function showForgotPasswordForm() {
  document.getElementById('login-form').style.display = 'none';
  document.getElementById('forgot-password-form').style.display = 'block';
  document.getElementById('otp-verify-form').style.display = 'none';
  document.getElementById('password-reset-form').style.display = 'none';
  
  document.querySelector('.login-card-title').innerText = "Forgot Password";
  document.querySelector('.login-card-sub').innerText = "Enter your username and email";
  document.getElementById('login-form-error').style.display = 'none';
}

function showOtpForm() {
  document.getElementById('login-form').style.display = 'none';
  document.getElementById('forgot-password-form').style.display = 'none';
  document.getElementById('otp-verify-form').style.display = 'block';
  document.getElementById('password-reset-form').style.display = 'none';
  
  document.querySelector('.login-card-title').innerText = "Verify Email";
  document.querySelector('.login-card-sub').innerText = "Enter the verification code";
  document.getElementById('login-form-error').style.display = 'none';
}

function showResetPasswordForm() {
  document.getElementById('login-form').style.display = 'none';
  document.getElementById('forgot-password-form').style.display = 'none';
  document.getElementById('otp-verify-form').style.display = 'none';
  document.getElementById('password-reset-form').style.display = 'block';
  
  document.querySelector('.login-card-title').innerText = "Reset Password";
  document.querySelector('.login-card-sub').innerText = "Create a new secure password";
  document.getElementById('login-form-error').style.display = 'none';
}

// Forgot Password Flow Handlers
function handleForgotPasswordSubmit(e) {
  e.preventDefault();
  const username = document.getElementById('forgot-username').value.trim().toUpperCase();
  const email = document.getElementById('forgot-email').value.trim();
  const errorBanner = document.getElementById('login-form-error');
  
  if (!DEMO_LOGIN_CREDENTIALS[username]) {
    errorBanner.innerHTML = '<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg><span>User ID not found.</span>';
    errorBanner.style.display = 'block';
    return;
  }
  
  // Generate random 4-digit OTP
  const mockOtp = Math.floor(1000 + Math.random() * 9000).toString();
  window.CURRENT_MOCK_OTP = mockOtp;
  window.CURRENT_RESET_USER = username;
  
  showToast(`OTP sent to ${email}: ${mockOtp}`, "success");
  showOtpForm();
}

function handleOtpSubmit(e) {
  e.preventDefault();
  const otpInput = document.getElementById('forgot-otp').value.trim();
  const errorBanner = document.getElementById('login-form-error');
  
  if (otpInput !== window.CURRENT_MOCK_OTP) {
    errorBanner.innerHTML = '<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg><span>Invalid OTP code. Please try again.</span>';
    errorBanner.style.display = 'block';
    return;
  }
  
  showToast("OTP verified successfully.", "success");
  showResetPasswordForm();
}

function handlePasswordResetSubmit(e) {
  e.preventDefault();
  const newPass = document.getElementById('new-password').value;
  const confirmPass = document.getElementById('confirm-password').value;
  const errorBanner = document.getElementById('login-form-error');
  
  if (newPass.length < 6) {
    errorBanner.innerHTML = '<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg><span>Password must be at least 6 characters.</span>';
    errorBanner.style.display = 'block';
    return;
  }
  
  if (newPass !== confirmPass) {
    errorBanner.innerHTML = '<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg><span>Passwords do not match.</span>';
    errorBanner.style.display = 'block';
    return;
  }
  
  // Mutate demo credentials
  DEMO_LOGIN_CREDENTIALS[window.CURRENT_RESET_USER].password = newPass;
  showToast("Password reset successfully. Please log in.", "success");
  
  // Clear inputs
  document.getElementById('forgot-username').value = "";
  document.getElementById('forgot-email').value = "";
  document.getElementById('forgot-otp').value = "";
  document.getElementById('new-password').value = "";
  document.getElementById('confirm-password').value = "";
  
  showLoginForm();
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

// Load local mock database states
loadStateFromStorage();

// Set navbar and route
updateSidebarMenuOptions();
switchRoute(APP_STATE.isAuthenticated ? APP_STATE.activeRoute : 'login');

// Update badge notifications count
updateNotificationsBadge();

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

// Bind all missing handlers called from inline HTML attributes to the window object
window.identifyCustomer = identifyCustomer;
window.selectProductForStepper = selectProductForStepper;
window.openEditCustomerModal = openEditCustomerModal;
window.openCreateCustomerModal = openCreateCustomerModal;
window.openApprovalModal = openApprovalModal;
window.toggleSelectAllExportFormats = toggleSelectAllExportFormats;
window.downloadOrderReceipt = downloadOrderReceipt;
window.markNotificationRead = markNotificationRead;
window.simulateGisAddressCheck = simulateGisAddressCheck;
window.forceCoverageAcceptance = forceCoverageAcceptance;
window.simulateGisApiRetry = simulateGisApiRetry;
window.simulateStockCheckAction = simulateStockCheckAction;
window.simulateStockApiRetry = simulateStockApiRetry;
window.notifyStoreManagerForStock = notifyStoreManagerForStock;
window.updateCIMState = updateCIMState;
window.updateContractDetailsState = updateContractDetailsState;
window.toggleConsent = toggleConsent;
window.handleUatOutageToggle = handleUatOutageToggle;
window.toggleDeclineReasonArea = toggleDeclineReasonArea;
window.renderCatalogue = renderCatalogue;
window.handleReportFilterChange = handleReportFilterChange;
window.handleLogFilterChange = handleLogFilterChange;


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


// ==========================================
// NEW CUSTOMER CREATION FLOW WIZARD
// ==========================================

const BANK_OPTIONS = [
  "ABSA",
  "African Bank",
  "Bank Windhoek",
  "Bidvest Bank",
  "Capitec Bank Limited",
  "Discovery Bank",
  "FNB",
  "Investec Bank Limited",
  "Nedbank",
  "Standard Bank",
  "Tyme Bank"
];

const BRANCH_LOOKUP = {
  "ABSA": { "632005": "Pretoria Central", "632006": "Johannesburg Main" },
  "FNB": { "250655": "Randburg", "250117": "Pretoria North" },
  "Capitec Bank Limited": { "470010": "Stellenbosch" },
  "Standard Bank": { "051001": "Simmonds Street" },
  "Nedbank": { "198765": "Sandton" }
};

const MOCK_EMPLOYER_ADDRESSES = [
  { line1: "15 Alice Lane", street: "Alice Lane", suburb: "Sandton", city: "Johannesburg", postalCode: "2196" },
  { line1: "24 Garsfontein Rd", street: "Garsfontein Rd", suburb: "Pretoria East", city: "Pretoria", postalCode: "0081" },
  { line1: "100 Main Rd", street: "Main Rd", suburb: "Rosebank", city: "Cape Town", postalCode: "7700" },
  { line1: "45 Anton Lembede St", street: "Anton Lembede St", suburb: "Durban Central", city: "Durban", postalCode: "4001" }
];

APP_STATE.employmentAccordionOpen = false;
APP_STATE.accountNumberVisible = false;

// Triggered from header CTA or "No Customer Found" search CTA
function openNewCustomerWizard() {
  APP_STATE.customerCreateStep = 1;
  APP_STATE.employmentAccordionOpen = false;
  APP_STATE.accountNumberVisible = false;
  
  // Clear/Initialize customer state structure
  APP_STATE.newCustomerData = {
    personal: { idNum: "", idType: "SA ID", firstName: "", lastName: "", email: "", mobile: "", altContact: "", marketingConsent: false },
    employment: { status: "", type: "", occupation: "", employerName: "", employerContact: "", startDate: "" },
    address: { line1: "", street: "", suburb: "", city: "", postalCode: "" },
    financial: { grossIncome: "", netIncome: "", expenses: "" },
    banking: { bankName: "", branchCode: "", accountType: "", accountNumber: "", branchName: "", debitDate: "1st", debiCheckConsent: false, creditConsent: false }
  };

  // Pre-fill ID info from search input if possible
  const searchInputVal = document.getElementById('search-input') ? document.getElementById('search-input').value.trim() : '';
  const searchType = document.getElementById('search-type') ? document.getElementById('search-type').value : 'id';
  
  if (searchInputVal) {
    if (searchType === 'id' && /^\d{13}$/.test(searchInputVal)) {
      APP_STATE.newCustomerData.personal.idNum = searchInputVal;
      APP_STATE.newCustomerData.personal.idType = "SA ID";
    } else if (searchType === 'passport' || (searchType === 'id' && searchInputVal.length >= 6)) {
      APP_STATE.newCustomerData.personal.idNum = searchInputVal;
      APP_STATE.newCustomerData.personal.idType = "Passport";
    }
  }

  switchRoute('customer-create');
}

// Render the Wizard Steps
function renderCustomerCreateStep(step) {
  APP_STATE.customerCreateStep = step;
  
  // Highlight stepper numbers in UI
  document.querySelectorAll('#cust-create-stepper .stepper-step').forEach((el, index) => {
    el.className = 'stepper-step';
    const sNum = index + 1;
    if (sNum < step) {
      el.classList.add('completed');
    } else if (sNum === step) {
      el.classList.add('active');
    }
  });

  const stepContainer = document.getElementById('customer-create-content');
  if (!stepContainer) return;
  stepContainer.innerHTML = '';

  const personal = APP_STATE.newCustomerData.personal;
  const employment = APP_STATE.newCustomerData.employment;
  const address = APP_STATE.newCustomerData.address;
  const financial = APP_STATE.newCustomerData.financial;
  const banking = APP_STATE.newCustomerData.banking;

  // Render navigation buttons based on step
  const backBtn = document.getElementById('cust-back-btn');
  const nextBtn = document.getElementById('cust-next-btn');

  if (backBtn) backBtn.style.visibility = 'visible';
  if (nextBtn) {
    nextBtn.innerText = step === 6 ? 'Create Profile & Proceed' : 'Continue';
    nextBtn.className = 'btn btn-primary';
  }

  switch (step) {
    case 1:
      stepContainer.innerHTML = `
        <h3 style="margin-bottom: 16px;">Step 1: Capture Personal & Identity Information</h3>
        <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 24px;">Enter primary customer details. Standard validations will run against the CRM database.</p>
        
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Identification Type <span class="required">*</span></label>
            <select id="new-cust-idtype" class="form-control" onchange="saveCustomerCreateInputs()">
              <option value="SA ID" ${personal.idType === 'SA ID' ? 'selected' : ''}>South African Identity Document</option>
              <option value="Passport" ${personal.idType === 'Passport' ? 'selected' : ''}>International Passport</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">ID Number / Passport Number <span class="required">*</span></label>
            <input type="text" id="new-cust-idnum" class="form-control" placeholder="Enter ID/Passport number..." value="${personal.idNum || ''}" oninput="saveCustomerCreateInputs()">
          </div>
        </div>

        <div class="form-row" style="margin-top: 16px;">
          <div class="form-group">
            <label class="form-label">First Name <span class="required">*</span></label>
            <input type="text" id="new-cust-firstname" class="form-control" placeholder="Enter first name..." value="${personal.firstName || ''}" oninput="saveCustomerCreateInputs()">
          </div>
          <div class="form-group">
            <label class="form-label">Last Name <span class="required">*</span></label>
            <input type="text" id="new-cust-lastname" class="form-control" placeholder="Enter last name..." value="${personal.lastName || ''}" oninput="saveCustomerCreateInputs()">
          </div>
        </div>

        <div class="form-row" style="margin-top: 16px;">
          <div class="form-group">
            <label class="form-label">Email Address <span class="required">*</span></label>
            <input type="email" id="new-cust-email" class="form-control" placeholder="customer@domain.com" value="${personal.email || ''}" oninput="saveCustomerCreateInputs()">
            <div id="cust-email-error" class="input-error-msg" style="display:none; margin-top: 4px;">Please enter a valid email address.</div>
          </div>
          <div class="form-group">
            <label class="form-label">Mobile Number <span class="required">*</span></label>
            <input type="text" id="new-cust-mobile" class="form-control" placeholder="e.g. 0821234567" value="${personal.mobile || ''}" oninput="saveCustomerCreateInputs()">
            <div id="cust-mobile-error" class="input-error-msg" style="display:none; margin-top: 4px;">Must be a valid 10-digit South African number starting with 0.</div>
          </div>
        </div>

        <div class="form-group" style="margin-top: 16px;">
          <label class="form-label">Alternative Contact Number (Optional)</label>
          <input type="text" id="new-cust-altcontact" class="form-control" placeholder="e.g. 0111234567" value="${personal.altContact || ''}" oninput="saveCustomerCreateInputs()">
        </div>

        <label class="checkbox-group" style="margin-top: 20px;">
          <input type="checkbox" id="new-cust-marketing" ${personal.marketingConsent ? 'checked' : ''} onchange="saveCustomerCreateInputs()">
          <span class="checkbox-label" style="font-weight: 500;">Authorize marketing communications via SMS and Email.</span>
        </label>
      `;
      break;

    case 2:
      stepContainer.innerHTML = `
        <h3 style="margin-bottom: 16px;">Step 2: Employment Status & Occupational Details</h3>
        <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 20px;">Optional: Provide employer context. Required later for credit-related purchases.</p>
        
        <div class="accordion ${APP_STATE.employmentAccordionOpen ? 'open' : ''}" id="employment-accordion">
          <div class="accordion-header" onclick="toggleEmploymentAccordion()">
            <span>Employment Details Questionnaire (Optional)</span>
            <span class="accordion-arrow">▼</span>
          </div>
          <div class="accordion-body">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Employment Status</label>
                <select id="new-cust-empstatus" class="form-control" onchange="saveCustomerCreateInputs()">
                  <option value="">-- Select Status --</option>
                  <option value="Employed" ${employment.status === 'Employed' ? 'selected' : ''}>Employed</option>
                  <option value="Self-Employed" ${employment.status === 'Self-Employed' ? 'selected' : ''}>Self-Employed</option>
                  <option value="Unemployed" ${employment.status === 'Unemployed' ? 'selected' : ''}>Unemployed</option>
                  <option value="Student" ${employment.status === 'Student' ? 'selected' : ''}>Student</option>
                  <option value="Retired" ${employment.status === 'Retired' ? 'selected' : ''}>Retired</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Employment Type</label>
                <select id="new-cust-emptype" class="form-control" onchange="saveCustomerCreateInputs()">
                  <option value="">-- Select Type --</option>
                  <option value="Permanent" ${employment.type === 'Permanent' ? 'selected' : ''}>Permanent</option>
                  <option value="Contract" ${employment.type === 'Contract' ? 'selected' : ''}>Contract</option>
                  <option value="Temporary" ${employment.type === 'Temporary' ? 'selected' : ''}>Temporary</option>
                </select>
              </div>
            </div>

            <div class="form-row" style="margin-top: 16px;">
              <div class="form-group">
                <label class="form-label">Occupation</label>
                <input type="text" id="new-cust-occupation" class="form-control" placeholder="e.g. Engineer" value="${employment.occupation || ''}" oninput="saveCustomerCreateInputs()">
              </div>
              <div class="form-group">
                <label class="form-label">Employer Name</label>
                <input type="text" id="new-cust-empname" class="form-control" placeholder="e.g. Telkom Corporate" value="${employment.employerName || ''}" oninput="saveCustomerCreateInputs()">
              </div>
            </div>

            <div class="form-row" style="margin-top: 16px;">
              <div class="form-group">
                <label class="form-label">Employer Contact Number</label>
                <input type="text" id="new-cust-empcontact" class="form-control" placeholder="e.g. 0123111111" value="${employment.employerContact || ''}" oninput="saveCustomerCreateInputs()">
              </div>
              <div class="form-group">
                <label class="form-label">Employment Start Date</label>
                <input type="date" id="new-cust-empstart" class="form-control" value="${employment.startDate || ''}" onchange="saveCustomerCreateInputs()">
              </div>
            </div>
          </div>
        </div>

        <div style="background-color: var(--bg-light); border-left: 4px solid var(--telkom-blue); padding: 14px 18px; border-radius: var(--radius-md); font-size: 12px; color: var(--text-secondary); margin-top: 16px; font-weight: 500;">
          📌 <strong>Business Rule:</strong> You can completely skip this step. Credit-related products (like handset contracts) may require the agent to collect these fields later in CRM.
        </div>
      `;
      break;

    case 3:
      stepContainer.innerHTML = `
        <h3 style="margin-bottom: 16px;">Step 3: Employer Physical Location Details</h3>
        <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 20px;">Optional: Capture employer address location. Autocomplete will look up validated business coordinates.</p>
        
        <div class="form-group" style="position: relative;">
          <label class="form-label">Employer Address Line 1</label>
          <input type="text" id="new-cust-addr1" class="form-control" placeholder="Type address (e.g. 15 Alice)..." value="${address.line1 || ''}" oninput="handleEmployerAddressInput(this)">
          <div id="addr-autocomplete-menu" class="searchable-dropdown-menu" style="width: 100%;"></div>
        </div>

        <div class="form-group" style="margin-top: 16px;">
          <label class="form-label">Street Address</label>
          <input type="text" id="new-cust-street" class="form-control ${address.street ? 'auto-populated-field' : ''}" placeholder="Street name..." value="${address.street || ''}" oninput="saveCustomerCreateInputs()">
        </div>

        <div class="form-row-3col" style="margin-top: 16px;">
          <div class="form-group">
            <label class="form-label">Suburb</label>
            <input type="text" id="new-cust-suburb" class="form-control ${address.suburb ? 'auto-populated-field' : ''}" placeholder="Suburb..." value="${address.suburb || ''}" oninput="saveCustomerCreateInputs()">
          </div>
          <div class="form-group">
            <label class="form-label">City</label>
            <input type="text" id="new-cust-city" class="form-control ${address.city ? 'auto-populated-field' : ''}" placeholder="City..." value="${address.city || ''}" oninput="saveCustomerCreateInputs()">
          </div>
          <div class="form-group">
            <label class="form-label">Postal Code</label>
            <input type="text" id="new-cust-postal" class="form-control ${address.postalCode ? 'auto-populated-field' : ''}" placeholder="Code..." value="${address.postalCode || ''}" oninput="saveCustomerCreateInputs()">
          </div>
        </div>
      `;
      break;

    case 4:
      stepContainer.innerHTML = `
        <h3 style="margin-bottom: 16px;">Step 4: Net Worth & Financial Health Parameters</h3>
        <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 24px;">Optional: Declare monthly net revenue streams. Numeric-only values will auto-format to ZAR.</p>
        
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Gross Monthly Income</label>
            <input type="text" id="new-cust-gross" class="form-control" placeholder="e.g. 25000" value="${financial.grossIncome ? formatCurrencySimple(financial.grossIncome) : ''}" oninput="handleFinancialInput(this, 'grossIncome')" onblur="handleFinancialBlur(this, 'grossIncome')" onfocus="handleFinancialFocus(this, 'grossIncome')">
          </div>
          <div class="form-group">
            <label class="form-label">Net Monthly Income</label>
            <input type="text" id="new-cust-net" class="form-control" placeholder="e.g. 18000" value="${financial.netIncome ? formatCurrencySimple(financial.netIncome) : ''}" oninput="handleFinancialInput(this, 'netIncome')" onblur="handleFinancialBlur(this, 'netIncome')" onfocus="handleFinancialFocus(this, 'netIncome')">
          </div>
        </div>

        <div class="form-group" style="margin-top: 16px;">
          <label class="form-label">Typical Monthly Expenses</label>
          <input type="text" id="new-cust-expenses" class="form-control" placeholder="e.g. 12000" value="${financial.expenses ? formatCurrencySimple(financial.expenses) : ''}" oninput="handleFinancialInput(this, 'expenses')" onblur="handleFinancialBlur(this, 'expenses')" onfocus="handleFinancialFocus(this, 'expenses')">
        </div>
      `;
      break;

    case 5:
      stepContainer.innerHTML = `
        <h3 style="margin-bottom: 16px;">Step 5: Capture Postpaid Settlement Banking Details</h3>
        <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 24px;">Set up monthly payment deductions. DebiCheck authorization and Credit Bureau checks are required.</p>
        
        <div class="form-row">
          <div class="form-group searchable-dropdown-container">
            <label class="form-label">Settlement Bank Name <span class="required">*</span></label>
            <input type="text" id="new-cust-bankname" class="form-control searchable-dropdown-input" placeholder="Select bank name..." value="${banking.bankName || ''}" onclick="toggleBankMenu(event)" readonly>
            <div id="bank-dropdown-menu" class="searchable-dropdown-menu">
              <div class="searchable-dropdown-search-box">
                <input type="text" class="form-control" placeholder="Filter banks..." oninput="filterBankOptions(this)" onclick="event.stopPropagation()">
              </div>
              <div id="bank-dropdown-options-list">
                <!-- Sorted alphabetically dynamically -->
              </div>
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">Branch Code <span class="required">*</span></label>
            <input type="text" id="new-cust-branchcode" class="form-control" placeholder="e.g. 632005" value="${banking.branchCode || ''}" oninput="handleBranchCodeInput(this)">
          </div>
        </div>

        <div class="form-row" style="margin-top: 16px;">
          <div class="form-group">
            <label class="form-label">Account Type <span class="required">*</span></label>
            <select id="new-cust-acctype" class="form-control" onchange="saveCustomerCreateInputs()">
              <option value="">-- Select Type --</option>
              <option value="Cheque" ${banking.accountType === 'Cheque' ? 'selected' : ''}>Cheque / Current Account</option>
              <option value="Savings" ${banking.accountType === 'Savings' ? 'selected' : ''}>Savings Account</option>
              <option value="Transmission" ${banking.accountType === 'Transmission' ? 'selected' : ''}>Transmission Account</option>
            </select>
          </div>
          
          <div class="form-group">
            <label class="form-label">Account Number <span class="required">*</span></label>
            <div class="secure-input-container">
              <input type="${APP_STATE.accountNumberVisible ? 'text' : 'password'}" id="new-cust-accnum" class="form-control" placeholder="Enter bank account..." value="${banking.accountNumber || ''}" oninput="handleAccountNumberInput(this)">
              <button type="button" class="secure-toggle-btn" onclick="toggleAccountNumberVisibility()">
                <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  ${APP_STATE.accountNumberVisible ? 
                    `<path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />` : 
                    `<path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />`
                  }
                </svg>
              </button>
            </div>
            <div id="cust-accnum-error" class="input-error-msg" style="display:none; margin-top: 4px;">Account number must be numeric and between 7 and 16 digits.</div>
          </div>
        </div>

        <div class="form-row" style="margin-top: 16px;">
          <div class="form-group">
            <label class="form-label">Branch Name (Optional)</label>
            <input type="text" id="new-cust-branchname" class="form-control ${banking.branchName ? 'auto-populated-field' : ''}" placeholder="Branch name..." value="${banking.branchName || ''}" oninput="saveCustomerCreateInputs()">
          </div>
          <div class="form-group">
            <label class="form-label">Preferred Debit Order Date <span class="required">*</span></label>
            <select id="new-cust-debitdate" class="form-control" onchange="saveCustomerCreateInputs()">
              <option value="1st" ${banking.debitDate === '1st' ? 'selected' : ''}>1st of the month</option>
              <option value="15th" ${banking.debitDate === '15th' ? 'selected' : ''}>15th of the month</option>
              <option value="25th" ${banking.debitDate === '25th' ? 'selected' : ''}>25th of the month</option>
              <option value="Last Day" ${banking.debitDate === 'Last Day' ? 'selected' : ''}>Last Day of the month</option>
            </select>
            <div class="input-helper">Select the day you would like your monthly payment to be deducted.</div>
          </div>
        </div>

        <div style="margin-top: 24px; border-top: 1px solid var(--border-color); padding-top: 16px;">
          <label class="checkbox-group" style="margin-bottom: 12px; align-items: flex-start;">
            <input type="checkbox" id="new-cust-debicheck" ${banking.debiCheckConsent ? 'checked' : ''} onchange="saveCustomerCreateInputs()" style="margin-top: 3px;">
            <span class="checkbox-label"><strong>Debit Collection Authorization (Required):</strong> I authorize Telkom and/or its approved debt collection partners to use DEBICHECK for the collection of any outstanding amounts from my account.</span>
          </label>
          <label class="checkbox-group" style="align-items: flex-start;">
            <input type="checkbox" id="new-cust-creditcheck" ${banking.creditConsent ? 'checked' : ''} onchange="saveCustomerCreateInputs()" style="margin-top: 3px;">
            <span class="checkbox-label"><strong>Credit Bureau Verification (Required):</strong> I authorize Telkom to verify my information with the Credit Bureau.</span>
          </label>
        </div>
      `;
      break;

    case 6:
      stepContainer.innerHTML = `
        <h3 style="margin-bottom: 16px;">Step 6: Review & Finalize Customer Registration</h3>
        <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 24px;">Confirm all captured customer specifications before sending the profile transaction payload to Clarify CRM.</p>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
          <div class="panel">
            <div class="panel-header"><span class="panel-title">Personal Information</span></div>
            <div class="panel-body font-sm" style="font-size: 13px; line-height: 1.6;">
              <div><strong>Full Name:</strong> ${personal.firstName} ${personal.lastName}</div>
              <div><strong>ID Type/Number:</strong> ${personal.idType} (${personal.idNum})</div>
              <div><strong>Email Address:</strong> ${personal.email}</div>
              <div><strong>Mobile Phone:</strong> ${personal.mobile}</div>
              ${personal.altContact ? `<div><strong>Alt Contact:</strong> ${personal.altContact}</div>` : ''}
              <div><strong>Marketing Choice:</strong> ${personal.marketingConsent ? 'Opt-In' : 'Opt-Out'}</div>
            </div>
          </div>

          <div class="panel">
            <div class="panel-header"><span class="panel-title">Employment & Financials</span></div>
            <div class="panel-body font-sm" style="font-size: 13px; line-height: 1.6;">
              <div><strong>Status/Type:</strong> ${employment.status || 'Not declared'} / ${employment.type || 'Not declared'}</div>
              <div><strong>Occupation:</strong> ${employment.occupation || 'Not declared'}</div>
              <div><strong>Employer Name:</strong> ${employment.employerName || 'Not declared'}</div>
              <div><strong>Employer Phone:</strong> ${employment.employerContact || 'Not declared'}</div>
              <div><strong>Gross Income:</strong> ${financial.grossIncome ? formatCurrencySimple(financial.grossIncome) : 'Not declared'}</div>
              <div><strong>Net Income:</strong> ${financial.netIncome ? formatCurrencySimple(financial.netIncome) : 'Not declared'}</div>
              <div><strong>Expenses:</strong> ${financial.expenses ? formatCurrencySimple(financial.expenses) : 'Not declared'}</div>
            </div>
          </div>

          <div class="panel" style="grid-column: 1 / -1;">
            <div class="panel-header"><span class="panel-title">Settlement Account & Auths</span></div>
            <div class="panel-body font-sm" style="font-size: 13px; line-height: 1.6; display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div>
                <div><strong>Bank Name:</strong> ${banking.bankName}</div>
                <div><strong>Branch Code/Name:</strong> ${banking.branchCode} (${banking.branchName || 'Auto'})</div>
                <div><strong>Account Number:</strong> ${maskAccountNumber(banking.accountNumber)} (${banking.accountType})</div>
                <div><strong>Preferred Debit Date:</strong> ${banking.debitDate} of the month</div>
              </div>
              <div>
                <div style="color: var(--success); font-weight: 600; margin-bottom: 6px;">✓ DebiCheck Debit Collection Signed</div>
                <div style="color: var(--success); font-weight: 600;">✓ Credit Bureau Verification Authorized</div>
              </div>
            </div>
          </div>
        </div>
      `;
      break;
  }
}

// Synchronize inputs into APP_STATE
function saveCustomerCreateInputs() {
  const step = APP_STATE.customerCreateStep;
  const personal = APP_STATE.newCustomerData.personal;
  const employment = APP_STATE.newCustomerData.employment;
  const address = APP_STATE.newCustomerData.address;
  const banking = APP_STATE.newCustomerData.banking;

  if (step === 1) {
    personal.idType = document.getElementById('new-cust-idtype').value;
    personal.idNum = document.getElementById('new-cust-idnum').value.trim();
    personal.firstName = document.getElementById('new-cust-firstname').value.trim();
    personal.lastName = document.getElementById('new-cust-lastname').value.trim();
    personal.email = document.getElementById('new-cust-email').value.trim();
    personal.mobile = document.getElementById('new-cust-mobile').value.trim();
    personal.altContact = document.getElementById('new-cust-altcontact').value.trim();
    personal.marketingConsent = document.getElementById('new-cust-marketing').checked;
  } else if (step === 2) {
    const statusSel = document.getElementById('new-cust-empstatus');
    const typeSel = document.getElementById('new-cust-emptype');
    if (statusSel) employment.status = statusSel.value;
    if (typeSel) employment.type = typeSel.value;
    
    const occInput = document.getElementById('new-cust-occupation');
    const nameInput = document.getElementById('new-cust-empname');
    const contactInput = document.getElementById('new-cust-empcontact');
    const startInput = document.getElementById('new-cust-empstart');

    if (occInput) employment.occupation = occInput.value.trim();
    if (nameInput) employment.employerName = nameInput.value.trim();
    if (contactInput) employment.employerContact = contactInput.value.trim();
    if (startInput) employment.startDate = startInput.value;
  } else if (step === 3) {
    const l1 = document.getElementById('new-cust-addr1');
    const str = document.getElementById('new-cust-street');
    const sub = document.getElementById('new-cust-suburb');
    const city = document.getElementById('new-cust-city');
    const post = document.getElementById('new-cust-postal');

    if (l1) address.line1 = l1.value.trim();
    if (str) address.street = str.value.trim();
    if (sub) address.suburb = sub.value.trim();
    if (city) address.city = city.value.trim();
    if (post) address.postalCode = post.value.trim();
  } else if (step === 5) {
    const bankEl = document.getElementById('new-cust-bankname');
    const typeEl = document.getElementById('new-cust-acctype');
    const debitEl = document.getElementById('new-cust-debitdate');
    const debiCheckEl = document.getElementById('new-cust-debicheck');
    const creditEl = document.getElementById('new-cust-creditcheck');
    const branchNameEl = document.getElementById('new-cust-branchname');

    if (bankEl) banking.bankName = bankEl.value;
    if (typeEl) banking.accountType = typeEl.value;
    if (debitEl) banking.debitDate = debitEl.value;
    if (debiCheckEl) banking.debiCheckConsent = debiCheckEl.checked;
    if (creditEl) banking.creditConsent = creditEl.checked;
    if (branchNameEl) banking.branchName = branchNameEl.value.trim();
  }
}

// Collapsible accordion toggle
function toggleEmploymentAccordion() {
  const acc = document.getElementById('employment-accordion');
  if (acc) {
    APP_STATE.employmentAccordionOpen = !APP_STATE.employmentAccordionOpen;
    acc.classList.toggle('open', APP_STATE.employmentAccordionOpen);
  }
}

// Address Autocomplete Handlers
function handleEmployerAddressInput(el) {
  saveCustomerCreateInputs();
  const menu = document.getElementById('addr-autocomplete-menu');
  if (!menu) return;

  const val = el.value.trim().toLowerCase();
  if (!val || val.length < 2) {
    menu.style.display = 'none';
    return;
  }

  const matches = MOCK_EMPLOYER_ADDRESSES.filter(addr => addr.line1.toLowerCase().includes(val));
  
  if (matches.length === 0) {
    menu.style.display = 'none';
    return;
  }

  menu.innerHTML = '';
  matches.forEach((addr, index) => {
    menu.innerHTML += `
      <div class="searchable-dropdown-option" onclick="selectEmployerAddressSuggestion(${index})">
        <strong>${addr.line1}</strong> — ${addr.suburb}, ${addr.city}, ${addr.postalCode}
      </div>
    `;
  });
  menu.style.display = 'block';
}

function selectEmployerAddressSuggestion(index) {
  const addr = MOCK_EMPLOYER_ADDRESSES[index];
  if (addr) {
    APP_STATE.newCustomerData.address = {
      line1: addr.line1,
      street: addr.street,
      suburb: addr.suburb,
      city: addr.city,
      postalCode: addr.postalCode
    };
    
    // Rerender Step 3 to show populated fields
    renderCustomerCreateStep(3);
    showToast("Employer address auto-completed.", "success");
  }

  const menu = document.getElementById('addr-autocomplete-menu');
  if (menu) menu.style.display = 'none';
}

// Financial Inputs (Step 4 Currency formatting)
function formatCurrencySimple(val) {
  if (!val) return "";
  const clean = val.toString().replace(/[^0-9]/g, '');
  if (!clean) return "";
  return "R " + parseInt(clean).toLocaleString('en-ZA');
}

function handleFinancialInput(el, field) {
  const val = el.value.replace(/[^0-9]/g, '');
  APP_STATE.newCustomerData.financial[field] = val;
}

function handleFinancialBlur(el, field) {
  const val = APP_STATE.newCustomerData.financial[field];
  if (val) {
    el.value = formatCurrencySimple(val);
  }
}

function handleFinancialFocus(el, field) {
  const val = APP_STATE.newCustomerData.financial[field];
  if (val) {
    el.value = val;
  }
}

// Searchable bank dropdown controls
function toggleBankMenu(e) {
  e.stopPropagation();
  const menu = document.getElementById('bank-dropdown-menu');
  if (!menu) return;
  menu.classList.toggle('show');
  
  // Render options list sorted alphabetically
  filterBankOptions(null);
}

function filterBankOptions(searchEl) {
  const listEl = document.getElementById('bank-dropdown-options-list');
  if (!listEl) return;
  listEl.innerHTML = '';

  const searchVal = searchEl ? searchEl.value.trim().toLowerCase() : '';
  const filtered = BANK_OPTIONS.filter(b => b.toLowerCase().includes(searchVal));

  if (filtered.length === 0) {
    listEl.innerHTML = `<div style="padding: 10px 14px; font-size: 13px; color: var(--text-muted);">No banks found</div>`;
    return;
  }

  const selectedBank = APP_STATE.newCustomerData.banking.bankName;

  filtered.forEach(b => {
    listEl.innerHTML += `
      <div class="searchable-dropdown-option ${selectedBank === b ? 'selected' : ''}" onclick="selectBankOption('${b}')">
        ${b}
      </div>
    `;
  });
}

function selectBankOption(bank) {
  APP_STATE.newCustomerData.banking.bankName = bank;
  const input = document.getElementById('new-cust-bankname');
  if (input) input.value = bank;

  const menu = document.getElementById('bank-dropdown-menu');
  if (menu) menu.classList.remove('show');
  
  // Trigger branch code checker to refresh lookup
  const branchEl = document.getElementById('new-cust-branchcode');
  if (branchEl) handleBranchCodeInput(branchEl);
}

// Close bank dropdown on clicking outside
document.addEventListener('click', function() {
  const menu = document.getElementById('bank-dropdown-menu');
  if (menu) menu.classList.remove('show');
  
  const addrMenu = document.getElementById('addr-autocomplete-menu');
  if (addrMenu) addrMenu.style.display = 'none';
});

// Branch auto-population lookup
function handleBranchCodeInput(el) {
  const code = el.value.replace(/[^0-9]/g, '');
  el.value = code;
  APP_STATE.newCustomerData.banking.branchCode = code;

  const bankName = APP_STATE.newCustomerData.banking.bankName;
  const nameInput = document.getElementById('new-cust-branchname');
  if (!nameInput) return;

  if (bankName && BRANCH_LOOKUP[bankName] && BRANCH_LOOKUP[bankName][code]) {
    const branchName = BRANCH_LOOKUP[bankName][code];
    APP_STATE.newCustomerData.banking.branchName = branchName;
    nameInput.value = branchName;
    nameInput.classList.add('auto-populated-field');
    showToast(`Branch auto-detected: ${branchName}`, "success");
  } else {
    nameInput.classList.remove('auto-populated-field');
  }
}

// Account number masking & visibility
function handleAccountNumberInput(el) {
  const code = el.value.replace(/[^0-9]/g, '');
  el.value = code;
  APP_STATE.newCustomerData.banking.accountNumber = code;
}

function toggleAccountNumberVisibility() {
  APP_STATE.accountNumberVisible = !APP_STATE.accountNumberVisible;
  
  // Re-render banking step to update eye icon and type
  renderCustomerCreateStep(5);
}

function maskAccountNumber(accNum) {
  if (!accNum) return "";
  if (accNum.length < 5) return accNum;
  return "••••••" + accNum.slice(-4);
}

// Navigation back and next actions
function handleCustomerCreateBack() {
  if (APP_STATE.customerCreateStep > 1) {
    saveCustomerCreateInputs();
    renderCustomerCreateStep(APP_STATE.customerCreateStep - 1);
  } else {
    if (APP_STATE.openedCustomerWizardFromStepper) {
      APP_STATE.openedCustomerWizardFromStepper = false;
      APP_STATE.currentStep = 2; // return to Identify Cust step
      switchRoute('order-stepper');
    } else {
      switchRoute('customer-search');
    }
  }
}

function handleCustomerCreateNext() {
  saveCustomerCreateInputs();
  const step = APP_STATE.customerCreateStep;
  const personal = APP_STATE.newCustomerData.personal;
  const banking = APP_STATE.newCustomerData.banking;

  // STEP 1 VALIDATIONS
  if (step === 1) {
    if (!personal.idNum || !personal.firstName || !personal.lastName || !personal.email || !personal.mobile) {
      showToast("Please fill in all mandatory customer details (*)", "warning");
      return;
    }

    if (personal.idType === 'SA ID' && !/^\d{13}$/.test(personal.idNum)) {
      showToast("South African ID must be exactly 13 digits.", "danger");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(personal.email)) {
      document.getElementById('cust-email-error').style.display = 'block';
      return;
    } else {
      document.getElementById('cust-email-error').style.display = 'none';
    }

    if (!/^\d{10}$/.test(personal.mobile)) {
      document.getElementById('cust-mobile-error').style.display = 'block';
      return;
    } else {
      document.getElementById('cust-mobile-error').style.display = 'none';
    }

    // Duplicate Check
    const exists = MOCK_DB.crm.some(c => (c.id === personal.idNum || (c.passport && c.passport === personal.idNum)));
    if (exists) {
      showToast(`Conflict: Customer with ID/Passport ${personal.idNum} already exists in CRM database.`, "danger");
      return;
    }
  }

  // STEP 5 VALIDATIONS
  if (step === 5) {
    if (!banking.bankName || !banking.branchCode || !banking.accountType || !banking.accountNumber) {
      showToast("Please capture all required settlement banking parameters (*).", "warning");
      return;
    }

    if (!/^\d+$/.test(banking.branchCode)) {
      showToast("Branch Code must be numeric digits only.", "danger");
      return;
    }

    if (!/^\d{7,16}$/.test(banking.accountNumber)) {
      document.getElementById('cust-accnum-error').style.display = 'block';
      return;
    } else {
      document.getElementById('cust-accnum-error').style.display = 'none';
    }

    if (!banking.debiCheckConsent || !banking.creditConsent) {
      showToast("Debit DebiCheck and Credit Bureau verification consents must be checked to register account.", "warning");
      return;
    }
  }

  if (step === 6) {
    submitNewCustomerProfile();
    return;
  }

  // Go to next step
  renderCustomerCreateStep(step + 1);
}

// Complete customer registration
function submitNewCustomerProfile() {
  const personal = APP_STATE.newCustomerData.personal;
  const address = APP_STATE.newCustomerData.address;
  
  // Format SA Address or default
  const formattedAddress = address.line1 ? `${address.line1}, ${address.suburb}, ${address.city}, ${address.postalCode}` : "12 Main Rd, Rosebank, Johannesburg, 2196";

  const newCust = {
    id: personal.idType === 'SA ID' ? personal.idNum : "",
    passport: personal.idType === 'Passport' ? personal.idNum : "",
    accountNumber: "TEL-" + Math.floor(10000000 + Math.random() * 90000000),
    name: `${personal.firstName} ${personal.lastName}`,
    status: "Active",
    segment: "Consumer",
    mobile: personal.mobile,
    email: personal.email,
    address: formattedAddress,
    billingAddress: formattedAddress,
    preferredContact: "SMS",
    activeProducts: [],
    interactions: []
  };

  // Add supporting documents array to support upload logic
  newCust.documents = [];

  MOCK_DB.crm.push(newCust);
  
  // Display success state inside content viewport
  const content = document.getElementById('customer-create-content');
  const backBtn = document.getElementById('cust-back-btn');
  const nextBtn = document.getElementById('cust-next-btn');

  if (backBtn) backBtn.style.visibility = 'hidden';
  if (nextBtn) nextBtn.style.display = 'none';

  if (APP_STATE.openedCustomerWizardFromStepper) {
    content.innerHTML = `
      <div style="text-align: center; padding: 40px 20px;">
        <div style="width: 56px; height: 56px; border-radius: 50%; background-color: var(--success-light); color: var(--success); display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; font-size: 28px; font-weight: bold;">✓</div>
        <h3 style="color: var(--telkom-blue-dark); margin-bottom: 8px;">Customer Created Successfully</h3>
        <p style="font-size: 14px; color: var(--text-secondary); max-width: 500px; margin: 0 auto 24px; line-height: 1.6;">
          The customer profile for <strong>${newCust.name}</strong> has been created. Click below to return and continue configuring the order.
        </p>
        
        <div style="background-color: var(--bg-light); border: 1px solid var(--border-color); padding: 16px; border-radius: var(--radius-md); font-size: 13px; max-width: 500px; margin: 0 auto 24px; color: var(--text-secondary);">
          Customer Account Number: <strong style="color: var(--telkom-blue-dark);">${newCust.accountNumber}</strong>
        </div>

        <div style="display: flex; justify-content: center; gap: 16px;">
          <button class="btn btn-primary" onclick="linkCustomerAndReturnToStepper('${newCust.id || newCust.passport}', '${!!newCust.id ? 'id' : 'passport'}')">Link & Return to Stepper</button>
        </div>
      </div>
    `;
  } else {
    content.innerHTML = `
      <div style="text-align: center; padding: 40px 20px;">
        <div style="width: 56px; height: 56px; border-radius: 50%; background-color: var(--success-light); color: var(--success); display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; font-size: 28px; font-weight: bold;">✓</div>
        <h3 style="color: var(--telkom-blue-dark); margin-bottom: 8px;">Customer Created Successfully</h3>
        <p style="font-size: 14px; color: var(--text-secondary); max-width: 500px; margin: 0 auto 24px; line-height: 1.6;">
          The customer profile for <strong>${newCust.name}</strong> has been created and is now available in the system.
        </p>
        
        <div style="background-color: var(--bg-light); border: 1px solid var(--border-color); padding: 16px; border-radius: var(--radius-md); font-size: 13px; max-width: 500px; margin: 0 auto 24px; color: var(--text-secondary);">
          Customer Account Number: <strong style="color: var(--telkom-blue-dark);">${newCust.accountNumber}</strong>
        </div>

        <div style="display: flex; justify-content: center; gap: 16px;">
          <button class="btn btn-secondary" onclick="identifyCustomer('${newCust.id || newCust.passport}', '${!!newCust.id ? 'id' : 'passport'}')">View Customer Profile</button>
          <button class="btn btn-primary" onclick="proceedToCatalogueForCustomer('${newCust.id || newCust.passport}', '${!!newCust.id ? 'id' : 'passport'}')">Proceed to Product Selection</button>
        </div>
      </div>
    `;
  }

  showToast("CRM Customer profile created successfully.", "success");
}

function proceedToCatalogueForCustomer(idVal, type) {
  identifyCustomer(idVal, type);
  switchRoute('catalogue');
}

// Render customer documents in Customer 360
function renderCustomer360Documents() {
  const cust = APP_STATE.selectedCustomer;
  if (!cust) return;

  if (!cust.documents || Array.isArray(cust.documents)) {
    cust.documents = {};
  }

  const docTypes = [
    { key: "idDoc", label: "Identity Document" },
    { key: "bankStatements", label: "Last 3 Months Bank Statements" },
    { key: "proofAddress", label: "Proof of Address" },
    { key: "companyReg", label: "Company Registration Document" }
  ];

  const panel = document.getElementById('c360-documents-panel');
  if (!panel) return;

  let html = `<div style="display: flex; flex-direction: column; gap: 12px;">`;

  docTypes.forEach(doc => {
    const file = cust.documents[doc.key];
    const progress = APP_STATE.customerDocProgress && APP_STATE.customerDocProgress[doc.key];

    html += `
      <div class="c360-doc-row" style="padding: 12px; border: 1px solid var(--border-color); border-radius: var(--radius-md); display: flex; justify-content: space-between; align-items: center; background-color: var(--bg-card); transition: all 0.2s ease;">
        <div style="display: flex; align-items: center; gap: 12px; flex: 1; min-width: 0;">
          <div class="doc-icon-wrapper" style="width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background-color: ${file ? 'var(--success-light)' : 'var(--warning-light)'}; color: ${file ? 'var(--success)' : 'var(--warning)'}; flex-shrink: 0;">
            ${file 
              ? `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`
              : `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>`
            }
          </div>
          <div style="min-width: 0; flex: 1;">
            <div style="font-weight: 700; font-size: 13px; color: var(--telkom-blue-dark);">${doc.label}</div>
            <div style="font-size: 11px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">
              ${file 
                ? `<span style="color: var(--text-primary); font-weight: 500;">${file.name} (${file.size})</span>`
                : `<span style="color: var(--text-muted);">Not uploaded</span>`
              }
            </div>
          </div>
        </div>
    `;

    if (progress !== undefined && progress < 100) {
      html += `
        <div style="width: 140px; flex-shrink: 0; text-align: right;">
          <div style="font-size: 11px; color: var(--text-secondary); margin-bottom: 4px; display: flex; justify-content: space-between;">
            <span>Uploading...</span>
            <span>${progress}%</span>
          </div>
          <div class="upload-progress-container" style="display:block; height: 6px; margin: 0;">
            <div class="upload-progress-bar" style="width: ${progress}%;"></div>
          </div>
        </div>
      `;
    } else {
      html += `
        <div style="display: flex; gap: 8px; flex-shrink: 0;">
          ${file 
            ? `
              <button class="btn btn-sm btn-secondary" onclick="triggerBrowseCustomerDoc('${doc.key}')" style="padding: 4px 8px; font-size: 11px; height: 28px;">Replace</button>
              <button class="btn btn-sm btn-danger" onclick="removeCustomerProfileDoc('${doc.key}')" style="padding: 4px 8px; font-size: 11px; height: 28px;">Remove</button>
            `
            : `
              <button class="btn btn-sm btn-primary" onclick="triggerBrowseCustomerDoc('${doc.key}')" style="padding: 4px 12px; font-size: 11px; height: 28px;">Upload</button>
            `
          }
        </div>
        <input type="file" id="c360-file-input-${doc.key}" style="display:none;" onchange="handleCustomerDocSelected(event, '${doc.key}')" accept=".pdf,.jpg,.png">
      `;
    }

    html += `</div>`;
  });

  html += `</div>`;
  panel.innerHTML = html;
}

function triggerBrowseCustomerDoc(key) {
  const input = document.getElementById(`c360-file-input-${key}`);
  if (input) {
    input.click();
  }
}

function handleCustomerDocSelected(e, key) {
  const file = e.target.files[0];
  if (file) {
    const ext = file.name.split('.').pop().toLowerCase();
    if (ext !== 'pdf' && ext !== 'jpg' && ext !== 'png') {
      showToast("Invalid format: PDF, JPG, PNG only.", "danger");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast("File size exceeds 5 MB limit.", "danger");
      return;
    }
    simulateCustomerDocUpload(key, file.name);
  }
}

function simulateCustomerDocUpload(docType, fileName) {
  const cust = APP_STATE.selectedCustomer;
  if (!cust) return;

  if (!APP_STATE.customerDocProgress) {
    APP_STATE.customerDocProgress = {};
  }

  APP_STATE.customerDocProgress[docType] = 1;
  renderCustomer360Documents();

  let current = 0;
  const interval = setInterval(() => {
    current += 20;
    if (current > 100) {
      current = 100;
      clearInterval(interval);
      
      cust.documents = cust.documents || {};
      cust.documents[docType] = { name: fileName, size: "1.2 MB" };
      delete APP_STATE.customerDocProgress[docType];

      if (cust.interactions) {
        cust.interactions.unshift({
          date: new Date().toISOString().slice(0, 16).replace('T', ' '),
          agent: APP_STATE.currentUser.id || "AGT-101",
          type: "Document Uploaded",
          notes: `Uploaded supporting document: ${docType.replace(/([A-Z])/g, ' $1')} (${fileName})`
        });
      }

      showToast(`${docType.replace(/([A-Z])/g, ' $1')} uploaded successfully.`, "success");
      renderCustomer360();
    } else {
      APP_STATE.customerDocProgress[docType] = current;
      renderCustomer360Documents();
    }
  }, 150);
}

function removeCustomerProfileDoc(key) {
  const cust = APP_STATE.selectedCustomer;
  if (!cust) return;

  if (cust.documents && cust.documents[key]) {
    const fileName = cust.documents[key].name;
    delete cust.documents[key];

    if (cust.interactions) {
      cust.interactions.unshift({
        date: new Date().toISOString().slice(0, 16).replace('T', ' '),
        agent: APP_STATE.currentUser.id || "AGT-101",
        type: "Document Removed",
        notes: `Removed supporting document: ${key.replace(/([A-Z])/g, ' $1')} (${fileName})`
      });
    }

    showToast(`${key.replace(/([A-Z])/g, ' $1')} removed.`, "info");
    renderCustomer360();
  }
}

// Render customer search inside order stepper
function renderStepperCustomerSearch(container) {
  const cust = APP_STATE.selectedCustomer;
  
  if (cust) {
    container.innerHTML = `
      <h3 style="margin-bottom: 16px;">${getStepperStepTitle(2, "Customer Identification")}</h3>
      <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 20px;">Customer session is active. Confirm or change the customer profile for this order.</p>
      
      <div style="background-color: var(--success-light); border: 1px solid var(--success-border); padding: 16px; border-radius: var(--radius-md); display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <div>
          <div style="font-size: 11px; color: var(--text-muted); font-weight: 700;">ACTIVE CUSTOMER</div>
          <strong style="color: var(--telkom-blue-dark); font-size: 15px;">${cust.name}</strong>
          <span style="font-size: 12px; color: var(--text-secondary); margin-left: 8px;">(Acc: ${cust.accountNumber} | ID: ${cust.id || cust.passport})</span>
        </div>
        <button class="btn btn-sm btn-secondary" onclick="unlinkCustomerInStepper()">Change Customer</button>
      </div>
      
      <div style="font-size: 13px; color: var(--text-secondary);">Click <strong>Continue</strong> to proceed.</div>
    `;
    return;
  }

  const searchResults = APP_STATE.stepperCustomerSearchResults || null;
  const searchedKey = APP_STATE.stepperCustomerSearchedKey || "";
  
  let resultsHtml = '';
  if (searchResults !== null) {
    if (searchResults.length > 0) {
      resultsHtml = `
        <div style="margin-top: 20px; border: 1px solid var(--border-color); border-radius: var(--radius-md); overflow: hidden;">
          <div style="background-color: var(--bg-light); padding: 10px 14px; font-size: 11px; font-weight: 700; color: var(--text-muted); border-bottom: 1px solid var(--border-color);">SEARCH RESULTS</div>
          ${searchResults.map(c => `
            <div style="padding: 12px 14px; display: flex; justify-content: space-between; align-items: center; background-color: var(--bg-card); border-bottom: 1px solid var(--border-color);">
              <div>
                <strong style="color: var(--telkom-blue-dark);">${c.name}</strong>
                <div style="font-size: 11px; color: var(--text-secondary); margin-top: 2px;">Account: ${c.accountNumber} | Mobile: ${c.mobile} | Email: ${c.email}</div>
              </div>
              <button class="btn btn-sm btn-primary" onclick="linkCustomerInStepper('${c.id || c.passport}', '${c.id ? 'id' : 'passport'}')">Select Profile</button>
            </div>
          `).join('')}
        </div>
      `;
    } else {
      resultsHtml = `
        <div style="margin-top: 20px; padding: 24px; text-align: center; border: 1px dashed var(--border-color); border-radius: var(--radius-md); background-color: var(--bg-light);">
          <div style="font-size: 24px; margin-bottom: 8px;">🔍</div>
          <h4 style="color: var(--telkom-blue-dark); margin-bottom: 6px;">Customer Not Found</h4>
          <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 16px; max-width: 400px; margin-left: auto; margin-right: auto;">
            No records matched "${searchedKey}". Double check the ID/Passport digits or register a new profile.
          </p>
          <button class="btn btn-primary" onclick="openNewCustomerWizardFromStepper('${searchedKey}')">Add New Customer Profile</button>
        </div>
      `;
    }
  }

  container.innerHTML = `
    <h3 style="margin-bottom: 16px;">${getStepperStepTitle(2, "Customer Identification")}</h3>
    <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 20px;">Search for the customer in Clarify CRM to link them to this order.</p>
    
    <div style="display: flex; gap: 12px; align-items: center;">
      <input type="text" id="stepper-cust-search-input" class="form-control" placeholder="Search by SA ID or Passport Number..." value="${searchedKey}" style="height: 42px; flex: 1;" onkeydown="handleStepperCustSearchKeydown(event)">
      <button class="btn btn-primary" onclick="searchCustomerInStepper()" style="height: 42px; width: 120px; display: flex; align-items: center; justify-content: center;">Search</button>
      <button class="btn btn-outline" onclick="openNewCustomerWizardFromStepper('')" style="height: 42px; display: flex; align-items: center; justify-content: center; border-color: var(--telkom-blue); color: var(--telkom-blue);">Add New Customer</button>
    </div>
    <div style="font-size: 11px; color: var(--text-muted); margin-top: 6px;">Enter 13-digit SA ID or Passport ID. Or click 'Add New Customer' to register a new profile.</div>

    ${resultsHtml}
  `;
}

function searchCustomerInStepper() {
  const input = document.getElementById('stepper-cust-search-input');
  if (!input) return;
  const query = input.value.trim();
  if (!query) {
    showToast("Please enter an ID or Passport number.", "warning");
    return;
  }
  
  const results = MOCK_DB.crm.filter(c => (c.id === query || c.passport === query));
  APP_STATE.stepperCustomerSearchResults = results;
  APP_STATE.stepperCustomerSearchedKey = query;
  renderStepper();
}

function handleStepperCustSearchKeydown(e) {
  if (e.key === 'Enter') {
    searchCustomerInStepper();
  }
}

function linkCustomerInStepper(idVal, type) {
  let cust = null;
  if (type === 'id') {
    cust = MOCK_DB.crm.find(c => c.id === idVal);
  } else {
    cust = MOCK_DB.crm.find(c => c.passport === idVal);
  }

  if (cust) {
    APP_STATE.selectedCustomer = cust;
    
    APP_STATE.activeCIMInteraction = {
      type: "New Order",
      channel: "Retail store",
      storeId: APP_STATE.currentUser.branch,
      agentId: APP_STATE.currentUser.id,
      timestamp: new Date().toISOString(),
      notes: ""
    };
    
    if (APP_STATE.cart.product && APP_STATE.cart.product.category === 'Exlight broadband plans') {
      simulateGisAddressCheck();
    }

    showToast(`Linked customer: ${cust.name}`, "success");
    renderStepper();
  }
}

function unlinkCustomerInStepper() {
  APP_STATE.selectedCustomer = null;
  APP_STATE.stepperCustomerSearchResults = null;
  APP_STATE.stepperCustomerSearchedKey = "";
  
  if (APP_STATE.cart.supportingDocs) {
    APP_STATE.cart.supportingDocs = null;
  }
  
  renderStepper();
}

function openNewCustomerWizardFromStepper(searchedKey) {
  APP_STATE.openedCustomerWizardFromStepper = true;
  openNewCustomerWizard();
  
  setTimeout(() => {
    const idInput = document.getElementById('cust-idnum');
    if (idInput) {
      idInput.value = searchedKey;
      const select = document.getElementById('cust-idtype');
      if (select) {
        if (/^\d{13}$/.test(searchedKey)) {
          select.value = 'SA ID';
        } else {
          select.value = 'Passport';
        }
      }
    }
  }, 100);
}

function linkCustomerAndReturnToStepper(idVal, type) {
  linkCustomerInStepper(idVal, type);
  APP_STATE.openedCustomerWizardFromStepper = false;
  APP_STATE.currentStep = 3;
  switchRoute('order-stepper');
}

function updateTempAddress(val) {
  APP_STATE.cart.tempCoverageAddress = val;
}

function handleStockReqDeviceSelectChange(val) {
  if (!val) {
    document.getElementById('stock-req-sku').value = "";
    document.getElementById('stock-req-product').value = "";
    return;
  }
  
  const [sku, productName] = val.split('|');
  document.getElementById('stock-req-sku').value = sku;
  document.getElementById('stock-req-product').value = productName;
}

function switchStockTab(tabName) {
  document.querySelectorAll('.stock-tab-panel').forEach(p => p.style.display = 'none');
  const targetPanel = document.getElementById(`stock-panel-${tabName}`);
  if (targetPanel) {
    targetPanel.style.display = 'block';
  }

  document.querySelectorAll('.tab-navigation .tab-btn').forEach(btn => {
    btn.style.borderBottom = '3px solid transparent';
    btn.style.color = 'var(--text-secondary)';
    btn.style.fontWeight = '600';
    btn.classList.remove('active');
  });

  const activeBtn = document.getElementById(`stock-tab-btn-${tabName}`);
  if (activeBtn) {
    activeBtn.style.borderBottom = '3px solid var(--telkom-blue)';
    activeBtn.style.color = 'var(--telkom-blue-dark)';
    activeBtn.style.fontWeight = '700';
    activeBtn.classList.add('active');
  }

  if (tabName === 'inventory') {
    renderStoreInventoryTab();
  } else if (tabName === 'lowstock') {
    renderLowStockTab();
  } else if (tabName === 'requests') {
    renderStockRequests();
  }
}

function renderStoreInventoryTab() {
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
}

function renderLowStockTab() {
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
}

// Bind to window
window.openNewCustomerWizard = openNewCustomerWizard;
window.handleCustomerCreateBack = handleCustomerCreateBack;
window.handleCustomerCreateNext = handleCustomerCreateNext;
window.toggleEmploymentAccordion = toggleEmploymentAccordion;
window.handleEmployerAddressInput = handleEmployerAddressInput;
window.selectEmployerAddressSuggestion = selectEmployerAddressSuggestion;
window.handleFinancialInput = handleFinancialInput;
window.handleFinancialBlur = handleFinancialBlur;
window.handleFinancialFocus = handleFinancialFocus;
window.toggleBankMenu = toggleBankMenu;
window.filterBankOptions = filterBankOptions;
window.selectBankOption = selectBankOption;
window.handleBranchCodeInput = handleBranchCodeInput;
window.handleAccountNumberInput = handleAccountNumberInput;
window.toggleAccountNumberVisibility = toggleAccountNumberVisibility;
window.proceedToCatalogueForCustomer = proceedToCatalogueForCustomer;
window.triggerBrowseCustomerDoc = triggerBrowseCustomerDoc;
window.handleCustomerDocSelected = handleCustomerDocSelected;
window.removeCustomerProfileDoc = removeCustomerProfileDoc;
window.renderCustomer360Documents = renderCustomer360Documents;
window.searchCustomerInStepper = searchCustomerInStepper;
window.handleStepperCustSearchKeydown = handleStepperCustSearchKeydown;
window.linkCustomerInStepper = linkCustomerInStepper;
window.unlinkCustomerInStepper = unlinkCustomerInStepper;
window.openNewCustomerWizardFromStepper = openNewCustomerWizardFromStepper;
window.linkCustomerAndReturnToStepper = linkCustomerAndReturnToStepper;
window.updateTempAddress = updateTempAddress;
function runRicaValidation() {
  const btn = document.getElementById('btn-run-rica');
  const indicator = document.getElementById('rica-status-indicator');
  const progressArea = document.getElementById('rica-progress-area');
  const progressText = document.getElementById('rica-progress-text');
  const progressBar = document.getElementById('rica-progress-bar');
  
  if (!btn || !indicator || !progressArea || !progressBar || !progressText) return;
  
  btn.disabled = true;
  progressArea.style.display = 'block';
  progressBar.style.width = '0%';
  progressText.innerText = "Querying RICA verification gateway...";
  
  setTimeout(() => {
    progressBar.style.width = '40%';
    progressText.innerText = "Verifying customer ID against Home Affairs database...";
  }, 400);
  
  setTimeout(() => {
    progressBar.style.width = '80%';
    progressText.innerText = "Validating customer proof of address...";
  }, 900);
  
  setTimeout(() => {
    progressBar.style.width = '100%';
    progressText.innerText = "RICA Validation successful!";
    
    // Update state
    APP_STATE.cart.ricaStatus = 'verified';
    
    // Update indicator
    indicator.innerHTML = `<span style="color: var(--success); display: flex; align-items: center; gap: 4px;"><svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg> Status: Verified</span>`;
    
    showToast("RICA status verified.", "success");
  }, 1400);
}

function updateSimActivationNumber(val) {
  APP_STATE.cart.simActivationNumber = val.trim();
  
  // Re-evaluate Step 10 submissionAllowed and next button state!
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

  let billingValid = false;
  if (APP_STATE.cart.billingSelection) {
    const bill = APP_STATE.cart.billingSelection;
    if (bill.option === 'existing' && bill.selectedId) {
      billingValid = true;
    } else if (bill.option === 'new') {
      const nd = bill.newDebit;
      if (nd.bankName && nd.branchCode && nd.accountType && nd.accountNumber && nd.debiCheckConsent) {
        billingValid = true;
      }
    }
  }

  let vettingValid = false;
  if (APP_STATE.cart.creditVetting && APP_STATE.cart.creditVetting.ran) {
    const cv = APP_STATE.cart.creditVetting;
    if (cv.outcome === 'Successful') {
      vettingValid = true;
    } else if (cv.outcome === 'Referral' && cv.depositPaid) {
      vettingValid = true;
    }
  }

  const detailsValid = APP_STATE.cart.product && APP_STATE.cart.product.category === 'Exlight broadband plans' ?
    (!!APP_STATE.cart.contractDetails.installationContactName && !!APP_STATE.cart.contractDetails.installationContactPhone) : true;
  
  const consentValid = APP_STATE.cart.consent;

  let docsValid = false;
  if (APP_STATE.cart.supportingDocs) {
    const sd = APP_STATE.cart.supportingDocs;
    if (sd.option === 'later') {
      docsValid = true;
    } else if (sd.option === 'now') {
      const uploads = sd.uploads;
      if (uploads.idDoc && uploads.bankStatements && uploads.proofAddress && uploads.companyReg) {
        docsValid = true;
      }
    }
  }

  const roleValid = APP_STATE.currentUser.role === 'agent' || APP_STATE.currentUser.role === 'manager';
  
  let ricaValid = true;
  if (APP_STATE.cart.product && (APP_STATE.cart.product.category === 'SIM-only' || APP_STATE.cart.product.category === 'Handset contracts')) {
    ricaValid = APP_STATE.cart.ricaStatus === 'verified';
  }
  
  let simActivationValid = true;
  const isSimProduct = APP_STATE.cart.product && (APP_STATE.cart.product.category === 'SIM-only' || APP_STATE.cart.product.category === 'Handset contracts');
  if (isSimProduct) {
    simActivationValid = !!APP_STATE.cart.simActivationNumber;
  }

  const submissionAllowed = customerValid && interactionValid && productValid && coverageValid && stockValid && billingValid && vettingValid && detailsValid && consentValid && docsValid && roleValid && ricaValid && simActivationValid;

  document.getElementById('stepper-next-btn').disabled = !submissionAllowed;
  
  // Update the checklist item in DOM directly
  const chkSim = document.getElementById('chk-sim-activation');
  if (chkSim) {
    chkSim.className = `checklist-item ${simActivationValid ? 'pass' : 'fail'}`;
    const badge = chkSim.querySelector('.badge');
    if (badge) {
      badge.className = `badge ${simActivationValid ? 'badge-success' : 'badge-danger'}`;
      badge.innerText = simActivationValid ? 'Pass' : 'Fail';
    }
    const icon = chkSim.querySelector('.checklist-status-icon');
    if (icon) {
      icon.className = `checklist-status-icon ${simActivationValid ? 'pass' : 'fail'}`;
      icon.innerText = simActivationValid ? '✓' : '✗';
    }
  }
}

window.switchStockTab = switchStockTab;
window.handleStockReqDeviceSelectChange = handleStockReqDeviceSelectChange;
window.renderStoreInventoryTab = renderStoreInventoryTab;
window.renderLowStockTab = renderLowStockTab;
window.showLoginForm = showLoginForm;
window.showForgotPasswordForm = showForgotPasswordForm;
window.showOtpForm = showOtpForm;
window.showResetPasswordForm = showResetPasswordForm;
window.handleForgotPasswordSubmit = handleForgotPasswordSubmit;
window.handleOtpSubmit = handleOtpSubmit;
window.handlePasswordResetSubmit = handlePasswordResetSubmit;
window.runRicaValidation = runRicaValidation;
window.updateSimActivationNumber = updateSimActivationNumber;
window.updateProductColor = updateProductColor;
window.updateStepperColor = updateStepperColor;
window.clearCatalogueSearch = clearCatalogueSearch;
window.viewOrderDetails = viewOrderDetails;

// Draft Orders & Tabbed Order Tracking Implementation
function handleSaveDraft() {
  if (!APP_STATE.cart || !APP_STATE.cart.product) {
    showToast("No active cart product to save.", "warning");
    return;
  }
  
  let draftId = APP_STATE.cart.draftId;
  if (!draftId) {
    draftId = "DFT-" + Math.floor(100000 + Math.random() * 900000);
    APP_STATE.cart.draftId = draftId;
  }
  
  const draftIndex = APP_STATE.draftOrders.findIndex(d => d.draftId === draftId);
  const draftObj = {
    draftId: draftId,
    customer: APP_STATE.selectedCustomer || null,
    cart: JSON.parse(JSON.stringify(APP_STATE.cart)),
    currentStep: APP_STATE.currentStep,
    date: new Date().toISOString().replace('T', ' ').slice(0, 19),
    agentId: APP_STATE.currentUser.id,
    branch: APP_STATE.currentUser.branch,
    cimInteraction: APP_STATE.activeCIMInteraction || null
  };
  
  if (draftIndex > -1) {
    APP_STATE.draftOrders[draftIndex] = draftObj;
  } else {
    APP_STATE.draftOrders.unshift(draftObj);
  }
  
  saveDraftOrders();
  showToast(`Draft ${draftId} saved successfully.`, "success");
  closeCustomerSession();
}

function resumeDraftOrder(draftId) {
  const draft = APP_STATE.draftOrders.find(d => d.draftId === draftId);
  if (!draft) {
    showToast("Draft order not found.", "danger");
    return;
  }
  
  APP_STATE.selectedCustomer = draft.customer;
  APP_STATE.cart = JSON.parse(JSON.stringify(draft.cart));
  APP_STATE.currentStep = draft.currentStep;
  APP_STATE.activeCIMInteraction = draft.cimInteraction;
  
  showToast(`Resumed draft order ${draftId}.`, "success");
  switchRoute('order-stepper');
}

function switchTrackingTab(tabName) {
  APP_STATE.activeTrackingTab = tabName;
  
  const subTab = document.getElementById('tracking-tab-btn-submitted');
  const penTab = document.getElementById('tracking-tab-btn-pending');
  const filterPanel = document.getElementById('tracking-filter-panel');
  
  if (tabName === 'submitted') {
    if (subTab) {
      subTab.classList.add('active');
      subTab.style.borderBottom = '3px solid var(--telkom-blue)';
      subTab.style.color = 'var(--telkom-blue-dark)';
      subTab.style.fontWeight = '700';
    }
    if (penTab) {
      penTab.classList.remove('active');
      penTab.style.borderBottom = '3px solid transparent';
      penTab.style.color = 'var(--text-secondary)';
      penTab.style.fontWeight = '600';
    }
    if (filterPanel) filterPanel.style.display = 'block';
  } else {
    if (penTab) {
      penTab.classList.add('active');
      penTab.style.borderBottom = '3px solid var(--telkom-blue)';
      penTab.style.color = 'var(--telkom-blue-dark)';
      penTab.style.fontWeight = '700';
    }
    if (subTab) {
      subTab.classList.remove('active');
      subTab.style.borderBottom = '3px solid transparent';
      subTab.style.color = 'var(--text-secondary)';
      subTab.style.fontWeight = '600';
    }
    if (filterPanel) filterPanel.style.display = 'none';
  }
  
  renderOrderTracking();
}

function getOrderActivationStep(order) {
  if (order.status === 'Active' || (order.simActivationNumber && order.ricaStatus === 'Verified')) {
    return 'completed';
  }
  if (!order.activationStep) {
    if (order.ricaStatus === 'Verified') {
      return 'enter_sim';
    }
    return 'start';
  }
  return order.activationStep;
}

function renderOrderActivationWorkflow(order, container, isModal) {
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

function setPostOrderActivationStep(orderRef, stepVal, containerId) {
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

function submitPostOrderSimNumber(orderRef, containerId) {
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

function runRicaActivationWorkflow(orderRef, containerId) {
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
      
      // Update order details modal parent screen info if open
      if (document.getElementById('order-details-modal').style.display !== 'none') {
        viewOrderDetails(orderRef);
      }
      
      // If we are on the order tracking view, update the rows
      if (APP_STATE.activeRoute === 'order-tracking') {
        renderOrderTracking();
      }
    }
  }, 200);
}

function renderConfirmationRicaActivation() {
  const panel = document.getElementById('confirmation-rica-activation-panel');
  if (!panel) return;

  const orderRef = APP_STATE.cart.orderRef;
  const order = APP_STATE.ordersList.find(o => o.orderRef === orderRef);
  if (!order) return;

  panel.style.display = 'block';
  renderOrderActivationWorkflow(order, panel, false);
}

// Bind to window
window.handleSaveDraft = handleSaveDraft;
window.resumeDraftOrder = resumeDraftOrder;
window.switchTrackingTab = switchTrackingTab;
window.setPostOrderActivationStep = setPostOrderActivationStep;
window.submitPostOrderSimNumber = submitPostOrderSimNumber;
window.runRicaActivationWorkflow = runRicaActivationWorkflow;
window.renderConfirmationRicaActivation = renderConfirmationRicaActivation;
window.renderConfirmationContract = renderConfirmationContract;
window.emailContractToCustomer = emailContractToCustomer;
window.printContractDocument = printContractDocument;

