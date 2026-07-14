const fs = require('fs');
const path = require('path');

// Ensure Designs directory exists
const designsDir = path.join(__dirname, 'Designs');
if (!fs.existsSync(designsDir)) {
  fs.mkdirSync(designsDir);
}

// Copy Images recursively
const srcImagesDir = path.join(__dirname, 'public', 'Images');
const destImagesDir = path.join(designsDir, 'Images');
if (!fs.existsSync(destImagesDir)) {
  fs.mkdirSync(destImagesDir);
}

if (fs.existsSync(srcImagesDir)) {
  const files = fs.readdirSync(srcImagesDir);
  files.forEach(file => {
    const srcFile = path.join(srcImagesDir, file);
    const destFile = path.join(destImagesDir, file);
    if (fs.statSync(srcFile).isFile()) {
      fs.copyFileSync(srcFile, destFile);
    }
  });
  console.log('Copied Images to Designs/Images/');
}

// Read index.html and app.css
const indexHtml = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const cssContent = fs.readFileSync(path.join(__dirname, 'src', 'styles', 'app.css'), 'utf8');

// Define views list
const views = [
  { id: 'view-login', name: 'login', role: 'guest' },
  { id: 'view-agent-dashboard', name: 'agent-dashboard', role: 'agent' },
  { id: 'view-manager-dashboard', name: 'manager-dashboard', role: 'manager' },
  { id: 'view-area-dashboard', name: 'area-dashboard', role: 'area_manager' },
  { id: 'view-admin-dashboard', name: 'admin-dashboard', role: 'admin' },
  { id: 'view-customer-search', name: 'customer-search', role: 'agent' },
  { id: 'view-customer-create', name: 'customer-create', role: 'agent' },
  { id: 'view-customer-360', name: 'customer-360', role: 'agent' },
  { id: 'view-check-coverage', name: 'check-coverage', role: 'agent' },
  { id: 'view-catalogue', name: 'catalogue', role: 'agent' },
  { id: 'view-order-stepper', name: 'order-stepper', role: 'agent' },
  { id: 'view-payment', name: 'payment', role: 'agent' },
  { id: 'view-confirmation', name: 'confirmation', role: 'agent' },
  { id: 'view-order-tracking', name: 'order-tracking', role: 'agent' },
  { id: 'view-stock-requests', name: 'stock-requests', role: 'agent' },
  { id: 'view-reports', name: 'reports', role: 'manager' },
  { id: 'view-record-logs', name: 'record-logs', role: 'manager' },
  { id: 'view-notifications', name: 'notifications', role: 'agent' },
  { id: 'view-profile', name: 'profile', role: 'agent' }
];

// Helper to extract outer HTML matching nested divs
function extractViewContent(html, viewId) {
  const startIdx = html.indexOf(`id="${viewId}"`);
  if (startIdx === -1) return null;
  
  const tagStartIdx = html.lastIndexOf('<div', startIdx);
  if (tagStartIdx === -1) return null;
  
  let openDivs = 0;
  let currentIdx = tagStartIdx;
  
  while (currentIdx < html.length) {
    if (html.startsWith('<div', currentIdx)) {
      openDivs++;
      currentIdx += 4;
    } else if (html.startsWith('</div>', currentIdx)) {
      openDivs--;
      currentIdx += 6;
      if (openDivs === 0) {
        return html.substring(tagStartIdx, currentIdx);
      }
    } else {
      currentIdx++;
    }
  }
  return null;
}

