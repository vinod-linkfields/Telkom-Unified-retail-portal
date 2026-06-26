import { MOCK_DB, APP_STATE, saveOrders, saveDraftOrders, BANK_OPTIONS } from './state.js';
import { paginateExistingTable, showToast, pushNotification, maskID, maskPassport, openModal, closeModal } from './utils.js';
import { switchRoute, updateSessionBanner } from './routing.js';
import { getProductTermAndPrice, findProductById } from './catalogue.js';
import { openNewCustomerWizard } from './customer.js';
import { renderOrderActivationWorkflow } from './tracking.js';

// ─── Product type helpers ────────────────────────────────────────────────────
/**
 * Returns true when a product requires a GIS coverage address check.
 * Applies to LTE fixed-wireless and Fibre products.
 */
export function requiresCoverageCheck(product) {
  if (!product) return false;
  const pkg  = (product.package  || '').toLowerCase();
  const name = (product.name     || '').toLowerCase();
  const cat  = (product.category || '').toLowerCase();
  return (
    pkg.includes('lte') ||
    pkg.includes('mbps') ||
    name.includes('fibre') ||
    name.includes('fiber') ||
    pkg.includes('fibre') ||
    pkg.includes('fiber') ||
    cat === 'fibre'
  );
}

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
    name.includes('sim')
  );
}

export function getActiveStepsForProduct(product) {
  const steps = [
    { id: 1, label: "Check Avail" },
    { id: 2, label: "Identify Cust" },
    { id: 3, label: "Confirm Details" },
    { id: 5, label: "Billing & Credit Vetting" },
    { id: 9, label: "Supporting Docs" },
    { id: 10, label: "Order Summary & Sign-off" }
  ];
  
  if (product) {
    const needsStock  = !!product.deviceSKU;
    const needsCoverage = requiresCoverageCheck(product);

    if (!needsStock && !needsCoverage) {
      // Pure SIM / voice / mobile-handset contracts — skip step 1 entirely
      return steps.filter(s => s.id !== 1);
    }
    // Handset with device → stock check (step 1 stays)
    // LTE/Fibre → coverage check (step 1 stays)
  }
  return steps;
}

export function getStepperStepTitle(stepId, defaultTitle) {
  const product = APP_STATE.cart.product;
  const steps = getActiveStepsForProduct(product);
  const index = steps.findIndex(s => s.id === stepId);
  const displayNum = index > -1 ? index + 1 : stepId;
  return `Step ${displayNum}: ${defaultTitle}`;
}

