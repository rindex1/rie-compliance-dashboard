const el = (id) => document.getElementById(id);
const fmtDate = (d) => (d ? new Date(d).toLocaleString() : '');
let users = [];
let selectedUserId = null;

function clearFieldErrors() {
  el('cNameError').textContent = '';
  el('cEmailError').textContent = '';
  el('cPasswordError').textContent = '';
  el('cRoleError').textContent = '';
  el('cCompanyNameError').textContent = '';
}

function setFieldError(fieldId, message) {
  const errorEl = el(`${fieldId}Error`);
  if (errorEl) {
    errorEl.textContent = message || '';
  }
}

function baseUrl() {
  return (el('baseUrl').value || '').replace(/\/$/, '');
}

function token() {
  return el('provToken').value;
}

function saveSettings() {
  localStorage.setItem('admin_baseUrl', el('baseUrl').value);
  localStorage.setItem('admin_token', el('provToken').value);
}

function loadSettings() {
  const storedUrl = localStorage.getItem('admin_baseUrl');
  const storedToken = localStorage.getItem('admin_token');
  el('baseUrl').value = storedUrl || 'http://localhost:3000';
  el('provToken').value = storedToken || 'dev-provision-token';
}

async function loadUsers() {
  el('status').textContent = 'Laden...';
  el('status').className = 'muted';
  try {
    const res = await fetch(`${baseUrl()}/api/admin/users`, {
      headers: { 'X-Provision-Token': token() },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Kon gebruikers niet laden');
    users = data.users;
    renderUsers();
    el('status').textContent = `Loaded ${users.length} users`;
  } catch (e) {
    el('status').textContent = e.message;
    el('status').className = 'error';
  }
}

function renderUsers() {
  const body = el('usersBody');
  body.innerHTML = '';
  for (const u of users) {
    const tr = document.createElement('tr');
    tr.style.cursor = 'pointer';
    tr.addEventListener('click', () => selectUser(u));
    const limitDisplay = u.license?.plan === 'SUPERUSER' && u.license?.accountLimit 
      ? `${u.license.accountLimit}` 
      : u.license?.plan === 'ADMIN' 
      ? '∞' 
      : '';
    tr.innerHTML = `
      <td>${u.name}</td>
      <td>${u.email}</td>
      <td>${u.role}</td>
      <td>${u.company?.name || ''}</td>
      <td>${u.license?.plan || ''}</td>
      <td>${limitDisplay}</td>
      <td><span class="status-pill">${u.license?.status || ''}</span></td>
      <td>${fmtDate(u.license?.expiresAt)}</td>
    `;
    body.appendChild(tr);
  }
}

function selectUser(u) {
  selectedUserId = u.id;
  el('selectedUser').value = `${u.name} (${u.email})`;
  el('plan').value = u.license?.plan || 'SUPERUSER';
  el('statusSel').value = u.license?.status || 'ACTIVE';
  if (u.license?.expiresAt) {
    const dt = new Date(u.license.expiresAt);
    const isoLocal = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    el('expiresAt').value = isoLocal;
  } else {
    el('expiresAt').value = '';
  }
  el('accountLimit').value = u.license?.accountLimit || '';
}

async function assign() {
  if (!selectedUserId) {
    el('opStatus').textContent = 'Selecteer eerst een gebruiker.';
    el('opStatus').className = 'error';
    return;
  }
  el('opStatus').textContent = 'Bezig...';
  el('opStatus').className = 'muted';
  try {
    const expires = el('expiresAt').value
      ? new Date(el('expiresAt').value).toISOString()
      : null;
    const accountLimit = el('accountLimit').value.trim();
    const accountLimitNum = accountLimit ? parseInt(accountLimit, 10) : null;
    
    const res = await fetch(`${baseUrl()}/api/admin/license`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Provision-Token': token(),
      },
      body: JSON.stringify({
        userId: selectedUserId,
        plan: el('plan').value || 'SUPERUSER',
        status: el('statusSel').value,
        accountLimit: accountLimitNum,
        expiresAt: expires,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Mislukt');
    el('opStatus').textContent = 'Licentie bijgewerkt';
    el('opStatus').className = 'success';
    await loadUsers();
  } catch (e) {
    el('opStatus').textContent = e.message;
    el('opStatus').className = 'error';
  }
}

function clearForm() {
  selectedUserId = null;
  el('selectedUser').value = '';
  el('plan').value = 'SUPERUSER';
  el('statusSel').value = 'ACTIVE';
  el('expiresAt').value = '';
  el('accountLimit').value = '';
  el('opStatus').textContent = '';
}

async function impersonate() {
  if (!selectedUserId) {
    el('opStatus').textContent = 'Selecteer eerst een gebruiker om in te loggen.';
    el('opStatus').className = 'error';
    return;
  }
  
  el('opStatus').textContent = 'Inloggen als gebruiker...';
  el('opStatus').className = 'muted';
  
  try {
    const res = await fetch(`${baseUrl()}/api/admin/impersonate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Provision-Token': token(),
      },
      body: JSON.stringify({ userId: selectedUserId }),
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.error || 'Inloggen mislukt');
    }
    
    // Store token in localStorage and open dashboard
    const token = data.token;
    const dashboardUrl = `${baseUrl()}/dashboard`;
    const redirectUrl = `${baseUrl()}/login?token=${encodeURIComponent(token)}&impersonate=true`;
    
    // Open in default browser
    if (window.electron && window.electron.shell) {
      window.electron.shell.openExternal(redirectUrl);
    } else {
      // Fallback: copy token to clipboard if electron.shell not available
      navigator.clipboard.writeText(token).then(() => {
        el('opStatus').textContent = `Token gekopieerd! Plak in ${dashboardUrl}`;
        el('opStatus').className = 'success';
      }).catch(() => {
        // If clipboard fails, show token
        alert(`Token: ${token}\n\nOpen ${dashboardUrl} en gebruik deze token in de browser console:\nlocalStorage.setItem('token', '${token}')`);
      });
    }
    
    el('opStatus').textContent = `Ingelogd als ${data.user.name}. Browser wordt geopend...`;
    el('opStatus').className = 'success';
    
  } catch (e) {
    console.error('Impersonate error:', e);
    el('opStatus').textContent = e.message || 'Er is een fout opgetreden';
    el('opStatus').className = 'error';
  }
}

async function createNewUser(e) {
  if (e) e.preventDefault();
  
  console.log('createNewUser called');
  clearFieldErrors();
  el('createStatus').textContent = 'Bezig...';
  el('createStatus').className = 'muted';
  
  let hasErrors = false;
  
  // Validate Name
  const name = el('cName').value.trim();
  if (!name) {
    setFieldError('cName', 'Naam is verplicht');
    hasErrors = true;
  } else if (name.length < 2) {
    setFieldError('cName', 'Naam moet minimaal 2 tekens zijn');
    hasErrors = true;
  }

  // Validate Email
  const email = el('cEmail').value.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    setFieldError('cEmail', 'Email is verplicht');
    hasErrors = true;
  } else if (!emailRegex.test(email)) {
    setFieldError('cEmail', 'Ongeldig e-mailadres formaat');
    hasErrors = true;
  }

  // Validate Password
  const password = el('cPassword').value;
  if (!password) {
    setFieldError('cPassword', 'Wachtwoord is verplicht');
    hasErrors = true;
  } else if (password.length < 8) {
    setFieldError('cPassword', 'Wachtwoord moet minimaal 8 tekens zijn');
    hasErrors = true;
  }

  // Validate Role
  const role = el('cRole').value;
  if (!role || !['ADMIN', 'MANAGER', 'EMPLOYEE', 'EXTERNAL_ADVISOR'].includes(role)) {
    setFieldError('cRole', 'Selecteer een geldige rol');
    hasErrors = true;
  }

  if (hasErrors) {
    el('createStatus').textContent = 'Corrigeer de fouten en probeer opnieuw';
    el('createStatus').className = 'error';
    return;
  }

  try {
    const payload = {
      email,
      name,
      password,
      role,
    };

    // Only include companyName if provided
    const companyName = el('cCompanyName').value.trim();
    if (companyName) {
      payload.companyName = companyName;
    }

    if (!baseUrl()) {
      el('createStatus').textContent = 'Vul Base URL in';
      el('createStatus').className = 'error';
      return;
    }

    if (!token()) {
      el('createStatus').textContent = 'Vul Provision Token in';
      el('createStatus').className = 'error';
      return;
    }

    const res = await fetch(`${baseUrl()}/api/auth/provision`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Provision-Token': token(),
      },
      body: JSON.stringify(payload),
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      // Map API validation errors to fields
      if (data.details && Array.isArray(data.details)) {
        data.details.forEach(detail => {
          const field = detail.path?.[0];
          if (field === 'email') setFieldError('cEmail', detail.message);
          else if (field === 'name') setFieldError('cName', detail.message);
          else if (field === 'password') setFieldError('cPassword', detail.message);
          else if (field === 'role') setFieldError('cRole', detail.message);
          else if (field === 'companyName') setFieldError('cCompanyName', detail.message);
        });
      }
      
      // Show detailed error (server error messages in dev mode)
      let errorMsg = data.error || 'Aanmaken mislukt';
      if (data.message) {
        errorMsg = data.message;
      } else if (data.details && Array.isArray(data.details)) {
        errorMsg = `${data.error}: ${data.details.map(d => d.message).join(', ')}`;
      }
      
      el('createStatus').textContent = errorMsg;
      el('createStatus').className = 'error';
      console.error('API Error:', data);
      return;
    }

    el('createStatus').textContent = data.license 
      ? 'Gebruiker en licentie aangemaakt' 
      : 'Gebruiker aangemaakt (licentie toewijzen via "Licentie toewijzen / bijwerken")';
    el('createStatus').className = 'success';
    
    // Clear form and errors
    clearFieldErrors();
    el('cName').value = '';
    el('cEmail').value = '';
    el('cPassword').value = '';
    el('cCompanyName').value = '';
    el('cRole').value = 'MANAGER';
    
    await loadUsers();
  } catch (e) {
    console.error('Create user error:', e);
    el('createStatus').textContent = e.message || 'Er is een fout opgetreden';
    el('createStatus').className = 'error';
  }
}

window.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  el('loadUsers').addEventListener('click', loadUsers);
  el('assign').addEventListener('click', assign);
  el('clear').addEventListener('click', clearForm);
  el('impersonate').addEventListener('click', impersonate);
  
  const createBtn = el('createUser');
  if (createBtn) {
    createBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('Create button clicked');
      createNewUser(e);
    });
  } else {
    console.error('createUser button not found!');
  }
  el('baseUrl').addEventListener('input', saveSettings);
  el('provToken').addEventListener('input', saveSettings);
  
  // Clear field errors on input
  el('cName').addEventListener('input', () => setFieldError('cName', ''));
  el('cEmail').addEventListener('input', () => setFieldError('cEmail', ''));
  el('cPassword').addEventListener('input', () => setFieldError('cPassword', ''));
  el('cCompanyName').addEventListener('input', () => setFieldError('cCompanyName', ''));
  el('cRole').addEventListener('change', () => setFieldError('cRole', ''));
  
  // Password visibility toggle
  el('togglePassword').addEventListener('click', () => {
    const passwordInput = el('cPassword');
    const toggleBtn = el('togglePassword');
    if (passwordInput.type === 'password') {
      passwordInput.type = 'text';
      toggleBtn.textContent = '🙈';
    } else {
      passwordInput.type = 'password';
      toggleBtn.textContent = '👁️';
    }
  });
});