// Sidebars Map
const sidebars = {
  agent: `
    <div class="menu-section-title">Retail Agent Operations</div>
    <ul class="sidebar-menu-list">
      <li class="sidebar-menu-item"><a class="sidebar-link [ACTIVE_agent-dashboard]" href="agent-dashboard.html"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg><span>Dashboard</span></a></li>
      <li class="sidebar-menu-item"><a class="sidebar-link [ACTIVE_customer-search]" href="customer-search.html"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg><span>Customer Search</span></a></li>
      <li class="sidebar-menu-item"><a class="sidebar-link [ACTIVE_catalogue]" href="catalogue.html"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg><span>Product Catalogue</span></a></li>
      <li class="sidebar-menu-item"><a class="sidebar-link [ACTIVE_order-tracking]" href="order-tracking.html"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg><span>Orders</span></a></li>
    </ul>
    <div class="menu-section-title">Branch Tools</div>
    <ul class="sidebar-menu-list">
      <li class="sidebar-menu-item"><a class="sidebar-link [ACTIVE_check-coverage]" href="check-coverage.html"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg><span>Coverage Check</span></a></li>
      <li class="sidebar-menu-item"><a class="sidebar-link [ACTIVE_stock-requests]" href="stock-requests.html"><svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg><span>Stocks</span></a></li>
    </ul>
    <div class="menu-section-title">System & Settings</div>
    <ul class="sidebar-menu-list">
      <li class="sidebar-menu-item"><a class="sidebar-link [ACTIVE_notifications]" href="notifications.html"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg><span>Notifications</span></a></li>
      <li class="sidebar-menu-item"><a class="sidebar-link" href="login.html"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg><span>Log Out</span></a></li>
    </ul>
  `,
  manager: `
    <div class="menu-section-title">Manager Operations</div>
    <ul class="sidebar-menu-list">
      <li class="sidebar-menu-item"><a class="sidebar-link [ACTIVE_manager-dashboard]" href="manager-dashboard.html"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg><span>Dashboard</span></a></li>
      <li class="sidebar-menu-item"><a class="sidebar-link [ACTIVE_customer-search]" href="customer-search.html"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg><span>Customer Search</span></a></li>
      <li class="sidebar-menu-item"><a class="sidebar-link [ACTIVE_catalogue]" href="catalogue.html"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg><span>Product Catalogue</span></a></li>
      <li class="sidebar-menu-item"><a class="sidebar-link [ACTIVE_order-tracking]" href="order-tracking.html"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg><span>Orders</span></a></li>
      <li class="sidebar-menu-item"><a class="sidebar-link [ACTIVE_reports]" href="reports.html"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg><span>Reports</span></a></li>
      <li class="sidebar-menu-item"><a class="sidebar-link [ACTIVE_record-logs]" href="record-logs.html"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg><span>Record Logs</span></a></li>
    </ul>
    <div class="menu-section-title">Branch Tools</div>
    <ul class="sidebar-menu-list">
      <li class="sidebar-menu-item"><a class="sidebar-link [ACTIVE_check-coverage]" href="check-coverage.html"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg><span>Coverage Check</span></a></li>
      <li class="sidebar-menu-item"><a class="sidebar-link [ACTIVE_stock-requests]" href="stock-requests.html"><svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg><span>Stocks</span></a></li>
    </ul>
    <div class="menu-section-title">System & Settings</div>
    <ul class="sidebar-menu-list">
      <li class="sidebar-menu-item"><a class="sidebar-link [ACTIVE_notifications]" href="notifications.html"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg><span>Notifications</span></a></li>
      <li class="sidebar-menu-item"><a class="sidebar-link" href="login.html"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg><span>Log Out</span></a></li>
    </ul>
  `,
  area_manager: `
    <div class="menu-section-title">Area Operations</div>
    <ul class="sidebar-menu-list">
      <li class="sidebar-menu-item"><a class="sidebar-link [ACTIVE_area-dashboard]" href="area-dashboard.html"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg><span>Area Dashboard</span></a></li>
      <li class="sidebar-menu-item"><a class="sidebar-link [ACTIVE_order-tracking]" href="order-tracking.html"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg><span>Orders</span></a></li>
      <li class="sidebar-menu-item"><a class="sidebar-link [ACTIVE_reports]" href="reports.html"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg><span>Reports</span></a></li>
      <li class="sidebar-menu-item"><a class="sidebar-link [ACTIVE_record-logs]" href="record-logs.html"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg><span>Record Logs</span></a></li>
    </ul>
    <div class="menu-section-title">System & Settings</div>
    <ul class="sidebar-menu-list">
      <li class="sidebar-menu-item"><a class="sidebar-link [ACTIVE_notifications]" href="notifications.html"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg><span>Notifications</span></a></li>
      <li class="sidebar-menu-item"><a class="sidebar-link" href="login.html"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg><span>Log Out</span></a></li>
    </ul>
  `,
  admin: `
    <div class="menu-section-title">IT Administration</div>
    <ul class="sidebar-menu-list">
      <li class="sidebar-menu-item"><a class="sidebar-link [ACTIVE_admin-dashboard]" href="admin-dashboard.html"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"></path></svg><span>Health Portal</span></a></li>
      <li class="sidebar-menu-item"><a class="sidebar-link [ACTIVE_reports]" href="reports.html"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg><span>Reports</span></a></li>
      <li class="sidebar-menu-item"><a class="sidebar-link [ACTIVE_record-logs]" href="record-logs.html"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg><span>Record Logs</span></a></li>
      <li class="sidebar-menu-item"><a class="sidebar-link [ACTIVE_notifications]" href="notifications.html"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg><span>Integration Alerts</span></a></li>
    </ul>
    <div class="menu-section-title">System & Settings</div>
    <ul class="sidebar-menu-list">
      <li class="sidebar-menu-item"><a class="sidebar-link" href="login.html"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg><span>Log Out</span></a></li>
    </ul>
  `
};

