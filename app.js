require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads'));
app.use(express.static(__dirname));

let isConnected = false;
mongoose.set('bufferCommands', false);
let mongoConnectionPromise = null;

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/kidvana';
const maskedUri = mongoUri.replace(/\/\/.*@/, '//****:****@');

function ensureMongoConnection() {
    if (mongoose.connection.readyState === 1) {
        isConnected = true;
        return Promise.resolve();
    }

    if (!mongoConnectionPromise) {
        mongoConnectionPromise = mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 2000,
            connectTimeoutMS: 5000
        })
            .then(() => {
                console.log('MongoDB connected successfully to:', maskedUri);
                isConnected = true;
            })
            .catch(err => {
                console.error('MongoDB connection failed!');
                console.error('URI:', maskedUri);
                console.error('Error:', err.message);
                console.warn('Using comprehensive mock data fallback for frontend display.');
                isConnected = false;
            })
            .finally(() => {
                mongoConnectionPromise = null;
            });
    }

    return mongoConnectionPromise;
}

ensureMongoConnection();

// Shiprocket variant ID map — used when MongoDB is not connected
const SHIPROCKET_VARIANT_MAP = {
    'mock201': '274443330',
    'mock202': '274443331',
    'mock203': '274443332',
    'mock204': '274443334',
    'mock205': '274443335',
    'mock301': '274443348',
    'mock302': '274443346',
    'mock303': '274443344',
    'mock304': '274443345',
    'mock401': '274443340',
};

