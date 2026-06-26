// ==========================================
// MOCK DATABASE & STATE CONFIGURATION
// ==========================================

export function isSimOrLteProduct(product) {
  if (!product) return false;
  const cat = (product.category || '').toLowerCase();
  const pkg = (product.package || '').toLowerCase();
  const name = (product.name || '').toLowerCase();
  return (
    cat.includes('sim') ||
    cat.includes('handset') ||
    cat.includes('mobile') ||
    cat.includes('tablet') ||
    pkg.includes('lte') ||
    name.includes('lte') ||
    pkg.includes('sim') ||
    name.includes('sim') ||
    cat.includes('contract') ||
    name.includes('contract')
  );
}

export const MOCK_DB = {
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
        { name: "iPhone 15 Pro Max Contract", type: "Handset contracts", cost: 999, expiry: "2026-12-01" },
        { name: "Flexi SIM 10GB Promo", type: "SIM-only", cost: 99, expiry: "2027-04-30" }
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
        { name: "Infinite Pay-Month SIM Only", type: "SIM-only", cost: 199, expiry: "N/A" },
        { name: "Samsung Galaxy S24 Contract", type: "Handset contracts", cost: 699, expiry: "2027-08-15" }
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
        { name: "Samsung Galaxy S24 Contract", type: "Handset contracts", cost: 699, expiry: "Suspended" },
        { name: "Flexi SIM 10GB Promo", type: "SIM-only", cost: 99, expiry: "2027-03-31" }
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
        { name: "Flexi SIM 10GB Promo", type: "SIM-only", cost: 99, expiry: "2027-04-30" },
        { name: "Infinite Pay-Month SIM Only", type: "SIM-only", cost: 199, expiry: "2027-11-20" }
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
    { id: "p-dev-2", category: "Handset contracts", name: "iPhone 15 Pro Max Contract", type: "Mobile", price: 999, onceOff: 499, term: 24, allocation: "iPhone 15 Pro Max 256GB, 20GB Data, 200 Mins", deviceSKU: "SKU-IP15-256", promo: true, dealId: "DEAL-IP15-24", deviceInfo: { name: "iPhone 15 Pro Max", make: "Apple", model: "iPhone 15 Pro Max 256GB", colour: "Natural Titanium" } }
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

export const DEVICE_CATALOGUE = {
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

export const AUTH_STORAGE_KEY = "telkom_auth_session";

export const DEMO_LOGIN_CREDENTIALS = {
  "AGT-101": { password: "password", name: "Piet van Zyl", role: "agent", branch: "PTA-001" },
  "MGR-002": { password: "password", name: "Store Manager", role: "manager", branch: "PTA-001" },
  "AM-909": { password: "password", name: "Area Director", role: "area_manager", branch: "PTA-001" },
  "ADMIN-001": { password: "password", name: "IT Operations", role: "admin", branch: "PTA-001" }
};

export const APP_STATE = {
  currentUser: {
    id: "AGT-101",
    name: "Piet van Zyl",
    role: "agent",
    branch: "PTA-001",
    assignedStores: ["PTA-001", "JHB-002", "DBN-003"]
  },
  isAuthenticated: false,
  activeRoute: "login",
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
    paymentMethod: "",
    debitDate: "",
    posTxnRef: "",
    receiptNo: "",
    orderRef: "",
    draftId: ""
  },
  stockRequests: [],
  ordersList: [],
  notifications: [],
  currentStep: 1,
  productTerms: {},
  productColors: {},
  draftOrders: [],
  activeTrackingTab: "submitted",
  customerCreateStep: 1,
  isEditingCustomer: false,
  isCustomerIdentifiedInJourney: false,
  newCustomerData: {
    personal: { idNum: "", idType: "SA ID", firstName: "", lastName: "", email: "", mobile: "", altContact: "", marketingConsent: false },
    employment: { status: "", type: "", occupation: "", employerName: "", employerContact: "", startDate: "" },
    address: { line1: "", street: "", suburb: "", city: "", postalCode: "" },
    financial: { grossIncome: "", netIncome: "", expenses: "" },
    banking: { bankName: "", branchCode: "", accountType: "", accountNumber: "", branchName: "", debitDate: "1st", debiCheckConsent: true, creditConsent: false }
  },
  systemHealth: {
    crm: true,
    cim: true,
    oms: true,
    pos: true,
    transact: true,
    gis: true
  }
};

// Seed Mock Data Generator
export function generateMockData() {
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

  for (let i = 1; i <= 65; i++) {
    const day = Math.floor((i - 1) / 5.5) + 1;
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

    const handlingTime = 12 + (i * 13) % 35;
    const revenue = prod.price * (prod.term || 1) + prod.onceOff;

    const isSimProduct = isSimOrLteProduct(prod);
    const ricaStatus = isSimProduct ? (status === 'Fulfilled' ? 'Verified' : 'Pending') : 'N/A';
    const simActivationNumber = isSimProduct && status === 'Fulfilled' ? '892700000000' + (1000000 + i) : '';

    let cancelledAudit = null;
    if (status === "Cancelled") {
      const cancelHour = hour + 1;
      const cancelMinute = (minute + 15) % 60;
      const cancelDateStr = `2026-06-${day < 10 ? '0' + day : day} ${cancelHour < 10 ? '0' + cancelHour : cancelHour}:${cancelMinute < 10 ? '0' + cancelMinute : cancelMinute}`;
      
      const reasons = [
        "Customer changed their mind regarding contract term",
        "Vetting check block requiring higher deposit than customer approved",
        "Stock not available in local store node and request denied",
        "Customer could not provide required POPIA/NCA bank statements",
        "DebiCheck mandate authentication failed at banking gateway"
      ];
      const steps = [
        "Step 3: Confirm Details",
        "Step 5: Billing Selection",
        "Step 6: Credit Vetting",
        "Step 8: Capture Customer Consent",
        "Step 9: Supporting Documents"
      ];

      cancelledAudit = {
        cancelledBy: agent.id,
        cancellationDate: cancelDateStr,
        lastCompletedStep: steps[i % steps.length],
        reason: reasons[i % reasons.length]
      };
    }

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
      isSimProduct: isSimProduct,
      cancelledAudit: cancelledAudit
    });
  }

  for (let i = 1; i <= 15; i++) {
    const day = Math.floor((i - 1) / 1.5) + 1;
    const dateStr = `2026-06-${day < 10 ? '0' + day : day} 10:15`;
    const store = stores[i % stores.length];
    const prod = products[(i + 2) % products.length];
    const qty = 2 + (i % 5) * 2;
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

// Storage loads & saves
export function saveStockRequests() {
  localStorage.setItem("telkom_stock_requests", JSON.stringify(APP_STATE.stockRequests));
}

export function saveOrders() {
  localStorage.setItem("telkom_orders", JSON.stringify(APP_STATE.ordersList));
}

export function saveDraftOrders() {
  localStorage.setItem("telkom_draft_orders", JSON.stringify(APP_STATE.draftOrders));
}

export function saveNotifications() {
  localStorage.setItem("telkom_notifications", JSON.stringify(APP_STATE.notifications));
}

export function saveAuthSession() {
  localStorage.setItem(
    AUTH_STORAGE_KEY,
    JSON.stringify({
      currentUser: APP_STATE.currentUser,
      activeRoute: APP_STATE.activeRoute,
      isAuthenticated: APP_STATE.isAuthenticated
    })
  );
}

export function clearAuthSession() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function restoreAuthSession() {
  const savedSession = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!savedSession) return false;

  try {
    const parsedSession = JSON.parse(savedSession);
    if (!parsedSession?.currentUser) return false;

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

export function loadStateFromStorage() {
  const savedOrders = localStorage.getItem("telkom_orders");
  const savedRequests = localStorage.getItem("telkom_stock_requests");

  if (savedOrders && JSON.parse(savedOrders).length > 10) {
    APP_STATE.ordersList = JSON.parse(savedOrders);
    const needsAuditRegen = APP_STATE.ordersList.some(o => o.status === 'Cancelled' && !o.cancelledAudit);
    if (needsAuditRegen) {
      const mock = generateMockData();
      APP_STATE.ordersList = mock.orders;
      saveOrders();
    }
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

export const BANK_OPTIONS = [
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

