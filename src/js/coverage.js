import { APP_STATE, MOCK_DB } from './state.js';
import { showToast } from './utils.js';
import { switchRoute } from './routing.js';

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

function renderMockMapFallback(mapEl, gisStatus, serviceType) {
  const isFibre = serviceType === 'Fibre';
  const color = gisStatus === 'Coverage available' ? 'var(--success)' : (gisStatus === 'Coverage unavailable' ? 'var(--danger)' : 'var(--border-color)');
  
  mapEl.innerHTML = `
    <div style="position: absolute; inset: 0; background: #e9ecef; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px; text-align: center; border-radius: var(--radius-md);">
      <div style="font-size: 40px; margin-bottom: 12px; color: ${color};">${isFibre ? '🔌' : '📡'}</div>
      <h4 style="color: var(--telkom-blue-dark); font-weight: 700; margin-bottom: 6px;">GIS Offline Fallback Map</h4>
      <p style="font-size: 12px; color: var(--text-secondary); max-width: 250px;">Map rendering fallback active (Offline). Coverage: <strong>${gisStatus || 'Not checked'}</strong></p>
      <div style="margin-top: 12px; width: 60px; height: 60px; border-radius: 50%; border: 4px solid ${color}; opacity: 0.3; animation: pulse 2s infinite;"></div>
    </div>
  `;
}

