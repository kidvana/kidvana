const axios = require('axios');
const crypto = require('crypto');
require('dotenv').config();

const SHIPROCKET_API_KEY = process.env.SHIPROCKET_CHECKOUT_API_KEY;
const SHIPROCKET_SECRET_KEY = process.env.SHIPROCKET_CHECKOUT_SECRET_KEY;

function sortObject(obj) {
    if (typeof obj !== 'object' || obj === null) return obj;
    if (Array.isArray(obj)) return obj.map(sortObject);
    return Object.keys(obj).sort().reduce((acc, key) => {
        acc[key] = sortObject(obj[key]);
        return acc;
    }, {});
}

async function test() {
    const rawPayload = {
        cart_data: {
            items: [{
                variant_id: 'test',
                quantity: 1,
                price: 100,
                title: 'Test Product'
            }]
        },
        redirect_url: 'http://localhost:5000/order-success.html',
        timestamp: Math.floor(Date.now() / 1000),
        seller_domain: 'localhost'
    };

    const payload = rawPayload;

    const signature = crypto
        .createHmac('sha256', SHIPROCKET_SECRET_KEY)
        .update(JSON.stringify(payload))
        .digest('base64');

    try {
        const response = await axios.post(
            'https://checkout-api.shiprocket.com/api/v1/access-token/checkout',
            payload,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Api-Key': SHIPROCKET_API_KEY,
                    'X-Api-HMAC-SHA256': signature
                }
            }
        );
        console.log('SUCCESS:', response.data);
    } catch (err) {
        console.error('ERROR:', err.response?.status, err.response?.data || err.message);
    }
}

test();
