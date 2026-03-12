require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads'));
app.use(express.static(__dirname)); // Explicitly serve from the script's directory

// MongoDB Connection
let isConnected = false;
mongoose.set('bufferCommands', false); // Disable buffering so it fails fast

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/kidvana';
// Masking URI for safer logging
const maskedUri = mongoUri.replace(/\/\/.*@/, '//****:****@');

mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 2000,
    connectTimeoutMS: 5000
})
    .then(() => {
        console.log('✅ MongoDB connected successfully to:', maskedUri);
        isConnected = true;
    })
    .catch(err => {
        console.error('❌ MongoDB connection failed!');
        console.error('URI:', maskedUri);
        console.error('Error:', err.message);
        console.warn('⚠️ Using comprehensive mock data fallback for frontend display.');
        isConnected = false;
    });

// Mock Data for Fallback (Consistent with js/products.js FALLBACK_PRODUCTS)
const MOCK_PRODUCTS = [
    {
        _id: 'mock101',
        name: 'Smart Tech Accessory',
        brand: 'GenZe Tech',
        category: 'electronics',
        price: 1499,
        mrp: 2999,
        image: 'assets/electronics/P 01.jpg',
        images: ['assets/electronics/P 01.jpg', 'assets/electronics/P 01.1.jpg', 'assets/electronics/P 01.2.jpg'],
        rating: 4.7,
        reviews: 85,
        tags: ['new', 'gadget', 'bestseller'],
        color: '#F1F1F1',
        description: 'Advanced smart accessory for modern lifestyle efficiency and convenience.'
    },
    {
        _id: 'mock201',
        name: 'Designer Ethnic Wear Set',
        brand: 'GenZe Kids',
        category: 'baby-kids',
        price: 1299,
        mrp: 1999,
        image: 'assets/kids-fashion/K 01.jpg',
        images: ['assets/kids-fashion/K 01.jpg', 'assets/kids-fashion/K 01.1.jpg', 'assets/kids-fashion/K 01.2.jpg'],
        rating: 4.9,
        reviews: 156,
        tags: ['new', 'festival', 'bestseller'],
        color: '#FFE4E1',
        description: 'Vibrant ethnic wear set, perfect for festive celebrations and special occasions.'
    },
    {
        _id: 'mock202',
        name: 'Casual Blue Kurta Set',
        brand: 'GenZe Kids',
        category: 'baby-kids',
        price: 899,
        mrp: 1499,
        image: 'assets/kids-fashion/K 02.jpg',
        images: ['assets/kids-fashion/K 02.jpg', 'assets/kids-fashion/K 02.1.jpg'],
        rating: 4.6,
        reviews: 92,
        tags: ['casual', 'trending'],
        color: '#E0F2F1',
        description: 'Stylish and soft cotton kurta set for everyday comfort and small gatherings.'
    },
    {
        _id: 'mock203',
        name: 'Festive Party Dress',
        brand: 'GenZe Kids',
        category: 'baby-kids',
        price: 1599,
        mrp: 2499,
        image: 'assets/kids-fashion/K 03.jpg',
        images: ['assets/kids-fashion/K 03.jpg', 'assets/kids-fashion/K 03.1.jpg', 'assets/kids-fashion/K 03.2.jpg'],
        rating: 4.8,
        reviews: 110,
        tags: ['party', 'elegant', 'trending'],
        color: '#FFF9C4',
        description: 'Elegant party dress featuring premium fabric and comfortable fit for kids.'
    },
    {
        _id: 'mock204',
        name: 'Toddler Cotton Playwear',
        brand: 'PlayTime',
        category: 'baby-kids',
        price: 499,
        mrp: 999,
        image: 'assets/kids-fashion/K 04.jpg',
        images: ['assets/kids-fashion/K 04.jpg', 'assets/kids-fashion/K 04.1.jpg', 'assets/kids-fashion/K 04.2.jpg', 'assets/kids-fashion/K 04.3.jpg'],
        rating: 4.5,
        reviews: 240,
        tags: ['daily', 'soft', 'deal'],
        color: '#E8F5E9',
        description: 'Breathable and soft cotton playwear set for toddlers, ideal for all-day play.'
    },
    {
        _id: 'mock205',
        name: 'Traditional Sherwani Set',
        brand: 'GenZe Kids',
        category: 'baby-kids',
        price: 1899,
        mrp: 3499,
        image: 'assets/kids-fashion/K 05.jpg',
        images: ['assets/kids-fashion/K 05.jpg', 'assets/kids-fashion/K 05.1.jpg', 'assets/kids-fashion/K 05.2.jpg'],
        rating: 4.9,
        reviews: 74,
        tags: ['royal', 'premium', 'bestseller'],
        color: '#F3E5F5',
        description: 'Exquisite traditional sherwani set for a royal touch to festive celebrations.'
    },
    {
        _id: 'mock301',
        name: 'Interactive Learning Spinner',
        brand: 'SmartPlay',
        category: 'toys',
        price: 349,
        mrp: 699,
        image: 'assets/toys/T 01.jpg',
        images: ['assets/toys/T 01.jpg', 'assets/toys/T 01.1.jpg', 'assets/toys/T 01.2.jpg', 'assets/toys/T 01.3.jpg'],
        rating: 4.7,
        reviews: 312,
        tags: ['learning', 'interactive', 'deal'],
        color: '#FFECB3',
        description: 'Engaging spinner toy designed to improve sensory development and motor skills.'
    },
    {
        _id: 'mock302',
        name: 'Musical Rattle Toy Set',
        brand: 'Melody',
        category: 'toys',
        price: 599,
        mrp: 1299,
        image: 'assets/toys/T 02.jpg',
        images: ['assets/toys/T 02.jpg', 'assets/toys/T 02.1.jpg', 'assets/toys/T 02.2.jpg'],
        rating: 4.6,
        reviews: 185,
        tags: ['music', 'baby', 'trending'],
        color: '#D1C4E9',
        description: 'Colorful musical rattle set that introduces infants to delightful sounds.'
    },
    {
        _id: 'mock303',
        name: 'Educational Puzzle Blocks',
        brand: 'Brainy',
        category: 'toys',
        price: 799,
        mrp: 1599,
        image: 'assets/toys/T 03.jpg',
        images: ['assets/toys/T 03.jpg', 'assets/toys/T 03.1.jpg', 'assets/toys/T 03.2.jpg'],
        rating: 4.8,
        reviews: 215,
        tags: ['puzzle', 'smart', 'bestseller'],
        color: '#C8E6C9',
        description: 'Cognitive development puzzle blocks that encourage problem-solving and focus.'
    },
    {
        _id: 'mock304',
        name: 'Creative Building Blocks',
        brand: 'BuildIt',
        category: 'toys',
        price: 1199,
        mrp: 2499,
        image: 'assets/toys/T 04.jpg',
        images: ['assets/toys/T 04.jpg', 'assets/toys/T 04.1.jpg', 'assets/toys/T 04.2.jpg', 'assets/toys/T 04.3.jpg', 'assets/toys/T 04.4.jpg', 'assets/toys/T 04.5.jpg'],
        rating: 4.9,
        reviews: 420,
        tags: ['creative', 'bestseller', 'deal'],
        color: '#B3E5FC',
        description: 'Premium building blocks set for endless hours of creative play and construction.'
    },
    {
        _id: 'mock401',
        name: 'Elegant Designer Kurti',
        brand: 'GenZe Women',
        category: 'fashion',
        price: 1399,
        mrp: 2999,
        image: 'assets/women-fashion/W 01.jpg',
        images: ['assets/women-fashion/W 01.jpg', 'assets/women-fashion/W 01.1.jpg', 'assets/women-fashion/W 01.2.jpg'],
        rating: 4.8,
        reviews: 128,
        tags: ['new', 'ethnic', 'elegant', 'trending', 'bestseller'],
        color: '#FCE4EC',
        description: 'Sophisticated ethnic kurti featuring modern artistry and comfortable fit.'
    }
];

// Routes
const productRoutes = require('./routes/products');
const authRoutes = require('./routes/auth');
const orderRoutes = require('./routes/orders');

// Inject mock status into request
app.use((req, res, next) => {
    req.isConnected = isConnected;
    req.mockProducts = MOCK_PRODUCTS;
    next();
});

app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);

// app.get('/', (req, res) => {
//     res.send('Kidvana API is running...');
// });

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Prevent crash on unhandled errors
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

// Keep event loop alive if something is closing it unexpectedly
setInterval(() => {
    // Heartbeat
}, 60000);