export function renderStepperHeader() {
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

export function renderStepper() {
  updateSessionBanner();
  const stepContainer = document.getElementById('stepper-form-content');
  if (!stepContainer) return;
  stepContainer.innerHTML = '';
  
  const product = APP_STATE.cart.product;
  if (!product) {
    const cancelBtn = document.getElementById('stepper-cancel-btn');
    if (cancelBtn) {
      cancelBtn.style.display = 'none';
    }
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

  const cancelBtn = document.getElementById('stepper-cancel-btn');
  if (cancelBtn) {
    cancelBtn.style.display = 'inline-block';
  }

  // Sticky product details summary banner
  const onceOffFee = product.onceOff ?? 99;
  const productBannerHtml = `
    <div class="stepper-product-summary-banner" style="display: flex; align-items: center; justify-content: space-between; background: #ffffff; border: 1px solid var(--border-color, #e2e8f0); color: var(--text-primary, #1e293b); padding: 14px 20px; border-radius: var(--radius-md, 8px); margin-bottom: 20px; box-shadow: var(--shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05)); flex-wrap: wrap; gap: 12px; border-left: 5px solid var(--telkom-blue, #0066cc);">
      <div style="display: flex; align-items: center; gap: 12px;">
        <div style="font-size: 20px; background: var(--bg-light, #f8fafc); border: 1px solid var(--border-color, #e2e8f0); color: var(--telkom-blue, #0066cc); width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 50%;">
          ${(product.category || '').includes('SIM') ? '📡' : ((product.deviceInfo || product.device) ? '📱' : '💻')}
        </div>
        <div>
          <div style="font-size: 10px; font-weight: 700; color: var(--text-secondary, #64748b); letter-spacing: 0.5px; text-transform: uppercase;">Selected Order Product</div>
          <div style="font-size: 14px; font-weight: 700; font-family: var(--font-display, inherit); color: var(--telkom-blue-dark, #004b93);">${product.name}</div>
          ${product.selectedColor ? `<div style="font-size: 11px; color: var(--text-secondary, #64748b); margin-top: 2px;">Color: <strong>${product.selectedColor}</strong></div>` : ''}
        </div>
      </div>
      <div style="display: flex; gap: 20px; align-items: center;">
        <div style="text-align: right;">
          <div style="font-size: 9px; color: var(--text-muted, #94a3b8); font-weight: 600;">CONTRACT TERM</div>
          <div style="font-size: 12px; font-weight: 700; color: var(--text-primary, #1e293b);">${product.term} Months</div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 9px; color: var(--text-muted, #94a3b8); font-weight: 600;">MONTHLY PRICE</div>
          <div style="font-size: 15px; font-weight: 800; color: var(--telkom-blue, #0066cc);">R${product.price} <span style="font-size:10px; font-weight:normal; color: var(--text-secondary, #64748b);">pm</span></div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 9px; color: var(--text-muted, #94a3b8); font-weight: 600;">ONCE-OFF FEE</div>
          <div style="font-size: 13px; font-weight: 700; color: var(--text-primary, #1e293b);">R${onceOffFee}</div>
        </div>
      </div>
    </div>
  `;

  stepContainer.innerHTML = `
    ${productBannerHtml}
    <div id="stepper-step-body-wrapper"></div>
  `;

  const stepBodyWrapper = document.getElementById('stepper-step-body-wrapper');

  switch (APP_STATE.currentStep) {
    case 1: // Step 1 — Stock Check (Handset) OR Coverage Check (LTE/Fibre)
      if (requiresCoverageCheck(product)) {
        renderStepperCoverageCheck(stepBodyWrapper);
      } else if (product.deviceSKU) {
        renderStepperStockCheck(stepBodyWrapper);
      } else {
        stepBodyWrapper.innerHTML = `
          <h3 style="margin-bottom: 16px;">${getStepperStepTitle(1, "Availability Verification")}</h3>
          <div style="background-color: var(--success-light); border-left: 4px solid var(--success); padding: 16px; border-radius: var(--radius-md); color: var(--success); font-size: 13px; font-weight: 600;">
            Verification Skip: SIM-Only contracts do not require device stock allocation. Please proceed.
          </div>
        `;
      }
      break;

    case 2: // Customer Search & Identification
      renderStepperCustomerSearch(stepBodyWrapper);
      break;

    case 3: { // Customer Details & Product Specs confirmation
      const imgPath = product.id === 'p-dev-1' ? 'Images/samsung_galaxy_s24.png' : (product.id === 'p-dev-2' ? 'Images/iphone_15_pro_max.png' : '');
      const imageHtml = imgPath ? `
        <div style="text-align: center; margin-bottom: 16px; background-color: var(--bg-card); border-radius: var(--radius-md); padding: 12px; height: 120px; display: flex; align-items: center; justify-content: center; border: 1px solid var(--border-color);">
          <img src="${imgPath}" alt="${product.name}" style="max-height: 100%; max-width: 100%; object-fit: contain;">
        </div>
      ` : '';

      stepBodyWrapper.innerHTML = `
        <h3 style="margin-bottom: 16px;">${getStepperStepTitle(3, "Confirm Customer & Product Details")}</h3>
        <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 24px;">Verify the customer profile and product details for this order.</p>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
          <div style="background-color: var(--bg-light); padding: 20px; border-radius: var(--radius-lg); border: 1px solid var(--border-color);">
            <h5 style="color: var(--telkom-blue-dark); margin-bottom: 12px; font-weight: 700;">Customer Profile</h5>
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
            <h5 style="color: var(--telkom-blue-dark); margin-bottom: 12px; font-weight: 700;">Product Details</h5>
            ${imageHtml}
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
    }

    case 4: // CIM Interaction details
      stepBodyWrapper.innerHTML = `
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

    case 5: // Billing & Credit Vetting
      renderStepperBillingSelection(stepBodyWrapper);
      break;

    case 8: // Customer Consent form (was step 6)
      stepBodyWrapper.innerHTML = `
        <h3 style="margin-bottom: 16px;">${getStepperStepTitle(8, "Capture Customer Consent & Sign-Off")}</h3>
        <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 24px;">Legally required declarations for SA NCA compliance.</p>
        
        <div style="background-color: var(--bg-card); border: 1px solid var(--border-color); padding: 20px; border-radius: var(--radius-lg); font-size: 13px; color: var(--text-secondary); max-height: 250px; overflow-y: scroll; margin-bottom: 24px;">
          <h5 style="color: var(--telkom-blue-dark); margin-bottom: 8px;">NCA Credit & Data Protection Policy</h5>
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
      renderStepperSupportingDocs(stepBodyWrapper);
      break;

    case 10: // Review & Validation Checklist (was step 7)
      renderStepperReviewChecklist(stepBodyWrapper);
      break;
  }
}

// -----------------------------------------
// STEP 2 CUSTOMER SEARCH
// -----------------------------------------
export function renderStepperCustomerSearch(container) {
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
  const searchType = APP_STATE.stepperCustomerSearchType || "id";
  
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
            No records matched "${searchedKey}". Double check the search value or register a new profile.
          </p>
          <button class="btn btn-primary" onclick="openNewCustomerWizardFromStepper('${searchedKey}')">Add New Customer Profile</button>
        </div>
      `;
    }
  }

  container.innerHTML = `
    <h3 style="margin-bottom: 16px;">${getStepperStepTitle(2, "Customer Identification")}</h3>
    <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 20px;">Search for the customer in Clarify CRM to link them to this order.</p>
    
    <div style="display: grid; grid-template-columns: 180px 1fr auto auto; gap: 12px; align-items: flex-end;">
      <div class="form-group" style="margin-bottom: 0;">
        <label class="form-label" style="font-size: 11px; font-weight: 700; color: var(--text-secondary); margin-bottom: 4px;">Search Criteria</label>
        <select id="stepper-cust-search-type" class="form-control" style="height: 42px;">
          <option value="id" ${searchType === 'id' ? 'selected' : ''}>South African ID</option>
          <option value="passport" ${searchType === 'passport' ? 'selected' : ''}>Passport Number</option>
          <option value="account" ${searchType === 'account' ? 'selected' : ''}>Account Number</option>
          <option value="mobile" ${searchType === 'mobile' ? 'selected' : ''}>Mobile Number</option>
        </select>
      </div>
      <div class="form-group" style="margin-bottom: 0; flex: 1;">
        <label class="form-label" style="font-size: 11px; font-weight: 700; color: var(--text-secondary); margin-bottom: 4px;">Identifier Value</label>
        <input type="text" id="stepper-cust-search-input" class="form-control" placeholder="Enter query value..." value="${searchedKey}" style="height: 42px;" onkeydown="handleStepperCustSearchKeydown(event)">
      </div>
      <button class="btn btn-primary" onclick="searchCustomerInStepper()" style="height: 42px; width: 120px; display: flex; align-items: center; justify-content: center; font-weight: 600;">Search</button>
      <button class="btn btn-outline" onclick="openNewCustomerWizardFromStepper('')" style="height: 42px; display: flex; align-items: center; justify-content: center; border-color: var(--telkom-blue); color: var(--telkom-blue); font-weight: 600;">Add New Customer</button>
    </div>
    <div style="font-size: 11px; color: var(--text-muted); margin-top: 6px;">Select search criteria and enter the corresponding identifier value.</div>

    ${resultsHtml}
  `;
}

export function searchCustomerInStepper() {
  const selectType = document.getElementById('stepper-cust-search-type');
  const input = document.getElementById('stepper-cust-search-input');
  if (!input || !selectType) return;
  const type = selectType.value;
  const query = input.value.trim();
  
  APP_STATE.stepperCustomerSearchType = type;
  APP_STATE.stepperCustomerSearchedKey = query;
  
  if (!query) {
    showToast("Please enter a search value.", "warning");
    return;
  }

  if (type === 'id' && !/^\d{13}$/.test(query)) {
    showToast("South African ID number must be exactly 13 digits.", "warning");
    return;
  }
  
  let results = [];
  if (type === 'id') {
    results = MOCK_DB.crm.filter(c => c.id === query);
  } else if (type === 'passport') {
    results = MOCK_DB.crm.filter(c => c.passport && c.passport.toLowerCase() === query.toLowerCase());
  } else if (type === 'account') {
    results = MOCK_DB.crm.filter(c => c.accountNumber && c.accountNumber.toLowerCase() === query.toLowerCase());
  } else if (type === 'mobile') {
    results = MOCK_DB.crm.filter(c => c.mobile === query);
  }
  
  APP_STATE.stepperCustomerSearchResults = results;
  renderStepper();
}

export function handleStepperCustSearchKeydown(e) {
  if (e.key === 'Enter') {
    searchCustomerInStepper();
  }
}

export function linkCustomerInStepper(idVal, type) {
  let cust = null;
  if (type === 'id') {
    cust = MOCK_DB.crm.find(c => c.id === idVal);
  } else {
    cust = MOCK_DB.crm.find(c => c.passport === idVal);
  }

  if (cust) {
    APP_STATE.selectedCustomer = cust;
    APP_STATE.isCustomerIdentifiedInJourney = true;
    
    APP_STATE.activeCIMInteraction = {
      type: "New Order",
      channel: "Retail store",
      storeId: APP_STATE.currentUser.branch,
      agentId: APP_STATE.currentUser.id,
      timestamp: new Date().toISOString(),
      notes: ""
    };


    showToast(`Linked customer: ${cust.name}`, "success");
    renderStepper();
  }
}

export function unlinkCustomerInStepper() {
  APP_STATE.selectedCustomer = null;
  APP_STATE.isCustomerIdentifiedInJourney = false;
  APP_STATE.stepperCustomerSearchResults = null;
  APP_STATE.stepperCustomerSearchedKey = "";
  
  if (APP_STATE.cart.supportingDocs) {
    APP_STATE.cart.supportingDocs = null;
  }
  
  renderStepper();
}

export function openNewCustomerWizardFromStepper(searchedKey) {
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

export function linkCustomerAndReturnToStepper(idVal, type) {
  linkCustomerInStepper(idVal, type);
  APP_STATE.openedCustomerWizardFromStepper = false;
  APP_STATE.currentStep = 3;
  switchRoute('order-stepper');
}

export function updateTempAddress(val) {
  APP_STATE.cart.tempCoverageAddress = val;
}

// -----------------------------------------
// STEP 5 BILLING ACCOUNT SELECTION RENDERER
// -----------------------------------------
export function renderStepperBillingSelection(container) {
  const accounts = [
    { id: "ACC-7019", type: "Cheque", bank: "ABSA", number: "••••1234" },
    { id: "ACC-8891", type: "Savings", bank: "FNB", number: "••••5678" }
  ];

  if (!APP_STATE.cart.billingSelection) {
    APP_STATE.cart.billingSelection = {
      option: "existing",
      selectedId: accounts[0].id,
      newDebit: { bankName: "", branchCode: "", accountType: "", accountNumber: "", debitDay: "1st", debiCheckConsent: false, termsConsent: false, accountVerificationStatus: "Awaiting Details" }
    };
  }

  if (!APP_STATE.cart.creditVetting) {
    APP_STATE.cart.creditVetting = {
      outcome: "",
      ran: false,
      depositPaid: false
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

  const customer = APP_STATE.selectedCustomer || { name: "N/A", id: "", passport: "", mobile: "N/A", email: "N/A" };
  const customerId = customer.id || customer.passport || "N/A";
  const product = APP_STATE.cart.product;
  const monthlyAmount = product ? `R${product.price} / month` : "R0.00";
  const onceOffAmount = product ? `R${product.onceOff}` : "R0.00";

  // Simulated status indicators
  const verificationStatus = bill.newDebit.accountVerificationStatus || "Awaiting Details";
  let avsStatus = '';
  if (verificationStatus === 'Verified') {
    avsStatus = `<span class="badge badge-success">Verified</span>`;
  } else if (verificationStatus === 'Awaiting Details') {
    avsStatus = `<span class="badge badge-neutral">Awaiting Details</span>`;
  } else {
    avsStatus = `<span class="badge badge-warning">${verificationStatus}</span>`;
  }

  const vettingStatus = APP_STATE.cart.creditVetting && APP_STATE.cart.creditVetting.ran ? 
    `<span class="badge badge-success">${APP_STATE.cart.creditVetting.outcome}</span>` : 
    `<span class="badge badge-warning">Pending Assessment (Card 5)</span>`;

  let authStatus = `<span class="badge badge-warning">Pending Customer Auth</span>`;
  if (verificationStatus === 'Verified') {
    authStatus = `<span class="badge badge-success">successful</span>`;
  }
  const dbcRef = APP_STATE.cart.draftId ? `DBC-DFT-${APP_STATE.cart.draftId}` : "DBC-PENDING";

  // Render credit vetting panel
  const cv = APP_STATE.cart.creditVetting;
  let creditVettingHtml = '';
  if (cv.ran) {
    if (cv.outcome === 'Successful') {
      creditVettingHtml = `
        <div class="vetting-panel vetting-success" style="margin: 0; display: flex; align-items: center; gap: 16px;">
          <div class="vetting-panel-icon" style="flex-shrink:0;">✓</div>
          <div>
            <h4 style="margin: 0 0 4px 0; font-weight:700; font-size:14px; color:#3f8000;">Credit Assessment Successful</h4>
            <p style="margin: 0; font-size: 12px; color:var(--text-secondary);">Credit vetting completed successfully. Postpaid provisioning is authorized.</p>
          </div>
        </div>
      `;
    } else if (cv.outcome === 'Declined') {
      creditVettingHtml = `
        <div class="vetting-panel vetting-danger" style="margin: 0; display: flex; align-items: center; gap: 16px;">
          <div class="vetting-panel-icon" style="flex-shrink:0;">✗</div>
          <div>
            <h4 style="margin: 0 0 4px 0; font-weight:700; font-size:14px; color:var(--danger);">Credit Assessment Declined</h4>
            <p style="margin: 0; font-size: 12px; color:var(--text-secondary);">Credit vetting was unsuccessful. Postpaid deal cannot proceed.</p>
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
          <div style="margin-top: 10px;">
            <button type="button" class="btn btn-sm btn-outline" onclick="payBillingCreditVettingDeposit()" style="height: 32px;">Record Deposit Payment (R250)</button>
          </div>
        `;
        // Disable Continue button until paid
        const nextBtn = document.getElementById('stepper-next-btn');
        if (nextBtn) nextBtn.disabled = true;
      } else {
        depositActionHtml = `
          <div style="margin-top: 10px; color: var(--success-dark); font-weight: 600; font-size: 12px;">
            ✓ Refundable Deposit of R250.00 Paid (Receipt Ref: DEP-8902). Assessment lock cleared.
          </div>
        `;
      }
      creditVettingHtml = `
        <div class="vetting-panel vetting-warning" style="margin: 0; display: flex; align-items: center; gap: 16px;">
          <div class="vetting-panel-icon" style="flex-shrink:0;">!</div>
          <div>
            <h4 style="margin: 0 0 4px 0; font-weight:700; font-size:14px; color:var(--warning-dark);">Credit Assessment Referral</h4>
            <p style="margin: 0; font-size: 12px; color:var(--text-secondary);">Additional review is required before proceeding.</p>
            ${depositActionHtml}
          </div>
        </div>
      `;
    }
  } else {
    creditVettingHtml = `
      <div style="display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap;">
        <div style="font-size: 12px; color: var(--text-secondary);">
          Initiate credit risk evaluation scoring through NCR-approved credit bureaus.
        </div>
        <div style="display:flex; align-items:center; gap:12px;">
          <select id="mock-billing-vetting-outcome" class="form-control" style="width:140px; height:36px; font-size:12px; padding:4px 8px; margin:0;">
            <option value="Successful">Successful</option>
            <option value="Declined">Declined</option>
            <option value="Referral">Referral</option>
          </select>
          <button type="button" class="btn btn-primary" onclick="runBillingCreditVettingCheck()" style="height: 36px; padding: 0 16px; margin:0;">
            Execute Vetting
          </button>
        </div>
      </div>
    `;
  }

  container.innerHTML = `
    <h3 style="margin-bottom: 16px;">${getStepperStepTitle(5, "Billing & Credit Vetting")}</h3>
    <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 20px;">Choose whether to bill this postpaid subscription to an existing account or register new Debit Check details, and perform NCR credit vetting.</p>
    
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
      <h5 style="margin-bottom: 20px; color: var(--telkom-blue-dark); font-weight: 700; border-bottom: 2px solid var(--telkom-blue); padding-bottom: 8px;">Register New DebiCheck Account</h5>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
        <!-- Card 1: Account Holder Info (View Only) -->
        <div style="background-color: var(--bg-light); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 16px;">
          <h6 style="color: var(--telkom-blue-dark); margin-bottom: 12px; font-weight: 700; font-size: 11px; letter-spacing: 0.5px;">1. Account Holder Info (View Only)</h6>
          
          <div class="form-group" style="margin-bottom: 10px;">
            <label class="form-label" style="font-size: 11px; color: var(--text-muted); margin-bottom: 3px;">Account Holder Name</label>
            <input type="text" class="form-control" value="${customer.name}" disabled style="background-color: var(--bg-card); font-weight: 600; height: 36px; padding: 6px 12px; font-size: 13px;">
          </div>
          
          <div class="form-group" style="margin-bottom: 10px;">
            <label class="form-label" style="font-size: 11px; color: var(--text-muted); margin-bottom: 3px;">ID Number / Passport Number</label>
            <input type="text" class="form-control" value="${customerId}" disabled style="background-color: var(--bg-card); font-weight: 600; height: 36px; padding: 6px 12px; font-size: 13px;">
          </div>
          
          <div class="form-group" style="margin-bottom: 10px;">
            <label class="form-label" style="font-size: 11px; color: var(--text-muted); margin-bottom: 3px;">Mobile Number (View Only – used for DebiCheck authorization)</label>
            <input type="text" class="form-control" value="${customer.mobile}" disabled style="background-color: var(--bg-card); font-weight: 600; height: 36px; padding: 6px 12px; font-size: 13px;">
          </div>
          
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label" style="font-size: 11px; color: var(--text-muted); margin-bottom: 3px;">Email Address</label>
            <input type="text" class="form-control" value="${customer.email}" disabled style="background-color: var(--bg-card); font-weight: 600; height: 36px; padding: 6px 12px; font-size: 13px;">
          </div>
        </div>

        <!-- Card 2: Settlement Banking Details -->
        <div style="background-color: var(--bg-light); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 16px;">
          <h6 style="color: var(--telkom-blue-dark); margin-bottom: 12px; font-weight: 700; font-size: 11px; letter-spacing: 0.5px;">2. Settlement Banking Details</h6>
          
          <div class="form-group searchable-dropdown-container" style="margin-bottom: 10px;">
            <label class="form-label" style="font-size: 11px; margin-bottom: 3px;">Bank Name <span class="required">*</span></label>
            <input type="text" id="billing-new-bankname" class="form-control searchable-dropdown-input" placeholder="Select bank name..." value="${bill.newDebit.bankName || ''}" onclick="toggleBillingBankMenu(event)" readonly style="height: 36px; padding: 6px 12px; font-size: 13px;">
            <div id="billing-bank-dropdown-menu" class="searchable-dropdown-menu">
              <div class="searchable-dropdown-search-box">
                <input type="text" class="form-control" placeholder="Filter banks..." oninput="filterBillingBankOptions(this)" onclick="event.stopPropagation()">
              </div>
              <div id="billing-bank-dropdown-options-list">
                <!-- Banks loaded dynamically -->
              </div>
            </div>
          </div>
          
          <div class="form-group" style="margin-bottom: 10px;">
            <label class="form-label" style="font-size: 11px; margin-bottom: 3px;">Account Number <span class="required">*</span></label>
            <input type="text" id="billing-new-accnum" class="form-control" placeholder="Enter account number..." value="${bill.newDebit.accountNumber || ''}" oninput="handleBillingNewInput('accountNumber', this.value.replace(/[^0-9]/g, ''))" style="height: 36px; padding: 6px 12px; font-size: 13px;">
          </div>
          
          <div class="form-group" style="margin-bottom: 10px;">
            <label class="form-label" style="font-size: 11px; margin-bottom: 3px;">Account Type <span class="required">*</span></label>
            <select id="billing-new-acctype" class="form-control" onchange="handleBillingNewInput('accountType', this.value)" style="height: 36px; padding: 6px 12px; font-size: 13px;">
              <option value="">-- Select Type --</option>
              <option value="Cheque/Current" ${bill.newDebit.accountType === 'Cheque/Current' || bill.newDebit.accountType === 'Cheque' ? 'selected' : ''}>Cheque/Current</option>
              <option value="Savings" ${bill.newDebit.accountType === 'Savings' ? 'selected' : ''}>Savings</option>
              <option value="Transmission" ${bill.newDebit.accountType === 'Transmission' ? 'selected' : ''}>Transmission</option>
            </select>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" style="font-size: 11px; margin-bottom: 3px;">Branch Code <span class="required">*</span></label>
              <input type="text" id="billing-new-branchcode" class="form-control" placeholder="e.g. 632005" value="${bill.newDebit.branchCode || ''}" oninput="handleBillingNewInput('branchCode', this.value.replace(/[^0-9]/g, ''))" style="height: 36px; padding: 6px 12px; font-size: 13px;">
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" style="font-size: 11px; margin-bottom: 3px;">Debit Order Day <span class="required">*</span></label>
              <select id="billing-new-debitday" class="form-control" onchange="handleBillingNewInput('debitDay', this.value)" style="height: 36px; padding: 6px 12px; font-size: 13px;">
                <option value="">-- Select Day --</option>
                <option value="1st" ${bill.newDebit.debitDay === '1st' ? 'selected' : ''}>1st of the month</option>
                <option value="15th" ${bill.newDebit.debitDay === '15th' ? 'selected' : ''}>15th of the month</option>
                <option value="25th" ${bill.newDebit.debitDay === '25th' ? 'selected' : ''}>25th of the month</option>
                <option value="Last Day" ${bill.newDebit.debitDay === 'Last Day' ? 'selected' : ''}>Last Day of the month</option>
              </select>
            </div>
          </div>

          ${verificationStatus !== 'Verified' ? `
          <div style="margin-top: 14px;">
            <button type="button" class="btn btn-sm btn-outline" style="width: 100%; height: 36px; font-weight: 600;" onclick="runBillingAccountVerification()">
              Run Account Holder Verification
            </button>
          </div>
          ` : ''}
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px;">
        <!-- Card 3: Mandate Specs & Verification Status -->
        <div style="background-color: var(--bg-light); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 16px;">
          <h6 style="color: var(--telkom-blue-dark); margin-bottom: 12px; font-weight: 700; font-size: 11px; letter-spacing: 0.5px;">3. Specs & Verification Status</h6>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
            <div>
              <span style="font-size: 10px; color: var(--text-muted); display: block;">Monthly Debit Amount</span>
              <strong style="color: var(--text-primary); font-size: 13px;">${monthlyAmount} (Auto-populated)</strong>
            </div>
            <div>
              <span style="font-size: 10px; color: var(--text-muted); display: block;">Once-Off Amount</span>
              <strong style="color: var(--text-primary); font-size: 13px;">${onceOffAmount} (Auto-populated)</strong>
            </div>
          </div>
          
          <div style="display: flex; flex-direction: column; gap: 8px; font-size: 12px; border-top: 1px solid var(--border-color); padding-top: 10px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="color: var(--text-secondary);">AVS Status:</span>
              <strong>${avsStatus}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="color: var(--text-secondary);">Credit Vetting:</span>
              <strong>${vettingStatus}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="color: var(--text-secondary);">DebiCheck Status:</span>
              <strong>${authStatus}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="color: var(--text-secondary);">DebiCheck Ref:</span>
              <code style="font-weight: bold; color: var(--telkom-blue-dark);">${dbcRef}</code>
            </div>
          </div>
        </div>

        <!-- Card 4: Consent & Terms -->
        <div style="background-color: var(--bg-light); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 16px; display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <h6 style="color: var(--telkom-blue-dark); margin-bottom: 12px; font-weight: 700; font-size: 11px; letter-spacing: 0.5px;">4. Consents & Agreements</h6>
            
            <label class="checkbox-group" style="align-items: flex-start; margin-bottom: 12px; cursor: pointer;">
              <input type="checkbox" id="billing-new-consent" ${bill.newDebit.debiCheckConsent ? 'checked' : ''} onchange="handleBillingNewInput('debiCheckConsent', this.checked)" style="margin-top: 3px;">
              <span class="checkbox-label" style="font-size: 12px; line-height: 1.3;">
                <strong>Customer Authorization Consent:</strong> Authorize monthly debit collections. <span class="required">*</span>
              </span>
            </label>
            
            <label class="checkbox-group" style="align-items: flex-start; margin-bottom: 0; cursor: pointer;">
              <input type="checkbox" id="billing-new-terms" ${bill.newDebit.termsConsent ? 'checked' : ''} onchange="handleBillingNewInput('termsConsent', this.checked)" style="margin-top: 3px;">
              <span class="checkbox-label" style="font-size: 12px; line-height: 1.3;">
                <strong>Terms & Conditions Acceptance:</strong> Accept terms of postpaid contract. <span class="required">*</span>
              </span>
            </label>
          </div>
          
          <div style="font-size: 10px; color: var(--text-muted); border-top: 1px dashed var(--border-color); padding-top: 8px; margin-top: 10px;">
            Fields marked with (*) are required to proceed.
          </div>
        </div>
      </div>
    </div>

    <!-- 5. Credit Bureau Vetting Assessment -->
    <div style="margin-top: 24px; background-color: var(--bg-light); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 20px; border-left: 5px solid var(--telkom-blue);">
      <h6 style="color: var(--telkom-blue-dark); margin-bottom: 12px; font-weight: 700; font-size: 11px; letter-spacing: 0.5px;">Credit Bureau Vetting Assessment</h6>
      <div id="billing-credit-vetting-container">
        ${creditVettingHtml}
      </div>
    </div>
  `;
}

export function updateBillingSelection(field, val) {
  if (!APP_STATE.cart.billingSelection) return;
  APP_STATE.cart.billingSelection[field] = val;
  renderStepper();
}

export function handleBillingNewInput(field, val) {
  if (!APP_STATE.cart.billingSelection) return;
  APP_STATE.cart.billingSelection.newDebit[field] = val;
}

export function saveBillingInputs() {
  const bill = APP_STATE.cart.billingSelection;
  if (!bill || bill.option === 'existing') return;
  
  const bank = document.getElementById('billing-new-bankname');
  const branch = document.getElementById('billing-new-branchcode');
  const type = document.getElementById('billing-new-acctype');
  const accNum = document.getElementById('billing-new-accnum');
  const debitDay = document.getElementById('billing-new-debitday');
  const consent = document.getElementById('billing-new-consent');
  const terms = document.getElementById('billing-new-terms');

  if (bank) bill.newDebit.bankName = bank.value;
  if (branch) bill.newDebit.branchCode = branch.value.trim();
  if (type) bill.newDebit.accountType = type.value;
  if (accNum) bill.newDebit.accountNumber = accNum.value.trim();
  if (debitDay) bill.newDebit.debitDay = debitDay.value;
  if (consent) bill.newDebit.debiCheckConsent = consent.checked;
  if (terms) bill.newDebit.termsConsent = terms.checked;
}

export function runBillingAccountVerification() {
  saveBillingInputs();
  const bill = APP_STATE.cart.billingSelection;
  if (!bill || bill.option === 'existing') return;
  const nd = bill.newDebit;
  
  // Always return a successful result: auto-fill fallbacks if missing or invalid
  if (!nd.bankName) nd.bankName = "FNB";
  if (!nd.branchCode) nd.branchCode = "250655";
  if (!nd.accountNumber || !/^\d{7,16}$/.test(nd.accountNumber)) nd.accountNumber = "62000001234";
  if (!nd.accountType) nd.accountType = "Cheque/Current";
  if (!nd.debitDay) nd.debitDay = "1st";

  showToast("Initiating Account Holder Verification (AHV) with settlement bank...", "info");
  setTimeout(() => {
    nd.accountVerificationStatus = "Verified";
    showToast("Account Holder Verification successful: Verified & Matched", "success");
    renderStepper();
  }, 500);
}
window.runBillingAccountVerification = runBillingAccountVerification;

export function toggleBillingBankMenu(e) {
  e.stopPropagation();
  const menu = document.getElementById('billing-bank-dropdown-menu');
  if (menu) {
    menu.classList.toggle('show');
    filterBillingBankOptions(null);
  }
}

export function filterBillingBankOptions(searchEl) {
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

export function selectBillingBankOption(bank) {
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
export function renderStepperCreditVetting(container) {
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

export function runCreditVettingCheck() {
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

export function payCreditVettingDeposit() {
  if (APP_STATE.cart.creditVetting) {
    APP_STATE.cart.creditVetting.depositPaid = true;
  }
  showToast("Refundable deposit payment captured.", "success");
  renderStepper();
}

// -----------------------------------------
// STEP 9 SUPPORTING DOCUMENTS RENDERER
// -----------------------------------------
export function renderStepperSupportingDocs(container) {
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
      { key: "proofAddress", label: "Proof of Address (Utility Bill)" }
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

export function updateDocsOption(opt) {
  if (APP_STATE.cart.supportingDocs) {
    APP_STATE.cart.supportingDocs.option = opt;
  }
  renderStepper();
}

export function saveDocsOptionInput() {
  const radio = document.querySelector('input[name="docs-opt"]:checked');
  if (radio && APP_STATE.cart.supportingDocs) {
    APP_STATE.cart.supportingDocs.option = radio.value;
  }
}

export function triggerBrowseDoc(key) {
  const input = document.getElementById(`file-input-${key}`);
  if (input) input.click();
}

export function handleDocFileSelected(e, key) {
  const file = e.target.files[0];
  if (file) {
    simulateDocUpload(key, file.name);
  }
}

export function removeUploadedDoc(key) {
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

export function handleDocDragOver(e, key) {
  e.preventDefault();
  const zone = document.getElementById(`drag-zone-${key}`);
  if (zone) zone.classList.add('dragover');
}

export function handleDocDragLeave(e, key) {
  e.preventDefault();
  const zone = document.getElementById(`drag-zone-${key}`);
  if (zone) zone.classList.remove('dragover');
}

export function handleDocDrop(e, key) {
  e.preventDefault();
  const zone = document.getElementById(`drag-zone-${key}`);
  if (zone) zone.classList.remove('dragover');

  const file = e.dataTransfer.files[0];
  if (file) {
    const ext = file.name.split('.').pop().toLowerCase();
    if (ext === 'pdf' || ext === 'jpg' || ext === 'png') {
      simulateDocUpload(key, file.name);
    } else {
      showToast("Invalid format: PDF, JPG, PNG only.", "danger");
    }
  }
}

export function simulateDocUpload(docType, fileName) {
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
    
    const pBar = document.getElementById(`progress-bar-${docType}`);
    if (pBar) pBar.style.width = `${current}%`;
    
    if (current === 100) {
      setTimeout(() => {
        renderStepper(); 
      }, 200);
    }
  }, 100);
}

// -----------------------------------------
// STEP 1 GEOGRAPHIC COVERAGE CHECK
// -----------------------------------------
function loadLeaflet(callback) {
  if (window.L) {
    callback(null);
    return;
  }
  
  if (!document.getElementById('leaflet-css-link')) {
    const css = document.createElement('link');
    css.id = 'leaflet-css-link';
    css.rel = 'stylesheet';
    css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(css);
  }
  
  if (!document.getElementById('leaflet-js-script')) {
    const js = document.createElement('script');
    js.id = 'leaflet-js-script';
    js.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    js.onload = () => callback(null);
    js.onerror = (err) => callback(err);
    document.head.appendChild(js);
  } else {
    const script = document.getElementById('leaflet-js-script');
    const prevOnload = script.onload;
    script.onload = () => {
      if (prevOnload) prevOnload();
      callback(null);
    };
  }
}

function renderMockMapFallback(mapEl, gisStatus, isFibre) {
  mapEl.innerHTML = `
    <div class="gis-map-inner" style="position: absolute; inset: 0; background: var(--bg-light);">
      <div class="gis-grid-lines"></div>
      <div class="gis-map-marker ${gisStatus === 'Coverage available' ? 'success' : (gisStatus === 'Coverage unavailable' ? 'danger' : '')}"></div>
      <div style="position: absolute; top: 12px; right: 12px; background: rgba(0,0,0,0.65); color: white; padding: 3px 8px; border-radius: 4px; font-size: 10px; font-weight: 700; letter-spacing: 0.5px;">${isFibre ? '🔌 FIBRE' : '📡 LTE'}</div>
      <div style="position: absolute; bottom: 12px; left: 12px; background: rgba(0,0,0,0.6); color: white; padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: 600; letter-spacing: 0.5px;">GIS GEOLOCATION ENGINE</div>
    </div>
  `;
}

export function renderStepperCoverageCheck(container) {
  const product = APP_STATE.cart.product;
  // Determine product type label
  const pkg = (product ? product.package || '' : '').toLowerCase();
  const isLTE = pkg.includes('lte') || pkg.includes('mbps');
  const isFibre = pkg.includes('fibre') || pkg.includes('fiber') ||
                  (product && (product.name || '').toLowerCase().includes('fibre'));
  const serviceLabel = isFibre ? 'Fibre Broadband' : 'LTE Fixed-Wireless';
  const checkLabel   = isFibre ? 'Fibre Coverage Checker' : 'LTE Network Coverage Checker';
  const blockMsg     = isFibre
    ? 'COVERAGE DECLINED: Address does not have Telkom Fibre services. Fixed-line ordering is blocked.'
    : 'COVERAGE DECLINED: Address is outside the LTE fixed-wireless coverage zone. Ordering is blocked.';
  const approvedMsg  = isFibre
    ? `COVERAGE APPROVED: Telkom Fibre is available at this address.`
    : `COVERAGE APPROVED: LTE Fixed-Wireless signal is available at this address.`;

  if (!APP_STATE.systemHealth.gis) {
    container.innerHTML = `
      <h3 style="margin-bottom: 16px;">${getStepperStepTitle(1, `GIS ${checkLabel}`)}</h3>
      <div style="background-color: var(--danger-light); border-left: 4px solid var(--danger); padding: 16px; border-radius: var(--radius-md); color: var(--danger); font-size: 13px; font-weight: 600; margin-bottom: 20px;">
        GIS API Offline: Connection to Telkom Coverage Checker timed out.
      </div>
      <button class="btn btn-primary" onclick="simulateGisApiRetry()">Retry Connection</button>
    `;
    return;
  }

  const isCustSelected = !!APP_STATE.selectedCustomer;
  const addr = isCustSelected
    ? APP_STATE.selectedCustomer.address
    : (APP_STATE.cart.tempCoverageAddress || '');
  const coverageData = MOCK_DB.gis[addr] || { ref: 'GIS-AUTO-' + Math.floor(1000 + Math.random() * 9000), coords: '-26.15, 28.05' };

  const gisStatus = APP_STATE.cart.gisStatus;

  // ── Status result banner ──────────────────────────────────────────────────
  let resultBox = '';
  if (gisStatus === 'Coverage available') {
    resultBox = `
      <div style="background-color: var(--success-light); border-left: 4px solid var(--success); padding: 14px; border-radius: var(--radius-md); margin-top: 16px;">
        <div style="font-size: 13px; font-weight: 700; color: var(--success); margin-bottom: 4px;">✅ ${approvedMsg}</div>
        <div style="font-size: 12px; color: var(--text-secondary);">GIS Ref: <strong>${APP_STATE.cart.gisRef || coverageData.ref}</strong> &nbsp;·&nbsp; Coords: ${coverageData.coords || 'N/A'}</div>
      </div>
    `;
  } else if (gisStatus === 'Coverage unavailable') {
    resultBox = `
      <div style="background-color: var(--danger-light); border-left: 4px solid var(--danger); padding: 14px; border-radius: var(--radius-md); margin-top: 16px;">
        <div style="font-size: 13px; font-weight: 700; color: var(--danger); margin-bottom: 4px;">❌ ${blockMsg}</div>
        <div style="font-size: 12px; color: var(--text-secondary);">Please advise the customer to check alternative service options.</div>
      </div>
    `;
  } else if (gisStatus === 'Coverage inconclusive') {
    resultBox = `
      <div style="background-color: var(--warning-light); border-left: 4px solid var(--warning); padding: 14px; border-radius: var(--radius-md); margin-top: 16px;">
        <div style="font-size: 13px; font-weight: 700; color: var(--warning); margin-bottom: 6px;">⚠️ GIS RESULT INCONCLUSIVE</div>
        <p style="font-size: 12px; margin-bottom: 12px; color: var(--text-secondary);">Address coordinates require manual site validation or field confirmation.</p>
        <button class="btn btn-sm btn-outline" onclick="forceCoverageAcceptance()">Manual Override &amp; Accept</button>
      </div>
    `;
  } else {
    // Not yet checked
    resultBox = `
      <div style="background-color: var(--bg-light); border-left: 4px solid var(--border-color); padding: 14px; border-radius: var(--radius-md); margin-top: 16px;">
        <div style="font-size: 13px; color: var(--text-muted);">⏳ Coverage check not yet performed. Click <strong>Execute Coverage Check</strong> to verify the service address.</div>
      </div>
    `;
  }

  // ── Address input ─────────────────────────────────────────────────────────
  let addressInputHtml = '';
  if (isCustSelected) {
    addressInputHtml = `
      <div class="form-group">
        <label class="form-label">Service / Installation Address</label>
        <input type="text" class="form-control" value="${addr}" disabled>
        <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">Address sourced from customer CRM profile.</div>
      </div>
    `;
  } else {
    addressInputHtml = `
      <div class="form-group">
        <label class="form-label">Service / Installation Address <span class="required">*</span></label>
        <input type="text" id="stepper-temp-address" class="form-control" value="${addr}"
          placeholder="e.g. 12 Main Rd, Rosebank, Johannesburg, 2196"
          oninput="updateTempAddress(this.value)">
        <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">Enter the full installation address for coverage verification.</div>
      </div>
    `;
  }

  // ── Info banner for product type ──────────────────────────────────────────
  const infoBanner = `
    <div style="background: linear-gradient(135deg, #e8f4fd, #d1ecf1); border: 1px solid #bee5eb; padding: 12px 16px; border-radius: var(--radius-md); margin-bottom: 20px; display: flex; align-items: center; gap: 12px;">
      <div style="font-size: 24px;">${isFibre ? '🔌' : '📡'}</div>
      <div>
        <div style="font-size: 12px; font-weight: 700; color: var(--telkom-blue-dark); margin-bottom: 2px;">${serviceLabel.toUpperCase()} PRODUCT SELECTED</div>
        <div style="font-size: 12px; color: var(--text-secondary);">A GIS coverage check is required before this order can proceed. Coverage must be confirmed as <strong>'Available'</strong> at the service address.</div>
      </div>
    </div>
  `;

  container.innerHTML = `
    <h3 style="margin-bottom: 8px;">${getStepperStepTitle(1, `GIS ${checkLabel}`)}</h3>
    ${infoBanner}

    <div class="gis-container">
      <div>
        ${addressInputHtml}
        <button class="btn btn-primary" onclick="simulateGisAddressCheck()" style="margin-bottom: 8px;">
          🔍 Execute Coverage Check
        </button>
        ${resultBox}
      </div>
      <div>
        <div id="gis-interactive-map" style="width: 100%; height: 280px; border-radius: var(--radius-md); border: 1px solid var(--border-color); background: #e0ecef; position: relative; overflow: hidden; box-shadow: var(--shadow-sm);">
          <div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; color: var(--text-secondary); font-size: 12px; font-family: var(--font-primary);">
            <span>⏳ Loading interactive GIS map view...</span>
          </div>
        </div>
        <div style="font-size: 11px; color: var(--text-muted); text-align: center; margin-top: 8px;">Coverage zone radius shown for ${serviceLabel}</div>
      </div>
    </div>
  `;

  setTimeout(() => {
    const mapEl = document.getElementById('gis-interactive-map');
    if (!mapEl) return;
    
    loadLeaflet((err) => {
      const liveMapEl = document.getElementById('gis-interactive-map');
      if (!liveMapEl) return;
      
      if (err) {
        renderMockMapFallback(liveMapEl, gisStatus, isFibre);
        return;
      }
      
      try {
        let lat = -26.15;
        let lng = 28.05;
        if (coverageData.coords) {
          const parts = coverageData.coords.split(',');
          if (parts.length === 2) {
            const pLat = parseFloat(parts[0]);
            const pLng = parseFloat(parts[1]);
            if (!isNaN(pLat) && !isNaN(pLng)) {
              lat = pLat;
              lng = pLng;
            }
          }
        }
        
        liveMapEl.innerHTML = '';
        const map = L.map(liveMapEl, {
          zoomControl: true,
          dragging: true,
          scrollWheelZoom: false
        }).setView([lat, lng], 13);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '© OpenStreetMap'
        }).addTo(map);
        
        const marker = L.marker([lat, lng]).addTo(map);
        marker.bindPopup(`<b>Service Location</b><br>${addr}`).openPopup();
        
        if (gisStatus === 'Coverage available') {
          L.circle([lat, lng], {
            color: '#91E200',
            fillColor: '#91E200',
            fillOpacity: 0.2,
            radius: 800
          }).addTo(map);
        } else if (gisStatus === 'Coverage unavailable') {
          L.circle([lat, lng], {
            color: '#ff4d4f',
            fillColor: '#ff4d4f',
            fillOpacity: 0.2,
            radius: 800
          }).addTo(map);
        } else if (gisStatus === 'Coverage inconclusive') {
          L.circle([lat, lng], {
            color: '#faad14',
            fillColor: '#faad14',
            fillOpacity: 0.2,
            radius: 800
          }).addTo(map);
        }
      } catch (ex) {
        console.error("Leaflet initialization failed", ex);
        renderMockMapFallback(liveMapEl, gisStatus, isFibre);
      }
    });
  }, 50);
}

export function updateStepperColor(color) {
  const p = APP_STATE.cart.product;
  if (p) {
    p.selectedColor = color;
    APP_STATE.productColors[p.id] = color;
    showToast(`Handset color updated to ${color}`, "info");
  }
}

// -----------------------------------------
// STEP 1 DEVICE STOCK CHECK
// -----------------------------------------
export function renderStepperStockCheck(container) {
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
  
  const imgPath = p.id === 'p-dev-1' ? 'Images/samsung_galaxy_s24.png' : (p.id === 'p-dev-2' ? 'Images/iphone_15_pro_max.png' : '');
  const imageHtml = imgPath ? `
    <div style="text-align: center; margin-bottom: 16px; background-color: var(--bg-light); border-radius: var(--radius-lg); padding: 16px; height: 160px; display: flex; align-items: center; justify-content: center; border: 1px solid var(--border-color);">
      <img src="${imgPath}" alt="${p.name}" style="max-height: 100%; max-width: 100%; object-fit: contain;">
    </div>
  ` : '';

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
        ${imageHtml}
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
  paginateExistingTable(container.querySelector('tbody'), {
    tableId: 'stepper-stock-check'
  });
}

export function renderStepperContractDetails(container, product) {
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

// -----------------------------------------
// STEP 10 REVIEW CHECKLIST
// -----------------------------------------
export function renderStepperReviewChecklist(container) {
  const product = APP_STATE.cart.product;
  if (!product) return;

  const customer = APP_STATE.selectedCustomer;
  if (!customer) return;

  // Gather billing selection info
  let bankName = "";
  let accountNo = "";
  let accountType = "";
  let debitDay = "";
  if (APP_STATE.cart.billingSelection) {
    const bill = APP_STATE.cart.billingSelection;
    if (bill.option === 'existing') {
      bankName = "FNB (Existing Profile)";
      accountNo = "••••5678";
      accountType = "Savings";
      debitDay = "1st";
    } else if (bill.option === 'new') {
      const nd = bill.newDebit;
      bankName = nd.bankName || "";
      accountNo = nd.accountNumber ? ("••••" + nd.accountNumber.slice(-4)) : "";
      accountType = nd.accountType || "";
      debitDay = nd.debitDay || "";
    }
  }

  // Gather affordability details
  const financial = APP_STATE.newCustomerData.financial || {};
  const gross = financial.grossIncome ? `R${parseFloat(financial.grossIncome).toLocaleString()}` : "R28,500";
  const net = financial.netIncome ? `R${parseFloat(financial.netIncome).toLocaleString()}` : "R21,200";
  const expenses = financial.expenses ? `R${parseFloat(financial.expenses).toLocaleString()}` : "R7,800";

  container.innerHTML = `
    <h3 style="margin-bottom: 16px;">${getStepperStepTitle(10, "Order Summary & Sign-off")}</h3>
    <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 24px;">Please review the summary details below, read the contract terms, and provide a manual signature to authorize your Telkom subscription.</p>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px;">
      <!-- Customer & Product info card -->
      <div style="background-color: var(--bg-light); border: 1px solid var(--border-color); padding: 18px; border-radius: var(--radius-lg);">
        <h5 style="color: var(--telkom-blue-dark); font-weight: 700; margin-bottom: 14px; border-bottom: 1px solid var(--border-color); padding-bottom: 6px; font-size: 13px; letter-spacing: 0.5px;">1. Customer & Product Details</h5>
        <div style="display: flex; flex-direction: column; gap: 10px; font-size: 13px;">
          <div><span style="color: var(--text-muted); font-weight: 600; font-size: 11px;">CUSTOMER:</span> <strong style="color: var(--text-primary); font-size: 14px;">${customer.name}</strong></div>
          <div><span style="color: var(--text-muted); font-weight: 600; font-size: 11px;">IDENTIFIER:</span> <span style="font-family: monospace;">${customer.id ? maskID(customer.id) : maskPassport(customer.passport)}</span></div>
          <div><span style="color: var(--text-muted); font-weight: 600; font-size: 11px;">CONTACT:</span> <span>${customer.mobile} | ${customer.email}</span></div>
          <div><span style="color: var(--text-muted); font-weight: 600; font-size: 11px;">BILLING ADDR:</span> <span style="font-size: 12px; color: var(--text-secondary);">${customer.address}</span></div>
          <div style="margin-top: 6px; border-top: 1px dashed var(--border-color); padding-top: 6px;"><span style="color: var(--text-muted); font-weight: 600; font-size: 11px;">ORDERING PRODUCT:</span> <strong style="color: var(--telkom-blue-dark);">${product.name}</strong></div>
          <div><span style="color: var(--text-muted); font-weight: 600; font-size: 11px;">ALLOCATION:</span> <span style="font-size: 12px; color: var(--text-secondary);">${product.allocation || product.description}</span></div>
          <div><span style="color: var(--text-muted); font-weight: 600; font-size: 11px;">MONTHLY COST:</span> <strong style="color: var(--telkom-blue); font-size: 15px;">R${product.price} pm</strong> for ${product.term} Months</div>
        </div>
      </div>

      <!-- Financial, Vetting & Bank info card -->
      <div style="background-color: var(--bg-light); border: 1px solid var(--border-color); padding: 18px; border-radius: var(--radius-lg);">
        <h5 style="color: var(--telkom-blue-dark); font-weight: 700; margin-bottom: 14px; border-bottom: 1px solid var(--border-color); padding-bottom: 6px; font-size: 13px; letter-spacing: 0.5px;">2. Payment & Credit Status</h5>
        <div style="display: flex; flex-direction: column; gap: 10px; font-size: 13px;">
          <div><span style="color: var(--text-muted); font-weight: 600; font-size: 11px;">BANK NAME:</span> <strong style="color: var(--text-primary);">${bankName || 'Not selected'}</strong></div>
          <div><span style="color: var(--text-muted); font-weight: 600; font-size: 11px;">ACCOUNT TYPE:</span> <span>${accountType || 'N/A'}</span></div>
          <div><span style="color: var(--text-muted); font-weight: 600; font-size: 11px;">ACCOUNT NO:</span> <span style="font-family: monospace;">${accountNo || 'N/A'}</span></div>
          <div><span style="color: var(--text-muted); font-weight: 600; font-size: 11px;">DEBIT DATE:</span> <span>${debitDay || 'N/A'}</span></div>
          <div style="margin-top: 6px; border-top: 1px dashed var(--border-color); padding-top: 6px;"><span style="color: var(--text-muted); font-weight: 600; font-size: 11px;">CREDIT ASSESSMENT:</span> <span class="badge badge-success" style="font-size: 10px;">Vetting Passed (Experian)</span></div>
          <div><span style="color: var(--text-muted); font-weight: 600; font-size: 11px;">AFFORDABILITY EVAL:</span> <span style="font-size:12px;">Gross: ${gross} | Net: ${net} | Exp: ${expenses}</span></div>
        </div>
      </div>
    </div>

    <!-- NCA Contract T&Cs -->
    <div style="margin-bottom: 24px;">
      <h5 style="color: var(--telkom-blue-dark); font-weight: 700; margin-bottom: 10px; font-size: 13px;">3. Postpaid Agreement Terms & Conditions</h5>
      <div style="background-color: var(--bg-card); border: 1px solid var(--border-color); padding: 14px; border-radius: var(--radius-md); font-size: 12px; color: var(--text-secondary); max-height: 120px; overflow-y: scroll; line-height: 1.5; margin-bottom: 12px; font-family: var(--font-primary);">
        <p style="margin-bottom: 8px;"><strong>1. Subscription Terms:</strong> The customer agrees to subscribe to the services outlined in this contract for a fixed period of ${product.term} months. Cancellation during the contract term may subject the customer to early termination fees as allowed under the National Credit Act (NCA).</p>
        <p style="margin-bottom: 8px;"><strong>2. Payment Terms:</strong> Payments are processed monthly via debit order. The customer authorizes Telkom SA SOC Ltd to debit the designated bank account on the chosen debit day. Failed debits may result in service suspension and credit bureau referral.</p>
        <p style="margin-bottom: 8px;"><strong>3. NCA & Credit Bureau:</strong> Telkom has assessed the customer's financial declarations and credit record. The customer declares that they have fully disclosed all necessary details and can comfortably afford the monthly payments.</p>
        <p><strong>4. POPIA compliance:</strong> Customer data is processed strictly in accordance with the Protection of Personal Information Act. Signing represents authorization to process files for service provision.</p>
      </div>
      <label class="checkbox-group" style="display: flex; gap: 10px; align-items: flex-start; cursor: pointer; user-select: none;">
        <input type="checkbox" id="stepper-final-consent-check" ${APP_STATE.cart.consent ? 'checked' : ''} onchange="toggleFinalConsent(this.checked)" style="width: 18px; height: 18px; cursor: pointer; margin-top: 2px;">
        <span style="font-size: 12px; color: var(--text-primary); line-height: 1.4;">I, <strong>${customer.name}</strong>, declare that I have read, understood, and accept the contract details, terms & conditions, and debit order authorization.</span>
      </label>
    </div>

    <!-- Manual Signature Canvas -->
    <div style="margin-bottom: 20px;">
      <h5 style="color: var(--telkom-blue-dark); font-weight: 700; margin-bottom: 10px; font-size: 13px;">4. Customer Signature Required</h5>
      <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 8px;">Please draw your signature in the box below using your mouse or touch screen.</p>
      
      <div style="display: flex; gap: 16px; align-items: flex-end; flex-wrap: wrap;">
        <div style="background-color: white; border: 2px dashed var(--border-color); border-radius: var(--radius-md); width: 420px; height: 150px; position: relative;">
          <canvas id="customer-signature-canvas" width="416" height="146" style="cursor: crosshair; display: block; border-radius: var(--radius-md);"></canvas>
          <div id="signature-placeholder" style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; color: var(--text-muted); font-size: 13px; pointer-events: none;">
            <em>Sign here</em>
          </div>
        </div>
        <div>
          <button class="btn btn-outline" onclick="clearSignatureCanvas()" style="height: 38px; border-color: var(--danger); color: var(--danger); font-weight: 600; font-size: 12px;">Clear Signature</button>
        </div>
      </div>
    </div>
  `;

  setTimeout(() => {
    initSignatureCanvas();
    validateFinalStepSubmission();
  }, 100);
}

export function initSignatureCanvas() {
  const canvas = document.getElementById('customer-signature-canvas');
  const placeholder = document.getElementById('signature-placeholder');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  ctx.strokeStyle = '#002f6c'; // Telkom blue signature color
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  let drawing = false;

  function getMousePos(canvasDom, touchOrMouseEvent) {
    const rect = canvasDom.getBoundingClientRect();
    const clientX = touchOrMouseEvent.touches ? touchOrMouseEvent.touches[0].clientX : touchOrMouseEvent.clientX;
    const clientY = touchOrMouseEvent.touches ? touchOrMouseEvent.touches[0].clientY : touchOrMouseEvent.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  }

  function startDrawing(e) {
    e.preventDefault();
    drawing = true;
    const pos = getMousePos(canvas, e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    if (placeholder) placeholder.style.display = 'none';
  }

  function draw(e) {
    if (!drawing) return;
    e.preventDefault();
    const pos = getMousePos(canvas, e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    APP_STATE.cart.hasSignature = true;
    validateFinalStepSubmission();
  }

  function stopDrawing(e) {
    if (drawing) {
      e.preventDefault();
      drawing = false;
    }
  }

  canvas.addEventListener('mousedown', startDrawing);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseup', stopDrawing);
  canvas.addEventListener('mouseleave', stopDrawing);

  canvas.addEventListener('touchstart', startDrawing, { passive: false });
  canvas.addEventListener('touchmove', draw, { passive: false });
  canvas.addEventListener('touchend', stopDrawing, { passive: false });
  
  if (APP_STATE.cart.hasSignature) {
    if (placeholder) placeholder.style.display = 'none';
    ctx.beginPath();
    ctx.moveTo(50, 70);
    ctx.bezierCurveTo(150, 30, 200, 110, 350, 60);
    ctx.stroke();
  }
}

export function toggleFinalConsent(checked) {
  APP_STATE.cart.consent = checked;
  validateFinalStepSubmission();
}

export function clearSignatureCanvas() {
  const canvas = document.getElementById('customer-signature-canvas');
  const placeholder = document.getElementById('signature-placeholder');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (placeholder) placeholder.style.display = 'flex';
  APP_STATE.cart.hasSignature = false;
  validateFinalStepSubmission();
}

export function validateFinalStepSubmission() {
  const nextBtn = document.getElementById('stepper-next-btn');
  if (!nextBtn) return;
  const isConsent = !!APP_STATE.cart.consent;
  const isSigned = !!APP_STATE.cart.hasSignature;
  nextBtn.disabled = !(isConsent && isSigned);
  nextBtn.style.opacity = (isConsent && isSigned) ? '1' : '0.5';
  nextBtn.style.cursor = (isConsent && isSigned) ? 'pointer' : 'not-allowed';
}

window.toggleFinalConsent = toggleFinalConsent;
window.clearSignatureCanvas = clearSignatureCanvas;
window.validateFinalStepSubmission = validateFinalStepSubmission;

export function toggleConsent() {
  APP_STATE.cart.consent = document.getElementById('consent-check').checked;
}

export function simulateGisAddressCheck() {
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

export function forceCoverageAcceptance() {
  APP_STATE.cart.gisStatus = "Coverage available";
  APP_STATE.cart.gisRef = "GIS-OVERRIDE-TEMP";
  showToast("Manual GIS Coverage override accepted.", "success");
  renderStepper();
}

export function simulateGisApiRetry() {
  APP_STATE.systemHealth.gis = true;
  showToast("GIS checker API reconnected.", "success");
  renderStepper();
}

export function simulateStockCheckAction() {
  const p = APP_STATE.cart.product;
  const stock = MOCK_DB.stock[APP_STATE.currentUser.branch]?.[p.deviceSKU];
  
  if (stock && stock.available > 0) {
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

export function simulateStockApiRetry() {
  APP_STATE.systemHealth.transact = true;
  showToast("Transact stock database online.", "success");
  renderStepper();
}

export function notifyStoreManagerForStock() {
  showToast("Notification dispatched to Store Manager regarding out of stock device.", "info");
}

export function selectProductForStepper(prodId) {
  if (APP_STATE.selectedCustomer && APP_STATE.selectedCustomer.status === 'Suspended') {
    showToast("Transaction Blocked: This customer account is suspended. Clear outstanding balances in Clarify CRM first.", "danger");
    return;
  }

  const p = findProductById(prodId) || MOCK_DB.products.find(prod => prod.id === prodId);
  if (p) {
    const isHandset = (p.category || '').toLowerCase().includes('handset');
    const { term, price } = getProductTermAndPrice(p);

    let selectedColor = APP_STATE.productColors[prodId];
    if (isHandset && !selectedColor) {
      let colors = ["Midnight Black", "Space Grey", "Silver"];
      const deviceName = (p.device || p.name || '').toLowerCase();
      if (deviceName.includes('samsung') || deviceName.includes('galaxy') || deviceName.includes('s26') || deviceName.includes('s24')) {
        colors = ["Onyx Black", "Marble Gray", "Cobalt Violet", "Amber Yellow"];
      } else if (deviceName.includes('apple') || deviceName.includes('iphone')) {
        colors = ["Natural Titanium", "Blue Titanium", "White Titanium", "Black Titanium"];
      }
      selectedColor = colors[0];
      APP_STATE.productColors[prodId] = selectedColor;
    }

    let deviceSKU = p.deviceSKU;
    if (isHandset) {
      deviceSKU = `SKU-${p.id}-${selectedColor.replace(/\s+/g, '')}-${term}`;
      if (window.getProductStock) {
        window.getProductStock(p.id, selectedColor, term);
      }
    }

    // Reset coverage / stock flags based on product type
    if (requiresCoverageCheck(p)) {
      // LTE / Fibre → requires GIS address check
      if (APP_STATE.checkedCoverage && APP_STATE.checkedCoverage.status === 'Coverage available') {
        APP_STATE.cart.tempCoverageAddress = APP_STATE.checkedCoverage.address;
        APP_STATE.cart.gisStatus = "Coverage available";
        APP_STATE.cart.gisRef = APP_STATE.checkedCoverage.ref;
      } else {
        APP_STATE.cart.gisStatus = "Not checked";
        APP_STATE.cart.gisRef = "";
      }
      APP_STATE.cart.stockChecked = true;   // no physical device to allocate
      APP_STATE.cart.stockStatus = "Skip";
    } else if (isHandset || p.deviceSKU) {
      // Physical handset → stock check required
      APP_STATE.cart.gisStatus = "Skip";
      APP_STATE.cart.stockChecked = false;
      APP_STATE.cart.stockStatus = "";
    } else {
      // Pure SIM / mobile plan → no stock, no GIS
      APP_STATE.cart.gisStatus = "Skip";
      APP_STATE.cart.stockChecked = true;
      APP_STATE.cart.stockStatus = "Skip";
    }

    APP_STATE.cart.product = {
      ...p,
      price: price,
      term: term,
      selectedColor: selectedColor || '',
      deviceSKU: deviceSKU
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

export function handleStepperBack() {
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

export function handleStepperNext() {
  const step = APP_STATE.currentStep;

  if (step === 1) {
    const prod1 = APP_STATE.cart.product;
    if (requiresCoverageCheck(prod1)) {
      // LTE / Fibre — must pass GIS coverage check
      if (APP_STATE.cart.gisStatus !== 'Coverage available') {
        showToast("Coverage check required: Please run and pass the GIS coverage check before proceeding.", "warning");
        return;
      }
    } else if (prod1.deviceSKU) {
      // Handset — must pass stock check
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

  // Validate Step 5: Billing & Credit Vetting
  if (step === 5) {
    saveBillingInputs();
    const bill = APP_STATE.cart.billingSelection;
    if (bill && bill.option === 'new') {
      const nd = bill.newDebit;
      if (!nd.bankName || !nd.branchCode || !nd.accountType || !nd.accountNumber || !nd.debitDay) {
        showToast("Please fill in all mandatory debit details (*)", "warning");
        return;
      }
      if (nd.accountVerificationStatus !== "Verified") {
        showToast("Account Holder Verification is required before proceeding.", "warning");
        return;
      }
      if (!nd.debiCheckConsent) {
        showToast("DebiCheck collection authorization checkbox is required.", "warning");
        return;
      }
      if (!nd.termsConsent) {
        showToast("Terms & Conditions acceptance checkbox is required.", "warning");
        return;
      }
    }

    // Embed Credit Vetting validation inside billing selection step
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

  // Validate Step 9: Supporting Documents
  if (step === 9) {
    saveDocsOptionInput();
    const sd = APP_STATE.cart.supportingDocs;
    if (sd && sd.option === 'now') {
      const uploads = sd.uploads;
      if (!uploads.idDoc || !uploads.bankStatements || !uploads.proofAddress) {
        showToast("Please upload all three required supporting documents or select 'Skip for now'.", "warning");
        return;
      }
    }
  }

  // Final Step 10: Submission
  if (step === 10) {
    if (!APP_STATE.cart.consent) {
      showToast("Please accept the Terms & Conditions to proceed.", "warning");
      return;
    }
    if (!APP_STATE.cart.hasSignature) {
      showToast("Please sign the contract on the signature pad to submit the order.", "warning");
      return;
    }
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

export function updateCIMState() {
  const type = document.getElementById('stepper-cim-type').value;
  const notes = document.getElementById('stepper-cim-notes').value;
  APP_STATE.activeCIMInteraction.type = type;
  APP_STATE.activeCIMInteraction.notes = notes;
  updateCIMNotesCount();

  if (notes.trim().length >= 10) {
    document.getElementById('cim-notes-error').style.display = 'none';
  }
}

export function updateCIMNotesCount() {
  const count = APP_STATE.activeCIMInteraction.notes.trim().length;
  const countEl = document.getElementById('cim-char-count');
  if (countEl) countEl.innerText = count;
}

export function updateContractDetailsState() {
  APP_STATE.cart.contractDetails.simType = document.getElementById('mobile-sim-type').value;
  const numOpt = document.getElementById('mobile-number-opt').value;
  APP_STATE.cart.contractDetails.numberOption = numOpt;
  
  const portEl = document.getElementById('port-in-wrapper');
  if (numOpt === 'Port In') {
    if (portEl) portEl.style.display = 'block';
    APP_STATE.cart.contractDetails.portInNumber = document.getElementById('mobile-port-number').value;
  } else {
    if (portEl) portEl.style.display = 'none';
    APP_STATE.cart.contractDetails.portInNumber = '';
  }
}

export function submitOrderToOMS() {
  if (!APP_STATE.systemHealth.oms) {
    showToast("Amdocs OMS Submission Timeout. System Unavailable.", "danger");
    return;
  }

  const ordRef = "ORD-" + Math.floor(100000 + Math.random() * 900000);
  APP_STATE.cart.orderRef = ordRef;

  APP_STATE.selectedCustomer.interactions.unshift({
    date: new Date().toISOString().slice(0, 10) + " " + new Date().toTimeString().slice(0, 5),
    agent: APP_STATE.currentUser.id,
    type: "New Order",
    notes: `OMS order submitted: ${ordRef}. Product: ${APP_STATE.cart.product.name}. CIM notes: ${APP_STATE.activeCIMInteraction.notes}`
  });

  switchRoute('payment');
}

export function renderPaymentScreen() {
  document.getElementById('pay-order-ref').innerText = APP_STATE.cart.orderRef;
  document.getElementById('pay-amount').innerText = `R${APP_STATE.cart.product.price + APP_STATE.cart.product.onceOff}`;
  
  const payMethodSelect = document.getElementById('pay-method');
  if (payMethodSelect) {
    payMethodSelect.innerHTML = `
      <option value="card">Standard POS Credit / Debit Card swipe</option>
      <option value="cash">Branch Cash Payment Register</option>
    `;
    
    const product = APP_STATE.cart.product;
    const isHandsetContract = product && (product.category === 'Handset contracts' || (product.category || '').toLowerCase().includes('handset'));
    if (isHandsetContract) {
      const dbkOption = document.createElement('option');
      dbkOption.value = 'debicheck';
      dbkOption.textContent = 'DebiCheck Payment Authorization';
      payMethodSelect.appendChild(dbkOption);
    }
    
    payMethodSelect.value = 'card';
  }

  handlePaymentMethodChange();
  
  const payBtn = document.getElementById('pay-init-btn');
  if (payBtn) {
    payBtn.disabled = false;
    payBtn.innerHTML = `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> Verify transaction`;
  }
}

export function handlePaymentMethodChange() {
  const methodSelect = document.getElementById('pay-method');
  const container = document.getElementById('debit-date-selection-container');
  if (methodSelect && container) {
    if (methodSelect.value === 'debicheck') {
      container.style.display = 'block';
    } else {
      container.style.display = 'none';
    }
  }
}

export function handlePOSPaymentTrigger() {
  const payBtn = document.getElementById('pay-init-btn');
  if (!payBtn) return;

  const outcomeSelect = document.getElementById('mock-payment-outcome');
  const outcome = outcomeSelect ? outcomeSelect.value : 'Successful';

  const payMethodSelect = document.getElementById('pay-method');
  const paymentMethod = payMethodSelect ? payMethodSelect.value : 'card';
  
  let debitDate = "";
  if (paymentMethod === 'debicheck') {
    const debitDateSelect = document.getElementById('pay-debit-date');
    debitDate = debitDateSelect ? debitDateSelect.value : '1st';
  }

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

  payBtn.disabled = true;
  payBtn.innerText = "Connecting terminal...";

  setTimeout(() => {
    payBtn.innerText = "Verifying transaction...";
    
    setTimeout(() => {
      if (paymentMethod === 'debicheck') {
        APP_STATE.cart.posTxnRef = "DBK-" + Math.floor(10000000 + Math.random() * 90000000);
        APP_STATE.cart.receiptNo = "REC-" + Math.floor(10000000 + Math.random() * 90000000);
        APP_STATE.cart.paymentStatus = "Scheduled";
        APP_STATE.cart.paymentMethod = "debicheck";
        APP_STATE.cart.debitDate = debitDate;
      } else {
        APP_STATE.cart.posTxnRef = "POS-" + Math.floor(10000000 + Math.random() * 90000000);
        APP_STATE.cart.receiptNo = "REC-" + Math.floor(10000000 + Math.random() * 90000000);
        APP_STATE.cart.paymentStatus = "Successful";
        APP_STATE.cart.paymentMethod = paymentMethod;
        APP_STATE.cart.debitDate = "";
      }

      const isSimProduct = isSimOrLteProduct(APP_STATE.cart.product);
      
      const isNewDebit = APP_STATE.cart.billingSelection && APP_STATE.cart.billingSelection.option === 'new';
      let debiCheck = null;
      if (isNewDebit) {
        debiCheck = {
          bankName: APP_STATE.cart.billingSelection.newDebit.bankName,
          accountNumber: APP_STATE.cart.billingSelection.newDebit.accountNumber,
          accountType: APP_STATE.cart.billingSelection.newDebit.accountType,
          branchCode: APP_STATE.cart.billingSelection.newDebit.branchCode,
          debitDay: APP_STATE.cart.billingSelection.newDebit.debitDay,
          debiCheckConsent: APP_STATE.cart.billingSelection.newDebit.debiCheckConsent,
          termsConsent: APP_STATE.cart.billingSelection.newDebit.termsConsent,
          monthlyAmount: APP_STATE.cart.product.price,
          onceOffAmount: APP_STATE.cart.product.onceOff,
          debiCheckRef: "DBC-" + Math.floor(10000000 + Math.random() * 90000000)
        };
      } else if (paymentMethod === 'debicheck') {
        const bd = APP_STATE.selectedCustomer && APP_STATE.selectedCustomer.bankDetails;
        debiCheck = {
          bankName: bd ? bd.bankName : "Standard Bank",
          accountNumber: bd ? bd.accountNumber : "••••1234",
          accountType: "Savings",
          branchCode: "250655",
          debitDay: debitDate,
          debiCheckConsent: true,
          termsConsent: true,
          monthlyAmount: APP_STATE.cart.product.price,
          onceOffAmount: APP_STATE.cart.product.onceOff,
          debiCheckRef: APP_STATE.cart.posTxnRef
        };
      }

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
        payment: paymentMethod === 'debicheck' ? `Payment Complete (Scheduled DebiCheck: ${debitDate})` : "Payment Complete",
        paymentMethod: paymentMethod,
        debitDate: debitDate,
        date: new Date().toISOString().replace('T', ' ').slice(0, 19),
        ricaStatus: isSimProduct ? "Pending" : "N/A",
        simActivationNumber: "",
        isSimProduct: isSimProduct,
        debiCheck: debiCheck
      };

      if (APP_STATE.cart.draftId) {
        APP_STATE.draftOrders = APP_STATE.draftOrders.filter(d => d.draftId !== APP_STATE.cart.draftId);
        saveDraftOrders();
      }

      APP_STATE.ordersList.unshift(newOrder);
      saveOrders();

      pushNotification(
        "Order Processed Successfully",
        `Order ${newOrder.orderRef} for ${newOrder.customerName} processed and paid.`,
        "order_submitted",
        "Normal"
      );

      showToast("POS payment success. Receipt generated.", "success");
      APP_STATE.isCustomerIdentifiedInJourney = false;
      switchRoute('confirmation');
    }, 300);
  }, 300);
}

export function renderConfirmationReceipt() {
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
  const totalAmount = `R${APP_STATE.cart.product.price + APP_STATE.cart.product.onceOff}`;
  document.getElementById('conf-total').innerText = totalAmount;

  const debiNoticeEl = document.getElementById('conf-debicheck-notice');
  const totalLabelEl = document.getElementById('conf-total-label');
  if (APP_STATE.cart.paymentMethod === 'debicheck') {
    if (debiNoticeEl) {
      debiNoticeEl.style.display = 'block';
      const amtEl = document.getElementById('conf-debicheck-amount');
      if (amtEl) amtEl.innerText = totalAmount;
      const dateEl = document.getElementById('conf-debicheck-date');
      if (dateEl) {
        const suffix = APP_STATE.cart.debitDate.includes('month') ? '' : ' of the month';
        dateEl.innerText = APP_STATE.cart.debitDate + suffix;
      }
    }
    if (totalLabelEl) {
      totalLabelEl.innerText = 'DEBICHECK SCHEDULED DEBIT';
    }
  } else {
    if (debiNoticeEl) {
      debiNoticeEl.style.display = 'none';
    }
    if (totalLabelEl) {
      totalLabelEl.innerText = 'TOTAL TRANSFERRED POS';
    }
  }

  const isSimProduct = isSimOrLteProduct(APP_STATE.cart.product);
  const panel = document.getElementById('confirmation-rica-activation-panel');
  if (isSimProduct && panel) {
    panel.style.display = 'block';
    renderConfirmationRicaActivation();
  } else if (panel) {
    panel.style.display = 'none';
  }

  renderConfirmationContract(APP_STATE.cart.orderRef);
}

export function downloadContractOnly(orderRef) {
  let customer = null;
  let product = null;
  let bankName = "N/A";
  let accountNo = "N/A";
  let term = 24;
  let price = 0;
  let onceOff = 0;
  let allocation = "";
  let selectedColor = "";

  if (APP_STATE.cart && APP_STATE.cart.orderRef === orderRef) {
    customer = APP_STATE.selectedCustomer;
    const pObj = APP_STATE.cart.product;
    if (pObj) {
      product = pObj;
      price = pObj.price;
      term = pObj.term || 24;
      allocation = pObj.allocation || "";
      onceOff = pObj.onceOff || 0;
      selectedColor = pObj.selectedColor || "";
    }
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
  } else {
    const order = APP_STATE.ordersList.find(o => o.orderRef === orderRef);
    if (!order) {
      showToast("Order details not found.", "danger");
      return;
    }
    customer = MOCK_DB.crm.find(c => c.accountNumber === order.accountNo || c.name === order.customerName);
    const pObj = MOCK_DB.products.find(p => p.name === order.product);
    if (pObj) {
      product = pObj;
      price = pObj.price;
      term = pObj.term || 24;
      allocation = pObj.allocation || "";
      onceOff = pObj.onceOff || 0;
      selectedColor = order.selectedColor || "";
    }
    if (order.debiCheck) {
      bankName = order.debiCheck.bankName || "N/A";
      const fullAcc = order.debiCheck.accountNumber || "";
      accountNo = fullAcc.length > 4 ? "••••" + fullAcc.slice(-4) : fullAcc;
    } else {
      const refNum = parseInt(order.orderRef.replace(/\D/g, '')) || 0;
      const banks = ["ABSA", "Standard Bank", "Nedbank", "FNB", "Capitec Bank Limited"];
      bankName = banks[refNum % banks.length];
      accountNo = "••••" + String((refNum * 997) % 10000).padStart(4, '0');
    }
  }

  if (!customer || !product) {
    showToast("Unable to generate contract document: missing customer or product information.", "danger");
    return;
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Telkom Customer Contract - ${orderRef}</title>
        <style>
          body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #333; line-height: 1.6; }
          .header { text-align: center; border-bottom: 3px solid #0099ff; padding-bottom: 10px; margin-bottom: 30px; }
          h2 { color: #0f3057; margin: 0; }
          .section-title { color: #0f3057; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-top: 25px; margin-bottom: 15px; font-size: 12px; letter-spacing: 1px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px; }
          td { padding: 8px 0; border-bottom: 1px solid #eee; }
          td.label { font-weight: bold; width: 30%; color: #666; }
          .signatures { display: flex; justify-content: space-between; margin-top: 40px; }
          .sig-box { width: 45%; border: 1px dashed #ccc; padding: 15px; text-align: center; background-color: #f9f9f9; }
          .sig-font { font-family: 'Georgia', serif; font-style: italic; font-size: 18px; color: #0f3057; margin: 8px 0; }
          .footer { text-align: center; font-size: 11px; color: #999; margin-top: 50px; border-top: 1px solid #eee; padding-top: 10px; }
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
            <td>${product.term || term} Months</td>
          </tr>
          <tr>
            <td class="label">Monthly Charge</td>
            <td>R${price} /mo</td>
            <td class="label">Once-off Connection Fee</td>
            <td>R${onceOff}</td>
          </tr>
          <tr>
            <td class="label">Plan Details</td>
            <td colspan="3">${allocation}</td>
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
      </body>
    </html>
  `;

  const blob = new Blob([htmlContent], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Telkom_Contract_${orderRef}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast("Contract document downloaded successfully.", "success");
}

export function renderConfirmationContract(orderRef) {
  const panel = document.getElementById('confirmation-contract-panel');
  if (!panel) return;

  const product = APP_STATE.cart.product;
  const customer = APP_STATE.selectedCustomer;
  if (!product || !customer) {
    panel.style.display = 'none';
    return;
  }

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
    <div class="contract-header" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid var(--telkom-blue); padding-bottom: 16px; margin-bottom: 20px;">
      <div style="text-align: left;">
        <h3 style="color: var(--telkom-blue-dark); font-weight: 800; margin: 0; letter-spacing: 0.5px;">Customer Contract Agreement</h3>
        <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px; font-weight: 700;">TELKOM SA SOC LTD - MOBILE & BROADBAND SERVICES</div>
      </div>
      <button onclick="downloadContractOnly('${orderRef}')" class="btn btn-sm btn-outline" style="display: flex; align-items: center; gap: 6px; padding: 6px 12px; border-color: var(--telkom-blue); color: var(--telkom-blue-dark); font-weight: 600; cursor: pointer; border-radius: var(--radius-md); transition: all 0.2s;" title="Download Contract Only">
        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
          <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M12 4v12m0 0l-4-4m4 4l4-4" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>Download Contract</span>
      </button>
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

      <h5 style="color: var(--telkom-blue-dark); font-weight: 700; border-bottom: 1px solid var(--border-color); padding-bottom: 4px; margin-bottom: 10px; font-size: 12px; letter-spacing: 0.5px;">1. Contracting Parties</h5>
      <div style="margin-bottom: 20px;">
        <div style="display: grid; grid-template-columns: 100px 1fr; gap: 4px 12px;">
          <span style="color: var(--text-secondary);">Provider:</span>
          <strong>Telkom SA SOC Limited (Reg: 1991/005476/30)</strong>
          <span style="color: var(--text-secondary);">Customer:</span>
          <strong>${customer.name}</strong>
          <span style="color: var(--text-secondary);">ID/Passport:</span>
          <strong>${customer.id ? maskID(customer.id) : maskPassport(customer.passport)}</strong>
          <span style="color: var(--text-secondary);">Address:</span>
          <strong>${customer.address}</strong>
        </div>
      </div>

      <h5 style="color: var(--telkom-blue-dark); font-weight: 700; border-bottom: 1px solid var(--border-color); padding-bottom: 4px; margin-bottom: 10px; font-size: 12px; letter-spacing: 0.5px;">2. Contracted Service & Pricing</h5>
      <div style="margin-bottom: 20px;">
        <div style="display: grid; grid-template-columns: 100px 1fr; gap: 4px 12px;">
          <span style="color: var(--text-secondary);">Plan Name:</span>
          <strong>${product.name} ${product.selectedColor ? `(${product.selectedColor})` : ''}</strong>
          <span style="color: var(--text-secondary);">Term:</span>
          <strong>${product.term} Months</strong>
          <span style="color: var(--text-secondary);">Allocations:</span>
          <strong>${product.allocation}</strong>
          <span style="color: var(--text-secondary);">Monthly Cost:</span>
          <strong>R${product.price}.00 pm (VAT Incl.)</strong>
          <span style="color: var(--text-secondary);">Once-off Fee:</span>
          <strong>R${product.onceOff}.00</strong>
        </div>
      </div>

      <h5 style="color: var(--telkom-blue-dark); font-weight: 700; border-bottom: 1px solid var(--border-color); padding-bottom: 4px; margin-bottom: 10px; font-size: 12px; letter-spacing: 0.5px;">3. Debit Order Billing Instructions</h5>
      <div style="margin-bottom: 20px;">
        <div style="display: grid; grid-template-columns: 100px 1fr; gap: 4px 12px;">
          <span style="color: var(--text-secondary);">Bank Name:</span>
          <strong>${bankName}</strong>
          <span style="color: var(--text-secondary);">Account No:</span>
          <strong>${accountNo}</strong>
          <span style="color: var(--text-secondary);">Debit Date:</span>
          <strong>1st of every month</strong>
        </div>
      </div>

      <div style="border-top: 1px solid var(--border-color); padding-top: 16px; margin-top: 24px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px;">
        <div>
          <div style="font-size: 10px; color: var(--text-muted); font-weight: 700; text-transform: uppercase; margin-bottom: 4px;">Authorized Agent Signature</div>
          <div style="font-family: 'Courier New', Courier, monospace; font-size: 14px; font-style: italic; color: var(--telkom-blue); font-weight: 700; border-bottom: 1px solid var(--border-color); padding: 8px 0;">${APP_STATE.currentUser.name}</div>
          <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">Agent ID: ${APP_STATE.currentUser.id} | PTA-001 Retail Store</div>
        </div>
        <div>
          <div style="font-size: 10px; color: var(--text-muted); font-weight: 700; text-transform: uppercase; margin-bottom: 4px;">Customer Acceptance Signature</div>
          <div style="font-family: 'Courier New', Courier, monospace; font-size: 14px; font-style: italic; color: var(--telkom-blue-dark); font-weight: 700; border-bottom: 1px solid var(--border-color); padding: 8px 0;">Signed digitally (${customer.name.split(' ').map(n=>n[0]).join('')})</div>
          <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">IP Address: 165.143.22.8 | Signed on digital signature pad</div>
        </div>
      </div>
    </div>
  `;
}

export function renderConfirmationRicaActivation() {
  const panel = document.getElementById('confirmation-rica-activation-panel');
  if (!panel) return;

  const orderRef = APP_STATE.cart.orderRef;
  const order = APP_STATE.ordersList.find(o => o.orderRef === orderRef);
  if (!order) return;

  panel.style.display = 'block';
  renderOrderActivationWorkflow(order, panel, false);
}

export function handleCancelOrder(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  
  const reasonEl = document.getElementById('custom-cancellation-reason');
  if (reasonEl) {
    reasonEl.value = '';
  }

  openModal('cancellation-confirm-modal');
}

export function submitCustomCancellation() {
  const reasonEl = document.getElementById('custom-cancellation-reason');
  const reason = reasonEl ? (reasonEl.value.trim() || "No reason provided") : "No reason provided";

  closeModal('cancellation-confirm-modal');

  const ordRef = APP_STATE.cart.orderRef || "ORD-" + Math.floor(100000 + Math.random() * 900000);
  const isSimProduct = isSimOrLteProduct(APP_STATE.cart.product);
  
  const newCancelledOrder = {
    orderRef: ordRef,
    customerName: APP_STATE.selectedCustomer ? APP_STATE.selectedCustomer.name : "Anonymous Customer",
    accountNo: APP_STATE.selectedCustomer ? APP_STATE.selectedCustomer.accountNumber : "N/A",
    product: APP_STATE.cart.product ? APP_STATE.cart.product.name : "Unknown Product",
    selectedColor: APP_STATE.cart.product ? (APP_STATE.cart.product.selectedColor || "") : "",
    type: APP_STATE.cart.product ? APP_STATE.cart.product.type : "",
    store: APP_STATE.currentUser.branch,
    agent: APP_STATE.currentUser.id,
    status: "Cancelled",
    payment: "Cancelled",
    date: new Date().toISOString().replace('T', ' ').slice(0, 19),
    ricaStatus: "N/A",
    simActivationNumber: "",
    isSimProduct: isSimProduct,
    debiCheck: null,
    cancelledAudit: {
      cancelledBy: APP_STATE.currentUser.id,
      cancellationDate: new Date().toISOString().replace('T', ' ').slice(0, 19),
      lastCompletedStep: getStepperStepTitle(APP_STATE.currentStep, "Step " + APP_STATE.currentStep),
      reason: reason
    }
  };

  if (APP_STATE.cart.draftId) {
    APP_STATE.draftOrders = APP_STATE.draftOrders.filter(d => d.draftId !== APP_STATE.cart.draftId);
    saveDraftOrders();
  }

  APP_STATE.ordersList.unshift(newCancelledOrder);
  saveOrders();

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
    paymentMethod: "",
    debitDate: "",
    posTxnRef: "",
    receiptNo: "",
    orderRef: "",
    draftId: ""
  };
  APP_STATE.currentStep = 1;

  showToast(`Order ${ordRef} has been cancelled.`, "info");

  switchRoute('order-tracking');
  if (window.switchTrackingTab) {
    window.switchTrackingTab('cancelled');
  }
}

export function cancelToSaveDraft() {
  closeModal('cancellation-confirm-modal');

  const currentStep = APP_STATE.currentStep;

  // Save current step inputs before building draft object
  if (currentStep === 4) {
    const cimTypeEl = document.getElementById('stepper-cim-type');
    const cimNotesEl = document.getElementById('stepper-cim-notes');
    if (APP_STATE.activeCIMInteraction) {
      if (cimTypeEl) APP_STATE.activeCIMInteraction.type = cimTypeEl.value;
      if (cimNotesEl) APP_STATE.activeCIMInteraction.notes = cimNotesEl.value;
    }
  } else if (currentStep === 5) {
    if (document.getElementById('billing-new-bankname')) {
      saveBillingInputs();
    }
  } else if (currentStep === 7) {
    if (document.getElementById('mobile-sim-type')) {
      updateContractDetailsState();
    }
  } else if (currentStep === 9) {
    if (document.querySelector('input[name="docs-opt"]:checked')) {
      saveDocsOptionInput();
    }
  }

  const targetId = APP_STATE.cart.draftId || "DRF-" + Math.floor(100000 + Math.random() * 900000);

  const draftObj = {
    draftId: targetId,
    customerName: APP_STATE.selectedCustomer ? APP_STATE.selectedCustomer.name : "",
    customerAccount: APP_STATE.selectedCustomer ? APP_STATE.selectedCustomer.accountNumber : "",
    selectedCustomer: APP_STATE.selectedCustomer,
    activeCIMInteraction: APP_STATE.activeCIMInteraction,
    product: APP_STATE.cart.product,
    cart: { ...APP_STATE.cart, draftId: targetId, status: "Draft" },
    step: currentStep,
    branch: APP_STATE.currentUser.branch,
    agentId: APP_STATE.currentUser.id,
    timestamp: new Date().toISOString(),
    status: "Draft"
  };

  const existsIdx = APP_STATE.draftOrders.findIndex(d => d.draftId === targetId);
  if (existsIdx > -1) {
    APP_STATE.draftOrders[existsIdx] = draftObj;
  } else {
    APP_STATE.draftOrders.unshift(draftObj);
  }

  saveDraftOrders();
  showToast(`Checkout draft saved successfully! ID: ${targetId}`, "success");

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
    paymentMethod: "",
    debitDate: "",
    posTxnRef: "",
    receiptNo: "",
    orderRef: "",
    draftId: ""
  };
  APP_STATE.currentStep = 1;

  switchRoute('catalogue');
}

export function runBillingCreditVettingCheck() {
  const select = document.getElementById('mock-billing-vetting-outcome');
  const val = select ? select.value : 'Successful';
  
  if (!APP_STATE.cart.creditVetting) {
    APP_STATE.cart.creditVetting = { outcome: "", ran: false, depositPaid: false };
  }
  APP_STATE.cart.creditVetting.outcome = val;
  APP_STATE.cart.creditVetting.ran = true;
  APP_STATE.cart.creditVetting.depositPaid = false;
  
  showToast(`Credit Bureau check finished: ${val}`, "success");
  renderStepper();
}

export function payBillingCreditVettingDeposit() {
  if (APP_STATE.cart.creditVetting) {
    APP_STATE.cart.creditVetting.depositPaid = true;
    showToast("Refundable deposit of R250.00 registered successfully.", "success");
    renderStepper();
  }
}

// Bind to window for global access (from HTML inline onclick attributes)
window.runBillingCreditVettingCheck = runBillingCreditVettingCheck;
window.payBillingCreditVettingDeposit = payBillingCreditVettingDeposit;
window.handleCancelOrder = handleCancelOrder;
window.submitCustomCancellation = submitCustomCancellation;
window.cancelToSaveDraft = cancelToSaveDraft;
window.requiresCoverageCheck = requiresCoverageCheck;
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
window.updateCIMState = updateCIMState;
window.updateCIMNotesCount = updateCIMNotesCount;
window.updateContractDetailsState = updateContractDetailsState;
window.submitOrderToOMS = submitOrderToOMS;
window.renderPaymentScreen = renderPaymentScreen;
window.handlePOSPaymentTrigger = handlePOSPaymentTrigger;
window.renderConfirmationReceipt = renderConfirmationReceipt;
window.renderConfirmationContract = renderConfirmationContract;
window.renderConfirmationRicaActivation = renderConfirmationRicaActivation;
