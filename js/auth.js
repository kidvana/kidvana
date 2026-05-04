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
            <div id="authContentMain">
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

            <!-- OTP Verification View -->
            <div id="authContentOTP" style="display:none">
                <div style="text-align:center;margin-bottom:24px">
                    <h3 style="font-size:1.4rem;margin-bottom:8px">Verify Phone</h3>
                    <p style="font-size:0.9rem;color:var(--gray-500)">Enter the 4-digit code sent to <br><strong id="displayUserPhone"></strong></p>
                </div>
                <div class="otp-input-group" style="display:flex;justify-content:center;gap:12px;margin-bottom:32px">
                    <input type="text" maxlength="1" class="otp-field" onkeyup="moveOTPFocus(this, 'next', event)" onkeydown="moveOTPFocus(this, 'prev', event)">
                    <input type="text" maxlength="1" class="otp-field" onkeyup="moveOTPFocus(this, 'next', event)" onkeydown="moveOTPFocus(this, 'prev', event)">
                    <input type="text" maxlength="1" class="otp-field" onkeyup="moveOTPFocus(this, 'next', event)" onkeydown="moveOTPFocus(this, 'prev', event)">
                    <input type="text" maxlength="1" class="otp-field" onkeyup="moveOTPFocus(this, 'next', event)" onkeydown="moveOTPFocus(this, 'prev', event)">
                </div>
                <button class="btn btn-primary btn-lg" style="width:100%;margin-bottom:16px" onclick="verifyMockOTP()">Verify & Login</button>
                <p style="text-align:center;font-size:0.85rem;color:var(--gray-400)">
                    Didn't receive code? <a href="#" onclick="showMockOTPHint()" style="color:var(--primary);font-weight:600">Resend Code</a>
                </p>
            </div>
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

let mockTempPayload = null;

async function handleLogin(e) {
    e.preventDefault();
    const phone = (document.getElementById('loginPhone')?.value || '').replace(/\D/g, '');
    const name = 'Kidvana User';

    if (phone.length !== 10) {
        showToast('Please enter a valid phone number', 'error');
        return;
    }

    mockTempPayload = { phone, name, type: 'login' };
    showMockOTPHint();
    switchToOTPView(phone);
}

async function handleSignup(e) {
    e.preventDefault();
    const name = (document.getElementById('signupName')?.value || '').trim();
    const phone = (document.getElementById('signupPhone')?.value || '').replace(/\D/g, '');

    if (!name || phone.length !== 10) {
        showToast('Please fill all fields correctly', 'error');
        return;
    }

    mockTempPayload = { phone, name, type: 'signup' };
    showMockOTPHint();
    switchToOTPView(phone);
}

function switchToOTPView(phone) {
    document.getElementById('authContentMain').style.display = 'none';
    document.getElementById('authContentOTP').style.display = 'block';
    document.getElementById('displayUserPhone').textContent = `+91 ${phone}`;
}

function showMockOTPHint() {
    showToast('Your Testing OTP is: 1234', 'info');
    // For 10s popup as requested, we can use a custom persistent toast or just a secondary notification
    const hint = document.createElement('div');
    hint.id = 'mockOTPHint';
    hint.innerHTML = `
        <div style="background:#000;color:#fff;padding:12px 24px;border-radius:12px;position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:10000;box-shadow:0 10px 30px rgba(0,0,0,0.3);display:flex;align-items:center;gap:12px;">
            <div style="width:8px;height:8px;background:#10B981;border-radius:50%"></div>
            <span>TEST OTP: <strong style="color:#10B981;font-size:1.1rem;margin-left:4px">1234</strong></span>
            <span style="font-size:0.75rem;opacity:0.6;margin-left:8px">(Auto-closing in 10s)</span>
        </div>
    `;
    document.body.appendChild(hint);
    setTimeout(() => hint.remove(), 10000);
}

function moveOTPFocus(field, direction, e) {
    if (direction === 'next' && field.value.length === 1) {
        const next = field.nextElementSibling;
        if (next) next.focus();
    }
    if (direction === 'prev' && e && e.key === 'Backspace' && field.value.length === 0) {
        const prev = field.previousElementSibling;
        if (prev) prev.focus();
    }
}

async function verifyMockOTP() {
    const fields = document.querySelectorAll('.otp-field');
    const otp = Array.from(fields).map(f => f.value).join('');

    if (otp !== '1234') {
        showToast('Invalid OTP. Please use 1234 for testing.', 'error');
        fields.forEach(f => { f.value = ''; f.style.borderColor = 'red'; });
        fields[0].focus();
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(mockTempPayload)
        });

        storeAuthSession(await parseApiResponse(response));
        showToast(mockTempPayload.type === 'login' ? 'Login successful! Welcome back.' : 'Account created successfully!', 'success');
        closeLoginModal();
        checkAuthState();
        
        // Reset modal state
        setTimeout(() => {
            document.getElementById('authContentMain').style.display = 'block';
            document.getElementById('authContentOTP').style.display = 'none';
            fields.forEach(f => f.value = '');
        }, 500);

    } catch (err) {
        showToast(err.message || 'Verification failed.', 'error');
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
