// Initialize navbar based on login state
function initializeNavbar() {
  const customer = JSON.parse(localStorage.getItem('customer'));
  const navActions = document.querySelector('.nav-actions');
  
  if (!navActions) return;
  
  // Clear existing nav actions
  navActions.innerHTML = '';
  
  if (customer) {
    // User is logged in - show username and logout button
    const userSpan = document.createElement('span');
    userSpan.style.cssText = `
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 700;
      color: #2d1b4e;
      font-size: 0.95rem;
    `;
    userSpan.innerHTML = ` ${customer.username}`;
    
    const logoutBtn = document.createElement('a');
    logoutBtn.href = '#';
    logoutBtn.className = 'btn btn-outline';
    logoutBtn.textContent = 'Sign Out';
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('customer');
      window.location.href = 'index.html';
    });
    
    navActions.appendChild(userSpan);
    navActions.appendChild(logoutBtn);
  } else {
    // User is not logged in - show login and register buttons
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

// Run when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeNavbar);