// Split index.html into header and footer structures
const viewPortMarker = '<!-- MAIN CONTENT VIEWPORT -->';
const markerIdx = indexHtml.indexOf(viewPortMarker);

let baseHeaderHtml = indexHtml.substring(0, markerIdx);
const contentViewportStartIdx = indexHtml.indexOf('<div class="content-viewport">', markerIdx);
const baseHeaderPart = indexHtml.substring(0, contentViewportStartIdx + '<div class="content-viewport">'.length);

const lastViewContent = extractViewContent(indexHtml, 'view-profile');
const lastViewEndIdx = indexHtml.indexOf(lastViewContent) + lastViewContent.length;
const baseFooterPart = indexHtml.substring(lastViewEndIdx);

// Embed css directly inside a <style> block inside the head
let processedHeader = baseHeaderPart
  .replace('<link rel="stylesheet" href="/src/styles/app.css">', `<style>${cssContent}</style>`)
  .replace(/Images\//g, 'Images/');

let processedFooter = baseFooterPart
  .replace(/<script type="module" src="\/src\/app.js"><\/script>/g, '')
  .replace(/<script[^>]*src="[^"]*app\.js"[^>]*><\/script>/g, '');

// Process views
views.forEach(view => {
  let viewContent = extractViewContent(indexHtml, view.id);
  if (!viewContent) {
    console.error(`Could not find content for ${view.id}`);
    return;
  }

  // Set view to block display
  viewContent = viewContent.replace(`id="${view.id}" class="view-container" style="display: none;"`, `id="${view.id}" class="view-container" style="display: block;"`);
  viewContent = viewContent.replace(`id="${view.id}" class="view-container" style="padding:0; background:transparent;"`, `id="${view.id}" class="view-container" style="display: block; padding:0; background:transparent;"`);

  // Inject visual mock data for empty containers
  if (view.name === 'agent-dashboard') {
    viewContent = viewContent
      .replace('id="agent-today-count">0', 'id="agent-today-count">12')
      .replace('id="agent-drafts-count">0', 'id="agent-drafts-count">4')
      .replace('id="agent-completed-count">0', 'id="agent-completed-count">11')
      .replace('id="agent-stock-alerts-count">0', 'id="agent-stock-alerts-count">2')
      .replace('<!-- Best Selling Products Rendered here -->', `
        <div class="product-card">
          <div class="product-badge-promo">PROMO</div>
          <img class="product-image" src="Images/iphone_15_pro_max.png" alt="iPhone 15 Pro Max">
          <div class="product-card-body">
            <span class="product-category" style="padding-right: 55px;">Handsets</span>
            <h4 class="product-name">iPhone 15 Pro Max 256GB</h4>
            <p class="product-subtitle">Natural Titanium - Top Seller</p>
            <div class="product-price-row" style="margin-top:12px;">
              <span class="product-price">R 1,299 <small>/ month</small></span>
              <span class="product-term-badge">24 mos</span>
            </div>
          </div>
        </div>
        <div class="product-card">
          <img class="product-image" src="Images/samsung_galaxy_s24.png" alt="Samsung S24">
          <div class="product-card-body">
            <span class="product-category">Handsets</span>
            <h4 class="product-name">Samsung Galaxy S24 Ultra</h4>
            <p class="product-subtitle">Titanium Gray - Promo Deal</p>
            <div class="product-price-row" style="margin-top:12px;">
              <span class="product-price">R 1,199 <small>/ month</small></span>
              <span class="product-term-badge">24 mos</span>
            </div>
          </div>
        </div>
      `)
      .replace('<!-- Leaderboard of top products -->', `
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">
          <span>1. Infinite Fibre 100Mbps</span>
          <span style="font-weight:700; color: var(--telkom-blue)">45 orders</span>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">
          <span>2. iPhone 15 Pro Max 256GB</span>
          <span style="font-weight:700; color: var(--telkom-blue)">38 orders</span>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span>3. LTE Unlimited Prep</span>
          <span style="font-weight:700; color: var(--telkom-blue)">22 orders</span>
        </div>
      `)
      .replace('id="agent-recent-orders-tbody">\n                        <!-- Rendered dynamically -->', `id="agent-recent-orders-tbody">
        <tr>
          <td><span class="order-ref-link" style="font-weight:700;">ORD-89472</span></td>
          <td>John Doe</td>
          <td>Infinite Fibre 50M</td>
          <td>2026-07-14 15:40</td>
          <td><span class="badge badge-success">Active</span></td>
        </tr>
        <tr>
          <td><span class="order-ref-link" style="font-weight:700;">ORD-89461</span></td>
          <td>Sarah Jenkins</td>
          <td>iPhone 15 Pro Max</td>
          <td>2026-07-14 14:15</td>
          <td><span class="badge badge-warning">Submitted</span></td>
        </tr>`)
      .replace('<!-- Draft orders table body -->', `
        <tr>
          <td>DFT-103</td>
          <td>David G.</td>
          <td>Samsung S24 Ultra</td>
          <td>Step 3: Confirm Details</td>
          <td>2 hours ago</td>
          <td><button class="btn btn-xs btn-outline">Continue</button></td>
        </tr>
      `);
  } else if (view.name === 'manager-dashboard') {
    viewContent = viewContent
      .replace('id="mgr-today-revenue">R 0.00', 'id="mgr-today-revenue">R 45,230.00')
      .replace('id="mgr-today-orders">0', 'id="mgr-today-orders">89')
      .replace('id="mgr-stock-requests">0', 'id="mgr-stock-requests">5')
      .replace('id="mgr-pending-approvals">0', 'id="mgr-pending-approvals">3')
      .replace('<!-- Manager Top Products list -->', `
        <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
          <span>Infinite Fibre 100M</span>
          <strong>R 28,499.00</strong>
        </div>
        <div style="display:flex; justify-content:space-between;">
          <span>iPhone 15 Pro Max</span>
          <strong>R 16,730.00</strong>
        </div>
      `)
      .replace('<!-- Manager pending stock requests list -->', `
        <tr>
          <td>REQ-1004</td>
          <td>iPhone 15 Pro Max 256GB</td>
          <td>4 units</td>
          <td><span class="badge badge-warning">Awaiting Approval</span></td>
          <td><button class="btn btn-xs btn-primary">Review</button></td>
        </tr>
      `);
  } else if (view.name === 'area-dashboard') {
    viewContent = viewContent
      .replace('id="am-active-stores">0', 'id="am-active-stores">18')
      .replace('id="am-region-revenue">R 0.00', 'id="am-region-revenue">R 1,845,200.00')
      .replace('<!-- Area Manager stores table -->', `
        <tr>
          <td><strong>PTA-001</strong></td>
          <td>Pretoria Main</td>
          <td>Piet van Zyl</td>
          <td>R 425,100.00</td>
          <td><span class="health-dot" style="background:#10B981; display:inline-block; width:10px; height:10px; border-radius:50%;"></span> Normal</td>
          <td><button class="btn btn-xs btn-outline">Explore</button></td>
        </tr>
        <tr>
          <td><strong>JHB-002</strong></td>
          <td>Johannesburg Hub</td>
          <td>Nomsa Dube</td>
          <td>R 612,400.00</td>
          <td><span class="health-dot" style="background:#10B981; display:inline-block; width:10px; height:10px; border-radius:50%;"></span> Normal</td>
          <td><button class="btn btn-xs btn-outline">Explore</button></td>
        </tr>
      `);
  } else if (view.name === 'catalogue') {
    // Correctly replace the "Rendered dynamically" placeholder inside catalogue grid
    viewContent = viewContent.replace('<!-- Rendered dynamically -->', `
      <div class="product-card">
        <div class="product-badge-promo">PROMO</div>
        <img class="product-image" src="Images/iphone_15_pro_max.png" alt="iPhone 15 Pro Max">
        <div class="product-card-body">
          <span class="product-category" style="padding-right:55px;">Handsets</span>
          <h4 class="product-name">iPhone 15 Pro Max 256GB</h4>
          <div class="product-price-row">
            <span class="product-price">R 1,299 <small>/ month</small></span>
          </div>
          <button class="btn btn-sm btn-primary" style="width:100%; margin-top:12px;">Select Product</button>
        </div>
      </div>
      <div class="product-card">
        <img class="product-image" src="Images/samsung_galaxy_s24.png" alt="Samsung S24">
        <div class="product-card-body">
          <span class="product-category">Handsets</span>
          <h4 class="product-name">Samsung Galaxy S24 Ultra</h4>
          <div class="product-price-row">
            <span class="product-price">R 1,199 <small>/ month</small></span>
          </div>
          <button class="btn btn-sm btn-primary" style="width:100%; margin-top:12px;">Select Product</button>
        </div>
      </div>
      <div class="product-card">
        <div style="height:150px; background:#F3F4F6; display:flex; align-items:center; justify-content:center; border-radius:8px;">
          <svg width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071a9.9 9.9 0 0114.14 0M1.06 6.06a14.9 14.9 0 0121.88 0"></path></svg>
        </div>
        <div class="product-card-body">
          <span class="product-category">LTE Broadband</span>
          <h4 class="product-name">LTE Unlimited Premium</h4>
          <div class="product-price-row">
            <span class="product-price">R 599 <small>/ month</small></span>
          </div>
          <button class="btn btn-sm btn-primary" style="width:100%; margin-top:12px;">Select Product</button>
        </div>
      </div>
    `);
  } else if (view.name === 'customer-360') {
    viewContent = viewContent
      .replace('id="cust-360-fullname">-', 'id="cust-360-fullname">Johnathan Doe')
      .replace('id="cust-360-id">-', 'id="cust-360-id">870412 5066 088')
      .replace('id="cust-360-status">-', 'id="cust-360-status"><span class="badge badge-success">Active Customer</span>')
      .replace('id="cust-360-contact">-', 'id="cust-360-contact">john.doe@gmail.com / +27 72 456 7890')
      .replace('id="cust-360-segment">-', 'id="cust-360-segment">Consumer Premium')
      .replace('id="cust-360-account">-', 'id="cust-360-account">TEL-481940173')
      .replace('id="cust-360-credit-limit">-', 'id="cust-360-credit-limit">R 2,500.00')
      .replace('id="cust-360-active-contracts">-', 'id="cust-360-active-contracts">1 Active')
      .replace('id="cust-360-address">-', 'id="cust-360-address">124 Church Street, Pretoria Central')
      .replace('id="cust-360-debit-status">-', 'id="cust-360-debit-status"><span class="badge badge-success">Verified DebiCheck</span>')
      .replace('<!-- Customer active products list -->', `
        <div style="padding:12px; border:1px solid var(--border-color); border-radius:6px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center;">
          <div>
            <h5 style="margin:0;">Infinite Fibre 50M</h5>
            <span style="font-size:11px; color:var(--text-muted);">Account: TEL-481940173 | Installed: 2025-02-10</span>
          </div>
          <strong>R 499.00 / mo</strong>
        </div>
      `);
  } else if (view.name === 'order-tracking') {
    viewContent = viewContent.replace('<!-- Dynamically rendered by JS -->', `
      <table class="custom-table">
        <thead>
          <tr>
            <th>Order Ref</th>
            <th>Customer</th>
            <th>Product</th>
            <th>Price</th>
            <th>Status</th>
            <th>Store</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>ORD-89472</td>
            <td>John Doe</td>
            <td>Infinite Fibre 50M</td>
            <td>R 499.00</td>
            <td><span class="badge badge-success">Active</span></td>
            <td>PTA-001</td>
            <td>2026-07-14</td>
          </tr>
          <tr>
            <td>ORD-89461</td>
            <td>Sarah Jenkins</td>
            <td>iPhone 15 Pro Max</td>
            <td>R 1,299.00</td>
            <td><span class="badge badge-warning">Submitted</span></td>
            <td>PTA-001</td>
            <td>2026-07-14</td>
          </tr>
        </tbody>
      </table>
    `);
  } else if (view.name === 'stock-requests') {
    viewContent = viewContent.replace('<!-- Stock requests list rows loaded dynamically -->', `
      <tr>
        <td>REQ-1004</td>
        <td>PTA-001</td>
        <td>iPhone 15 Pro Max</td>
        <td>4 units</td>
        <td>Urgent</td>
        <td><span class="badge badge-warning">Awaiting Approval</span></td>
        <td>2026-07-14</td>
      </tr>
      <tr>
        <td>REQ-1003</td>
        <td>PTA-001</td>
        <td>LTE Router B535</td>
        <td>15 units</td>
        <td>Normal</td>
        <td><span class="badge badge-success">Approved</span></td>
        <td>2026-07-13</td>
      </tr>
    `);
  } else if (view.name === 'record-logs') {
    viewContent = viewContent.replace('<!-- Dynamic log rows populated by JS -->', `
      <tr>
        <td><code>2026-07-14 15:42:01</code></td>
        <td><span class="badge badge-info">INFO</span></td>
        <td>SYSTEM</td>
        <td>Order completed and submitted to OMS: ORD-89472</td>
      </tr>
      <tr>
        <td><code>2026-07-14 15:40:15</code></td>
        <td><span class="badge badge-success">SUCCESS</span></td>
        <td>AGENT</td>
        <td>POS payment verified successfully: R 499.00</td>
      </tr>
    `);
  } else if (view.name === 'notifications') {
    viewContent = viewContent.replace('<!-- Notifications items list loaded dynamically -->', `
      <div style="padding:12px; border:1px solid var(--border-color); border-radius:6px; margin-bottom:12px; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <strong style="display:block; color:var(--telkom-blue);">New Stock Request Submitted</strong>
          <span style="font-size:13px; color:var(--text-secondary)">Store JHB-002 has submitted a stock request REQ-1001.</span>
        </div>
        <span style="font-size:11px; color:var(--text-muted)">2026-06-12 10:00</span>
      </div>
      <div style="padding:12px; border:1px solid var(--border-color); border-radius:6px; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <strong style="display:block;">Stock Request Approved</strong>
          <span style="font-size:13px; color:var(--text-secondary)">Your stock request REQ-1003 has been approved by Area Manager.</span>
        </div>
        <span style="font-size:11px; color:var(--text-muted)">2026-06-12 09:05</span>
      </div>
    `);
  }

  // Handle Header/Sidebar visibility
  let headerHtml = processedHeader;
  if (view.role === 'guest') {
    headerHtml = headerHtml
      .replace('aside class="sidebar" id="app-sidebar" style="display: none;"', 'aside class="sidebar" id="app-sidebar" style="display: none;"')
      .replace('header class="header" id="app-header" style="display: none;"', 'header class="header" id="app-header" style="display: none;"')
      .replace('margin-left: 0 !important', 'margin-left: 0 !important');
  } else {
    headerHtml = headerHtml
      .replace('aside class="sidebar" id="app-sidebar" style="display: none;"', 'aside class="sidebar" id="app-sidebar" style="display: flex;"')
      .replace('header class="header" id="app-header" style="display: none;"', 'header class="header" id="app-header" style="display: flex;"')
      .replace('id="sidebar-role-indicator">agent', `id="sidebar-role-indicator">${view.role}`)
      .replace('nav-user-rolename">AGENT', `nav-user-rolename">${view.role.toUpperCase()}`);

    // Set user name/avatar in sidebar footer based on role
    if (view.role === 'manager') {
      headerHtml = headerHtml.replace('nav-avatar">PZ', 'nav-avatar">SM').replace('nav-user-fullname">Piet van Zyl', 'nav-user-fullname">Store Manager');
    } else if (view.role === 'area_manager') {
      headerHtml = headerHtml.replace('nav-avatar">PZ', 'nav-avatar">AD').replace('nav-user-fullname">Piet van Zyl', 'nav-user-fullname">Area Director');
    } else if (view.role === 'admin') {
      headerHtml = headerHtml.replace('nav-avatar">PZ', 'nav-avatar">IT').replace('nav-user-fullname">Piet van Zyl', 'nav-user-fullname">IT Operations');
    }

    // Populate dynamic sidebar menu
    const menuHtml = sidebars[view.role] || sidebars.agent;
    const activeLinkToken = `[ACTIVE_${view.name}]`;
    const activeMenuHtml = menuHtml.replace(activeLinkToken, 'active').replace(/\[ACTIVE_[^\]]+\]/g, '');
    headerHtml = headerHtml.replace('<!-- Sidebar items populated dynamically by JS based on user role -->', activeMenuHtml);
  }

  // Combine components into standalone file
  const fullHtml = `<!-- Standalone Static Design File for Screen: ${view.name} -->\n` + headerHtml + '\n' + viewContent + '\n' + processedFooter;
  
  // Write to Designs/
  fs.writeFileSync(path.join(designsDir, `${view.name}.html`), fullHtml);
  console.log(`Generated Designs/${view.name}.html`);
});

console.log('Successfully completed screen designs extraction!');
