// Telkom Retail Unified Digital Journey Platform - Core Application Entry Point
import {
  MOCK_DB,
  APP_STATE,
  DEMO_LOGIN_CREDENTIALS,
  loadStateFromStorage,
  saveAuthSession,
  clearAuthSession
} from './js/state.js';

import {
  showToast,
  pushNotification,
  openModal,
  closeModal,
  updateNotificationsBadge,
  maskID,
  maskPassport,
  drawSVGDonutChart
} from './js/utils.js';

import {
  switchRoute,
  renderScreen,
  updateSidebarMenuOptions,
  toggleUatPanel,
  toggleNotificationsDrawer,
  markNotificationRead
} from './js/routing.js';

import {
  renderAgentDashboard,
  renderManagerDashboard,
  renderAreaDashboard,
  renderAdminDashboard,
  handleUatRoleChange,
  showProductDetails,
  closeProductDrawer
} from './js/dashboards.js';

import {
  handleCustomerSearch,
  renderCustomer360,
  closeCustomerSession,
  openNewCustomerWizard,
  handleCustomerCreateNext,
  handleCustomerCreateBack,
  renderCustomerCreateStep,
  handleCreateCustomerSubmit,
  handleEditCustomerSubmit,
  renderCustomer360Documents,
  identifyCustomer,
  openCreateCustomerModal,
  openEditCustomerModal,
  startOrderCaptureForCustomer,
  handleCustStepperClick
} from './js/customer.js';

import {
  renderCatalogue,
  getProductTermAndPrice,
  updateProductTermPrice,
  updateProductColor,
  clearCatalogueSearch
} from './js/catalogue.js';

import {
  renderCheckCoverageScreen,
  checkStandaloneCoverage,
  proceedFromCoverageToCatalogue
} from './js/coverage.js';

import {
  getActiveStepsForProduct,
  getStepperStepTitle,
  renderStepperHeader,
  renderStepper,
  renderStepperCustomerSearch,
  searchCustomerInStepper,
  handleStepperCustSearchKeydown,
  linkCustomerInStepper,
  unlinkCustomerInStepper,
  openNewCustomerWizardFromStepper,
  linkCustomerAndReturnToStepper,
  updateTempAddress,
  renderStepperBillingSelection,
  updateBillingSelection,
  handleBillingNewInput,
  saveBillingInputs,
  toggleBillingBankMenu,
  filterBillingBankOptions,
  selectBillingBankOption,
  renderStepperCreditVetting,
  runCreditVettingCheck,
  payCreditVettingDeposit,
  renderStepperSupportingDocs,
  updateDocsOption,
  saveDocsOptionInput,
  triggerBrowseDoc,
  handleDocFileSelected,
  removeUploadedDoc,
  handleDocDragOver,
  handleDocDragLeave,
  handleDocDrop,
  simulateDocUpload,
  renderStepperCoverageCheck,
  updateStepperColor,
  renderStepperStockCheck,
  renderStepperContractDetails,
  renderStepperReviewChecklist,
  toggleConsent,
  simulateGisAddressCheck,
  forceCoverageAcceptance,
  simulateGisApiRetry,
  simulateStockCheckAction,
  simulateStockApiRetry,
  notifyStoreManagerForStock,
  selectProductForStepper,
  handleStepperBack,
  handleStepperNext,
  handleCancelOrder,
  submitCustomCancellation,
  cancelToSaveDraft,
  updateCIMState,
  updateCIMNotesCount,
  updateContractDetailsState,
  submitOrderToOMS,
  renderPaymentScreen,
  handlePOSPaymentTrigger,
  renderConfirmationReceipt,
  renderConfirmationContract,
  renderConfirmationRicaActivation,
  downloadContractOnly,
  handlePaymentMethodChange
} from './js/stepper.js';

import {
  renderOrderTracking,
  switchTrackingTab,
  viewOrderDetails,
  downloadOrderReceipt,
  emailContractToCustomer,
  printContractDocument,
  handleSaveDraft,
  resumeDraftOrder,
  getOrderActivationStep,
  renderOrderActivationWorkflow,
  setPostOrderActivationStep,
  submitPostOrderSimNumber,
  runRicaActivationWorkflow,
  switchModalTab
} from './js/tracking.js';

import {
  renderStockRequests,
  initiateStockRequest,
  handleStockRequestSubmit,
  openApprovalModal,
  toggleDeclineReasonArea,
  handleApprovalSubmit,
  viewStockRequestDetails,
  renderStoreInventoryTab,
  renderLowStockTab,
  handleStockReqDeviceSelectChange,
  switchStockTab,
  submitStockRequest
} from './js/stock.js';

