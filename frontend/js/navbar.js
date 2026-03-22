function initializeNavbar() {
  const customer = JSON.parse(localStorage.getItem('customer'));
  const navActions = document.querySelector('.nav-actions');
  if (!navActions) return;

  navActions.innerHTML = '';

  if (customer) {
    const userSpan = document.createElement('span');
    userSpan.style.cssText = `
      display: flex;
      align-items: center;
      font-weight: 700;
      color: #2d1b4e;
      font-size: 0.95rem;
      margin-right: 0.5rem;
    `;
    userSpan.textContent = customer.username;

    const logoutBtn = document.createElement('a');
    logoutBtn.href = '#';
    // ← เปลี่ยนเป็น btn-primary เหมือน index.html
    logoutBtn.className = 'btn btn-primary';
    logoutBtn.textContent = 'Sign Out';
    logoutBtn.style.cssText = `
      background: linear-gradient(135deg, #f472b6, #c084fc);
      color: white;
    `;
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('customer');
      window.location.href = 'index.html';
    });

    navActions.appendChild(userSpan);
    navActions.appendChild(logoutBtn);
  } else {
    const loginBtn = document.createElement('a');
    loginBtn.href = 'login.html';
    loginBtn.className = 'btn btn-outline';
    loginBtn.textContent = 'Sign in';

    const registerBtn = document.createElement('a');
    registerBtn.href = 'register.html';
    registerBtn.className = 'btn btn-primary';
    registerBtn.textContent = 'Register';

    navActions.appendChild(loginBtn);
    navActions.appendChild(registerBtn);
  }
}

document.addEventListener('DOMContentLoaded', initializeNavbar);