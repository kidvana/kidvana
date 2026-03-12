// ═══════════════════════════════════════════════
// CHECKOUT — Multi-step Flow Logic
// ═══════════════════════════════════════════════

let checkoutData = {
    shipping: {},
    payment: 'cod',
    totals: {}
};

document.addEventListener('DOMContentLoaded', () => {
    const cart = getCart();
    if (cart.length === 0) {
        window.location.href = 'index.html';
        return;
    }
    renderCheckoutSummary();
    initShippingForm();
});

function initShippingForm() {
    const form = document.getElementById('shippingForm');
    if (!form) return;

    // Prefill if logged in
    const user = JSON.parse(localStorage.getItem('kidvanaUser'));
    if (user) {
        document.getElementById('shipName').value = user.name || '';
        document.getElementById('shipPhone').value = user.phone || '';
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        checkoutData.shipping = {
            name: document.getElementById('shipName').value,
            email: document.getElementById('shipEmail').value,
            phone: document.getElementById('shipPhone').value,
            address: document.getElementById('shipAddress').value,
            city: document.getElementById('shipCity').value,
            zip: document.getElementById('shipZip').value
        };
        showSection('Payment');
    });
}

function showSection(step) {
    // Hide all
    document.querySelectorAll('.checkout-section').forEach(s => s.style.display = 'none');
    document.querySelectorAll('.step-item').forEach(s => s.classList.remove('active', 'completed'));

    // Show target
    document.getElementById(`section${step}`).style.display = 'block';

    // Update stepper
    const steps = ['Shipping', 'Payment', 'Review'];
    const currentIdx = steps.indexOf(step);

    steps.forEach((s, i) => {
        const el = document.getElementById(`step${i + 1}`);
        if (i < currentIdx) el.classList.add('completed');
        if (i === currentIdx) el.classList.add('active');
    });

    if (step === 'Review') renderOrderReview();
    window.scrollTo(0, 0);
}

function selectPayment(method) {
    checkoutData.payment = method;
    document.querySelectorAll('.payment-option').forEach(opt => opt.classList.remove('active'));
    document.getElementById(`pay${method.toUpperCase()}`).checked = true;
    document.getElementById(`pay${method.toUpperCase()}`).closest('.payment-option').classList.add('active');

    const cardDetails = document.getElementById('cardDetails');
    if (cardDetails) cardDetails.style.display = method === 'card' ? 'block' : 'none';
}

function handlePaymentSubmit() {
    if (!checkoutData.payment) {
        showToast('Please select a payment method', 'error');
        return;
    }
    showSection('Review');
}

function renderCheckoutSummary() {
    const cart = getCart();
    const subtotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
    const shipping = subtotal > 499 ? 0 : 40;
    const tax = Math.round(subtotal * 0.18);
    const total = subtotal + shipping + tax;

    checkoutData.totals = { subtotal, shipping, tax, total };

    const container = document.getElementById('checkoutSummary');
    if (!container) return;

    container.innerHTML = `
        <div style="display:flex; justify-content:space-between; margin-bottom:12px;">
            <span>Subtotal (${cart.length} items)</span>
            <span>₹${subtotal.toLocaleString()}</span>
        </div>
        <div style="display:flex; justify-content:space-between; margin-bottom:12px;">
            <span>Shipping</span>
            <span style="color:${shipping === 0 ? 'var(--accent-green)' : 'inherit'}">${shipping === 0 ? 'FREE' : '₹' + shipping}</span>
        </div>
        <div style="display:flex; justify-content:space-between; margin-bottom:12px;">
            <span>GST (18%)</span>
            <span>₹${tax.toLocaleString()}</span>
        </div>
        <hr style="border:0; border-top:1px solid var(--gray-100); margin:16px 0;">
        <div style="display:flex; justify-content:space-between; font-weight:800; font-size:1.2rem; color:var(--primary);">
            <span>Order Total</span>
            <span>₹${total.toLocaleString()}</span>
        </div>
    `;
}