import {
  handleReportFilterChange,
  getFilteredReportData,
  getFilteredReportDataByDates,
  drawSVGLineChart,
  renderLeaderboardChart,
  generateActionableInsights,
  renderReports,
  openExportModal,
  toggleSelectAllExportFormats,
  triggerReportDownload,
  downloadCSVReport,
  downloadExcelReport,
  downloadPDFReport,
  handleLogFilterChange,
  resetLogFilters,
  renderRecordLogs
} from './js/reports.js';

import {
  handleUatOutageToggle,
  triggerSessionTimeoutSimulation,
  handleTimeoutLogout,
  extendSessionLife
} from './js/simulators.js';

// ==========================================
// LOGIN WORKFLOW VIEW CONTROLLERS
// ==========================================

export function showLoginForm() {
  document.getElementById('login-form').style.display = 'block';
  document.getElementById('forgot-password-form').style.display = 'none';
  document.getElementById('otp-verify-form').style.display = 'none';
  document.getElementById('password-reset-form').style.display = 'none';
  
  document.querySelector('.login-card-title').innerText = "Welcome to Telkom Retail Connect";
  document.querySelector('.login-card-sub').innerText = "Sign in to your workspace";
  document.getElementById('login-form-error').style.display = 'none';
}

export function showForgotPasswordForm() {
  document.getElementById('login-form').style.display = 'none';
  document.getElementById('forgot-password-form').style.display = 'block';
  document.getElementById('otp-verify-form').style.display = 'none';
  document.getElementById('password-reset-form').style.display = 'none';
  
  document.querySelector('.login-card-title').innerText = "Forgot Password";
  document.querySelector('.login-card-sub').innerText = "Enter your username and email";
  document.getElementById('login-form-error').style.display = 'none';
}

export function showOtpForm() {
  document.getElementById('login-form').style.display = 'none';
  document.getElementById('forgot-password-form').style.display = 'none';
  document.getElementById('otp-verify-form').style.display = 'block';
  document.getElementById('password-reset-form').style.display = 'none';
  
  document.querySelector('.login-card-title').innerText = "Verify Email";
  document.querySelector('.login-card-sub').innerText = "Enter the verification code";
  document.getElementById('login-form-error').style.display = 'none';
}

export function showResetPasswordForm() {
  document.getElementById('login-form').style.display = 'none';
  document.getElementById('forgot-password-form').style.display = 'none';
  document.getElementById('otp-verify-form').style.display = 'none';
  document.getElementById('password-reset-form').style.display = 'block';
  
  document.querySelector('.login-card-title').innerText = "Reset Password";
  document.querySelector('.login-card-sub').innerText = "Create a new secure password";
  document.getElementById('login-form-error').style.display = 'none';
}

