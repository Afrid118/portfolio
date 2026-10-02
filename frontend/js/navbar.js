async function initNavbar(activePage) {
  const navbarContainer = document.getElementById('navbar');
  if (!navbarContainer) return;

  const user = getUser();
  const isAuth = !!user;

  let linksHTML = '';
  
  if (isAuth) {
    if (user.userType === 'admin') {
      linksHTML = `
        <a href="./admin-dashboard.html" class="nav-link ${activePage === 'admin-dashboard' ? 'active' : ''}">Dashboard</a>
        <a href="./admin-reports.html" class="nav-link ${activePage === 'admin-reports' ? 'active' : ''}">Reports</a>
        <a href="./admin-claims.html" class="nav-link ${activePage === 'admin-claims' ? 'active' : ''}">Claims</a>
      `;
    } else {
      linksHTML = `
        <a href="./dashboard.html" class="nav-link ${activePage === 'dashboard' ? 'active' : ''}">Dashboard</a>
        <a href="./lost-items.html" class="nav-link ${activePage === 'lost' ? 'active' : ''}">Lost Items</a>
        <a href="./found-items.html" class="nav-link ${activePage === 'found' ? 'active' : ''}">Found Items</a>
        <a href="./search.html" class="nav-link ${activePage === 'search' ? 'active' : ''}">Search</a>
      `;
    }
  }

  const rightSideHTML = isAuth ? `
    <div style="display: flex; align-items: center; gap: 1rem;">
      <a href="./notifications.html" class="nav-link" style="position: relative;">
        <i data-lucide="bell"></i>
        <span id="nav-notif-badge" style="display:none; position:absolute; top:-5px; right:-5px; background:var(--danger); width:18px; height:18px; border-radius:50%; font-size:10px; display:flex; align-items:center; justify-content:center; color:white;">0</span>
      </a>
      <div class="user-menu" style="position: relative; cursor: pointer;">
        <div class="avatar" id="avatar-btn" style="background:var(--aurora-purple); color:white; font-weight:bold;">
          ${user.name ? user.name.charAt(0).toUpperCase() : 'U'}
        </div>
        <div id="user-dropdown" class="glass-card" style="display:none; position:absolute; right:0; top:50px; min-width:150px; padding:0.5rem; z-index:2000;">
          <a href="./profile.html" style="display:block; padding:0.5rem; color:white; text-decoration:none;">Profile</a>
          ${user.userType !== 'admin' ? `<a href="./my-reports.html" style="display:block; padding:0.5rem; color:white; text-decoration:none;">My Reports</a>` : ''}
          <div style="height:1px; background:var(--glass-border); margin:0.5rem 0;"></div>
          <a href="#" id="logout-btn" style="display:block; padding:0.5rem; color:var(--danger); text-decoration:none;">Logout</a>
        </div>
      </div>
    </div>
  ` : `
    <a href="./login.html" class="btn btn-primary">Login</a>
  `;

  navbarContainer.innerHTML = `
    <nav class="navbar">
      <div class="container">
        <a href="${isAuth ? (user.userType==='admin' ? '/admin-dashboard.html' : '/dashboard.html') : '/index.html'}" class="navbar-brand">
          <i data-lucide="radio" style="color: var(--aurora-purple);"></i>
          Lost &amp; Found Portal For Campus
        </a>
        
        <button class="hamburger" id="mobile-menu-btn">
          <i data-lucide="menu"></i>
        </button>

        <ul class="nav-menu" id="nav-menu">
          ${linksHTML}
        </ul>

        <div class="nav-actions" style="display: flex; align-items: center; gap: 1rem;">
          ${rightSideHTML}
        </div>
      </div>
    </nav>
  `;

  initLucide();

  // Events
  if (isAuth) {
    const avatarBtn = document.getElementById('avatar-btn');
    const userDropdown = document.getElementById('user-dropdown');
    
    avatarBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      userDropdown.style.display = userDropdown.style.display === 'none' ? 'block' : 'none';
    });

    document.addEventListener('click', () => {
      if(userDropdown) userDropdown.style.display = 'none';
    });

    document.getElementById('logout-btn').addEventListener('click', (e) => {
      e.preventDefault();
      clearAuth();
      window.location.href = './login.html';
    });

    // Unread count
    try {
      const res = await Notifications.getUnreadCount();
      if (res.ok && res.data.count > 0) {
        const badge = document.getElementById('nav-notif-badge');
        badge.style.display = 'flex';
        badge.innerText = res.data.count > 99 ? '99+' : res.data.count;
      }
    } catch(e) {}
  }

  // Mobile menu
  const mobileBtn = document.getElementById('mobile-menu-btn');
  const navMenu = document.getElementById('nav-menu');
  if (mobileBtn && navMenu) {
    mobileBtn.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });
  }
}
