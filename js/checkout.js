const API_BASE_URL = '/api';
const SHIPROCKET_METHOD = 'shiprocket';
let checkoutInProgress = false;

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
    selectPayment(checkoutData.payment);
    showSection('Shipping');

    const sellerDomainField = document.getElementById('sellerDomain');
    if (sellerDomainField) {
        sellerDomainField.value = window.location.host;
    }
});

function getCheckoutItems() {
    return getCart().map(item => ({
        id: String(item.id),
        productId: String(item.id),
        name: item.name,
        brand: item.brand || '',
        price: Number(item.price) || 0,
        mrp: Number(item.mrp) || 0,
        image: item.image || '',
        qty: Number(item.qty) || 1,
        quantity: Number(item.qty) || 1
    }));
}

function calculateCheckoutTotals(items = getCheckoutItems(), paymentMethod = checkoutData.payment) {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    let shipping = 0;
    if (paymentMethod === 'cod') {
        shipping = 150; // COD is always ₹150
    } else {
        shipping = subtotal >= 1000 ? 0 : 150; // ₹150 below ₹1000 for prepaid
    }

    const tax = Math.round(subtotal * 0.18);
    const total = subtotal + shipping + tax;

    return { subtotal, shipping, tax, total };
}

function buildShiprocketCheckoutRef() {
    return `src_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function buildShiprocketRedirectUrl(checkoutRef) {
    const redirectUrl = new URL('order-success.html', window.location.href);
    redirectUrl.searchParams.set('checkout', 'shiprocket');
    redirectUrl.searchParams.set('ref', checkoutRef);
    return redirectUrl.toString();
}

function collectShippingForm() {
    return {
        name: document.getElementById('shipName')?.value.trim() || '',
        email: document.getElementById('shipEmail')?.value.trim() || '',
        phone: document.getElementById('shipPhone')?.value.trim() || '',
        address: document.getElementById('shipAddress')?.value.trim() || '',
        city: document.getElementById('shipCity')?.value.trim() || '',
        state: document.getElementById('shipState')?.value.trim() || '',
        zip: document.getElementById('shipZip')?.value.trim() || ''
    };
}

function initShippingForm() {
    const form = document.getElementById('shippingForm');
    if (!form) return;

    const user = getAuthUser();
    if (user) {
        document.getElementById('shipName').value = user.name || '';
        document.getElementById('shipPhone').value = user.phone || '';
        document.getElementById('shipEmail').value = user.email || '';
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        if (!form.reportValidity()) {
            return;
        }

        checkoutData.shipping = collectShippingForm();
        showSection('Payment');
    });
}

function showSection(step) {
    document.querySelectorAll('.checkout-section').forEach(section => {
        section.style.display = 'none';
    });

    document.querySelectorAll('.step').forEach(stepEl => {
        stepEl.classList.remove('active', 'completed');
    });

    const section = document.getElementById(`section${step}`);
    if (section) {
        section.style.display = 'block';
    }

    const steps = ['Shipping', 'Payment', 'Review'];
    const currentIndex = steps.indexOf(step);

    steps.forEach((stepName, index) => {
        const stepElement = document.getElementById(`step${index + 1}`);
        if (!stepElement) return;

        if (index < currentIndex) stepElement.classList.add('completed');
        if (index === currentIndex) stepElement.classList.add('active');
    });

    if (step === 'Review') {
        renderOrderReview();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function selectPayment(method) {
    if (method === 'cod') {
        const state = (checkoutData.shipping.state || '').trim().toLowerCase();
        if (state !== 'delhi') {
            showToast('Cash on Delivery is available in Delhi only. Please use online payment.', 'error');
            // If they were already on another method, stay there. 
            // If we are initializing, we might need a default.
            if (checkoutData.payment === 'cod') {
                // If it was already COD but state changed, or initializing
                method = 'shiprocket';
            } else {
                return; // Don't change from current non-cod method
            }
        }
    }

    checkoutData.payment = method;
    document.querySelectorAll('.payment-option').forEach(option => {
        option.classList.toggle('active', option.dataset.method === method);
    });

    // Recalculate totals and update UI
    renderCheckoutSummary();
    if (document.getElementById('sectionReview').style.display === 'block') {
        renderOrderReview();
    }
}

function handlePaymentSubmit() {
    if (!checkoutData.shipping.name) {
        showToast('Please complete your shipping details first.', 'error');
        showSection('Shipping');
        return;
    }

    renderOrderReview();
    showSection('Review');
}

function renderCheckoutSummary() {
    const items = getCheckoutItems();
    checkoutData.totals = calculateCheckoutTotals(items);

    const container = document.getElementById('checkoutSummary');
    if (!container) return;

    container.innerHTML = `
        <div style="display:flex; justify-content:space-between; margin-bottom:12px;">
            <span>Subtotal (${items.length} items)</span>
            <span>Rs.${checkoutData.totals.subtotal.toLocaleString()}</span>
        </div>
        <div style="display:flex; justify-content:space-between; margin-bottom:12px;">
            <span>Shipping</span>
            <span style="color:${checkoutData.totals.shipping === 0 ? 'var(--accent-green)' : 'inherit'}">
                ${checkoutData.totals.shipping === 0 ? 'FREE' : 'Rs.' + checkoutData.totals.shipping}
            </span>
        </div>
        <div style="display:flex; justify-content:space-between; margin-bottom:12px;">
            <span>GST (18%)</span>
            <span>Rs.${checkoutData.totals.tax.toLocaleString()}</span>
        </div>
        <hr style="border:0; border-top:1px solid var(--gray-100); margin:16px 0;">
        <div style="display:flex; justify-content:space-between; font-weight:800; font-size:1.2rem; color:var(--primary);">
            <span>Order Total</span>
            <span>Rs.${checkoutData.totals.total.toLocaleString()}</span>
        </div>
    `;
}

function renderOrderReview() {
    const summary = document.getElementById('reviewSummary');
    const itemsContainer = document.getElementById('reviewItems');
    const items = getCheckoutItems();

    if (summary) {
        summary.innerHTML = `
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px;">
                <div style="padding:16px; background:var(--gray-50); border-radius:12px;">
                    <h4 style="margin-bottom:8px;">Shipping To</h4>
                    <p style="font-size:0.85rem; color:var(--gray-600); line-height:1.5;">
                        <strong>${checkoutData.shipping.name}</strong><br>
                        ${checkoutData.shipping.address}<br>
                        ${checkoutData.shipping.city}, ${checkoutData.shipping.state} ${checkoutData.shipping.zip}<br>
                        Phone: ${checkoutData.shipping.phone}
                    </p>
                </div>
                <div style="padding:16px; background:var(--gray-50); border-radius:12px;">
                    <h4 style="margin-bottom:8px;">Payment</h4>
                    <p style="font-size:0.85rem; color:var(--gray-600);">
                        Method: <strong style="text-transform:uppercase;">${checkoutData.payment}</strong><br>
                        Status: <span style="color:var(--accent-yellow)">${checkoutData.payment === 'cod' ? 'Pay on delivery' : checkoutData.payment === SHIPROCKET_METHOD ? 'Secure Shiprocket popup will open next' : 'Pending confirmation'}</span>
                    </p>
                </div>
            </div>
        `;
    }

    if (itemsContainer) {
        itemsContainer.innerHTML = `<h4 style="margin:24px 0 12px;">Items (${items.length})</h4>` + items.map(item => `
            <div style="display:flex; gap:12px; margin-bottom:12px; padding-bottom:12px; border-bottom:1px solid var(--gray-50);">
                <div style="width:56px; height:56px; border-radius:8px; overflow:hidden; background:var(--gray-50); flex-shrink:0;">
                    <img src="${item.image}" alt="${item.name}" style="width:100%; height:100%; object-fit:cover;">
                </div>
                <div style="flex:1;">
                    <div style="font-size:0.85rem; font-weight:600;">${item.name}</div>
                    <div style="font-size:0.75rem; color:var(--gray-400);">Qty: ${item.quantity} x Rs.${item.price.toLocaleString()}</div>
                </div>
                <div style="font-weight:700;">Rs.${(item.price * item.quantity).toLocaleString()}</div>
            </div>
        `).join('');
    }
}

function setCheckoutBusy(isBusy) {
    checkoutInProgress = isBusy;
    const button = document.getElementById('placeOrderBtn');
    if (!button) return;

    button.disabled = isBusy;
    button.textContent = isBusy
        ? (checkoutData.payment === SHIPROCKET_METHOD ? 'Opening Checkout...' : 'Placing Order...')
        : 'Place Order';
}

function persistCompletedOrder(savedOrder, orderInfo) {
    return saveOrder({
        ...savedOrder,
        items: orderInfo.items,
        address: orderInfo.address,
        amount: orderInfo.amount,
        paymentMethod: orderInfo.paymentMethod,
        paymentStatus: orderInfo.paymentMethod === 'cod' ? 'Pending' : 'Paid',
        totals: checkoutData.totals,
        userPhone: orderInfo.address.phone
    });
}

async function verifyOrderPayment(payload) {
    const response = await fetch(`${API_BASE_URL}/orders/verify-payment`, {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(payload)
    });

    return parseApiResponse(response);
}

async function createShiprocketAccessToken(payload) {
    const response = await fetch(`${API_BASE_URL}/shiprocket/access-token/checkout`, {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(payload)
    });

    return parseApiResponse(response);
}

function launchShiprocketCheckout(event, token, redirectUrl) {
    const checkoutLauncher = window.HeadlessCheckout;
    if (!checkoutLauncher || typeof checkoutLauncher.addToCart !== 'function') {
        throw new Error('Shiprocket checkout script failed to load.');
    }

    checkoutLauncher.addToCart(event, token, { fallbackUrl: redirectUrl });
    
    // Fix position via JS after launch
    if (typeof fixShiprocketPosition === 'function') {
        fixShiprocketPosition();
    }
}

async function placeOrder(event) {
    if (checkoutInProgress) return;

    const user = getAuthUser();
    const requiresAuthenticatedCheckout = checkoutData.payment !== SHIPROCKET_METHOD;
    if (requiresAuthenticatedCheckout && !user?.token) {
        showToast('Please login to place your order.', 'error');
        openLoginModal();
        return;
    }

    const items = getCheckoutItems();
    if (!items.length) {
        showToast('Your cart is empty.', 'error');
        return;
    }

    if (!checkoutData.shipping.name) {
        const form = document.getElementById('shippingForm');
        if (!form?.reportValidity()) {
            showSection('Shipping');
            return;
        }
        checkoutData.shipping = collectShippingForm();
    }

    checkoutData.totals = calculateCheckoutTotals(items);

    const orderInfo = {
        userId: user?._id || user?.phone || checkoutData.shipping.phone || 'shiprocket-guest',
        items,
        amount: checkoutData.totals.total,
        address: checkoutData.shipping,
        paymentMethod: checkoutData.payment,
        totals: checkoutData.totals
    };

    try {
        setCheckoutBusy(true);

        if (checkoutData.payment === 'cod') {
            const result = await verifyOrderPayment({ orderInfo });
            const localOrder = persistCompletedOrder(result.order, orderInfo);
            localStorage.removeItem('kidvana_cart');
            window.location.href = `order-success.html?id=${encodeURIComponent(localOrder.id)}`;
            return;
        }

        if (checkoutData.payment === SHIPROCKET_METHOD) {
            const checkoutRef = buildShiprocketCheckoutRef();
            const redirectUrl = buildShiprocketRedirectUrl(checkoutRef);

            if (typeof ensureShiprocketSellerDomain === 'function') {
                ensureShiprocketSellerDomain();
            }

            if (typeof ensureShiprocketCheckoutAssets === 'function') {
                await ensureShiprocketCheckoutAssets();
            }

            const shiprocketResponse = await createShiprocketAccessToken({
                cart_data: {
                    items: items.map(item => ({
                        variant_id: String(item.productId || item.id || ''),
                        quantity: Number(item.quantity || item.qty || 1),
                        price: Number(item.price || 0),
                        title: String(item.name || 'Product'),
                        sku: String(item.productId || item.id || ''),
                        image_url: String(item.image || '')
                    }))
                },
                redirect_url: redirectUrl,
                timestamp: Math.floor(Date.now() / 1000),
                seller_domain: window.location.origin
            });

            if (!shiprocketResponse?.token) {
                throw new Error('Shiprocket token was not returned.');
            }

            savePendingShiprocketCheckout({
                ref: checkoutRef,
                orderId: shiprocketResponse.orderId || '',
                orderInfo,
                redirectUrl,
                source: SHIPROCKET_METHOD
            });

            launchShiprocketCheckout(event || window.event, shiprocketResponse.token, redirectUrl);
            setCheckoutBusy(false);
            return;
        }

        const orderResponse = await fetch(`${API_BASE_URL}/orders/create-order`, {
            method: 'POST',
            headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify(orderInfo)
        });
        const rzpOrder = await parseApiResponse(orderResponse);

        if (rzpOrder.isMock || !rzpOrder.publicKey) {
            const result = await verifyOrderPayment({
                razorpay_order_id: rzpOrder.id,
                razorpay_payment_id: `pay_mock_${Date.now()}`,
                razorpay_signature: 'mock_signature',
                orderInfo
            });
            const localOrder = persistCompletedOrder(result.order, orderInfo);
            localStorage.removeItem('kidvana_cart');
            showToast('Razorpay keys are not configured yet. Test order completed.', 'info');
            window.location.href = `order-success.html?id=${encodeURIComponent(localOrder.id)}`;
            return;
        }

        if (typeof window.Razorpay !== 'function') {
            throw new Error('Payment gateway failed to load. Please try Cash on Delivery.');
        }

        const razorpay = new window.Razorpay({
            key: rzpOrder.publicKey,
            amount: rzpOrder.amount,
            currency: rzpOrder.currency,
            name: 'Kidvana',
            description: 'Order Payment',
            order_id: rzpOrder.id,
            prefill: {
                name: checkoutData.shipping.name,
                email: checkoutData.shipping.email,
                contact: checkoutData.shipping.phone
            },
            theme: { color: '#E43434' },
            modal: {
                ondismiss: () => {
                    setCheckoutBusy(false);
                    showToast('Payment cancelled.', 'info');
                }
            },
            handler: async (paymentResponse) => {
                try {
                    const result = await verifyOrderPayment({
                        ...paymentResponse,
                        orderInfo
                    });
                    const localOrder = persistCompletedOrder(result.order, orderInfo);
                    localStorage.removeItem('kidvana_cart');
                    window.location.href = `order-success.html?id=${encodeURIComponent(localOrder.id)}`;
                } catch (err) {
                    setCheckoutBusy(false);
                    showToast(err.message || 'Payment verification failed.', 'error');
                }
            }
        });

        razorpay.open();
    } catch (err) {
        console.error(err);
        showToast(err.message || 'Failed to place order.', 'error');
        setCheckoutBusy(false);
        return;
    }

    if (checkoutData.payment !== 'razorpay' && checkoutData.payment !== SHIPROCKET_METHOD) {
        setCheckoutBusy(false);
    }
}
