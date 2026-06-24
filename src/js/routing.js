import { APP_STATE, clearAuthSession, saveAuthSession, saveNotifications } from './state.js';
import { showToast, updateNotificationsBadge } from './utils.js';
import { renderAgentDashboard, renderManagerDashboard, renderAreaDashboard, renderAdminDashboard } from './dashboards.js';
import { renderCustomerCreateStep, renderCustomer360 } from './customer.js';
import { renderCatalogue } from './catalogue.js';
import { renderStepper, renderPaymentScreen, renderConfirmationReceipt } from './stepper.js';
import { renderOrderTracking } from './tracking.js';
import { switchStockTab } from './stock.js';
import { renderReports, renderRecordLogs } from './reports.js';

export function updateSessionBanner() {
  const banner = document.getElementById('session-banner');
  if (!banner) return;

  const hasCustomer = !!APP_STATE.selectedCustomer;
  const hasProduct = !!APP_STATE.cart.product;

  if (hasCustomer || hasProduct) {
    banner.style.display = 'flex';
    const nameEl = document.getElementById('session-customer-name');
    const accEl = document.getElementById('session-account-no');
    
    if (hasCustomer) {
      if (nameEl) nameEl.innerText = APP_STATE.selectedCustomer.name;
      if (accEl) accEl.innerText = APP_STATE.selectedCustomer.accountNumber;
    } else {
      if (nameEl) nameEl.innerText = "Awaiting Customer Selection";
      if (accEl) accEl.innerText = "N/A";
    }
    
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

    const sessionCancelBtn = document.getElementById('session-cancel-order-btn');
    if (sessionCancelBtn) {
      if (hasProduct) {
        sessionCancelBtn.style.display = 'inline-block';
        sessionCancelBtn.disabled = !hasCustomer;
        sessionCancelBtn.style.opacity = !hasCustomer ? '0.5' : '1';
        sessionCancelBtn.style.cursor = !hasCustomer ? 'not-allowed' : 'pointer';
      } else {
        sessionCancelBtn.style.display = 'none';
      }
    }

    const endJourneyBtn = document.getElementById('session-end-journey-btn');
    if (endJourneyBtn) {
      endJourneyBtn.disabled = !hasCustomer;
      endJourneyBtn.style.opacity = !hasCustomer ? '0.5' : '1';
      endJourneyBtn.style.cursor = !hasCustomer ? 'not-allowed' : 'pointer';
    }

    const view360Btn = document.getElementById('session-view-360-btn');
    if (view360Btn) {
      view360Btn.disabled = !hasCustomer;
      view360Btn.style.opacity = !hasCustomer ? '0.5' : '1';
      view360Btn.style.cursor = !hasCustomer ? 'not-allowed' : 'pointer';
    }
  } else {
    banner.style.display = 'none';
  }
}

export function updateSidebarMenuOptions() {
  const role = APP_STATE.currentUser.role;
  const menuContainer = document.getElementById('sidebar-dynamic-menu');
  if (!menuContainer) return;
  menuContainer.innerHTML = '';

  const roleIndicator = document.getElementById('sidebar-role-indicator');
  const userFullname = document.getElementById('nav-user-fullname');
  const userRolename = document.getElementById('nav-user-rolename');

  if (roleIndicator) roleIndicator.innerText = role;
  if (userFullname) userFullname.innerText = APP_STATE.currentUser.name;
  if (userRolename) userRolename.innerText = role.toUpperCase();

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

  html += `
    <div class="menu-section-title">System & Settings</div>
    <ul class="sidebar-menu-list">
      <li class="sidebar-menu-item"><a class="sidebar-link" data-route="notifications" onclick="switchRoute('notifications')"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg><span>Notifications</span></a></li>
      <li class="sidebar-menu-item"><a class="sidebar-link" onclick="handleLogout()"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg><span>Log Out</span></a></li>
    </ul>
  `;

  menuContainer.innerHTML = html;
}

export function renderScreen(route) {
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
      try {
        // notification view is loaded dynamically from app entry points
        const viewNotifications = window.renderNotificationsView;
        if (viewNotifications) viewNotifications();
      } catch(e) { console.error('renderNotificationsView error:', e); }
      break;
  }
}

export function switchRoute(route) {
  if (!APP_STATE.isAuthenticated && route !== 'login') {
    route = 'login';
  }

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
    if (mainLayout) mainLayout.style.setProperty('margin-left', '');
  }
  
  document.querySelectorAll('.sidebar-link').forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('data-route') === route) {
      link.classList.add('active');
    }
  });

  document.querySelectorAll('.view-container').forEach(view => {
    view.style.display = 'none';
  });

  const targetView = document.getElementById(`view-${route}`);
  if (targetView) {
    targetView.style.display = 'block';
    renderScreen(route);
  }

  if (route === 'login') {
    clearAuthSession();
    APP_STATE.isAuthenticated = false;
  } else if (APP_STATE.isAuthenticated) {
    saveAuthSession();
  }
}

// Bind to window for inline onclicks in HTML
window.switchRoute = switchRoute;
window.renderScreen = renderScreen;
window.updateSidebarMenuOptions = updateSidebarMenuOptions;
window.updateSessionBanner = updateSessionBanner;

// UAT panel interactions
export function toggleUatPanel() {
  const p = document.getElementById('uat-controller-panel');
  if (p) p.classList.toggle('collapsed');
}
window.toggleUatPanel = toggleUatPanel;

// Toggle notifications drawer overlay
export function toggleNotificationsDrawer() {
  const drawer = document.getElementById('notifications-drawer');
  if (!drawer) return;
  drawer.classList.toggle('open');
  if (drawer.classList.contains('open')) {
    renderNotificationsDrawerBody();
  }
}
window.toggleNotificationsDrawer = toggleNotificationsDrawer;

export function renderNotificationsDrawerBody() {
  const body = document.getElementById('drawer-notifications-list');
  if (!body) return;
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
window.renderNotificationsDrawerBody = renderNotificationsDrawerBody;

// Toggle read state of notification
export function markNotificationRead(id, link) {
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
window.markNotificationRead = markNotificationRead;

// Render Notifications Tray
export function renderNotificationsView() {
  const container = document.getElementById('notifications-page-list');
  if (!container) return;
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
window.renderNotificationsView = renderNotificationsView;
