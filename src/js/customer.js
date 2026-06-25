import { APP_STATE, MOCK_DB } from './state.js';
import { switchRoute } from './routing.js';
import { renderPaginatedRows, showToast, maskID, maskPassport, openModal, closeModal } from './utils.js';

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

export function handleCustomerSearch(e) {
  e.preventDefault();
  
  if (!APP_STATE.systemHealth.crm) {
    showToast("Amdocs Clarify CRM is currently offline. Cannot retrieve records.", "danger");
    return;
  }

  const queryType = document.getElementById('search-type').value;
  const queryVal = document.getElementById('search-input').value.trim();
  const errorBox = document.getElementById('search-error');
  if (errorBox) errorBox.style.display = 'none';

  if (!queryVal) {
    if (errorBox) {
      errorBox.innerText = "Please enter an ID number, account number, or mobile number.";
      errorBox.style.display = 'block';
    }
    return;
  }

  if (queryType === 'id' && !/^\d{13}$/.test(queryVal)) {
    if (errorBox) {
      errorBox.innerText = "South African ID number must be exactly 13 digits.";
      errorBox.style.display = 'block';
    }
    return;
  }

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
  
  if (found) {
    if (resultsDiv) resultsDiv.style.display = 'block';
    if (resultsTbody) {
      renderPaginatedRows(resultsTbody, [`
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
      `]);
    }
  } else {
    if (resultsDiv) resultsDiv.style.display = 'block';
    if (resultsTbody) {
      renderPaginatedRows(resultsTbody, [], {
        emptyRow: `
        <tr>
          <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 30px;">
            Customer record not found. 
            <br><br>
            <button class="btn btn-sm btn-outline" onclick="openNewCustomerWizard()">Add New Customer</button>
          </td>
        </tr>
        `
      });
    }
  }
}

export function identifyCustomer(identityVal, type) {
  let cust = null;
  if (type === 'id') {
    cust = MOCK_DB.crm.find(c => c.id === identityVal);
  } else {
    cust = MOCK_DB.crm.find(c => c.passport === identityVal);
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

    showToast(`CIM Session created for ${cust.name}`, "success");
    switchRoute('customer-360');
  }
}

export function closeCustomerSession() {
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

  showToast("Customer session terminated successfully.", "neutral");
  switchRoute('customer-search');
}