export function handleForgotPasswordSubmit(e) {
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

export function handleOtpSubmit(e) {
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

export function handlePasswordResetSubmit(e) {
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

export function toggleLoginPassword(btn) {
  const input = btn.closest('.login-password-wrap').querySelector('.login-input');
  const isText = input.type === 'text';
  input.type = isText ? 'password' : 'text';
  btn.querySelector('.eye-icon').style.opacity = isText ? '1' : '0.4';
}

export function handleLoginSubmit(e) {
  e.preventDefault();
  
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

export function doLogin() {
  const idInput = document.getElementById('login-agent-id').value.trim();
  const password = document.getElementById('login-password').value.trim();
  const loginError = document.getElementById('login-form-error');
  loginError.style.display = 'none';

  if (!idInput || !password) {
    loginError.innerText = "Invalid username or password.";
    loginError.style.display = 'block';
    return;
  }

  const demoCredential = DEMO_LOGIN_CREDENTIALS[idInput.toUpperCase()];
  const branch = demoCredential ? demoCredential.branch : 'PTA-001';

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

  const uatRoleSelect = document.getElementById('uat-role');
  if (uatRoleSelect) {
    uatRoleSelect.value = APP_STATE.currentUser.role;
  }

  updateSidebarMenuOptions();
  saveAuthSession();
  
  showToast(`Welcome back, ${APP_STATE.currentUser.name}! Logged into ${branch}.`, "success");
  
  // Navigate to corresponding dashboard or targetRoute from URL query params
  const urlParams = new URLSearchParams(window.location.search);
  const targetRoute = urlParams.get('route');
  let routed = false;
  if (targetRoute && targetRoute !== 'login') {
    routed = switchRoute(targetRoute);
  }
  if (!routed) {
    if (APP_STATE.currentUser.role === 'agent') switchRoute('agent-dashboard');
    else if (APP_STATE.currentUser.role === 'manager') switchRoute('manager-dashboard');
    else if (APP_STATE.currentUser.role === 'area_manager') switchRoute('area-dashboard');
    else if (APP_STATE.currentUser.role === 'admin') switchRoute('admin-dashboard');
  }
}

export function handleLogout() {
  APP_STATE.selectedCustomer = null;
  APP_STATE.activeCIMInteraction = null;
  APP_STATE.isCustomerIdentifiedInJourney = false;
  APP_STATE.isAuthenticated = true;
  clearAuthSession();
  const landing = APP_STATE.currentUser.role === 'manager' ? 'manager-dashboard' : (APP_STATE.currentUser.role === 'area_manager' ? 'area-dashboard' : (APP_STATE.currentUser.role === 'admin' ? 'admin-dashboard' : 'agent-dashboard'));
  switchRoute(landing);
  showToast("Session cleared.", "neutral");
}

// ==========================================
// DOCUMENT CLICK EVENT LISTENERS
// ==========================================

// Close bank dropdowns and autocomplete menus on clicking outside
document.addEventListener('click', function(e) {
  // Customer Wizard dropdowns
  const bankMenu = document.getElementById('bank-dropdown-menu');
  if (bankMenu && !e.target.closest('#new-cust-bankname') && !e.target.closest('#bank-dropdown-menu')) {
    bankMenu.classList.remove('show');
  }
  const addrMenu = document.getElementById('addr-autocomplete-menu');
  if (addrMenu && !e.target.closest('#new-cust-address') && !e.target.closest('#addr-autocomplete-menu')) {
    addrMenu.style.display = 'none';
  }
  
  // Stepper Billing dropdowns
  const billingBankMenu = document.getElementById('billing-bank-dropdown-menu');
  if (billingBankMenu && !e.target.closest('#billing-new-bankname') && !e.target.closest('#billing-bank-dropdown-menu')) {
    billingBankMenu.classList.remove('show');
  }
  
  // Login hints auto-fill logic
  if (e.target.classList.contains('login-hint-chip')) {
    const agentInput = document.getElementById('login-agent-id');
    if (agentInput) {
      const chipText = e.target.textContent.trim();
      if (chipText !== 'error') {
        agentInput.value = chipText;
        agentInput.focus();
      }
    }
  }
});

// ==========================================
// BOOTSTRAP INITIALIZATION
// ==========================================
export function startNewOrderFlow() {
  APP_STATE.selectedCustomer = null;
  APP_STATE.activeCIMInteraction = null;
  APP_STATE.isCustomerIdentifiedInJourney = false;
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
  
  showToast("Initiated a new order journey.", "success");
  switchRoute('catalogue');
}

// Load local mock database states
loadStateFromStorage();

// Force authenticated by default to bypass login screen
APP_STATE.isAuthenticated = true;

// Set navbar and route (using URL query parameter route)
updateSidebarMenuOptions();
const urlParams = new URLSearchParams(window.location.search);
const initialRoute = urlParams.get('route') || APP_STATE.activeRoute || 'agent-dashboard';
switchRoute(initialRoute);

// Update badge notifications count
updateNotificationsBadge();

// Listen to URL state changes
window.addEventListener('popstate', (event) => {
  const params = new URLSearchParams(window.location.search);
  const route = (event.state && event.state.route) || params.get('route') || 'agent-dashboard';
  if (APP_STATE.activeRoute !== route) {
    switchRoute(route);
  } else {
    // If the route is the same, check if the nested step or tab changed and update it
    if (route === 'order-stepper' || route === 'customer-create') {
      const stepVal = params.get('step');
      if (stepVal) {
        const stepNum = parseInt(stepVal);
        if (route === 'order-stepper' && APP_STATE.currentStep !== stepNum) {
          APP_STATE.currentStep = stepNum;
          renderStepper();
        } else if (route === 'customer-create' && APP_STATE.customerCreateStep !== stepNum) {
          APP_STATE.customerCreateStep = stepNum;
          renderCustomerCreateStep(stepNum);
        }
      }
    } else if (route === 'order-tracking') {
      const tabVal = params.get('tab') || 'submitted';
      if (APP_STATE.activeTrackingTab !== tabVal) {
        switchTrackingTab(tabVal);
      }
    } else if (route === 'stock-requests') {
      const tabVal = params.get('tab') || 'inventory';
      switchStockTab(tabVal);
    }
  }
});

// ==========================================
// WINDOW REGISTRY FOR INLINE HTML COMPATIBILITY
// ==========================================

window.handleLoginSubmit = handleLoginSubmit;
window.toggleLoginPassword = toggleLoginPassword;
window.showLoginForm = showLoginForm;
window.showForgotPasswordForm = showForgotPasswordForm;
window.showOtpForm = showOtpForm;
window.showResetPasswordForm = showResetPasswordForm;
window.handleForgotPasswordSubmit = handleForgotPasswordSubmit;
window.handleOtpSubmit = handleOtpSubmit;
window.handlePasswordResetSubmit = handlePasswordResetSubmit;
window.handleLogout = handleLogout;

// Utilities
window.openModal = openModal;
window.closeModal = closeModal;
window.updateNotificationsBadge = updateNotificationsBadge;

// Router
window.switchRoute = switchRoute;
window.renderScreen = renderScreen;
window.toggleNotificationsDrawer = toggleNotificationsDrawer;
window.toggleUatPanel = toggleUatPanel;
window.markNotificationRead = markNotificationRead;

// Dashboards
window.renderAgentDashboard = renderAgentDashboard;
window.renderManagerDashboard = renderManagerDashboard;
window.renderAreaDashboard = renderAreaDashboard;
window.renderAdminDashboard = renderAdminDashboard;
window.handleUatRoleChange = handleUatRoleChange;
window.showProductDetails = showProductDetails;
window.closeProductDrawer = closeProductDrawer;

// Customer
window.handleCustomerSearch = handleCustomerSearch;
window.renderCustomer360 = renderCustomer360;
window.closeCustomerSession = closeCustomerSession;
window.startNewOrderFlow = startNewOrderFlow;
window.openNewCustomerWizard = openNewCustomerWizard;
window.handleCustomerCreateNext = handleCustomerCreateNext;
window.handleCustomerCreateBack = handleCustomerCreateBack;
window.renderCustomerCreateStep = renderCustomerCreateStep;
window.handleCreateCustomerSubmit = handleCreateCustomerSubmit;
window.handleEditCustomerSubmit = handleEditCustomerSubmit;
window.renderCustomer360Documents = renderCustomer360Documents;
window.identifyCustomer = identifyCustomer;
window.openCreateCustomerModal = openCreateCustomerModal;
window.openEditCustomerModal = openEditCustomerModal;
window.startOrderCaptureForCustomer = startOrderCaptureForCustomer;
window.handleCustStepperClick = handleCustStepperClick;

// Catalogue
window.renderCatalogue = renderCatalogue;
window.getProductTermAndPrice = getProductTermAndPrice;
window.updateProductTermPrice = updateProductTermPrice;
window.updateProductColor = updateProductColor;
window.clearCatalogueSearch = clearCatalogueSearch;

// Standalone Coverage check
window.renderCheckCoverageScreen = renderCheckCoverageScreen;
window.checkStandaloneCoverage = checkStandaloneCoverage;
window.proceedFromCoverageToCatalogue = proceedFromCoverageToCatalogue;

// Stepper
window.getActiveStepsForProduct = getActiveStepsForProduct;
window.getStepperStepTitle = getStepperStepTitle;
window.renderStepperHeader = renderStepperHeader;
window.renderStepper = renderStepper;
window.renderStepperCustomerSearch = renderStepperCustomerSearch;
window.searchCustomerInStepper = searchCustomerInStepper;
window.handleStepperCustSearchKeydown = handleStepperCustSearchKeydown;
window.linkCustomerInStepper = linkCustomerInStepper;
window.unlinkCustomerInStepper = unlinkCustomerInStepper;
window.openNewCustomerWizardFromStepper = openNewCustomerWizardFromStepper;
window.linkCustomerAndReturnToStepper = linkCustomerAndReturnToStepper;
window.updateTempAddress = updateTempAddress;
window.renderStepperBillingSelection = renderStepperBillingSelection;
window.updateBillingSelection = updateBillingSelection;
window.handleBillingNewInput = handleBillingNewInput;
window.saveBillingInputs = saveBillingInputs;
window.toggleBillingBankMenu = toggleBillingBankMenu;
window.filterBillingBankOptions = filterBillingBankOptions;
window.selectBillingBankOption = selectBillingBankOption;
window.renderStepperCreditVetting = renderStepperCreditVetting;
window.runCreditVettingCheck = runCreditVettingCheck;
window.payCreditVettingDeposit = payCreditVettingDeposit;
window.renderStepperSupportingDocs = renderStepperSupportingDocs;
window.updateDocsOption = updateDocsOption;
window.saveDocsOptionInput = saveDocsOptionInput;
window.triggerBrowseDoc = triggerBrowseDoc;
window.handleDocFileSelected = handleDocFileSelected;
window.removeUploadedDoc = removeUploadedDoc;
window.handleDocDragOver = handleDocDragOver;
window.handleDocDragLeave = handleDocDragLeave;
window.handleDocDrop = handleDocDrop;
window.simulateDocUpload = simulateDocUpload;
window.renderStepperCoverageCheck = renderStepperCoverageCheck;
window.updateStepperColor = updateStepperColor;
window.renderStepperStockCheck = renderStepperStockCheck;
window.renderStepperContractDetails = renderStepperContractDetails;
window.renderStepperReviewChecklist = renderStepperReviewChecklist;
window.toggleConsent = toggleConsent;
window.simulateGisAddressCheck = simulateGisAddressCheck;
window.forceCoverageAcceptance = forceCoverageAcceptance;
window.simulateGisApiRetry = simulateGisApiRetry;
window.simulateStockCheckAction = simulateStockCheckAction;
window.simulateStockApiRetry = simulateStockApiRetry;
window.notifyStoreManagerForStock = notifyStoreManagerForStock;
window.selectProductForStepper = selectProductForStepper;
window.handleStepperBack = handleStepperBack;
window.handleStepperNext = handleStepperNext;
window.handleCancelOrder = handleCancelOrder;
window.submitCustomCancellation = submitCustomCancellation;
window.cancelToSaveDraft = cancelToSaveDraft;
window.updateCIMState = updateCIMState;
window.updateCIMNotesCount = updateCIMNotesCount;
window.updateContractDetailsState = updateContractDetailsState;
window.submitOrderToOMS = submitOrderToOMS;
window.renderPaymentScreen = renderPaymentScreen;
window.handlePOSPaymentTrigger = handlePOSPaymentTrigger;
window.renderConfirmationReceipt = renderConfirmationReceipt;
window.renderConfirmationContract = renderConfirmationContract;
window.renderConfirmationRicaActivation = renderConfirmationRicaActivation;
window.downloadContractOnly = downloadContractOnly;
window.handlePaymentMethodChange = handlePaymentMethodChange;

// Tracking
window.renderOrderTracking = renderOrderTracking;
window.switchTrackingTab = switchTrackingTab;
window.viewOrderDetails = viewOrderDetails;
window.switchModalTab = switchModalTab;
window.downloadOrderReceipt = downloadOrderReceipt;
window.emailContractToCustomer = emailContractToCustomer;
window.printContractDocument = printContractDocument;
window.handleSaveDraft = handleSaveDraft;
window.resumeDraftOrder = resumeDraftOrder;
window.getOrderActivationStep = getOrderActivationStep;
window.renderOrderActivationWorkflow = renderOrderActivationWorkflow;
window.setPostOrderActivationStep = setPostOrderActivationStep;
window.submitPostOrderSimNumber = submitPostOrderSimNumber;
window.runRicaActivationWorkflow = runRicaActivationWorkflow;

// Stock
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

// Reports
window.handleReportFilterChange = handleReportFilterChange;
window.getFilteredReportData = getFilteredReportData;
window.getFilteredReportDataByDates = getFilteredReportDataByDates;
window.drawSVGLineChart = drawSVGLineChart;
window.drawSVGDonutChart = drawSVGDonutChart;
window.renderLeaderboardChart = renderLeaderboardChart;
window.generateActionableInsights = generateActionableInsights;
window.renderReports = renderReports;
window.openExportModal = openExportModal;
window.toggleSelectAllExportFormats = toggleSelectAllExportFormats;
window.triggerReportDownload = triggerReportDownload;
window.downloadCSVReport = downloadCSVReport;
window.downloadExcelReport = downloadExcelReport;
window.downloadPDFReport = downloadPDFReport;
window.handleLogFilterChange = handleLogFilterChange;
window.resetLogFilters = resetLogFilters;
window.renderRecordLogs = renderRecordLogs;

// Simulators
window.handleUatOutageToggle = handleUatOutageToggle;
window.triggerSessionTimeoutSimulation = triggerSessionTimeoutSimulation;
window.handleTimeoutLogout = handleTimeoutLogout;
window.extendSessionLife = extendSessionLife;