export function renderCheckCoverageScreen() {
  const container = document.getElementById('check-coverage-screen-content');
  if (!container) return;

  if (!APP_STATE.checkedCoverage) {
    APP_STATE.checkedCoverage = {
      address: "",
      status: "Not checked",
      ref: "",
      type: "LTE",
      coords: ""
    };
  }

  const cov = APP_STATE.checkedCoverage;
  const isFibre = cov.type === 'Fibre';
  const serviceLabel = isFibre ? 'Fibre Broadband' : 'LTE Fixed-Wireless';
  const status = cov.status;

  let resultHtml = '';
  if (status === 'Coverage available') {
    resultHtml = `
      <div style="background-color: var(--success-light); border-left: 4px solid var(--success); padding: 16px; border-radius: var(--radius-md); margin-top: 20px; box-shadow: var(--shadow-sm);">
        <div style="font-size: 14px; font-weight: 700; color: var(--success); margin-bottom: 4px;">✅ COVERAGE APPROVED</div>
        <p style="font-size: 13px; color: var(--text-primary); margin-bottom: 12px;">Telkom ${serviceLabel} signal is verified available at this address.</p>
        <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 16px;">GIS Ref: <strong>${cov.ref}</strong> &nbsp;·&nbsp; Coords: ${cov.coords || 'N/A'}</div>
        <button class="btn btn-primary" onclick="proceedFromCoverageToCatalogue()" style="width: 100%; height: 42px; display: flex; align-items: center; justify-content: center; font-weight: 700;">
          Proceed to Product Catalogue →
        </button>
      </div>
    `;
  } else if (status === 'Coverage unavailable') {
    resultHtml = `
      <div style="background-color: var(--danger-light); border-left: 4px solid var(--danger); padding: 16px; border-radius: var(--radius-md); margin-top: 20px;">
        <div style="font-size: 14px; font-weight: 700; color: var(--danger); margin-bottom: 4px;">❌ COVERAGE DECLINED</div>
        <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 0;">Address is outside the Telkom ${cov.type} coverage zone. Fixed-wireless or fibre services are currently unavailable at this address.</p>
      </div>
    `;
  } else if (status === 'Error') {
    resultHtml = `
      <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; border-radius: var(--radius-md); margin-top: 20px;">
        <div style="font-size: 14px; font-weight: 700; color: #b91c1c; margin-bottom: 4px;">⚠️ GIS QUERY ERROR</div>
        <p style="font-size: 13px; color: #991b1b; margin-bottom: 0;">Failed to establish connection with Clarify GIS database. Service lookup timed out after 5000ms. (Reference code: GIS-ERR-503)</p>
      </div>
    `;
  } else {
    resultHtml = `
      <div style="background-color: var(--bg-light); border-left: 4px solid var(--border-color); padding: 16px; border-radius: var(--radius-md); margin-top: 20px;">
        <div style="font-size: 13px; color: var(--text-muted);">⏳ Enter service address and select product type, then click <strong>Execute Coverage Check</strong> to query coverage.</div>
      </div>
    `;
  }

  container.innerHTML = `
    <div style="display: grid; grid-template-columns: 1fr 1.2fr; gap: 24px; min-height: 420px;">
      <div>
        <h4 style="color: var(--telkom-blue-dark); font-weight: 700; margin-bottom: 16px;">Coverage Address Check</h4>
        
        <div class="form-group" style="margin-bottom: 16px;">
          <label class="form-label">Service Technology Type <span class="required">*</span></label>
          <select id="standalone-coverage-type" class="form-control" style="height: 42px;" onchange="updateStandaloneCoverageType(this.value)">
            <option value="LTE" ${cov.type === 'LTE' ? 'selected' : ''}>LTE Fixed-Wireless Broadband</option>
            <option value="Fibre" ${cov.type === 'Fibre' ? 'selected' : ''}>Telkom Fibre FTTH</option>
          </select>
        </div>

        <div class="form-group" style="margin-bottom: 16px;">
          <label class="form-label">Service / Installation Address <span class="required">*</span></label>
          <input type="text" id="standalone-coverage-address" class="form-control" 
            placeholder="e.g. 12 Main Rd, Rosebank, Johannesburg, 2196" 
            value="${cov.address}" style="height: 42px;" onkeydown="handleStandaloneCoverageKeydown(event)">
          <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">Enter the exact location where services are to be provisioned.</div>
        </div>

        <button class="btn btn-primary" onclick="checkStandaloneCoverage()" style="height: 42px; width: 100%; display: flex; align-items: center; justify-content: center; font-weight: 600; gap: 8px;">
          <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          Execute Coverage Check
        </button>

        ${resultHtml}
      </div>

      <div style="display: flex; flex-direction: column;">
        <h4 style="color: var(--telkom-blue-dark); font-weight: 700; margin-bottom: 16px;">Interactive Map View</h4>
        
        <div id="standalone-gis-map" style="width: 100%; flex: 1; min-height: 320px; border-radius: var(--radius-md); border: 1px solid var(--border-color); background: #e0ecef; position: relative; overflow: hidden; box-shadow: var(--shadow-sm);">
          <div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; color: ${status === 'Error' ? '#b91c1c' : 'var(--text-secondary)'}; font-size: 12px; font-weight: ${status === 'Error' ? '600' : 'normal'};">
            <span>${status === 'Error' ? '❌ GIS Map Service Unreachable' : '⏳ Standby - Waiting to query coordinates...'}</span>
          </div>
        </div>
        <div style="font-size: 11px; color: var(--text-muted); text-align: center; margin-top: 8px;">Interactive mapping utilizing Telkom GIS Geolocation circles.</div>
      </div>
    </div>
  `;

  // Draw Leaflet Map
  if (status !== 'Not checked' && status !== 'Error') {
    setTimeout(() => {
      const mapEl = document.getElementById('standalone-gis-map');
      if (!mapEl) return;

      loadLeaflet((err) => {
        const liveMapEl = document.getElementById('standalone-gis-map');
        if (!liveMapEl) return;

        if (err) {
          renderMockMapFallback(liveMapEl, status, cov.type);
          return;
        }

        try {
          let lat = -26.15;
          let lng = 28.05;
          if (cov.coords) {
            const parts = cov.coords.split(',');
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
          marker.bindPopup(`<b>Service Location</b><br>${cov.address}`).openPopup();

          L.circle([lat, lng], {
            color: status === 'Coverage available' ? '#91E200' : '#ff4d4f',
            fillColor: status === 'Coverage available' ? '#91E200' : '#ff4d4f',
            fillOpacity: 0.25,
            radius: 800
          }).addTo(map);
        } catch (ex) {
          console.error("Standalone Leaflet failed", ex);
          renderMockMapFallback(liveMapEl, status, cov.type);
        }
      });
    }, 100);
  }
}

export function updateStandaloneCoverageType(val) {
  if (!APP_STATE.checkedCoverage) {
    APP_STATE.checkedCoverage = { address: "", status: "Not checked", ref: "", type: "LTE", coords: "" };
  }
  APP_STATE.checkedCoverage.type = val;
}

export function handleStandaloneCoverageKeydown(e) {
  if (e.key === 'Enter') {
    checkStandaloneCoverage();
  }
}

export function checkStandaloneCoverage() {
  const addrInput = document.getElementById('standalone-coverage-address');
  const typeSelect = document.getElementById('standalone-coverage-type');
  if (!addrInput || !typeSelect) return;

  const addr = addrInput.value.trim();
  const type = typeSelect.value;

  if (!addr) {
    showToast("Please enter an address to query.", "warning");
    return;
  }

  // UAT Outage Check
  if (APP_STATE.systemHealth && APP_STATE.systemHealth.gis === false) {
    APP_STATE.checkedCoverage = {
      address: addr,
      status: "Error",
      ref: "",
      type: type,
      coords: ""
    };
    showToast("GIS lookup failed: System Outage simulated.", "danger");
    renderCheckCoverageScreen();
    return;
  }

  // Error Address Keyword Trigger
  if (addr.toLowerCase().includes('error') || addr.toLowerCase().includes('fail') || addr.toLowerCase().includes('outage')) {
    APP_STATE.checkedCoverage = {
      address: addr,
      status: "Error",
      ref: "",
      type: type,
      coords: ""
    };
    showToast("GIS lookup failed: Simulated lookup error.", "danger");
    renderCheckCoverageScreen();
    return;
  }

  // Look up in database
  let coverageData = MOCK_DB.gis[addr];
  if (!coverageData) {
    const matchingKey = Object.keys(MOCK_DB.gis).find(key => key.toLowerCase().includes(addr.toLowerCase()) || addr.toLowerCase().includes(key.toLowerCase()));
    if (matchingKey) {
      coverageData = MOCK_DB.gis[matchingKey];
    }
  }

  if (coverageData) {
    APP_STATE.checkedCoverage = {
      address: addr,
      status: coverageData.status,
      ref: coverageData.ref || ("GIS-AUTO-" + Math.floor(1000 + Math.random() * 9000)),
      type: type,
      coords: coverageData.coords || "-26.15, 28.05"
    };
  } else {
    // Default fallback to coverage available
    APP_STATE.checkedCoverage = {
      address: addr,
      status: "Coverage available",
      ref: "GIS-STANDALONE-" + Math.floor(1000 + Math.random() * 9000),
      type: type,
      coords: "-26.145, 28.043"
    };
  }

  const cov = APP_STATE.checkedCoverage;
  showToast(`Coverage check completed: ${cov.status}`, cov.status === 'Coverage available' ? 'success' : 'danger');
  renderCheckCoverageScreen();
}

export function proceedFromCoverageToCatalogue() {
  const cov = APP_STATE.checkedCoverage;
  if (!cov || cov.status !== 'Coverage available') {
    showToast("Cannot proceed: Coverage has not been checked or is unavailable.", "warning");
    return;
  }

  // Pre-fill the cart coverage info so when a product is checked out, it is accepted automatically!
  APP_STATE.cart.tempCoverageAddress = cov.address;
  APP_STATE.cart.gisStatus = "Coverage available";
  APP_STATE.cart.gisRef = cov.ref;

  showToast("Address coverage confirmed. Redirecting to Product Catalogue.", "success");
  switchRoute('catalogue');
}

// Bind to window for inline calls
window.renderCheckCoverageScreen = renderCheckCoverageScreen;
window.updateStandaloneCoverageType = updateStandaloneCoverageType;
window.handleStandaloneCoverageKeydown = handleStandaloneCoverageKeydown;
window.checkStandaloneCoverage = checkStandaloneCoverage;
window.proceedFromCoverageToCatalogue = proceedFromCoverageToCatalogue;
