// ═══════════════════════════════════════════════
// AUTH — Login/Signup Modal & Persistence
// ═══════════════════════════════════════════════

// Check auth state on load
document.addEventListener('DOMContentLoaded', checkAuthState);

function checkAuthState() {
    const user = JSON.parse(localStorage.getItem('kidvanaUser'));
    const accountBtn = document.querySelector('.header-action-btn:first-child');
    const loginBtn = document.querySelector('.header-login-btn');

    if (user) {
        if (loginBtn) loginBtn.style.display = 'none';
        if (accountBtn) {
            const label = accountBtn.querySelector('.action-label');
            if (label) label.textContent = user.name.split(' ')[0];
            // Change button behavior to redirect to dashboard
            accountBtn.onclick = () => window.location.href = 'dashboard.html';
        }
    } else {
        if (loginBtn) loginBtn.style.display = 'flex';
        if (accountBtn) {
            const label = accountBtn.querySelector('.action-label');
            if (label) label.textContent = 'Account';
            // Restore original behavior
            accountBtn.onclick = openLoginModal;
        }
    }
}

function openLoginModal() {
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
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
    document.querySelector(`.auth-tab[data-tab="${tab}"]`)?.classList.add('active');
    document.getElementById(`${tab}Form`)?.classList.add('active');
}

const API_BASE_URL = 'http://localhost:5000/api';

async function handleLogin(e) {
    e.preventDefault();
    const phone = document.getElementById('loginPhone')?.value;
    const name = "User"; // Default name for quick login

    if (!phone || phone.length < 10) {
        showToast('Please enter a valid phone number', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone, name })
        });
        const user = await response.json();

        localStorage.setItem('kidvanaUser', JSON.stringify(user));
        showToast('Login successful! Welcome back 🎉', 'success');
        closeLoginModal();
        checkAuthState();
    } catch (err) {
        showToast('Login failed. Please try again.', 'error');
        console.error(err);
    }
}

async function handleSignup(e) {
    e.preventDefault();
    const name = document.getElementById('signupName')?.value;
    const phone = document.getElementById('signupPhone')?.value;

    if (!name || !phone || phone.length < 10) {
        showToast('Please fill all fields correctly', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, phone })
        });
        const user = await response.json();

        localStorage.setItem('kidvanaUser', JSON.stringify(user));
        showToast('Account created successfully! 🎉', 'success');
        closeLoginModal();
        checkAuthState();
    } catch (err) {
        showToast('Signup failed. Please try again.', 'error');
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

// Close on overlay click
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
        closeLoginModal();
    }
});

// Close on Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLoginModal();
});
