import { MOCK_DB, APP_STATE, saveOrders, saveDraftOrders, BANK_OPTIONS } from './state.js';
import { showToast, pushNotification, maskID, maskPassport } from './utils.js';
import { switchRoute } from './routing.js';
import { getProductTermAndPrice } from './catalogue.js';
import { openNewCustomerWizard } from './customer.js';
import { renderOrderActivationWorkflow } from './tracking.js';

export function getActiveStepsForProduct(product) {
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

export function searchCustomerInStepper() {
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

export function unlinkCustomerInStepper() {
  APP_STATE.selectedCustomer = null;
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
  const consent = document.getElementById('billing-new-consent');

  if (bank) bill.newDebit.bankName = bank.value;
  if (branch) bill.newDebit.branchCode = branch.value.trim();
  if (type) bill.newDebit.accountType = type.value;
  if (accNum) bill.newDebit.accountNumber = accNum.value.trim();
  if (consent) bill.newDebit.debiCheckConsent = consent.checked;
}

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
export function renderStepperCoverageCheck(container) {
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

export function renderStepperContractDetails(container, product) {
  if (product.category === 'Exlight broadband plans') {
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

// -----------------------------------------
// STEP 10 REVIEW CHECKLIST
// -----------------------------------------
export function renderStepperReviewChecklist(container) {
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

  document.getElementById('stepper-next-btn').disabled = !submissionAllowed;
}

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

  const p = MOCK_DB.products.find(prod => prod.id === prodId);
  if (p) {
    if (p.category === 'Exlight broadband plans') {
      APP_STATE.cart.gisStatus = "Not checked";
      APP_STATE.cart.gisRef = "";
    } else {
      APP_STATE.cart.gisStatus = "Skip";
    }

    if (p.deviceSKU) {
      APP_STATE.cart.stockChecked = false;
      APP_STATE.cart.stockStatus = "";
    } else {
      APP_STATE.cart.stockChecked = true;
      APP_STATE.cart.stockStatus = "Skip";
    }

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

  // Validate Step 7: Connection details
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
    }
  }

  // Validate Step 8: Consent Check
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

  // Final Step 10: Submission
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
      if (portEl) portEl.style.display = 'block';
      APP_STATE.cart.contractDetails.portInNumber = document.getElementById('mobile-port-number').value;
    } else {
      if (portEl) portEl.style.display = 'none';
      APP_STATE.cart.contractDetails.portInNumber = '';
    }
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
  
  const payBtn = document.getElementById('pay-init-btn');
  if (payBtn) {
    payBtn.disabled = false;
    payBtn.innerHTML = `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> Verify transaction`;
  }
}

export function handlePOSPaymentTrigger() {
  const payBtn = document.getElementById('pay-init-btn');
  if (!payBtn) return;

  const outcomeSelect = document.getElementById('mock-payment-outcome');
  const outcome = outcomeSelect ? outcomeSelect.value : 'Successful';

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
      APP_STATE.cart.posTxnRef = "POS-" + Math.floor(10000000 + Math.random() * 90000000);
      APP_STATE.cart.receiptNo = "REC-" + Math.floor(10000000 + Math.random() * 90000000);
      APP_STATE.cart.paymentStatus = "Successful";

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

      pushNotification(
        "Order Processed Successfully",
        `Order ${newOrder.orderRef} for ${newOrder.customerName} processed and paid.`,
        "order_submitted",
        "Normal"
      );

      showToast("POS payment success. Receipt generated.", "success");
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
  document.getElementById('conf-total').innerText = `R${APP_STATE.cart.product.price + APP_STATE.cart.product.onceOff}`;

  const isSimProduct = APP_STATE.cart.product && (APP_STATE.cart.product.category === 'SIM-only' || APP_STATE.cart.product.category === 'Handset contracts');
  const panel = document.getElementById('confirmation-rica-activation-panel');
  if (isSimProduct && panel) {
    panel.style.display = 'block';
    renderConfirmationRicaActivation();
  } else if (panel) {
    panel.style.display = 'none';
  }

  renderConfirmationContract(APP_STATE.cart.orderRef);
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

      <h5 style="color: var(--telkom-blue-dark); font-weight: 700; border-bottom: 1px solid var(--border-color); padding-bottom: 4px; margin-bottom: 10px; text-transform: uppercase; font-size: 12px; letter-spacing: 0.5px;">1. Contracting Parties</h5>
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

      <h5 style="color: var(--telkom-blue-dark); font-weight: 700; border-bottom: 1px solid var(--border-color); padding-bottom: 4px; margin-bottom: 10px; text-transform: uppercase; font-size: 12px; letter-spacing: 0.5px;">2. Contracted Service & Pricing</h5>
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

      <h5 style="color: var(--telkom-blue-dark); font-weight: 700; border-bottom: 1px solid var(--border-color); padding-bottom: 4px; margin-bottom: 10px; text-transform: uppercase; font-size: 12px; letter-spacing: 0.5px;">3. Debit Order Billing Instructions</h5>
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

// Bind to window for global access (from HTML inline onclick attributes)
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
