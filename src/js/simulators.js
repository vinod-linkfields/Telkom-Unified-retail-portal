import { APP_STATE } from './state.js';
import { showToast, openModal, closeModal } from './utils.js';
import { renderScreen } from './routing.js';

export function handleUatOutageToggle(systemName) {
  const checkbox = document.getElementById(`outage-${systemName}`);
  if (!checkbox) return;
  APP_STATE.systemHealth[systemName] = !checkbox.checked;
  
  if (checkbox.checked) {
    showToast(`UAT: Simulated outage triggered for ${systemName.toUpperCase()}`, "danger");
  } else {
    showToast(`UAT: Restored connectivity for ${systemName.toUpperCase()}`, "success");
  }

  // Refresh current screen to show updated API state
  renderScreen(APP_STATE.activeRoute);
}

let sessionTimeoutInterval = null;

export function triggerSessionTimeoutSimulation() {
  // Clear any existing timer
  if (sessionTimeoutInterval) {
    clearInterval(sessionTimeoutInterval);
  }

  let count = 30;
  const countdownEl = document.getElementById('session-timeout-countdown');
  if (countdownEl) countdownEl.innerText = count;
  
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

export function handleTimeoutLogout() {
  if (sessionTimeoutInterval) {
    clearInterval(sessionTimeoutInterval);
    sessionTimeoutInterval = null;
  }
  closeModal('session-timeout-modal');
  
  if (window.handleLogout) {
    window.handleLogout();
  }
  showToast("Session closed due to inactivity timeout.", "danger");
}

export function extendSessionLife() {
  if (sessionTimeoutInterval) {
    clearInterval(sessionTimeoutInterval);
    sessionTimeoutInterval = null;
  }
  closeModal('session-timeout-modal');
  showToast("Session lease extended successfully.", "success");
}

// Bind to window for inline HTML execution
window.handleUatOutageToggle = handleUatOutageToggle;
window.triggerSessionTimeoutSimulation = triggerSessionTimeoutSimulation;
window.handleTimeoutLogout = handleTimeoutLogout;
window.extendSessionLife = extendSessionLife;