function renderOrderReview() {
    const summary = document.getElementById('reviewSummary');
    if (!summary) return;

    summary.innerHTML = `
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px;">
            <div style="padding:16px; background:var(--gray-50); border-radius:12px;">
                <h4 style="margin-bottom:8px;">📍 Shipping To</h4>
                <p style="font-size:0.85rem; color:var(--gray-600); line-height:1.5;">
                    <strong>${checkoutData.shipping.name}</strong><br>
                    ${checkoutData.shipping.address}<br>
                    ${checkoutData.shipping.city}, ${checkoutData.shipping.zip}<br>
                    📞 ${checkoutData.shipping.phone}
                </p>
            </div>
            <div style="padding:16px; background:var(--gray-50); border-radius:12px;">
                <h4 style="margin-bottom:8px;">💳 Payment</h4>
                <p style="font-size:0.85rem; color:var(--gray-600);">
                    Method: <strong style="text-transform:uppercase;">${checkoutData.payment}</strong><br>
                    Status: <span style="color:var(--accent-orange)">Pending Verification</span>
                </p>
            </div>
        </div>
    `;

    const itemsContainer = document.getElementById('reviewItems');
    if (itemsContainer) {
        const cart = getCart();
        itemsContainer.innerHTML = `<h4 style="margin: 24px 0 12px;">Items (${cart.length})</h4>` +
            cart.map(item => `
            <div style="display:flex; gap:12px; margin-bottom:12px; padding-bottom:12px; border-bottom:1px solid var(--gray-50);">
                <div style="width:50px; height:50px; background:${item.product.color}; border-radius:8px; display:flex; align-items:center; justify-content:center;">
                    <img src="${item.product.image}" style="max-height:30px;">
                </div>
                <div style="flex:1;">
                    <div style="font-size:0.85rem; font-weight:600;">${item.product.name}</div>
                    <div style="font-size:0.75rem; color:var(--gray-400);">Qty: ${item.quantity} × ₹${item.product.price.toLocaleString()}</div>
                </div>
                <div style="font-weight:700;">₹${(item.product.price * item.quantity).toLocaleString()}</div>
            </div>
        `).join('');
    }
}

const API_BASE_URL = 'http://localhost:5000/api';

async function placeOrder() {
    const user = JSON.parse(localStorage.getItem('kidvanaUser'));
    if (!user) {
        showToast('Please login to place order', 'error');
        openLoginModal();
        return;
    }

    const cart = getCart();
    const total = getCartTotal();
    const address = {
        name: document.getElementById('name').value,
        phone: document.getElementById('phone').value,
        address: document.getElementById('address').value,
        city: document.getElementById('city').value,
        state: document.getElementById('state').value,
        zip: document.getElementById('pincode').value
    };

    if (!address.address || !address.city) {
        showToast('Please fill shipping details', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/orders/create-order`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                amount: total,
                userId: user._id || user.phone, // fallback for mock
                items: cart,
                address: address
            })
        });
        const rzpOrder = await response.json();

        // Initialize Razorpay (Structure only for now)
        const options = {
            key: "your_razorpay_key",
            amount: rzpOrder.amount,
            currency: "INR",
            name: "Kidvana",
            description: "Order Payment",
            order_id: rzpOrder.id,
            handler: async function (response) {
                const verifyRes = await fetch(`${API_BASE_URL}/orders/verify-payment`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(response)
                });
                const result = await verifyRes.json();
                if (result.status === 'success') {
                    localStorage.removeItem('kidvana_cart');
                    window.location.href = 'order-success.html?id=' + result.order._id;
                }
            }
        };

        // Structure ready, but real script needs to be loaded in HTML
        showToast('Order structure created! (Payment integration needs script)', 'info');
        console.log('Razorpay Options:', options);
    } catch (err) {
        console.error(err);
        showToast('Failed to create order', 'error');
    }
}
