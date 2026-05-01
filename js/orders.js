// Order persistence helpers for frontend views

const ORDERS_KEY = 'kidvanaOrders';
const SHIPROCKET_CHECKOUTS_KEY = 'kidvanaShiprocketCheckouts';

function normalizeStoredOrder(order) {
    const items = (order.items || []).map(item => ({
        productId: String(item.productId || item.id || ''),
        name: item.name || item.product?.name || 'Item',
        price: Number(item.price || item.product?.price || 0),
        quantity: Number(item.quantity || item.qty || 1),
        image: item.image || item.product?.image || ''
    }));

    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shippingCharge = Number(order.totals?.shipping ?? order.shippingCharge ?? 0);
    const tax = Number(order.totals?.tax ?? order.tax ?? 0);
    const total = Number(order.totals?.total ?? order.amount ?? subtotal + shippingCharge + tax);

    return {
        id: String(order.id || order._id || generateOrderId()),
        date: order.date || order.createdAt || new Date().toISOString(),
        items,
        shipping: order.shipping || order.address || {},
        payment: order.payment || {
            method: order.paymentMethod || 'cod',
            status: order.paymentStatus || (order.paymentId ? 'Paid' : 'Pending')
        },
        totals: order.totals || {
            subtotal,
            shipping: shippingCharge,
            tax,
            total
        },
        amount: total,
        status: order.status || 'Processing',
        trackingNumber: order.trackingNumber || ('TRK' + Math.floor(Math.random() * 1000000000)),
        userPhone: order.userPhone || order.shipping?.phone || order.address?.phone || '',
        checkoutSource: order.checkoutSource || 'storefront',
        shiprocketOrderId: order.shiprocketOrderId || ''
    };
}

function saveOrder(order) {
    const normalizedOrder = normalizeStoredOrder(order);
    const orders = getAllOrders().filter(existing => existing.id !== normalizedOrder.id);
    orders.unshift(normalizedOrder);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    return normalizedOrder;
}

function getAllOrders() {
    try {
        return (JSON.parse(localStorage.getItem(ORDERS_KEY)) || []).map(normalizeStoredOrder);
    } catch (err) {
        return [];
    }
}

function getOrderById(id) {
    return getAllOrders().find(order => String(order.id) === String(id));
}

function generateOrderId() {
    return 'KV-' + Math.random().toString(36).slice(2, 10).toUpperCase();
}

function createOrder(cartItems, shippingInfo, paymentMethod, totals, metadata = {}) {
    return saveOrder({
        ...metadata,
        items: cartItems,
        shipping: shippingInfo,
        paymentMethod,
        paymentStatus: paymentMethod === 'cod' ? 'Pending' : 'Paid',
        totals,
        amount: totals.total,
        status: paymentMethod === 'cod' ? 'Confirmed' : 'Paid'
    });
}

function getOrdersForCurrentUser() {
    const user = typeof getAuthUser === 'function' ? getAuthUser() : null;
    if (!user?.phone) return getAllOrders();

    return getAllOrders().filter(order => !order.userPhone || order.userPhone === user.phone);
}

function findStoredOrder(orderId, phone = '') {
    return getAllOrders().find(order => {
        const sameId = String(order.id) === String(orderId);
        const samePhone = !phone || order.userPhone === phone || order.shipping?.phone === phone;
        return sameId && samePhone;
    }) || null;
}

function getPendingShiprocketCheckouts() {
    try {
        return JSON.parse(localStorage.getItem(SHIPROCKET_CHECKOUTS_KEY)) || {};
    } catch (err) {
        return {};
    }
}

function savePendingShiprocketCheckout(checkout) {
    if (!checkout?.ref) return null;

    const entries = getPendingShiprocketCheckouts();
    entries[checkout.ref] = {
        ...checkout,
        createdAt: checkout.createdAt || new Date().toISOString()
    };
    localStorage.setItem(SHIPROCKET_CHECKOUTS_KEY, JSON.stringify(entries));
    return entries[checkout.ref];
}

function getPendingShiprocketCheckout(ref) {
    return getPendingShiprocketCheckouts()[ref] || null;
}

function removePendingShiprocketCheckout(ref) {
    if (!ref) return;

    const entries = getPendingShiprocketCheckouts();
    delete entries[ref];
    localStorage.setItem(SHIPROCKET_CHECKOUTS_KEY, JSON.stringify(entries));
}
