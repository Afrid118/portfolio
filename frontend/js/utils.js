function showToast(message, type = 'success') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  let icon = 'check-circle';
  if (type === 'error') icon = 'alert-circle';
  if (type === 'warning') icon = 'alert-triangle';
  if (type === 'info') icon = 'info';

  toast.innerHTML = `
    <i data-lucide="${icon}"></i>
    <span>${message}</span>
  `;
  
  container.appendChild(toast);
  initLucide();

  setTimeout(() => {
    toast.remove();
    if (container.childNodes.length === 0) container.remove();
  }, 3300);
}

function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

function formatTime(timeString) {
  if (!timeString) return '';
  return timeString;
}

function getStatusBadge(status) {
  if (!status) return '';
  const s = status.toLowerCase();
  let label = s.replace('_', ' ');
  return `<span class="badge ${s}">${label}</span>`;
}

function requireAuth() {
  if (!getToken()) {
    window.location.href = './login.html';
  }
}

function requireAdmin() {
  requireAuth();
  const user = getUser();
  if (user && user.userType !== 'admin') {
    window.location.href = './dashboard.html';
  }
}

function getImageUrl(itemOrFilename) {
  let file = itemOrFilename;
  if (itemOrFilename && typeof itemOrFilename === 'object') {
    file = itemOrFilename.photo || itemOrFilename.photoUrl;
  }
  if (!file) return './assets/placeholder.svg';
  if (file.startsWith('http') || file.startsWith('data:') || file.startsWith('/assets/')) return file;
  if (file.startsWith('/')) return file;
  return `/uploads/${file}`;
}

function validateEmail(email) {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(String(email).toLowerCase());
}

function validatePhone(phone) {
  const re = /^[6-9][0-9]{9}$/;
  return re.test(String(phone));
}

function truncate(text, len) {
  if (!text) return '';
  if (text.length <= len) return text;
  return text.substring(0, len) + '...';
}

function timeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  
  return formatDate(dateString);
}

function debounce(fn, delay) {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}

function initLucide() {
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}
