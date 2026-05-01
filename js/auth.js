// Authentication helpers, modal handling, and session persistence

const API_BASE_URL = '/api';

document.addEventListener('DOMContentLoaded', () => {
    ensureAuthModal();
    checkAuthState();
});

function getAuthUser() {
    try {
        return JSON.parse(localStorage.getItem('kidvanaUser'));
    } catch (err) {
        return null;
    }
}

function getAuthHeaders(extraHeaders = {}) {
    const token = getAuthUser()?.token;
    return token
        ? { ...extraHeaders, Authorization: `Bearer ${token}` }
        : extraHeaders;
}

async function parseApiResponse(response) {
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(payload.message || 'Request failed');
    }
    return payload;
}

function ensureAuthModal() {
    if (document.getElementById('authModal')) return;

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'authModal';
    modal.innerHTML = `
        <div class="modal">
            <button class="modal-close" onclick="closeLoginModal()">X</button>
            <div style="text-align:center;margin-bottom:24px">
                <img src="assets/logo/kidvana-logo.svg" alt="Kidvana Logo" style="width:48px;height:48px;margin-bottom:8px;">
                <h3 style="font-size:1.2rem">Welcome to Kidvana</h3>
                <p style="font-size:0.82rem;color:var(--gray-500)">Use your phone number to continue</p>
            </div>
            <div style="display:flex;gap:0;margin-bottom:20px;border-bottom:2px solid var(--gray-100)">
                <button class="auth-tab active" data-tab="login" onclick="switchAuthTab('login')"
                    style="flex:1;padding:10px;font-weight:600;font-size:0.88rem;background:none;border:none;cursor:pointer;color:var(--primary);border-bottom:2px solid var(--primary);margin-bottom:-2px">
                    Login
                </button>
                <button class="auth-tab" data-tab="signup" onclick="switchAuthTab('signup')"
                    style="flex:1;padding:10px;font-weight:600;font-size:0.88rem;background:none;border:none;cursor:pointer;color:var(--gray-400);border-bottom:2px solid transparent;margin-bottom:-2px">
                    Sign Up
                </button>
            </div>
            <form class="auth-form active" id="loginForm" onsubmit="handleLogin(event)">
                <div class="form-group">
                    <label class="form-label">Phone Number</label>
                    <input type="tel" id="loginPhone" class="form-input" placeholder="Enter 10-digit mobile number" maxlength="10" required>
                </div>
                <button type="submit" class="btn btn-primary btn-lg" style="width:100%">Continue</button>
            </form>
            <form class="auth-form" id="signupForm" onsubmit="handleSignup(event)" style="display:none">
                <div class="form-group">
                    <label class="form-label">Full Name</label>
                    <input type="text" id="signupName" class="form-input" placeholder="Enter your full name" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Phone Number</label>
                    <input type="tel" id="signupPhone" class="form-input" placeholder="Enter 10-digit mobile number" maxlength="10" required>
                </div>
                <button type="submit" class="btn btn-primary btn-lg" style="width:100%">Create Account</button>
            </form>
        </div>
    `;

    document.body.appendChild(modal);
}

function checkAuthState() {
    const user = getAuthUser();
    const accountBtn = document.querySelector('.header-action-btn[title="My Account"]') || document.querySelector('.header-action-btn:first-child');
    const loginBtn = document.querySelector('.header-login-btn');

    if (user) {
        if (loginBtn) loginBtn.style.display = 'none';
        if (accountBtn) {
            const label = accountBtn.querySelector('.action-label');
            if (label) label.textContent = (user.name || 'Account').split(' ')[0];
            accountBtn.setAttribute('href', 'dashboard.html');
            accountBtn.onclick = null;
        }
        return;
    }

    if (loginBtn) loginBtn.style.display = 'flex';
    if (accountBtn) {
        const label = accountBtn.querySelector('.action-label');
        if (label) label.textContent = 'Account';
        accountBtn.setAttribute('href', '#');
        accountBtn.onclick = (event) => {
            event.preventDefault();
            openLoginModal();
        };
    }
}

function openLoginModal() {
    ensureAuthModal();
    const overlay = document.getElementById('authModal');
    if (overlay) {
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeLoginModal() {
    const overlay = document.getElementById('authModal');
    if (overlay) {
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function switchAuthTab(tab) {
    document.querySelectorAll('.auth-tab').forEach(button => {
        const isActive = button.dataset.tab === tab;
        button.classList.toggle('active', isActive);
        button.style.color = isActive ? 'var(--primary)' : 'var(--gray-400)';
        button.style.borderBottomColor = isActive ? 'var(--primary)' : 'transparent';
    });

    document.querySelectorAll('.auth-form').forEach(form => {
        const isActive = form.id === `${tab}Form`;
        form.classList.toggle('active', isActive);
        form.style.display = isActive ? 'block' : 'none';
    });
}

function storeAuthSession(payload) {
    const user = payload.user || payload;
    const session = { ...user, token: payload.token || user.token || '' };
    localStorage.setItem('kidvanaUser', JSON.stringify(session));
    return session;
}

async function handleLogin(e) {
    e.preventDefault();
    const phone = (document.getElementById('loginPhone')?.value || '').replace(/\D/g, '');
    const name = 'Kidvana User';

    if (phone.length !== 10) {
        showToast('Please enter a valid phone number', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone, name })
        });

        storeAuthSession(await parseApiResponse(response));
        showToast('Login successful! Welcome back.', 'success');
        closeLoginModal();
        checkAuthState();
    } catch (err) {
        showToast(err.message || 'Login failed. Please try again.', 'error');
        console.error(err);
    }
}

async function handleSignup(e) {
    e.preventDefault();
    const name = (document.getElementById('signupName')?.value || '').trim();
    const phone = (document.getElementById('signupPhone')?.value || '').replace(/\D/g, '');

    if (!name || phone.length !== 10) {
        showToast('Please fill all fields correctly', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, phone })
        });

        storeAuthSession(await parseApiResponse(response));
        showToast('Account created successfully!', 'success');
        closeLoginModal();
        checkAuthState();
    } catch (err) {
        showToast(err.message || 'Signup failed. Please try again.', 'error');
        console.error(err);
    }
}

function logout() {
    localStorage.removeItem('kidvanaUser');
    showToast('Logged out successfully', 'info');
    checkAuthState();
    if (window.location.pathname.includes('dashboard.html')) {
        window.location.href = 'index.html';
    }
}

document.addEventListener('click', (e) => {
    if (e.target.id === 'authModal') {
        closeLoginModal();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLoginModal();
});
