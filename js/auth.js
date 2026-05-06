// Authentication helpers, modal handling, and session persistence

const API_BASE_URL = '/api';

document.addEventListener('DOMContentLoaded', () => {
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
    return null;
}

function checkAuthState() {
    return null;
}

function openLoginModal() {
    return null;
}

function closeLoginModal() {
    return null;
}

function switchAuthTab(tab) {
    return tab;
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