const MOCK_PRODUCTS = [
    {
        _id: 'mock201',
        name: 'Classic Ethnic Wear Set',
        brand: 'GenZe Kids',
        category: 'baby-kids',
        price: 1299,
        mrp: 1999,
        image: 'assets/kids-fashion/K01.jpeg',
        images: ['assets/kids-fashion/K01.jpeg'],
        rating: 4.9,
        reviews: 156,
        tags: ['new', 'festival', 'bestseller'],
        color: '#FFE4E1',
        shiprocketVariantId: '274443330',
        description: 'Vibrant ethnic wear set, perfect for festive celebrations and special occasions.'
    },
    {
        _id: 'mock202',
        name: 'Designer Kurta Set',
        brand: 'GenZe Kids',
        category: 'baby-kids',
        price: 899,
        mrp: 1499,
        image: 'assets/kids-fashion/K02.jpeg',
        images: ['assets/kids-fashion/K02.jpeg'],
        rating: 4.6,
        reviews: 92,
        tags: ['casual', 'trending'],
        color: '#E0F2F1',
        shiprocketVariantId: '274443331',
        description: 'Stylish and soft cotton kurta set for everyday comfort and small gatherings.'
    },
    {
        _id: 'mock203',
        name: 'Festive Party Dress',
        brand: 'GenZe Kids',
        category: 'baby-kids',
        price: 1599,
        mrp: 2499,
        image: 'assets/kids-fashion/K03.jpeg',
        images: ['assets/kids-fashion/K03.jpeg'],
        rating: 4.8,
        reviews: 110,
        tags: ['party', 'elegant', 'trending'],
        color: '#FFF9C4',
        shiprocketVariantId: '274443332',
        description: 'Elegant party dress featuring premium fabric and comfortable fit for kids.'
    },
    {
        _id: 'mock204',
        name: 'Toddler Playwear Set',
        brand: 'PlayTime',
        category: 'baby-kids',
        price: 499,
        mrp: 999,
        image: 'assets/kids-fashion/K04.jpeg',
        images: ['assets/kids-fashion/K04.jpeg'],
        rating: 4.5,
        reviews: 240,
        tags: ['daily', 'soft', 'deal'],
        color: '#E8F5E9',
        shiprocketVariantId: '274443334',
        description: 'Breathable and soft cotton playwear set for toddlers, ideal for all-day play.'
    },
    {
        _id: 'mock205',
        name: 'Traditional Sherwani',
        brand: 'GenZe Kids',
        category: 'baby-kids',
        price: 1899,
        mrp: 3499,
        image: 'assets/kids-fashion/K05.jpeg',
        images: ['assets/kids-fashion/K05.jpeg'],
        rating: 4.9,
        reviews: 74,
        tags: ['royal', 'premium', 'bestseller'],
        color: '#F3E5F5',
        shiprocketVariantId: '274443335',
        description: 'Exquisite traditional sherwani set for a royal touch to festive celebrations.'
    },
    {
        _id: 'mock206',
        name: 'Casual Western Set',
        brand: 'GenZe Kids',
        category: 'baby-kids',
        price: 799,
        mrp: 1499,
        image: 'assets/kids-fashion/K06.jpeg',
        images: ['assets/kids-fashion/K06.jpeg'],
        rating: 4.6,
        reviews: 88,
        tags: ['casual', 'trending'],
        color: '#E0F2F1',
        shiprocketVariantId: '274443339',
        description: 'Comfortable and stylish western wear set for kids everyday casual outings.'
    },
    {
        _id: 'mock207',
        name: 'Floral Print Dress',
        brand: 'GenZe Kids',
        category: 'baby-kids',
        price: 699,
        mrp: 1299,
        image: 'assets/kids-fashion/K07.jpeg',
        images: ['assets/kids-fashion/K07.jpeg'],
        rating: 4.7,
        reviews: 134,
        tags: ['floral', 'trending', 'deal'],
        color: '#FCE4EC',
        shiprocketVariantId: '274443340',
        description: 'Beautiful floral print dress for girls, perfect for summer and spring occasions.'
    },
    {
        _id: 'mock208',
        name: 'Baby Boy Festive Suit',
        brand: 'GenZe Kids',
        category: 'baby-kids',
        price: 1399,
        mrp: 2499,
        image: 'assets/kids-fashion/K08.jpeg',
        images: ['assets/kids-fashion/K08.jpeg'],
        rating: 4.8,
        reviews: 96,
        tags: ['party', 'elegant', 'bestseller'],
        color: '#E3F2FD',
        shiprocketVariantId: '274443341',
        description: 'Dapper festive suit for baby boys, ideal for weddings and special celebrations.'
    },
    {
        _id: 'mock209',
        name: 'Premium Cotton Kurta',
        brand: 'GenZe Kids',
        category: 'baby-kids',
        price: 999,
        mrp: 1799,
        image: 'assets/kids-fashion/K09.jpeg',
        images: ['assets/kids-fashion/K09.jpeg'],
        rating: 4.7,
        reviews: 112,
        tags: ['premium', 'bestseller'],
        color: '#FFF8E1',
        shiprocketVariantId: '274443344',
        description: 'Premium pure cotton kurta for kids, breathable and perfect for daily ethnic wear.'
    },
    {
        _id: 'mock210',
        name: 'Embroidered Party Wear',
        brand: 'GenZe Kids',
        category: 'baby-kids',
        price: 1699,
        mrp: 2999,
        image: 'assets/kids-fashion/K10.jpeg',
        images: ['assets/kids-fashion/K10.jpeg'],
        rating: 4.9,
        reviews: 68,
        tags: ['party', 'premium', 'trending'],
        color: '#F3E5F5',
        shiprocketVariantId: '274443345',
        description: 'Beautifully embroidered party wear for kids, crafted for special occasions.'
    },
    {
        _id: 'mock211',
        name: 'Summer Shorts Set',
        brand: 'PlayTime',
        category: 'baby-kids',
        price: 599,
        mrp: 999,
        image: 'assets/kids-fashion/K11.jpeg',
        images: ['assets/kids-fashion/K11.jpeg'],
        rating: 4.5,
        reviews: 178,
        tags: ['casual', 'daily', 'deal'],
        color: '#E8F5E9',
        shiprocketVariantId: '274443346',
        description: 'Light and comfortable summer shorts set for active kids who love to play.'
    },
    {
        _id: 'mock301',
        name: 'Interactive Learning Toy',
        brand: 'SmartPlay',
        category: 'toys',
        price: 349,
        mrp: 699,
        image: 'assets/toys/T 01.jpg',
        images: ['assets/toys/T 01.jpg'],
        rating: 4.7,
        reviews: 312,
        tags: ['learning', 'interactive', 'deal'],
        color: '#FFECB3',
        shiprocketVariantId: '274443348',
        description: 'Engaging spinner toy designed to improve sensory development and motor skills.'
    }
];

const productRoutes = require('./routes/products');
const authRoutes = require('./routes/auth');
const orderRoutes = require('./routes/orders');
const shiprocketRoutes = require('./routes/shiprocket');

app.use((req, res, next) => {
    req.isConnected = isConnected;
    req.mockProducts = MOCK_PRODUCTS;
    next();
});

app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/shiprocket', shiprocketRoutes);

module.exports = app;
