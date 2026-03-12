const API_BASE_URL = 'http://localhost:5000/api';

document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('kidvanaUser'));
    if (!user) {
        window.location.href = 'index.html';
        return;
    }
    initDashboard();
});

async function initDashboard() {
    const user = JSON.parse(localStorage.getItem('kidvanaUser'));
    if (!user) return;

    // Fetch latest user data from server
    try {
        const response = await fetch(`${API_BASE_URL}/auth/profile/${user.phone}`);
        const userData = await response.json();

        // Update UI
        if (document.getElementById('userNameDisplay')) document.getElementById('userNameDisplay').textContent = `Welcome, ${userData.name}!`;
        if (document.getElementById('userPhoneDisplay')) document.getElementById('userPhoneDisplay').textContent = userData.phone;
        if (document.getElementById('userAvatar')) document.getElementById('userAvatar').textContent = userData.name.charAt(0).toUpperCase();

        // Fill form
        if (document.getElementById('setFullName')) document.getElementById('setFullName').value = userData.name;
        if (document.getElementById('setEmail')) document.getElementById('setEmail').value = userData.email || '';
        if (document.getElementById('setPhone')) document.getElementById('setPhone').value = userData.phone;

    } catch (err) {
        console.error('Error fetching profile:', err);
    }
}

document.getElementById('profileForm')?.addEventListener('submit', handleProfileUpdate);

async function handleProfileUpdate(e) {
    e.preventDefault();
    const phone = document.getElementById('setPhone').value;
    const name = document.getElementById('setFullName').value;
    const email = document.getElementById('setEmail').value;

    try {
        const response = await fetch(`${API_BASE_URL}/auth/profile`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, phone, email })
        });
        const updatedUser = await response.json();

        localStorage.setItem('kidvanaUser', JSON.stringify(updatedUser));
        showToast('Profile updated successfully! ✨', 'success');
        initDashboard();
    } catch (err) {
        showToast('Update failed. Try again.', 'error');
        console.error(err);
    }
}

function logoutUser() {
    localStorage.removeItem('kidvanaUser');
    window.location.href = 'index.html';
}
