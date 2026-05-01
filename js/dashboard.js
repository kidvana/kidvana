const API_BASE_URL = '/api';

document.addEventListener('DOMContentLoaded', () => {
    const user = getAuthUser();
    if (!user) {
        window.location.href = 'index.html';
        return;
    }

    initDashboard();
});

async function initDashboard() {
    const user = getAuthUser();
    if (!user) return;

    try {
        const response = await fetch(`${API_BASE_URL}/auth/profile`, {
            headers: getAuthHeaders()
        });
        const userData = await parseApiResponse(response);

        if (document.getElementById('userNameDisplay')) document.getElementById('userNameDisplay').textContent = `Welcome, ${userData.name}!`;
        if (document.getElementById('userPhoneDisplay')) document.getElementById('userPhoneDisplay').textContent = userData.phone;
        if (document.getElementById('userAvatar')) document.getElementById('userAvatar').textContent = userData.name.charAt(0).toUpperCase();
        if (document.getElementById('setFullName')) document.getElementById('setFullName').value = userData.name;
        if (document.getElementById('setEmail')) document.getElementById('setEmail').value = userData.email || '';
        if (document.getElementById('setPhone')) document.getElementById('setPhone').value = userData.phone;

        localStorage.setItem('kidvanaUser', JSON.stringify({
            ...user,
            ...userData
        }));
    } catch (err) {
        console.error('Error fetching profile:', err);
    }

    await loadOrders();
}

document.getElementById('profileForm')?.addEventListener('submit', handleProfileUpdate);

async function handleProfileUpdate(e) {
    e.preventDefault();

    const name = document.getElementById('setFullName').value.trim();
    const email = document.getElementById('setEmail').value.trim();

    try {
        const response = await fetch(`${API_BASE_URL}/auth/profile`, {
            method: 'PUT',
            headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify({ name, email })
        });
        const updatedUser = await parseApiResponse(response);

        localStorage.setItem('kidvanaUser', JSON.stringify({
            ...getAuthUser(),
            ...updatedUser
        }));
        showToast('Profile updated successfully!', 'success');
        initDashboard();
    } catch (err) {
        showToast(err.message || 'Update failed. Try again.', 'error');
        console.error(err);
    }
}

async function loadOrders() {
    let orders = [];

    try {
        const response = await fetch(`${API_BASE_URL}/orders/my-orders`, {
            headers: getAuthHeaders()
        });
        const apiOrders = await parseApiResponse(response);
        apiOrders.forEach(saveOrder);
        orders = getOrdersForCurrentUser();
    } catch (err) {
        orders = getOrdersForCurrentUser();
    }

    renderOrders(orders);
}

function renderOrders(orders) {
    const orderList = document.getElementById('orderList');
    if (!orderList) return;

    if (!orders.length) {
        orderList.innerHTML = `
            <div class="empty-state" style="padding:24px 0;">
                <h4>No orders yet</h4>
                <p style="color:var(--gray-500);margin:8px 0 20px;">Your recent orders will appear here after checkout.</p>
                <a href="index.html" class="btn btn-primary">Start Shopping</a>
            </div>
        `;
        return;
    }

    orderList.innerHTML = orders.map(order => `
        <div class="order-item">
            <div>
                <strong class="block">Order #${order.id}</strong>
                <span class="text-xs text-gray-400">Placed on ${new Date(order.date).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                })}</span>
            </div>
            <span class="order-status ${getOrderStatusClass(order.status)}">${order.status}</span>
            <div class="font-bold">Rs.${Number(order.totals?.total || order.amount || 0).toLocaleString()}</div>
        </div>
    `).join('');
}

function getOrderStatusClass(status = '') {
    const normalizedStatus = String(status).toLowerCase();
    if (normalizedStatus === 'delivered') return 'status-delivered';
    return 'status-processing';
}

function logoutUser() {
    if (typeof logout === 'function') {
        logout();
    } else {
        localStorage.removeItem('kidvanaUser');
        window.location.href = 'index.html';
    }
}
