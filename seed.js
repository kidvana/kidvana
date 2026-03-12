require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

const products = [
    // Electronics
    {
        name: 'Smart Tech Accessory',
        brand: 'GenZe Tech',
        category: 'electronics',
        price: 1499,
        mrp: 2999,
        image: 'IMG DATA/Electronic Product IMG/P 01.jpg',
        images: ['IMG DATA/Electronic Product IMG/P 01.jpg', 'IMG DATA/Electronic Product IMG/P 01.1.jpg', 'IMG DATA/Electronic Product IMG/P 01.2.jpg'],
        rating: 4.7,
        reviews: 85,
        tags: ['new', 'gadget'],
        color: '#F1F1F1',
        description: 'Advanced smart accessory for modern lifestyle efficiency and convenience.'
    },
    // Kids Fashion
    {
        name: 'Designer Ethnic Wear Set',
        brand: 'GenZe Kids',
        category: 'baby-kids',
        price: 1299,
        mrp: 1999,
        image: 'IMG DATA/Kids IMG/K 01.jpg',
        images: ['IMG DATA/Kids IMG/K 01.jpg', 'IMG DATA/Kids IMG/K 01.1.jpg', 'IMG DATA/Kids IMG/K 01.2.jpg'],
        rating: 4.9,
        reviews: 156,
        tags: ['new', 'festival', 'bestseller'],
        color: '#FFE4E1',
        description: 'Vibrant ethnic wear set, perfect for festive celebrations and special occasions.'
    },
    {
        name: 'Casual Blue Kurta Set',
        brand: 'GenZe Kids',
        category: 'baby-kids',
        price: 899,
        mrp: 1499,
        image: 'IMG DATA/Kids IMG/K 02.jpg',
        images: ['IMG DATA/Kids IMG/K 02.jpg', 'IMG DATA/Kids IMG/K 02.1.jpg'],
        rating: 4.6,
        reviews: 92,
        tags: ['casual', 'trending'],
        color: '#E0F2F1',
        description: 'Stylish and soft cotton kurta set for everyday comfort and small gatherings.'
    },
    {
        name: 'Festive Party Dress',
        brand: 'GenZe Kids',
        category: 'baby-kids',
        price: 1599,
        mrp: 2499,
        image: 'IMG DATA/Kids IMG/K 03.jpg',
        images: ['IMG DATA/Kids IMG/K 03.jpg', 'IMG DATA/Kids IMG/K 03.1.jpg', 'IMG DATA/Kids IMG/K 03.2.jpg'],
        rating: 4.8,
        reviews: 110,
        tags: ['party', 'elegant'],
        color: '#FFF9C4',
        description: 'Elegant party dress featuring premium fabric and comfortable fit for kids.'
    },
    {
        name: 'Toddler Cotton Playwear',
        brand: 'PlayTime',
        category: 'baby-kids',
        price: 499,
        mrp: 999,
        image: 'IMG DATA/Kids IMG/K 04.jpg',
        images: ['IMG DATA/Kids IMG/K 04.jpg', 'IMG DATA/Kids IMG/K 04.1.jpg', 'IMG DATA/Kids IMG/K 04.2.jpg', 'IMG DATA/Kids IMG/K 04.3.jpg'],
        rating: 4.5,
        reviews: 240,
        tags: ['daily', 'soft'],
        color: '#E8F5E9',
        description: 'Breathable and soft cotton playwear set for toddlers, ideal for all-day play.'
    },
    {
        name: 'Traditional Sherwani Set',
        brand: 'GenZe Kids',
        category: 'baby-kids',
        price: 1899,
        mrp: 3499,
        image: 'IMG DATA/Kids IMG/K 05.jpg',
        images: ['IMG DATA/Kids IMG/K 05.jpg', 'IMG DATA/Kids IMG/K 05.1.jpg', 'IMG DATA/Kids IMG/K 05.2.jpg'],
        rating: 4.9,
        reviews: 74,
        tags: ['royal', 'premium'],
        color: '#F3E5F5',
        description: 'Exquisite traditional sherwani set for a royal touch to festive celebrations.'
    },
    // Toys & Games
    {
        name: 'Interactive Learning Spinner',
        brand: 'SmartPlay',
        category: 'toys',
        price: 349,
        mrp: 699,
        image: 'IMG DATA/Kids Toy IMG/T 01.jpg',
        images: ['IMG DATA/Kids Toy IMG/T 01.jpg', 'IMG DATA/Kids Toy IMG/T 01.1.jpg', 'IMG DATA/Kids Toy IMG/T 01.2.jpg', 'IMG DATA/Kids Toy IMG/T 01.3.jpg'],
        rating: 4.7,
        reviews: 312,
        tags: ['learning', 'interactive'],
        color: '#FFECB3',
        description: 'Engaging spinner toy designed to improve sensory development and motor skills.'
    },
    {
        name: 'Musical Rattle Toy Set',
        brand: 'Melody',
        category: 'toys',
        price: 599,
        mrp: 1299,
        image: 'IMG DATA/Kids Toy IMG/T 02.jpg',
        images: ['IMG DATA/Kids Toy IMG/T 02.jpg', 'IMG DATA/Kids Toy IMG/T 02.1.jpg', 'IMG DATA/Kids Toy IMG/T 02.2.jpg'],
        rating: 4.6,
        reviews: 185,
        tags: ['music', 'baby'],
        color: '#D1C4E9',
        description: 'Colorful musical rattle set that introduces infants to delightful sounds.'
    },
    {
        name: 'Educational Puzzle Blocks',
        brand: 'Brainy',
        category: 'toys',
        price: 799,
        mrp: 1599,
        image: 'IMG DATA/Kids Toy IMG/T 03.jpg',
        images: ['IMG DATA/Kids Toy IMG/T 03.jpg', 'IMG DATA/Kids Toy IMG/T 03.1.jpg', 'IMG DATA/Kids Toy IMG/T 03.2.jpg'],
        rating: 4.8,
        reviews: 215,
        tags: ['puzzle', 'smart'],
        color: '#C8E6C9',
        description: 'Cognitive development puzzle blocks that encourage problem-solving and focus.'
    },
    {
        name: 'Creative Building Blocks',
        brand: 'BuildIt',
        category: 'toys',
        price: 1199,
        mrp: 2499,
        image: 'IMG DATA/Kids Toy IMG/T 04.jpg',
        images: ['IMG DATA/Kids Toy IMG/T 04.jpg', 'IMG DATA/Kids Toy IMG/T 04.1.jpg', 'IMG DATA/Kids Toy IMG/T 04.2.jpg', 'IMG DATA/Kids Toy IMG/T 04.3.jpg', 'IMG DATA/Kids Toy IMG/T 04.4.jpg', 'IMG DATA/Kids Toy IMG/T 04.5.jpg'],
        rating: 4.9,
        reviews: 420,
        tags: ['creative', 'bestseller'],
        color: '#B3E5FC',
        description: 'Premium building blocks set for endless hours of creative play and construction.'
    },
    // Women Fashion
    {
        name: 'Elegant Designer Kurti',
        brand: 'Kidvana Women',
        category: 'fashion',
        price: 1399,
        mrp: 2999,
        image: 'IMG DATA/Women/W 01.jpg',
        images: ['IMG DATA/Women/W 01.jpg', 'IMG DATA/Women/W 01.1.jpg', 'IMG DATA/Women/W 01.2.jpg'],
        rating: 4.8,
        reviews: 128,
        tags: ['new', 'ethnic', 'elegant'],
        color: '#FCE4EC',
        description: 'Sophisticated ethnic kurti featuring modern artistry and comfortable fit.'
    }
];

async function seedProducts() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/genzeloot');
        console.log('Connected to MongoDB');

        await Product.deleteMany();
        console.log('Existing products cleared');

        await Product.insertMany(products);
        console.log('Products seeded successfully');

        process.exit();
    } catch (err) {
        console.error('Error seeding products:', err);
        process.exit(1);
    }
}

seedProducts();
