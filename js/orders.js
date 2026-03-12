// ═══════════════════════════════════════════════
// ORDERS — Order Management and History
// ═══════════════════════════════════════════════

const ORDERS_KEY = 'kidvanaOrders';

function saveOrder(order) {
    const orders = getAllOrders();
    orders.unshift(order); // Newest first
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    return order;
}

function getAllOrders() {
    return JSON.parse(localStorage.getItem(ORDERS_KEY)) || [];
}

function getOrderById(id) {
    return getAllOrders().find(o => o.id === id);
}

function generateOrderId() {
    return 'GZL-' + Math.random().toString(36).substr(2, 9).toUpperCase();
}

function createOrder(cartItems, shippingInfo, paymentMethod, totals) {
    const order = {
        id: generateOrderId(),
        date: new Date().toISOString(),
        items: cartItems,
        shipping: shippingInfo,
        payment: {
            method: paymentMethod,
            status: 'Paid'
        },
        totals: totals,
        status: 'Processing',
        trackingNumber: 'TRK' + Math.floor(Math.random() * 1000000000)
    };
    return saveOrder(order);
}
