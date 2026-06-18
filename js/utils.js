import { APP_STATE, saveNotifications } from './state.js';

export function updateNotificationsBadge() {
  const count = APP_STATE.notifications.filter(n => !n.read).length;
  const badge = document.getElementById('notifications-count-badge');
  if (badge) {
    if (count > 0) {
      badge.style.display = 'flex';
      badge.innerText = count;
    } else {
      badge.style.display = 'none';
    }
  }
}

export function pushNotification(title, message, type, priority) {
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

export function showToast(message, type = "success") {
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

export function maskID(idNum) {
  if (!idNum) return "";
  return idNum.slice(0, 2) + "*******" + idNum.slice(-4);
}

export function maskPassport(passport) {
  if (!passport) return "";
  return passport.slice(0, 2) + "****" + passport.slice(-3);
}

export function openModal(modalId) {
  const m = document.getElementById(modalId);
  if (m) m.style.display = 'flex';
}

export function closeModal(modalId) {
  const m = document.getElementById(modalId);
  if (m) m.style.display = 'none';
}

// Bind modal utilities to window for inline onclick handlers
window.openModal = openModal;
window.closeModal = closeModal;