export function renderCustomer360() {
  const cust = APP_STATE.selectedCustomer;
  if (!cust) return;

  if (!APP_STATE.systemHealth.crm) {
    document.getElementById('crm-data-card').style.display = 'none';
    document.getElementById('crm-error-state').style.display = 'block';
    return;
  } else {
    document.getElementById('crm-data-card').style.display = 'block';
    document.getElementById('crm-error-state').style.display = 'none';
  }

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

  // Onboarding profile details parsing with safe realistic fallbacks for pre-seeded customers
  const personal = cust.personalDetails || {
    idType: cust.id ? 'SA ID' : 'Passport',
    idNum: cust.id || cust.passport || '9304125091087',
    firstName: cust.name.split(' ')[0] || 'Jan',
    lastName: cust.name.split(' ').slice(1).join(' ') || 'du Toit',
    email: cust.email,
    mobile: cust.mobile,
    altContact: '0829876543',
    marketingConsent: true
  };

  const employment = cust.employmentDetails || {
    status: 'Employed',
    type: 'Permanent',
    occupation: 'Corporate Professional',
    employerName: 'Unified Retail Corp',
    employerContact: '0112345678',
    startDate: '2020-03-01'
  };

  const address = cust.addressDetails || {
    line1: cust.address ? cust.address.split(',')[0] : '12 Main Rd',
    street: cust.address ? cust.address.split(',')[0] : 'Main Rd',
    suburb: cust.address && cust.address.split(',')[1] ? cust.address.split(',')[1].trim() : 'Rosebank',
    city: cust.address && cust.address.split(',')[2] ? cust.address.split(',')[2].trim() : 'Johannesburg',
    postalCode: cust.address && cust.address.split(',')[3] ? cust.address.split(',')[3].trim() : '2196'
  };

  const financial = cust.financialDetails || {
    grossIncome: '45000',
    netIncome: '32000',
    expenses: '18000'
  };

  const banking = cust.bankingDetails || {
    bankName: 'FNB',
    branchCode: '250655',
    accountType: 'Cheque',
    accountNumber: '62000001234',
    branchName: 'Johannesburg Corporate',
    debitDate: '25th',
    debiCheckConsent: true,
    creditConsent: true
  };

  const empContent = document.getElementById('c360-employment-content');
  if (empContent) {
    empContent.innerHTML = `
      <div style="margin-bottom: 8px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
        <div>
          <div style="color:var(--text-muted); font-size:10px; font-weight:700;">STATUS</div>
          <div style="font-weight:600; font-size:12px;">${employment.status || 'N/A'}</div>
        </div>
        <div>
          <div style="color:var(--text-muted); font-size:10px; font-weight:700;">TYPE</div>
          <div style="font-weight:600; font-size:12px;">${employment.type || 'N/A'}</div>
        </div>
      </div>
      <div style="margin-bottom: 8px;">
        <div style="color:var(--text-muted); font-size:10px; font-weight:700;">OCCUPATION</div>
        <div style="font-weight:600; font-size:12px;">${employment.occupation || 'N/A'}</div>
      </div>
      <div style="margin-bottom: 8px;">
        <div style="color:var(--text-muted); font-size:10px; font-weight:700;">EMPLOYER</div>
        <div style="font-weight:600; font-size:12px;">${employment.employerName || 'N/A'} (${employment.employerContact || 'N/A'})</div>
      </div>
      <div style="margin-bottom: 8px;">
        <div style="color:var(--text-muted); font-size:10px; font-weight:700;">START DATE</div>
        <div style="font-weight:600; font-size:12px;">${employment.startDate || 'N/A'}</div>
      </div>
    `;
  }

  const finContent = document.getElementById('c360-financial-content');
  if (finContent) {
    finContent.innerHTML = `
      <div style="margin-bottom: 8px;">
        <div style="color:var(--text-muted); font-size:10px; font-weight:700;">GROSS MONTHLY INCOME</div>
        <div style="font-weight:600; font-size:13px; color: var(--text-primary);">R${financial.grossIncome ? parseFloat(financial.grossIncome).toLocaleString() : '0'}</div>
      </div>
      <div style="margin-bottom: 8px;">
        <div style="color:var(--text-muted); font-size:10px; font-weight:700;">NET MONTHLY INCOME</div>
        <div style="font-weight:600; font-size:13px; color: var(--text-primary);">R${financial.netIncome ? parseFloat(financial.netIncome).toLocaleString() : '0'}</div>
      </div>
      <div style="margin-bottom: 8px;">
        <div style="color:var(--text-muted); font-size:10px; font-weight:700;">MONTHLY EXPENSES</div>
        <div style="font-weight:600; font-size:13px; color: var(--text-primary);">R${financial.expenses ? parseFloat(financial.expenses).toLocaleString() : '0'}</div>
      </div>
    `;
  }

  const bankContent = document.getElementById('c360-banking-content');
  if (bankContent) {
    bankContent.innerHTML = `
      <div style="margin-bottom: 8px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
        <div>
          <div style="color:var(--text-muted); font-size:10px; font-weight:700;">BANK</div>
          <div style="font-weight:600; font-size:12px;">${banking.bankName || 'N/A'}</div>
        </div>
        <div>
          <div style="color:var(--text-muted); font-size:10px; font-weight:700;">TYPE</div>
          <div style="font-weight:600; font-size:12px;">${banking.accountType || 'N/A'}</div>
        </div>
      </div>
      <div style="margin-bottom: 8px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
        <div>
          <div style="color:var(--text-muted); font-size:10px; font-weight:700;">ACCOUNT NUMBER</div>
          <div style="font-weight:600; font-size:12px; font-family: monospace;">${banking.accountNumber ? '••••' + banking.accountNumber.slice(-4) : 'N/A'}</div>
        </div>
        <div>
          <div style="color:var(--text-muted); font-size:10px; font-weight:700;">DEBIT DATE</div>
          <div style="font-weight:600; font-size:12px;">${banking.debitDate || 'N/A'}</div>
        </div>
      </div>
      <div style="margin-bottom: 8px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
        <div>
          <div style="color:var(--text-muted); font-size:10px; font-weight:700;">DEBICHECK</div>
          <div style="margin-top: 2px;">
            <span class="badge badge-success" style="font-size: 10px; padding: 2px 6px;">
              Authorized
            </span>
          </div>
        </div>
        <div>
          <div style="color:var(--text-muted); font-size:10px; font-weight:700;">CREDIT CONSENT</div>
          <div style="margin-top: 2px;">
            <span class="badge ${banking.creditConsent ? 'badge-success' : 'badge-danger'}" style="font-size: 10px; padding: 2px 6px;">
              ${banking.creditConsent ? 'Consent Given' : 'Consent Refused'}
            </span>
          </div>
        </div>
      </div>
      <div style="margin-bottom: 8px;">
        <div style="color:var(--text-muted); font-size:10px; font-weight:700;">Account holder verification (AHV) status</div>
        <div style="margin-top: 2px;">
          <span class="badge ${banking.accountVerificationStatus === 'Verified' ? 'badge-success' : 'badge-neutral'}" style="font-size: 10px; padding: 2px 6px;">
            ${banking.accountVerificationStatus || 'Not Run'}
          </span>
        </div>
      </div>
    `;
  }

  const prodContainer = document.getElementById('c360-active-products');
  if (prodContainer) {
    prodContainer.innerHTML = '';
    cust.activeProducts.forEach(p => {
      // Find actual matching product in catalogue by name or fallback
      const catalogProd = APP_STATE.products.find(cp => cp.name.toLowerCase() === p.name.toLowerCase()) || p;
      const displayName = catalogProd ? catalogProd.name : p.name;
      prodContainer.innerHTML += `
        <div style="padding: 12px; border: 1px solid var(--border-color); border-radius: var(--radius-md); margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-weight: 700; color: var(--telkom-blue-dark);">${displayName}</div>
            <div style="font-size: 11px; color: var(--text-secondary);">Expires: ${p.expiry}</div>
          </div>
          <div style="font-weight: 700; color: var(--telkom-blue);">R${p.cost} pm</div>
        </div>
      `;
    });
  }

  const warningsBox = document.getElementById('c360-eligibility');
  if (warningsBox) {
    warningsBox.innerHTML = '';
    if (cust.status === 'Suspended') {
      warningsBox.innerHTML = `
        <div style="background-color: var(--danger-light); border-left: 4px solid var(--danger); padding: 14px; border-radius: var(--radius-md); color: var(--danger); font-size: 13px; font-weight: 600; margin-bottom: 20px;">
          WARNING: This customer account is suspended. Order captures are restricted until outstanding payments are cleared.
        </div>
      `;
      document.getElementById('c360-start-order-btn').disabled = true;
    } else {
      document.getElementById('c360-start-order-btn').disabled = false;
    }
  }

  const logsBody = document.getElementById('c360-interactions-list');
  if (logsBody) {
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

  renderCustomer360Documents();

  const custDraftsPanel = document.getElementById('c360-drafts-panel');
  const custDraftsContent = document.getElementById('c360-drafts-content');
  if (custDraftsPanel && custDraftsContent) {
    const custDrafts = APP_STATE.draftOrders.filter(d => d.customer && d.customer.accountNumber === cust.accountNumber);
    if (custDrafts.length > 0) {
      custDraftsPanel.style.display = 'block';
      custDraftsContent.innerHTML = custDrafts.map(d => {
        const prodName = d.cart && d.cart.product ? d.cart.product.name : 'No Product';
        const getActiveStepsForProduct = window.getActiveStepsForProduct;
        let stepLabel = `Step ${d.currentStep}`;
        if (getActiveStepsForProduct) {
          const steps = getActiveStepsForProduct(d.cart.product);
          const stepIndex = steps.findIndex(s => s.id === d.currentStep);
          stepLabel = stepIndex > -1 ? `Step ${stepIndex + 1}: ${steps[stepIndex].label}` : `Step ${d.currentStep}`;
        }
        
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

  const pendingOrdersPanel = document.getElementById('c360-pending-orders-panel');
  const pendingOrdersContent = document.getElementById('c360-pending-orders-content');
  if (pendingOrdersPanel && pendingOrdersContent) {
    const customerPendingOrders = (APP_STATE.ordersList || []).filter(o => {
      if (o.accountNo !== cust.accountNumber) return false;
      if (o.status === 'Cancelled') return false;
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

export function openNewCustomerWizard() {
  APP_STATE.isEditingCustomer = false;
  APP_STATE.customerCreateStep = 1;
  APP_STATE.employmentAccordionOpen = false;
  APP_STATE.accountNumberVisible = false;
  
  APP_STATE.newCustomerData = {
    personal: { idNum: "", idType: "SA ID", firstName: "", lastName: "", email: "", mobile: "", altContact: "", marketingConsent: false },
    employment: { status: "", type: "", occupation: "", employerName: "", employerContact: "", startDate: "" },
    address: { line1: "", employerAddr: "" },
    financial: { grossIncome: "", netIncome: "", expenses: "" },
    banking: { bankName: "", branchCode: "", accountType: "", accountNumber: "", branchName: "", debitDate: "1st", debiCheckConsent: true, creditConsent: false }
  };

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

export function handleCustStepperClick(stepNum) {
  if (APP_STATE.isEditingCustomer) {
    if (stepNum > 2) return;
    saveCustomerCreateInputs();
    renderCustomerCreateStep(stepNum);
  }
}
window.handleCustStepperClick = handleCustStepperClick;
export function renderCustomerCreateStep(step) {
  APP_STATE.customerCreateStep = step;

  const viewContainer = document.getElementById('view-customer-create');
  if (viewContainer) {
    const h2 = viewContainer.querySelector('h2');
    const desc = viewContainer.querySelector('.screen-title-desc');
    if (h2 && desc) {
      if (APP_STATE.isEditingCustomer) {
        h2.innerText = "Edit Customer Profile";
        desc.innerText = "Review, update, and finalize the customer profile parameters in Clarify CRM.";
      } else {
        h2.innerText = "Create New Customer Profile";
        desc.innerText = "Register new consumer accounts in Amdocs Clarify CRM and configure billing parameters.";
      }
    }
  }
  
  document.querySelectorAll('#cust-create-stepper .stepper-step').forEach((el, index) => {
    const sNum = index + 1;
    if (APP_STATE.isEditingCustomer && sNum > 2) {
      el.style.display = 'none';
    } else {
      el.style.display = '';
    }

    el.className = 'stepper-step';
    if (sNum < step) {
      el.classList.add('completed');
    } else if (sNum === step) {
      el.classList.add('active');
    }

    if (APP_STATE.isEditingCustomer && sNum === 2) {
      el.classList.add('hide-line');
    } else {
      el.classList.remove('hide-line');
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

  const backBtn = document.getElementById('cust-back-btn');
  const nextBtn = document.getElementById('cust-next-btn');

  if (backBtn) backBtn.style.visibility = 'visible';
  if (nextBtn) {
    if (APP_STATE.isEditingCustomer && step === 2) {
      nextBtn.innerText = 'Update Profile';
    } else if (step === 4) {
      nextBtn.innerText = APP_STATE.isEditingCustomer ? 'Update Profile' : 'Create Profile & Proceed';
    } else {
      nextBtn.innerText = 'Continue';
    }
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

        <div class="form-row" style="margin-top: 16px;">
          <div class="form-group">
            <label class="form-label">Alternative Contact Number (Optional)</label>
            <input type="text" id="new-cust-altcontact" class="form-control" placeholder="e.g. 0111234567" value="${personal.altContact || ''}" oninput="saveCustomerCreateInputs()">
          </div>
          <div class="form-group">
            <label class="form-label">Physical Address <span class="required">*</span></label>
            <input type="text" id="new-cust-addr-personal" class="form-control" placeholder="Enter complete physical address..." value="${address.line1 || ''}" oninput="saveCustomerCreateInputs()">
          </div>
        </div>

        <label class="checkbox-group" style="margin-top: 20px;">
          <input type="checkbox" id="new-cust-marketing" ${personal.marketingConsent ? 'checked' : ''} onchange="saveCustomerCreateInputs()">
          <span class="checkbox-label" style="font-weight: 500;">Authorize marketing communications via SMS and Email.</span>
        </label>
      `;
      break;

    case 2:
      stepContainer.innerHTML = `
        <h3 style="margin-bottom: 16px;">Step 2: Employment, Employer Address & Income Details</h3>
        <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 20px;">Provide employment details, employer address, and monthly financial streams.</p>
        
        <div style="margin-bottom: 24px; border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 16px 20px; background-color: var(--bg-light);">
          <h4 style="margin-bottom: 16px; color: var(--telkom-blue-dark); font-weight: 700; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px;">Employment Details</h4>
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

        <div class="form-group" style="position: relative; margin-top: 16px;">
          <label class="form-label">Employer Address <span class="required">*</span></label>
          <input type="text" id="new-cust-addr-employer" class="form-control" placeholder="Type or enter complete employer address..." value="${address.employerAddr || ''}" oninput="handleEmployerAddressInput(this)">
          <div id="addr-autocomplete-menu" class="searchable-dropdown-menu" style="width: 100%;"></div>
        </div>

        <div style="margin-top: 24px;">
          <h4 style="margin-bottom: 16px;">Income & Expenses</h4>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Gross Monthly Income <span class="required">*</span></label>
              <input type="text" id="new-cust-gross" class="form-control" placeholder="e.g. 25000" value="${financial.grossIncome ? formatCurrencySimple(financial.grossIncome) : ''}" oninput="handleFinancialInput(this, 'grossIncome')" onblur="handleFinancialBlur(this, 'grossIncome')" onfocus="handleFinancialFocus(this, 'grossIncome')">
            </div>
            <div class="form-group">
              <label class="form-label">Net Monthly Income <span class="required">*</span></label>
              <input type="text" id="new-cust-net" class="form-control" placeholder="e.g. 18000" value="${financial.netIncome ? formatCurrencySimple(financial.netIncome) : ''}" oninput="handleFinancialInput(this, 'netIncome')" onblur="handleFinancialBlur(this, 'netIncome')" onfocus="handleFinancialFocus(this, 'netIncome')">
            </div>
          </div>

          <div class="form-group" style="margin-top: 16px;">
            <label class="form-label">Typical Monthly Expenses <span class="required">*</span></label>
            <input type="text" id="new-cust-expenses" class="form-control" placeholder="e.g. 12000" value="${financial.expenses ? formatCurrencySimple(financial.expenses) : ''}" oninput="handleFinancialInput(this, 'expenses')" onblur="handleFinancialBlur(this, 'expenses')" onfocus="handleFinancialFocus(this, 'expenses')">
          </div>
        </div>
      `;
      break;

    case 3:
      stepContainer.innerHTML = `
        <h3 style="margin-bottom: 16px;">Step 3: Capture Postpaid Settlement Banking Details</h3>
        <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 24px;">Set up monthly payment deductions. DebiCheck authorization is required.</p>
        
        <div class="form-row">
          <div class="form-group searchable-dropdown-container">
            <label class="form-label">Settlement Bank Name <span class="required">*</span></label>
            <input type="text" id="new-cust-bankname" class="form-control searchable-dropdown-input" placeholder="Select bank name..." value="${banking.bankName || ''}" ${APP_STATE.isEditingCustomer ? 'disabled' : 'onclick="toggleBankMenu(event)"'} readonly>
            <div id="bank-dropdown-menu" class="searchable-dropdown-menu">
              <div class="searchable-dropdown-search-box">
                <input type="text" class="form-control" placeholder="Filter banks..." oninput="filterBankOptions(this)" onclick="event.stopPropagation()">
              </div>
              <div id="bank-dropdown-options-list"></div>
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">Branch Code <span class="required">*</span></label>
            <input type="text" id="new-cust-branchcode" class="form-control" placeholder="e.g. 632005" value="${banking.branchCode || ''}" oninput="handleBranchCodeInput(this)" ${APP_STATE.isEditingCustomer ? 'disabled' : ''}>
          </div>
        </div>

        <div class="form-row" style="margin-top: 16px;">
          <div class="form-group">
            <label class="form-label">Account Type <span class="required">*</span></label>
            <select id="new-cust-acctype" class="form-control" onchange="saveCustomerCreateInputs()" ${APP_STATE.isEditingCustomer ? 'disabled' : ''}>
              <option value="">-- Select Type --</option>
              <option value="Cheque" ${banking.accountType === 'Cheque' ? 'selected' : ''}>Cheque / Current Account</option>
              <option value="Savings" ${banking.accountType === 'Savings' ? 'selected' : ''}>Savings Account</option>
              <option value="Transmission" ${banking.accountType === 'Transmission' ? 'selected' : ''}>Transmission Account</option>
            </select>
          </div>
          
          <div class="form-group">
            <label class="form-label">Account Number <span class="required">*</span></label>
            <div class="secure-input-container">
              <input type="${APP_STATE.accountNumberVisible ? 'text' : 'password'}" id="new-cust-accnum" class="form-control" placeholder="Enter bank account..." value="${banking.accountNumber || ''}" oninput="handleAccountNumberInput(this)" ${APP_STATE.isEditingCustomer ? 'disabled' : ''}>
              <button type="button" class="secure-toggle-btn" ${APP_STATE.isEditingCustomer ? 'disabled' : 'onclick="toggleAccountNumberVisibility()"'} style="${APP_STATE.isEditingCustomer ? 'cursor: not-allowed; opacity: 0.6;' : ''}">
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
            <input type="text" id="new-cust-branchname" class="form-control ${banking.branchName ? 'auto-populated-field' : ''}" placeholder="Branch name..." value="${banking.branchName || ''}" oninput="saveCustomerCreateInputs()" ${APP_STATE.isEditingCustomer ? 'disabled' : ''}>
          </div>
          <div class="form-group">
            <label class="form-label">Preferred Debit Order Date <span class="required">*</span></label>
            <select id="new-cust-debitdate" class="form-control" onchange="saveCustomerCreateInputs()" ${APP_STATE.isEditingCustomer ? 'disabled' : ''}>
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
            <input type="checkbox" id="new-cust-debicheck" ${banking.debiCheckConsent ? 'checked' : ''} onchange="saveCustomerCreateInputs()" style="margin-top: 3px;" ${APP_STATE.isEditingCustomer ? 'disabled' : ''}>
            <span class="checkbox-label"><strong>Debit Collection Authorization (Required):</strong> I authorize Telkom and/or its approved debt collection partners to use DEBICHECK for the collection of any outstanding amounts from my account.</span>
          </label>
        </div>

        <div style="margin-top: 20px; padding: 16px; border: 1px solid var(--border-color); border-radius: var(--radius-md); background-color: var(--bg-light);">
          <div style="font-weight: 700; font-size: 12px; color: var(--telkom-blue-dark); margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px;">Banking Validations</div>
          <div style="display: flex; gap: 24px; margin-bottom: 14px; font-size: 13px;">
            <div>
              <span style="color: var(--text-secondary); font-weight: 600; margin-right: 6px;">Account Verification (AHV):</span>
              <span class="badge ${banking.accountVerificationStatus === 'Verified' ? 'badge-success' : 'badge-neutral'}">${banking.accountVerificationStatus || 'Not run'}</span>
            </div>
          </div>
          <div style="display: flex; gap: 10px;">
            ${banking.accountVerificationStatus === 'Verified' ? 
              `<span style="color: var(--success); font-weight: 600; font-size: 13px;">✓ Account Holder Verification Successful (Verified & Matched)</span>` : 
              `<button type="button" class="btn btn-sm btn-outline" onclick="runCustomerAccountVerification()" style="font-size: 11px; padding: 6px 12px;">Run Account Holder Verification</button>`
            }
          </div>
        </div>
      `;
      break;

    case 4:
      stepContainer.innerHTML = `
        <h3 style="margin-bottom: 16px;">Step 4: ${APP_STATE.isEditingCustomer ? 'Review & Finalize Customer Profile Updates' : 'Review & Finalize Customer Registration'}</h3>
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
              <div><strong>Physical Address:</strong> ${address.line1 || 'Not declared'}</div>
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
              <div><strong>Employer Address:</strong> ${address.employerAddr || 'Not declared'}</div>
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
                <div style="margin-top: 8px;">
                  <span style="color: var(--text-secondary); font-weight: 600; margin-right: 6px;">Account Verification (AHV):</span>
                  <span class="badge ${banking.accountVerificationStatus === 'Verified' ? 'badge-success' : 'badge-neutral'}">${banking.accountVerificationStatus || 'Not run'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
      break;
  }
}

export function saveCustomerCreateInputs() {
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
    
    const personalAddrEl = document.getElementById('new-cust-addr-personal');
    if (personalAddrEl) address.line1 = personalAddrEl.value.trim();
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

    const empAddrEl = document.getElementById('new-cust-addr-employer');
    if (empAddrEl) address.employerAddr = empAddrEl.value.trim();

    const grossEl = document.getElementById('new-cust-gross');
    const netEl = document.getElementById('new-cust-net');
    const expEl = document.getElementById('new-cust-expenses');
    if (grossEl) APP_STATE.newCustomerData.financial.grossIncome = grossEl.value.replace(/[^0-9]/g, '');
    if (netEl) APP_STATE.newCustomerData.financial.netIncome = netEl.value.replace(/[^0-9]/g, '');
    if (expEl) APP_STATE.newCustomerData.financial.expenses = expEl.value.replace(/[^0-9]/g, '');
  } else if (step === 3) {
    if (!APP_STATE.isEditingCustomer) {
      const bankEl = document.getElementById('new-cust-bankname');
      const typeEl = document.getElementById('new-cust-acctype');
      const debitEl = document.getElementById('new-cust-debitdate');
      const debiCheckEl = document.getElementById('new-cust-debicheck');
      const branchNameEl = document.getElementById('new-cust-branchname');
      const branchCodeEl = document.getElementById('new-cust-branchcode');
      const accNumEl = document.getElementById('new-cust-accnum');

      if (bankEl) banking.bankName = bankEl.value;
      if (branchCodeEl) banking.branchCode = branchCodeEl.value.trim();
      if (typeEl) banking.accountType = typeEl.value;
      if (accNumEl) banking.accountNumber = accNumEl.value.trim();
      if (debitEl) banking.debitDate = debitEl.value;
      if (debiCheckEl) banking.debiCheckConsent = debiCheckEl.checked;
      if (branchNameEl) banking.branchName = branchNameEl.value.trim();
    }
  }
}

export function toggleEmploymentAccordion() {
  const acc = document.getElementById('employment-accordion');
  if (acc) {
    APP_STATE.employmentAccordionOpen = !APP_STATE.employmentAccordionOpen;
    acc.classList.toggle('open', APP_STATE.employmentAccordionOpen);
  }
}

export function handleEmployerAddressInput(el) {
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

export function selectEmployerAddressSuggestion(index) {
  const addr = MOCK_EMPLOYER_ADDRESSES[index];
  if (addr) {
    const formatted = `${addr.line1}, ${addr.suburb}, ${addr.city}, ${addr.postalCode}`;
    APP_STATE.newCustomerData.address.employerAddr = formatted;
    
    renderCustomerCreateStep(2);
    showToast("Employer address auto-completed.", "success");
  }

  const menu = document.getElementById('addr-autocomplete-menu');
  if (menu) menu.style.display = 'none';
}

export function formatCurrencySimple(val) {
  if (!val) return "";
  const clean = val.toString().replace(/[^0-9]/g, '');
  if (!clean) return "";
  return "R " + parseInt(clean).toLocaleString('en-ZA');
}

export function handleFinancialInput(el, field) {
  const val = el.value.replace(/[^0-9]/g, '');
  APP_STATE.newCustomerData.financial[field] = val;
}

export function handleFinancialBlur(el, field) {
  const val = APP_STATE.newCustomerData.financial[field];
  if (val) {
    el.value = formatCurrencySimple(val);
  }
}

export function handleFinancialFocus(el, field) {
  const val = APP_STATE.newCustomerData.financial[field];
  if (val) {
    el.value = val;
  }
}

export function toggleBankMenu(e) {
  e.stopPropagation();
  const menu = document.getElementById('bank-dropdown-menu');
  if (!menu) return;
  menu.classList.toggle('show');
  filterBankOptions(null);
}

export function filterBankOptions(searchEl) {
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

export function selectBankOption(bank) {
  APP_STATE.newCustomerData.banking.bankName = bank;
  const input = document.getElementById('new-cust-bankname');
  if (input) input.value = bank;

  const menu = document.getElementById('bank-dropdown-menu');
  if (menu) menu.classList.remove('show');
  
  const branchEl = document.getElementById('new-cust-branchcode');
  if (branchEl) handleBranchCodeInput(branchEl);
}

export function handleBranchCodeInput(el) {
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

export function handleAccountNumberInput(el) {
  const code = el.value.replace(/[^0-9]/g, '');
  el.value = code;
  APP_STATE.newCustomerData.banking.accountNumber = code;
}

export function toggleAccountNumberVisibility() {
  APP_STATE.accountNumberVisible = !APP_STATE.accountNumberVisible;
  renderCustomerCreateStep(3);
}

export function maskAccountNumber(accNum) {
  if (!accNum) return "";
  if (accNum.length < 5) return accNum;
  return "••••••" + accNum.slice(-4);
}

export function handleCustomerCreateBack() {
  if (APP_STATE.customerCreateStep > 1) {
    saveCustomerCreateInputs();
    renderCustomerCreateStep(APP_STATE.customerCreateStep - 1);
  } else {
    if (APP_STATE.isEditingCustomer) {
      APP_STATE.isEditingCustomer = false;
      switchRoute('customer-360');
    } else if (APP_STATE.openedCustomerWizardFromStepper) {
      APP_STATE.openedCustomerWizardFromStepper = false;
      APP_STATE.currentStep = 2;
      switchRoute('order-stepper');
    } else {
      switchRoute('customer-search');
    }
  }
}

export function handleCustomerCreateNext() {
  saveCustomerCreateInputs();
  const step = APP_STATE.customerCreateStep;
  const personal = APP_STATE.newCustomerData.personal;
  const address = APP_STATE.newCustomerData.address;
  const financial = APP_STATE.newCustomerData.financial;
  const banking = APP_STATE.newCustomerData.banking;

  if (step === 1) {
    if (!personal.idNum || !personal.firstName || !personal.lastName || !personal.email || !personal.mobile || !address.line1) {
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

    const exists = MOCK_DB.crm.some(c => {
      if (APP_STATE.isEditingCustomer && APP_STATE.selectedCustomer && c.accountNumber === APP_STATE.selectedCustomer.accountNumber) {
        return false;
      }
      return (c.id === personal.idNum || (c.passport && c.passport === personal.idNum));
    });
    if (exists) {
      showToast(`Conflict: Customer with ID/Passport ${personal.idNum} already exists in CRM database.`, "danger");
      return;
    }
  }

  if (step === 2) {
    if (!address.employerAddr) {
      showToast("Please enter the complete Employer Address (*)", "warning");
      return;
    }
    if (!financial.grossIncome || !financial.netIncome || !financial.expenses) {
      showToast("Please fill in Gross Income, Net Income, and Expenses (*)", "warning");
      return;
    }
    if (APP_STATE.isEditingCustomer) {
      submitNewCustomerProfile();
      return;
    }
  }

  if (step === 3) {
    if (!APP_STATE.isEditingCustomer) {
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

      if (!banking.debiCheckConsent) {
        showToast("Debit DebiCheck Debit Collection consent must be checked to register account.", "warning");
        return;
      }
    }
  }

  if (step === 4) {
    submitNewCustomerProfile();
    return;
  }

  renderCustomerCreateStep(step + 1);
}

export function submitNewCustomerProfile() {
  const personal = APP_STATE.newCustomerData.personal;
  const employment = APP_STATE.newCustomerData.employment;
  const address = APP_STATE.newCustomerData.address;
  const financial = APP_STATE.newCustomerData.financial;
  const banking = APP_STATE.newCustomerData.banking;
  const formattedAddress = address.line1 || "12 Main Rd, Rosebank, Johannesburg, 2196";

  let targetCust;

  if (APP_STATE.isEditingCustomer) {
    targetCust = APP_STATE.selectedCustomer;
    if (targetCust) {
      targetCust.id = personal.idType === 'SA ID' ? personal.idNum : "";
      targetCust.passport = personal.idType === 'Passport' ? personal.idNum : "";
      targetCust.name = `${personal.firstName} ${personal.lastName}`;
      targetCust.mobile = personal.mobile;
      targetCust.email = personal.email;
      targetCust.address = formattedAddress;
      targetCust.billingAddress = formattedAddress;
      
      targetCust.personalDetails = { ...personal };
      targetCust.employmentDetails = { ...employment };
      targetCust.addressDetails = { ...address };
      targetCust.financialDetails = { ...financial };
      targetCust.bankingDetails = { ...banking };

      // Update reference inside MOCK_DB.crm
      const idx = MOCK_DB.crm.findIndex(c => c.accountNumber === targetCust.accountNumber);
      if (idx !== -1) {
        MOCK_DB.crm[idx] = targetCust;
      }
    }
    showToast("CRM Customer profile updated successfully.", "success");
    returnToCustomer360FromEdit();
  } else {
    targetCust = {
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
      activeProducts: [
        { name: "Infinite Pay-Month SIM Only", type: "SIM-only", cost: 199, expiry: "2027-06-30" },
        { name: "iPhone 15 Pro Max Contract", type: "Handset contracts", cost: 999, expiry: "2026-12-01" }
      ],
      interactions: [],
      
      personalDetails: { ...personal },
      employmentDetails: { ...employment },
      addressDetails: { ...address },
      financialDetails: { ...financial },
      bankingDetails: { ...banking }
    };
    targetCust.documents = {};
    MOCK_DB.crm.push(targetCust);
    
    APP_STATE.selectedCustomer = targetCust;
    APP_STATE.isCustomerIdentifiedInJourney = true;
    APP_STATE.activeCIMInteraction = {
      type: "New Order",
      channel: "Retail store",
      storeId: APP_STATE.currentUser.branch,
      agentId: APP_STATE.currentUser.id,
      timestamp: new Date().toISOString(),
      notes: ""
    };
    APP_STATE.openedCustomerWizardFromStepper = false;
    showToast("CRM Customer profile created successfully.", "success");
    switchRoute('customer-360');
  }
}

export function returnToCustomer360FromEdit() {
  APP_STATE.isEditingCustomer = false;
  
  const backBtn = document.getElementById('cust-back-btn');
  const nextBtn = document.getElementById('cust-next-btn');
  if (backBtn) backBtn.style.visibility = 'visible';
  if (nextBtn) nextBtn.style.display = 'block';

  switchRoute('customer-360');
}
window.returnToCustomer360FromEdit = returnToCustomer360FromEdit;

export function startOrderCaptureForCustomer() {
  APP_STATE.isCustomerIdentifiedInJourney = true;
  switchRoute('catalogue');
}
window.startOrderCaptureForCustomer = startOrderCaptureForCustomer;

export function proceedToCatalogueForCustomer(idVal, type) {
  identifyCustomer(idVal, type);
  APP_STATE.isCustomerIdentifiedInJourney = true;
  switchRoute('catalogue');
}

export function renderCustomer360Documents() {
  const cust = APP_STATE.selectedCustomer;
  if (!cust) return;

  if (!cust.documents || Array.isArray(cust.documents)) {
    cust.documents = {};
  }

  const docTypes = [
    { key: "idDoc", label: "Identity Document" },
    { key: "bankStatements", label: "Last 3 Months Bank Statements" },
    { key: "proofAddress", label: "Proof of Address" }
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

export function triggerBrowseCustomerDoc(key) {
  const input = document.getElementById(`c360-file-input-${key}`);
  if (input) {
    input.click();
  }
}

export function handleCustomerDocSelected(e, key) {
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

export function simulateCustomerDocUpload(docType, fileName) {
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

export function removeCustomerProfileDoc(key) {
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

// Bind to window for inline HTML onclick handlers
window.handleCustomerSearch = handleCustomerSearch;
window.identifyCustomer = identifyCustomer;
window.closeCustomerSession = closeCustomerSession;
window.renderCustomer360 = renderCustomer360;
window.openNewCustomerWizard = openNewCustomerWizard;
window.renderCustomerCreateStep = renderCustomerCreateStep;
window.saveCustomerCreateInputs = saveCustomerCreateInputs;
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
window.handleCustomerCreateBack = handleCustomerCreateBack;
window.handleCustomerCreateNext = handleCustomerCreateNext;
window.triggerBrowseCustomerDoc = triggerBrowseCustomerDoc;
window.handleCustomerDocSelected = handleCustomerDocSelected;
window.removeCustomerProfileDoc = removeCustomerProfileDoc;
window.proceedToCatalogueForCustomer = proceedToCatalogueForCustomer;

// CRM customer update/save actions
export function openCreateCustomerModal() {
  openModal('customer-create-modal');
}
window.openCreateCustomerModal = openCreateCustomerModal;

export function handleCreateCustomerSubmit(e) {
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
    activeProducts: [
      { name: "Infinite Pay-Month SIM Only", type: "SIM-only", cost: 199, expiry: "2027-06-30" },
      { name: "iPhone 15 Pro Max Contract", type: "Handset contracts", cost: 999, expiry: "2026-12-01" }
    ],
    interactions: []
  };

  MOCK_DB.crm.push(newCust);
  
  closeModal('customer-create-modal');
  showToast(`Profile created in Clarify CRM for ${name}.`, "success");

  // Automatically select this new customer
  identifyCustomer(newCust.id, 'id');
}
window.handleCreateCustomerSubmit = handleCreateCustomerSubmit;

// Edit existing customer profile using the onboarding stepper
export function openEditCustomerModal() {
  const cust = APP_STATE.selectedCustomer;
  if (!cust) return;

  APP_STATE.isEditingCustomer = true;
  APP_STATE.customerCreateStep = 1;
  APP_STATE.employmentAccordionOpen = false;
  APP_STATE.accountNumberVisible = false;

  // Extract customer data with fallbacks (same logic as Customer 360 view)
  const personal = cust.personalDetails || {
    idType: cust.id ? 'SA ID' : 'Passport',
    idNum: cust.id || cust.passport || '9304125091087',
    firstName: cust.name.split(' ')[0] || 'Jan',
    lastName: cust.name.split(' ').slice(1).join(' ') || 'du Toit',
    email: cust.email,
    mobile: cust.mobile,
    altContact: '0829876543',
    marketingConsent: true
  };

  const employment = cust.employmentDetails || {
    status: 'Employed',
    type: 'Permanent',
    occupation: 'Corporate Professional',
    employerName: 'Unified Retail Corp',
    employerContact: '0112345678',
    startDate: '2020-03-01'
  };

  const address = {
    line1: cust.address || (cust.addressDetails ? cust.addressDetails.line1 : '') || '12 Main Rd, Rosebank, Johannesburg, 2196',
    employerAddr: (cust.addressDetails && cust.addressDetails.employerAddr) || '15 Alice Lane, Sandton, Johannesburg, 2196'
  };

  const financial = cust.financialDetails || {
    grossIncome: '45000',
    netIncome: '32000',
    expenses: '18000'
  };

  const banking = cust.bankingDetails || {
    bankName: 'FNB',
    branchCode: '250655',
    accountType: 'Cheque',
    accountNumber: '62000001234',
    branchName: 'Johannesburg Corporate',
    debitDate: '25th',
    debiCheckConsent: true,
    creditConsent: true
  };

  // Populate newCustomerData with deep copy
  APP_STATE.newCustomerData = {
    personal: { ...personal },
    employment: { ...employment },
    address: { ...address },
    financial: { ...financial },
    banking: { ...banking }
  };

  // Switch view to customer-create
  switchRoute('customer-create');
}
window.openEditCustomerModal = openEditCustomerModal;

export function handleEditCustomerSubmit(e) {
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
window.handleEditCustomerSubmit = handleEditCustomerSubmit;

export function runCustomerCreditVetting() {
  showToast("Initiating Credit Vetting with Credit Bureau...", "info");
  setTimeout(() => {
    if (!APP_STATE.newCustomerData.banking) {
      APP_STATE.newCustomerData.banking = {};
    }
    APP_STATE.newCustomerData.banking.creditVettingStatus = "Approved";
    
    if (APP_STATE.selectedCustomer) {
      if (!APP_STATE.selectedCustomer.bankingDetails) {
        APP_STATE.selectedCustomer.bankingDetails = {};
      }
      APP_STATE.selectedCustomer.bankingDetails.creditVettingStatus = "Approved";
      
      const idx = MOCK_DB.crm.findIndex(c => c.accountNumber === APP_STATE.selectedCustomer.accountNumber);
      if (idx !== -1) {
        MOCK_DB.crm[idx] = APP_STATE.selectedCustomer;
      }
    }
    showToast("Credit Vetting completed successfully: Approved (Score: 710)", "success");
    
    if (APP_STATE.activeRoute === 'customer-360') {
      renderCustomer360();
    } else if (APP_STATE.activeRoute === 'customer-create') {
      renderCustomerCreateStep(3);
    }
  }, 500);
}
window.runCustomerCreditVetting = runCustomerCreditVetting;

export function runCustomerAccountVerification() {
  if (APP_STATE.activeRoute === 'customer-create') {
    saveCustomerCreateInputs();
  }

  const banking = APP_STATE.newCustomerData.banking || {};
  if (!banking.bankName || !banking.branchCode || !banking.accountNumber) {
    showToast("Please capture Bank Name, Branch Code, and Account Number before running verification.", "warning");
    return;
  }

  if (!/^\d{7,16}$/.test(banking.accountNumber)) {
    showToast("Account number must be numeric and between 7 and 16 digits.", "danger");
    return;
  }

  showToast("Initiating Account Holder Verification with settlement bank...", "info");
  setTimeout(() => {
    if (!APP_STATE.newCustomerData.banking) {
      APP_STATE.newCustomerData.banking = {};
    }
    APP_STATE.newCustomerData.banking.accountVerificationStatus = "Verified";
    
    if (APP_STATE.isEditingCustomer && APP_STATE.selectedCustomer) {
      if (!APP_STATE.selectedCustomer.bankingDetails) {
        APP_STATE.selectedCustomer.bankingDetails = {};
      }
      APP_STATE.selectedCustomer.bankingDetails.accountVerificationStatus = "Verified";
      
      const idx = MOCK_DB.crm.findIndex(c => c.accountNumber === APP_STATE.selectedCustomer.accountNumber);
      if (idx !== -1) {
        MOCK_DB.crm[idx] = APP_STATE.selectedCustomer;
      }
    }
    showToast("Account Holder Verification successful: Verified & Matched", "success");
    
    if (APP_STATE.activeRoute === 'customer-360') {
      renderCustomer360();
    } else if (APP_STATE.activeRoute === 'customer-create') {
      renderCustomerCreateStep(3);
    }
  }, 500);
}
window.runCustomerAccountVerification = runCustomerAccountVerification;
